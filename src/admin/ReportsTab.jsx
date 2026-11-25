import { useCallback, useEffect, useState } from 'react';
import { BarChart3, Download, Plus, Trash2, TrendingUp } from 'lucide-react';
import { apiRequest } from '../api/client.js';
import { formatCurrencyExact } from '../utils/format.js';
import { downloadSalesCsv } from '../utils/demoDownloads.js';

const EXPENSE_CATEGORIES = [
  'Rent',
  'Salaries',
  'Utilities',
  'Advertising',
  'Transport',
  'Repairs',
  'Licenses & Fees',
  'Other',
];

export function ReportsTab({ business, onNotify }) {
  const currency = business?.currency_symbol || 'Rs.';
  const today = new Date().toISOString().slice(0, 10);
  const [from, setFrom] = useState(`${today.slice(0, 4)}-01-01`);
  const [to, setTo] = useState(today);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const [expForm, setExpForm] = useState({
    expense_date: today,
    category: 'Rent',
    amount: '',
    note: '',
  });
  const [addingExp, setAddingExp] = useState(false);

  const loadReport = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest(`/api/admin/reports?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
      setReport(data);
    } catch (err) {
      onNotify?.(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [from, to, onNotify]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setAddingExp(true);
    try {
      await apiRequest('/api/admin/expenses', {
        method: 'POST',
        body: {
          ...expForm,
          amount: Number(expForm.amount),
        },
      });
      setExpForm({ ...expForm, amount: '', note: '' });
      onNotify?.('Operating expense recorded.');
      await loadReport();
    } catch (err) {
      onNotify?.(err.message, 'error');
    } finally {
      setAddingExp(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await apiRequest(`/api/admin/expenses/${id}`, { method: 'DELETE' });
      onNotify?.('Expense removed.');
      await loadReport();
    } catch (err) {
      onNotify?.(err.message, 'error');
    }
  };

  const sum = report?.summary || {};

  return (
    <div className="space-y-6">
      {/* Filter & CSV Export Bar */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
        <div className="grid grid-cols-1 sm:flex sm:flex-wrap sm:items-end gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-auto">
            <label className="block text-xs font-semibold text-slate-600">From Date</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="input-field mt-1 w-full sm:w-auto text-base sm:text-sm"
            />
          </div>
          <div className="w-full sm:w-auto">
            <label className="block text-xs font-semibold text-slate-600">To Date</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="input-field mt-1 w-full sm:w-auto text-base sm:text-sm"
            />
          </div>
          <button type="button" onClick={loadReport} className="btn-dark w-full sm:w-auto py-2.5 text-xs">
            <BarChart3 className="h-4 w-4" />
            Refresh Report
          </button>
        </div>

        <button
          type="button"
          onClick={() => downloadSalesCsv(from, to)}
          className="btn-primary w-full sm:w-auto py-2.5 text-xs"
        >
          <Download className="h-4 w-4" />
          Export Accountant CSV / Excel
        </button>
      </div>

      {/* Profit & Cashflow KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Net Sales ({sum.invoices_count || 0})</div>
          <div className="mt-2 font-display text-lg font-extrabold text-slate-900 tabular-nums">
            {formatCurrencyExact(sum.net_sales || 0, currency)}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Vehicle Cost (COGS)</div>
          <div className="mt-2 font-display text-lg font-extrabold text-slate-700 tabular-nums">
            {formatCurrencyExact(sum.vehicle_cogs || 0, currency)}
          </div>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 shadow-xs">
          <div className="text-xs font-bold text-emerald-800">Gross Vehicle Profit</div>
          <div className="mt-2 font-display text-lg font-extrabold text-emerald-800 tabular-nums">
            {formatCurrencyExact(sum.gross_profit || 0, currency)}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Operating Expenses</div>
          <div className="mt-2 font-display text-lg font-extrabold text-rose-700 tabular-nums">
            {formatCurrencyExact(sum.operating_expenses || 0, currency)}
          </div>
        </div>
        <div className="rounded-2xl border border-[#D4AF37]/50 bg-[#07090E] p-4 text-white shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-[#E5C158]">
            <span>Net Profit</span>
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="mt-2 font-display text-lg font-extrabold text-white tabular-nums">
            {formatCurrencyExact(sum.net_profit || 0, currency)}
          </div>
          <div className="mt-1 text-[10px] text-slate-400 tabular-nums">
            Receivables: {formatCurrencyExact(sum.receivable || 0, currency)}
          </div>
        </div>
      </div>

      {/* Per-Invoice Margin Breakdown & Operating Expenses */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-7">
          <h3 className="font-serif-lux text-base font-bold text-slate-900">
            Per-Sale Vehicle Profit Breakdown
          </h3>
          <p className="text-xs text-slate-500">
            Enter Purchase Cost &amp; Repair/Import Cost on each vehicle in Inventory to track exact per-sale margin.
          </p>

          {loading ? (
            <p className="mt-4 text-xs text-slate-500">Calculating report...</p>
          ) : !report?.invoices?.length ? (
            <p className="mt-4 text-xs text-slate-500">No completed sales in selected date range.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-3 py-2.5 font-bold">Invoice</th>
                    <th className="px-3 py-2.5 font-bold">Vehicle</th>
                    <th className="px-3 py-2.5 text-right font-bold">Net Sale</th>
                    <th className="px-3 py-2.5 text-right font-bold">Cost</th>
                    <th className="px-3 py-2.5 text-right font-bold">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 tabular-nums">
                  {report.invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="px-3 py-2.5 font-mono font-bold text-slate-900">
                        {inv.invoice_number}
                        <div className="font-sans text-[10px] font-normal text-slate-500">
                          {inv.sale_date}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-slate-800">{inv.vehicle_snapshot_title}</td>
                      <td className="px-3 py-2.5 text-right font-semibold">
                        {formatCurrencyExact(inv.net_sales, currency)}
                      </td>
                      <td className="px-3 py-2.5 text-right text-slate-600">
                        {formatCurrencyExact(inv.cost_snapshot, currency)}
                      </td>
                      <td
                        className={`px-3 py-2.5 text-right font-bold ${
                          inv.gross_profit >= 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {formatCurrencyExact(inv.gross_profit, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Operating Expenses Ledger */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-5 space-y-4">
          <h3 className="font-serif-lux text-base font-bold text-slate-900">
            Showroom Operating Expenses
          </h3>
          <form onSubmit={handleAddExpense} className="grid grid-cols-2 gap-2.5">
            <input
              required
              type="date"
              value={expForm.expense_date}
              onChange={(e) => setExpForm({ ...expForm, expense_date: e.target.value })}
              className="input-field text-xs"
            />
            <select
              value={expForm.category}
              onChange={(e) => setExpForm({ ...expForm, category: e.target.value })}
              className="input-field text-xs"
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              required
              type="number"
              min={1}
              placeholder={`Amount (${currency})`}
              value={expForm.amount}
              onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })}
              className="input-field text-xs"
            />
            <input
              type="text"
              placeholder="Note (e.g. Oct Showroom Rent)"
              value={expForm.note}
              onChange={(e) => setExpForm({ ...expForm, note: e.target.value })}
              className="input-field text-xs"
            />
            <button type="submit" disabled={addingExp} className="btn-dark col-span-2 py-2.5 text-xs">
              <Plus className="h-3.5 w-3.5" />
              {addingExp ? 'Recording...' : 'Record Expense'}
            </button>
          </form>

          <div className="max-h-64 divide-y divide-slate-100 overflow-y-auto text-xs">
            {(report?.expenses || []).map((ex) => (
              <div key={ex.id} className="flex items-center justify-between py-2.5">
                <div>
                  <div className="font-bold text-slate-800">
                    {ex.category} — {formatCurrencyExact(ex.amount, currency)}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {ex.expense_date} {ex.note ? `• ${ex.note}` : ''}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteExpense(ex.id)}
                  className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 cursor-pointer"
                  aria-label="Delete expense"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
