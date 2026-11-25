import { useState } from 'react';
import { Award, Calendar, MessageSquarePlus, Quote, Star } from 'lucide-react';
import { apiRequest } from '../api/client.js';
import { assetUrl } from '../utils/format.js';

export function HappyCustomersReviews({ reviews, onNotify }) {
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    customer_name: '',
    vehicle_purchased: '',
    rating: 5,
    comment: '',
    website_url: '',
  });

  const handovers = reviews.filter((r) => r.photo_url);
  const textReviews = reviews.filter((r) => !r.photo_url);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await apiRequest('/api/public/reviews', {
        method: 'POST',
        body: form,
      });
      setForm({ customer_name: '', vehicle_purchased: '', rating: 5, comment: '', website_url: '' });
      setShowForm(false);
      onNotify?.(data.message || 'Review submitted for verification!');
    } catch (err) {
      onNotify?.(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="border-t border-slate-200 bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.22em] text-[#9A7418] uppercase">
              <Award className="h-3.5 w-3.5" />
              Showroom Handover Moments
            </div>
            <h2 className="font-serif-lux mt-2 text-2xl sm:text-3xl font-bold text-slate-950 lg:text-4xl">
              Proud Sithumsa Owners &amp; Verified Stories
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
              Join hundreds of families, executives, and fleet partners who chose transparent inspection and effortless leasing.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm((p) => !p)}
            className="btn-secondary w-full sm:w-auto shrink-0"
          >
            <MessageSquarePlus className="h-4 w-4 text-[#9A7418]" />
            {showForm ? 'Close Review Form' : 'Share Your Story'}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mt-6 rounded-3xl border border-[#D4AF37]/40 bg-[#FAF9F5] p-5 sm:p-6 shadow-sm"
          >
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
            <h3 className="font-serif-lux text-lg font-bold text-slate-900">
              Share Your Experience with Sithumsa Enterprise
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Your Name *</label>
                <input
                  required
                  type="text"
                  value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                  placeholder="e.g. Nadeesha Bandara"
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Vehicle Purchased *</label>
                <input
                  required
                  type="text"
                  value={form.vehicle_purchased}
                  onChange={(e) => setForm({ ...form, vehicle_purchased: e.target.value })}
                  placeholder="e.g. 2024 Toyota RAV4"
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Rating</label>
                <select
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                  className="input-field mt-1"
                >
                  <option value={5}>★★★★★ (5/5 Excellent)</option>
                  <option value={4}>★★★★☆ (4/5 Very Good)</option>
                  <option value={3}>★★★☆☆ (3/5 Good)</option>
                  <option value={2}>★★☆☆☆ (2/5 Fair)</option>
                  <option value={1}>★☆☆☆☆ (1/5 Poor)</option>
                </select>
              </div>
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700">Your Review *</label>
                <textarea
                  required
                  minLength={5}
                  rows={2}
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  placeholder="How was the inspection, pricing, exchange, or leasing support?"
                  className="input-field mt-1"
                />
              </div>
            </div>
            <div className="mt-4 flex flex-col-reverse sm:flex-row justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary w-full sm:w-auto">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto">
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        )}

        {handovers.length > 0 && (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {handovers.map((item) => (
              <div
                key={item.id}
                className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-[#FAF9F5] shadow-sm transition hover:border-[#D4AF37] hover:shadow-lg"
              >
                <div className="relative aspect-[16/10] bg-[#07090E]">
                  <img
                    src={assetUrl(item.photo_url)}
                    alt={`${item.customer_name} vehicle handover`}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute top-3 left-3 rounded-full bg-[#07090E]/90 border border-[#D4AF37]/50 px-3 py-1 text-[10px] font-bold tracking-wider text-[#E5C158] uppercase">
                    Verified Delivery
                  </span>
                </div>
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex text-[#D4AF37]">
                        {Array.from({ length: item.rating || 5 }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                      {item.delivery_date && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                          <Calendar className="h-3 w-3" />
                          {item.delivery_date}
                        </span>
                      )}
                    </div>
                    <p className="font-serif-lux mt-3 text-sm italic leading-relaxed text-slate-700">
                      “{item.comment}”
                    </p>
                  </div>
                  <div className="mt-4 border-t border-slate-200/80 pt-3">
                    <div className="font-display text-sm font-bold text-slate-900">{item.customer_name}</div>
                    <div className="text-xs font-semibold text-[#9A7418]">{item.vehicle_purchased}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {textReviews.length > 0 && (
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {textReviews.map((rev) => (
              <div key={rev.id} className="rounded-2xl border border-slate-200 bg-[#FAF9F5] p-5">
                <div className="flex items-center justify-between">
                  <div className="flex text-[#D4AF37]">
                    {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <Quote className="h-4 w-4 text-slate-300" />
                </div>
                <p className="font-serif-lux mt-3 text-sm italic leading-relaxed text-slate-700">
                  “{rev.comment}”
                </p>
                <div className="mt-4">
                  <div className="font-display text-sm font-bold text-slate-900">{rev.customer_name}</div>
                  <div className="text-xs text-slate-500">{rev.vehicle_purchased}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
