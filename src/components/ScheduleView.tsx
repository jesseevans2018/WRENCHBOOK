import { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  MapPin,
  Phone,
  Plus,
  Trash2,
  User,
  Wrench,
  X,
} from 'lucide-react';
import type {
  AppointmentStatus,
  CustomerRecord,
  RepairGuide,
  ScheduledAppointment,
  ScheduledRepairItem,
  ScheduleViewMode,
  ShopRates,
  VehicleSelection,
} from '../types/mechanic';
import {
  formatCurrency,
  formatHourLabel,
  formatHours,
  parseDateKey,
  toDateKey,
} from '../utils/storage';

interface ScheduleViewProps {
  appointments: ScheduledAppointment[];
  customers: CustomerRecord[];
  activeVehicle: VehicleSelection;
  activeGuide: RepairGuide | null;
  rates: ShopRates;
  pendingDraft?: {
    date?: string;
    startHour?: number;
    customerId?: string;
    customerName?: string;
    customerPhone?: string;
    serviceAddress?: string;
    vehicle?: VehicleSelection;
    vinOrPlate?: string;
    repairs?: ScheduledRepairItem[];
    notes?: string;
  } | null;
  onClearPendingDraft: () => void;
  onSaveAppointment: (
    appt: ScheduledAppointment,
    saveToCustomerDb: boolean
  ) => void;
  onDeleteAppointment: (id: string) => void;
  onOpenInLaborGuide: (
    vehicle: VehicleSelection,
    repairTitle?: string,
    systemCategory?: string
  ) => void;
  onSendToEstimate: (appt: ScheduledAppointment) => void;
}

const STATUS_OPTIONS: AppointmentStatus[] = [
  'Scheduled',
  'En Route',
  'In Progress',
  'Completed',
  'Cancelled',
];

const START_TIME_OPTIONS: number[] = Array.from(
  { length: 48 },
  (_, i) => i * 0.5
);

function getStatusAccent(status: AppointmentStatus): string {
  switch (status) {
    case 'Completed':
      return 'bg-emerald-950/70 border-emerald-600/60 text-emerald-100';
    case 'In Progress':
      return 'bg-red-950/75 border-red-500 text-white';
    case 'En Route':
      return 'bg-amber-950/70 border-amber-500/70 text-amber-100';
    case 'Cancelled':
      return 'bg-[#1a1c22] border-[#2c313d] text-slate-400 opacity-70';
    default:
      return 'bg-[#1c1f28] border-slate-500/70 text-slate-100';
  }
}

function getStatusTextClass(status: AppointmentStatus): string {
  switch (status) {
    case 'Completed':
      return 'text-emerald-400';
    case 'In Progress':
      return 'text-red-400';
    case 'En Route':
      return 'text-amber-400';
    case 'Cancelled':
      return 'text-slate-500';
    default:
      return 'text-slate-300';
  }
}

function getWeekStart(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay(); // 0 = Sun
  d.setDate(d.getDate() - day);
  return d;
}

function getMonthCalendarDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

