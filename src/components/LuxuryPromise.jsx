import { Award, Clock, FileCheck2, Repeat, Sparkles } from 'lucide-react';

export function LuxuryPromise({ onSelectQuickFilter }) {
  const pillars = [
    {
      icon: FileCheck2,
      title: '120-Point Certified Inspection',
      desc: 'Every chassis number, odometer reading, hybrid battery cell, and RMV / auction grade is verified before entering our floor.',
    },
    {
      icon: Clock,
      title: 'Drive Away Today with 25% Down',
      desc: 'Direct VIP desk access to leading leasing institutions — walk in with your NIC and drive home the same afternoon.',
    },
    {
      icon: Repeat,
      title: 'Highest Trade-In Guarantee',
      desc: 'Send 4 WhatsApp photos of your current car. We value it fairly and deduct 100% of its value from your upgrade.',
    },
    {
      icon: Award,
      title: 'Wholesale & Retail Transparency',
      desc: 'Zero hidden broker markups. Both individual families and registered fleet dealers receive official itemized POS invoices.',
    },
  ];

  const budgetShortcuts = [
    { label: 'Luxury & Family SUVs', filter: { category: 'SUV' } },
    { label: 'Fuel-Saving Hybrids & EVs', filter: { category: 'Hybrid / EV' } },
    { label: 'Zero-Mileage Brand New', filter: { condition: 'Brand New' } },
    { label: '4x4 Double Cabs & Utility', filter: { category: 'Pickup / Truck' } },
    { label: 'Under Rs. 15M Collection', filter: { maxPrice: 15000000 } },
  ];

  return (
    <section id="promise" className="border-b border-slate-200/80 bg-[#0B0F17] py-10 sm:py-14 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:pb-8 lg:flex-row lg:items-end">
          <div>
            <div className="text-[11px] font-bold tracking-[0.22em] text-[#E5C158] uppercase">
              The Sithumsa Standard
            </div>
            <h2 className="font-serif-lux mt-2 text-2xl font-bold text-white sm:text-3xl">
              Why Discerning Buyers Never Compromise Here
            </h2>
          </div>
          <div className="-mx-4 flex flex-nowrap items-center gap-2 overflow-x-auto no-scrollbar px-4 sm:mx-0 sm:flex-wrap sm:px-0">
            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-slate-400 mr-1">
              <Sparkles className="h-3.5 w-3.5 text-[#E5C158]" />
              Instant Finder:
            </span>
            {budgetShortcuts.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => onSelectQuickFilter(s.filter)}
                className="shrink-0 rounded-full border border-[#D4AF37]/30 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-[#F6E7C1] transition hover:border-[#D4AF37] hover:bg-[#D4AF37]/15 cursor-pointer"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-[#D4AF37]/40 hover:bg-white/[0.05]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4AF37]/15 text-[#E5C158]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-serif-lux mt-4 text-base font-bold text-white">{p.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
