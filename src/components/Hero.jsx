import {
  ArrowRight,
  Award,
  CalendarCheck2,
  Calculator,
  CheckCircle2,
  Repeat,
  ShieldCheck,
} from 'lucide-react';

export function Hero({ business, vehicleCount, handoverCount, soldCount = 0, onBookViewing }) {
  return (
    <section id="top" className="relative overflow-hidden bg-[#05070B] text-white">
      {/* Full-bleed luxury showroom photograph */}
      <div className="absolute inset-0">
        <img
          src="./images/hero-luxury.jpg"
          alt="Sithumsa Enterprise luxury showroom"
          className="h-full w-full object-cover object-center opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#05070B] via-[#05070B]/88 to-[#05070B]/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070B] via-transparent to-[#05070B]/40" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-26">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/45 bg-[#0B0F17]/80 px-4 py-1.5 text-[11px] font-bold tracking-[0.2em] text-[#E5C158] uppercase backdrop-blur-xs">
            <Award className="h-3.5 w-3.5" />
            Certified Wholesale &amp; Retail Showroom
          </div>

          <h1 className="font-serif-lux mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.65rem]">
            Command the Road in{' '}
            <span className="italic text-[#E5C158]">Uncompromising</span> Luxury.
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
            {business?.tagline ||
              'Hand-picked brand-new, reconditioned, and pre-owned cars & SUVs — backed by 120-point certification, same-day tailored leasing, and top-market trade-in valuation.'}
          </p>

          {/* Persuasive High-Conversion CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <a href="#inventory" className="btn-primary px-7 py-3.5 text-sm">
              Explore Curated Stock ({vehicleCount})
              <ArrowRight className="h-4 w-4" />
            </a>
            <button
              type="button"
              onClick={() => onBookViewing?.(null)}
              className="btn-crimson px-6 py-3.5 text-sm"
            >
              <CalendarCheck2 className="h-4 w-4" />
              Book VIP Test Drive
            </button>
            <a href="#leasing" className="btn-luxury-outline px-5 py-3.5 text-sm">
              <Calculator className="h-4 w-4 text-[#E5C158]" />
              Monthly Lease Studio
            </a>
          </div>

          {/* Instant Confidence Micro-Guarantees */}
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-slate-300">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#E5C158]" />
              120-Point Chassis &amp; Auction Verified
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              1-Hour Leasing Approval
            </span>
            <a href="#exchange" className="inline-flex items-center gap-1.5 text-[#F6E7C1] hover:underline">
              <Repeat className="h-3.5 w-3.5 text-[#E5C158]" />
              Instant Old-Car Exchange Credit →
            </a>
          </div>
        </div>

        {/* Luxury Metrics Bar */}
        <div className="mt-14 grid grid-cols-2 gap-4 rounded-2xl border border-[#D4AF37]/25 bg-[#090D15]/85 p-5 backdrop-blur-md sm:grid-cols-4 sm:p-6">
          <div className="border-r border-white/10 pr-4">
            <div className="font-serif-lux text-2xl font-bold text-white sm:text-3xl tabular-nums">
              {vehicleCount}
            </div>
            <div className="mt-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Inspected Vehicles Ready
            </div>
          </div>
          <div className="sm:border-r sm:border-white/10 sm:pr-4">
            <div className="font-serif-lux text-2xl font-bold text-[#E5C158] sm:text-3xl tabular-nums">
              {business?.default_down_payment_pct ?? 25}%
            </div>
            <div className="mt-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Drive Home Down Payment
            </div>
          </div>
          <div className="border-r border-white/10 pr-4">
            <div className="font-serif-lux text-2xl font-bold text-white sm:text-3xl tabular-nums">
              {business?.default_interest_rate ?? 13.5}%
            </div>
            <div className="mt-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Preferential Lease Rate (p.a.)
            </div>
          </div>
          <div>
            <div className="font-serif-lux text-2xl font-bold text-emerald-400 sm:text-3xl tabular-nums">
              {Math.max(handoverCount + soldCount, 25)}+
            </div>
            <div className="mt-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Verified Buyer Handovers
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
