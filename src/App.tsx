import { useCallback, useEffect, useRef, useState } from 'react';
import { CustomerDatabaseView } from './components/CustomerDatabaseView';
import { EstimateBuilder } from './components/EstimateBuilder';
import { RepairCatalog } from './components/RepairCatalog';
import { RepairGuideView } from './components/RepairGuideView';
import { ScheduleView } from './components/ScheduleView';
import { ShopRatesView } from './components/ShopRatesView';
import { SideNav } from './components/SideNav';
import { VehicleSelector } from './components/VehicleSelector';
import type {
  AppTab,
  CustomerRecord,
  CustomerVehicle,
  EstimateLineItem,
  JobStatus,
  RepairGuide,
  RepairPart,
  SavedJob,
  ScheduledAppointment,
  ScheduledRepairItem,
  ShopRates,
  VehicleSelection,
} from './types/mechanic';
import {
  generateDocumentNumber,
  loadActiveVehicle,
  loadAppointments,
  loadCustomers,
  loadSavedJobs,
  loadShopRates,
  saveActiveVehicle,
  saveAppointments,
  saveCustomers,
  saveJobsList,
  saveShopRates,
  upsertCustomerWithVehicle,
} from './utils/storage';

function estimatePartsTotal(
  parts: RepairPart[],
  markupPercent: number
): number {
  let base = 0;
  for (const part of parts) {
    const matches = part.estimatedPriceRange.match(/\d+(?:\.\d+)?/g);
    if (matches && matches.length > 0) {
      const nums = matches.map(Number).filter((n) => !Number.isNaN(n));
      if (nums.length === 1) {
        base += nums[0];
      } else if (nums.length >= 2) {
        base += (nums[0] + nums[1]) / 2;
      }
    }
  }
  const withMarkup = base * (1 + markupPercent / 100);
  return Math.round(withMarkup);
}

