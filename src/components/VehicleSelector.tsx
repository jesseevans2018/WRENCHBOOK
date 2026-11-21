import { useState } from 'react';
import { ChevronDown, RefreshCw } from 'lucide-react';
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
  DrivetrainOption,
  TransmissionOption,
  VehicleSelection,
} from '../types/mechanic';

interface VehicleSelectorProps {
  vehicle: VehicleSelection;
  onChange: (next: VehicleSelection) => void;
}

const CUSTOM_OPTION = '__CUSTOM__';

export function VehicleSelector({ vehicle, onChange }: VehicleSelectorProps) {
  const [customMakeMode, setCustomMakeMode] = useState(
    !ALL_MAKES.includes(vehicle.make) && vehicle.make !== ''
  );
  const [customModelMode, setCustomModelMode] = useState(false);
  const [customEngineMode, setCustomEngineMode] = useState(false);

  const [fetchedEngines, setFetchedEngines] = useState<string[] | null>(null);
  const [fetchedTrims, setFetchedTrims] = useState<string[] | null>(null);
  const [fetchingSpecs, setFetchingSpecs] = useState(false);
  const [specError, setSpecError] = useState<string | null>(null);

  const modelsForMake = getModelsForMake(vehicle.make);
  const modelNames = modelsForMake.map((m) => m.name);

  const baseEngines = getEnginesForMakeModel(vehicle.make, vehicle.model);
  const engineOptions =
    fetchedEngines && fetchedEngines.length > 0
      ? Array.from(new Set([...fetchedEngines, ...baseEngines]))
      : baseEngines.length > 0
      ? baseEngines
      : COMMON_ENGINES;

  const handleMakeSelect = (val: string) => {
    setFetchedEngines(null);
    setFetchedTrims(null);
    setSpecError(null);

    if (val === CUSTOM_OPTION) {
      setCustomMakeMode(true);
      setCustomModelMode(true);
      onChange({
        ...vehicle,
        make: '',
        model: '',
        engine: COMMON_ENGINES[4],
      });
      return;
    }

    setCustomMakeMode(false);
    const nextModels = getModelsForMake(val);
    const firstModel = nextModels[0];
    setCustomModelMode(false);
    setCustomEngineMode(false);

    onChange({
      ...vehicle,
      make: val,
      model: firstModel ? firstModel.name : '',
      engine: firstModel?.engines[0] ?? COMMON_ENGINES[4],
      drivetrain: firstModel?.drivetrains?.[0] ?? vehicle.drivetrain,
      transmission: firstModel?.transmissions?.[0] ?? vehicle.transmission,
    });
  };

  const handleModelSelect = (val: string) => {
    setFetchedEngines(null);
    setFetchedTrims(null);
    setSpecError(null);

    if (val === CUSTOM_OPTION) {
      setCustomModelMode(true);
      onChange({
        ...vehicle,
        model: '',
      });
      return;
    }

    setCustomModelMode(false);
    setCustomEngineMode(false);
    const matchedModel = modelsForMake.find((m) => m.name === val);
    onChange({
      ...vehicle,
      model: val,
      engine: matchedModel?.engines[0] ?? vehicle.engine,
      drivetrain: matchedModel?.drivetrains?.[0] ?? vehicle.drivetrain,
      transmission: matchedModel?.transmissions?.[0] ?? vehicle.transmission,
    });
  };

  const handleEngineSelect = (val: string) => {
    if (val === CUSTOM_OPTION) {
      setCustomEngineMode(true);
      onChange({ ...vehicle, engine: '' });
      return;
    }
    setCustomEngineMode(false);
    onChange({ ...vehicle, engine: val });
  };

  const handleFetchFactorySpecs = async () => {
    if (!vehicle.year || !vehicle.make.trim() || !vehicle.model.trim()) return;
    setFetchingSpecs(true);
    setSpecError(null);
    try {
      const res = await fetch('/api/vehicle-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: vehicle.year,
          make: vehicle.make.trim(),
          model: vehicle.model.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not fetch factory specs.');
      }
      if (Array.isArray(data.engines) && data.engines.length > 0) {
        setFetchedEngines(data.engines);
        setCustomEngineMode(false);
        onChange({
          ...vehicle,
          engine: data.engines[0],
          drivetrain:
            (data.drivetrains?.[0] as DrivetrainOption) || vehicle.drivetrain,
          transmission:
            (data.transmissions?.[0] as TransmissionOption) ||
            vehicle.transmission,
          trim: data.trims?.[0] ?? vehicle.trim,
        });
      }
      if (Array.isArray(data.trims)) {
        setFetchedTrims(data.trims);
      }
    } catch (err: unknown) {
      setSpecError(
        err instanceof Error ? err.message : 'Unable to fetch factory specs.'
      );
    } finally {
      setFetchingSpecs(false);
    }
  };

  const selectClass =
    'w-full h-11 pl-3 pr-8 bg-[#1c1f26] border border-[#2c313d] rounded-lg text-sm font-medium text-slate-100 appearance-none focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-600/20 cursor-pointer';
  const inputClass =
    'w-full h-11 px-3 bg-[#1c1f26] border border-[#2c313d] rounded-lg text-sm font-medium text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-600/20';

  return (
    <section
      aria-label="Vehicle specification selector"
      className="bg-[#14161b] border border-[#262a34] rounded-xl p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="font-display text-base font-semibold text-white">
            Vehicle Configuration
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select year, make, model, and engine size — or enter any custom vehicle on the market.
          </p>
        </div>

        <button
          type="button"
          onClick={handleFetchFactorySpecs}
          disabled={
            fetchingSpecs ||
            !vehicle.year ||
            !vehicle.make.trim() ||
            !vehicle.model.trim()
          }
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-[#1c1f26] hover:bg-[#252932] border border-[#2c313d] disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${fetchingSpecs ? 'animate-spin' : ''}`}
          />
          {fetchingSpecs ? 'Loading Factory Engines...' : 'Load Exact Factory Engines'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Year */}
        <div>
          <label
            htmlFor="veh-year"
            className="block text-xs font-medium text-slate-400 mb-1"
          >
            Year
          </label>
          <div className="relative">
            <select
              id="veh-year"
              value={vehicle.year}
              onChange={(e) => onChange({ ...vehicle, year: e.target.value })}
              className={`${selectClass} tabular-nums`}
            >
              {VEHICLE_YEARS.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Make */}
        <div>
          <label
            htmlFor="veh-make"
            className="block text-xs font-medium text-slate-400 mb-1"
          >
            Make
          </label>
          {customMakeMode ? (
            <div className="flex gap-1.5">
              <input
                id="veh-make"
                type="text"
                placeholder="Enter make..."
                value={vehicle.make}
                onChange={(e) =>
                  onChange({ ...vehicle, make: e.target.value })
                }
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => handleMakeSelect(ALL_MAKES[0])}
                className="px-2.5 text-xs font-medium text-slate-300 bg-[#1c1f26] border border-[#2c313d] hover:bg-[#252932] rounded-lg shrink-0 cursor-pointer"
              >
                List
              </button>
            </div>
          ) : (
            <div className="relative">
              <select
                id="veh-make"
                value={ALL_MAKES.includes(vehicle.make) ? vehicle.make : ''}
                onChange={(e) => handleMakeSelect(e.target.value)}
                className={selectClass}
              >
                {ALL_MAKES.map((mk) => (
                  <option key={mk} value={mk}>
                    {mk}
                  </option>
                ))}
                <option value={CUSTOM_OPTION}>Other / Custom Make...</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
            </div>
          )}
        </div>

        {/* Model */}
        <div>
          <label
            htmlFor="veh-model"
            className="block text-xs font-medium text-slate-400 mb-1"
          >
            Model
          </label>
          {customModelMode || modelNames.length === 0 ? (
            <div className="flex gap-1.5">
              <input
                id="veh-model"
                type="text"
                placeholder="Enter model..."
                value={vehicle.model}
                onChange={(e) =>
                  onChange({ ...vehicle, model: e.target.value })
                }
                className={inputClass}
              />
              {modelNames.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleModelSelect(modelNames[0])}
                  className="px-2.5 text-xs font-medium text-slate-300 bg-[#1c1f26] border border-[#2c313d] hover:bg-[#252932] rounded-lg shrink-0 cursor-pointer"
                >
                  List
                </button>
              )}
            </div>
          ) : (
            <div className="relative">
              <select
                id="veh-model"
                value={
                  modelNames.includes(vehicle.model)
                    ? vehicle.model
                    : CUSTOM_OPTION
                }
                onChange={(e) => handleModelSelect(e.target.value)}
                className={selectClass}
              >
                {modelNames.map((md) => (
                  <option key={md} value={md}>
                    {md}
                  </option>
                ))}
                <option value={CUSTOM_OPTION}>Other / Custom Model...</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
            </div>
          )}
        </div>

        {/* Engine Size */}
        <div>
          <label
            htmlFor="veh-engine"
            className="block text-xs font-medium text-slate-400 mb-1"
          >
            Engine Size
          </label>
          {customEngineMode ? (
            <div className="flex gap-1.5">
              <input
                id="veh-engine"
                type="text"
                placeholder="e.g., 3.5L V6"
                value={vehicle.engine}
                onChange={(e) =>
                  onChange({ ...vehicle, engine: e.target.value })
                }
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => handleEngineSelect(engineOptions[0])}
                className="px-2.5 text-xs font-medium text-slate-300 bg-[#1c1f26] border border-[#2c313d] hover:bg-[#252932] rounded-lg shrink-0 cursor-pointer"
              >
                List
              </button>
            </div>
          ) : (
            <div className="relative">
              <select
                id="veh-engine"
                value={
                  engineOptions.includes(vehicle.engine)
                    ? vehicle.engine
                    : CUSTOM_OPTION
                }
                onChange={(e) => handleEngineSelect(e.target.value)}
                className={selectClass}
              >
                {engineOptions.map((eng) => (
                  <option key={eng} value={eng}>
                    {eng}
                  </option>
                ))}
                <option value={CUSTOM_OPTION}>Other / Custom Engine...</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
            </div>
          )}
        </div>

        {/* Drivetrain */}
        <div>
          <label
            htmlFor="veh-drivetrain"
            className="block text-xs font-medium text-slate-400 mb-1"
          >
            Drivetrain
          </label>
          <div className="relative">
            <select
              id="veh-drivetrain"
              value={vehicle.drivetrain}
              onChange={(e) =>
                onChange({
                  ...vehicle,
                  drivetrain: e.target.value as DrivetrainOption,
                })
              }
              className={selectClass}
            >
              {DRIVETRAIN_OPTIONS.map((dt) => (
                <option key={dt} value={dt}>
                  {dt}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Transmission */}
        <div>
          <label
            htmlFor="veh-transmission"
            className="block text-xs font-medium text-slate-400 mb-1"
          >
            Transmission
          </label>
          <div className="relative">
            <select
              id="veh-transmission"
              value={vehicle.transmission}
              onChange={(e) =>
                onChange({
                  ...vehicle,
                  transmission: e.target.value as TransmissionOption,
                })
              }
              className={selectClass}
            >
              {TRANSMISSION_OPTIONS.map((tr) => (
                <option key={tr} value={tr}>
                  {tr}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {fetchedTrims && fetchedTrims.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[#262a34] flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="font-medium text-slate-300">Trim (Optional):</span>
          {fetchedTrims.map((tr) => (
            <button
              key={tr}
              type="button"
              onClick={() => onChange({ ...vehicle, trim: tr })}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                vehicle.trim === tr
                  ? 'bg-red-600 text-white'
                  : 'bg-[#1c1f26] text-slate-300 hover:bg-[#252932]'
              }`}
            >
              {tr}
            </button>
          ))}
        </div>
      )}

      {specError && (
        <p className="mt-2.5 text-xs text-red-400 font-medium">{specError}</p>
      )}
    </section>
  );
}
