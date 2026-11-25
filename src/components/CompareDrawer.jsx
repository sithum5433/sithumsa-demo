import { useState } from 'react';
import { CalendarCheck2, Scale, Trash2, X } from 'lucide-react';
import { formatCurrency, formatMileage, getPrimaryPhoto } from '../utils/format.js';
import { calculateLeasing } from '../utils/leasing.js';

export function CompareBarAndModal({ compareIds, vehicles, business, onToggleCompare, onClear, onBookViewing }) {
  const [open, setOpen] = useState(false);

  const selected = compareIds
    .map((id) => vehicles.find((v) => v.id === id))
    .filter(Boolean);

  if (selected.length === 0) return null;

  const currency = business?.currency_symbol || 'Rs.';
  const rate = Number(business?.default_interest_rate ?? 13.5);
  const downPct = Number(business?.default_down_payment_pct ?? 25);
  const months = Number(business?.default_lease_months ?? 48);

  return (
    <>
      {/* Floating bottom luxury compare tray */}
      <div className="no-print fixed bottom-20 md:bottom-4 left-1/2 z-40 w-[calc(100%-1.5rem)] sm:w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 rounded-2xl border border-[#D4AF37]/45 bg-[#07090E]/95 px-3 py-2.5 sm:px-4 sm:py-3 text-white shadow-2xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/20 text-[#E5C158]">
              <Scale className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white">
                Compare Vehicles ({selected.length}/3)
              </div>
              <div className="text-[11px] text-slate-400 truncate max-w-[175px] sm:max-w-sm">
                {selected.map((v) => v.model).join(' vs ')}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onClear}
              className="rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 cursor-pointer"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="btn-primary py-2 px-3 sm:px-4 text-xs"
            >
              Compare <span className="hidden sm:inline">Side-by-Side</span>
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 p-0 sm:p-4 backdrop-blur-xs"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[92dvh] w-full max-w-5xl overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-[#D4AF37]/30 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between bg-[#07090E] px-4 py-3.5 sm:px-6 sm:py-4 text-white">
              <div>
                <div className="text-[10px] font-bold tracking-[0.2em] text-[#E5C158] uppercase">
                  Side-by-Side Showroom Evaluation
                </div>
                <h3 className="font-serif-lux text-lg sm:text-xl font-bold">Compare Selected Vehicles</h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full bg-white/10 p-2.5 text-slate-300 hover:bg-white/20 cursor-pointer"
                aria-label="Close comparison"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-x-auto p-4 sm:p-6">
              <div className="mb-2 text-[11px] font-medium text-slate-400 sm:hidden">
                Swipe horizontally to compare specs →
              </div>
              <table className="w-full min-w-[600px] text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="w-36 pb-4 font-bold text-slate-500 uppercase tracking-wider">
                      Specification
                    </th>
                    {selected.map((v) => (
                      <th key={v.id} className="pb-4 px-3 align-top">
                        <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-slate-900">
                          <img src={getPrimaryPhoto(v)} alt={v.title} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => onToggleCompare(v.id)}
                            className="absolute top-2 right-2 rounded-full bg-black/70 p-1.5 text-white hover:bg-rose-600 cursor-pointer"
                            title="Remove"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="mt-2 text-[11px] font-bold text-[#B88E28]">{v.stock_code}</div>
                        <div className="font-serif-lux text-base font-bold text-slate-900">
                          {v.year} {v.title}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 font-semibold text-slate-500">Retail Price</td>
                    {selected.map((v) => (
                      <td key={v.id} className="py-3 px-3 font-display text-base font-extrabold text-slate-900 tabular-nums">
                        {formatCurrency(v.retail_price, currency)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-500">Est. Monthly Lease</td>
                    {selected.map((v) => {
                      const emi = calculateLeasing({
                        vehiclePrice: v.retail_price,
                        downPaymentAmount: (v.retail_price * downPct) / 100,
                        annualInterestRate: rate,
                        tenureMonths: months,
                      }).monthlyInstallment;
                      return (
                        <td key={v.id} className="py-3 px-3 font-bold text-[#9A7418] tabular-nums">
                          {formatCurrency(emi, currency)} / mo
                        </td>
                      );
                    })}
                  </tr>
                  {[
                    ['Condition', (v) => v.condition],
                    ['Category', (v) => v.category],
                    ['Mileage', (v) => formatMileage(v.mileage_km)],
                    ['Fuel / Powertrain', (v) => v.fuel_type],
                    ['Transmission', (v) => v.transmission],
                    ['Engine / Battery', (v) => v.engine_cc || 'Standard'],
                    ['Seats', (v) => `${v.seats || 5} Seats`],
                  ].map(([label, getter]) => (
                    <tr key={label}>
                      <td className="py-2.5 font-semibold text-slate-500">{label}</td>
                      {selected.map((v) => (
                        <td key={v.id} className="py-2.5 px-3 font-medium text-slate-800">
                          {getter(v)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <td className="pt-4 font-semibold text-slate-500">VIP Action</td>
                    {selected.map((v) => (
                      <td key={v.id} className="pt-4 px-3">
                        <button
                          type="button"
                          onClick={() => {
                            setOpen(false);
                            onBookViewing(v);
                          }}
                          className="btn-primary w-full py-2.5 text-xs"
                        >
                          <CalendarCheck2 className="h-3.5 w-3.5" />
                          Book Test Drive
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