function createEmptyJob(
  vehicle: VehicleSelection,
  rates: ShopRates
): SavedJob {
  const now = new Date().toISOString();
  return {
    id: `job_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    documentNumber: generateDocumentNumber('DOC'),
    createdAt: now,
    updatedAt: now,
    status: 'Draft',
    customerName: '',
    customerPhone: '',
    serviceAddress: '',
    vinOrPlate: '',
    odometer: '',
    vehicle,
    includeCalloutFee: true,
    calloutFee: rates.mobileCalloutFee,
    shopSuppliesPercent: rates.shopSuppliesPercent,
    taxRatePercent: rates.taxRatePercent,
    diagnosticCredit: 0,
    amountPaid: 0,
    paymentMethod: 'Unpaid',
    reAuthThreshold: 100,
    authorizedByName: '',
    authorizedAt: '',
    signatureDataUrl: undefined,
    lineItems: [],
    notes: '',
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('lookup');
  const [rates, setRates] = useState<ShopRates>(() => loadShopRates());
  const [vehicle, setVehicle] = useState<VehicleSelection>(() =>
    loadActiveVehicle()
  );
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>(() => loadSavedJobs());
  const [appointments, setAppointments] = useState<ScheduledAppointment[]>(() =>
    loadAppointments()
  );
  const [customers, setCustomers] = useState<CustomerRecord[]>(() =>
    loadCustomers()
  );

  const [activeJob, setActiveJob] = useState<SavedJob>(() =>
    createEmptyJob(loadActiveVehicle(), loadShopRates())
  );
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const [pendingScheduleDraft, setPendingScheduleDraft] = useState<{
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
  } | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>(
    'Brakes & Hydraulics'
  );
  const [selectedRepair, setSelectedRepair] = useState<string>(
    'Front Brake Pads & Rotors Replacement'
  );
  const [guide, setGuide] = useState<RepairGuide | null>(null);
  const [isLoadingGuide, setIsLoadingGuide] = useState<boolean>(false);
  const [guideError, setGuideError] = useState<string | null>(null);

  const lastQueryRef = useRef<{ repair: string; category: string }>({
    repair: 'Front Brake Pads & Rotors Replacement',
    category: 'Brakes & Hydraulics',
  });

  const handleVehicleChange = (next: VehicleSelection) => {
    setVehicle(next);
    saveActiveVehicle(next);
    if (activeJob.lineItems.length === 0) {
      setActiveJob((prev) => ({ ...prev, vehicle: next }));
    }
  };

  const handleLookupRepair = useCallback(
    async (
      repairQuery: string,
      systemCategory: string,
      overrideVehicle?: VehicleSelection
    ) => {
      const targetVehicle = overrideVehicle ?? vehicle;
      if (
        !targetVehicle.year ||
        !targetVehicle.make.trim() ||
        !targetVehicle.model.trim() ||
        !targetVehicle.engine.trim()
      ) {
        setGuideError(
          'Please select or enter a valid Year, Make, Model, and Engine Size before looking up a repair.'
        );
        return;
      }

      setSelectedRepair(repairQuery);
      setSelectedCategory(systemCategory);
      lastQueryRef.current = { repair: repairQuery, category: systemCategory };
      setIsLoadingGuide(true);
      setGuideError(null);

      try {
        const res = await fetch('/api/repair-guide', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            year: targetVehicle.year,
            make: targetVehicle.make.trim(),
            model: targetVehicle.model.trim(),
            engine: targetVehicle.engine.trim(),
            drivetrain: targetVehicle.drivetrain,
            transmission: targetVehicle.transmission,
            trim: targetVehicle.trim,
            repairQuery,
            systemCategory,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to look up repair guide.');
        }
        setGuide(data as RepairGuide);
      } catch (err: unknown) {
        setGuideError(
          err instanceof Error
            ? err.message
            : 'Unable to retrieve repair guide.'
        );
      } finally {
        setIsLoadingGuide(false);
      }
    },
    [vehicle]
  );

  const didInitialFetch = useRef(false);
  useEffect(() => {
    if (!didInitialFetch.current) {
      didInitialFetch.current = true;
      handleLookupRepair(
        'Front Brake Pads & Rotors Replacement',
        'Brakes & Hydraulics'
      );
    }
  }, [handleLookupRepair]);

  const handleSaveRates = (nextRates: ShopRates) => {
    setRates(nextRates);
    saveShopRates(nextRates);
    setActiveJob((prev) => ({
      ...prev,
      calloutFee: nextRates.mobileCalloutFee,
      shopSuppliesPercent: nextRates.shopSuppliesPercent,
      taxRatePercent: nextRates.taxRatePercent,
    }));
  };

  const handleAddToEstimate = (
    targetGuide: RepairGuide,
    multiplier: number
  ) => {
    const lineItem: EstimateLineItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      repairTitle: targetGuide.repairTitle,
      systemCategory: targetGuide.systemCategory,
      laborHours: targetGuide.bookLaborHours,
      hourlyRate: rates.hourlyRate,
      multiplier,
      partsCost: estimatePartsTotal(
        targetGuide.partsRequired,
        rates.partsMarkupPercent
      ),
    };

    setActiveJob((prev) => ({
      ...prev,
      vehicle: prev.lineItems.length === 0 ? vehicle : prev.vehicle,
      lineItems: [...prev.lineItems, lineItem],
    }));
  };

  const handleSaveActiveJob = () => {
    const now = new Date().toISOString();
    let linkedCustomerId = activeJob.customerId;

    // Auto-save customer & vehicle into Customer Database when customer name is entered
    if (activeJob.customerName.trim()) {
      const upserted = upsertCustomerWithVehicle(customers, {
        customerId: activeJob.customerId,
        name: activeJob.customerName,
        phone: activeJob.customerPhone,
        address: activeJob.serviceAddress,
        vehicle: activeJob.vehicle,
        vinOrPlate: activeJob.vinOrPlate,
        odometer: activeJob.odometer,
      });
      linkedCustomerId = upserted.customerId;
      setCustomers(upserted.list);
      saveCustomers(upserted.list);
    }

    const updatedJob: SavedJob = {
      ...activeJob,
      customerId: linkedCustomerId,
      updatedAt: now,
    };
    setActiveJob(updatedJob);
    setSavedJobs((prev) => {
      const exists = prev.some((j) => j.id === updatedJob.id);
      const next = exists
        ? prev.map((j) => (j.id === updatedJob.id ? updatedJob : j))
        : [updatedJob, ...prev];
      saveJobsList(next);
      return next;
    });
    setSaveToast('Job saved');
    setTimeout(() => setSaveToast(null), 2200);
  };

  const handleStartNewEstimate = () => {
    setActiveJob(createEmptyJob(vehicle, rates));
    setActiveTab('estimate');
  };

  const handleLoadSavedJob = (job: SavedJob) => {
    setActiveJob(job);
    setVehicle(job.vehicle);
    saveActiveVehicle(job.vehicle);
    setActiveTab('estimate');
  };

  const handleUpdateJobStatus = (jobId: string, status: JobStatus) => {
    setSavedJobs((prev) => {
      const next = prev.map((j) =>
        j.id === jobId
          ? { ...j, status, updatedAt: new Date().toISOString() }
          : j
      );
      saveJobsList(next);
      return next;
    });
    if (activeJob.id === jobId) {
      setActiveJob((prev) => ({ ...prev, status }));
    }
  };

  const handleDeleteSavedJob = (jobId: string) => {
    setSavedJobs((prev) => {
      const next = prev.filter((j) => j.id !== jobId);
      saveJobsList(next);
      return next;
    });
  };

  // Schedule Handlers
  const handleScheduleGuide = (
    targetGuide: RepairGuide,
    multiplier: number
  ) => {
    const hours = Number((targetGuide.bookLaborHours * multiplier).toFixed(1));
    setPendingScheduleDraft({
      vehicle,
      repairs: [
        {
          title: targetGuide.repairTitle,
          systemCategory: targetGuide.systemCategory,
          laborHours: hours,
          hourlyRate: rates.hourlyRate,
          partsCost: estimatePartsTotal(
            targetGuide.partsRequired,
            rates.partsMarkupPercent
          ),
        },
      ],
    });
    setActiveTab('schedule');
  };

  const handleScheduleFromJob = (job: SavedJob) => {
    setPendingScheduleDraft({
      customerId: job.customerId,
      customerName: job.customerName,
      customerPhone: job.customerPhone,
      serviceAddress: job.serviceAddress,
      vehicle: job.vehicle,
      vinOrPlate: job.vinOrPlate,
      repairs: job.lineItems.map((item) => ({
        title: item.repairTitle,
        systemCategory: item.systemCategory,
        laborHours: Number((item.laborHours * item.multiplier).toFixed(1)),
        hourlyRate: item.hourlyRate,
        partsCost: item.partsCost,
      })),
      notes: job.notes,
    });
    setActiveTab('schedule');
  };

  const handleSaveAppointment = (
    appt: ScheduledAppointment,
    saveToCustomerDb: boolean
  ) => {
    let linkedCustomerId = appt.customerId;
    if (saveToCustomerDb && appt.customerName.trim()) {
      const upserted = upsertCustomerWithVehicle(customers, {
        customerId: appt.customerId,
        name: appt.customerName,
        phone: appt.customerPhone,
        address: appt.serviceAddress,
        vehicle: appt.vehicle,
        vinOrPlate: appt.vinOrPlate,
      });
      linkedCustomerId = upserted.customerId;
      setCustomers(upserted.list);
      saveCustomers(upserted.list);
    }

    const finalAppt: ScheduledAppointment = {
      ...appt,
      customerId: linkedCustomerId,
    };

    setAppointments((prev) => {
      const exists = prev.some((a) => a.id === finalAppt.id);
      const next = exists
        ? prev.map((a) => (a.id === finalAppt.id ? finalAppt : a))
        : [...prev, finalAppt];
      saveAppointments(next);
      return next;
    });
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointments((prev) => {
      const next = prev.filter((a) => a.id !== id);
      saveAppointments(next);
      return next;
    });
  };

  const handleOpenInLaborGuide = (
    targetVehicle: VehicleSelection,
    repairTitle?: string,
    systemCategory?: string
  ) => {
    setVehicle(targetVehicle);
    saveActiveVehicle(targetVehicle);
    setActiveTab('lookup');
    if (repairTitle) {
      handleLookupRepair(
        repairTitle,
        systemCategory || 'General / Scheduled Repair',
        targetVehicle
      );
    }
  };

  const handleSendAppointmentToEstimate = (appt: ScheduledAppointment) => {
    const base = createEmptyJob(appt.vehicle, rates);
    const items: EstimateLineItem[] = appt.repairs.map((r, idx) => ({
      id: `item_${Date.now()}_${idx}`,
      repairTitle: r.title,
      systemCategory: r.systemCategory,
      laborHours: r.laborHours,
      hourlyRate: r.hourlyRate || rates.hourlyRate,
      multiplier: 1.0,
      partsCost: r.partsCost || 0,
    }));

    setVehicle(appt.vehicle);
    saveActiveVehicle(appt.vehicle);
    setActiveJob({
      ...base,
      customerId: appt.customerId,
      customerName: appt.customerName,
      customerPhone: appt.customerPhone,
      serviceAddress: appt.serviceAddress,
      vinOrPlate: appt.vinOrPlate || '',
      lineItems: items,
      notes: appt.notes,
    });
    setActiveTab('estimate');
  };

  // Customer Database Handlers
  const handleSaveCustomer = (customer: CustomerRecord) => {
    setCustomers((prev) => {
      const exists = prev.some((c) => c.id === customer.id);
      const next = exists
        ? prev.map((c) => (c.id === customer.id ? customer : c))
        : [customer, ...prev];
      saveCustomers(next);
      return next;
    });
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers((prev) => {
      const next = prev.filter((c) => c.id !== id);
      saveCustomers(next);
      return next;
    });
  };

  const handleCreateEstimateForCustomerVehicle = (
    customer: CustomerRecord,
    veh: CustomerVehicle
  ) => {
    const vehSel: VehicleSelection = {
      year: veh.year,
      make: veh.make,
      model: veh.model,
      engine: veh.engine,
      drivetrain: veh.drivetrain,
      transmission: veh.transmission,
      trim: veh.trim,
    };
    const empty = createEmptyJob(vehSel, rates);
    setVehicle(vehSel);
    saveActiveVehicle(vehSel);
    setActiveJob({
      ...empty,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      serviceAddress: customer.address,
      vinOrPlate: veh.vin || veh.licensePlate,
      odometer: veh.odometer,
    });
    setActiveTab('estimate');
  };

  const handleScheduleForCustomerVehicle = (
    customer: CustomerRecord,
    veh: CustomerVehicle
  ) => {
    const vehSel: VehicleSelection = {
      year: veh.year,
      make: veh.make,
      model: veh.model,
      engine: veh.engine,
      drivetrain: veh.drivetrain,
      transmission: veh.transmission,
      trim: veh.trim,
    };
    setPendingScheduleDraft({
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      serviceAddress: customer.address,
      vehicle: vehSel,
      vinOrPlate: veh.vin || veh.licensePlate,
      repairs: guide
        ? [
            {
              title: guide.repairTitle,
              systemCategory: guide.systemCategory,
              laborHours: guide.bookLaborHours,
              hourlyRate: rates.hourlyRate,
              partsCost: 0,
            },
          ]
        : [],
    });
    setActiveTab('schedule');
  };

  const activeVehicleLabel = [
    vehicle.year,
    vehicle.make,
    vehicle.model,
    vehicle.engine,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0b0c0f] text-slate-100">
      <SideNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        estimateCount={activeJob.lineItems.length}
        scheduleCount={appointments.length}
        customersCount={customers.length}
        businessName={rates.businessName}
        businessPhone={rates.mechanicPhone}
        hourlyRate={rates.hourlyRate}
        logoUrl={rates.logoDataUrl}
        activeVehicleLabel={activeVehicleLabel}
        onStartNewEstimate={handleStartNewEstimate}
      />

      <main className="flex-1 min-w-0 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {activeTab === 'lookup' && (
          <>
            <VehicleSelector
              vehicle={vehicle}
              onChange={handleVehicleChange}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-5 xl:col-span-4">
                <RepairCatalog
                  selectedCategory={selectedCategory}
                  selectedRepair={selectedRepair}
                  isLoading={isLoadingGuide}
                  onLookupRepair={(repair, cat) =>
                    handleLookupRepair(repair, cat)
                  }
                />
              </div>

              <div className="lg:col-span-7 xl:col-span-8">
                <RepairGuideView
                  vehicle={vehicle}
                  rates={rates}
                  guide={guide}
                  isLoading={isLoadingGuide}
                  error={guideError}
                  onRetry={() =>
                    handleLookupRepair(
                      lastQueryRef.current.repair,
                      lastQueryRef.current.category
                    )
                  }
                  onAddToEstimate={handleAddToEstimate}
                  onScheduleGuide={handleScheduleGuide}
                />
              </div>
            </div>
          </>
        )}

        {activeTab === 'schedule' && (
          <ScheduleView
            appointments={appointments}
            customers={customers}
            activeVehicle={vehicle}
            activeGuide={guide}
            rates={rates}
            pendingDraft={pendingScheduleDraft}
            onClearPendingDraft={() => setPendingScheduleDraft(null)}
            onSaveAppointment={handleSaveAppointment}
            onDeleteAppointment={handleDeleteAppointment}
            onOpenInLaborGuide={handleOpenInLaborGuide}
            onSendToEstimate={handleSendAppointmentToEstimate}
          />
        )}

        {activeTab === 'customers' && (
          <CustomerDatabaseView
            customers={customers}
            savedJobs={savedJobs}
            appointments={appointments}
            activeVehicle={vehicle}
            onSaveCustomer={handleSaveCustomer}
            onDeleteCustomer={handleDeleteCustomer}
            onLoadVehicleToGuide={(veh) => handleOpenInLaborGuide(veh)}
            onCreateEstimateForVehicle={handleCreateEstimateForCustomerVehicle}
            onScheduleForVehicle={handleScheduleForCustomerVehicle}
          />
        )}

        {activeTab === 'estimate' && (
          <EstimateBuilder
            job={activeJob}
            rates={rates}
            customers={customers}
            savedJobs={savedJobs}
            onUpdateJob={setActiveJob}
            onSaveJob={handleSaveActiveJob}
            onClearJob={() => setActiveJob(createEmptyJob(vehicle, rates))}
            onScheduleJob={handleScheduleFromJob}
            onLoadSavedJob={handleLoadSavedJob}
            onUpdateSavedJobStatus={handleUpdateJobStatus}
            onDeleteSavedJob={handleDeleteSavedJob}
            saveToast={saveToast}
          />
        )}

        {activeTab === 'rates' && (
          <ShopRatesView rates={rates} onSaveRates={handleSaveRates} />
        )}
      </main>
    </div>
  );
}
