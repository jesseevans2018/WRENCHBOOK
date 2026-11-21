import { useState } from 'react';
import {
  CalendarPlus,
  FileCheck2,
  FileText,
  Plus,
  Receipt,
  Save,
  Trash2,
} from 'lucide-react';
import type {
  CustomerRecord,
  DocumentType,
  EstimateLineItem,
  JobStatus,
  SavedJob,
  ShopRates,
} from '../types/mechanic';
import { calculateEstimateTotals, formatCurrency } from '../utils/storage';
import { FormalDocumentView } from './FormalDocumentView';
import { SavedJobsView } from './SavedJobsView';

interface EstimateBuilderProps {
  job: SavedJob;
  rates: ShopRates;
  customers: CustomerRecord[];
  savedJobs: SavedJob[];
  onUpdateJob: (next: SavedJob) => void;
  onSaveJob: () => void;
  onClearJob: () => void;
  onScheduleJob: (job: SavedJob) => void;
  onLoadSavedJob: (job: SavedJob) => void;
  onUpdateSavedJobStatus: (jobId: string, status: JobStatus) => void;
  onDeleteSavedJob: (jobId: string) => void;
  saveToast: string | null;
}

const STATUS_OPTIONS: JobStatus[] = [
  'Draft',
  'Quoted',
  'In Progress',
  'Completed',
];

