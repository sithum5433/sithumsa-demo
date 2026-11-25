import { useEffect, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  MessageCircle,
  Repeat,
  Send,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { apiRequest } from '../api/client.js';
import { buildWhatsAppUrl, formatCurrency } from '../utils/format.js';

export function ExchangeSection({ vehicles, business, selectedVehicle, onNotify }) {
  const currency = business?.currency_symbol || 'Rs.';

  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    old_make: '',
    old_model: '',
    old_year: String(new Date().getFullYear() - 5),
    old_mileage_km: '',
    old_condition: 'Good',
    expected_price: '',
    target_vehicle_id: '',
    notes: '',
    website_url: '',
  });

  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(null);

  useEffect(() => {
    if (selectedVehicle) {
      setForm((prev) => ({
        ...prev,
        target_vehicle_id: String(selectedVehicle.id),
      }));
    }
  }, [selectedVehicle]);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [files]);

  const handleFilePick = (e) => {
    const picked = Array.from(e.target.files || []);
    const combined = [...files, ...picked].slice(0, 5);
    setFiles(combined);
    e.target.value = '';
  };

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          fd.append(key, String(value));
        }
      });
      files.forEach((file) => fd.append('photos', file));

      const data = await apiRequest('/api/public/exchanges', {
        method: 'POST',
        body: fd,
        isFormData: true,
      });

      setSubmittedResult({
        ...data,
        summary: { ...form },
      });
      setFiles([]);
      onNotify?.('Exchange request submitted! GPS metadata was stripped automatically for your privacy.');
    } catch (err) {
      onNotify?.(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const targetVehicle = vehicles.find((v) => String(v.id) === String(form.target_vehicle_id));
  const quickWhatsAppMsg = submittedResult
    ? `Hi ${business?.business_name || 'Sithumsa Enterprise'}, I just submitted an Exchange Request (Ref: ${submittedResult.reference_code}).\n• My Name: ${submittedResult.summary.customer_name}\n• My Old Vehicle: ${submittedResult.summary.old_year} ${submittedResult.summary.old_make} ${submittedResult.summary.old_model} (${submittedResult.summary.old_condition})\n${submittedResult.target_vehicle_title ? `• Upgrading To: ${submittedResult.target_vehicle_title}\n` : ''}I am attaching photos of my old vehicle here for a valuation!`
    : `Hi ${business?.business_name || 'Sithumsa Enterprise'}, I want to exchange / sell my old vehicle:\n• Make & Model: ${form.old_year || ''} ${form.old_make || 'My Vehicle'} ${form.old_model || ''}\n• Mileage: ${form.old_mileage_km || 'N/A'} km\n${targetVehicle ? `• Interested In: ${targetVehicle.year} ${targetVehicle.title} (${targetVehicle.stock_code})\n` : ''}Sending my old vehicle photos now!`;

  const waUrl = buildWhatsAppUrl(business?.whatsapp_number, quickWhatsAppMsg);

  return (
    <section id="exchange" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
        {/* Left Value Prop */}
        <div className="lg:col-span-5">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.22em] text-[#9A7418] uppercase">
            <Repeat className="h-3.5 w-3.5" />
            Seamless Upgrade &amp; Direct Buyout
          </div>
          <h2 className="font-serif-lux mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">
            Turn Your Current Car Into Instant Equity
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            Upgrade into any vehicle on our floor without the stress of private classifieds. Upload photos securely (we automatically strip location/EXIF metadata) or send them straight via WhatsApp.
          </p>

          <div className="mt-6 space-y-3.5">
            {[
              ['1. Share 3–5 Photos', 'Front, rear, cabin interior, and odometer reading of your current vehicle.'],
              ['2. Receive Top-Market Offer', 'Our senior valuers inspect and issue a firm trade-in credit within hours.'],
              ['3. Drive Your Upgrade Home', 'Deduct 100% of your old car’s value from your cash invoice or lease down payment.'],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <div className="font-serif-lux text-sm font-bold text-slate-950">{title}</div>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-3xl border border-[#D4AF37]/30 bg-[#07090E] p-6 text-white shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#D4AF37]/20 text-[#E5C158]">
                <Camera className="h-5 w-5" />
              </div>
              <div>
                <div className="font-serif-lux text-base font-bold">Fastest: WhatsApp Valuation Desk</div>
                <p className="text-xs text-slate-300">Snap &amp; send your old vehicle photos directly</p>
              </div>
            </div>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp mt-4 w-full py-3"
            >
              <MessageCircle className="h-4 w-4" />
              Send Old Car Photos via WhatsApp
            </a>
          </div>
        </div>

        {/* Right Form */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl lg:col-span-7 sm:p-8">
          {submittedResult ? (
            <div className="py-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="font-serif-lux mt-4 text-2xl font-bold text-slate-900">
                Trade-In Valuation Registered
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Reference Code:{' '}
                <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono font-bold text-slate-900">
                  {submittedResult.reference_code}
                </span>
              </p>
              <p className="mx-auto mt-3 max-w-md text-xs leading-relaxed text-slate-500">
                Our valuation desk has received your submission ({submittedResult.photos?.length || 0} photo(s) attached). Tap below to open WhatsApp with your reference code for live chat!
              </p>

              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp px-6 py-3"
                >
                  <MessageCircle className="h-4 w-4" />
                  Send Photos &amp; Chat on WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => setSubmittedResult(null)}
                  className="btn-secondary px-6 py-3"
                >
                  Submit Another Vehicle
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="website_url"
                value={form.website_url}
                onChange={(e) => setForm({ ...form, website_url: e.target.value })}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />

              <h3 className="font-serif-lux text-xl font-bold text-slate-950">
                Request Free Trade-In / Buyout Valuation
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Your Full Name *</label>
                  <input
                    required
                    type="text"
                    value={form.customer_name}
                    onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                    placeholder="e.g. Kamal Silva"
                    className="input-field mt-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">WhatsApp / Phone Number *</label>
                  <input
                    required
                    type="tel"
                    value={form.customer_phone}
                    onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                    placeholder="e.g. +94 77 123 4567"
                    className="input-field mt-1"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Old Vehicle Make *</label>
                  <input
                    required
                    type="text"
                    value={form.old_make}
                    onChange={(e) => setForm({ ...form, old_make: e.target.value })}
                    placeholder="e.g. Toyota, Honda, Nissan"
                    className="input-field mt-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Old Vehicle Model *</label>
                  <input
                    required
                    type="text"
                    value={form.old_model}
                    onChange={(e) => setForm({ ...form, old_model: e.target.value })}
                    placeholder="e.g. Aqua, Vezel, Axio"
                    className="input-field mt-1"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Model Year *</label>
                  <input
                    required
                    type="number"
                    min={1960}
                    max={new Date().getFullYear() + 1}
                    value={form.old_year}
                    onChange={(e) => setForm({ ...form, old_year: e.target.value })}
                    className="input-field mt-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Mileage (km)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.old_mileage_km}
                    onChange={(e) => setForm({ ...form, old_mileage_km: e.target.value })}
                    placeholder="e.g. 68000"
                    className="input-field mt-1"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Vehicle Condition</label>
                  <select
                    value={form.old_condition}
                    onChange={(e) => setForm({ ...form, old_condition: e.target.value })}
                    className="input-field mt-1"
                  >
                    <option value="Excellent">Excellent (Showroom)</option>
                    <option value="Good">Good (Well Maintained)</option>
                    <option value="Fair">Fair (Normal Wear)</option>
                    <option value="Needs Repair">Needs Repair</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Expected Value ({currency})
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.expected_price}
                    onChange={(e) => setForm({ ...form, expected_price: e.target.value })}
                    placeholder="Optional"
                    className="input-field mt-1"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Upgrade Target Vehicle (Optional)
                  </label>
                  <select
                    value={form.target_vehicle_id}
                    onChange={(e) => setForm({ ...form, target_vehicle_id: e.target.value })}
                    className="input-field mt-1"
                  >
                    <option value="">Direct Sale / Undecided Upgrade</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={String(v.id)}>
                        {v.year} {v.title} — {formatCurrency(v.retail_price, currency)} ({v.stock_code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Upload Photos of Your Old Vehicle (Up to 5 JPG/PNG/WebP)
                  </label>
                  <label className="mt-1.5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center transition hover:border-[#D4AF37] hover:bg-amber-50/30">
                    <UploadCloud className="h-7 w-7 text-[#9A7418]" />
                    <span className="mt-1.5 text-xs font-semibold text-slate-700">
                      Click to select photos ({files.length}/5 selected)
                    </span>
                    <span className="mt-0.5 text-[11px] text-slate-500">
                      Max 5 MB per photo • Location EXIF data stripped automatically
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={handleFilePick}
                      className="hidden"
                    />
                  </label>

                  {previews.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-2.5 sm:grid-cols-5">
                      {previews.map((src, idx) => (
                        <div key={src} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200">
                          <img src={src} alt="" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="absolute top-1 right-1 rounded-full bg-rose-600 p-1 text-white opacity-90 shadow hover:bg-rose-700 cursor-pointer"
                            aria-label="Remove photo"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700">Additional Notes</label>
                  <textarea
                    rows={2}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Service history, owner count, lease settlement if any..."
                    className="input-field mt-1"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button type="submit" disabled={submitting} className="btn-primary flex-1 py-3.5">
                  <Send className="h-4 w-4" />
                  {submitting ? 'Uploading & Submitting...' : 'Get My Trade-In Offer'}
                </button>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp py-3.5"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp Direct
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
