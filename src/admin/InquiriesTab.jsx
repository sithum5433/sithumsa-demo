import { CalendarCheck2, MessageCircle, Trash2 } from 'lucide-react';
import { apiRequest } from '../api/client.js';
import { buildWhatsAppUrl } from '../utils/format.js';

export function InquiriesTab({ inquiries, business, onReload, onNotify }) {
  const handleStatusChange = async (item, status) => {
    try {
      await apiRequest(`/api/admin/inquiries/${item.id}`, {
        method: 'PATCH',
        body: { status },
      });
      onNotify?.(`Lead updated to ${status}.`);
      await onReload();
    } catch (err) {
      onNotify?.(err.message, 'error');
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Remove lead from ${item.customer_name}?`)) return;
    try {
      await apiRequest(`/api/admin/inquiries/${item.id}`, { method: 'DELETE' });
      onNotify?.('Lead removed.');
      await onReload();
    } catch (err) {
      onNotify?.(err.message, 'error');
    }
  };

  if (!inquiries.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
        <CalendarCheck2 className="mx-auto h-9 w-9 text-slate-400 mb-2" />
        No VIP test-drive or price negotiation leads yet. Bookings from “Book Test Drive” appear here immediately.
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {inquiries.map((item) => {
        const waUrl = buildWhatsAppUrl(
          item.customer_phone,
          `Hello ${item.customer_name}, this is ${business?.business_name || 'Sithumsa Enterprise'} regarding your ${item.kind}${
            item.vehicle_title ? ` for ${item.vehicle_title}` : ''
          }. When would you like to visit our showroom?`
        );

        return (
          <div
            key={item.id}
            className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:flex-row sm:items-center"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-[#07090E] px-2.5 py-0.5 text-[11px] font-bold text-[#E5C158]">
                  {item.kind}
                </span>
                <span className="text-xs text-slate-400">{item.created_at?.slice(0, 16)}</span>
              </div>
              <h3 className="mt-1.5 font-display text-base font-bold text-slate-900">
                {item.customer_name} • <span className="text-slate-600">{item.customer_phone}</span>
              </h3>
              {item.vehicle_title && (
                <div className="mt-0.5 text-xs font-semibold text-[#9A7418]">
                  Vehicle: {item.vehicle_title}
                </div>
              )}
              {item.preferred_time && (
                <div className="mt-0.5 text-xs text-slate-600">
                  Preferred Slot: <span className="font-semibold">{item.preferred_time}</span>
                </div>
              )}
              {item.message && (
                <p className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-700">
                  “{item.message}”
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <select
                value={item.status}
                onChange={(e) => handleStatusChange(item, e.target.value)}
                className="input-field w-36 text-xs font-semibold"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Won">Won (Sold)</option>
                <option value="Closed">Closed</option>
              </select>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp py-2 px-3 text-xs"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp
              </a>
              <button
                type="button"
                onClick={() => handleDelete(item)}
                className="rounded-xl border border-rose-200 bg-rose-50 p-2 text-rose-700 hover:bg-rose-100 cursor-pointer"
                aria-label="Delete inquiry"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
