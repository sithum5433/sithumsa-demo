import { useEffect, useMemo, useState } from 'react';
import {
  Calculator,
  CalendarCheck2,
  Car,
  Fuel,
  Gauge,
  Heart,
  MessageCircle,
  Repeat,
  Scale,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Tag,
} from 'lucide-react';
import { useLang } from '../context/LanguageContext.jsx';
import {
  buildWhatsAppUrl,
  formatCurrency,
  formatMileage,
  getPrimaryPhoto,
} from '../utils/format.js';
import { calculateLeasing } from '../utils/leasing.js';

const CATEGORIES = ['All', 'SUV', 'Car', 'Hybrid / EV', 'Pickup / Truck', 'Van'];
const CONDITIONS = ['All', 'Brand New', 'Reconditioned', 'Used'];

export function VehicleCatalog({
  vehicles,
  business,
  quickFilter,
  shortlistIds = [],
  compareIds = [],
  onToggleShortlist,
  onToggleCompare,
  onSelectVehicle,
  onCalculateLease,
  onExchangeForVehicle,
  onBookViewing,
}) {
  const { t } = useLang();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [condition, setCondition] = useState('All');
  const [maxPrice, setMaxPrice] = useState(0);
  const [onlySaved, setOnlySaved] = useState(false);
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    if (!quickFilter) return;
    if (quickFilter.onlySaved) {
      setOnlySaved(true);
      setCategory('All');
      setCondition('All');
      setMaxPrice(0);
    } else {
      setOnlySaved(false);
      setCategory(quickFilter.category || 'All');
      setCondition(quickFilter.condition || 'All');
      setMaxPrice(quickFilter.maxPrice || 0);
    }
  }, [quickFilter]);

  const currencySymbol = business?.currency_symbol || 'Rs.';
  const defaultRate = Number(business?.default_interest_rate ?? 13.5);
  const defaultDownPct = Number(business?.default_down_payment_pct ?? 25);
  const defaultMonths = Number(business?.default_lease_months ?? 48);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = vehicles.filter((v) => {
      if (onlySaved && !shortlistIds.includes(v.id)) return false;
      if (category !== 'All' && v.category !== category) return false;
      if (condition !== 'All' && v.condition !== condition) return false;
      if (maxPrice > 0 && Number(v.retail_price) > maxPrice) return false;
      if (q) {
        const hay = `${v.title} ${v.make} ${v.model} ${v.year} ${v.stock_code} ${v.fuel_type}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const sorted = [...list];
    if (sortBy === 'price_asc') sorted.sort((a, b) => a.retail_price - b.retail_price);
    else if (sortBy === 'price_desc') sorted.sort((a, b) => b.retail_price - a.retail_price);
    else if (sortBy === 'newest_year') sorted.sort((a, b) => b.year - a.year);
    return sorted;
  }, [vehicles, search, category, condition, maxPrice, onlySaved, shortlistIds, sortBy]);

  return (
    <section id="inventory" className="mx-auto max-w-7xl px-4 py-10 sm:py-16 sm:px-6 lg:px-8">
      {/* Editorial Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="text-[11px] font-bold tracking-[0.22em] text-[#9A7418] uppercase">
            {t('cat_eyebrow')}
          </div>
          <h2 className="font-serif-lux mt-2 text-2xl sm:text-3xl font-bold text-slate-950 lg:text-4xl">
            {t('cat_title')}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
            {t('cat_sub')}
          </p>
        </div>

        {/* Search & Sort */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('cat_search')}
              className="input-field w-full pl-10 sm:w-64"
            />
          </div>
          <div className="relative">
            <SlidersHorizontal className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field pl-10 pr-8"
              aria-label="Sort vehicles"
            >
              <option value="featured">Signature Picks First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest_year">Newest Model Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="mt-6 flex flex-col gap-3 border-b border-slate-200 pb-5 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-4">
        <div className="-mx-4 flex flex-nowrap gap-2 overflow-x-auto no-scrollbar px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          {CATEGORIES.map((cat) => {
            const active = !onlySaved && category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setOnlySaved(false);
                  setCategory(cat);
                }}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold tracking-wide transition cursor-pointer ${
                  active
                    ? 'bg-[#0B0F17] text-[#E5C158] shadow-sm'
                    : 'border border-slate-200 bg-white text-slate-700 hover:border-[#D4AF37]'
                }`}
              >
                {cat}
              </button>
            );
          })}
          {shortlistIds.length > 0 && (
            <button
              type="button"
              onClick={() => setOnlySaved((p) => !p)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer ${
                onlySaved
                  ? 'bg-red-700 text-white shadow-sm'
                  : 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              <Heart className="h-3.5 w-3.5 fill-current" />
              Saved ({shortlistIds.length})
            </button>
          )}
        </div>

        <div className="-mx-4 flex flex-nowrap items-center gap-2 overflow-x-auto no-scrollbar px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          {maxPrice > 0 && (
            <button
              type="button"
              onClick={() => setMaxPrice(0)}
              className="shrink-0 rounded-lg bg-amber-100 px-2.5 py-1.5 text-xs font-bold text-amber-900 cursor-pointer"
            >
              Under {formatCurrency(maxPrice, currencySymbol)} ✕
            </button>
          )}
          <span className="shrink-0 text-xs font-semibold text-slate-500">Condition:</span>
          {CONDITIONS.map((cond) => {
            const active = condition === cond;
            return (
              <button
                key={cond}
                type="button"
                onClick={() => setCondition(cond)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  active
                    ? 'bg-[#D4AF37] text-slate-950 shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {cond}
              </button>
            );
          })}
        </div>
      </div>

      {/* Showroom Grid */}
      {filtered.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Car className="mx-auto h-10 w-10 text-slate-400" />
          <h3 className="font-serif-lux mt-3 text-xl font-bold text-slate-900">
            No matching vehicles in current view
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Reset your filters or ask our sourcing concierge — we import and acquire wholesale stock daily.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setCategory('All');
              setCondition('All');
              setMaxPrice(0);
              setOnlySaved(false);
            }}
            className="btn-secondary mt-5"
          >
            View All Showroom Stock
          </button>
        </div>
      ) : (
        <div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((vehicle) => {
            const photoUrl = getPrimaryPhoto(vehicle);
            const isSaved = shortlistIds.includes(vehicle.id);
            const isCompared = compareIds.includes(vehicle.id);

            const monthlyEmi = calculateLeasing({
              vehiclePrice: vehicle.retail_price,
              downPaymentAmount: (vehicle.retail_price * defaultDownPct) / 100,
              annualInterestRate: defaultRate,
              tenureMonths: defaultMonths,
            }).monthlyInstallment;

            const waUrl = buildWhatsAppUrl(
              business?.whatsapp_number,
              `Hi ${business?.business_name || 'Sithumsa Enterprise'}, I am interested in ${vehicle.year} ${vehicle.title} (Stock: ${vehicle.stock_code}) listed at ${formatCurrency(vehicle.retail_price, currencySymbol)}. Is it available for viewing today?`
            );

            return (
              <article
                key={vehicle.id}
                className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[#D4AF37] hover:shadow-2xl"
              >
                {/* Photo Stage */}
                <div className="relative aspect-[16/10] overflow-hidden bg-[#07090E]">
                  <img
                    src={photoUrl}
                    alt={vehicle.title}
                    onClick={() => onSelectVehicle(vehicle)}
                    className="h-full w-full cursor-pointer object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/75 to-transparent" />

                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-bold tracking-wide shadow-sm ${
                        vehicle.condition === 'Brand New'
                          ? 'bg-emerald-600 text-white'
                          : vehicle.condition === 'Reconditioned'
                          ? 'bg-[#D4AF37] text-slate-950'
                          : 'bg-[#0B0F17]/90 text-white border border-white/15'
                      }`}
                    >
                      {vehicle.condition}
                    </span>
                    {vehicle.featured === 1 && (
                      <span className="rounded-full bg-red-700/95 px-2.5 py-1 text-[10px] font-bold tracking-wider text-white uppercase">
                        Signature Pick
                      </span>
                    )}
                  </div>

                  {/* Top-Right Save & Compare Icons */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onToggleCompare?.(vehicle.id)}
                      className={`rounded-full p-2.5 text-xs backdrop-blur-xs transition cursor-pointer ${
                        isCompared
                          ? 'bg-[#D4AF37] text-slate-950 shadow'
                          : 'bg-black/55 text-white hover:bg-black/80'
                      }`}
                      title="Compare side-by-side"
                      aria-label="Compare vehicle"
                    >
                      <Scale className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleShortlist?.(vehicle.id)}
                      className={`rounded-full p-2.5 backdrop-blur-xs transition cursor-pointer ${
                        isSaved
                          ? 'bg-white text-red-600 shadow'
                          : 'bg-black/55 text-white hover:bg-black/80'
                      }`}
                      title="Save to shortlist"
                      aria-label="Save vehicle"
                    >
                      <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <div className="absolute inset-x-3 bottom-2.5 flex items-center justify-between text-[11px] text-white">
                    <span className="inline-flex items-center gap-1 font-semibold text-[#F6E7C1]">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                      Certified Stock
                    </span>
                    <span className="rounded-md bg-black/65 px-2 py-0.5 font-mono text-[11px] text-slate-200">
                      {vehicle.stock_code}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <div className="text-[11px] font-bold tracking-[0.16em] text-[#9A7418] uppercase">
                    {vehicle.year} • {vehicle.make} • {vehicle.category}
                  </div>
                  <h3
                    onClick={() => onSelectVehicle(vehicle)}
                    className="font-serif-lux mt-1 cursor-pointer text-lg sm:text-xl font-bold leading-snug text-slate-950 transition hover:text-[#9A7418]"
                  >
                    {vehicle.title}
                  </h3>

                  {/* Price + Monthly Lease Affordability Anchor */}
                  <div className="mt-3.5 rounded-2xl border border-slate-200/80 bg-[#FAF9F5] p-3.5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-500">{t('cat_price')}</span>
                      <span className="font-display text-lg sm:text-xl font-extrabold text-slate-950 tabular-nums">
                        {formatCurrency(vehicle.retail_price, currencySymbol)}
                      </span>
                    </div>
                    {vehicle.leasing_eligible ? (
                      <div className="mt-1.5 flex items-center justify-between border-t border-slate-200/70 pt-1.5 text-xs">
                        <span className="font-medium text-slate-600">
                          {t('cat_or_lease')} ({defaultDownPct}%)
                        </span>
                        <button
                          type="button"
                          onClick={() => onCalculateLease(vehicle)}
                          className="font-bold text-[#9A7418] hover:underline tabular-nums cursor-pointer"
                        >
                          {formatCurrency(monthlyEmi, currencySymbol)} / mo →
                        </button>
                      </div>
                    ) : null}
                    {Number(vehicle.wholesale_price) > 0 && (
                      <div className="mt-1 flex items-center justify-between text-[11px] text-emerald-700">
                        <span className="inline-flex items-center gap-1 font-semibold">
                          <Tag className="h-3 w-3" />
                          {t('cat_wholesale')}
                        </span>
                        <span className="font-bold tabular-nums">
                          {formatCurrency(vehicle.wholesale_price, currencySymbol)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Specs */}
                  <div className="mt-3.5 grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5">
                      <Gauge className="h-3.5 w-3.5 text-slate-400" />
                      <span className="truncate">{formatMileage(vehicle.mileage_km)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5">
                      <Fuel className="h-3.5 w-3.5 text-slate-400" />
                      <span className="truncate">{vehicle.fuel_type}</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5">
                      <Settings2 className="h-3.5 w-3.5 text-slate-400" />
                      <span className="truncate">{vehicle.transmission}</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5">
                      <Repeat className="h-3.5 w-3.5 text-slate-400" />
                      <span className="truncate">
                        {vehicle.exchange_eligible ? 'Trade-In Welcome' : 'Direct Purchase'}
                      </span>
                    </div>
                  </div>

                  {/* Conversion CTAs */}
                  <div className="mt-5 grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onBookViewing?.(vehicle)}
                      className="btn-primary py-2.5 text-xs"
                    >
                      <CalendarCheck2 className="h-3.5 w-3.5" />
                      {t('cat_book')}
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectVehicle(vehicle)}
                      className="btn-dark py-2.5 text-xs"
                    >
                      {t('cat_specs')}
                    </button>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => onCalculateLease(vehicle)}
                      className="btn-secondary py-2 px-2 text-[11px]"
                    >
                      <Calculator className="h-3.5 w-3.5 text-[#9A7418]" />
                      {t('cat_lease')}
                    </button>
                    <button
                      type="button"
                      onClick={() => onExchangeForVehicle(vehicle)}
                      className="btn-secondary py-2 px-2 text-[11px]"
                    >
                      <Repeat className="h-3.5 w-3.5 text-[#9A7418]" />
                      {t('cat_exchange')}
                    </button>
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-whatsapp py-2 px-2 text-[11px]"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      {t('cat_chat')}
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
