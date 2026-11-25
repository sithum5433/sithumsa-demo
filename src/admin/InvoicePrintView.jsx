import { createPortal } from 'react-dom';
import { FileDown, MessageCircle, Printer, X } from 'lucide-react';
import { buildWhatsAppUrl, formatCurrencyExact } from '../utils/format.js';
import { downloadInvoicePdf } from '../utils/demoDownloads.js';

export function InvoicePrintView({ invoice, business, onClose }) {
  if (!invoice) return null;

  const currency = business?.currency_symbol || 'Rs.';
  const items = invoice.line_items || [];

  const waUrl = buildWhatsAppUrl(
    invoice.customer_phone,
    `Hello ${invoice.customer_name},\nHere is your ${business?.business_name || 'Sithumsa Enterprise'} Invoice Summary:\n• Invoice #: ${invoice.invoice_number}\n• Vehicle: ${invoice.vehicle_snapshot_title}\n• Sale Type: ${invoice.sale_type}\n• Grand Total: ${formatCurrencyExact(invoice.grand_total, currency)}\n• Paid: ${formatCurrencyExact(invoice.amount_paid, currency)}\n• Balance Due: ${formatCurrencyExact(invoice.balance_due, currency)}${
      invoice.lease_monthly_emi > 0
        ? `\n• Est. Lease EMI: ${formatCurrencyExact(invoice.lease_monthly_emi, currency)} / mo (${invoice.lease_months} mo)`
        : ''
    }\nThank you for choosing ${business?.business_name || 'Sithumsa Enterprise'}!`
  );

  return createPortal(
    <div className="print-portal-root fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 p-2 sm:p-4 backdrop-blur-xs">
      <div className="print-only-container mx-auto max-w-3xl rounded-3xl bg-white shadow-2xl">
        {/* Non-print Action Bar */}
        <div className="no-print flex flex-col gap-3 rounded-t-3xl border-b border-slate-200 bg-slate-900 px-4 py-4 sm:px-6 text-white sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between gap-2">
            <div className="font-display text-sm font-bold">
              Invoice Preview — {invoice.invoice_number}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-white/10 p-2 text-slate-200 hover:bg-white/20 sm:hidden cursor-pointer"
              aria-label="Close invoice preview"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp py-2 text-xs"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
            <button
              type="button"
              onClick={() => downloadInvoicePdf(invoice, business)}
              className="btn-secondary py-2 text-xs"
            >
              <FileDown className="h-4 w-4 text-amber-600" />
              Download PDF
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="btn-primary col-span-2 sm:col-span-1 py-2 text-xs"
            >
              <Printer className="h-4 w-4" />
              Print Invoice
            </button>
            <button
              type="button"
              onClick={onClose}
              className="hidden sm:inline-flex rounded-xl bg-white/10 p-2 text-slate-200 hover:bg-white/20 cursor-pointer"
              aria-label="Close invoice preview"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-4 text-slate-900 sm:p-10 print:p-0">
          {/* Header */}
          <div className="flex flex-col justify-between gap-6 border-b-2 border-slate-900 pb-6 sm:flex-row">
            <div>
              <h1 className="font-display text-2xl font-extrabold text-slate-950">
                {business?.business_name || 'Sithumsa Enterprise'}
              </h1>
              <p className="mt-0.5 text-xs font-medium text-amber-700">
                {business?.tagline || 'Wholesale & Retail Vehicles, Leasing & Exchange'}
              </p>
              <div className="mt-2 space-y-0.5 text-xs text-slate-600">
                <div>{business?.address}</div>
                <div>
                  Tel: {business?.phone} {business?.email ? `• ${business.email}` : ''}
                </div>
                {business?.registration_no && <div>Business Reg: {business.registration_no}</div>}
              </div>
            </div>

            <div className="sm:text-right">
              <div className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                Vehicle Sales Invoice
              </div>
              <div className="mt-1 font-mono text-xl font-extrabold text-slate-950">
                {invoice.invoice_number}
              </div>
              <div className="mt-1 text-xs text-slate-600">
                Date: {invoice.created_at?.slice(0, 10)}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5 sm:justify-end">
                <span className="rounded-md bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white">
                  {invoice.sale_type}
                </span>
                <span
                  className={`rounded-md px-2.5 py-1 text-[11px] font-bold ${
                    invoice.payment_status === 'Paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : invoice.payment_status === 'Void'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {invoice.payment_status}
                </span>
              </div>
            </div>
          </div>

          {/* Buyer Details */}
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                Billed To (Customer)
              </div>
              <div className="mt-1.5 font-display text-base font-bold text-slate-900">
                {invoice.customer_name}
              </div>
              <div className="mt-1 space-y-0.5 text-xs text-slate-600">
                <div>Phone: {invoice.customer_phone}</div>
                {invoice.customer_nic && <div>NIC / Passport: {invoice.customer_nic}</div>}
                {invoice.customer_email && <div>Email: {invoice.customer_email}</div>}
                {invoice.customer_address && <div>Address: {invoice.customer_address}</div>}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                Payment &amp; Transaction Summary
              </div>
              <dl className="mt-2 space-y-1 text-xs">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Payment Method</dt>
                  <dd className="font-semibold text-slate-900">{invoice.payment_method}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Prepared By</dt>
                  <dd className="font-semibold text-slate-900">{invoice.created_by}</dd>
                </div>
                {invoice.trade_in_vehicle && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Exchange Trade-In</dt>
                    <dd className="font-semibold text-emerald-700">{invoice.trade_in_vehicle}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[520px] text-left text-xs">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="px-4 py-3 font-semibold">Description / Vehicle Specifications</th>
                  <th className="px-4 py-3 text-center font-semibold">Qty</th>
                  <th className="px-4 py-3 text-right font-semibold">Unit Amount</th>
                  <th className="px-4 py-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-slate-900">{invoice.vehicle_snapshot_title}</div>
                    {invoice.vehicle_snapshot_specs && (
                      <div className="mt-0.5 text-[11px] text-slate-500">
                        {invoice.vehicle_snapshot_specs}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-center font-medium">1</td>
                  <td className="px-4 py-3.5 text-right font-medium">
                    {formatCurrencyExact(invoice.vehicle_price, currency)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                    {formatCurrencyExact(invoice.vehicle_price, currency)}
                  </td>
                </tr>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3 font-medium text-slate-800">{item.label}</td>
                    <td className="px-4 py-3 text-center">{item.qty}</td>
                    <td className="px-4 py-3 text-right">
                      {formatCurrencyExact(item.unit_price, currency)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {formatCurrencyExact(item.line_total, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Lease Breakdown */}
          <div className="mt-6 grid gap-6 sm:grid-cols-12">
            <div className="sm:col-span-6 space-y-3">
              {invoice.sale_type === 'Lease Sale' && invoice.lease_months > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs">
                  <div className="font-bold text-amber-950 uppercase tracking-wide text-[11px]">
                    Leasing Financing Breakdown
                  </div>
                  <dl className="mt-2 space-y-1 text-amber-900">
                    {invoice.lease_company && (
                      <div className="flex justify-between">
                        <dt>Finance Partner</dt>
                        <dd className="font-semibold">{invoice.lease_company}</dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt>Financed Balance</dt>
                      <dd className="font-semibold">{formatCurrencyExact(invoice.balance_due, currency)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Tenure &amp; Rate</dt>
                      <dd className="font-semibold">
                        {invoice.lease_months} mo @ {invoice.lease_interest_rate}% p.a.
                      </dd>
                    </div>
                    <div className="flex justify-between border-t border-amber-200 pt-1.5 text-sm font-extrabold">
                      <dt>Est. Monthly EMI</dt>
                      <dd>{formatCurrencyExact(invoice.lease_monthly_emi, currency)}</dd>
                    </div>
                  </dl>
                </div>
              )}
              {invoice.notes && (
                <div className="rounded-xl border border-slate-200 p-3 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">Notes: </span>
                  {invoice.notes}
                </div>
              )}
            </div>

            <div className="sm:col-span-6">
              <dl className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs">
                <div className="flex justify-between">
                  <dt className="text-slate-600">Subtotal</dt>
                  <dd className="font-semibold">{formatCurrencyExact(invoice.subtotal, currency)}</dd>
                </div>
                {invoice.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <dt>Discount</dt>
                    <dd className="font-semibold">
                      - {formatCurrencyExact(invoice.discount_amount, currency)}
                    </dd>
                  </div>
                )}
                {invoice.tax_amount > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-slate-600">Tax ({invoice.tax_pct}%)</dt>
                    <dd className="font-semibold">{formatCurrencyExact(invoice.tax_amount, currency)}</dd>
                  </div>
                )}
                {invoice.trade_in_credit > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <dt>Trade-In Credit ({invoice.trade_in_vehicle || 'Old Vehicle'})</dt>
                    <dd className="font-semibold">
                      - {formatCurrencyExact(invoice.trade_in_credit, currency)}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-300 pt-2 text-sm font-extrabold text-slate-950">
                  <dt>Grand Total Payable</dt>
                  <dd>{formatCurrencyExact(invoice.grand_total, currency)}</dd>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <dt>Amount Paid Today</dt>
                  <dd className="font-bold">{formatCurrencyExact(invoice.amount_paid, currency)}</dd>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1.5 text-sm font-bold text-slate-900">
                  <dt>Balance Due</dt>
                  <dd>{formatCurrencyExact(invoice.balance_due, currency)}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Signatures & Footer */}
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-10 print:grid-cols-2 border-t border-slate-200 pt-8 text-center text-xs text-slate-500">
            <div>
              <div className="mx-auto w-48 border-t border-slate-400 pt-1.5 font-semibold text-slate-700">
                Customer Signature
              </div>
            </div>
            <div>
              <div className="mx-auto w-48 border-t border-slate-400 pt-1.5 font-semibold text-slate-700">
                Authorized Signatory — {business?.business_name || 'Sithumsa Enterprise'}
              </div>
            </div>
          </div>

          {business?.invoice_footer_note && (
            <p className="mt-6 text-center text-[11px] leading-relaxed text-slate-500">
              {business.invoice_footer_note}
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
