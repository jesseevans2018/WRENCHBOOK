import { jsPDF } from 'jspdf';
import type { DocumentType, SavedJob, ShopRates } from '../types/mechanic';
import {
  calculateEstimateTotals,
  DEFAULT_LOGO_PATH,
  formatCurrency,
} from './storage';

async function loadImageAsPngDataUrl(src: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 400;
        canvas.height = img.naturalHeight || 400;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function getDocTitle(docType: DocumentType): string {
  if (docType === 'authorization') return 'REPAIR WORK ORDER & AUTHORIZATION';
  if (docType === 'invoice') return 'FINAL SERVICE INVOICE';
  return 'FORMAL REPAIR ESTIMATE';
}

function getDocNumber(job: SavedJob, docType: DocumentType): string {
  const base = job.documentNumber.replace(/^(EST|WO|INV|WB)-/, '');
  if (docType === 'authorization') return `WO-${base}`;
  if (docType === 'invoice') return `INV-${base}`;
  return `EST-${base}`;
}

export async function generateFormalPdf(
  job: SavedJob,
  rates: ShopRates,
  docType: DocumentType
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter',
  });

  const pageW = doc.internal.pageSize.getWidth(); // 612pt
  const margin = 40;
  const contentW = pageW - margin * 2;
  let y = 36;

  const totals = calculateEstimateTotals(
    job.lineItems,
    job.includeCalloutFee,
    job.calloutFee,
    job.shopSuppliesPercent,
    job.taxRatePercent,
    job.diagnosticCredit,
    job.amountPaid
  );

  // Calculate wrapped masthead lines first so company name and document title never overlap
  const logoSrc = rates.logoDataUrl || DEFAULT_LOGO_PATH;
  const logoDataUrl = await loadImageAsPngDataUrl(logoSrc);
  const textX = logoDataUrl ? margin + 88 : margin;
  const leftColW = 225;
  const rightColW = 205;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13.5);
  const companyLines: string[] = doc.splitTextToSize(
    rates.businessName.toUpperCase(),
    leftColW
  );

  const docTitle = getDocTitle(docType);
  const docNum = getDocNumber(job, docType);
  doc.setFontSize(10.5);
  const titleLines: string[] = doc.splitTextToSize(docTitle, rightColW);

  const leftBlockHeight = 24 + companyLines.length * 16 + 32;
  const rightBlockHeight = 24 + titleLines.length * 14 + 48;
  const mastheadH = Math.max(114, leftBlockHeight, rightBlockHeight);

  // Dark Obsidian Masthead Banner matching logo
  doc.setFillColor(12, 13, 17);
  doc.rect(0, 0, pageW, mastheadH, 'F');
  doc.setFillColor(220, 38, 38); // Crimson red bottom accent line
  doc.rect(0, mastheadH - 3, pageW, 3, 'F');

  if (logoDataUrl) {
    try {
      const logoY = Math.max(14, Math.round((mastheadH - 3 - 76) / 2));
      doc.addImage(logoDataUrl, 'PNG', margin, logoY, 76, 76);
    } catch {
      // skip if image decode fails
    }
  }

  // Left Column: Company Name & Contact
  let ly = 30;
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13.5);
  doc.text(companyLines, textX, ly);
  ly += companyLines.length * 16 + 2;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text(`${rates.mechanicPhone}  ·  ${rates.businessEmail}`, textX, ly);
  ly += 14;
  if (rates.businessAddress) {
    const addrLines: string[] = doc.splitTextToSize(
      rates.businessAddress,
      leftColW
    );
    doc.text(addrLines, textX, ly);
  }

  // Right Column: Document Type & Metadata (strictly bounded, never overlaps left)
  let ry = 30;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(248, 113, 113);
  doc.text(titleLines, pageW - margin, ry, { align: 'right' });
  ry += titleLines.length * 14 + 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(226, 232, 240);
  doc.text(`Document #: ${docNum}`, pageW - margin, ry, { align: 'right' });
  ry += 14;
  doc.text(
    `Date: ${new Date().toLocaleDateString('en-US')}`,
    pageW - margin,
    ry,
    { align: 'right' }
  );
  ry += 14;
  if (docType === 'estimate') {
    doc.text('Valid For: 15 Days', pageW - margin, ry, { align: 'right' });
  } else if (docType === 'invoice') {
    doc.text(
      `Payment: ${job.paymentMethod}  |  Balance: ${formatCurrency(totals.balanceDue)}`,
      pageW - margin,
      ry,
      { align: 'right' }
    );
  } else {
    doc.text(
      `50% Deposit Due Upon Arrival: ${formatCurrency(totals.grandTotal * 0.5)}`,
      pageW - margin,
      ry,
      { align: 'right' }
    );
  }

  y = mastheadH + 18;

  // Customer & Vehicle Grid Boxes
  const boxGap = 14;
  const halfW = (contentW - boxGap) / 2;

  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, halfW, 82, 4, 4, 'FD');
  doc.roundedRect(margin + halfW + boxGap, y, halfW, 82, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('CUSTOMER INFORMATION', margin + 10, y + 16);
  doc.text('VEHICLE INFORMATION', margin + halfW + boxGap + 10, y + 16);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(job.customerName || 'Walk-in / Customer', margin + 10, y + 34);
  doc.text(
    `${job.vehicle.year} ${job.vehicle.make} ${job.vehicle.model}`,
    margin + halfW + boxGap + 10,
    y + 34
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(
    `Phone: ${job.customerPhone || 'N/A'}`,
    margin + 10,
    y + 50
  );
  doc.text(
    `Location: ${(job.serviceAddress || 'On-Site Mobile Service').slice(0, 42)}`,
    margin + 10,
    y + 65
  );

  doc.text(
    `Engine: ${job.vehicle.engine} (${job.vehicle.drivetrain}, ${job.vehicle.transmission})`,
    margin + halfW + boxGap + 10,
    y + 50
  );
  doc.text(
    `VIN/Plate: ${job.vinOrPlate || 'N/A'}   ·   Odometer: ${job.odometer || 'N/A'}`,
    margin + halfW + boxGap + 10,
    y + 65
  );

  y += 100;

  // Line Items Table Header
  doc.setFillColor(24, 26, 32);
  doc.rect(margin, y, contentW, 24, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('REPAIR / SERVICE DESCRIPTION', margin + 10, y + 15);
  doc.text('HRS', margin + 305, y + 15, { align: 'right' });
  doc.text('RATE', margin + 365, y + 15, { align: 'right' });
  doc.text('PARTS', margin + 435, y + 15, { align: 'right' });
  doc.text('TOTAL', pageW - margin - 10, y + 15, { align: 'right' });

  y += 24;

  // Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  if (job.lineItems.length === 0) {
    doc.setTextColor(100, 116, 139);
    doc.text('No repair line items added.', margin + 10, y + 18);
    y += 28;
  } else {
    for (let i = 0; i < job.lineItems.length; i++) {
      const item = job.lineItems[i];
      if (y > 620) {
        doc.addPage();
        y = 40;
      }

      const adjHrs = item.laborHours * item.multiplier;
      const laborTotal = adjHrs * item.hourlyRate;
      const rowTotal = laborTotal + item.partsCost;

      if (i % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y, contentW, 26, 'F');
      }

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text(item.repairTitle.slice(0, 48), margin + 10, y + 16);

      doc.setFont('helvetica', 'normal');
      doc.text(adjHrs.toFixed(1), margin + 305, y + 16, { align: 'right' });
      doc.text(formatCurrency(item.hourlyRate), margin + 365, y + 16, {
        align: 'right',
      });
      doc.text(formatCurrency(item.partsCost), margin + 435, y + 16, {
        align: 'right',
      });
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(rowTotal), pageW - margin - 10, y + 16, {
        align: 'right',
      });

      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y + 26, pageW - margin, y + 26);
      y += 26;
    }
  }

  y += 14;

  // Notes & Summary Row
  const summaryW = 225;
  const notesW = contentW - summaryW - 20;

  if (job.notes.trim()) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('TECHNICIAN / SERVICE NOTES', margin, y + 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    const splitNotes = doc.splitTextToSize(job.notes.trim(), notesW);
    doc.text(splitNotes, margin, y + 24);
  }

  // Right-side Totals Box
  const sumX = pageW - margin - summaryW;
  let sy = y;
  const addSummaryRow = (label: string, value: string, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(bold ? 10.5 : 9);
    doc.setTextColor(bold ? 15 : 71, bold ? 23 : 85, bold ? 42 : 105);
    doc.text(label, sumX, sy + 10);
    doc.text(value, pageW - margin, sy + 10, { align: 'right' });
    sy += bold ? 18 : 15;
  };

  addSummaryRow('Labor Subtotal', formatCurrency(totals.laborSubtotal));
  addSummaryRow('Parts Subtotal', formatCurrency(totals.partsSubtotal));
  if (job.includeCalloutFee) {
    addSummaryRow('Mobile Callout Fee', formatCurrency(totals.calloutTotal));
  }
  addSummaryRow(
    `Shop Supplies (${job.shopSuppliesPercent}%)`,
    formatCurrency(totals.shopSupplies)
  );
  addSummaryRow(
    `Sales Tax (${job.taxRatePercent}%)`,
    formatCurrency(totals.taxTotal)
  );
  if (totals.diagnosticCredit > 0) {
    addSummaryRow(
      'Diagnostic / Deposit Credit',
      `-${formatCurrency(totals.diagnosticCredit)}`
    );
  }

  doc.setDrawColor(15, 23, 42);
  doc.line(sumX, sy + 2, pageW - margin, sy + 2);
  sy += 10;

  addSummaryRow(
    docType === 'estimate' ? 'ESTIMATED TOTAL' : 'TOTAL CHARGES',
    formatCurrency(totals.grandTotal),
    true
  );

  if (docType === 'authorization') {
    const requiredDeposit = totals.grandTotal * 0.5;
    doc.setFillColor(220, 38, 38);
    doc.rect(sumX - 6, sy, summaryW + 6, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('50% DEPOSIT DUE ON ARRIVAL', sumX, sy + 14.5);
    doc.text(formatCurrency(requiredDeposit), pageW - margin - 4, sy + 14.5, {
      align: 'right',
    });
    sy += 28;
  } else if (docType === 'invoice') {
    addSummaryRow('Amount Paid', `-${formatCurrency(totals.amountPaid)}`);
    doc.setFillColor(220, 38, 38);
    doc.rect(sumX - 6, sy, summaryW + 6, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text('BALANCE DUE', sumX, sy + 15);
    doc.text(formatCurrency(totals.balanceDue), pageW - margin - 4, sy + 15, {
      align: 'right',
    });
    sy += 28;
  }

  y = Math.max(y + 85, sy + 18);

  const footerPageBreakY = docType === 'authorization' ? 515 : 620;
  if (y > footerPageBreakY) {
    doc.addPage();
    y = 40;
  }

  // Document-specific Footer / Authorization / Warranty Terms
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, pageW - margin, y);
  y += 14;

  if (docType === 'authorization') {
    const requiredDeposit = totals.grandTotal * 0.5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('REPAIR AUTHORIZATION & SERVICE AGREEMENT', margin, y);
    y += 14;

    const terms = [
      `1. Mandatory 50% Down Payment Policy: Due to prior instances of non-payment for completed mobile repairs, a mandatory down payment equal to 50% of the total estimated cost (${formatCurrency(requiredDeposit)}) is due immediately upon technician arrival before any work or disassembly begins. The remaining balance is due in full upon completion of service.`,
      `2. Scope Authorization: I hereby authorize ${rates.businessName} to perform the repairs listed above on my vehicle, including the use of necessary parts and materials, and grant permission to operate or road-test the vehicle on-site or nearby roadways for diagnosis and verification.`,
      `3. Re-Authorization Limit: Additional repairs or hidden damage exceeding the estimated total by more than ${formatCurrency(job.reAuthThreshold)} will not be performed without my prior verbal, text, or written approval.`,
      `4. Mobile Service & Diagnostic Fee: I acknowledge that if repairs are declined after inspection, the mobile callout fee and diagnostic fee remain due upon completion of inspection.`,
      `5. Warranty: ${rates.warrantyTerms}`,
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(51, 65, 85);
    for (const clause of terms) {
      const lines = doc.splitTextToSize(clause, contentW);
      doc.text(lines, margin, y);
      y += lines.length * 10.5 + 4;
    }

    y += 10;
    // Signature Block
    if (job.signatureDataUrl) {
      try {
        doc.addImage(job.signatureDataUrl, 'PNG', margin, y - 4, 180, 46);
      } catch {
        // fallback to line
      }
    }
    doc.setDrawColor(100, 116, 139);
    doc.line(margin, y + 46, margin + 250, y + 46);
    doc.line(margin + 280, y + 46, pageW - margin, y + 46);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(
      `Customer Signature${job.authorizedByName ? ` (${job.authorizedByName})` : ''}`,
      margin,
      y + 58
    );
    doc.text(
      `Date Signed${job.authorizedAt ? `: ${new Date(job.authorizedAt).toLocaleDateString()}` : ''}`,
      margin + 280,
      y + 58
    );
  } else if (docType === 'invoice') {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('WARRANTY & PAYMENT RECEIPT', margin, y);
    y += 13;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const wLines = doc.splitTextToSize(
      `${rates.warrantyTerms} Thank you for choosing ${rates.businessName} — We Come To You. You Rely On Us.`,
      contentW
    );
    doc.text(wLines, margin, y);
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('ESTIMATE TERMS & CONDITIONS', margin, y);
    y += 13;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const eLines = doc.splitTextToSize(
      `This formal estimate is valid for 15 days from the issue date and reflects current parts availability and standard book labor rates. If hidden damage or seized components are encountered during disassembly, customer approval will be requested prior to additional work. ${rates.warrantyTerms}`,
      contentW
    );
    doc.text(eLines, margin, y);
  }

  const fileSafeCustomer = (job.customerName || 'Customer')
    .replace(/[^a-z0-9]+/gi, '_')
    .replace(/^_|_$/g, '');
  doc.save(`${docNum}_${fileSafeCustomer}.pdf`);
}

export function downloadStandalonePrintHtml(
  elementHtml: string,
  title: string
): void {
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; background: #fff; margin: 0; padding: 28px; }
    .print-container { max-width: 820px; margin: 0 auto; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: left; font-size: 13px; }
    th { background: #181a20; color: #fff; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; }
    .text-right { text-align: right; }
    .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
    @media print {
      body { padding: 0; }
      .no-print-btn { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print-btn" style="max-width:820px;margin:0 auto 16px;text-align:right;">
    <button onclick="window.print()" style="background:#dc2626;color:#fff;border:none;padding:10px 18px;border-radius:6px;font-weight:600;cursor:pointer;">Print This Document</button>
  </div>
  <div class="print-container">${elementHtml}</div>
  <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 250); };</script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9_-]+/gi, '_')}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
