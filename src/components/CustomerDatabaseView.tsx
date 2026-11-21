import { useMemo, useState } from 'react';
import {
  CalendarPlus,
  Car,
  FileText,
  Plus,
  Search,
  Trash2,
  UserPlus,
  Wrench,
  X,
} from 'lucide-react';
import {
  ALL_MAKES,
  COMMON_ENGINES,
  DRIVETRAIN_OPTIONS,
  getEnginesForMakeModel,
  getModelsForMake,
  TRANSMISSION_OPTIONS,
  VEHICLE_YEARS,
} from '../data/vehicles';
import type {
  CustomerRecord,
  CustomerVehicle,
  DrivetrainOption,
  SavedJob,
  ScheduledAppointment,
  TransmissionOption,
  VehicleSelection,
} from '../types/mechanic';
import {
  calculateEstimateTotals,
  formatCurrency,
  formatHourLabel,
} from '../utils/storage';

interface CustomerDatabaseViewProps {
  customers: CustomerRecord[];
  savedJobs: SavedJob[];
  appointments: ScheduledAppointment[];
  activeVehicle: VehicleSelection;
  onSaveCustomer: (customer: CustomerRecord) => void;
  onDeleteCustomer: (id: string) => void;
  onLoadVehicleToGuide: (vehicle: VehicleSelection) => void;
  onCreateEstimateForVehicle: (
    customer: CustomerRecord,
    vehicle: CustomerVehicle
  ) => void;
  onScheduleForVehicle: (
    customer: CustomerRecord,
    vehicle: CustomerVehicle
  ) => void;
}

