export type AppTab = 'lookup' | 'schedule' | 'customers' | 'estimate' | 'rates';

export type DocumentType = 'estimate' | 'authorization' | 'invoice';

export type ScheduleViewMode = 'daily' | 'weekly' | 'monthly';

export type AppointmentStatus =
  | 'Scheduled'
  | 'En Route'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled';

export type PaymentMethod =
  | 'Unpaid'
  | 'Cash'
  | 'Credit / Debit Card'
  | 'Zelle / Venmo'
  | 'Check'
  | 'Fleet Account';

export type DrivetrainOption = 'FWD' | 'RWD' | 'AWD' | '4WD' | 'Other';
export type TransmissionOption =
  | 'Automatic'
  | 'Manual'
  | 'CVT'
  | 'Dual-Clutch (DCT)'
  | 'EV Single-Speed';

export interface VehicleSelection {
  year: string;
  make: string;
  model: string;
  engine: string;
  drivetrain: DrivetrainOption;
  transmission: TransmissionOption;
  trim?: string;
}

export interface ShopRates {
  businessName: string;
  mechanicPhone: string;
  businessEmail: string;
  businessAddress: string;
  warrantyTerms: string;
  logoDataUrl?: string;
  hourlyRate: number;
  mobileCalloutFee: number;
  diagnosticFee: number;
  partsMarkupPercent: number;
  shopSuppliesPercent: number;
  taxRatePercent: number;
}

export interface RepairPart {
  name: string;
  qty: string;
  estimatedPriceRange: string;
  notes: string;
}

export interface TorqueSpec {
  fastener: string;
  spec: string;
}

export interface RepairStep {
  stepNumber: number;
  title: string;
  instruction: string;
  torqueSpec?: string;
  proTip?: string;
}

export type DifficultyLevel = 'Routine' | 'Moderate' | 'Advanced' | 'Master Tech';
export type MobileFeasibility =
  | 'Ideal Mobile Job'
  | 'Driveway Ready (Jack Stands)'
  | 'Shop Lift Recommended';

export interface RepairGuide {
  repairTitle: string;
  systemCategory: string;
  vehicleLabel: string;
  bookLaborHours: number;
  laborRangeHours: {
    min: number;
    max: number;
  };
  difficulty: DifficultyLevel;
  mobileFeasibility: MobileFeasibility;
  mobileFeasibilityNote: string;
  fluidCapacities?: string[];
  safetyWarnings: string[];
  toolsRequired: string[];
  partsRequired: RepairPart[];
  torqueSpecs: TorqueSpec[];
  steps: RepairStep[];
  generatedAt: string;
}

export interface EstimateLineItem {
  id: string;
  repairTitle: string;
  systemCategory: string;
  laborHours: number;
  hourlyRate: number;
  multiplier: number;
  partsCost: number;
  notes?: string;
}

export type JobStatus = 'Draft' | 'Quoted' | 'In Progress' | 'Completed';

export interface SavedJob {
  id: string;
  documentNumber: string;
  createdAt: string;
  updatedAt: string;
  status: JobStatus;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  serviceAddress: string;
  vinOrPlate: string;
  odometer: string;
  vehicle: VehicleSelection;
  includeCalloutFee: boolean;
  calloutFee: number;
  shopSuppliesPercent: number;
  taxRatePercent: number;
  diagnosticCredit: number;
  amountPaid: number;
  paymentMethod: PaymentMethod;
  reAuthThreshold: number;
  authorizedByName: string;
  authorizedAt: string;
  signatureDataUrl?: string;
  lineItems: EstimateLineItem[];
  notes: string;
}

export interface ScheduledRepairItem {
  title: string;
  systemCategory: string;
  laborHours: number;
  hourlyRate: number;
  partsCost: number;
}

export interface ScheduledAppointment {
  id: string;
  date: string; // YYYY-MM-DD
  startHour: number; // e.g., 9 or 9.5 for 9:30 AM
  durationHours: number; // e.g., 1.5
  status: AppointmentStatus;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  serviceAddress: string;
  vehicle: VehicleSelection;
  vinOrPlate?: string;
  repairs: ScheduledRepairItem[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerVehicle {
  id: string;
  year: string;
  make: string;
  model: string;
  engine: string;
  drivetrain: DrivetrainOption;
  transmission: TransmissionOption;
  trim?: string;
  vin: string;
  licensePlate: string;
  odometer: string;
  notes: string;
}

export interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  vehicles: CustomerVehicle[];
  createdAt: string;
  updatedAt: string;
}
