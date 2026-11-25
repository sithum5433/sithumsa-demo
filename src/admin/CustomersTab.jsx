import { useState } from 'react';
import { Camera, CheckCircle2, Eye, EyeOff, Star, Trash2 } from 'lucide-react';
import { apiRequest } from '../api/client.js';
import { assetUrl } from '../utils/format.js';

export function CustomersTab({ reviews, onReload, onNotify }) {
  const [form, setForm] = useState({
    customer_name: '',
    vehicle_purchased: '',
    rating: 5,
    comment: '',
    delivery_date: new Date().toISOString().slice(0, 10),
  });
  const [photo, setPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('customer_name', form.customer_name);
      fd.append('vehicle_purchased', form.vehicle_purchased);
      fd.append('rating', String(form.rating));
      fd.append('comment', form.comment);
      fd.append('delivery_date', form.delivery_date);
      fd.append('is_handover', photo ? '1' : '0');
      fd.append('published', '1');
      if (photo) {
        fd.append('photo', photo);
      }

      await apiRequest('/api/admin/reviews', {
        method: 'POST',
        body: fd,
        isFormData: true,
      });

      setForm({
        customer_name: '',
        vehicle_purchased: '',
        rating: 5,
        comment: '',
        delivery_date: new Date().toISOString().slice(0, 10),
      });
      setPhoto(null);
      onNotify?.('Customer delivery photo & review published!');
      await onReload();
    } catch (err) {
      onNotify?.(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const togglePublish = async (rev) => {
    try {
      await apiRequest(`/api/admin/reviews/${rev.id}`, {
        method: 'PATCH',
        body: { published: !rev.published },
      });
      onNotify?.(rev.published ? 'Review hidden from public website.' : 'Review approved & published!');
      await onReload();
    } catch (err) {
      onNotify?.(err.message, 'error');
    }
  };

  const handleDelete = async (rev) => {
    if (!window.confirm(`Delete review from ${rev.customer_name}?`)) return;
    try {
      await apiRequest(`/api/admin/reviews/${rev.id}`, { method: 'DELETE' });
      onNotify?.('Review deleted.');
      await onReload();
    } catch (err) {
      onNotify?.(err.message, 'error');
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Add Customer Handover Photo & Review */}
      <form
        onSubmit={handleCreate}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-5 space-y-4 h-fit"
      >
        <div className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-amber-600" />
          <h2 className="font-display text-base font-bold text-slate-900">
            Add Buyer Handover Photo &amp; Review
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Upload a celebratory photo when a customer buys a vehicle and showcase their review on your homepage.
        </p>

        <div>
          <label className="block text-xs font-semibold text-slate-700">Customer Name *</label>
          <input
            required
            type="text"
            value={form.customer_name}
            onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
            placeholder="e.g. Mr. & Mrs. Perera"
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
            placeholder="e.g. 2024 Toyota RAV4 Hybrid"
            className="input-field mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Rating</label>
            <select
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
              className="input-field mt-1"
            >
              <option value={5}>5 Stars</option>
              <option value={4}>4 Stars</option>
              <option value={3}>3 Stars</option>
              <option value={2}>2 Stars</option>
              <option value={1}>1 Star</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Handover Date</label>
            <input
              type="date"
              value={form.delivery_date}
              onChange={(e) => setForm({ ...form, delivery_date: e.target.value })}
              className="input-field mt-1"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Customer Delivery Photo (JPG / PNG / WebP)
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
            className="mt-1.5 block w-full text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-slate-800"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">Customer Quote / Review *</label>
          <textarea
            required
            minLength={5}
            rows={3}
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
            placeholder="Great service and fast vehicle exchange..."
            className="input-field mt-1"
          />
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
          <CheckCircle2 className="h-4 w-4" />
          {submitting ? 'Uploading...' : 'Publish Customer Photo & Review'}
        </button>
      </form>

      {/* Existing Reviews Moderation & List */}
      <div className="space-y-3 lg:col-span-7">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center"
          >
            {rev.photo_url && (
              <img
                src={assetUrl(rev.photo_url)}
                alt={rev.customer_name}
                className="h-24 w-36 shrink-0 rounded-xl object-cover bg-slate-900"
              />
            )}
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-display text-sm font-bold text-slate-900">{rev.customer_name}</span>
                  <span className="ml-2 text-xs font-medium text-amber-700">{rev.vehicle_purchased}</span>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    rev.published ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {rev.published ? 'Published' : 'Pending Approval'}
                </span>
              </div>
              <div className="mt-1 flex text-amber-500">
                {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <p className="mt-1.5 text-xs text-slate-600">“{rev.comment}”</p>
            </div>
            <div className="flex shrink-0 gap-1.5 sm:flex-col">
              <button
                type="button"
                onClick={() => togglePublish(rev)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                {rev.published ? (
                  <>
                    <EyeOff className="inline h-3.5 w-3.5 mr-1" />
                    Hide
                  </>
                ) : (
                  <>
                    <Eye className="inline h-3.5 w-3.5 mr-1" />
                    Approve
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(rev)}
                className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 cursor-pointer"
              >
                <Trash2 className="inline h-3.5 w-3.5 mr-1" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
