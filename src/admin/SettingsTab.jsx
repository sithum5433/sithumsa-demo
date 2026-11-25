import { useEffect, useState } from 'react';
import { Check, KeyRound } from 'lucide-react';
import { apiRequest, setCsrfToken } from '../api/client.js';

export function SettingsTab({ business, onReload, onNotify }) {
  const [form, setForm] = useState({
    business_name: '',
    tagline: '',
    about_text: '',
    registration_no: '',
    phone: '',
    whatsapp_number: '',
    email: '',
    address: '',
    opening_hours: '',
    currency_code: 'LKR',
    default_interest_rate: 13.5,
    default_down_payment_pct: 25,
    default_lease_months: 48,
    default_tax_pct: 0,
    invoice_footer_note: '',
  });
  const [saving, setSaving] = useState(false);

  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [changingPass, setChangingPass] = useState(false);

  useEffect(() => {
    if (business) {
      setForm({
        business_name: business.business_name || '',
        tagline: business.tagline || '',
        about_text: business.about_text || '',
        registration_no: business.registration_no || '',
        phone: business.phone || '',
        whatsapp_number: business.whatsapp_number || '',
        email: business.email || '',
        address: business.address || '',
        opening_hours: business.opening_hours || '',
        currency_code: business.currency_code || 'LKR',
        default_interest_rate: business.default_interest_rate ?? 13.5,
        default_down_payment_pct: business.default_down_payment_pct ?? 25,
        default_lease_months: business.default_lease_months ?? 48,
        default_tax_pct: business.default_tax_pct ?? 0,
        invoice_footer_note: business.invoice_footer_note || '',
      });
    }
  }, [business]);

  const handleSaveBusiness = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiRequest('/api/admin/business', {
        method: 'PUT',
        body: {
          ...form,
          default_interest_rate: Number(form.default_interest_rate),
          default_down_payment_pct: Number(form.default_down_payment_pct),
          default_lease_months: Number(form.default_lease_months),
          default_tax_pct: Number(form.default_tax_pct),
        },
      });
      onNotify?.('Business details & POS defaults saved!');
      await onReload();
    } catch (err) {
      onNotify?.(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm_password) {
      onNotify?.('New passwords do not match.', 'error');
      return;
    }
    setChangingPass(true);
    try {
      const res = await apiRequest('/api/auth/change-password', {
        method: 'POST',
        body: {
          current_password: passwords.current_password,
          new_password: passwords.new_password,
        },
      });
      setCsrfToken(res.csrfToken);
      setPasswords({ current_password: '', new_password: '', confirm_password: '' });
      onNotify?.('Owner password updated successfully.');
    } catch (err) {
      onNotify?.(err.message, 'error');
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <form
        onSubmit={handleSaveBusiness}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-8 space-y-4"
      >
        <h2 className="font-display text-lg font-bold text-slate-900">
          Business Profile, WhatsApp &amp; Leasing Defaults
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Business Name *</label>
            <input
              required
              type="text"
              value={form.business_name}
              onChange={(e) => setForm({ ...form, business_name: e.target.value })}
              className="input-field mt-1"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Business Reg / Tax No</label>
            <input
              type="text"
              value={form.registration_no}
              onChange={(e) => setForm({ ...form, registration_no: e.target.value })}
              className="input-field mt-1"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700">Hero Tagline *</label>
            <input
              required
              type="text"
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              className="input-field mt-1"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Showroom Phone *</label>
            <input
              required
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input-field mt-1"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              WhatsApp Number (with country code) *
            </label>
            <input
              required
              type="tel"
              value={form.whatsapp_number}
              onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
              placeholder="+94 77 123 4567"
              className="input-field mt-1"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field mt-1"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Showroom Currency</label>
            <select
              value={form.currency_code}
              onChange={(e) => setForm({ ...form, currency_code: e.target.value })}
              className="input-field mt-1"
            >
              <option value="LKR">LKR (Rs.)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="AUD">AUD (A$)</option>
              <option value="AED">AED</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700">Showroom Address *</label>
            <input
              required
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="input-field mt-1"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700">Opening Hours</label>
            <input
              type="text"
              value={form.opening_hours}
              onChange={(e) => setForm({ ...form, opening_hours: e.target.value })}
              className="input-field mt-1"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700">About Business</label>
            <textarea
              rows={2}
              value={form.about_text}
              onChange={(e) => setForm({ ...form, about_text: e.target.value })}
              className="input-field mt-1"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Default Lease Rate (% p.a.)</label>
            <input
              type="number"
              min={0}
              max={60}
              step={0.5}
              value={form.default_interest_rate}
              onChange={(e) => setForm({ ...form, default_interest_rate: e.target.value })}
              className="input-field mt-1"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Default Down Payment (%)</label>
            <input
              type="number"
              min={0}
              max={90}
              value={form.default_down_payment_pct}
              onChange={(e) => setForm({ ...form, default_down_payment_pct: e.target.value })}
              className="input-field mt-1"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Default Lease Tenure (Months)</label>
            <input
              type="number"
              min={6}
              max={96}
              value={form.default_lease_months}
              onChange={(e) => setForm({ ...form, default_lease_months: e.target.value })}
              className="input-field mt-1"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Default Invoice Tax (%)</label>
            <input
              type="number"
              min={0}
              max={50}
              step={0.1}
              value={form.default_tax_pct}
              onChange={(e) => setForm({ ...form, default_tax_pct: e.target.value })}
              className="input-field mt-1"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700">Invoice Footer Note</label>
            <textarea
              rows={2}
              value={form.invoice_footer_note}
              onChange={(e) => setForm({ ...form, invoice_footer_note: e.target.value })}
              className="input-field mt-1"
            />
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary">
          <Check className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Business Settings'}
        </button>
      </form>

      {/* Owner Password Change */}
      <form
        onSubmit={handleChangePassword}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-4 space-y-4 h-fit"
      >
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-amber-600" />
          <h2 className="font-display text-base font-bold text-slate-900">Owner Security</h2>
        </div>
        <p className="text-xs text-slate-500">
          Update your owner login password. Minimum 10 characters recommended.
        </p>

        <div>
          <label className="block text-xs font-semibold text-slate-700">Current Password</label>
          <input
            required
            type="password"
            value={passwords.current_password}
            onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })}
            className="input-field mt-1"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700">New Password</label>
          <input
            required
            type="password"
            minLength={10}
            value={passwords.new_password}
            onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
            className="input-field mt-1"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700">Confirm New Password</label>
          <input
            required
            type="password"
            minLength={10}
            value={passwords.confirm_password}
            onChange={(e) => setPasswords({ ...passwords, confirm_password: e.target.value })}
            className="input-field mt-1"
          />
        </div>

        <button type="submit" disabled={changingPass} className="btn-dark w-full">
          {changingPass ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
