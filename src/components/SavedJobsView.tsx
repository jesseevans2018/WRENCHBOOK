import { useState } from 'react';
import { FolderOpen, Search, Trash2 } from 'lucide-react';
import type { JobStatus, SavedJob } from '../types/mechanic';
import { calculateEstimateTotals, formatCurrency } from '../utils/storage';

interface SavedJobsViewProps {
  jobs: SavedJob[];
  onLoadJob: (job: SavedJob) => void;
  onUpdateStatus: (jobId: string, status: JobStatus) => void;
  onDeleteJob: (jobId: string) => void;
}

const FILTER_TABS: ('All' | JobStatus)[] = [
  'All',
  'Draft',
  'Quoted',
  'In Progress',
  'Completed',
];

export function SavedJobsView({
  jobs,
  onLoadJob,
  onUpdateStatus,
  onDeleteJob,
}: SavedJobsViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | JobStatus>('All');

  const filtered = jobs.filter((job) => {
    const matchesStatus =
      statusFilter === 'All' || job.status === statusFilter;
    const q = search.trim().toLowerCase();
    if (!q) return matchesStatus;
    const haystack = [
      job.documentNumber,
      job.customerName,
      job.customerPhone,
      job.serviceAddress,
      job.vehicle.year,
      job.vehicle.make,
      job.vehicle.model,
      ...job.lineItems.map((i) => i.repairTitle),
    ]
      .join(' ')
      .toLowerCase();
    return matchesStatus && haystack.includes(q);
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-bold text-white">
          Saved Customer Jobs, Agreements & Invoices
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Track formal quotes, signed repair authorizations, and paid customer invoices.
        </p>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-[#14161b] border border-[#262a34] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#0b0c0f] border border-[#262a34] rounded-lg">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === tab
                  ? 'bg-red-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer, vehicle, doc #..."
            className="w-full h-10 pl-9 pr-3 bg-[#1c1f26] border border-[#2c313d] rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-600/20"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-[#14161b] border border-[#262a34] rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <p className="font-display text-sm font-semibold text-white">
              {jobs.length === 0
                ? 'No saved jobs yet'
                : 'No jobs match your filter'}
            </p>
            <p className="text-xs text-slate-400">
              {jobs.length === 0
                ? 'Build an estimate from any repair guide and click Save Job to store it here.'
                : 'Try clearing the search query or switching status tabs.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#1c1f26] border-b border-[#262a34]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300">
                    Vehicle
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300">
                    Repairs
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-300">
                    Total
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262a34]">
                {filtered.map((job) => {
                  const totals = calculateEstimateTotals(
                    job.lineItems,
                    job.includeCalloutFee,
                    job.calloutFee,
                    job.shopSuppliesPercent,
                    job.taxRatePercent,
                    job.diagnosticCredit,
                    job.amountPaid
                  );
                  return (
                    <tr key={job.id} className="hover:bg-[#1c1f26]/60">
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">
                          {job.customerName || 'Walk-in / Unassigned'}
                        </div>
                        <div className="text-xs text-slate-400">
                          {job.customerPhone || job.serviceAddress || 'No contact'}
                          {job.signatureDataUrl && ' · Signed'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-100">
                          {job.vehicle.year} {job.vehicle.make}{' '}
                          {job.vehicle.model}
                        </div>
                        <div className="text-xs text-slate-400">
                          {job.vehicle.engine} · {job.vehicle.drivetrain}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-300 max-w-xs truncate">
                        {job.lineItems.length > 0
                          ? job.lineItems.map((i) => i.repairTitle).join(', ')
                          : 'No line items'}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          aria-label={`Status for ${job.customerName || 'job'}`}
                          value={job.status}
                          onChange={(e) =>
                            onUpdateStatus(job.id, e.target.value as JobStatus)
                          }
                          className="h-8 px-2 bg-[#1c1f26] border border-[#2c313d] rounded text-xs font-medium text-slate-100 focus:outline-none focus:border-red-500 cursor-pointer"
                        >
                          <option value="Draft">Draft</option>
                          <option value="Quoted">Quoted</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-white tabular-nums whitespace-nowrap">
                        {formatCurrency(totals.grandTotal)}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onLoadJob(job)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-200 bg-[#1c1f26] hover:bg-[#252932] border border-[#2c313d] rounded transition-colors cursor-pointer"
                          >
                            <FolderOpen className="w-3.5 h-3.5" />
                            Open
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteJob(job.id)}
                            aria-label="Delete job"
                            className="p-1.5 text-slate-500 hover:text-red-400 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
