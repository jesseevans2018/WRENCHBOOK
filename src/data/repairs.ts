export interface RepairCategory {
  id: string;
  name: string;
  repairs: string[];
}

export const REPAIR_CATEGORIES: RepairCategory[] = [
  {
    id: 'brakes',
    name: 'Brakes & Hydraulics',
    repairs: [
      'Front Brake Pads & Rotors Replacement',
      'Rear Brake Pads & Rotors Replacement',
      'Front & Rear Brake Pads & Rotors (Complete)',
      'Brake Caliper Replacement (Front or Rear)',
      'Brake Master Cylinder Replacement',
      'Brake Booster Replacement',
      'Flexible Brake Hose & Fluid Flush',
      'Parking Brake Shoe / Electronic Actuator Replacement',
      'ABS Wheel Speed Sensor Replacement',
      'Steel Brake Line Replacement & Bleeding',
    ],
  },
  {
    id: 'electrical',
    name: 'Electrical, Starting & Charging',
    repairs: [
      'Alternator Replacement',
      'Starter Motor Replacement',
      'Battery & Terminal Replacement + Registration',
      'Ignition Switch / Lock Cylinder Replacement',
      'Power Window Regulator & Motor Replacement',
      'Blower Motor & Resistor Replacement',
      'Crankshaft Position Sensor Replacement',
      'Camshaft Position Sensor Replacement',
      'Parasitic Draw Diagnostic & Wiring Repair',
      'Headlight / Tail Light Assembly & Ballast Replacement',
    ],
  },
  {
    id: 'engine',
    name: 'Engine & Valvetrain',
    repairs: [
      'Spark Plugs & Ignition Coils Replacement',
      'Valve Cover Gasket Replacement',
      'Serpentine / Drive Belt & Tensioner Replacement',
      'Timing Belt & Water Pump Kit Replacement',
      'Timing Chain & Guides Replacement',
      'Oil Pan Gasket Replacement',
      'Engine Motor Mounts Replacement',
      'Intake Manifold Gasket Replacement',
      'PCV Valve / Crankcase Breather Replacement',
      'Oil Cooler & Filter Housing Gasket Replacement',
      'Cylinder Head Gasket Replacement',
      'Rear Main Seal Replacement',
    ],
  },
  {
    id: 'cooling',
    name: 'Cooling & HVAC',
    repairs: [
      'Water Pump Replacement',
      'Thermostat & Housing Replacement',
      'Radiator Replacement & Coolant Flush',
      'Cooling Fan Assembly Replacement',
      'Heater Core Hose / T-Fitting Replacement',
      'A/C Compressor Replacement & System Recharge',
      'A/C Condenser Replacement',
      'A/C Expansion Valve / Orifice Tube Replacement',
      'Blend Door Actuator Replacement',
      'Coolant Reservoir / Expansion Tank Replacement',
    ],
  },
  {
    id: 'suspension',
    name: 'Suspension & Steering',
    repairs: [
      'Front Strut / Coilover Assembly Replacement (Pair)',
      'Rear Shock Absorbers Replacement (Pair)',
      'Lower Control Arm & Ball Joint Replacement',
      'Upper Control Arm Replacement',
      'Wheel Hub & Bearing Assembly Replacement',
      'Inner & Outer Tie Rod End Replacement',
      'Sway Bar End Links & Bushings Replacement',
      'Power Steering Pump & Pressure Hose Replacement',
      'Steering Rack & Pinion Replacement',
      'CV Axle Shaft Assembly Replacement',
    ],
  },
  {
    id: 'drivetrain',
    name: 'Drivetrain & Transmission',
    repairs: [
      'Transmission Fluid & Filter Service',
      'Clutch Kit, Pressure Plate & Flywheel Replacement',
      'Clutch Master & Slave Cylinder Replacement',
      'Drive Shaft U-Joint / Center Support Bearing Replacement',
      'Transfer Case Fluid & Shift Actuator Replacement',
      'Differential Fluid Service & Pinion Seal Replacement',
      'Transmission Output / Axle Shaft Seal Replacement',
      'Transmission Mount Replacement',
      'Shift Cable / Linkage Bushing Replacement',
    ],
  },
  {
    id: 'fuel_exhaust',
    name: 'Fuel, Air & Exhaust',
    repairs: [
      'Fuel Pump Module Assembly Replacement',
      'Fuel Injectors Replacement',
      'Mass Airflow (MAF) / MAP Sensor Replacement',
      'Throttle Body Cleaning / Replacement & Relearn',
      'Oxygen (O2) Sensor Replacement (Upstream / Downstream)',
      'EVAP Purge Valve & Canister Vent Solenoid Replacement',
      'Catalytic Converter Replacement',
      'Exhaust Manifold Gasket & Stud Repair',
      'EGR Valve & Cooler Cleaning / Replacement',
      'Turbocharger Wastegate Actuator / Oil Feed Line Repair',
    ],
  },
  {
    id: 'maintenance',
    name: 'Maintenance & Diagnostics',
    repairs: [
      'Check Engine Light / OBD-II Full System Diagnostic',
      'Full Synthetic Oil & Filter Change + Multi-Point Inspection',
      'Pre-Purchase Mobile Vehicle Inspection (PPI)',
      'No-Start / Cranks-No-Start Field Diagnostic',
      'Coolant System Pressure Test & Leak Diagnostic',
      'Smoke Machine Vacuum / EVAP Leak Test',
      'Differential & Transfer Case 4x4 Fluid Package',
      'Belt, Hoses & Fluid Tune-Up Package',
    ],
  },
];

export const ALL_REPAIR_NAMES: string[] = REPAIR_CATEGORIES.flatMap(
  (c) => c.repairs
);
