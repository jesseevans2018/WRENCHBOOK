import type {
  CustomerRecord,
  CustomerVehicle,
  EstimateLineItem,
  SavedJob,
  ScheduledAppointment,
  ShopRates,
  VehicleSelection,
} from '../types/mechanic';

const RATES_KEY = 'wrenchbook_shop_rates_v2';
const LEGACY_RATES_KEY = 'wrenchbook_shop_rates_v1';
const JOBS_KEY = 'wrenchbook_saved_jobs_v1';
const ACTIVE_VEHICLE_KEY = 'wrenchbook_active_vehicle_v1';
const APPOINTMENTS_KEY = 'wrenchbook_appointments_v1';
const CUSTOMERS_KEY = 'wrenchbook_customers_v1';

export const DEFAULT_LOGO_PATH =
  '/assets/aistudio/file_0000000061b881f9bea9b0749f6c485a_cc30fdb9.png';

export const DEFAULT_SHOP_RATES: ShopRates = {
  businessName: 'Dependable On Site Auto Repair',
  mechanicPhone: '(913) 308-4196',
  businessEmail: 'service@dependableonsite.com',
  businessAddress: '24/7 Mobile Service — Kansas City & Surrounding Areas',
  warrantyTerms:
    '12 Months / 12,000 Miles limited warranty on shop-supplied parts and labor. Customer-supplied parts carry no warranty.',
  logoDataUrl: undefined,
  hourlyRate: 125,
  mobileCalloutFee: 45,
  diagnosticFee: 95,
  partsMarkupPercent: 15,
  shopSuppliesPercent: 5,
  taxRatePercent: 8.25,
};

export const DEFAULT_VEHICLE: VehicleSelection = {
  year: '2019',
  make: 'Ford',
  model: 'F-150',
  engine: '3.5L V6 EcoBoost',
  drivetrain: '4WD',
  transmission: 'Automatic',
  trim: 'XLT',
};

