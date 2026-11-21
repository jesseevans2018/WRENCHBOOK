import type { DrivetrainOption, TransmissionOption } from '../types/mechanic';

export interface ModelSpec {
  name: string;
  engines: string[];
  drivetrains?: DrivetrainOption[];
  transmissions?: TransmissionOption[];
}

export interface MakeCatalog {
  make: string;
  models: ModelSpec[];
}

export const VEHICLE_YEARS: string[] = Array.from(
  { length: 2026 - 1980 + 1 },
  (_, i) => String(2026 - i)
);

export const DRIVETRAIN_OPTIONS: DrivetrainOption[] = [
  'FWD',
  'RWD',
  'AWD',
  '4WD',
  'Other',
];

export const TRANSMISSION_OPTIONS: TransmissionOption[] = [
  'Automatic',
  'Manual',
  'CVT',
  'Dual-Clutch (DCT)',
  'EV Single-Speed',
];

export const COMMON_ENGINES: string[] = [
  '1.4L I4 Turbo',
  '1.5L I4 Turbo',
  '1.6L I4',
  '1.8L I4',
  '2.0L I4',
  '2.0L I4 Turbo',
  '2.4L I4',
  '2.5L I4',
  '2.5L H4 (Boxer)',
  '2.7L V6 Turbo',
  '3.0L I6 Turbo',
  '3.0L V6',
  '3.3L V6',
  '3.5L V6',
  '3.5L V6 EcoBoost / Twin-Turbo',
  '3.6L V6',
  '3.8L V6',
  '4.0L V6',
  '4.6L V8',
  '5.0L V8',
  '5.3L V8',
  '5.7L V8',
  '6.0L V8',
  '6.2L V8',
  '6.6L V8 Duramax Diesel',
  '6.7L I6 Cummins Diesel',
  '6.7L V8 Power Stroke Diesel',
  'Electric Motor (Single / Dual)',
];

