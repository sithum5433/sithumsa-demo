import { useState } from 'react';
import {
  Calculator,
  CalendarCheck2,
  Check,
  FileDown,
  MessageCircle,
  Repeat,
  Tag,
  X,
} from 'lucide-react';
import {
  assetUrl,
  buildWhatsAppUrl,
  formatCurrency,
  formatMileage,
  getPrimaryPhoto,
} from '../utils/format.js';
import { calculateLeasing } from '../utils/leasing.js';
import { downloadVehicleSpecPdf } from '../utils/demoDownloads.js';

export function VehicleModal({
  vehicle,
  business,
  onClose,
  onCalculateLease,
  onExchangeForVehicle,
  onBookViewing,
}) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  if (!vehicle) return null;

  const photos = vehicle.photos?.length
    ? vehicle.photos.map((p) => assetUrl(p.url))
    : [getPrimaryPhoto(vehicle)];
  const currentPhoto = photos[activePhotoIndex] || photos[0];
  const currency = business?.currency_symbol || 'Rs.';

  const defaultRate = Number(business?.default_interest_rate ?? 13.5);
  const defaultDownPct = Number(business?.default_down_payment_pct ?? 25);
  const defaultMonths = Number(business?.default_lease_months ?? 48);

  const quickLease = calculateLeasing({
    vehiclePrice: vehicle.retail_price,
    downPaymentAmount: (vehicle.retail_price * defaultDownPct) / 100,
    annualInterestRate: defaultRate,
    tenureMonths: defaultMonths,
  });

  const featureList = (vehicle.features || '')
    .split(',')
    .map((f) => f.trim())
    .filter(Boolean);

  const waUrl = buildWhatsAppUrl(
    business?.whatsapp_number,
    `Hi ${business?.business_name || 'Sithumsa Enterprise'}, I want to reserve / inspect ${vehicle.year} ${vehicle.title} (Stock Code: ${vehicle.stock_code}, Price: ${formatCurrency(vehicle.retail_price, currency)}).`
  );

  const specs = [
    ['Stock Code', vehicle.stock_code],
    ['Make / Model', `${vehicle.make} ${vehicle.model}`],
    ['Model Year', vehicle.year],
    ['Condition', vehicle.condition],
    ['Body Category', vehicle.category],
    ['Mileage', formatMileage(vehicle.mileage_km)],
    ['Fuel Type', vehicle.fuel_type],
    ['Transmission', vehicle.transmission],
    ['Engine / Battery', vehicle.engine_cc || 'Standard'],
    ['Exterior Color', vehicle.color || 'Showroom Finish'],
    ['Seating Capacity', `${vehicle.seats || 5} Seats`],
    ['Registration', vehicle.registration_no || 'Inspect on Visit'],
    ['Chassis / VIN', vehicle.vin_chassis || 'Verified at Showroom'],
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-[#D4AF37]/30 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full bg-slate-900/80 p-2 text-white transition hover:bg-slate-900 cursor-pointer"
          aria-label="Close vehicle details"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid lg:grid-cols-12">
          {/* Left Gallery & Conversion Box */}
          <div className="bg-[#07090E] p-4 lg:col-span-6 lg:p-6">
            <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-slate-900">
              <img
                src={currentPhoto}
                alt={vehicle.title}
                className="h-full w-full object-cover"
              />
            </div>

            {photos.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {photos.map((url, idx) => (
                  <button
                    key={url + idx}
                    type="button"
                    onClick={() => setActivePhotoIndex(idx)}
                    className={`aspect-[16/10] overflow-hidden rounded-xl border-2 transition cursor-pointer ${
                      idx === activePhotoIndex ? 'border-[#D4AF37]' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Quick Lease Callout */}
            <div className="mt-5 rounded-2xl border border-[#D4AF37]/30 bg-white/[0.04] p-4 text-white">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Tailored Lease ({defaultDownPct}% down, {defaultMonths} mo)</span>
                <span className="font-semibold text-[#E5C158]">{defaultRate}% p.a.</span>
              </div>
              <div className="font-serif-lux mt-1 text-2xl font-bold text-[#E5C158] tabular-nums">
                {formatCurrency(quickLease.monthlyInstallment, currency)}
                <span className="font-display text-xs font-normal text-slate-300"> / month</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onBookViewing?.(vehicle);
                }}
                className="btn-primary w-full py-3.5 text-sm"
              >
                <CalendarCheck2 className="h-4 w-4" />
                Reserve VIP Test Drive / Make Offer
              </button>
              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp py-2.5 text-xs"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp Desk
                </a>
                <button
                  type="button"
                  onClick={() => downloadVehicleSpecPdf(vehicle, business)}
                  className="btn-luxury-outline py-2.5 text-xs"
                >
                  <FileDown className="h-4 w-4 text-[#E5C158]" />
                  Spec Sheet PDF
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onCalculateLease(vehicle);
                  }}
                  className="btn-luxury-outline py-2.5 text-xs"
                >
                  <Calculator className="h-4 w-4" />
                  Customize Lease
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onExchangeForVehicle(vehicle);
                  }}
                  className="btn-luxury-outline py-2.5 text-xs"
                >
                  <Repeat className="h-4 w-4" />
                  Trade-In My Car
                </button>
              </div>
            </div>
          </div>

          {/* Right Specifications */}
          <div className="p-6 lg:col-span-6 lg:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-950">
                {vehicle.condition}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {vehicle.category}
              </span>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                {vehicle.status}
              </span>
            </div>

            <h2 className="font-serif-lux mt-3 text-2xl font-bold text-slate-950">
              {vehicle.year} {vehicle.title}
            </h2>

            <div className="mt-3 flex flex-wrap items-baseline gap-4 border-b border-slate-200 pb-4">
              <div>
                <div className="text-xs font-medium text-slate-500">Showroom Price</div>
                <div className="font-display text-2xl font-extrabold text-slate-950 tabular-nums">
                  {formatCurrency(vehicle.retail_price, currency)}
                </div>
              </div>
              {Number(vehicle.wholesale_price) > 0 && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                    <Tag className="h-3 w-3" />
                    Wholesale Dealer Price
                  </div>
                  <div className="font-display text-base font-bold text-emerald-800 tabular-nums">
                    {formatCurrency(vehicle.wholesale_price, currency)}
                  </div>
                </div>
              )}
            </div>

            {vehicle.description && (
              <p className="mt-4 text-sm leading-relaxed text-slate-600">{vehicle.description}</p>
            )}

            <h3 className="mt-5 text-xs font-bold tracking-wider text-slate-500 uppercase">
              Certified Specifications
            </h3>
            <dl className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              {specs.map(([label, value]) => (
                <div key={label} className="border-b border-slate-100 pb-1.5">
                  <dt className="text-slate-400">{label}</dt>
                  <dd className="font-semibold text-slate-800">{value}</dd>
                </div>
              ))}
            </dl>

            {featureList.length > 0 && (
              <div className="mt-5">
                <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                  Signature Equipment
                </h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {featureList.map((feat) => (
                    <span
                      key={feat}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                    >
                      <Check className="h-3 w-3 text-emerald-600" />
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
