import { useState } from 'react';
import { Ban, CreditCard, Eye, FileDown, Plus, Search, X } from 'lucide-react';
import { apiRequest } from '../api/client.js';
import { formatCurrencyExact } from '../utils/format.js';
import { downloadInvoicePdf } from '../utils/demoDownloads.js';
import { InvoicePrintView } from './InvoicePrintView.jsx';

export function InvoicesTab({ invoices, business, onReload, onNotify }) {
  const currency = business?.currency_symbol || 'Rs.';
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Payment History & Installment Modal
  const [paymentModalInv, setPaymentModalInv] = useState(null);
  const [payments, setPayments] = useState([]);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('Cash');
  const [payNote, setPayNote] = useState('');
  const [savingPay, setSavingPay] = useState(false);

  const filtered = invoices.filter((inv) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return `${inv.invoice_number} ${inv.customer_name} ${inv.customer_phone} ${inv.vehicle_snapshot_title}`
      .toLowerCase()
      .includes(q);
  });

  const openPayments = async (inv) => {
    setPaymentModalInv(inv);
    setPayAmount(inv.balance_due > 0 ? String(inv.balance_due) : '');
    setPayMethod(inv.payment_method || 'Cash');
    setPayNote('');
    try {
      const res = await apiRequest(`/api/admin/invoices/${inv.id}/payments`);
      setPayments(res.payments || []);
    } catch (err) {
      onNotify?.(err.message, 'error');
    }
  };

  const handleRecordInstallment = async (e) => {
    e.preventDefault();
    if (!paymentModalInv) return;
    setSavingPay(true);
    try {
      const res = await apiRequest(`/api/admin/invoices/${paymentModalInv.id}/payments`, {
        method: 'POST',
        body: {
          amount: Number(payAmount),
          payment_method: payMethod,
          note: payNote,
        },
      });
      setPaymentModalInv(res.invoice);
      setPayments(res.payments || []);
      setPayAmount(res.invoice.balance_due > 0 ? String(res.invoice.balance_due) : '');
      setPayNote('');
      onNotify?.('Payment recorded onto invoice ledger.');
      await onReload();
    } catch (err) {
      onNotify?.(err.message, 'error');
    } finally {
      setSavingPay(false);
    }
  };

  const handleVoid = async (inv) => {
    if (!window.confirm(`Void invoice ${inv.invoice_number}? This action is recorded in the audit log.`)) return;
    try {
      await apiRequest(`/api/admin/invoices/${inv.id}/payment`, {
        method: 'PATCH',
        body: { void: true },
      });
      onNotify?.(`Invoice ${inv.invoice_number} voided.`);
      await onReload();
    } catch (err) {
      onNotify?.(err.message, 'error');
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice #, customer, phone, or vehicle..."
            className="input-field pl-10"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-bold">Invoice #</th>
                <th className="px-4 py-3 font-bold">Customer</th>
                <th className="px-4 py-3 font-bold">Vehicle &amp; Type</th>
                <th className="px-4 py-3 font-bold">Grand Total</th>
                <th className="px-4 py-3 font-bold">Balance Due</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 tabular-nums">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    No invoices found. Create one in POS &amp; Billing!
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <div className="font-mono font-bold text-slate-900">{inv.invoice_number}</div>
                      <div className="text-[11px] text-slate-500">{inv.created_at?.slice(0, 10)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{inv.customer_name}</div>
                      <div className="text-[11px] text-slate-500">{inv.customer_phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{inv.vehicle_snapshot_title}</div>
                      <div className="text-[11px] text-slate-500">
                        {inv.sale_type} • {inv.payment_method}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {formatCurrencyExact(inv.grand_total, currency)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">
                      {formatCurrencyExact(inv.balance_due, currency)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          inv.payment_status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inv.payment_status === 'Void'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {inv.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedInvoice(inv)}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                        >
                          <Eye className="inline h-3.5 w-3.5 mr-1" />
                          Print
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadInvoicePdf(inv, business)}
                          className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 font-semibold text-amber-900 hover:bg-amber-100 cursor-pointer"
                        >
                          <FileDown className="inline h-3.5 w-3.5 mr-1" />
                          PDF
                        </button>
                        {inv.payment_status !== 'Void' && (
                          <button
                            type="button"
                            onClick={() => openPayments(inv)}
                            className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 font-semibold text-emerald-800 hover:bg-emerald-100 cursor-pointer"
                          >
                            <CreditCard className="inline h-3.5 w-3.5 mr-1" />
                            Payments
                          </button>
                        )}
                        {inv.payment_status !== 'Void' && (
                          <button
                            type="button"
                            onClick={() => handleVoid(inv)}
                            className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-1.5 text-rose-700 hover:bg-rose-100 cursor-pointer"
                            title="Void Invoice"
                          >
                            <Ban className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedInvoice && (
        <InvoicePrintView
          invoice={selectedInvoice}
          business={business}
          onClose={() => setSelectedInvoice(null)}
        />
      )}

      {paymentModalInv && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs"
          onClick={() => setPaymentModalInv(null)}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-serif-lux text-lg font-bold text-slate-900">
                  Payment Ledger — {paymentModalInv.invoice_number}
                </h3>
                <p className="text-xs text-slate-500">
                  Paid: {formatCurrencyExact(paymentModalInv.amount_paid, currency)} • Balance:{' '}
                  <span className="font-bold text-slate-900">
                    {formatCurrencyExact(paymentModalInv.balance_due, currency)}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPaymentModalInv(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 max-h-48 divide-y divide-slate-100 overflow-y-auto text-xs">
              {payments.length === 0 ? (
                <p className="py-3 text-slate-500">No installment receipts recorded yet.</p>
              ) : (
                payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <div className="font-bold text-slate-900">
                        {formatCurrencyExact(p.amount, currency)} ({p.payment_method})
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {p.paid_at?.slice(0, 16)} {p.note ? `• ${p.note}` : ''}
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-slate-500">{p.recorded_by}</span>
                  </div>
                ))
              )}
            </div>

            {paymentModalInv.balance_due > 0.01 && (
              <form onSubmit={handleRecordInstallment} className="mt-4 space-y-3 border-t border-slate-200 pt-4">
                <div className="text-xs font-bold text-slate-800">Record New Deposit / Installment</div>
                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    required
                    type="number"
                    min={1}
                    max={paymentModalInv.balance_due}
                    step="0.01"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder="Amount"
                    className="input-field text-xs"
                  />
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="input-field text-xs"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Card">Card</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Leasing Payout">Leasing Payout</option>
                  </select>
                </div>
                <input
                  type="text"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  placeholder="Receipt ref / cheque # / leasing disbursement note"
                  className="input-field text-xs"
                />
                <button type="submit" disabled={savingPay} className="btn-primary w-full py-2.5 text-xs">
                  <Plus className="h-4 w-4" />
                  {savingPay ? 'Recording...' : 'Add Payment Receipt'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