export function EstimateBuilder({
  job,
  rates,
  customers,
  savedJobs,
  onUpdateJob,
  onSaveJob,
  onClearJob,
  onScheduleJob,
  onLoadSavedJob,
  onUpdateSavedJobStatus,
  onDeleteSavedJob,
  saveToast,
}: EstimateBuilderProps) {
  const [previewDocType, setPreviewDocType] = useState<DocumentType | null>(
    null
  );
  const [subView, setSubView] = useState<'editor' | 'saved'>('editor');

  if (previewDocType) {
    return (
      <FormalDocumentView
        job={job}
        rates={rates}
        initialDocType={previewDocType}
        onUpdateJob={onUpdateJob}
        onBackToEditor={() => setPreviewDocType(null)}
      />
    );
  }

  if (subView === 'saved') {
    return (
      <div className="space-y-5">
        <div className="inline-flex items-center gap-1 p-1 bg-[#14161b] border border-[#262a34] rounded-lg">
          <button
            type="button"
            onClick={() => setSubView('editor')}
            className="px-3.5 py-1.5 text-xs font-medium rounded-md text-slate-300 hover:text-white cursor-pointer"
          >
            Active Estimate & Docs
          </button>
          <button
            type="button"
            onClick={() => setSubView('saved')}
            className="px-3.5 py-1.5 text-xs font-medium rounded-md bg-red-600 text-white cursor-pointer"
          >
            Saved Jobs ({savedJobs.length})
          </button>
        </div>

        <SavedJobsView
          jobs={savedJobs}
          onLoadJob={(loaded) => {
            onLoadSavedJob(loaded);
            setSubView('editor');
          }}
          onUpdateStatus={onUpdateSavedJobStatus}
          onDeleteJob={onDeleteSavedJob}
        />
      </div>
    );
  }

  const totals = calculateEstimateTotals(
    job.lineItems,
    job.includeCalloutFee,
    job.calloutFee,
    job.shopSuppliesPercent,
    job.taxRatePercent,
    job.diagnosticCredit,
    job.amountPaid
  );

  const updateLineItem = (
    id: string,
    patch: Partial<EstimateLineItem>
  ) => {
    onUpdateJob({
      ...job,
      lineItems: job.lineItems.map((item) =>
        item.id === id ? { ...item, ...patch } : item
      ),
    });
  };

  const removeLineItem = (id: string) => {
    onUpdateJob({
      ...job,
      lineItems: job.lineItems.filter((item) => item.id !== id),
    });
  };

  const addCustomLineItem = () => {
    const newItem: EstimateLineItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      repairTitle: 'Custom Labor / Diagnostic Service',
      systemCategory: 'General',
      laborHours: 1.0,
      hourlyRate: rates.hourlyRate,
      multiplier: 1.0,
      partsCost: 0,
    };
    onUpdateJob({
      ...job,
      lineItems: [...job.lineItems, newItem],
    });
  };

  const handlePickSavedCustomer = (customerId: string) => {
    const cust = customers.find((c) => c.id === customerId);
    if (!cust) return;
    const firstVeh = cust.vehicles[0];
    onUpdateJob({
      ...job,
      customerId: cust.id,
      customerName: cust.name,
      customerPhone: cust.phone,
      serviceAddress: cust.address || job.serviceAddress,
      vinOrPlate: firstVeh?.vin || firstVeh?.licensePlate || job.vinOrPlate,
      odometer: firstVeh?.odometer || job.odometer,
      vehicle: firstVeh
        ? {
            year: firstVeh.year,
            make: firstVeh.make,
            model: firstVeh.model,
            engine: firstVeh.engine,
            drivetrain: firstVeh.drivetrain,
            transmission: firstVeh.transmission,
            trim: firstVeh.trim,
          }
        : job.vehicle,
    });
  };

  const inputClass =
    'w-full h-10 px-3 bg-[#1c1f26] border border-[#2c313d] rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-600/20';

  return (
    <div className="space-y-6">
      {/* Sub-navigation between Active Estimate & Saved Jobs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 p-1 bg-[#14161b] border border-[#262a34] rounded-lg">
          <button
            type="button"
            onClick={() => setSubView('editor')}
            className="px-3.5 py-1.5 text-xs font-medium rounded-md bg-red-600 text-white cursor-pointer"
          >
            Active Estimate & Docs
          </button>
          <button
            type="button"
            onClick={() => setSubView('saved')}
            className="px-3.5 py-1.5 text-xs font-medium rounded-md text-slate-300 hover:text-white cursor-pointer"
          >
            Saved Jobs ({savedJobs.length})
          </button>
        </div>

        <button
          type="button"
          onClick={() => onScheduleJob(job)}
          className="h-9 px-3.5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-100 bg-[#14161b] hover:bg-[#1c1f26] border border-[#262a34] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
        >
          <CalendarPlus className="w-4 h-4 text-red-400" />
          Schedule This Job
        </button>
      </div>

      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-bold text-white">
            Customer Estimate & Document Builder
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {job.vehicle.year} {job.vehicle.make} {job.vehicle.model} ·{' '}
            {job.vehicle.engine} ({job.vehicle.drivetrain}) ·{' '}
            <span className="font-mono text-slate-300">
              {job.documentNumber}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {saveToast && (
            <span className="text-xs font-semibold text-emerald-400 mr-1">
              {saveToast}
            </span>
          )}

          <button
            type="button"
            onClick={() => setPreviewDocType('estimate')}
            className="h-10 px-3.5 inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            Formal Estimate
          </button>

          <button
            type="button"
            onClick={() => setPreviewDocType('authorization')}
            className="h-10 px-3.5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-100 bg-[#1c1f26] hover:bg-[#252932] border border-[#2c313d] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <FileCheck2 className="w-4 h-4 text-red-400" />
            Authorization Agreement
          </button>

          <button
            type="button"
            onClick={() => setPreviewDocType('invoice')}
            className="h-10 px-3.5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-100 bg-[#1c1f26] hover:bg-[#252932] border border-[#2c313d] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <Receipt className="w-4 h-4 text-emerald-400" />
            Final Invoice
          </button>

          <button
            type="button"
            onClick={onSaveJob}
            className="h-10 px-3.5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-100 bg-[#1c1f26] hover:bg-[#252932] border border-[#2c313d] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Save Job
          </button>

          <button
            type="button"
            onClick={onClearJob}
            className="h-10 px-3 text-xs font-medium text-slate-400 hover:text-white bg-[#14161b] border border-[#262a34] hover:bg-[#1c1f26] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Customer & Vehicle Details */}
      <section className="bg-[#14161b] border border-[#262a34] rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="font-display text-sm font-semibold text-white">
            Customer & Dispatch Details
          </h2>
          {customers.length > 0 && (
            <select
              value={job.customerId || ''}
              onChange={(e) => handlePickSavedCustomer(e.target.value)}
              className="h-8 px-2.5 bg-[#1c1f26] border border-[#2c313d] rounded-lg text-xs text-slate-200 focus:outline-none focus:border-red-500 cursor-pointer"
            >
              <option value="">Load from Customer Database...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.phone ? `(${c.phone})` : ''}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Customer Name
            </label>
            <input
              type="text"
              placeholder="e.g., Marcus Vance"
              value={job.customerName}
              onChange={(e) =>
                onUpdateJob({ ...job, customerName: e.target.value })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="(913) 555-0192"
              value={job.customerPhone}
              onChange={(e) =>
                onUpdateJob({ ...job, customerPhone: e.target.value })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Service Location
            </label>
            <input
              type="text"
              placeholder="Driveway / Office lot"
              value={job.serviceAddress}
              onChange={(e) =>
                onUpdateJob({ ...job, serviceAddress: e.target.value })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              VIN or Plate
            </label>
            <input
              type="text"
              placeholder="Optional"
              value={job.vinOrPlate}
              onChange={(e) =>
                onUpdateJob({ ...job, vinOrPlate: e.target.value })
              }
              className={`${inputClass} font-mono uppercase`}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Odometer
            </label>
            <input
              type="text"
              placeholder="e.g., 84,210"
              value={job.odometer}
              onChange={(e) =>
                onUpdateJob({ ...job, odometer: e.target.value })
              }
              className={`${inputClass} font-mono`}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Job Status
            </label>
            <select
              value={job.status}
              onChange={(e) =>
                onUpdateJob({ ...job, status: e.target.value as JobStatus })
              }
              className={inputClass}
            >
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Line Items & Pricing Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 bg-[#14161b] border border-[#262a34] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#262a34] flex items-center justify-between gap-4">
            <h2 className="font-display text-sm font-semibold text-white">
              Repair Line Items ({job.lineItems.length})
            </h2>
            <button
              type="button"
              onClick={addCustomLineItem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-[#1c1f26] hover:bg-[#252932] border border-[#2c313d] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Custom Item
            </button>
          </div>

          {job.lineItems.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">
              No repair items added yet. Look up a repair in Labor & Guides and
              click &ldquo;Add to Customer Estimate&rdquo;, or add a custom item.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#1c1f26] border-b border-[#262a34]">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-300">
                      Repair Description
                    </th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-300">
                      Hrs
                    </th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-300">
                      Rate
                    </th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-300">
                      Parts ($)
                    </th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-300">
                      Line Total
                    </th>
                    <th className="px-3 py-2.5 w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262a34]">
                  {job.lineItems.map((item) => {
                    const laborTotal =
                      item.laborHours * item.hourlyRate * item.multiplier;
                    const lineTotal = laborTotal + item.partsCost;

                    return (
                      <tr key={item.id} className="hover:bg-[#1c1f26]/50">
                        <td className="px-4 py-3 min-w-[210px]">
                          <input
                            type="text"
                            value={item.repairTitle}
                            onChange={(e) =>
                              updateLineItem(item.id, {
                                repairTitle: e.target.value,
                              })
                            }
                            className="w-full text-sm font-medium text-white bg-transparent border-b border-transparent focus:border-red-500 focus:outline-none py-0.5"
                          />
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {item.systemCategory}
                            {item.multiplier !== 1 && (
                              <span> · {item.multiplier}x condition</span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={item.laborHours}
                            onChange={(e) =>
                              updateLineItem(item.id, {
                                laborHours: Math.max(0, Number(e.target.value)),
                              })
                            }
                            className="w-16 text-right font-mono text-xs text-slate-100 bg-[#1c1f26] border border-[#2c313d] rounded px-2 py-1.5 tabular-nums focus:outline-none focus:border-red-500"
                          />
                        </td>
                        <td className="px-3 py-3 text-right">
                          <input
                            type="number"
                            step="5"
                            min="0"
                            value={item.hourlyRate}
                            onChange={(e) =>
                              updateLineItem(item.id, {
                                hourlyRate: Math.max(0, Number(e.target.value)),
                              })
                            }
                            className="w-20 text-right font-mono text-xs text-slate-100 bg-[#1c1f26] border border-[#2c313d] rounded px-2 py-1.5 tabular-nums focus:outline-none focus:border-red-500"
                          />
                        </td>
                        <td className="px-3 py-3 text-right">
                          <input
                            type="number"
                            step="1"
                            min="0"
                            value={item.partsCost}
                            onChange={(e) =>
                              updateLineItem(item.id, {
                                partsCost: Math.max(0, Number(e.target.value)),
                              })
                            }
                            className="w-24 text-right font-mono text-xs text-slate-100 bg-[#1c1f26] border border-[#2c313d] rounded px-2 py-1.5 tabular-nums focus:outline-none focus:border-red-500"
                          />
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-white tabular-nums whitespace-nowrap">
                          {formatCurrency(lineTotal)}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => removeLineItem(item.id)}
                            aria-label={`Remove ${item.repairTitle}`}
                            className="p-1.5 text-slate-500 hover:text-red-400 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="p-4 border-t border-[#262a34]">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Technician / Customer Notes
            </label>
            <textarea
              rows={2}
              value={job.notes}
              onChange={(e) => onUpdateJob({ ...job, notes: e.target.value })}
              placeholder="Warranty terms, parts source, or customer authorization notes..."
              className="w-full p-2.5 bg-[#1c1f26] border border-[#2c313d] rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-600/20"
            />
          </div>
        </div>

        {/* Totals Summary */}
        <aside className="bg-[#14161b] border border-[#262a34] rounded-xl p-5 space-y-4">
          <h2 className="font-display text-sm font-semibold text-white">
            Estimate & Invoice Summary
          </h2>

          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Labor Subtotal</span>
              <span className="font-mono text-slate-100 tabular-nums">
                {formatCurrency(totals.laborSubtotal)}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Parts Subtotal</span>
              <span className="font-mono text-slate-100 tabular-nums">
                {formatCurrency(totals.partsSubtotal)}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-400 pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={job.includeCalloutFee}
                  onChange={(e) =>
                    onUpdateJob({
                      ...job,
                      includeCalloutFee: e.target.checked,
                    })
                  }
                  className="rounded border-[#2c313d] bg-[#1c1f26] text-red-600 focus:ring-red-600"
                />
                <span>Mobile Callout Fee</span>
              </label>
              <span className="font-mono text-slate-100 tabular-nums">
                {formatCurrency(totals.calloutTotal)}
              </span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Shop Supplies ({job.shopSuppliesPercent}%)</span>
              <span className="font-mono text-slate-100 tabular-nums">
                {formatCurrency(totals.shopSupplies)}
              </span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Sales Tax ({job.taxRatePercent}%)</span>
              <span className="font-mono text-slate-100 tabular-nums">
                {formatCurrency(totals.taxTotal)}
              </span>
            </div>
          </div>

          <div className="border-t border-[#262a34] pt-3 flex items-baseline justify-between">
            <span className="font-display text-base font-bold text-white">
              Total Estimate
            </span>
            <span className="font-mono text-2xl font-bold text-white tabular-nums">
              {formatCurrency(totals.grandTotal)}
            </span>
          </div>

          <div className="pt-2 border-t border-[#262a34] space-y-2">
            <button
              type="button"
              onClick={() => setPreviewDocType('estimate')}
              className="w-full h-10 px-4 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
            >
              Preview, Print or Download PDF
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
