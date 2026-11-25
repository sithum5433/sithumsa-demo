import { useEffect, useState } from 'react';
import { Calculator, CheckCircle2, FileDown, MessageCircle, Percent, ShieldCheck } from 'lucide-react';
import { useLang } from '../context/LanguageContext.jsx';
import { buildWhatsAppUrl, formatCurrency } from '../utils/format.js';
import { calculateLeasing } from '../utils/leasing.js';
import { downloadLeaseQuotePdf } from '../utils/demoDownloads.js';

const TENURE_OPTIONS = [12, 24, 36, 48, 60, 72];

export function LeasingCalculator({ vehicles, business, selectedVehicle }) {
  const { t } = useLang();
  const defaultRate = Number(business?.default_interest_rate ?? 13.5);
  const defaultDownPct = Number(business?.default_down_payment_pct ?? 25);
  const defaultMonths = Number(business?.default_lease_months ?? 48);
  const currency = business?.currency_symbol || 'Rs.';

  const [vehicleId, setVehicleId] = useState('custom');
  const [vehiclePrice, setVehiclePrice] = useState(18900000);
  const [downPct, setDownPct] = useState(defaultDownPct);
  const [tradeInCredit, setTradeInCredit] = useState(0);
  const [interestRate, setInterestRate] = useState(defaultRate);
  const [tenureMonths, setTenureMonths] = useState(defaultMonths);
  const [processingFee, setProcessingFee] = useState(0);

  useEffect(() => {
    if (selectedVehicle) {
      setVehicleId(String(selectedVehicle.id));
      setVehiclePrice(Number(selectedVehicle.retail_price) || 0);
    } else if (vehicles.length > 0 && vehicleId === 'custom') {
      setVehicleId(String(vehicles[0].id));
      setVehiclePrice(Number(vehicles[0].retail_price) || 0);
    }
  }, [selectedVehicle]);

  useEffect(() => {
    setInterestRate(defaultRate);
    setDownPct(defaultDownPct);
    setTenureMonths(defaultMonths);
  }, [defaultRate, defaultDownPct, defaultMonths]);

  const handleVehicleChange = (nextId) => {
    setVehicleId(nextId);
    if (nextId !== 'custom') {
      const found = vehicles.find((v) => String(v.id) === nextId);
      if (found) {
        setVehiclePrice(Number(found.retail_price) || 0);
      }
    }
  };

  const downPaymentAmount = Math.round((vehiclePrice * downPct) / 100);
  const result = calculateLeasing({
    vehiclePrice,
    downPaymentAmount,
    tradeInCredit,
    annualInterestRate: interestRate,
    tenureMonths,
    processingFee,
  });

  const chosenVehicle = vehicles.find((v) => String(v.id) === vehicleId);
  const vehicleLabel = chosenVehicle
    ? `${chosenVehicle.year} ${chosenVehicle.title} (${chosenVehicle.stock_code})`
    : `Custom Vehicle (${formatCurrency(vehiclePrice, currency)})`;

  const principalPct =
    result.totalOutlay > 0 ? Math.round((result.financedPrincipal / result.totalOutlay) * 100) : 0;
  const interestPct =
    result.totalOutlay > 0 ? Math.round((result.totalInterest / result.totalOutlay) * 100) : 0;
  const upfrontPct = Math.max(0, 100 - principalPct - interestPct);

  const waUrl = buildWhatsAppUrl(
    business?.whatsapp_number,
    `Hi ${business?.business_name || 'Sithumsa Enterprise'}, I calculated a lease quote:\n• Vehicle: ${vehicleLabel}\n• Price: ${formatCurrency(vehiclePrice, currency)}\n• Down Payment (${downPct}%): ${formatCurrency(downPaymentAmount, currency)}\n• Trade-In Credit: ${formatCurrency(tradeInCredit, currency)}\n• Tenure: ${tenureMonths} months @ ${interestRate}% p.a.\n• Estimated Monthly Installment: ${formatCurrency(result.monthlyInstallment, currency)}\n\nPlease share available leasing packages!`
  );

  return (
    <section id="leasing" className="bg-[#07090E] py-12 sm:py-18 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.22em] text-[#E5C158] uppercase">
            <Calculator className="h-3.5 w-3.5" />
            {t('lease_eyebrow')}
          </div>
          <h2 className="font-serif-lux mt-2 text-2xl sm:text-3xl font-bold text-white lg:text-4xl">
            {t('lease_title')}
          </h2>
          <p className="mt-2 text-sm text-slate-300 sm:text-base">
            {t('lease_sub')}
          </p>
        </div>

        <div className="mt-7 sm:mt-9 grid gap-6 sm:gap-8 lg:grid-cols-12">
          {/* Controls */}
          <div className="rounded-3xl border border-white/10 bg-[#0D121D] p-5 shadow-xl lg:col-span-7 sm:p-8">
            <div className="grid gap-4 sm:gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                  Select Showroom Vehicle or Custom Amount
                </label>
                <select
                  value={vehicleId}
                  onChange={(e) => handleVehicleChange(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/15 bg-[#07090E] px-3.5 py-3 text-base sm:text-sm text-white focus:border-[#D4AF37] focus:outline-none"
                >
                  <option value="custom">Custom Vehicle Price</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={String(v.id)}>
                      {v.year} {v.title} — {formatCurrency(v.retail_price, currency)} ({v.stock_code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                  Vehicle Price ({currency})
                </label>
                <input
                  type="number"
                  min={0}
                  step={50000}
                  value={vehiclePrice}
                  onChange={(e) => {
                    setVehicleId('custom');
                    setVehiclePrice(Math.max(0, Number(e.target.value) || 0));
                  }}
                  className="mt-2 w-full rounded-xl border border-white/15 bg-[#07090E] px-3.5 py-2.5 text-base sm:text-sm font-semibold text-white tabular-nums focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                  Trade-In / Exchange Credit ({currency})
                </label>
                <input
                  type="number"
                  min={0}
                  step={50000}
                  value={tradeInCredit}
                  onChange={(e) => setTradeInCredit(Math.max(0, Number(e.target.value) || 0))}
                  className="mt-2 w-full rounded-xl border border-white/15 bg-[#07090E] px-3.5 py-2.5 text-base sm:text-sm font-semibold text-white tabular-nums focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              {/* Down Payment Slider */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold tracking-wider text-slate-300 uppercase">
                    Down Payment ({downPct}%)
                  </span>
                  <span className="font-bold text-[#E5C158] tabular-nums">
                    {formatCurrency(downPaymentAmount, currency)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={80}
                  step={5}
                  value={downPct}
                  onChange={(e) => setDownPct(Number(e.target.value))}
                  className="mt-2.5 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-[#D4AF37]"
                />
                <div className="mt-1 flex justify-between text-[11px] text-slate-500">
                  <span>0%</span>
                  <span>25% Standard</span>
                  <span>50%</span>
                  <span>80%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                  Interest Rate (% p.a.)
                </label>
                <div className="relative mt-2">
                  <input
                    type="number"
                    min={0}
                    max={50}
                    step={0.5}
                    value={interestRate}
                    onChange={(e) => setInterestRate(Math.max(0, Math.min(50, Number(e.target.value) || 0)))}
                    className="w-full rounded-xl border border-white/15 bg-[#07090E] px-3.5 py-2.5 pr-9 text-base sm:text-sm font-semibold text-white tabular-nums focus:border-[#D4AF37] focus:outline-none"
                  />
                  <Percent className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                  Doc / Stamp Fee ({currency})
                </label>
                <input
                  type="number"
                  min={0}
                  step={5000}
                  value={processingFee}
                  onChange={(e) => setProcessingFee(Math.max(0, Number(e.target.value) || 0))}
                  className="mt-2 w-full rounded-xl border border-white/15 bg-[#07090E] px-3.5 py-2.5 text-base sm:text-sm font-semibold text-white tabular-nums focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold tracking-wider text-slate-300 uppercase">
                  Lease Tenure (Months)
                </label>
                <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {TENURE_OPTIONS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setTenureMonths(m)}
                      className={`rounded-xl py-3 text-xs font-bold transition cursor-pointer ${
                        tenureMonths === m
                          ? 'bg-[#D4AF37] text-slate-950 shadow-lg shadow-[#D4AF37]/20'
                          : 'border border-white/10 bg-[#07090E] text-slate-300 hover:border-[#D4AF37]/40'
                      }`}
                    >
                      {m} mo
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Result Card */}
          <div className="flex flex-col justify-between rounded-3xl border border-[#D4AF37]/35 bg-gradient-to-br from-[#0F1624] via-[#090D16] to-[#05070B] p-5 shadow-2xl lg:col-span-5 sm:p-8">
            <div>
              <div className="text-[11px] font-bold tracking-[0.2em] text-[#E5C158] uppercase">
                Estimated Monthly Installment
              </div>
              <div className="font-serif-lux mt-2 text-3xl font-bold text-white sm:text-4xl lg:text-5xl tabular-nums break-words">
                {formatCurrency(result.monthlyInstallment, currency)}
                <span className="font-display text-base font-medium text-slate-400"> / mo</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                For {tenureMonths} months at {interestRate}% p.a. reducing balance
              </p>

              {/* CSP-clean SVG Proportional Breakdown Bar (zero inline styles) */}
              <div className="mt-6">
                <svg
                  viewBox="0 0 100 4"
                  preserveAspectRatio="none"
                  className="h-3 w-full overflow-hidden rounded-full bg-slate-800"
                  aria-label="Payment breakdown bar"
                >
                  <rect x="0" y="0" width={upfrontPct} height="4" fill="#D4AF37" />
                  <rect x={upfrontPct} y="0" width={principalPct} height="4" fill="#38BDF8" />
                  <rect x={upfrontPct + principalPct} y="0" width={interestPct} height="4" fill="#FB7185" />
                </svg>
                <div className="mt-2.5 flex flex-wrap gap-3 text-[11px] text-slate-300">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#D4AF37]" />
                    Upfront ({upfrontPct}%)
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
                    Financed ({principalPct}%)
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                    Interest ({interestPct}%)
                  </span>
                </div>
              </div>

              <dl className="mt-6 space-y-3 border-t border-white/10 pt-5 text-sm tabular-nums">
                <div className="flex justify-between">
                  <dt className="text-slate-400">Cash Upfront (Down + Fees)</dt>
                  <dd className="font-semibold text-white">
                    {formatCurrency(result.upfrontRequired, currency)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">Net Financed Amount</dt>
                  <dd className="font-semibold text-sky-300">
                    {formatCurrency(result.financedPrincipal, currency)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">Total Interest ({tenureMonths} mo)</dt>
                  <dd className="font-semibold text-rose-300">
                    {formatCurrency(result.totalInterest, currency)}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-3">
                  <dt className="font-bold text-slate-200">Total Payable</dt>
                  <dd className="font-serif-lux text-lg font-bold text-[#E5C158]">
                    {formatCurrency(result.totalOutlay, currency)}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-6 space-y-3">
              <div className="grid gap-2.5 sm:grid-cols-2">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp w-full py-3.5 text-xs"
                >
                  <MessageCircle className="h-4 w-4" />
                  {t('lease_wa')}
                </a>
                <button
                  type="button"
                  onClick={() =>
                    downloadLeaseQuotePdf({
                      business,
                      vehicleTitle: vehicleLabel,
                      vehiclePrice,
                      downPaymentAmount,
                      downPct,
                      tradeInCredit,
                      interestRate,
                      tenureMonths,
                      processingFee,
                      result,
                    })
                  }
                  className="btn-primary w-full py-3.5 text-xs"
                >
                  <FileDown className="h-4 w-4" />
                  {t('lease_pdf')}
                </button>
              </div>
              <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  1-Hour Pre-Approval
                </span>
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#E5C158]" />
                  Central Bank Registered Partners
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
