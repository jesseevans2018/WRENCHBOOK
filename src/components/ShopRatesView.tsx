import { useRef, useState } from 'react';
import { RotateCcw, Save, Upload } from 'lucide-react';
import type { ShopRates } from '../types/mechanic';
import {
  DEFAULT_LOGO_PATH,
  DEFAULT_SHOP_RATES,
  formatCurrency,
} from '../utils/storage';

interface ShopRatesViewProps {
  rates: ShopRates;
  onSaveRates: (next: ShopRates) => void;
}

export function ShopRatesView({ rates, onSaveRates }: ShopRatesViewProps) {
  const [draft, setDraft] = useState<ShopRates>(rates);
  const [savedNotice, setSavedNotice] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveRates(draft);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2200);
  };

  const handleReset = () => {
    setDraft(DEFAULT_SHOP_RATES);
    onSaveRates(DEFAULT_SHOP_RATES);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2200);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoError(null);

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxSize = 600;
        let w = img.naturalWidth;
        let h = img.naturalHeight;
        if (w > maxSize || h > maxSize) {
          const ratio = Math.min(maxSize / w, maxSize / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL('image/png');
        const next = { ...draft, logoDataUrl: compressed };
        setDraft(next);
        onSaveRates(next);
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 2200);
      };
      img.onerror = () => setLogoError('Could not read the uploaded image.');
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const inputClass =
    'w-full h-11 px-3 bg-[#1c1f26] border border-[#2c313d] rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-600/20';

  const sampleLabor = draft.hourlyRate * 2.0;
  const sampleTotal = sampleLabor + draft.mobileCalloutFee;
  const activeLogo = draft.logoDataUrl || DEFAULT_LOGO_PATH;

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-bold text-white">
            Shop Rates, Logo & Branding
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Configure your hourly labor rate, callout fees, company logo, and legal warranty terms for formal estimates and invoices.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {savedNotice && (
            <span className="text-xs font-semibold text-emerald-400">
              Settings saved
            </span>
          )}
          <button
            type="button"
            onClick={handleReset}
            className="h-10 px-3.5 inline-flex items-center gap-1.5 text-xs font-medium text-slate-200 bg-[#1c1f26] border border-[#2c313d] hover:bg-[#252932] rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
          <button
            type="submit"
            className="h-10 px-4 inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Labor & Fee Rates */}
        <section className="bg-[#14161b] border border-[#262a34] rounded-xl p-5 space-y-4">
          <h2 className="font-display text-sm font-semibold text-white">
            Labor & Mobile Fee Schedule
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Standard Labor Rate ($/hr)
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={draft.hourlyRate}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    hourlyRate: Math.max(0, Number(e.target.value)),
                  })
                }
                className={`${inputClass} font-mono tabular-nums`}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Mobile Callout / Dispatch Fee ($)
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={draft.mobileCalloutFee}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    mobileCalloutFee: Math.max(0, Number(e.target.value)),
                  })
                }
                className={`${inputClass} font-mono tabular-nums`}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Diagnostic Minimum Fee ($)
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={draft.diagnosticFee}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    diagnosticFee: Math.max(0, Number(e.target.value)),
                  })
                }
                className={`${inputClass} font-mono tabular-nums`}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Parts Markup (%)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={draft.partsMarkupPercent}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    partsMarkupPercent: Math.max(0, Number(e.target.value)),
                  })
                }
                className={`${inputClass} font-mono tabular-nums`}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Shop Supplies (%)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={draft.shopSuppliesPercent}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    shopSuppliesPercent: Math.max(0, Number(e.target.value)),
                  })
                }
                className={`${inputClass} font-mono tabular-nums`}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Sales Tax (%)
              </label>
              <input
                type="number"
                min="0"
                step="0.25"
                value={draft.taxRatePercent}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    taxRatePercent: Math.max(0, Number(e.target.value)),
                  })
                }
                className={`${inputClass} font-mono tabular-nums`}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#262a34] text-xs text-slate-400 flex items-center justify-between">
            <span>Example 2.0-hr mobile job (labor + callout):</span>
            <span className="font-mono font-bold text-white tabular-nums">
              {formatCurrency(sampleTotal)}
            </span>
          </div>
        </section>

        {/* Company Logo & Business Details */}
        <section className="bg-[#14161b] border border-[#262a34] rounded-xl p-5 space-y-4">
          <h2 className="font-display text-sm font-semibold text-white">
            Company Logo & Document Letterhead
          </h2>

          <div className="flex items-center gap-4 p-3.5 bg-[#0b0c0f] border border-[#262a34] rounded-lg">
            <img
              src={activeLogo}
              alt={draft.businessName}
              referrerPolicy="no-referrer"
              className="w-20 h-20 object-contain rounded bg-black shrink-0"
            />
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload New Logo
                </button>
                {draft.logoDataUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      const next = { ...draft, logoDataUrl: undefined };
                      setDraft(next);
                      onSaveRates(next);
                    }}
                    className="px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-[#1c1f26] hover:bg-[#252932] rounded-md cursor-pointer"
                  >
                    Use Dependable Logo
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Appears in the app header, formal estimates, authorization agreements, and PDF invoices.
              </p>
              {logoError && (
                <p className="text-xs text-red-400">{logoError}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Business / Mechanic Name
              </label>
              <input
                type="text"
                value={draft.businessName}
                onChange={(e) =>
                  setDraft({ ...draft, businessName: e.target.value })
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Dispatch Phone Number
              </label>
              <input
                type="tel"
                value={draft.mechanicPhone}
                onChange={(e) =>
                  setDraft({ ...draft, mechanicPhone: e.target.value })
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Service Email
              </label>
              <input
                type="email"
                value={draft.businessEmail}
                onChange={(e) =>
                  setDraft({ ...draft, businessEmail: e.target.value })
                }
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Service Area / Dispatch Address
              </label>
              <input
                type="text"
                value={draft.businessAddress}
                onChange={(e) =>
                  setDraft({ ...draft, businessAddress: e.target.value })
                }
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Warranty Statement (Shown on Estimates, Agreements & Invoices)
              </label>
              <textarea
                rows={2}
                value={draft.warrantyTerms}
                onChange={(e) =>
                  setDraft({ ...draft, warrantyTerms: e.target.value })
                }
                className="w-full p-2.5 bg-[#1c1f26] border border-[#2c313d] rounded-lg text-sm text-slate-100 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-600/20"
              />
            </div>
          </div>
        </section>
      </div>
    </form>
  );
}
