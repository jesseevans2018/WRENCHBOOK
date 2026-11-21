import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CalendarPlus,
  Check,
  Plus,
  RotateCcw,
  Wrench,
} from 'lucide-react';
import type { RepairGuide, ShopRates, VehicleSelection } from '../types/mechanic';
import { formatCurrency, formatHours } from '../utils/storage';

interface RepairGuideViewProps {
  vehicle: VehicleSelection;
  rates: ShopRates;
  guide: RepairGuide | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onAddToEstimate: (guide: RepairGuide, multiplier: number) => void;
  onScheduleGuide: (guide: RepairGuide, multiplier: number) => void;
}

type GuideSectionTab = 'steps' | 'specs' | 'parts';

const MULTIPLIER_OPTIONS = [
  { label: 'Standard (1.0x)', value: 1.0 },
  { label: 'Field / Tight Access (1.15x)', value: 1.15 },
  { label: 'Heavy Rust / Seized (1.25x)', value: 1.25 },
];

export function RepairGuideView({
  vehicle,
  rates,
  guide,
  isLoading,
  error,
  onRetry,
  onAddToEstimate,
  onScheduleGuide,
}: RepairGuideViewProps) {
  const [sectionTab, setSectionTab] = useState<GuideSectionTab>('steps');
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>(
    {}
  );
  const [addedFeedback, setAddedFeedback] = useState(false);

  useEffect(() => {
    setCompletedSteps({});
    setMultiplier(1.0);
    setAddedFeedback(false);
  }, [guide?.repairTitle, guide?.vehicleLabel]);

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepNumber]: !prev[stepNumber],
    }));
  };

  if (isLoading) {
    return (
      <div className="bg-[#14161b] border border-[#262a34] rounded-xl p-6 space-y-6 animate-pulse">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#262a34]">
          <div className="space-y-2.5 flex-1">
            <div className="h-6 bg-[#262a34] rounded w-2/3" />
            <div className="h-4 bg-[#1c1f26] rounded w-1/2" />
          </div>
          <div className="h-16 bg-[#1c1f26] rounded-lg w-64" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="h-14 bg-[#1c1f26] rounded-lg w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#14161b] border border-[#262a34] rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="space-y-3">
            <div>
              <h3 className="font-display text-base font-semibold text-white">
                Could Not Load Repair Guide
              </h3>
              <p className="text-sm text-slate-400 mt-1">{error}</p>
            </div>
            <button
              type="button"
              onClick={onRetry}
              className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="bg-[#14161b] border border-[#262a34] rounded-xl p-8 sm:p-12 text-center">
        <div className="max-w-lg mx-auto space-y-3">
          <div className="w-11 h-11 rounded-lg bg-[#1c1f26] border border-[#2c313d] text-red-500 mx-auto flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
          <h3 className="font-display text-lg font-semibold text-white">
            Select a Vehicle & Repair to Begin
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Currently configured for{' '}
            <span className="font-semibold text-white">
              {vehicle.year} {vehicle.make} {vehicle.model} ({vehicle.engine})
            </span>
            . Pick any system repair from the left panel or type a custom job to view flat-rate book labor hours, customer pricing, torque specs, and step-by-step instructions.
          </p>
        </div>
      </div>
    );
  }

  const adjustedHours = Number((guide.bookLaborHours * multiplier).toFixed(2));
  const laborCost = adjustedHours * rates.hourlyRate;
  const totalWithCallout = laborCost + rates.mobileCalloutFee;
  const completedCount = guide.steps.filter(
    (s) => completedSteps[s.stepNumber]
  ).length;
  const progressPercent =
    guide.steps.length > 0
      ? Math.round((completedCount / guide.steps.length) * 100)
      : 0;

  const handleAdd = () => {
    onAddToEstimate(guide, multiplier);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  return (
    <div className="bg-[#14161b] border border-[#262a34] rounded-xl overflow-hidden">
      {/* Header & Labor Rate Summary */}
      <div className="p-5 sm:p-6 border-b border-[#262a34]">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-medium text-red-400">
              {guide.systemCategory}
            </p>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight text-balance">
              {guide.repairTitle}
            </h1>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-300">
              <span className="font-medium text-white">
                {guide.vehicleLabel}
              </span>
              <span aria-hidden="true" className="text-slate-600">
                ·
              </span>
              <span className="font-mono tabular-nums text-slate-200">
                {formatHours(guide.bookLaborHours)} book time
              </span>
              <span aria-hidden="true" className="text-slate-600">
                ·
              </span>
              <span>{guide.difficulty}</span>
              <span aria-hidden="true" className="text-slate-600">
                ·
              </span>
              <span
                className={
                  guide.mobileFeasibility === 'Shop Lift Recommended'
                    ? 'text-red-400 font-medium'
                    : 'text-emerald-400 font-medium'
                }
              >
                {guide.mobileFeasibility}
              </span>
            </div>
            <p className="text-xs text-slate-400 pt-1 leading-relaxed">
              {guide.mobileFeasibilityNote}
            </p>
          </div>

          {/* Live Labor & Quote Box */}
          <div className="lg:w-80 shrink-0 bg-[#1c1f26] border border-[#2c313d] rounded-lg p-4 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-medium text-slate-300">
                Adjusted Labor ({formatHours(adjustedHours)})
              </span>
              <span className="font-mono text-xl font-bold text-white tabular-nums">
                {formatCurrency(laborCost)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-[#2c313d] pb-2.5">
              <span>
                Book Range: {guide.laborRangeHours.min.toFixed(1)}–
                {guide.laborRangeHours.max.toFixed(1)} hrs
              </span>
              <span className="font-mono tabular-nums">
                Rate: {formatCurrency(rates.hourlyRate)}/hr
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>
                With Mobile Callout ({formatCurrency(rates.mobileCalloutFee)})
              </span>
              <span className="font-mono font-semibold text-white tabular-nums">
                {formatCurrency(totalWithCallout)}
              </span>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleAdd}
                className="w-full h-10 px-4 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                {addedFeedback ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    Added to Estimate & Docs
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add to Customer Estimate
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onScheduleGuide(guide, multiplier)}
                className="w-full h-9 px-4 inline-flex items-center justify-center gap-1.5 text-xs font-medium text-slate-200 bg-[#14161b] hover:bg-[#252932] border border-[#2c313d] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                <CalendarPlus className="w-3.5 h-3.5 text-red-400" />
                Load to Hourly Schedule
              </button>
            </div>
          </div>
        </div>

        {/* Field Condition Multiplier & Tab Controls */}
        <div className="mt-5 pt-4 border-t border-[#262a34] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400 mr-1">
              Condition Multiplier:
            </span>
            <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#0b0c0f] border border-[#262a34] rounded-lg">
              {MULTIPLIER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setMultiplier(opt.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    multiplier === opt.value
                      ? 'bg-[#262a34] text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="inline-flex items-center gap-1 p-1 bg-[#0b0c0f] border border-[#262a34] rounded-lg">
            <button
              type="button"
              onClick={() => setSectionTab('steps')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                sectionTab === 'steps'
                  ? 'bg-red-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Step-by-Step ({guide.steps.length})
            </button>
            <button
              type="button"
              onClick={() => setSectionTab('specs')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                sectionTab === 'specs'
                  ? 'bg-red-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Torque & Tools ({guide.torqueSpecs.length})
            </button>
            <button
              type="button"
              onClick={() => setSectionTab('parts')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                sectionTab === 'parts'
                  ? 'bg-red-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Parts & Safety ({guide.partsRequired.length})
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content Area */}
      {sectionTab === 'steps' && (
        <div>
          <div className="px-5 sm:px-6 py-3 bg-[#101216] border-b border-[#262a34] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <span className="text-xs font-medium text-slate-300 whitespace-nowrap tabular-nums">
                {completedCount} of {guide.steps.length} steps
              </span>
              <div className="flex-1 h-1.5 bg-[#262a34] rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-200"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="font-mono text-xs text-slate-400 tabular-nums">
                {progressPercent}%
              </span>
            </div>
            {completedCount > 0 && (
              <button
                type="button"
                onClick={() => setCompletedSteps({})}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>

          {guide.safetyWarnings.length > 0 && (
            <div className="px-5 sm:px-6 py-3.5 bg-red-950/25 border-b border-[#262a34] flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-200 leading-relaxed">
                <span className="font-semibold text-red-300">
                  Field Safety:{' '}
                </span>
                {guide.safetyWarnings.join(' · ')}
              </div>
            </div>
          )}

          <ol className="divide-y divide-[#262a34]">
            {guide.steps.map((step) => {
              const isDone = Boolean(completedSteps[step.stepNumber]);
              return (
                <li
                  key={step.stepNumber}
                  className={`px-5 sm:px-6 py-4 transition-colors ${
                    isDone ? 'bg-[#101216]' : 'bg-[#14161b]'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <button
                      type="button"
                      onClick={() => toggleStep(step.stepNumber)}
                      aria-label={`Mark step ${step.stepNumber} complete`}
                      className={`mt-0.5 w-7 h-7 rounded-md border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                        isDone
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-[#1c1f26] border-[#2c313d] text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {isDone ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <span className="font-mono text-xs font-semibold text-slate-300 tabular-nums">
                          {String(step.stepNumber).padStart(2, '0')}
                        </span>
                      )}
                    </button>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <h3
                        className={`font-display text-sm font-semibold ${
                          isDone
                            ? 'text-slate-500 line-through'
                            : 'text-white'
                        }`}
                      >
                        {String(step.stepNumber).padStart(2, '0')}. {step.title}
                      </h3>
                      <p
                        className={`text-sm leading-relaxed ${
                          isDone ? 'text-slate-500' : 'text-slate-300'
                        }`}
                      >
                        {step.instruction}
                      </p>

                      {(step.torqueSpec || step.proTip) && (
                        <div className="pt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                          {step.torqueSpec && (
                            <span className="font-mono font-medium text-red-300">
                              Torque: {step.torqueSpec}
                            </span>
                          )}
                          {step.proTip && (
                            <span className="text-slate-400">
                              Field Tip: {step.proTip}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {sectionTab === 'specs' && (
        <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="font-display text-sm font-semibold text-white mb-3">
              Factory Torque Specifications
            </h3>
            {guide.torqueSpecs.length === 0 ? (
              <p className="text-sm text-slate-400">
                No critical fastener torque values specified for this operation.
              </p>
            ) : (
              <div className="border border-[#262a34] rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[#1c1f26] border-b border-[#262a34]">
                    <tr>
                      <th className="px-3.5 py-2.5 text-left text-xs font-semibold text-slate-300">
                        Fastener / Component
                      </th>
                      <th className="px-3.5 py-2.5 text-right text-xs font-semibold text-slate-300">
                        Specification
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262a34]">
                    {guide.torqueSpecs.map((ts, idx) => (
                      <tr key={idx} className="hover:bg-[#1c1f26]/60">
                        <td className="px-3.5 py-2.5 text-slate-200">
                          {ts.fastener}
                        </td>
                        <td className="px-3.5 py-2.5 text-right font-mono text-xs font-semibold text-red-300 tabular-nums">
                          {ts.spec}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-display text-sm font-semibold text-white mb-3">
                Required Field Tools
              </h3>
              <ul className="divide-y divide-[#262a34] border border-[#262a34] rounded-lg">
                {guide.toolsRequired.map((tool, idx) => (
                  <li
                    key={idx}
                    className="px-3.5 py-2.5 text-sm text-slate-300"
                  >
                    {tool}
                  </li>
                ))}
              </ul>
            </div>

            {guide.fluidCapacities && guide.fluidCapacities.length > 0 && (
              <div>
                <h3 className="font-display text-sm font-semibold text-white mb-3">
                  Fluid Specs & Capacities
                </h3>
                <ul className="divide-y divide-[#262a34] border border-[#262a34] rounded-lg">
                  {guide.fluidCapacities.map((fluid, idx) => (
                    <li
                      key={idx}
                      className="px-3.5 py-2.5 text-slate-300 font-mono text-xs"
                    >
                      {fluid}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {sectionTab === 'parts' && (
        <div className="p-5 sm:p-6 space-y-8">
          <div>
            <h3 className="font-display text-sm font-semibold text-white mb-3">
              Parts & Consumables Required
            </h3>
            <div className="border border-[#262a34] rounded-lg overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#1c1f26] border-b border-[#262a34]">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-300">
                      Part / Hardware
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-300">
                      Qty
                    </th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-300">
                      Est. Retail Range
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-300">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262a34]">
                  {guide.partsRequired.map((part, idx) => (
                    <tr key={idx} className="hover:bg-[#1c1f26]/60">
                      <td className="px-4 py-3 font-medium text-white">
                        {part.name}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-300 tabular-nums">
                        {part.qty}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs font-semibold text-slate-200 tabular-nums whitespace-nowrap">
                        {part.estimatedPriceRange}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {part.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-white mb-3">
              Safety Precautions
            </h3>
            <ul className="divide-y divide-[#262a34] border border-[#262a34] rounded-lg">
              {guide.safetyWarnings.map((warn, idx) => (
                <li
                  key={idx}
                  className="px-4 py-3 text-sm text-slate-300 flex items-start gap-2.5"
                >
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{warn}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
