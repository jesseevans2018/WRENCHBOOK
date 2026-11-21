import { useRef, useState } from 'react';
import {
  ArrowLeft,
  Download,
  FileCheck2,
  FileText,
  Printer,
  Receipt,
} from 'lucide-react';
import type {
  DocumentType,
  PaymentMethod,
  SavedJob,
  ShopRates,
} from '../types/mechanic';
import {
  calculateEstimateTotals,
  DEFAULT_LOGO_PATH,
  formatCurrency,
} from '../utils/storage';
import {
  downloadStandalonePrintHtml,
  generateFormalPdf,
} from '../utils/pdfGenerator';
import { SignaturePad } from './SignaturePad';

interface FormalDocumentViewProps {
  job: SavedJob;
  rates: ShopRates;
  initialDocType?: DocumentType;
  onUpdateJob: (next: SavedJob) => void;
  onBackToEditor: () => void;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  'Unpaid',
  'Cash',
  'Credit / Debit Card',
  'Zelle / Venmo',
  'Check',
  'Fleet Account',
];

export function FormalDocumentView({
  job,
  rates,
  initialDocType = 'estimate',
  onUpdateJob,
  onBackToEditor,
}: FormalDocumentViewProps) {
  const [docType, setDocType] = useState<DocumentType>(initialDocType);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [printHint, setPrintHint] = useState<string | null>(null);
  const printSheetRef = useRef<HTMLDivElement | null>(null);

  const logoUrl = rates.logoDataUrl || DEFAULT_LOGO_PATH;
  const totals = calculateEstimateTotals(
    job.lineItems,
    job.includeCalloutFee,
    job.calloutFee,
    job.shopSuppliesPercent,
    job.taxRatePercent,
    job.diagnosticCredit,
    job.amountPaid
  );

  const baseDocId = job.documentNumber.replace(/^(EST|WO|INV|WB)-/, '');
  const formattedDocNumber =
    docType === 'authorization'
      ? `WO-${baseDocId}`
      : docType === 'invoice'
      ? `INV-${baseDocId}`
      : `EST-${baseDocId}`;

  const docHeading =
    docType === 'authorization'
      ? 'REPAIR WORK ORDER & AUTHORIZATION AGREEMENT'
      : docType === 'invoice'
      ? 'FINAL SERVICE INVOICE'
      : 'FORMAL REPAIR ESTIMATE';

  const handleBrowserPrint = () => {
    const inIframe = (() => {
      try {
        return window.self !== window.top;
      } catch {
        return true;
      }
    })();

    try {
      window.print();
    } catch {
      // ignore
    }

    if (inIframe) {
      setPrintHint(
        'If your browser preview blocks the system print dialog inside this embedded frame, use "Download PDF" or "Download Printable Page" to print immediately.'
      );
    }
  };

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    setPrintHint(null);
    try {
      await generateFormalPdf(job, rates, docType);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadPrintableHtml = () => {
    if (!printSheetRef.current) return;
    downloadStandalonePrintHtml(
      printSheetRef.current.innerHTML,
      `${formattedDocNumber}_${docType}`
    );
  };

  const inputClass =
    'w-full h-10 px-3 bg-[#1c1f26] border border-[#2c313d] rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-600/20';

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="no-print flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#14161b] border border-[#262a34] rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onBackToEditor}
            className="h-10 px-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 bg-[#1c1f26] hover:bg-[#252932] border border-[#2c313d] rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Edit Line Items
          </button>

          <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#0b0c0f] border border-[#262a34] rounded-lg">
            <button
              type="button"
              onClick={() => setDocType('estimate')}
              className={`px-3 py-1.5 inline-flex items-center gap-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                docType === 'estimate'
                  ? 'bg-red-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Formal Estimate
            </button>
            <button
              type="button"
              onClick={() => setDocType('authorization')}
              className={`px-3 py-1.5 inline-flex items-center gap-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                docType === 'authorization'
                  ? 'bg-red-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              Authorization Agreement
            </button>
            <button
              type="button"
              onClick={() => setDocType('invoice')}
              className={`px-3 py-1.5 inline-flex items-center gap-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                docType === 'invoice'
                  ? 'bg-red-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              Final Invoice
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="h-10 px-4 inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <Download className="w-4 h-4" />
            {isExportingPdf ? 'Generating PDF...' : 'Download PDF'}
          </button>

          <button
            type="button"
            onClick={handleBrowserPrint}
            className="h-10 px-3.5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-100 bg-[#1c1f26] hover:bg-[#252932] border border-[#2c313d] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Now
          </button>

          <button
            type="button"
            onClick={handleDownloadPrintableHtml}
            className="h-10 px-3.5 inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 bg-[#1c1f26] hover:bg-[#252932] border border-[#2c313d] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            Printable File (.html)
          </button>
        </div>
      </div>

      {printHint && (
        <div className="no-print bg-[#1c1f26] border border-amber-500/40 rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-200">
          <span>{printHint}</span>
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="px-3 py-1.5 font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md whitespace-nowrap cursor-pointer"
          >
            Download PDF to Print
          </button>
        </div>
      )}

      {/* Document-Specific Interactive Controls */}
      {docType === 'authorization' && (
        <section className="no-print bg-[#14161b] border border-[#262a34] rounded-xl p-5 space-y-4">
          <h2 className="font-display text-sm font-semibold text-white">
            Authorization & Digital Signature Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Authorized By (Customer Printed Name)
              </label>
              <input
                type="text"
                placeholder={job.customerName || 'Customer full name'}
                value={job.authorizedByName}
                onChange={(e) =>
                  onUpdateJob({
                    ...job,
                    authorizedByName: e.target.value,
                    authorizedAt:
                      job.authorizedAt || new Date().toISOString(),
                  })
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Odometer / Mileage In
              </label>
              <input
                type="text"
                placeholder="e.g., 84,210 mi"
                value={job.odometer}
                onChange={(e) =>
                  onUpdateJob({ ...job, odometer: e.target.value })
                }
                className={`${inputClass} font-mono`}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Re-Authorization Limit ($)
              </label>
              <input
                type="number"
                min="0"
                step="25"
                value={job.reAuthThreshold}
                onChange={(e) =>
                  onUpdateJob({
                    ...job,
                    reAuthThreshold: Math.max(0, Number(e.target.value)),
                  })
                }
                className={`${inputClass} font-mono tabular-nums`}
              />
            </div>
          </div>

          <SignaturePad
            value={job.signatureDataUrl}
            onChange={(sig) =>
              onUpdateJob({
                ...job,
                signatureDataUrl: sig,
                authorizedAt: sig ? new Date().toISOString() : job.authorizedAt,
              })
            }
          />
        </section>
      )}

      {docType === 'invoice' && (
        <section className="no-print bg-[#14161b] border border-[#262a34] rounded-xl p-5 space-y-4">
          <h2 className="font-display text-sm font-semibold text-white">
            Invoice Payment & Credits
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Payment Method
              </label>
              <select
                value={job.paymentMethod}
                onChange={(e) =>
                  onUpdateJob({
                    ...job,
                    paymentMethod: e.target.value as PaymentMethod,
                  })
                }
                className={inputClass}
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Diagnostic / Deposit Credit ($)
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={job.diagnosticCredit}
                onChange={(e) =>
                  onUpdateJob({
                    ...job,
                    diagnosticCredit: Math.max(0, Number(e.target.value)),
                  })
                }
                className={`${inputClass} font-mono tabular-nums`}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Amount Paid ($)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={job.amountPaid}
                  onChange={(e) =>
                    onUpdateJob({
                      ...job,
                      amountPaid: Math.max(0, Number(e.target.value)),
                    })
                  }
                  className={`${inputClass} font-mono tabular-nums`}
                />
                <button
                  type="button"
                  onClick={() =>
                    onUpdateJob({
                      ...job,
                      amountPaid: Number(totals.grandTotal.toFixed(2)),
                      status: 'Completed',
                      paymentMethod:
                        job.paymentMethod === 'Unpaid'
                          ? 'Credit / Debit Card'
                          : job.paymentMethod,
                    })
                  }
                  className="px-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Paid Full
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Odometer Out
              </label>
              <input
                type="text"
                placeholder="e.g., 84,215 mi"
                value={job.odometer}
                onChange={(e) =>
                  onUpdateJob({ ...job, odometer: e.target.value })
                }
                className={`${inputClass} font-mono`}
              />
            </div>
          </div>
        </section>
      )}

      {/* Formal Printable Paper Preview */}
      <div
        ref={printSheetRef}
        className="print-sheet bg-white text-slate-900 rounded-xl border border-[#262a34] overflow-hidden max-w-[850px] mx-auto shadow-lg"
      >
        {/* Obsidian & Crimson Branded Masthead */}
        <div
          style={{
            backgroundColor: '#0b0c0f',
            borderBottom: '4px solid #dc2626',
            color: '#ffffff',
            padding: '22px 28px',
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <img
                src={logoUrl}
                alt={`${rates.businessName} Logo`}
                referrerPolicy="no-referrer"
                className="w-20 h-20 object-contain rounded-lg bg-black shrink-0"
              />
              <div className="min-w-0">
                <h2 className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-white uppercase leading-snug">
                  {rates.businessName}
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  {rates.mechanicPhone} · {rates.businessEmail}
                </p>
                {rates.businessAddress && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {rates.businessAddress}
                  </p>
                )}
              </div>
            </div>

            <div className="md:text-right shrink-0 md:max-w-[260px]">
              <p className="font-display text-sm font-bold tracking-wide text-red-400 uppercase leading-snug">
                {docHeading}
              </p>
              <p className="font-mono text-xs text-slate-200 mt-1.5 tabular-nums">
                Document #: {formattedDocNumber}
              </p>
              <p className="font-mono text-xs text-slate-300 mt-0.5 tabular-nums">
                Date: {new Date().toLocaleDateString('en-US')}
              </p>
              {docType === 'estimate' && (
                <p className="text-xs text-slate-400 mt-0.5">
                  Valid For: 15 Days
                </p>
              )}
              {docType === 'invoice' && (
                <p className="font-mono text-xs text-slate-200 mt-0.5 tabular-nums">
                  Method: {job.paymentMethod}
                </p>
              )}
              {docType === 'authorization' && (
                <p className="font-mono text-xs text-red-300 mt-0.5 tabular-nums">
                  50% Deposit Due: {formatCurrency(totals.grandTotal * 0.5)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Document Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Customer & Vehicle Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-slate-200 bg-slate-50 rounded-lg p-4 space-y-1">
              <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                Customer Information
              </p>
              <p className="font-display text-sm font-bold text-slate-900">
                {job.customerName || 'Walk-in / Customer'}
              </p>
              <p className="text-xs text-slate-700">
                Phone: {job.customerPhone || 'N/A'}
              </p>
              <p className="text-xs text-slate-700">
                Service Location: {job.serviceAddress || 'Mobile On-Site'}
              </p>
            </div>

            <div className="border border-slate-200 bg-slate-50 rounded-lg p-4 space-y-1">
              <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                Vehicle Identification
              </p>
              <p className="font-display text-sm font-bold text-slate-900">
                {job.vehicle.year} {job.vehicle.make} {job.vehicle.model}
              </p>
              <p className="text-xs text-slate-700">
                Engine: {job.vehicle.engine} ({job.vehicle.drivetrain},{' '}
                {job.vehicle.transmission})
              </p>
              <p className="text-xs text-slate-700 font-mono">
                VIN/Plate: {job.vinOrPlate || 'N/A'} · Odometer:{' '}
                {job.odometer || 'N/A'}
              </p>
            </div>
          </div>

          {/* Itemized Repairs Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#181a20] text-white">
                <tr>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider">
                    Repair / Service Description
                  </th>
                  <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider">
                    Hrs
                  </th>
                  <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider">
                    Parts
                  </th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider">
                    Line Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {job.lineItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-xs text-slate-500"
                    >
                      No repair line items added yet.
                    </td>
                  </tr>
                ) : (
                  job.lineItems.map((item) => {
                    const adjHrs = item.laborHours * item.multiplier;
                    const lineTotal = adjHrs * item.hourlyRate + item.partsCost;
                    return (
                      <tr key={item.id}>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">
                            {item.repairTitle}
                          </div>
                          <div className="text-xs text-slate-500">
                            {item.systemCategory}
                            {item.multiplier !== 1 &&
                              ` · ${item.multiplier}x field/rust factor`}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-xs text-slate-700 tabular-nums">
                          {adjHrs.toFixed(1)}
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-xs text-slate-700 tabular-nums">
                          {formatCurrency(item.hourlyRate)}
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-xs text-slate-700 tabular-nums">
                          {formatCurrency(item.partsCost)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900 tabular-nums">
                          {formatCurrency(lineTotal)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Notes + Financial Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            <div className="text-xs text-slate-600 space-y-2">
              {job.notes.trim() && (
                <div>
                  <p className="font-semibold text-slate-800 uppercase tracking-wide text-[11px] mb-1">
                    Technician Notes
                  </p>
                  <p className="leading-relaxed whitespace-pre-line">
                    {job.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="border border-slate-200 rounded-lg p-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Labor Subtotal</span>
                <span className="font-mono text-slate-900 tabular-nums">
                  {formatCurrency(totals.laborSubtotal)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Parts Subtotal</span>
                <span className="font-mono text-slate-900 tabular-nums">
                  {formatCurrency(totals.partsSubtotal)}
                </span>
              </div>
              {job.includeCalloutFee && (
                <div className="flex justify-between text-slate-600">
                  <span>Mobile Callout / Dispatch Fee</span>
                  <span className="font-mono text-slate-900 tabular-nums">
                    {formatCurrency(totals.calloutTotal)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Shop Supplies ({job.shopSuppliesPercent}%)</span>
                <span className="font-mono text-slate-900 tabular-nums">
                  {formatCurrency(totals.shopSupplies)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Sales Tax ({job.taxRatePercent}%)</span>
                <span className="font-mono text-slate-900 tabular-nums">
                  {formatCurrency(totals.taxTotal)}
                </span>
              </div>
              {totals.diagnosticCredit > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Diagnostic / Deposit Credit</span>
                  <span className="font-mono tabular-nums">
                    -{formatCurrency(totals.diagnosticCredit)}
                  </span>
                </div>
              )}

              <div className="border-t border-slate-300 pt-2 mt-2 flex justify-between items-baseline text-sm font-bold text-slate-900">
                <span>
                  {docType === 'estimate' ? 'ESTIMATED TOTAL' : 'TOTAL CHARGES'}
                </span>
                <span className="font-mono text-base tabular-nums">
                  {formatCurrency(totals.grandTotal)}
                </span>
              </div>

              {docType === 'authorization' && (
                <div className="bg-red-600 text-white rounded px-3 py-2 flex justify-between items-center font-bold text-xs mt-1">
                  <span>MANDATORY 50% DEPOSIT DUE ON ARRIVAL</span>
                  <span className="font-mono text-sm tabular-nums">
                    {formatCurrency(totals.grandTotal * 0.5)}
                  </span>
                </div>
              )}

              {docType === 'invoice' && (
                <>
                  <div className="flex justify-between text-slate-600 pt-1">
                    <span>Amount Paid ({job.paymentMethod})</span>
                    <span className="font-mono text-slate-900 tabular-nums">
                      -{formatCurrency(totals.amountPaid)}
                    </span>
                  </div>
                  <div className="bg-red-600 text-white rounded px-3 py-2 flex justify-between items-center font-bold text-sm mt-1">
                    <span>BALANCE DUE</span>
                    <span className="font-mono tabular-nums">
                      {formatCurrency(totals.balanceDue)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Legal Terms & Signature Blocks */}
          <div className="border-t border-slate-200 pt-5 space-y-4">
            {docType === 'authorization' && (
              <>
                <div className="text-xs text-slate-700 space-y-2 leading-relaxed">
                  <p className="font-display text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Repair Authorization & Mobile Service Agreement
                  </p>
                  <p>
                    1. <strong>Mandatory 50% Down Payment Policy:</strong> Due to
                    prior instances of non-payment for completed mobile repairs,
                    a mandatory down payment equal to <strong>50% of the total
                    estimated cost ({formatCurrency(totals.grandTotal * 0.5)})</strong>{' '}
                    is due immediately upon technician arrival before any work or
                    disassembly begins. The remaining balance is due in full upon
                    completion of service.
                  </p>
                  <p>
                    2. <strong>Scope Authorization:</strong> I authorize{' '}
                    {rates.businessName} to perform the repairs itemized above
                    and supply required parts/fluids, and grant permission to
                    operate or road-test the vehicle for diagnosis and repair
                    verification.
                  </p>
                  <p>
                    3. <strong>Re-Authorization Limit:</strong> Additional work
                    or unforeseen damage exceeding the estimated total by more
                    than{' '}
                    <span className="font-mono font-semibold">
                      {formatCurrency(job.reAuthThreshold)}
                    </span>{' '}
                    will not be performed without my prior approval.
                  </p>
                  <p>
                    4. <strong>Callout & Diagnostic Policy:</strong> If
                    repairs are declined following inspection, the mobile
                    callout fee and diagnostic fee remain payable upon
                    completion of inspection.
                  </p>
                  <p>
                    5. <strong>Warranty:</strong> {rates.warrantyTerms}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                  <div>
                    <div className="h-16 flex items-end pb-1 border-b border-slate-400">
                      {job.signatureDataUrl && (
                        <img
                          src={job.signatureDataUrl}
                          alt="Customer signature"
                          className="max-h-14 object-contain"
                        />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1.5">
                      Customer Signature
                      {job.authorizedByName
                        ? ` — ${job.authorizedByName}`
                        : ''}
                    </p>
                  </div>

                  <div>
                    <div className="h-16 flex items-end pb-1 border-b border-slate-400 font-mono text-xs text-slate-800">
                      {job.authorizedAt
                        ? new Date(job.authorizedAt).toLocaleString('en-US')
                        : ''}
                    </div>
                    <p className="text-xs text-slate-600 mt-1.5">
                      Date & Time Signed
                    </p>
                  </div>
                </div>
              </>
            )}

            {docType === 'estimate' && (
              <div className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
                <p className="font-display font-bold text-slate-900 uppercase tracking-wide text-[11px]">
                  Estimate Terms & Conditions
                </p>
                <p>
                  This formal estimate is valid for 15 days from the issue date
                  and reflects current parts pricing and flat-rate book labor
                  standards. If rusted, seized, or hidden damaged components
                  require additional labor or parts upon teardown, customer
                  approval will be obtained before proceeding.{' '}
                  {rates.warrantyTerms}
                </p>
              </div>
            )}

            {docType === 'invoice' && (
              <div className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
                <p className="font-display font-bold text-slate-900 uppercase tracking-wide text-[11px]">
                  Warranty & Service Receipt
                </p>
                <p>
                  {rates.warrantyTerms} Thank you for trusting{' '}
                  <strong>{rates.businessName}</strong> — We Come To You. You
                  Rely On Us.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