export function CustomerDatabaseView({
  customers,
  savedJobs,
  appointments,
  activeVehicle,
  onSaveCustomer,
  onDeleteCustomer,
  onLoadVehicleToGuide,
  onCreateEstimateForVehicle,
  onScheduleForVehicle,
}: CustomerDatabaseViewProps) {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(
    customers[0]?.id ?? null
  );
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);

  // New Customer Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [includeActiveVehicle, setIncludeActiveVehicle] = useState(true);

  // Add/Edit Vehicle Form State
  const [vehDraft, setVehDraft] = useState<CustomerVehicle>(() => ({
    id: '',
    year: activeVehicle.year,
    make: activeVehicle.make,
    model: activeVehicle.model,
    engine: activeVehicle.engine,
    drivetrain: activeVehicle.drivetrain,
    transmission: activeVehicle.transmission,
    trim: activeVehicle.trim || '',
    vin: '',
    licensePlate: '',
    odometer: '',
    notes: '',
  }));

  const filteredCustomers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => {
      const haystack = [
        c.name,
        c.phone,
        c.email,
        c.address,
        ...c.vehicles.flatMap((v) => [
          v.year,
          v.make,
          v.model,
          v.engine,
          v.vin,
          v.licensePlate,
        ]),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [customers, search]);

  const selectedCustomer =
    customers.find((c) => c.id === selectedId) ?? filteredCustomers[0] ?? null;

  const customerJobs = useMemo(() => {
    if (!selectedCustomer) return [];
    return savedJobs.filter(
      (j) =>
        j.customerId === selectedCustomer.id ||
        (selectedCustomer.name &&
          j.customerName.toLowerCase() === selectedCustomer.name.toLowerCase())
    );
  }, [savedJobs, selectedCustomer]);

  const customerAppointments = useMemo(() => {
    if (!selectedCustomer) return [];
    return appointments.filter(
      (a) =>
        a.customerId === selectedCustomer.id ||
        (selectedCustomer.name &&
          a.customerName.toLowerCase() === selectedCustomer.name.toLowerCase())
    );
  }, [appointments, selectedCustomer]);

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const now = new Date().toISOString();
    const vehicles: CustomerVehicle[] = includeActiveVehicle
      ? [
          {
            id: `cveh_${Date.now()}`,
            year: activeVehicle.year,
            make: activeVehicle.make,
            model: activeVehicle.model,
            engine: activeVehicle.engine,
            drivetrain: activeVehicle.drivetrain,
            transmission: activeVehicle.transmission,
            trim: activeVehicle.trim,
            vin: '',
            licensePlate: '',
            odometer: '',
            notes: '',
          },
        ]
      : [];

    const created: CustomerRecord = {
      id: `cust_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: newName.trim(),
      phone: newPhone.trim(),
      email: newEmail.trim(),
      address: newAddress.trim(),
      notes: newNotes.trim(),
      vehicles,
      createdAt: now,
      updatedAt: now,
    };

    onSaveCustomer(created);
    setSelectedId(created.id);
    setShowNewCustomerModal(false);
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewAddress('');
    setNewNotes('');
  };

  const handleOpenAddVehicle = () => {
    setVehDraft({
      id: `cveh_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      year: activeVehicle.year,
      make: activeVehicle.make,
      model: activeVehicle.model,
      engine: activeVehicle.engine,
      drivetrain: activeVehicle.drivetrain,
      transmission: activeVehicle.transmission,
      trim: activeVehicle.trim || '',
      vin: '',
      licensePlate: '',
      odometer: '',
      notes: '',
    });
    setShowAddVehicleModal(true);
  };

  const handleSaveVehicleToCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    const exists = selectedCustomer.vehicles.some((v) => v.id === vehDraft.id);
    const nextVehicles = exists
      ? selectedCustomer.vehicles.map((v) =>
          v.id === vehDraft.id ? vehDraft : v
        )
      : [...selectedCustomer.vehicles, vehDraft];
    onSaveCustomer({
      ...selectedCustomer,
      vehicles: nextVehicles,
      updatedAt: new Date().toISOString(),
    });
    setShowAddVehicleModal(false);
  };

  const handleRemoveVehicle = (vehicleId: string) => {
    if (!selectedCustomer) return;
    onSaveCustomer({
      ...selectedCustomer,
      vehicles: selectedCustomer.vehicles.filter((v) => v.id !== vehicleId),
      updatedAt: new Date().toISOString(),
    });
  };

  const modelsForDraftMake = getModelsForMake(vehDraft.make);
  const enginesForDraft = getEnginesForMakeModel(vehDraft.make, vehDraft.model);
  const inputClass =
    'w-full h-10 px-3 bg-[#1c1f26] border border-[#2c313d] rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-600/20';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-bold text-white">
            Customer & Vehicle Database
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Store customer contact details, VINs, multi-vehicle garages, and service history.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowNewCustomerModal(true)}
          className="h-10 px-4 inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {/* Master-Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Directory */}
        <aside className="lg:col-span-4 bg-[#14161b] border border-[#262a34] rounded-xl overflow-hidden">
          <div className="p-3.5 border-b border-[#262a34]">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, phone, VIN, plate, vehicle..."
                className="w-full h-10 pl-9 pr-3 bg-[#1c1f26] border border-[#2c313d] rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {filteredCustomers.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <p className="text-sm font-semibold text-white">
                {customers.length === 0
                  ? 'No customers saved yet'
                  : 'No matching customers'}
              </p>
              <p className="text-xs text-slate-400">
                {customers.length === 0
                  ? 'Add a customer profile or save directly from an estimate or scheduled job.'
                  : 'Try searching by a different name, phone, VIN, or vehicle.'}
              </p>
              {customers.length === 0 && (
                <button
                  type="button"
                  onClick={() => setShowNewCustomerModal(true)}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer"
                >
                  + Add First Customer
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-[#262a34] max-h-[620px] overflow-y-auto">
              {filteredCustomers.map((cust) => {
                const isActive = selectedCustomer?.id === cust.id;
                return (
                  <button
                    key={cust.id}
                    type="button"
                    onClick={() => setSelectedId(cust.id)}
                    className={`w-full px-4 py-3.5 text-left transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-red-600/15'
                        : 'bg-[#14161b] hover:bg-[#1c1f26]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-sm font-semibold text-white truncate">
                        {cust.name}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400 tabular-nums shrink-0">
                        {cust.vehicles.length}{' '}
                        {cust.vehicles.length === 1 ? 'veh' : 'vehs'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      {cust.phone || cust.address || 'No contact info'}
                    </p>
                    {cust.vehicles[0] && (
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {cust.vehicles[0].year} {cust.vehicles[0].make}{' '}
                        {cust.vehicles[0].model}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        {/* Right Customer Profile & Vehicles */}
        <section className="lg:col-span-8 space-y-6">
          {!selectedCustomer ? (
            <div className="bg-[#14161b] border border-[#262a34] rounded-xl p-10 text-center">
              <p className="font-display text-base font-semibold text-white">
                Select or Add a Customer
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Customer profiles store contact info, service addresses, all owned vehicles, VINs, and full repair history.
              </p>
            </div>
          ) : (
            <>
              {/* Profile Details */}
              <div className="bg-[#14161b] border border-[#262a34] rounded-xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-display text-base font-bold text-white">
                    {selectedCustomer.name}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteCustomer(selectedCustomer.id);
                      setSelectedId(null);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-red-400 bg-[#1c1f26] border border-[#2c313d] rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Profile
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={selectedCustomer.name}
                      onChange={(e) =>
                        onSaveCustomer({
                          ...selectedCustomer,
                          name: e.target.value,
                          updatedAt: new Date().toISOString(),
                        })
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
                      value={selectedCustomer.phone}
                      onChange={(e) =>
                        onSaveCustomer({
                          ...selectedCustomer,
                          phone: e.target.value,
                          updatedAt: new Date().toISOString(),
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={selectedCustomer.email}
                      onChange={(e) =>
                        onSaveCustomer({
                          ...selectedCustomer,
                          email: e.target.value,
                          updatedAt: new Date().toISOString(),
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Default Service Address
                    </label>
                    <input
                      type="text"
                      value={selectedCustomer.address}
                      onChange={(e) =>
                        onSaveCustomer({
                          ...selectedCustomer,
                          address: e.target.value,
                          updatedAt: new Date().toISOString(),
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Customer Notes
                    </label>
                    <input
                      type="text"
                      placeholder="Gate codes, billing preferences, fleet notes..."
                      value={selectedCustomer.notes}
                      onChange={(e) =>
                        onSaveCustomer({
                          ...selectedCustomer,
                          notes: e.target.value,
                          updatedAt: new Date().toISOString(),
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Vehicles Garage */}
              <div className="bg-[#14161b] border border-[#262a34] rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-red-500" />
                    <h3 className="font-display text-sm font-semibold text-white">
                      Registered Vehicles ({selectedCustomer.vehicles.length})
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAddVehicle}
                    className="px-3 py-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Vehicle
                  </button>
                </div>

                {selectedCustomer.vehicles.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center border border-dashed border-[#262a34] rounded-lg">
                    No vehicles recorded for this customer yet.
                  </p>
                ) : (
                  <div className="divide-y divide-[#262a34] border border-[#262a34] rounded-lg overflow-hidden">
                    {selectedCustomer.vehicles.map((veh) => (
                      <div
                        key={veh.id}
                        className="p-4 bg-[#14161b] flex flex-col md:flex-row md:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <p className="font-display text-sm font-semibold text-white">
                            {veh.year} {veh.make} {veh.model}{' '}
                            {veh.trim ? veh.trim : ''}
                          </p>
                          <p className="text-xs text-slate-300">
                            {veh.engine} · {veh.drivetrain} · {veh.transmission}
                          </p>
                          <p className="font-mono text-[11px] text-slate-400">
                            VIN: {veh.vin || 'N/A'} · Plate:{' '}
                            {veh.licensePlate || 'N/A'} · Odometer:{' '}
                            {veh.odometer || 'N/A'}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              onLoadVehicleToGuide({
                                year: veh.year,
                                make: veh.make,
                                model: veh.model,
                                engine: veh.engine,
                                drivetrain: veh.drivetrain,
                                transmission: veh.transmission,
                                trim: veh.trim,
                              })
                            }
                            className="px-2.5 py-1.5 inline-flex items-center gap-1 text-xs font-medium text-slate-200 bg-[#1c1f26] hover:bg-[#252932] border border-[#2c313d] rounded-md cursor-pointer"
                          >
                            <Wrench className="w-3.5 h-3.5 text-red-400" />
                            Labor Guide
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onScheduleForVehicle(selectedCustomer, veh)
                            }
                            className="px-2.5 py-1.5 inline-flex items-center gap-1 text-xs font-medium text-slate-200 bg-[#1c1f26] hover:bg-[#252932] border border-[#2c313d] rounded-md cursor-pointer"
                          >
                            <CalendarPlus className="w-3.5 h-3.5 text-amber-400" />
                            Schedule
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onCreateEstimateForVehicle(selectedCustomer, veh)
                            }
                            className="px-2.5 py-1.5 inline-flex items-center gap-1 text-xs font-medium text-slate-200 bg-[#1c1f26] hover:bg-[#252932] border border-[#2c313d] rounded-md cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-emerald-400" />
                            Estimate
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setVehDraft(veh);
                              setShowAddVehicleModal(true);
                            }}
                            className="px-2 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveVehicle(veh.id)}
                            aria-label="Remove vehicle"
                            className="p-1.5 text-slate-500 hover:text-red-400 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Service & Schedule History */}
              <div className="bg-[#14161b] border border-[#262a34] rounded-xl p-5 space-y-4">
                <h3 className="font-display text-sm font-semibold text-white">
                  Service, Estimate & Schedule History
                </h3>

                {customerJobs.length === 0 &&
                customerAppointments.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    No estimates, invoices, or appointments recorded for this customer yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {customerAppointments.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-slate-400">
                          Scheduled Appointments ({customerAppointments.length})
                        </p>
                        <div className="divide-y divide-[#262a34] border border-[#262a34] rounded-lg">
                          {customerAppointments.map((a) => (
                            <div
                              key={a.id}
                              className="px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs"
                            >
                              <div>
                                <span className="font-mono font-semibold text-white">
                                  {a.date} @ {formatHourLabel(a.startHour)}
                                </span>
                                <span className="mx-2 text-slate-600">·</span>
                                <span className="text-slate-300">
                                  {a.vehicle.year} {a.vehicle.make}{' '}
                                  {a.vehicle.model}
                                </span>
                              </div>
                              <span className="text-slate-400">{a.status}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {customerJobs.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-slate-400">
                          Estimates & Invoices ({customerJobs.length})
                        </p>
                        <div className="divide-y divide-[#262a34] border border-[#262a34] rounded-lg">
                          {customerJobs.map((j) => {
                            const totals = calculateEstimateTotals(
                              j.lineItems,
                              j.includeCalloutFee,
                              j.calloutFee,
                              j.shopSuppliesPercent,
                              j.taxRatePercent,
                              j.diagnosticCredit,
                              j.amountPaid
                            );
                            return (
                              <div
                                key={j.id}
                                className="px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs"
                              >
                                <div className="min-w-0">
                                  <span className="font-mono text-slate-300">
                                    {j.documentNumber}
                                  </span>
                                  <span className="mx-2 text-slate-600">·</span>
                                  <span className="text-white font-medium">
                                    {j.vehicle.year} {j.vehicle.make}{' '}
                                    {j.vehicle.model}
                                  </span>
                                  <span className="mx-2 text-slate-600">·</span>
                                  <span className="text-slate-400">
                                    {j.status}
                                  </span>
                                </div>
                                <span className="font-mono font-semibold text-white tabular-nums shrink-0">
                                  {formatCurrency(totals.grandTotal)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>

      {/* ADD CUSTOMER MODAL */}
      {showNewCustomerModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleCreateCustomer}
            className="bg-[#14161b] border border-[#2c313d] rounded-xl w-full max-w-md overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-[#262a34] flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-white">
                Add New Customer
              </h2>
              <button
                type="button"
                onClick={() => setShowNewCustomerModal(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Jordan Alvarez"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="(913) 555-0148"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="customer@email.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Service Address
                </label>
                <input
                  type="text"
                  placeholder="1234 Oak St, Kansas City, KS"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  placeholder="Optional"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className={inputClass}
                />
              </div>
              <label className="inline-flex items-center gap-2 text-xs text-slate-300 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeActiveVehicle}
                  onChange={(e) => setIncludeActiveVehicle(e.target.checked)}
                  className="rounded border-[#2c313d] bg-[#1c1f26] text-red-600 focus:ring-red-600"
                />
                Attach active vehicle ({activeVehicle.year}{' '}
                {activeVehicle.make} {activeVehicle.model})
              </label>
            </div>

            <div className="px-5 py-3.5 border-t border-[#262a34] bg-[#101216] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewCustomerModal(false)}
                className="h-9 px-3 text-xs font-medium text-slate-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-9 px-4 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer"
              >
                Save Customer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADD / EDIT VEHICLE MODAL */}
      {showAddVehicleModal && selectedCustomer && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleSaveVehicleToCustomer}
            className="bg-[#14161b] border border-[#2c313d] rounded-xl w-full max-w-lg overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-[#262a34] flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-white">
                Vehicle Details — {selectedCustomer.name}
              </h2>
              <button
                type="button"
                onClick={() => setShowAddVehicleModal(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Year
                  </label>
                  <select
                    value={vehDraft.year}
                    onChange={(e) =>
                      setVehDraft({ ...vehDraft, year: e.target.value })
                    }
                    className={`${inputClass} font-mono`}
                  >
                    {VEHICLE_YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Make
                  </label>
                  <select
                    value={
                      ALL_MAKES.includes(vehDraft.make) ? vehDraft.make : ''
                    }
                    onChange={(e) => {
                      const nextMake = e.target.value;
                      const mList = getModelsForMake(nextMake);
                      setVehDraft({
                        ...vehDraft,
                        make: nextMake,
                        model: mList[0]?.name || '',
                        engine: mList[0]?.engines[0] || COMMON_ENGINES[4],
                      });
                    }}
                    className={inputClass}
                  >
                    {ALL_MAKES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Model
                  </label>
                  {modelsForDraftMake.length > 0 ? (
                    <select
                      value={
                        modelsForDraftMake.some(
                          (m) => m.name === vehDraft.model
                        )
                          ? vehDraft.model
                          : modelsForDraftMake[0].name
                      }
                      onChange={(e) => {
                        const found = modelsForDraftMake.find(
                          (m) => m.name === e.target.value
                        );
                        setVehDraft({
                          ...vehDraft,
                          model: e.target.value,
                          engine: found?.engines[0] || vehDraft.engine,
                        });
                      }}
                      className={inputClass}
                    >
                      {modelsForDraftMake.map((m) => (
                        <option key={m.name} value={m.name}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={vehDraft.model}
                      onChange={(e) =>
                        setVehDraft({ ...vehDraft, model: e.target.value })
                      }
                      className={inputClass}
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Engine Size
                  </label>
                  <select
                    value={
                      enginesForDraft.includes(vehDraft.engine)
                        ? vehDraft.engine
                        : enginesForDraft[0] || COMMON_ENGINES[4]
                    }
                    onChange={(e) =>
                      setVehDraft({ ...vehDraft, engine: e.target.value })
                    }
                    className={inputClass}
                  >
                    {enginesForDraft.map((eng) => (
                      <option key={eng} value={eng}>
                        {eng}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Drivetrain
                  </label>
                  <select
                    value={vehDraft.drivetrain}
                    onChange={(e) =>
                      setVehDraft({
                        ...vehDraft,
                        drivetrain: e.target.value as DrivetrainOption,
                      })
                    }
                    className={inputClass}
                  >
                    {DRIVETRAIN_OPTIONS.map((dt) => (
                      <option key={dt} value={dt}>
                        {dt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Transmission
                  </label>
                  <select
                    value={vehDraft.transmission}
                    onChange={(e) =>
                      setVehDraft({
                        ...vehDraft,
                        transmission: e.target.value as TransmissionOption,
                      })
                    }
                    className={inputClass}
                  >
                    {TRANSMISSION_OPTIONS.map((tr) => (
                      <option key={tr} value={tr}>
                        {tr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    VIN
                  </label>
                  <input
                    type="text"
                    placeholder="17-char VIN"
                    value={vehDraft.vin}
                    onChange={(e) =>
                      setVehDraft({
                        ...vehDraft,
                        vin: e.target.value.toUpperCase(),
                      })
                    }
                    className={`${inputClass} font-mono uppercase`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    License Plate
                  </label>
                  <input
                    type="text"
                    placeholder="Plate #"
                    value={vehDraft.licensePlate}
                    onChange={(e) =>
                      setVehDraft({
                        ...vehDraft,
                        licensePlate: e.target.value.toUpperCase(),
                      })
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
                    placeholder="e.g., 92,400"
                    value={vehDraft.odometer}
                    onChange={(e) =>
                      setVehDraft({ ...vehDraft, odometer: e.target.value })
                    }
                    className={`${inputClass} font-mono`}
                  />
                </div>
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-[#262a34] bg-[#101216] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddVehicleModal(false)}
                className="h-9 px-3 text-xs font-medium text-slate-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-9 px-4 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer"
              >
                Save Vehicle
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