export const VEHICLE_CATALOG: MakeCatalog[] = [
  {
    make: 'Acura',
    models: [
      { name: 'ILX', engines: ['2.0L I4', '2.4L I4'], drivetrains: ['FWD'] },
      { name: 'Integra', engines: ['1.5L I4 Turbo', '2.0L I4 Turbo (Type S)', '1.8L I4'], drivetrains: ['FWD'] },
      { name: 'MDX', engines: ['3.5L V6', '3.0L V6 Turbo (Type S)', '3.7L V6'], drivetrains: ['AWD', 'FWD'] },
      { name: 'RDX', engines: ['2.0L I4 Turbo', '3.5L V6', '2.3L I4 Turbo'], drivetrains: ['AWD', 'FWD'] },
      { name: 'TLX', engines: ['2.0L I4 Turbo', '2.4L I4', '3.5L V6', '3.0L V6 Turbo'], drivetrains: ['FWD', 'AWD'] },
      { name: 'TL', engines: ['3.2L V6', '3.5L V6', '3.7L V6'], drivetrains: ['FWD', 'AWD'] },
      { name: 'TSX', engines: ['2.4L I4', '3.5L V6'], drivetrains: ['FWD'] },
    ],
  },
  {
    make: 'Alfa Romeo',
    models: [
      { name: 'Giulia', engines: ['2.0L I4 Turbo', '2.9L V6 Twin-Turbo'], drivetrains: ['RWD', 'AWD'] },
      { name: 'Stelvio', engines: ['2.0L I4 Turbo', '2.9L V6 Twin-Turbo'], drivetrains: ['AWD', 'RWD'] },
      { name: 'Tonale', engines: ['1.3L I4 PHEV', '2.0L I4 Turbo'], drivetrains: ['AWD'] },
    ],
  },
  {
    make: 'Audi',
    models: [
      { name: 'A3', engines: ['2.0L I4 Turbo', '1.8L I4 Turbo', '1.4L I4 e-tron'], drivetrains: ['AWD', 'FWD'] },
      { name: 'A4', engines: ['2.0L I4 Turbo', '1.8L I4 Turbo', '3.2L V6'], drivetrains: ['AWD', 'FWD'] },
      { name: 'A5', engines: ['2.0L I4 Turbo', '3.2L V6'], drivetrains: ['AWD'] },
      { name: 'A6', engines: ['2.0L I4 Turbo', '3.0L V6 Turbo', '3.0L V6 Supercharged'], drivetrains: ['AWD'] },
      { name: 'Q3', engines: ['2.0L I4 Turbo'], drivetrains: ['AWD', 'FWD'] },
      { name: 'Q5', engines: ['2.0L I4 Turbo', '3.0L V6 Turbo', '3.2L V6'], drivetrains: ['AWD'] },
      { name: 'Q7', engines: ['2.0L I4 Turbo', '3.0L V6 Turbo', '3.0L V6 Supercharged', '4.2L V8'], drivetrains: ['AWD'] },
      { name: 'Q8', engines: ['3.0L V6 Turbo', '4.0L V8 Twin-Turbo'], drivetrains: ['AWD'] },
      { name: 'S4 / S5', engines: ['3.0L V6 Turbo', '3.0L V6 Supercharged', '4.2L V8'], drivetrains: ['AWD'] },
    ],
  },
  {
    make: 'BMW',
    models: [
      { name: '2 Series', engines: ['2.0L I4 Turbo', '3.0L I6 Turbo'], drivetrains: ['RWD', 'AWD'] },
      { name: '3 Series (328i / 330i / 340i)', engines: ['2.0L I4 Turbo', '3.0L I6', '3.0L I6 Turbo'], drivetrains: ['RWD', 'AWD'] },
      { name: '4 Series', engines: ['2.0L I4 Turbo', '3.0L I6 Turbo'], drivetrains: ['RWD', 'AWD'] },
      { name: '5 Series (528i / 530i / 540i)', engines: ['2.0L I4 Turbo', '3.0L I6', '3.0L I6 Turbo', '4.4L V8 Twin-Turbo'], drivetrains: ['RWD', 'AWD'] },
      { name: 'X1', engines: ['2.0L I4 Turbo'], drivetrains: ['AWD', 'FWD'] },
      { name: 'X3', engines: ['2.0L I4 Turbo', '3.0L I6', '3.0L I6 Turbo'], drivetrains: ['AWD', 'RWD'] },
      { name: 'X5', engines: ['3.0L I6 Turbo', '4.4L V8 Twin-Turbo', '3.0L I6 Diesel'], drivetrains: ['AWD', 'RWD'] },
      { name: 'X7', engines: ['3.0L I6 Turbo', '4.4L V8 Twin-Turbo'], drivetrains: ['AWD'] },
      { name: 'M3 / M4', engines: ['3.0L I6 Twin-Turbo', '4.0L V8', '3.2L I6'], drivetrains: ['RWD', 'AWD'] },
    ],
  },
  {
    make: 'Buick',
    models: [
      { name: 'Enclave', engines: ['2.5L I4 Turbo', '3.6L V6'], drivetrains: ['FWD', 'AWD'] },
      { name: 'Encore', engines: ['1.4L I4 Turbo'], drivetrains: ['FWD', 'AWD'] },
      { name: 'Encore GX', engines: ['1.2L I3 Turbo', '1.3L I3 Turbo'], drivetrains: ['FWD', 'AWD'] },
      { name: 'Envision', engines: ['2.0L I4 Turbo', '2.5L I4'], drivetrains: ['FWD', 'AWD'] },
      { name: 'LaCrosse', engines: ['2.4L I4', '2.5L I4', '3.6L V6', '3.8L V6'], drivetrains: ['FWD', 'AWD'] },
      { name: 'Regal', engines: ['2.0L I4 Turbo', '2.4L I4', '3.6L V6', '3.8L V6'], drivetrains: ['FWD', 'AWD'] },
    ],
  },
  {
    make: 'Cadillac',
    models: [
      { name: 'ATS / CT4', engines: ['2.0L I4 Turbo', '2.5L I4', '2.7L I4 Turbo', '3.6L V6'], drivetrains: ['RWD', 'AWD'] },
      { name: 'CTS / CT5', engines: ['2.0L I4 Turbo', '3.0L V6 Twin-Turbo', '3.6L V6', '6.2L V8 Supercharged'], drivetrains: ['RWD', 'AWD'] },
      { name: 'Escalade', engines: ['6.2L V8', '3.0L I6 Duramax Diesel', '6.0L V8'], drivetrains: ['4WD', 'RWD', 'AWD'] },
      { name: 'XT4', engines: ['2.0L I4 Turbo'], drivetrains: ['FWD', 'AWD'] },
      { name: 'XT5', engines: ['2.0L I4 Turbo', '3.6L V6'], drivetrains: ['FWD', 'AWD'] },
      { name: 'XT6', engines: ['2.0L I4 Turbo', '3.6L V6'], drivetrains: ['FWD', 'AWD'] },
      { name: 'SRX', engines: ['3.0L V6', '3.6L V6', '4.6L V8'], drivetrains: ['FWD', 'AWD'] },
    ],
  },
  {
    make: 'Chevrolet',
    models: [
      { name: 'Silverado 1500', engines: ['2.7L I4 TurboMax', '4.3L V6', '5.3L V8', '6.2L V8', '3.0L I6 Duramax Diesel', '4.8L V8'], drivetrains: ['4WD', 'RWD'] },
      { name: 'Silverado 2500HD / 3500HD', engines: ['6.6L V8 Gas', '6.6L V8 Duramax Diesel', '6.0L V8'], drivetrains: ['4WD', 'RWD'] },
      { name: 'Equinox', engines: ['1.5L I4 Turbo', '2.0L I4 Turbo', '2.4L I4', '3.6L V6', '3.4L V6'], drivetrains: ['FWD', 'AWD'] },
      { name: 'Malibu', engines: ['1.5L I4 Turbo', '2.0L I4 Turbo', '2.4L I4', '2.5L I4', '3.6L V6'], drivetrains: ['FWD'] },
      { name: 'Tahoe', engines: ['5.3L V8', '6.2L V8', '3.0L I6 Duramax Diesel', '4.8L V8'], drivetrains: ['4WD', 'RWD'] },
      { name: 'Suburban', engines: ['5.3L V8', '6.2L V8', '3.0L I6 Duramax Diesel', '6.0L V8'], drivetrains: ['4WD', 'RWD'] },
      { name: 'Traverse', engines: ['2.5L I4 Turbo', '3.6L V6'], drivetrains: ['FWD', 'AWD'] },
      { name: 'Colorado', engines: ['2.7L I4 Turbo', '3.6L V6', '2.5L I4', '2.8L I4 Duramax Diesel', '3.7L I5'], drivetrains: ['4WD', 'RWD'] },
      { name: 'Cruze', engines: ['1.4L I4 Turbo', '1.8L I4', '1.6L I4 Diesel'], drivetrains: ['FWD'] },
      { name: 'Camaro', engines: ['2.0L I4 Turbo', '3.6L V6', '6.2L V8', '6.2L V8 Supercharged'], drivetrains: ['RWD'] },
      { name: 'Impala', engines: ['2.5L I4', '3.6L V6', '3.5L V6', '3.9L V6'], drivetrains: ['FWD'] },
      { name: 'Trailblazer', engines: ['1.2L I3 Turbo', '1.3L I3 Turbo', '4.2L I6'], drivetrains: ['FWD', 'AWD', '4WD'] },
      { name: 'Trax', engines: ['1.2L I3 Turbo', '1.4L I4 Turbo'], drivetrains: ['FWD', 'AWD'] },
      { name: 'Blazer', engines: ['2.0L I4 Turbo', '2.5L I4', '3.6L V6', '4.3L V6'], drivetrains: ['FWD', 'AWD', '4WD'] },
      { name: 'Corvette', engines: ['6.2L V8', '5.5L V8', '5.7L V8', '6.0L V8'], drivetrains: ['RWD'] },
    ],
  },
  {
    make: 'Chrysler',
    models: [
      { name: '300', engines: ['3.6L V6', '5.7L V8', '6.4L V8', '3.5L V6', '2.7L V6'], drivetrains: ['RWD', 'AWD'] },
      { name: 'Pacifica', engines: ['3.6L V6', '3.6L V6 Plug-in Hybrid'], drivetrains: ['FWD', 'AWD'] },
      { name: 'Town & Country', engines: ['3.6L V6', '3.8L V6', '4.0L V6', '3.3L V6'], drivetrains: ['FWD'] },
      { name: '200', engines: ['2.4L I4', '3.6L V6'], drivetrains: ['FWD', 'AWD'] },
    ],
  },
  {
    make: 'Dodge',
    models: [
      { name: 'Charger', engines: ['3.6L V6', '5.7L V8 HEMI', '6.4L V8', '6.2L V8 Supercharged', '3.5L V6'], drivetrains: ['RWD', 'AWD'] },
      { name: 'Challenger', engines: ['3.6L V6', '5.7L V8 HEMI', '6.4L V8', '6.2L V8 Supercharged'], drivetrains: ['RWD', 'AWD'] },
      { name: 'Durango', engines: ['3.6L V6', '5.7L V8 HEMI', '6.4L V8', '6.2L V8 Supercharged', '4.7L V8'], drivetrains: ['AWD', 'RWD', '4WD'] },
      { name: 'Grand Caravan', engines: ['3.6L V6', '3.8L V6', '3.3L V6'], drivetrains: ['FWD'] },
      { name: 'Journey', engines: ['2.4L I4', '3.6L V6', '3.5L V6'], drivetrains: ['FWD', 'AWD'] },
      { name: 'Hornet', engines: ['2.0L I4 Turbo', '1.3L I4 PHEV'], drivetrains: ['AWD'] },
    ],
  },
  {
    make: 'Ford',
    models: [
      { name: 'F-150', engines: ['2.7L V6 EcoBoost', '3.5L V6 EcoBoost', '5.0L V8', '3.3L V6', '3.5L V6 PowerBoost Hybrid', '3.0L V6 Power Stroke Diesel', '4.6L V8', '5.4L V8'], drivetrains: ['4WD', 'RWD'] },
      { name: 'F-250 / F-350 Super Duty', engines: ['6.7L V8 Power Stroke Diesel', '7.3L V8', '6.8L V8', '6.2L V8', '6.0L V8 Power Stroke Diesel', '6.4L V8 Power Stroke Diesel'], drivetrains: ['4WD', 'RWD'] },
      { name: 'Escape', engines: ['1.5L I3 EcoBoost', '2.0L I4 EcoBoost', '2.5L I4 Hybrid', '2.5L I4', '1.6L I4 EcoBoost', '3.0L V6'], drivetrains: ['FWD', 'AWD'] },
      { name: 'Explorer', engines: ['2.3L I4 EcoBoost', '3.0L V6 EcoBoost', '3.5L V6', '3.5L V6 EcoBoost', '4.0L V6', '4.6L V8'], drivetrains: ['RWD', 'AWD', '4WD', 'FWD'] },
      { name: 'Edge', engines: ['2.0L I4 EcoBoost', '2.7L V6 EcoBoost', '3.5L V6'], drivetrains: ['AWD', 'FWD'] },
      { name: 'Mustang', engines: ['2.3L I4 EcoBoost', '5.0L V8', '3.7L V6', '4.6L V8', '5.2L V8'], drivetrains: ['RWD'] },
      { name: 'Bronco', engines: ['2.3L I4 EcoBoost', '2.7L V6 EcoBoost', '3.0L V6 EcoBoost'], drivetrains: ['4WD'] },
      { name: 'Bronco Sport', engines: ['1.5L I3 EcoBoost', '2.0L I4 EcoBoost'], drivetrains: ['4WD', 'AWD'] },
      { name: 'Maverick', engines: ['2.0L I4 EcoBoost', '2.5L I4 Hybrid'], drivetrains: ['FWD', 'AWD'] },
      { name: 'Ranger', engines: ['2.3L I4 EcoBoost', '2.7L V6 EcoBoost', '4.0L V6', '3.0L V6', '2.3L I4'], drivetrains: ['4WD', 'RWD'] },
      { name: 'Fusion', engines: ['1.5L I4 EcoBoost', '2.0L I4 EcoBoost', '2.5L I4', '2.0L I4 Hybrid', '2.7L V6 EcoBoost', '3.0L V6'], drivetrains: ['FWD', 'AWD'] },
      { name: 'Focus', engines: ['2.0L I4', '2.0L I4 Turbo (ST)', '2.3L I4 Turbo (RS)', '1.0L I3 EcoBoost'], drivetrains: ['FWD', 'AWD'] },
      { name: 'Expedition', engines: ['3.5L V6 EcoBoost', '5.4L V8'], drivetrains: ['4WD', 'RWD'] },
      { name: 'Transit / Transit Connect', engines: ['3.5L V6', '3.5L V6 EcoBoost', '2.0L I4', '2.5L I4'], drivetrains: ['RWD', 'AWD', 'FWD'] },
    ],
  },
  {
    make: 'Genesis',
    models: [
      { name: 'G70', engines: ['2.0L I4 Turbo', '2.5L I4 Turbo', '3.3L V6 Twin-Turbo'], drivetrains: ['RWD', 'AWD'] },
      { name: 'G80', engines: ['2.5L I4 Turbo', '3.5L V6 Twin-Turbo', '3.8L V6', '5.0L V8'], drivetrains: ['RWD', 'AWD'] },
      { name: 'GV70', engines: ['2.5L I4 Turbo', '3.5L V6 Twin-Turbo', 'Dual Electric Motor'], drivetrains: ['AWD'] },
      { name: 'GV80', engines: ['2.5L I4 Turbo', '3.5L V6 Twin-Turbo'], drivetrains: ['AWD'] },
    ],
  },
  {
    make: 'GMC',
    models: [
      { name: 'Sierra 1500', engines: ['2.7L I4 TurboMax', '5.3L V8', '6.2L V8', '3.0L I6 Duramax Diesel', '4.3L V6'], drivetrains: ['4WD', 'RWD'] },
      { name: 'Sierra 2500HD / 3500HD', engines: ['6.6L V8 Gas', '6.6L V8 Duramax Diesel', '6.0L V8'], drivetrains: ['4WD', 'RWD'] },
      { name: 'Terrain', engines: ['1.5L I4 Turbo', '2.0L I4 Turbo', '2.4L I4', '3.6L V6'], drivetrains: ['FWD', 'AWD'] },
      { name: 'Acadia', engines: ['2.5L I4 Turbo', '2.0L I4 Turbo', '3.6L V6', '2.5L I4'], drivetrains: ['FWD', 'AWD'] },
      { name: 'Yukon / Yukon XL', engines: ['5.3L V8', '6.2L V8', '3.0L I6 Duramax Diesel'], drivetrains: ['4WD', 'RWD'] },
      { name: 'Canyon', engines: ['2.7L I4 Turbo', '3.6L V6', '2.8L I4 Duramax Diesel', '2.5L I4'], drivetrains: ['4WD', 'RWD'] },
    ],
  },
  {
    make: 'Honda',
    models: [
      { name: 'Civic', engines: ['2.0L I4', '1.5L I4 Turbo', '2.0L I4 Hybrid', '1.8L I4', '2.4L I4 (Si)', '2.0L I4 Turbo (Type R)'], drivetrains: ['FWD'], transmissions: ['CVT', 'Manual', 'Automatic'] },
      { name: 'Accord', engines: ['1.5L I4 Turbo', '2.0L I4 Turbo', '2.0L I4 Hybrid', '2.4L I4', '3.5L V6', '3.0L V6'], drivetrains: ['FWD'], transmissions: ['CVT', 'Automatic', 'Manual'] },
      { name: 'CR-V', engines: ['1.5L I4 Turbo', '2.0L I4 Hybrid', '2.4L I4'], drivetrains: ['AWD', 'FWD'], transmissions: ['CVT', 'Automatic'] },
      { name: 'Pilot', engines: ['3.5L V6'], drivetrains: ['AWD', 'FWD'] },
      { name: 'Odyssey', engines: ['3.5L V6'], drivetrains: ['FWD'] },
      { name: 'HR-V', engines: ['2.0L I4', '1.8L I4'], drivetrains: ['AWD', 'FWD'], transmissions: ['CVT'] },
      { name: 'Ridgeline', engines: ['3.5L V6'], drivetrains: ['AWD'] },
      { name: 'Passport', engines: ['3.5L V6'], drivetrains: ['AWD', 'FWD'] },
      { name: 'Fit', engines: ['1.5L I4'], drivetrains: ['FWD'], transmissions: ['CVT', 'Manual', 'Automatic'] },
    ],
  },
  {
    make: 'Hyundai',
    models: [
      { name: 'Elantra', engines: ['2.0L I4', '1.6L I4 Turbo', '1.6L I4 Hybrid', '2.0L I4 Turbo (N)', '1.8L I4'], drivetrains: ['FWD'] },
      { name: 'Sonata', engines: ['2.5L I4', '2.5L I4 Turbo', '1.6L I4 Turbo', '2.0L I4 Hybrid', '2.4L I4', '2.0L I4 Turbo'], drivetrains: ['FWD'] },
      { name: 'Tucson', engines: ['2.5L I4', '1.6L I4 Turbo Hybrid', '2.0L I4', '2.4L I4', '1.6L I4 Turbo'], drivetrains: ['AWD', 'FWD'] },
      { name: 'Santa Fe', engines: ['2.5L I4 Turbo', '1.6L I4 Turbo Hybrid', '2.5L I4', '2.4L I4', '2.0L I4 Turbo', '3.3L V6'], drivetrains: ['AWD', 'FWD'] },
      { name: 'Palisade', engines: ['3.8L V6'], drivetrains: ['AWD', 'FWD'] },
      { name: 'Kona', engines: ['2.0L I4', '1.6L I4 Turbo', 'Electric Motor'], drivetrains: ['AWD', 'FWD'] },
      { name: 'Venue', engines: ['1.6L I4'], drivetrains: ['FWD'] },
      { name: 'Ioniq 5 / Ioniq 6', engines: ['Electric Motor (Single RWD)', 'Electric Motor (Dual AWD)'], drivetrains: ['RWD', 'AWD'], transmissions: ['EV Single-Speed'] },
    ],
  },
  {
    make: 'Infiniti',
    models: [
      { name: 'Q50', engines: ['3.0L V6 Twin-Turbo', '3.7L V6', '2.0L I4 Turbo', '3.5L V6 Hybrid'], drivetrains: ['RWD', 'AWD'] },
      { name: 'Q60', engines: ['3.0L V6 Twin-Turbo', '2.0L I4 Turbo', '3.7L V6'], drivetrains: ['RWD', 'AWD'] },
      { name: 'QX50', engines: ['2.0L I4 VC-Turbo', '3.7L V6'], drivetrains: ['AWD', 'FWD'] },
      { name: 'QX60', engines: ['3.5L V6', '2.0L I4 VC-Turbo'], drivetrains: ['AWD', 'FWD'] },
      { name: 'QX80', engines: ['3.5L V6 Twin-Turbo', '5.6L V8'], drivetrains: ['4WD', 'RWD'] },
      { name: 'G35 / G37', engines: ['3.5L V6', '3.7L V6'], drivetrains: ['RWD', 'AWD'] },
    ],
  },
  {
    make: 'Jaguar',
    models: [
      { name: 'F-PACE', engines: ['2.0L I4 Turbo', '3.0L I6 Turbo', '5.0L V8 Supercharged', '3.0L V6 Supercharged'], drivetrains: ['AWD'] },
      { name: 'XE / XF', engines: ['2.0L I4 Turbo', '3.0L V6 Supercharged', '5.0L V8'], drivetrains: ['RWD', 'AWD'] },
      { name: 'F-TYPE', engines: ['2.0L I4 Turbo', '3.0L V6 Supercharged', '5.0L V8 Supercharged'], drivetrains: ['RWD', 'AWD'] },
    ],
  },
  {
    make: 'Jeep',
    models: [
      { name: 'Wrangler (JK / JL)', engines: ['3.6L V6', '2.0L I4 Turbo', '2.0L I4 4xe PHEV', '3.0L V6 EcoDiesel', '6.4L V8', '3.8L V6', '4.0L I6'], drivetrains: ['4WD'] },
      { name: 'Grand Cherokee', engines: ['3.6L V6', '5.7L V8 HEMI', '2.0L I4 4xe PHEV', '6.4L V8', '3.0L V6 EcoDiesel', '4.7L V8'], drivetrains: ['4WD', 'RWD'] },
      { name: 'Cherokee', engines: ['2.4L I4', '3.2L V6', '2.0L I4 Turbo', '4.0L I6'], drivetrains: ['4WD', 'FWD'] },
      { name: 'Compass', engines: ['2.0L I4 Turbo', '2.4L I4'], drivetrains: ['4WD', 'FWD'] },
      { name: 'Gladiator', engines: ['3.6L V6', '3.0L V6 EcoDiesel'], drivetrains: ['4WD'] },
      { name: 'Renegade', engines: ['1.3L I4 Turbo', '2.4L I4', '1.4L I4 Turbo'], drivetrains: ['4WD', 'FWD'] },
      { name: 'Wagoneer / Grand Wagoneer', engines: ['3.0L I6 Hurricane Twin-Turbo', '5.7L V8', '6.4L V8'], drivetrains: ['4WD', 'RWD'] },
    ],
  },
  {
    make: 'Kia',
    models: [
      { name: 'Forte / K4', engines: ['2.0L I4', '1.6L I4 Turbo', '1.8L I4'], drivetrains: ['FWD'] },
      { name: 'K5 / Optima', engines: ['1.6L I4 Turbo', '2.5L I4', '2.5L I4 Turbo', '2.4L I4', '2.0L I4 Turbo'], drivetrains: ['FWD', 'AWD'] },
      { name: 'Sportage', engines: ['2.5L I4', '1.6L I4 Turbo Hybrid', '2.4L I4', '2.0L I4 Turbo'], drivetrains: ['AWD', 'FWD'] },
      { name: 'Sorento', engines: ['2.5L I4', '2.5L I4 Turbo', '1.6L I4 Turbo Hybrid', '3.3L V6', '2.4L I4'], drivetrains: ['AWD', 'FWD'] },
      { name: 'Telluride', engines: ['3.8L V6'], drivetrains: ['AWD', 'FWD'] },
      { name: 'Seltos', engines: ['2.0L I4', '1.6L I4 Turbo'], drivetrains: ['AWD', 'FWD'] },
      { name: 'Soul', engines: ['2.0L I4', '1.6L I4', '1.6L I4 Turbo'], drivetrains: ['FWD'] },
      { name: 'Carnival / Sedona', engines: ['3.5L V6', '3.3L V6', '1.6L I4 Turbo Hybrid'], drivetrains: ['FWD'] },
      { name: 'EV6 / EV9', engines: ['Electric Motor (Single RWD)', 'Electric Motor (Dual AWD)'], drivetrains: ['RWD', 'AWD'], transmissions: ['EV Single-Speed'] },
    ],
  },
  {
    make: 'Land Rover',
    models: [
      { name: 'Range Rover', engines: ['3.0L I6 Turbo', '4.4L V8 Twin-Turbo', '5.0L V8 Supercharged', '3.0L V6 Supercharged'], drivetrains: ['4WD', 'AWD'] },
      { name: 'Range Rover Sport', engines: ['3.0L I6 Turbo', '4.4L V8 Twin-Turbo', '5.0L V8 Supercharged', '3.0L V6 Supercharged'], drivetrains: ['4WD', 'AWD'] },
      { name: 'Range Rover Evoque', engines: ['2.0L I4 Turbo'], drivetrains: ['AWD'] },
      { name: 'Defender', engines: ['2.0L I4 Turbo', '3.0L I6 Turbo', '5.0L V8 Supercharged'], drivetrains: ['4WD'] },
      { name: 'Discovery / Discovery Sport', engines: ['2.0L I4 Turbo', '3.0L I6 Turbo', '3.0L V6 Supercharged'], drivetrains: ['4WD', 'AWD'] },
    ],
  },
  {
    make: 'Lexus',
    models: [
      { name: 'ES 350 / ES 300h', engines: ['3.5L V6', '2.5L I4 Hybrid', '2.5L I4'], drivetrains: ['FWD', 'AWD'] },
      { name: 'IS 250 / IS 300 / IS 350', engines: ['2.0L I4 Turbo', '3.5L V6', '2.5L V6', '5.0L V8 (IS 500)'], drivetrains: ['RWD', 'AWD'] },
      { name: 'NX 250 / NX 350 / NX 350h', engines: ['2.4L I4 Turbo', '2.5L I4', '2.5L I4 Hybrid', '2.0L I4 Turbo'], drivetrains: ['AWD', 'FWD'] },
      { name: 'RX 350 / RX 450h', engines: ['2.4L I4 Turbo', '3.5L V6', '2.5L I4 Hybrid', '3.5L V6 Hybrid'], drivetrains: ['AWD', 'FWD'] },
      { name: 'GX 460 / GX 550', engines: ['3.4L V6 Twin-Turbo', '4.6L V8', '4.7L V8'], drivetrains: ['4WD'] },
      { name: 'TX / LX', engines: ['2.4L I4 Turbo', '3.4L V6 Twin-Turbo', '5.7L V8'], drivetrains: ['AWD', '4WD'] },
    ],
  },
  {
    make: 'Lincoln',
    models: [
      { name: 'Aviator', engines: ['3.0L V6 Twin-Turbo', '3.0L V6 PHEV'], drivetrains: ['AWD', 'RWD'] },
      { name: 'Corsair', engines: ['2.0L I4 Turbo', '2.3L I4 Turbo', '2.5L I4 PHEV'], drivetrains: ['AWD', 'FWD'] },
      { name: 'Nautilus', engines: ['2.0L I4 Turbo', '2.0L I4 Hybrid', '2.7L V6 Twin-Turbo'], drivetrains: ['AWD', 'FWD'] },
      { name: 'Navigator', engines: ['3.5L V6 Twin-Turbo', '5.4L V8'], drivetrains: ['4WD', 'RWD'] },
      { name: 'MKZ / MKX', engines: ['2.0L I4 Turbo', '3.0L V6 Twin-Turbo', '3.7L V6', '2.7L V6 Turbo'], drivetrains: ['FWD', 'AWD'] },
    ],
  },
  {
    make: 'Mazda',
    models: [
      { name: 'Mazda3', engines: ['2.5L I4', '2.5L I4 Turbo', '2.0L I4', '2.3L I4 Turbo'], drivetrains: ['FWD', 'AWD'] },
      { name: 'Mazda6', engines: ['2.5L I4', '2.5L I4 Turbo', '3.7L V6'], drivetrains: ['FWD'] },
      { name: 'CX-5', engines: ['2.5L I4', '2.5L I4 Turbo', '2.0L I4'], drivetrains: ['AWD', 'FWD'] },
      { name: 'CX-30', engines: ['2.5L I4', '2.5L I4 Turbo'], drivetrains: ['AWD'] },
      { name: 'CX-50', engines: ['2.5L I4', '2.5L I4 Turbo', '2.5L I4 Hybrid'], drivetrains: ['AWD'] },
      { name: 'CX-9 / CX-90', engines: ['2.5L I4 Turbo', '3.3L I6 Turbo', '2.5L I4 PHEV', '3.7L V6'], drivetrains: ['AWD', 'FWD'] },
      { name: 'MX-5 Miata', engines: ['2.0L I4', '1.8L I4', '1.6L I4'], drivetrains: ['RWD'], transmissions: ['Manual', 'Automatic'] },
    ],
  },
  {
    make: 'Mercedes-Benz',
    models: [
      { name: 'C-Class (C300 / C43 / C63)', engines: ['2.0L I4 Turbo', '3.0L V6', '3.0L V6 Twin-Turbo', '4.0L V8 Twin-Turbo', '6.2L V8'], drivetrains: ['RWD', 'AWD'] },
      { name: 'E-Class (E300 / E350 / E450)', engines: ['2.0L I4 Turbo', '3.0L I6 Turbo', '3.5L V6', '4.0L V8 Twin-Turbo'], drivetrains: ['RWD', 'AWD'] },
      { name: 'GLA / GLB', engines: ['2.0L I4 Turbo'], drivetrains: ['FWD', 'AWD'] },
      { name: 'GLC (GLC 300)', engines: ['2.0L I4 Turbo', '3.0L V6 Twin-Turbo'], drivetrains: ['AWD', 'RWD'] },
      { name: 'GLE (GLE 350 / GLE 450)', engines: ['2.0L I4 Turbo', '3.0L I6 Turbo', '3.5L V6', '4.0L V8 Twin-Turbo'], drivetrains: ['AWD', 'RWD'] },
      { name: 'Sprinter 2500 / 3500', engines: ['2.0L I4 Diesel', '3.0L V6 BlueTEC Diesel', '2.1L I4 Diesel', '2.0L I4 Gas'], drivetrains: ['RWD', 'AWD', '4WD'] },
    ],
  },
  {
    make: 'MINI',
    models: [
      { name: 'Cooper / Cooper S (Hardtop)', engines: ['1.5L I3 Turbo', '2.0L I4 Turbo', '1.6L I4', '1.6L I4 Turbo'], drivetrains: ['FWD'] },
      { name: 'Countryman', engines: ['1.5L I3 Turbo', '2.0L I4 Turbo', '1.6L I4 Turbo'], drivetrains: ['AWD', 'FWD'] },
      { name: 'Clubman', engines: ['1.5L I3 Turbo', '2.0L I4 Turbo'], drivetrains: ['FWD', 'AWD'] },
    ],
  },
  {
    make: 'Mitsubishi',
    models: [
      { name: 'Outlander', engines: ['2.5L I4', '2.4L I4', '2.4L I4 PHEV', '3.0L V6'], drivetrains: ['AWD', 'FWD'] },
      { name: 'Outlander Sport', engines: ['2.0L I4', '2.4L I4'], drivetrains: ['FWD', 'AWD'] },
      { name: 'Eclipse Cross', engines: ['1.5L I4 Turbo'], drivetrains: ['AWD', 'FWD'] },
      { name: 'Mirage', engines: ['1.2L I3'], drivetrains: ['FWD'] },
      { name: 'Lancer', engines: ['2.0L I4', '2.4L I4', '2.0L I4 Turbo (Evo)'], drivetrains: ['FWD', 'AWD'] },
    ],
  },
  {
    make: 'Nissan',
    models: [
      { name: 'Altima', engines: ['2.5L I4', '2.0L I4 VC-Turbo', '3.5L V6'], drivetrains: ['FWD', 'AWD'], transmissions: ['CVT', 'Automatic'] },
      { name: 'Sentra', engines: ['2.0L I4', '1.8L I4', '1.6L I4 Turbo'], drivetrains: ['FWD'], transmissions: ['CVT', 'Manual'] },
      { name: 'Rogue', engines: ['1.5L I3 VC-Turbo', '2.5L I4'], drivetrains: ['AWD', 'FWD'], transmissions: ['CVT'] },
      { name: 'Pathfinder', engines: ['3.5L V6', '4.0L V6'], drivetrains: ['4WD', 'FWD', 'AWD'] },
      { name: 'Frontier', engines: ['3.8L V6', '4.0L V6', '2.5L I4'], drivetrains: ['4WD', 'RWD'] },
      { name: 'Titan', engines: ['5.6L V8', '5.0L V8 Cummins Diesel'], drivetrains: ['4WD', 'RWD'] },
      { name: 'Murano', engines: ['3.5L V6', '2.0L I4 VC-Turbo'], drivetrains: ['AWD', 'FWD'], transmissions: ['CVT', 'Automatic'] },
      { name: 'Maxima', engines: ['3.5L V6'], drivetrains: ['FWD'], transmissions: ['CVT', 'Automatic'] },
      { name: 'Versa / Kicks', engines: ['1.6L I4'], drivetrains: ['FWD'], transmissions: ['CVT', 'Manual'] },
      { name: 'Armada', engines: ['5.6L V8', '3.5L V6 Twin-Turbo'], drivetrains: ['4WD', 'RWD'] },
    ],
  },
  {
    make: 'Porsche',
    models: [
      { name: '911', engines: ['3.0L H6 Twin-Turbo', '3.8L H6', '4.0L H6', '3.6L H6'], drivetrains: ['RWD', 'AWD'] },
      { name: 'Cayenne', engines: ['3.0L V6 Turbo', '4.0L V8 Twin-Turbo', '2.9L V6 Twin-Turbo', '3.6L V6', '4.8L V8'], drivetrains: ['AWD'] },
      { name: 'Macan', engines: ['2.0L I4 Turbo', '2.9L V6 Twin-Turbo', '3.0L V6 Twin-Turbo'], drivetrains: ['AWD'] },
      { name: 'Panamera', engines: ['2.9L V6 Twin-Turbo', '4.0L V8 Twin-Turbo', '3.6L V6'], drivetrains: ['RWD', 'AWD'] },
    ],
  },
  {
    make: 'Ram',
    models: [
      { name: '1500', engines: ['3.6L V6 Pentastar', '5.7L V8 HEMI', '3.0L I6 Hurricane Twin-Turbo', '3.0L V6 EcoDiesel', '6.2L V8 Supercharged', '4.7L V8'], drivetrains: ['4WD', 'RWD'] },
      { name: '2500 / 3500', engines: ['6.7L I6 Cummins Diesel', '6.4L V8 HEMI', '5.7L V8 HEMI', '5.9L I6 Cummins Diesel'], drivetrains: ['4WD', 'RWD'] },
      { name: 'ProMaster 1500 / 2500 / 3500', engines: ['3.6L V6 Pentastar', '3.0L I4 EcoDiesel'], drivetrains: ['FWD'] },
    ],
  },
  {
    make: 'Rivian',
    models: [
      { name: 'R1T', engines: ['Dual-Motor AWD', 'Quad-Motor AWD', 'Tri-Motor AWD'], drivetrains: ['AWD'], transmissions: ['EV Single-Speed'] },
      { name: 'R1S', engines: ['Dual-Motor AWD', 'Quad-Motor AWD', 'Tri-Motor AWD'], drivetrains: ['AWD'], transmissions: ['EV Single-Speed'] },
    ],
  },
  {
    make: 'Scion',
    models: [
      { name: 'tC', engines: ['2.5L I4', '2.4L I4'], drivetrains: ['FWD'] },
      { name: 'xB', engines: ['2.4L I4', '1.5L I4'], drivetrains: ['FWD'] },
      { name: 'FR-S', engines: ['2.0L H4'], drivetrains: ['RWD'] },
    ],
  },
  {
    make: 'Subaru',
    models: [
      { name: 'Outback', engines: ['2.5L H4', '2.4L H4 Turbo', '3.6L H6'], drivetrains: ['AWD'], transmissions: ['CVT', 'Automatic', 'Manual'] },
      { name: 'Forester', engines: ['2.5L H4', '2.0L H4 Turbo', '2.5L H4 Hybrid'], drivetrains: ['AWD'], transmissions: ['CVT', 'Manual', 'Automatic'] },
      { name: 'Crosstrek', engines: ['2.0L H4', '2.5L H4'], drivetrains: ['AWD'], transmissions: ['CVT', 'Manual'] },
      { name: 'Impreza', engines: ['2.0L H4', '2.5L H4'], drivetrains: ['AWD'], transmissions: ['CVT', 'Manual', 'Automatic'] },
      { name: 'WRX / STI', engines: ['2.4L H4 Turbo', '2.0L H4 Turbo', '2.5L H4 Turbo'], drivetrains: ['AWD'], transmissions: ['Manual', 'CVT'] },
      { name: 'Legacy', engines: ['2.5L H4', '2.4L H4 Turbo', '3.6L H6'], drivetrains: ['AWD'] },
      { name: 'Ascent', engines: ['2.4L H4 Turbo'], drivetrains: ['AWD'], transmissions: ['CVT'] },
    ],
  },
  {
    make: 'Tesla',
    models: [
      { name: 'Model 3', engines: ['Single Motor RWD', 'Dual Motor AWD', 'Performance Dual Motor'], drivetrains: ['RWD', 'AWD'], transmissions: ['EV Single-Speed'] },
      { name: 'Model Y', engines: ['Single Motor RWD', 'Dual Motor AWD', 'Performance Dual Motor'], drivetrains: ['AWD', 'RWD'], transmissions: ['EV Single-Speed'] },
      { name: 'Model S', engines: ['Dual Motor AWD', 'Tri-Motor Plaid'], drivetrains: ['AWD', 'RWD'], transmissions: ['EV Single-Speed'] },
      { name: 'Model X', engines: ['Dual Motor AWD', 'Tri-Motor Plaid'], drivetrains: ['AWD'], transmissions: ['EV Single-Speed'] },
      { name: 'Cybertruck', engines: ['Dual Motor AWD', 'Tri-Motor Cyberbeast'], drivetrains: ['AWD'], transmissions: ['EV Single-Speed'] },
    ],
  },
  {
    make: 'Toyota',
    models: [
      { name: 'Camry', engines: ['2.5L I4', '2.5L I4 Hybrid', '3.5L V6', '2.4L I4'], drivetrains: ['FWD', 'AWD'] },
      { name: 'Corolla', engines: ['2.0L I4', '1.8L I4', '1.8L I4 Hybrid', '1.6L I3 Turbo (GR)'], drivetrains: ['FWD', 'AWD'] },
      { name: 'RAV4', engines: ['2.5L I4', '2.5L I4 Hybrid', '2.5L I4 Prime PHEV', '3.5L V6'], drivetrains: ['AWD', 'FWD'] },
      { name: 'Tacoma', engines: ['2.4L I4 i-FORCE Turbo', '3.5L V6', '2.7L I4', '4.0L V6', '3.4L V6'], drivetrains: ['4WD', 'RWD'] },
      { name: 'Tundra', engines: ['3.4L V6 Twin-Turbo', '3.4L V6 i-FORCE MAX Hybrid', '5.7L V8', '4.6L V8', '4.7L V8'], drivetrains: ['4WD', 'RWD'] },
      { name: 'Highlander', engines: ['2.4L I4 Turbo', '2.5L I4 Hybrid', '3.5L V6', '2.7L I4'], drivetrains: ['AWD', 'FWD'] },
      { name: '4Runner', engines: ['4.0L V6', '2.4L I4 Turbo', '4.7L V8', '3.4L V6'], drivetrains: ['4WD', 'RWD'] },
      { name: 'Prius', engines: ['2.0L I4 Hybrid', '1.8L I4 Hybrid', '1.5L I4 Hybrid'], drivetrains: ['FWD', 'AWD'], transmissions: ['CVT'] },
      { name: 'Sienna', engines: ['2.5L I4 Hybrid', '3.5L V6'], drivetrains: ['FWD', 'AWD'] },
      { name: 'Sequoia', engines: ['3.4L V6 Hybrid', '5.7L V8', '4.7L V8'], drivetrains: ['4WD', 'RWD'] },
      { name: 'Tundra / Land Cruiser', engines: ['2.4L I4 Hybrid', '5.7L V8'], drivetrains: ['4WD'] },
    ],
  },
  {
    make: 'Volkswagen',
    models: [
      { name: 'Jetta', engines: ['1.5L I4 Turbo', '1.4L I4 Turbo', '2.0L I4 Turbo (GLI)', '2.5L I5', '2.0L I4 TDI Diesel'], drivetrains: ['FWD'] },
      { name: 'Golf / GTI / Golf R', engines: ['2.0L I4 Turbo', '1.8L I4 Turbo', '1.4L I4 Turbo', '2.5L I5'], drivetrains: ['FWD', 'AWD'] },
      { name: 'Tiguan', engines: ['2.0L I4 Turbo'], drivetrains: ['AWD', 'FWD'] },
      { name: 'Atlas / Atlas Cross Sport', engines: ['2.0L I4 Turbo', '3.6L V6'], drivetrains: ['AWD', 'FWD'] },
      { name: 'Passat', engines: ['2.0L I4 Turbo', '1.8L I4 Turbo', '2.5L I5', '3.6L V6', '2.0L I4 TDI Diesel'], drivetrains: ['FWD'] },
      { name: 'ID.4', engines: ['Single Motor RWD', 'Dual Motor AWD'], drivetrains: ['RWD', 'AWD'], transmissions: ['EV Single-Speed'] },
    ],
  },
  {
    make: 'Volvo',
    models: [
      { name: 'XC40', engines: ['2.0L I4 Turbo', 'Electric Motor'], drivetrains: ['AWD', 'FWD'] },
      { name: 'XC60', engines: ['2.0L I4 Turbo', '2.0L I4 Turbo/Supercharged', '2.0L I4 PHEV', '3.0L I6 Turbo', '3.2L I6'], drivetrains: ['AWD', 'FWD'] },
      { name: 'XC90', engines: ['2.0L I4 Turbo', '2.0L I4 Turbo/Supercharged', '2.0L I4 PHEV', '3.2L I6'], drivetrains: ['AWD', 'FWD'] },
      { name: 'S60 / V60', engines: ['2.0L I4 Turbo', '2.0L I4 PHEV', '2.5L I5 Turbo'], drivetrains: ['FWD', 'AWD'] },
    ],
  },
];

export const ALL_MAKES: string[] = VEHICLE_CATALOG.map((m) => m.make);

export function getModelsForMake(make: string): ModelSpec[] {
  const found = VEHICLE_CATALOG.find(
    (entry) => entry.make.toLowerCase() === make.toLowerCase()
  );
  return found ? found.models : [];
}

export function getEnginesForMakeModel(make: string, model: string): string[] {
  const models = getModelsForMake(make);
  const found = models.find(
    (m) => m.name.toLowerCase() === model.toLowerCase()
  );
  return found ? found.engines : COMMON_ENGINES;
}
