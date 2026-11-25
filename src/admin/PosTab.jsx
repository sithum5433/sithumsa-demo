import { useMemo, useState } from 'react';
import { Check, Plus, Receipt, Trash2 } from 'lucide-react';
import { apiRequest } from '../api/client.js';
import { formatCurrencyExact } from '../utils/format.js';
import { calculateLeasing } from '../utils/leasing.js';
import { InvoicePrintView } from './InvoicePrintView.jsx';

export function PosTab({ vehicles, business, onReload, onNotify }) {
  const currency = business?.currency_symbol || 'Rs.';
  const availableVehicles = useMemo(
    () => vehicles.filter((v) => v.status !== 'Sold'),
    [vehicles]
  );

  const [saleType, setSaleType] = useState('Cash Sale');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [vehicleId, setVehicleId] = useState('');
  const [vehicleTitle, setVehicleTitle] = useState('');
  const [vehicleSpecs, setVehicleSpecs] = useState('');
  const [vehiclePrice, setVehiclePrice] = useState(0);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNic, setCustomerNic] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  const [lineItems, setLineItems] = useState([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxPct, setTaxPct] = useState(Number(business?.default_tax_pct ?? 0));
  const [tradeInVehicle, setTradeInVehicle] = useState('');
  const [tradeInCredit, setTradeInCredit] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);

  const [leaseCompany, setLeaseCompany] = useState('');
  const [leaseRate, setLeaseRate] = useState(Number(business?.default_interest_rate ?? 13.5));
  const [leaseMonths, setLeaseMonths] = useState(Number(business?.default_lease_months ?? 48));

  const [notes, setNotes] = useState('');
  const [markSold, setMarkSold] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState(null);

  const selectInventoryVehicle = (nextId, nextSaleType = saleType) => {
    setVehicleId(nextId);
    if (!nextId) {
      return;
    }
    const v = vehicles.find((item) => String(item.id) === String(nextId));
    if (!v) return;
    setVehicleTitle(`${v.year} ${v.title} (${v.stock_code})`);
    setVehicleSpecs(
      [
        v.make,
        v.model,
        v.condition,
        v.fuel_type,
        v.transmission,
        v.vin_chassis ? `Chassis: ${v.vin_chassis}` : '',
        v.registration_no ? `Reg: ${v.registration_no}` : '',
      ]
        .filter(Boolean)
        .join(' • ')
    );
    const chosenPrice =
      nextSaleType === 'Wholesale Deal' && Number(v.wholesale_price) > 0
        ? Number(v.wholesale_price)
        : Number(v.retail_price);
    setVehiclePrice(chosenPrice);
  };

  const handleSaleTypeChange = (nextType) => {
    setSaleType(nextType);
    if (vehicleId) {
      selectInventoryVehicle(vehicleId, nextType);
    }
    if (nextType === 'Lease Sale') {
      setPaymentMethod('Leasing Payout');
    }
  };

  const addLineItem = () => {
    setLineItems((prev) => [...prev, { label: '', qty: 1, unit_price: 0 }]);
  };

  const updateLineItem = (idx, field, val) => {
    setLineItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item))
    );
  };

  const removeLineItem = (idx) => {
    setLineItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const extrasTotal = lineItems.reduce(
    (sum, item) => sum + (Number(item.qty) || 0) * (Number(item.unit_price) || 0),
    0
  );
  const subtotal = (Number(vehiclePrice) || 0) + extrasTotal;
  const afterDiscount = Math.max(0, subtotal - (Number(discountAmount) || 0));
  const taxAmount = Math.round((afterDiscount * ((Number(taxPct) || 0) / 100) + Number.EPSILON) * 100) / 100;
  const grandTotal = Math.max(0, afterDiscount + taxAmount - (Number(tradeInCredit) || 0));
  const clampedPaid = Math.min(grandTotal, Math.max(0, Number(amountPaid) || 0));
  const balanceDue = Math.max(0, grandTotal - clampedPaid);

  const leaseCalc = calculateLeasing({
    vehiclePrice: balanceDue,
    downPaymentAmount: 0,
    annualInterestRate: leaseRate,
    tenureMonths: leaseMonths,
  });

  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        sale_type: saleType,
        payment_method: paymentMethod,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_nic: customerNic,
        customer_email: customerEmail,
        customer_address: customerAddress,
        vehicle_id: vehicleId ? Number(vehicleId) : null,
        vehicle_snapshot_title: vehicleTitle,
        vehicle_snapshot_specs: vehicleSpecs,
        vehicle_price: Number(vehiclePrice) || 0,
        line_items: lineItems
          .filter((li) => li.label.trim())
          .map((li) => ({
            label: li.label.trim(),
            qty: Number(li.qty) || 1,
            unit_price: Number(li.unit_price) || 0,
          })),
        discount_amount: Number(discountAmount) || 0,
        trade_in_vehicle: tradeInVehicle,
        trade_in_credit: Number(tradeInCredit) || 0,
        tax_pct: Number(taxPct) || 0,
        amount_paid: Number(amountPaid) || 0,
        lease_company: leaseCompany,
        lease_interest_rate: Number(leaseRate) || 0,
        lease_months: saleType === 'Lease Sale' ? Number(leaseMonths) || 0 : 0,
        notes,
        mark_vehicle_sold: markSold,
      };

      const res = await apiRequest('/api/admin/invoices', {
        method: 'POST',
        body: payload,
      });

      setCreatedInvoice(res.invoice);
      onNotify?.(`Invoice ${res.invoice.invoice_number} generated!`);
      // Reset fields for next sale
      setVehicleId('');
      setVehicleTitle('');
      setVehicleSpecs('');
      setVehiclePrice(0);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerNic('');
      setCustomerEmail('');
      setCustomerAddress('');
      setLineItems([]);
      setDiscountAmount(0);
      setTradeInVehicle('');
      setTradeInCredit(0);
      setAmountPaid(0);
      setNotes('');
      await onReload();
    } catch (err) {
      onNotify?.(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Left Checkout Form */}
      <form onSubmit={handleGenerateInvoice} className="space-y-5 lg:col-span-8">
        {/* Sale Type & Vehicle Picker */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h2 className="font-display text-base font-bold text-slate-900">
            1. Transaction &amp; Vehicle Selection
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {['Cash Sale', 'Wholesale Deal', 'Lease Sale', 'Exchange + Sale'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleSaleTypeChange(type)}
                className={`rounded-xl px-3 py-2.5 text-xs font-bold transition cursor-pointer ${
                  saleType === type
                    ? 'bg-slate-900 text-amber-400 shadow-sm'
                    : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700">
                Select Available Vehicle from Showroom
              </label>
              <select
                value={vehicleId}
                onChange={(e) => selectInventoryVehicle(e.target.value)}
                className="input-field mt-1"
              >
                <option value="">-- Custom / Manual Vehicle Entry --</option>
                {availableVehicles.map((v) => (
                  <option key={v.id} value={String(v.id)}>
                    {v.stock_code} — {v.year} {v.title} ({formatCurrencyExact(v.retail_price, currency)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Vehicle Title on Invoice *
              </label>
              <input
                required
                type="text"
                value={vehicleTitle}
                onChange={(e) => setVehicleTitle(e.target.value)}
                placeholder="2024 Toyota RAV4 Hybrid"
                className="input-field mt-1"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Vehicle Price ({currency}) *
              </label>
              <input
                required
                type="number"
                min={0}
                value={vehiclePrice}
                onChange={(e) => setVehiclePrice(Number(e.target.value) || 0)}
                className="input-field mt-1 font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700">
                Vehicle Specs / Chassis / Reg No
              </label>
              <input
                type="text"
                value={vehicleSpecs}
                onChange={(e) => setVehicleSpecs(e.target.value)}
                placeholder="Automatic • Hybrid • Chassis No..."
                className="input-field mt-1"
              />
            </div>
          </div>

          {vehicleId && (
            <label className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={markSold}
                onChange={(e) => setMarkSold(e.target.checked)}
                className="h-4 w-4 accent-amber-500"
              />
              Automatically mark selected vehicle as “Sold” when invoice is issued
            </label>
          )}
        </div>

        {/* Customer Details */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h2 className="font-display text-base font-bold text-slate-900">2. Customer Details</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Customer Name *</label>
              <input
                required
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Buyer / Dealer Name"
                className="input-field mt-1"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Phone / WhatsApp *</label>
              <input
                required
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+94 77 ..."
                className="input-field mt-1"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">NIC / Passport / BR No</label>
              <input
                type="text"
                value={customerNic}
                onChange={(e) => setCustomerNic(e.target.value)}
                className="input-field mt-1"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Email</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="input-field mt-1"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700">Customer Address</label>
              <input
                type="text"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="input-field mt-1"
              />
            </div>
          </div>
        </div>

        {/* Fees, Extras, Exchange & Leasing */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-slate-900">
              3. Fees, Trade-In Exchange &amp; Financing
            </h2>
            <button type="button" onClick={addLineItem} className="btn-secondary py-1.5 px-3 text-xs">
              <Plus className="h-3.5 w-3.5" />
              Add Fee / Accessory
            </button>
          </div>

          {lineItems.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
              <input
                type="text"
                placeholder="Item (e.g. RMV Transfer / Insurance)"
                value={item.label}
                onChange={(e) => updateLineItem(idx, 'label', e.target.value)}
                className="input-field col-span-6"
              />
              <input
                type="number"
                min={1}
                value={item.qty}
                onChange={(e) => updateLineItem(idx, 'qty', e.target.value)}
                className="input-field col-span-2"
                aria-label="Quantity"
              />
              <input
                type="number"
                min={0}
                placeholder="Price"
                value={item.unit_price}
                onChange={(e) => updateLineItem(idx, 'unit_price', e.target.value)}
                className="input-field col-span-3"
                aria-label="Unit price"
              />
              <button
                type="button"
                onClick={() => removeLineItem(idx)}
                className="col-span-1 flex justify-center text-rose-600 hover:text-rose-800 cursor-pointer"
                aria-label="Remove item"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          <div className="grid gap-4 sm:grid-cols-2 border-t border-slate-100 pt-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Discount Amount ({currency})
              </label>
              <input
                type="number"
                min={0}
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                className="input-field mt-1"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Tax / VAT (%)</label>
              <input
                type="number"
                min={0}
                max={50}
                step={0.1}
                value={taxPct}
                onChange={(e) => setTaxPct(e.target.value)}
                className="input-field mt-1"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Exchange Trade-In Vehicle (if any)
              </label>
              <input
                type="text"
                value={tradeInVehicle}
                onChange={(e) => setTradeInVehicle(e.target.value)}
                placeholder="e.g. 2017 Toyota Aqua (WP CAB-1234)"
                className="input-field mt-1"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Trade-In Credit Allowance ({currency})
              </label>
              <input
                type="number"
                min={0}
                value={tradeInCredit}
                onChange={(e) => setTradeInCredit(e.target.value)}
                className="input-field mt-1"
              />
            </div>
          </div>

          {saleType === 'Lease Sale' && (
            <div className="grid gap-4 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-amber-950">Leasing Company</label>
                <input
                  type="text"
                  value={leaseCompany}
                  onChange={(e) => setLeaseCompany(e.target.value)}
                  placeholder="e.g. LB Finance / HNB"
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-amber-950">Interest Rate (% p.a.)</label>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={leaseRate}
                  onChange={(e) => setLeaseRate(e.target.value)}
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-amber-950">Tenure (Months)</label>
                <input
                  type="number"
                  min={6}
                  max={96}
                  value={leaseMonths}
                  onChange={(e) => setLeaseMonths(e.target.value)}
                  className="input-field mt-1"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700">Invoice Notes / Warranty Terms</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional remarks printed on invoice"
              className="input-field mt-1"
            />
          </div>
        </div>
      </form>

      {/* Right Sticky POS Summary */}
      <div className="lg:col-span-4">
        <div className="sticky top-28 rounded-3xl border border-slate-800 bg-slate-950 p-6 text-white shadow-2xl">
          <div className="flex items-center gap-2 text-amber-400">
            <Receipt className="h-5 w-5" />
            <h3 className="font-display text-base font-bold">POS Live Calculation</h3>
          </div>

          <dl className="mt-5 space-y-2.5 text-xs">
            <div className="flex justify-between">
              <dt className="text-slate-400">Vehicle Price</dt>
              <dd className="font-semibold">{formatCurrencyExact(vehiclePrice, currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Extras &amp; Fees ({lineItems.length})</dt>
              <dd className="font-semibold">{formatCurrencyExact(extrasTotal, currency)}</dd>
            </div>
            {Number(discountAmount) > 0 && (
              <div className="flex justify-between text-emerald-400">
                <dt>Discount</dt>
                <dd>- {formatCurrencyExact(discountAmount, currency)}</dd>
              </div>
            )}
            {taxAmount > 0 && (
              <div className="flex justify-between">
                <dt className="text-slate-400">Tax ({taxPct}%)</dt>
                <dd>{formatCurrencyExact(taxAmount, currency)}</dd>
              </div>
            )}
            {Number(tradeInCredit) > 0 && (
              <div className="flex justify-between text-emerald-400">
                <dt>Trade-In Credit</dt>
                <dd>- {formatCurrencyExact(tradeInCredit, currency)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-white/15 pt-3 text-base font-extrabold text-amber-400">
              <dt>Grand Total</dt>
              <dd>{formatCurrencyExact(grandTotal, currency)}</dd>
            </div>
          </dl>

          <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Card">Card</option>
                <option value="Cheque">Cheque</option>
                <option value="Leasing Payout">Leasing Payout</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Amount Paid Today ({currency})
                </label>
                <button
                  type="button"
                  onClick={() => setAmountPaid(grandTotal)}
                  className="text-[11px] font-semibold text-amber-400 hover:underline cursor-pointer"
                >
                  Pay Full
                </button>
              </div>
              <input
                type="number"
                min={0}
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-sm font-bold text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="flex justify-between text-xs pt-1">
              <span className="text-slate-400">Balance Due</span>
              <span className="font-bold text-white">{formatCurrencyExact(balanceDue, currency)}</span>
            </div>

            {saleType === 'Lease Sale' && balanceDue > 0 && leaseMonths > 0 && (
              <div className="rounded-xl bg-amber-500/15 p-3 text-xs border border-amber-400/25">
                <div className="text-amber-200">Financed Lease EMI ({leaseMonths} mo)</div>
                <div className="mt-0.5 font-display text-lg font-extrabold text-amber-400">
                  {formatCurrencyExact(leaseCalc.monthlyInstallment, currency)} / mo
                </div>
              </div>
            )}

            <button
              type="button"
              disabled={submitting || !vehicleTitle || !customerName || !customerPhone}
              onClick={handleGenerateInvoice}
              className="btn-primary mt-2 w-full py-3.5"
            >
              <Check className="h-4 w-4" />
              {submitting ? 'Generating Invoice...' : 'Complete Sale & Generate Invoice'}
            </button>
          </div>
        </div>
      </div>

      {createdInvoice && (
        <InvoicePrintView
          invoice={createdInvoice}
          business={business}
          onClose={() => setCreatedInvoice(null)}
        />
      )}
    </div>
  );
}
