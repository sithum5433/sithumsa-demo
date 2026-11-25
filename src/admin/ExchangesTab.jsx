import { useState } from 'react';
import { Check, MessageCircle, Trash2 } from 'lucide-react';
import { apiRequest } from '../api/client.js';
import { buildWhatsAppUrl, formatCurrency, formatMileage, assetUrl } from '../utils/format.js';

export function ExchangesTab({ exchanges, business, onReload, onNotify }) {
  const currency = business?.currency_symbol || 'Rs.';
  const [edits, setEdits] = useState({});

  const getField = (item, field) => {
    if (edits[item.id] && edits[item.id][field] !== undefined) {
      return edits[item.id][field];
    }
    return item[field] ?? '';
  };

  const setField = (id, field, val) => {
    setEdits((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [field]: val },
    }));
  };

  const handleSave = async (item) => {
    try {
      await apiRequest(`/api/admin/exchanges/${item.id}`, {
        method: 'PATCH',
        body: {
          status: getField(item, 'status'),
          owner_valuation: Number(getField(item, 'owner_valuation')) || 0,
          owner_notes: getField(item, 'owner_notes'),
        },
      });
      onNotify?.(`Updated exchange request ${item.reference_code}.`);
      await onReload();
    } catch (err) {
      onNotify?.(err.message, 'error');
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete exchange request ${item.reference_code}?`)) return;
    try {
      await apiRequest(`/api/admin/exchanges/${item.id}`, { method: 'DELETE' });
      onNotify?.('Exchange request deleted.');
      await onReload();
    } catch (err) {
      onNotify?.(err.message, 'error');
    }
  };

  if (!exchanges.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
        No customer exchange requests yet. Submissions from the public website will appear here with uploaded vehicle photos.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {exchanges.map((item) => {
        const valuation = Number(getField(item, 'owner_valuation')) || 0;
        const waUrl = buildWhatsAppUrl(
          item.customer_phone,
          `Hello ${item.customer_name}, regarding your ${item.old_year} ${item.old_make} ${item.old_model} (Ref: ${item.reference_code}) at ${business?.business_name || 'Sithumsa Enterprise'}${
            valuation > 0
              ? `, our estimated trade-in offer is ${formatCurrency(valuation, currency)}.`
              : ', we have reviewed your request.'
          } Please let us know when you can visit for inspection!`
        );

        return (
          <div
            key={item.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-slate-900 px-2.5 py-0.5 font-mono text-xs font-bold text-amber-400">
                    {item.reference_code}
                  </span>
                  <span className="text-xs text-slate-500">{item.created_at?.slice(0, 16)}</span>
                </div>
                <h3 className="mt-2 font-display text-lg font-bold text-slate-900">
                  {item.old_year} {item.old_make} {item.old_model} ({item.old_condition})
                </h3>
                <div className="mt-1 text-xs text-slate-600">
                  Customer: <span className="font-semibold text-slate-900">{item.customer_name}</span> •{' '}
                  {item.customer_phone} • Mileage: {formatMileage(item.old_mileage_km)}
                  {item.expected_price > 0 && (
                    <> • Expected: {formatCurrency(item.expected_price, currency)}</>
                  )}
                </div>
                {item.target_vehicle_title && (
                  <div className="mt-1 text-xs font-semibold text-amber-700">
                    Wants to exchange for: {item.target_vehicle_title}
                  </div>
                )}
                {item.notes && (
                  <p className="mt-2 text-xs text-slate-600 bg-slate-50 rounded-xl p-2.5">
                    Customer Note: {item.notes}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp py-2 text-xs"
                >
                  <MessageCircle className="h-4 w-4" />
                  Reply WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  className="rounded-xl border border-rose-200 bg-rose-50 p-2 text-rose-700 hover:bg-rose-100 cursor-pointer"
                  aria-label="Delete exchange request"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {item.photos?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2.5">
                {item.photos.map((url) => {
                  const src = assetUrl(url);
                  return (
                    <a
                      key={url}
                      href={src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-24 w-32 overflow-hidden rounded-xl border border-slate-200 bg-slate-900"
                    >
                      <img src={src} alt="" className="h-full w-full object-cover" />
                    </a>
                  );
                })}
              </div>
            )}

            <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-12 sm:items-end">
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-semibold text-slate-600">Status</label>
                <select
                  value={getField(item, 'status')}
                  onChange={(e) => setField(item.id, 'status', e.target.value)}
                  className="input-field mt-1"
                >
                  <option value="New">New</option>
                  <option value="Valued">Valued</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Completed">Completed</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-semibold text-slate-600">
                  Owner Valuation ({currency})
                </label>
                <input
                  type="number"
                  min={0}
                  value={getField(item, 'owner_valuation')}
                  onChange={(e) => setField(item.id, 'owner_valuation', e.target.value)}
                  className="input-field mt-1"
                />
              </div>
              <div className="sm:col-span-4">
                <label className="block text-[11px] font-semibold text-slate-600">Internal / Valuation Note</label>
                <input
                  type="text"
                  value={getField(item, 'owner_notes')}
                  onChange={(e) => setField(item.id, 'owner_notes', e.target.value)}
                  placeholder="Inspection remarks..."
                  className="input-field mt-1"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={() => handleSave(item)}
                  className="btn-dark w-full py-2.5 text-xs"
                >
                  <Check className="h-3.5 w-3.5" />
                  Save
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
