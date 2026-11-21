import {
  Calendar,
  FileText,
  Plus,
  SlidersHorizontal,
  Users,
  Wrench,
} from 'lucide-react';
import type { ComponentType } from 'react';
import type { AppTab } from '../types/mechanic';
import { DEFAULT_LOGO_PATH, formatCurrency } from '../utils/storage';

interface SideNavProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  estimateCount: number;
  scheduleCount: number;
  customersCount: number;
  businessName: string;
  businessPhone: string;
  hourlyRate: number;
  logoUrl?: string;
  activeVehicleLabel: string;
  onStartNewEstimate: () => void;
}

interface NavItemConfig {
  id: AppTab;
  label: string;
  icon: ComponentType<{ className?: string }>;
  count?: number;
}

export function SideNav({
  activeTab,
  onSelectTab,
  estimateCount,
  scheduleCount,
  customersCount,
  businessName,
  businessPhone,
  hourlyRate,
  logoUrl,
  activeVehicleLabel,
  onStartNewEstimate,
}: SideNavProps) {
  const navItems: NavItemConfig[] = [
    { id: 'lookup', label: 'Labor & Guides', icon: Wrench },
    {
      id: 'schedule',
      label: 'Schedule',
      icon: Calendar,
      count: scheduleCount > 0 ? scheduleCount : undefined,
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      count: customersCount > 0 ? customersCount : undefined,
    },
    {
      id: 'estimate',
      label: 'Docs & Estimate',
      icon: FileText,
      count: estimateCount > 0 ? estimateCount : undefined,
    },
    { id: 'rates', label: 'Shop & Branding', icon: SlidersHorizontal },
  ];

  const activeLogo = logoUrl || DEFAULT_LOGO_PATH;

  return (
    <>
      {/* Desktop / Tablet Vertical Left Sidebar */}
      <aside
        aria-label="Workspace sidebar"
        className="no-print hidden md:flex md:w-60 lg:w-64 shrink-0 flex-col justify-between bg-[#0f1116] border-r border-[#262a34] sticky top-0 h-screen"
      >
        <div className="flex flex-col min-h-0 flex-1">
          {/* Brand Header */}
          <div className="px-4 py-4 border-b border-[#262a34]">
            <button
              type="button"
              onClick={() => onSelectTab('lookup')}
              className="w-full flex items-center gap-3 text-left cursor-pointer group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 rounded-lg"
            >
              <img
                src={activeLogo}
                alt={businessName}
                referrerPolicy="no-referrer"
                className="w-11 h-11 object-contain rounded bg-black shrink-0 border border-[#262a34]"
              />
              <div className="min-w-0">
                <span className="block font-display text-sm font-bold tracking-tight text-white leading-snug group-hover:text-red-400 transition-colors line-clamp-2">
                  {businessName}
                </span>
                <span className="block text-[11px] font-medium text-slate-400 mt-0.5">
                  Mobile Mechanic Suite
                </span>
              </div>
            </button>
          </div>

          {/* Primary Action */}
          <div className="px-3 pt-4 pb-2">
            <button
              type="button"
              onClick={onStartNewEstimate}
              className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
            >
              <Plus className="w-4 h-4 shrink-0" />
              New Estimate
            </button>
          </div>

          {/* Vertical Tab Menu */}
          <nav
            aria-label="Primary navigation"
            className="flex-1 px-3 py-3 space-y-1.5 overflow-y-auto"
          >
            <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Menu
            </div>
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 ${
                    isActive
                      ? 'bg-[#181b22] text-white border border-red-600/50'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-[#161920] border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <span
                      aria-hidden="true"
                      className={`w-1 h-4 rounded-full shrink-0 transition-colors ${
                        isActive ? 'bg-red-600' : 'bg-transparent'
                      }`}
                    />
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-red-500' : 'text-slate-500'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </span>

                  {item.count !== undefined && (
                    <span
                      className={`text-xs font-mono tabular-nums shrink-0 ${
                        isActive ? 'text-red-400 font-semibold' : 'text-slate-500'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Context Strip */}
        <div className="px-4 py-3.5 border-t border-[#262a34] bg-[#0b0c0f]/80 space-y-2">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Active Vehicle
            </div>
            <div
              className="text-xs font-medium text-slate-200 truncate mt-0.5"
              title={activeVehicleLabel}
            >
              {activeVehicleLabel || 'No vehicle selected'}
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-[#1d2028] text-[11px] text-slate-400 tabular-nums">
            <span className="font-mono text-slate-300">
              {formatCurrency(hourlyRate)}/hr
            </span>
            <span className="truncate">{businessPhone}</span>
          </div>
        </div>
      </aside>

      {/* Mobile Compact Header + Tab Strip */}
      <header className="no-print md:hidden sticky top-0 z-30 bg-[#0b0c0f] border-b border-[#262a34]">
        <div className="px-4 h-14 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onSelectTab('lookup')}
            className="inline-flex items-center gap-2.5 font-display text-sm font-bold tracking-tight text-white whitespace-nowrap min-w-0 cursor-pointer"
          >
            <img
              src={activeLogo}
              alt={businessName}
              referrerPolicy="no-referrer"
              className="w-8 h-8 object-contain rounded bg-black shrink-0"
            />
            <span className="truncate">{businessName}</span>
          </button>

          <button
            type="button"
            onClick={onStartNewEstimate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            New Estimate
          </button>
        </div>

        <nav
          aria-label="Mobile navigation"
          className="px-3 pb-2 flex items-center gap-1.5 overflow-x-auto"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#181b22] text-white border border-red-600/60'
                    : 'text-slate-400 hover:text-slate-100 border border-[#262a34]'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? 'text-red-500' : 'text-slate-500'
                  }`}
                />
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span className="font-mono tabular-nums text-[11px] text-slate-400">
                    ({item.count})
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </header>
    </>
  );
}