export function generateDocumentNumber(prefix = 'DOC'): string {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${y}${m}${d}-${rand}`;
}

export function loadShopRates(): ShopRates {
  try {
    const raw = localStorage.getItem(RATES_KEY);
    if (raw) {
      return { ...DEFAULT_SHOP_RATES, ...JSON.parse(raw) };
    }
    const legacy = localStorage.getItem(LEGACY_RATES_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy);
      const migrated: ShopRates = {
        ...DEFAULT_SHOP_RATES,
        ...parsed,
        businessName:
          !parsed.businessName || parsed.businessName === 'Apex Mobile Auto Repair'
            ? DEFAULT_SHOP_RATES.businessName
            : parsed.businessName,
        mechanicPhone:
          !parsed.mechanicPhone || parsed.mechanicPhone === '(555) 234-8910'
            ? DEFAULT_SHOP_RATES.mechanicPhone
            : parsed.mechanicPhone,
      };
      return migrated;
    }
    return DEFAULT_SHOP_RATES;
  } catch {
    return DEFAULT_SHOP_RATES;
  }
}

export function saveShopRates(rates: ShopRates): void {
  try {
    localStorage.setItem(RATES_KEY, JSON.stringify(rates));
  } catch {
    // ignore storage quota errors
  }
}

export function normalizeSavedJob(raw: Partial<SavedJob>): SavedJob {
  return {
    id: raw.id || `job_${Date.now()}`,
    documentNumber: raw.documentNumber || generateDocumentNumber('WB'),
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
    status: raw.status || 'Draft',
    customerId: raw.customerId,
    customerName: raw.customerName || '',
    customerPhone: raw.customerPhone || '',
    serviceAddress: raw.serviceAddress || '',
    vinOrPlate: raw.vinOrPlate || '',
    odometer: raw.odometer || '',
    vehicle: raw.vehicle || DEFAULT_VEHICLE,
    includeCalloutFee: raw.includeCalloutFee ?? true,
    calloutFee: raw.calloutFee ?? DEFAULT_SHOP_RATES.mobileCalloutFee,
    shopSuppliesPercent:
      raw.shopSuppliesPercent ?? DEFAULT_SHOP_RATES.shopSuppliesPercent,
    taxRatePercent: raw.taxRatePercent ?? DEFAULT_SHOP_RATES.taxRatePercent,
    diagnosticCredit: raw.diagnosticCredit ?? 0,
    amountPaid: raw.amountPaid ?? 0,
    paymentMethod: raw.paymentMethod || 'Unpaid',
    reAuthThreshold: raw.reAuthThreshold ?? 100,
    authorizedByName: raw.authorizedByName || '',
    authorizedAt: raw.authorizedAt || '',
    signatureDataUrl: raw.signatureDataUrl,
    lineItems: Array.isArray(raw.lineItems) ? raw.lineItems : [],
    notes: raw.notes || '',
  };
}

export function loadSavedJobs(): SavedJob[] {
  try {
    const raw = localStorage.getItem(JOBS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeSavedJob) : [];
  } catch {
    return [];
  }
}

export function saveJobsList(jobs: SavedJob[]): void {
  try {
    localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
  } catch {
    // ignore storage quota errors
  }
}

export function loadActiveVehicle(): VehicleSelection {
  try {
    const raw = localStorage.getItem(ACTIVE_VEHICLE_KEY);
    if (!raw) return DEFAULT_VEHICLE;
    return { ...DEFAULT_VEHICLE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_VEHICLE;
  }
}

export function saveActiveVehicle(vehicle: VehicleSelection): void {
  try {
    localStorage.setItem(ACTIVE_VEHICLE_KEY, JSON.stringify(vehicle));
  } catch {
    // ignore
  }
}

export function loadAppointments(): ScheduledAppointment[] {
  try {
    const raw = localStorage.getItem(APPOINTMENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveAppointments(list: ScheduledAppointment[]): void {
  try {
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export function loadCustomers(): CustomerRecord[] {
  try {
    const raw = localStorage.getItem(CUSTOMERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomers(list: CustomerRecord[]): void {
  try {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export function upsertCustomerWithVehicle(
  existing: CustomerRecord[],
  payload: {
    customerId?: string;
    name: string;
    phone: string;
    email?: string;
    address: string;
    vehicle: VehicleSelection;
    vinOrPlate?: string;
    odometer?: string;
  }
): { list: CustomerRecord[]; customerId: string } {
  const cleanName = payload.name.trim();
  const cleanPhone = payload.phone.trim();
  const now = new Date().toISOString();

  const matchIdx = existing.findIndex(
    (c) =>
      (payload.customerId && c.id === payload.customerId) ||
      (cleanName &&
        c.name.toLowerCase() === cleanName.toLowerCase() &&
        (!cleanPhone || c.phone === cleanPhone))
  );

  const makeVehicleObj = (): CustomerVehicle => ({
    id: `cveh_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    year: payload.vehicle.year,
    make: payload.vehicle.make,
    model: payload.vehicle.model,
    engine: payload.vehicle.engine,
    drivetrain: payload.vehicle.drivetrain,
    transmission: payload.vehicle.transmission,
    trim: payload.vehicle.trim,
    vin:
      payload.vinOrPlate && payload.vinOrPlate.length > 10
        ? payload.vinOrPlate.toUpperCase()
        : '',
    licensePlate:
      payload.vinOrPlate && payload.vinOrPlate.length <= 10
        ? payload.vinOrPlate.toUpperCase()
        : '',
    odometer: payload.odometer || '',
    notes: '',
  });

  if (matchIdx >= 0) {
    const target = existing[matchIdx];
    const hasVehicle = target.vehicles.some(
      (v) =>
        v.year === payload.vehicle.year &&
        v.make.toLowerCase() === payload.vehicle.make.toLowerCase() &&
        v.model.toLowerCase() === payload.vehicle.model.toLowerCase() &&
        v.engine.toLowerCase() === payload.vehicle.engine.toLowerCase()
    );
    const updatedCustomer: CustomerRecord = {
      ...target,
      phone: cleanPhone || target.phone,
      address: payload.address || target.address,
      email: payload.email || target.email,
      vehicles: hasVehicle ? target.vehicles : [...target.vehicles, makeVehicleObj()],
      updatedAt: now,
    };
    const nextList = existing.map((c, idx) =>
      idx === matchIdx ? updatedCustomer : c
    );
    return { list: nextList, customerId: updatedCustomer.id };
  }

  const newCustomer: CustomerRecord = {
    id: `cust_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: cleanName || 'New Customer',
    phone: cleanPhone,
    email: payload.email || '',
    address: payload.address,
    notes: '',
    vehicles: [makeVehicleObj()],
    createdAt: now,
    updatedAt: now,
  };
  return { list: [newCustomer, ...existing], customerId: newCustomer.id };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatHours(hours: number): string {
  const safe = Number.isFinite(hours) ? hours : 0;
  return `${safe.toFixed(1)} hrs`;
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function formatHourLabel(hourDecimal: number): string {
  const totalMinutes = Math.round(hourDecimal * 60);
  const h24 = Math.floor(totalMinutes / 60) % 24;
  const mins = totalMinutes % 60;
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(mins).padStart(2, '0')} ${period}`;
}

export function calculateEstimateTotals(
  lineItems: EstimateLineItem[],
  includeCalloutFee: boolean,
  calloutFee: number,
  shopSuppliesPercent: number,
  taxRatePercent: number,
  diagnosticCredit = 0,
  amountPaid = 0
) {
  let laborSubtotal = 0;
  let partsSubtotal = 0;

  for (const item of lineItems) {
    laborSubtotal += item.laborHours * item.hourlyRate * item.multiplier;
    partsSubtotal += item.partsCost;
  }

  const calloutTotal = includeCalloutFee ? calloutFee : 0;
  const shopSupplies =
    (laborSubtotal + partsSubtotal) * (shopSuppliesPercent / 100);
  const taxableAmount = partsSubtotal + shopSupplies;
  const taxTotal = taxableAmount * (taxRatePercent / 100);
  const subtotalBeforeCredits =
    laborSubtotal + partsSubtotal + calloutTotal + shopSupplies + taxTotal;
  const grandTotal = Math.max(0, subtotalBeforeCredits - diagnosticCredit);
  const balanceDue = Math.max(0, grandTotal - amountPaid);

  return {
    laborSubtotal,
    partsSubtotal,
    calloutTotal,
    shopSupplies,
    taxTotal,
    subtotalBeforeCredits,
    diagnosticCredit,
    grandTotal,
    amountPaid,
    balanceDue,
  };
}
