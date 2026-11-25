import {
  BarChart3,
  Camera,
  CarFront,
  DollarSign,
  Download,
  Plus,
  Receipt,
  Repeat,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { formatCurrency } from '../utils/format.js';
import { downloadDemoBackupZip } from '../utils/demoDownloads.js';

export function DashboardTab({ dashboard, business, onNavigate }) {
  const currency = business?.currency_symbol || 'Rs.';
  const v = dashboard?.vehicles || {};
  const inv = dashboard?.invoices || {};
  const ex = dashboard?.exchanges || {};
  const inq = dashboard?.inquiries || {};

  const cards = [
    {
      label: 'Available Vehicles',
      value: v.available_count || 0,
      sub: `${v.sold_count || 0} sold • ${v.reserved_count || 0} reserved`,
      icon: CarFront,
      color: 'bg-amber-100 text-amber-800',
    },
    {
      label: 'Active Stock Value',
      value: formatCurrency(v.inventory_retail_value || 0, currency),
      sub: `${v.total_vehicles || 0} total fleet records`,
      icon: TrendingUp,
      color: 'bg-sky-100 text-sky-700',
    },
    {
      label: 'POS Sales & Gross Profit',
      value: formatCurrency(inv.total_sales_value || 0, currency),
      sub: `Gross Profit: ${formatCurrency(inv.gross_profit || 0, currency)}`,
      icon: DollarSign,
      color: 'bg-emerald-100 text-emerald-700',
    },
    {
      label: 'VIP Leads & Trade-Ins',
      value: `${(inq.new_inquiries || 0) + (ex.new_exchanges || 0)} New`,
      sub: `${inq.new_inquiries || 0} test drives • ${ex.new_exchanges || 0} trade-ins`,
      icon: Repeat,
      color: 'bg-purple-100 text-purple-700',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div>
          <h2 className="font-serif-lux text-xl font-bold text-slate-900">
            Executive Dealership Command Center
          </h2>
          <p className="text-xs text-slate-500">
            Issue POS invoices, track per-vehicle margins, manage VIP test-drive bookings, and download encrypted/offline backups.
          </p>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
          <button type="button" onClick={() => onNavigate('pos')} className="btn-primary py-2.5 px-3 text-xs">
            <Receipt className="h-4 w-4 shrink-0" />
            New POS Invoice
          </button>
          <button type="button" onClick={() => onNavigate('inventory')} className="btn-dark py-2.5 px-3 text-xs">
            <Plus className="h-4 w-4 shrink-0" />
            Add Vehicle
          </button>
          <button type="button" onClick={() => onNavigate('reports')} className="btn-secondary py-2.5 px-3 text-xs">
            <BarChart3 className="h-4 w-4 shrink-0 text-[#9A7418]" />
            Profit Reports
          </button>
          <button type="button" onClick={() => onNavigate('customers')} className="btn-secondary py-2.5 px-3 text-xs">
            <Camera className="h-4 w-4 shrink-0 text-[#9A7418]" />
            Add Buyer Photo
          </button>
          <button type="button" onClick={downloadDemoBackupZip} className="btn-secondary py-2.5 px-3 text-xs">
            <Download className="h-4 w-4 shrink-0 text-emerald-700" />
            Backup ZIP
          </button>
          <button type="button" onClick={() => onNavigate('security')} className="btn-secondary py-2.5 px-3 text-xs">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-700" />
            2FA &amp; Audit
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{card.label}</span>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 font-display text-2xl font-extrabold text-slate-900 tabular-nums">
                {card.value}
              </div>
              <div className="mt-1 text-xs text-slate-500">{card.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-serif-lux text-sm font-bold text-slate-900">Recent POS Invoices</h3>
            <button
              type="button"
              onClick={() => onNavigate('invoices')}
              className="text-xs font-semibold text-[#9A7418] hover:underline cursor-pointer"
            >
              View All →
            </button>
          </div>
          {!dashboard?.recentInvoices?.length ? (
            <p className="mt-4 text-xs text-slate-500">
              No invoices generated yet. Launch POS Billing to create your first invoice.
            </p>
          ) : (
            <div className="mt-3 divide-y divide-slate-100">
              {dashboard.recentInvoices.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2.5 text-xs">
                  <div>
                    <div className="font-semibold text-slate-900">
                      {item.invoice_number} — {item.customer_name}
                    </div>
                    <div className="text-slate-500">{item.vehicle_snapshot_title}</div>
                  </div>
                  <div className="text-right tabular-nums">
                    <div className="font-bold text-slate-900">{formatCurrency(item.grand_total, currency)}</div>
                    <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                      {item.payment_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-serif-lux text-sm font-bold text-slate-900">Recent Trade-In Requests</h3>
            <button
              type="button"
              onClick={() => onNavigate('exchanges')}
              className="text-xs font-semibold text-[#9A7418] hover:underline cursor-pointer"
            >
              Open Inbox →
            </button>
          </div>
          {!dashboard?.recentExchanges?.length ? (
            <p className="mt-4 text-xs text-slate-500">No customer trade-in requests yet.</p>
          ) : (
            <div className="mt-3 divide-y divide-slate-100">
              {dashboard.recentExchanges.map((exItem) => (
                <div key={exItem.id} className="flex items-center justify-between py-2.5 text-xs">
                  <div>
                    <div className="font-semibold text-slate-900">
                      {exItem.old_year} {exItem.old_make} {exItem.old_model}
                    </div>
                    <div className="text-slate-500">
                      {exItem.customer_name} • {exItem.reference_code}
                    </div>
                  </div>
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-900">
                    {exItem.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
