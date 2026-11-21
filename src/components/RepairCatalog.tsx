import { useState } from 'react';
import { ChevronDown, Search, Wrench } from 'lucide-react';
import { REPAIR_CATEGORIES } from '../data/repairs';

interface RepairCatalogProps {
  selectedCategory: string;
  selectedRepair: string;
  isLoading: boolean;
  onLookupRepair: (repairQuery: string, systemCategory: string) => void;
}

const QUICK_MOBILE_REPAIRS = [
  { label: 'Front Brake Pads & Rotors', category: 'Brakes & Hydraulics' },
  { label: 'Alternator Replacement', category: 'Electrical, Starting & Charging' },
  { label: 'Starter Motor Replacement', category: 'Electrical, Starting & Charging' },
  { label: 'Spark Plugs & Ignition Coils', category: 'Engine & Valvetrain' },
  { label: 'Water Pump Replacement', category: 'Cooling & HVAC' },
  { label: 'Wheel Hub & Bearing Assembly', category: 'Suspension & Steering' },
];

export function RepairCatalog({
  selectedCategory,
  selectedRepair,
  isLoading,
  onLookupRepair,
}: RepairCatalogProps) {
  const [categoryId, setCategoryId] = useState<string>(
    REPAIR_CATEGORIES.find((c) => c.name === selectedCategory)?.id ??
      REPAIR_CATEGORIES[0].id
  );
  const [dropdownRepair, setDropdownRepair] = useState<string>(
    selectedRepair || REPAIR_CATEGORIES[0].repairs[0]
  );
  const [customRepairInput, setCustomRepairInput] = useState<string>('');

  const activeCategory =
    REPAIR_CATEGORIES.find((c) => c.id === categoryId) ?? REPAIR_CATEGORIES[0];

  const handleCategoryChange = (nextId: string) => {
    setCategoryId(nextId);
    const cat = REPAIR_CATEGORIES.find((c) => c.id === nextId);
    if (cat && cat.repairs.length > 0) {
      setDropdownRepair(cat.repairs[0]);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = customRepairInput.trim() || dropdownRepair;
    if (!query) return;
    onLookupRepair(
      query,
      customRepairInput.trim() ? 'General / Custom Repair' : activeCategory.name
    );
  };

  const handleDropdownLookup = (repairName: string) => {
    setDropdownRepair(repairName);
    setCustomRepairInput('');
    onLookupRepair(repairName, activeCategory.name);
  };

  return (
    <aside
      aria-label="Repair selector"
      className="bg-[#14161b] border border-[#262a34] rounded-xl p-4 sm:p-5 space-y-5"
    >
      <div>
        <h2 className="font-display text-base font-semibold text-white">
          Repair Selection
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Pick from system categories or enter any custom repair job.
        </p>
      </div>

      {/* Category & Repair Dropdowns */}
      <div className="space-y-3">
        <div>
          <label
            htmlFor="repair-system"
            className="block text-xs font-medium text-slate-400 mb-1"
          >
            Vehicle System
          </label>
          <div className="relative">
            <select
              id="repair-system"
              value={categoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full h-11 pl-3 pr-8 bg-[#1c1f26] border border-[#2c313d] rounded-lg text-sm font-medium text-slate-100 appearance-none focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-600/20 cursor-pointer"
            >
              {REPAIR_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div>
          <label
            htmlFor="repair-operation"
            className="block text-xs font-medium text-slate-400 mb-1"
          >
            Standard Repair Operation
          </label>
          <div className="relative">
            <select
              id="repair-operation"
              value={
                activeCategory.repairs.includes(dropdownRepair)
                  ? dropdownRepair
                  : activeCategory.repairs[0]
              }
              onChange={(e) => handleDropdownLookup(e.target.value)}
              className="w-full h-11 pl-3 pr-8 bg-[#1c1f26] border border-[#2c313d] rounded-lg text-sm font-medium text-slate-100 appearance-none focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-600/20 cursor-pointer"
            >
              {activeCategory.repairs.map((rep) => (
                <option key={rep} value={rep}>
                  {rep}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <button
          type="button"
          disabled={isLoading}
          onClick={() => handleDropdownLookup(dropdownRepair)}
          className="w-full h-11 px-4 inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
        >
          <Wrench className="w-4 h-4" />
          {isLoading
            ? 'Calculating Labor & Guide...'
            : 'Get Labor Time & Instructions'}
        </button>
      </div>

      {/* Divider */}
      <div className="border-t border-[#262a34] pt-4">
        <form onSubmit={handleCustomSubmit} className="space-y-2.5">
          <label
            htmlFor="custom-repair-input"
            className="block text-xs font-medium text-slate-400"
          >
            Or Search / Enter Any Repair
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="custom-repair-input"
              type="text"
              value={customRepairInput}
              onChange={(e) => setCustomRepairInput(e.target.value)}
              placeholder="e.g., Rear main seal, blend door actuator..."
              className="w-full h-11 pl-9 pr-3 bg-[#1c1f26] border border-[#2c313d] rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-600/20"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !customRepairInput.trim()}
            className="w-full h-10 px-4 text-xs font-semibold text-slate-200 bg-[#1c1f26] hover:bg-[#252932] border border-[#2c313d] disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
          >
            Look Up Custom Repair
          </button>
        </form>
      </div>

      {/* Quick Mobile Field Picks */}
      <div className="border-t border-[#262a34] pt-4">
        <p className="text-xs font-medium text-slate-400 mb-2.5">
          Common Mobile Field Jobs
        </p>
        <div className="divide-y divide-[#262a34] border border-[#262a34] rounded-lg overflow-hidden">
          {QUICK_MOBILE_REPAIRS.map((item) => {
            const isSelected =
              selectedRepair.toLowerCase() === item.label.toLowerCase();
            return (
              <button
                key={item.label}
                type="button"
                disabled={isLoading}
                onClick={() => {
                  const cat = REPAIR_CATEGORIES.find(
                    (c) => c.name === item.category
                  );
                  if (cat) setCategoryId(cat.id);
                  setDropdownRepair(item.label);
                  setCustomRepairInput('');
                  onLookupRepair(item.label, item.category);
                }}
                className={`w-full px-3 py-2.5 text-left text-xs font-medium transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-red-600/15 text-red-300'
                    : 'bg-[#14161b] text-slate-300 hover:bg-[#1c1f26]'
                }`}
              >
                <span className="truncate">{item.label}</span>
                <span className="text-[11px] text-slate-500 shrink-0">
                  Select
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
