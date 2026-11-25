import { useEffect, useState } from 'react';
import { CalendarCheck2, CheckCircle2, MessageCircle, Send, X } from 'lucide-react';
import { apiRequest } from '../api/client.js';
import { buildWhatsAppUrl, formatCurrency } from '../utils/format.js';

export function BookingModal({ open, vehicle, vehicles, business, onClose, onNotify }) {
  const currency = business?.currency_symbol || 'Rs.';

  const [form, setForm] = useState({
    kind: 'Test Drive / Viewing',
    customer_name: '',
    customer_phone: '',
    vehicle_id: '',
    preferred_time: '',
    message: '',
    website_url: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(null);

  useEffect(() => {
    if (open) {
      setConfirmed(null);
      setForm((prev) => ({
        ...prev,
        vehicle_id: vehicle ? String(vehicle.id) : prev.vehicle_id,
      }));
    }
  }, [open, vehicle]);

  if (!open) return null;

  const selectedVeh =
    vehicles.find((v) => String(v.id) === String(form.vehicle_id)) || vehicle || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiRequest('/api/public/inquiries', {
        method: 'POST',
        body: form,
      });
      setConfirmed({ ...res, formSnapshot: { ...form } });
      onNotify?.('VIP showroom appointment logged! Our concierge will reach out shortly.');
    } catch (err) {
      onNotify?.(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const waMessage = confirmed
    ? `Hello ${business?.business_name || 'Sithumsa Enterprise'}, I just booked a ${confirmed.formSnapshot.kind}:\n• Name: ${confirmed.formSnapshot.customer_name}\n${confirmed.vehicle_title ? `• Vehicle: ${confirmed.vehicle_title}\n` : ''}${confirmed.formSnapshot.preferred_time ? `• Preferred Time: ${confirmed.formSnapshot.preferred_time}\n` : ''}Please confirm my slot!`
    : '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-[#D4AF37]/30 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between bg-[#07090E] px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4AF37]/20 text-[#E5C158]">
              <CalendarCheck2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-[0.2em] text-[#E5C158] uppercase">
                VIP Showroom Concierge
              </div>
              <h3 className="font-serif-lux text-lg font-bold text-white">
                Reserve Viewing or Request Best Offer
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 p-2 text-slate-300 hover:bg-white/20 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">
          {confirmed ? (
            <div className="py-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h4 className="font-serif-lux mt-4 text-2xl font-bold text-slate-900">
                Priority Request Confirmed
              </h4>
              <p className="mt-2 text-sm text-slate-600">
                Our sales specialist has reserved priority attention for your request. Tap below if you want instant WhatsApp confirmation too.
              </p>
              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
                <a
                  href={buildWhatsAppUrl(business?.whatsapp_number, waMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp px-6 py-3"
                >
                  <MessageCircle className="h-4 w-4" />
                  Instant WhatsApp Confirmation
                </a>
                <button type="button" onClick={onClose} className="btn-secondary px-6 py-3">
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Honeypot anti-bot field */}
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

              <div className="grid grid-cols-3 gap-2">
                {['Test Drive / Viewing', 'Price Negotiation', 'Call Back'].map((kind) => (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => setForm({ ...form, kind })}
                    className={`rounded-xl px-2.5 py-2.5 text-xs font-bold transition cursor-pointer ${
                      form.kind === kind
                        ? 'bg-[#0B0F17] text-[#E5C158] shadow-xs'
                        : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {kind}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Vehicle of Interest</label>
                <select
                  value={form.vehicle_id}
                  onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}
                  className="input-field mt-1"
                >
                  <option value="">General Showroom Consultation</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={String(v.id)}>
                      {v.year} {v.title} — {formatCurrency(v.retail_price, currency)} ({v.stock_code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Your Name *</label>
                  <input
                    required
                    type="text"
                    value={form.customer_name}
                    onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                    placeholder="e.g. Dinesh Wijeratne"
                    className="input-field mt-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Phone / WhatsApp *</label>
                  <input
                    required
                    type="tel"
                    value={form.customer_phone}
                    onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                    placeholder="+94 77 123 4567"
                    className="input-field mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Preferred Date &amp; Time (Optional)
                </label>
                <input
                  type="text"
                  value={form.preferred_time}
                  onChange={(e) => setForm({ ...form, preferred_time: e.target.value })}
                  placeholder="e.g. Saturday 10:30 AM or Today Evening"
                  className="input-field mt-1"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Special Request / Cash Offer / Lease Question
                </label>
                <textarea
                  rows={2}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder={
                    selectedVeh
                      ? `Interested in ${selectedVeh.year} ${selectedVeh.title}...`
                      : 'Tell us your budget or trade-in model...'
                  }
                  className="input-field mt-1"
                />
              </div>

              <button type="submit" disabled={submitting} className="btn-primary w-full py-3.5">
                <Send className="h-4 w-4" />
                {submitting ? 'Reserving Slot...' : 'Confirm VIP Appointment'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