export function ScheduleView({
  appointments,
  customers,
  activeVehicle,
  activeGuide,
  rates,
  pendingDraft,
  onClearPendingDraft,
  onSaveAppointment,
  onDeleteAppointment,
  onOpenInLaborGuide,
  onSendToEstimate,
}: ScheduleViewProps) {
  const [viewMode, setViewMode] = useState<ScheduleViewMode>('daily');
  const [selectedDateKey, setSelectedDateKey] = useState<string>(() =>
    toDateKey(new Date())
  );
  const [show24Hours, setShow24Hours] = useState<boolean>(false);

  const [editingAppt, setEditingAppt] = useState<ScheduledAppointment | null>(
    null
  );
  const [saveToCustomerDb, setSaveToCustomerDb] = useState<boolean>(true);
  const [newRepairInput, setNewRepairInput] = useState<string>('');
  const [newRepairHours, setNewRepairHours] = useState<string>('1.0');

  const selectedDate = useMemo(
    () => parseDateKey(selectedDateKey),
    [selectedDateKey]
  );

  const hourStart = show24Hours ? 0 : 6;
  const hourEnd = show24Hours ? 23 : 21;
  const hoursList = useMemo(
    () =>
      Array.from(
        { length: hourEnd - hourStart + 1 },
        (_, idx) => hourStart + idx
      ),
    [hourStart, hourEnd]
  );

  const buildDefaultRepairs = (): ScheduledRepairItem[] => {
    if (!activeGuide) return [];
    return [
      {
        title: activeGuide.repairTitle,
        systemCategory: activeGuide.systemCategory,
        laborHours: activeGuide.bookLaborHours,
        hourlyRate: rates.hourlyRate,
        partsCost: 0,
      },
    ];
  };

  const openCreateModal = (
    dateKey = selectedDateKey,
    startHour = 9,
    overrides?: Partial<ScheduledAppointment>
  ) => {
    const now = new Date().toISOString();
    const defaultRepairs = overrides?.repairs ?? buildDefaultRepairs();
    const totalHours = defaultRepairs.reduce((s, r) => s + r.laborHours, 0);

    setEditingAppt({
      id: `appt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      date: dateKey,
      startHour,
      durationHours: Math.max(0.5, Number((totalHours || 1.5).toFixed(1))),
      status: 'Scheduled',
      customerId: overrides?.customerId,
      customerName: overrides?.customerName || '',
      customerPhone: overrides?.customerPhone || '',
      serviceAddress: overrides?.serviceAddress || '',
      vehicle: overrides?.vehicle || activeVehicle,
      vinOrPlate: overrides?.vinOrPlate || '',
      repairs: defaultRepairs,
      notes: overrides?.notes || '',
      createdAt: now,
      updatedAt: now,
    });
    setSaveToCustomerDb(true);
    setNewRepairInput('');
    setNewRepairHours('1.0');
  };

  // Handle incoming pending draft from Labor Guide, Estimate Builder, or Customer Database
  useEffect(() => {
    if (pendingDraft) {
      openCreateModal(
        pendingDraft.date || selectedDateKey,
        pendingDraft.startHour ?? 9,
        {
          customerId: pendingDraft.customerId,
          customerName: pendingDraft.customerName,
          customerPhone: pendingDraft.customerPhone,
          serviceAddress: pendingDraft.serviceAddress,
          vehicle: pendingDraft.vehicle,
          vinOrPlate: pendingDraft.vinOrPlate,
          repairs: pendingDraft.repairs,
          notes: pendingDraft.notes,
        }
      );
      onClearPendingDraft();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingDraft]);

  const navigateDate = (direction: -1 | 1) => {
    const d = new Date(selectedDate);
    if (viewMode === 'daily') {
      d.setDate(d.getDate() + direction);
    } else if (viewMode === 'weekly') {
      d.setDate(d.getDate() + direction * 7);
    } else {
      d.setMonth(d.getMonth() + direction);
    }
    setSelectedDateKey(toDateKey(d));
  };

  const weekDays = useMemo(() => {
    const start = getWeekStart(selectedDate);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [selectedDate]);

  const monthDays = useMemo(
    () =>
      getMonthCalendarDays(
        selectedDate.getFullYear(),
        selectedDate.getMonth()
      ),
    [selectedDate]
  );

  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, ScheduledAppointment[]>();
    for (const appt of appointments) {
      const list = map.get(appt.date) || [];
      list.push(appt);
      map.set(appt.date, list);
    }
    for (const [k, list] of map.entries()) {
      list.sort((a, b) => a.startHour - b.startHour);
      map.set(k, list);
    }
    return map;
  }, [appointments]);

  const dayAppointments = appointmentsByDate.get(selectedDateKey) || [];

  const headerDateLabel = useMemo(() => {
    if (viewMode === 'daily') {
      return selectedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    if (viewMode === 'weekly') {
      const first = weekDays[0];
      const last = weekDays[6];
      return `${first.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })} – ${last.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}`;
    }
    return selectedDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }, [viewMode, selectedDate, weekDays]);

  const handleSelectCustomerInModal = (customerId: string) => {
    if (!editingAppt) return;
    const cust = customers.find((c) => c.id === customerId);
    if (!cust) {
      setEditingAppt({ ...editingAppt, customerId: undefined });
      return;
    }
    const firstVehicle = cust.vehicles[0];
    setEditingAppt({
      ...editingAppt,
      customerId: cust.id,
      customerName: cust.name,
      customerPhone: cust.phone,
      serviceAddress: cust.address || editingAppt.serviceAddress,
      vehicle: firstVehicle
        ? {
            year: firstVehicle.year,
            make: firstVehicle.make,
            model: firstVehicle.model,
            engine: firstVehicle.engine,
            drivetrain: firstVehicle.drivetrain,
            transmission: firstVehicle.transmission,
            trim: firstVehicle.trim,
          }
        : editingAppt.vehicle,
      vinOrPlate:
        firstVehicle?.vin || firstVehicle?.licensePlate || editingAppt.vinOrPlate,
    });
  };

  const handleLoadActiveIntoModal = () => {
    if (!editingAppt) return;
    const nextRepairs = [...editingAppt.repairs];
    if (
      activeGuide &&
      !nextRepairs.some(
        (r) =>
          r.title.toLowerCase() === activeGuide.repairTitle.toLowerCase()
      )
    ) {
      nextRepairs.push({
        title: activeGuide.repairTitle,
        systemCategory: activeGuide.systemCategory,
        laborHours: activeGuide.bookLaborHours,
        hourlyRate: rates.hourlyRate,
        partsCost: 0,
      });
    }
    const summedHours = nextRepairs.reduce((s, r) => s + r.laborHours, 0);
    setEditingAppt({
      ...editingAppt,
      vehicle: activeVehicle,
      repairs: nextRepairs,
      durationHours: Math.max(0.5, Number((summedHours || 1.5).toFixed(1))),
    });
  };

  const handleAddRepairToModal = () => {
    if (!editingAppt || !newRepairInput.trim()) return;
    const hrs = Math.max(0.25, Number(newRepairHours) || 1.0);
    const nextRepairs: ScheduledRepairItem[] = [
      ...editingAppt.repairs,
      {
        title: newRepairInput.trim(),
        systemCategory: 'Scheduled Repair',
        laborHours: hrs,
        hourlyRate: rates.hourlyRate,
        partsCost: 0,
      },
    ];
    const totalHours = nextRepairs.reduce((s, r) => s + r.laborHours, 0);
    setEditingAppt({
      ...editingAppt,
      repairs: nextRepairs,
      durationHours: Math.max(0.5, Number(totalHours.toFixed(1))),
    });
    setNewRepairInput('');
    setNewRepairHours('1.0');
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAppt) return;
    onSaveAppointment(
      { ...editingAppt, updatedAt: new Date().toISOString() },
      saveToCustomerDb
    );
    setEditingAppt(null);
  };

  const ROW_HEIGHT = 60; // px per hour in daily/weekly grid
  const inputClass =
    'w-full h-10 px-3 bg-[#1c1f26] border border-[#2c313d] rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-600/20';

  const todayKey = toDateKey(new Date());

  return (
    <div className="space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-bold text-white">
            Hourly Dispatch & Repair Schedule
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Plan mobile repair jobs by the hour across daily, weekly, and monthly views.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Segmented Switch */}
          <div className="inline-flex items-center gap-1 p-1 bg-[#14161b] border border-[#262a34] rounded-lg">
            {(['daily', 'weekly', 'monthly'] as ScheduleViewMode[]).map(
              (mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors whitespace-nowrap cursor-pointer ${
                    viewMode === mode
                      ? 'bg-red-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              )
            )}
          </div>

          {viewMode !== 'monthly' && (
            <button
              type="button"
              onClick={() => setShow24Hours((v) => !v)}
              className={`h-9 px-3 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                show24Hours
                  ? 'bg-red-600/20 border-red-500/60 text-red-300'
                  : 'bg-[#14161b] border-[#262a34] text-slate-300 hover:text-white'
              }`}
            >
              {show24Hours ? '24/7 Hours On' : '6 AM – 9 PM'}
            </button>
          )}

          <button
            type="button"
            onClick={() => openCreateModal(selectedDateKey, 9)}
            className="h-9 px-4 inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Schedule Repair
          </button>
        </div>
      </div>

      {/* Active Vehicle & Repair Quick-Load Bar */}
      <div className="bg-[#14161b] border border-[#262a34] rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Wrench className="w-4 h-4 text-red-500 shrink-0" />
          <div className="text-xs text-slate-300 truncate">
            <span className="text-slate-400">Active Lookup: </span>
            <span className="font-semibold text-white">
              {activeVehicle.year} {activeVehicle.make} {activeVehicle.model} (
              {activeVehicle.engine})
            </span>
            {activeGuide && (
              <>
                <span className="mx-1.5 text-slate-600">·</span>
                <span className="text-red-300 font-medium">
                  {activeGuide.repairTitle} ({formatHours(activeGuide.bookLaborHours)})
                </span>
              </>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => openCreateModal(selectedDateKey, 9)}
          className="px-3 py-1.5 text-xs font-semibold text-white bg-[#1c1f26] hover:bg-[#252932] border border-[#2c313d] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Load Selected Vehicle & Repair to Schedule
        </button>
      </div>

      {/* Date Navigation Strip */}
      <div className="bg-[#14161b] border border-[#262a34] rounded-xl px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigateDate(-1)}
            aria-label="Previous"
            className="w-9 h-9 inline-flex items-center justify-center rounded-lg bg-[#1c1f26] border border-[#2c313d] text-slate-300 hover:text-white cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setSelectedDateKey(toDateKey(new Date()))}
            className="h-9 px-3 rounded-lg bg-[#1c1f26] border border-[#2c313d] text-xs font-medium text-slate-200 hover:text-white cursor-pointer"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => navigateDate(1)}
            aria-label="Next"
            className="w-9 h-9 inline-flex items-center justify-center rounded-lg bg-[#1c1f26] border border-[#2c313d] text-slate-300 hover:text-white cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <h2 className="font-display text-sm sm:text-base font-semibold text-white text-center">
          {headerDateLabel}
        </h2>

        <div className="text-xs text-slate-400 font-mono tabular-nums hidden sm:block">
          {viewMode === 'daily'
            ? `${dayAppointments.length} jobs · ${formatHours(
                dayAppointments.reduce((s, a) => s + a.durationHours, 0)
              )}`
            : `${appointments.length} total scheduled`}
        </div>
      </div>

      {/* DAILY HOURLY PLANNER */}
      {viewMode === 'daily' && (
        <div className="bg-[#14161b] border border-[#262a34] rounded-xl overflow-hidden">
          <div className="relative flex">
            {/* Hour Labels Column */}
            <div className="w-20 sm:w-24 shrink-0 border-r border-[#262a34] bg-[#101216]">
              {hoursList.map((hr) => (
                <div
                  key={hr}
                  style={{ height: `${ROW_HEIGHT}px` }}
                  className="px-3 pt-2 border-b border-[#262a34] text-right font-mono text-xs text-slate-400 tabular-nums"
                >
                  {formatHourLabel(hr)}
                </div>
              ))}
            </div>

            {/* Hourly Interactive Slots + Positioned Job Blocks */}
            <div className="flex-1 relative min-w-0">
              {hoursList.map((hr) => (
                <button
                  key={hr}
                  type="button"
                  onClick={() => openCreateModal(selectedDateKey, hr)}
                  style={{ height: `${ROW_HEIGHT}px` }}
                  className="w-full block border-b border-[#262a34] text-left px-4 hover:bg-[#1c1f26]/60 transition-colors group cursor-pointer"
                >
                  <span className="text-[11px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    + Schedule job at {formatHourLabel(hr)}
                  </span>
                </button>
              ))}

              {/* Scheduled Appointment Blocks */}
              {dayAppointments.map((appt) => {
                const clampedStart = Math.max(hourStart, appt.startHour);
                const endHour = appt.startHour + appt.durationHours;
                if (endHour <= hourStart || appt.startHour > hourEnd + 1) {
                  return null;
                }
                const topPx = (clampedStart - hourStart) * ROW_HEIGHT + 2;
                const heightPx = Math.max(
                  42,
                  Math.min(
                    (hourEnd + 1 - clampedStart) * ROW_HEIGHT - 4,
                    (endHour - clampedStart) * ROW_HEIGHT - 4
                  )
                );
                const estTotal = appt.repairs.reduce(
                  (s, r) => s + r.laborHours * r.hourlyRate + r.partsCost,
                  0
                );

                return (
                  <div
                    key={appt.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingAppt(appt);
                    }}
                    style={{ top: `${topPx}px`, height: `${heightPx}px` }}
                    className={`absolute left-2 right-2 rounded-lg border px-3.5 py-2 cursor-pointer overflow-hidden transition-transform hover:scale-[1.003] ${getStatusAccent(
                      appt.status
                    )}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2 text-xs">
                          <span className="font-mono font-semibold tabular-nums">
                            {formatHourLabel(appt.startHour)} –{' '}
                            {formatHourLabel(
                              appt.startHour + appt.durationHours
                            )}
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="font-semibold text-white truncate">
                            {appt.customerName || 'Walk-in Customer'}
                          </span>
                          <span className="text-slate-400">·</span>
                          <span
                            className={`font-medium ${getStatusTextClass(
                              appt.status
                            )}`}
                          >
                            {appt.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 mt-0.5 truncate">
                          {appt.vehicle.year} {appt.vehicle.make}{' '}
                          {appt.vehicle.model} ({appt.vehicle.engine})
                          {appt.repairs.length > 0 &&
                            ` — ${appt.repairs
                              .map((r) => r.title)
                              .join(', ')}`}
                        </p>
                        {heightPx >= 68 && appt.serviceAddress && (
                          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                            {appt.serviceAddress}
                            {appt.customerPhone ? ` · ${appt.customerPhone}` : ''}
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono text-xs font-semibold tabular-nums block">
                          {formatHours(appt.durationHours)}
                        </span>
                        {estTotal > 0 && (
                          <span className="font-mono text-[11px] text-slate-300 tabular-nums">
                            {formatCurrency(estTotal)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* WEEKLY HOURLY MATRIX */}
      {viewMode === 'weekly' && (
        <div className="bg-[#14161b] border border-[#262a34] rounded-xl overflow-x-auto">
          <div className="min-w-[860px]">
            {/* Day Column Headers */}
            <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-[#262a34] bg-[#101216]">
              <div className="p-2.5 border-r border-[#262a34] text-xs font-medium text-slate-500 text-right">
                Hour
              </div>
              {weekDays.map((day) => {
                const key = toDateKey(day);
                const isToday = key === todayKey;
                const isSelected = key === selectedDateKey;
                const dayCount = (appointmentsByDate.get(key) || []).length;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSelectedDateKey(key);
                      setViewMode('daily');
                    }}
                    className={`p-2.5 border-r last:border-r-0 border-[#262a34] text-left transition-colors hover:bg-[#1c1f26] cursor-pointer ${
                      isSelected ? 'bg-[#1c1f26]' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-semibold ${
                          isToday ? 'text-red-400' : 'text-slate-200'
                        }`}
                      >
                        {day.toLocaleDateString('en-US', {
                          weekday: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      {dayCount > 0 && (
                        <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                          {dayCount}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Body Grid */}
            <div className="grid grid-cols-[80px_repeat(7,1fr)]">
              {/* Time Column */}
              <div className="border-r border-[#262a34] bg-[#101216]">
                {hoursList.map((hr) => (
                  <div
                    key={hr}
                    style={{ height: `${ROW_HEIGHT}px` }}
                    className="px-2 pt-1.5 border-b border-[#262a34] text-right font-mono text-[11px] text-slate-400 tabular-nums"
                  >
                    {formatHourLabel(hr)}
                  </div>
                ))}
              </div>

              {/* 7 Day Columns */}
              {weekDays.map((day) => {
                const key = toDateKey(day);
                const dayList = appointmentsByDate.get(key) || [];
                return (
                  <div
                    key={key}
                    className="relative border-r last:border-r-0 border-[#262a34]"
                  >
                    {hoursList.map((hr) => (
                      <button
                        key={hr}
                        type="button"
                        onClick={() => openCreateModal(key, hr)}
                        aria-label={`Schedule on ${key} at ${formatHourLabel(hr)}`}
                        style={{ height: `${ROW_HEIGHT}px` }}
                        className="w-full block border-b border-[#262a34] hover:bg-[#1c1f26]/60 transition-colors cursor-pointer"
                      />
                    ))}

                    {dayList.map((appt) => {
                      const clampedStart = Math.max(hourStart, appt.startHour);
                      const endHour = appt.startHour + appt.durationHours;
                      if (
                        endHour <= hourStart ||
                        appt.startHour > hourEnd + 1
                      ) {
                        return null;
                      }
                      const topPx = (clampedStart - hourStart) * ROW_HEIGHT + 2;
                      const heightPx = Math.max(
                        34,
                        Math.min(
                          (hourEnd + 1 - clampedStart) * ROW_HEIGHT - 4,
                          (endHour - clampedStart) * ROW_HEIGHT - 4
                        )
                      );

                      return (
                        <div
                          key={appt.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingAppt(appt);
                          }}
                          style={{ top: `${topPx}px`, height: `${heightPx}px` }}
                          className={`absolute left-1 right-1 rounded border px-1.5 py-1 overflow-hidden cursor-pointer ${getStatusAccent(
                            appt.status
                          )}`}
                        >
                          <div className="font-mono text-[10px] font-semibold truncate tabular-nums">
                            {formatHourLabel(appt.startHour)} ·{' '}
                            {appt.customerName || 'Customer'}
                          </div>
                          <div className="text-[11px] text-slate-200 truncate">
                            {appt.vehicle.year} {appt.vehicle.model}
                          </div>
                          {heightPx >= 52 && appt.repairs[0] && (
                            <div className="text-[10px] text-slate-400 truncate">
                              {appt.repairs[0].title}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MONTHLY CALENDAR + DAY AGENDA */}
      {viewMode === 'monthly' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-8 bg-[#14161b] border border-[#262a34] rounded-xl overflow-hidden">
            <div className="grid grid-cols-7 border-b border-[#262a34] bg-[#101216]">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div
                  key={d}
                  className="py-2.5 text-center text-xs font-semibold text-slate-400"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {monthDays.map((day) => {
                const key = toDateKey(day);
                const isCurrentMonth =
                  day.getMonth() === selectedDate.getMonth();
                const isSelected = key === selectedDateKey;
                const isToday = key === todayKey;
                const list = appointmentsByDate.get(key) || [];
                const totalDayHours = list.reduce(
                  (s, a) => s + a.durationHours,
                  0
                );

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedDateKey(key)}
                    className={`min-h-[92px] p-2 border-b border-r border-[#262a34] text-left flex flex-col justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-red-600/15'
                        : isCurrentMonth
                        ? 'bg-[#14161b] hover:bg-[#1c1f26]'
                        : 'bg-[#0f1115] text-slate-600 hover:bg-[#161920]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`font-mono text-xs font-semibold tabular-nums ${
                          isToday
                            ? 'text-red-400'
                            : isCurrentMonth
                            ? 'text-slate-200'
                            : 'text-slate-600'
                        }`}
                      >
                        {day.getDate()}
                      </span>
                      {totalDayHours > 0 && (
                        <span className="font-mono text-[10px] text-slate-400 tabular-nums">
                          {totalDayHours.toFixed(1)}h
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 w-full mt-1">
                      {list.slice(0, 2).map((a) => (
                        <div
                          key={a.id}
                          className="text-[10px] truncate px-1.5 py-0.5 rounded bg-[#1c1f26] border border-[#2c313d] text-slate-200"
                        >
                          {formatHourLabel(a.startHour).replace(':00 ', '')}{' '}
                          {a.customerName || a.vehicle.model}
                        </div>
                      ))}
                      {list.length > 2 && (
                        <div className="text-[10px] text-slate-400 pl-1">
                          +{list.length - 2} more
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Day Hourly Agenda */}
          <aside className="lg:col-span-4 bg-[#14161b] border border-[#262a34] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-sm font-semibold text-white">
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </h3>
                <p className="text-xs text-slate-400">
                  {dayAppointments.length} scheduled{' '}
                  {dayAppointments.length === 1 ? 'job' : 'jobs'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode('daily')}
                  className="px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-[#1c1f26] hover:bg-[#252932] border border-[#2c313d] rounded-lg cursor-pointer"
                >
                  Hourly View
                </button>
                <button
                  type="button"
                  onClick={() => openCreateModal(selectedDateKey, 9)}
                  className="px-2.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer"
                >
                  + Add
                </button>
              </div>
            </div>

            {dayAppointments.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-[#262a34] rounded-lg">
                No jobs scheduled on this date.
              </div>
            ) : (
              <div className="divide-y divide-[#262a34] border border-[#262a34] rounded-lg overflow-hidden">
                {dayAppointments.map((appt) => (
                  <button
                    key={appt.id}
                    type="button"
                    onClick={() => setEditingAppt(appt)}
                    className="w-full p-3.5 text-left bg-[#14161b] hover:bg-[#1c1f26] transition-colors space-y-1 cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-semibold text-white tabular-nums">
                        {formatHourLabel(appt.startHour)} –{' '}
                        {formatHourLabel(appt.startHour + appt.durationHours)}
                      </span>
                      <span className={getStatusTextClass(appt.status)}>
                        {appt.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-white">
                      {appt.customerName || 'Walk-in Customer'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {appt.vehicle.year} {appt.vehicle.make}{' '}
                      {appt.vehicle.model} ({appt.vehicle.engine})
                    </p>
                    {appt.repairs.length > 0 && (
                      <p className="text-xs text-red-300 truncate">
                        {appt.repairs.map((r) => r.title).join(', ')}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </aside>
        </div>
      )}

      {/* APPOINTMENT MODAL */}
      {editingAppt && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 overflow-y-auto"
        >
          <form
            onSubmit={handleModalSubmit}
            className="bg-[#14161b] border border-[#2c313d] rounded-xl w-full max-w-2xl overflow-hidden my-8"
          >
            <div className="px-5 py-4 border-b border-[#262a34] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-500" />
                <h2 className="font-display text-base font-bold text-white">
                  Schedule / Edit Mobile Repair Job
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditingAppt(null)}
                aria-label="Close modal"
                className="p-1.5 text-slate-400 hover:text-white rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Time & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editingAppt.date}
                    onChange={(e) =>
                      setEditingAppt({ ...editingAppt, date: e.target.value })
                    }
                    className={`${inputClass} font-mono`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Start Time
                  </label>
                  <select
                    value={editingAppt.startHour}
                    onChange={(e) =>
                      setEditingAppt({
                        ...editingAppt,
                        startHour: Number(e.target.value),
                      })
                    }
                    className={`${inputClass} font-mono`}
                  >
                    {START_TIME_OPTIONS.map((h) => (
                      <option key={h} value={h}>
                        {formatHourLabel(h)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Duration (hrs)
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    max="16"
                    step="0.5"
                    value={editingAppt.durationHours}
                    onChange={(e) =>
                      setEditingAppt({
                        ...editingAppt,
                        durationHours: Math.max(0.5, Number(e.target.value)),
                      })
                    }
                    className={`${inputClass} font-mono tabular-nums`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Status
                  </label>
                  <select
                    value={editingAppt.status}
                    onChange={(e) =>
                      setEditingAppt({
                        ...editingAppt,
                        status: e.target.value as AppointmentStatus,
                      })
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

              {/* Customer Selection / Entry */}
              <div className="border-t border-[#262a34] pt-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-white inline-flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-red-400" />
                    Customer & Dispatch Location
                  </span>
                  {customers.length > 0 && (
                    <select
                      value={editingAppt.customerId || ''}
                      onChange={(e) =>
                        handleSelectCustomerInModal(e.target.value)
                      }
                      className="h-8 px-2.5 bg-[#1c1f26] border border-[#2c313d] rounded text-xs text-slate-200 focus:outline-none focus:border-red-500 cursor-pointer"
                    >
                      <option value="">Pick saved customer...</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.phone ? `(${c.phone})` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Customer Name"
                    value={editingAppt.customerName}
                    onChange={(e) =>
                      setEditingAppt({
                        ...editingAppt,
                        customerName: e.target.value,
                      })
                    }
                    className={inputClass}
                  />
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={editingAppt.customerPhone}
                      onChange={(e) =>
                        setEditingAppt({
                          ...editingAppt,
                          customerPhone: e.target.value,
                        })
                      }
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Service Address"
                      value={editingAppt.serviceAddress}
                      onChange={(e) =>
                        setEditingAppt({
                          ...editingAppt,
                          serviceAddress: e.target.value,
                        })
                      }
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle & Repairs */}
              <div className="border-t border-[#262a34] pt-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-white inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-red-400" />
                    Vehicle & Scheduled Repairs
                  </span>
                  <button
                    type="button"
                    onClick={handleLoadActiveIntoModal}
                    className="px-2.5 py-1 text-xs font-medium text-red-300 bg-red-600/15 hover:bg-red-600/25 rounded transition-colors cursor-pointer"
                  >
                    Sync Active Vehicle & Repair
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <input
                    type="text"
                    placeholder="Year"
                    value={editingAppt.vehicle.year}
                    onChange={(e) =>
                      setEditingAppt({
                        ...editingAppt,
                        vehicle: {
                          ...editingAppt.vehicle,
                          year: e.target.value,
                        },
                      })
                    }
                    className={`${inputClass} font-mono`}
                  />
                  <input
                    type="text"
                    placeholder="Make"
                    value={editingAppt.vehicle.make}
                    onChange={(e) =>
                      setEditingAppt({
                        ...editingAppt,
                        vehicle: {
                          ...editingAppt.vehicle,
                          make: e.target.value,
                        },
                      })
                    }
                    className={inputClass}
                  />
                  <input
                    type="text"
                    placeholder="Model"
                    value={editingAppt.vehicle.model}
                    onChange={(e) =>
                      setEditingAppt({
                        ...editingAppt,
                        vehicle: {
                          ...editingAppt.vehicle,
                          model: e.target.value,
                        },
                      })
                    }
                    className={inputClass}
                  />
                  <input
                    type="text"
                    placeholder="Engine"
                    value={editingAppt.vehicle.engine}
                    onChange={(e) =>
                      setEditingAppt({
                        ...editingAppt,
                        vehicle: {
                          ...editingAppt.vehicle,
                          engine: e.target.value,
                        },
                      })
                    }
                    className={inputClass}
                  />
                </div>

                {/* Repairs List */}
                <div className="space-y-2">
                  {editingAppt.repairs.map((rep, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 px-3 py-2 bg-[#1c1f26] border border-[#2c313d] rounded-lg text-xs"
                    >
                      <span className="font-medium text-white truncate">
                        {rep.title}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-slate-300 tabular-nums">
                          {formatHours(rep.laborHours)}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const nextRepairs = editingAppt.repairs.filter(
                              (_, i) => i !== idx
                            );
                            const sum = nextRepairs.reduce(
                              (s, r) => s + r.laborHours,
                              0
                            );
                            setEditingAppt({
                              ...editingAppt,
                              repairs: nextRepairs,
                              durationHours:
                                sum > 0
                                  ? Math.max(0.5, Number(sum.toFixed(1)))
                                  : editingAppt.durationHours,
                            });
                          }}
                          className="text-slate-400 hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add repair to appointment (e.g., Alternator replacement)"
                      value={newRepairInput}
                      onChange={(e) => setNewRepairInput(e.target.value)}
                      className={inputClass}
                    />
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={newRepairHours}
                      onChange={(e) => setNewRepairHours(e.target.value)}
                      className="w-20 h-10 px-2 bg-[#1c1f26] border border-[#2c313d] rounded-lg text-sm font-mono text-right text-slate-100 tabular-nums"
                      title="Hours"
                    />
                    <button
                      type="button"
                      onClick={handleAddRepairToModal}
                      className="px-3 h-10 text-xs font-semibold text-white bg-[#1c1f26] hover:bg-[#252932] border border-[#2c313d] rounded-lg shrink-0 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Dispatch Notes
                </label>
                <textarea
                  rows={2}
                  value={editingAppt.notes}
                  onChange={(e) =>
                    setEditingAppt({ ...editingAppt, notes: e.target.value })
                  }
                  placeholder="Gate code, parts to pick up, parking notes..."
                  className="w-full p-2.5 bg-[#1c1f26] border border-[#2c313d] rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <label className="inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveToCustomerDb}
                  onChange={(e) => setSaveToCustomerDb(e.target.checked)}
                  className="rounded border-[#2c313d] bg-[#1c1f26] text-red-600 focus:ring-red-600"
                />
                Save / update customer & vehicle in Customer Database
              </label>
            </div>

            <div className="px-5 py-4 border-t border-[#262a34] bg-[#101216] flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {appointments.some((a) => a.id === editingAppt.id) && (
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteAppointment(editingAppt.id);
                      setEditingAppt(null);
                    }}
                    className="h-9 px-3 inline-flex items-center gap-1 text-xs font-medium text-red-400 hover:text-red-300 bg-[#1c1f26] border border-[#2c313d] rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    onOpenInLaborGuide(
                      editingAppt.vehicle,
                      editingAppt.repairs[0]?.title,
                      editingAppt.repairs[0]?.systemCategory
                    );
                    setEditingAppt(null);
                  }}
                  className="h-9 px-3 inline-flex items-center gap-1 text-xs font-medium text-slate-200 bg-[#1c1f26] hover:bg-[#252932] border border-[#2c313d] rounded-lg cursor-pointer"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  Labor Guide
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSendToEstimate(editingAppt);
                    setEditingAppt(null);
                  }}
                  className="h-9 px-3 inline-flex items-center gap-1 text-xs font-medium text-slate-200 bg-[#1c1f26] hover:bg-[#252932] border border-[#2c313d] rounded-lg cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Estimate / Invoice
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingAppt(null)}
                  className="h-9 px-3 text-xs font-medium text-slate-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer"
                >
                  Save Appointment
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
