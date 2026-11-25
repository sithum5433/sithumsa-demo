import { useState } from 'react';
import {
  Camera,
  Check,
  Edit3,
  Plus,
  Search,
  Star,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import { apiRequest } from '../api/client.js';
import { assetUrl, formatCurrency, formatMileage, getPrimaryPhoto } from '../utils/format.js';

const EMPTY_FORM = {
  stock_code: '',
  title: '',
  make: '',
  model: '',
  year: new Date().getFullYear(),
  condition: 'Used',
  category: 'SUV',
  status: 'Available',
  retail_price: '',
  wholesale_price: '',
  cost_price: '',
  expenses_total: '',
  mileage_km: 0,
  fuel_type: 'Hybrid',
  transmission: 'Automatic',
  engine_cc: '',
  color: '',
  vin_chassis: '',
  registration_no: '',
  seats: 5,
  features: '',
  description: '',
  featured: true,
  leasing_eligible: true,
  exchange_eligible: true,
};

export function InventoryTab({ vehicles, business, onReload, onNotify }) {
  const currency = business?.currency_symbol || 'Rs.';
  const [search, setSearch] = useState('');
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  const openCreate = () => {
    setEditingVehicle({ isNew: true, photos: [] });
    setForm(EMPTY_FORM);
  };

  const openEdit = (v) => {
    setEditingVehicle(v);
    setForm({
      stock_code: v.stock_code || '',
      title: v.title || '',
      make: v.make || '',
      model: v.model || '',
      year: v.year || new Date().getFullYear(),
      condition: v.condition || 'Used',
      category: v.category || 'SUV',
      status: v.status || 'Available',
      retail_price: v.retail_price ?? '',
      wholesale_price: v.wholesale_price ?? '',
      cost_price: v.cost_price ?? '',
      expenses_total: v.expenses_total ?? '',
      mileage_km: v.mileage_km ?? 0,
      fuel_type: v.fuel_type || 'Petrol',
      transmission: v.transmission || 'Automatic',
      engine_cc: v.engine_cc || '',
      color: v.color || '',
      vin_chassis: v.vin_chassis || '',
      registration_no: v.registration_no || '',
      seats: v.seats ?? 5,
      features: v.features || '',
      description: v.description || '',
      featured: Boolean(v.featured),
      leasing_eligible: Boolean(v.leasing_eligible),
      exchange_eligible: Boolean(v.exchange_eligible),
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        year: Number(form.year),
        retail_price: Number(form.retail_price),
        wholesale_price: form.wholesale_price === '' ? 0 : Number(form.wholesale_price),
        cost_price: form.cost_price === '' ? 0 : Number(form.cost_price),
        expenses_total: form.expenses_total === '' ? 0 : Number(form.expenses_total),
        mileage_km: Number(form.mileage_km || 0),
        seats: Number(form.seats || 5),
      };

      if (editingVehicle?.isNew) {
        const res = await apiRequest('/api/admin/vehicles', {
          method: 'POST',
          body: payload,
        });
        setEditingVehicle(res.vehicle);
        onNotify?.('Vehicle added! You can now upload real photos below.');
      } else {
        const res = await apiRequest(`/api/admin/vehicles/${editingVehicle.id}`, {
          method: 'PUT',
          body: payload,
        });
        setEditingVehicle(res.vehicle);
        onNotify?.('Vehicle details updated.');
      }
      await onReload();
    } catch (err) {
      onNotify?.(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (v) => {
    if (!window.confirm(`Delete ${v.year} ${v.title} (${v.stock_code})?`)) return;
    try {
      await apiRequest(`/api/admin/vehicles/${v.id}`, { method: 'DELETE' });
      onNotify?.('Vehicle deleted from inventory.');
      await onReload();
    } catch (err) {
      onNotify?.(err.message, 'error');
    }
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length || !editingVehicle?.id) return;

    setUploadingPhotos(true);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append('photos', f));
      const res = await apiRequest(`/api/admin/vehicles/${editingVehicle.id}/photos`, {
        method: 'POST',
        body: fd,
        isFormData: true,
      });
      setEditingVehicle(res.vehicle);
      await onReload();
      onNotify?.(`${files.length} photo(s) uploaded.`);
    } catch (err) {
      onNotify?.(err.message, 'error');
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleSetPrimary = async (photoId) => {
    try {
      const res = await apiRequest(
        `/api/admin/vehicles/${editingVehicle.id}/photos/${photoId}/primary`,
        { method: 'PUT' }
      );
      setEditingVehicle(res.vehicle);
      await onReload();
    } catch (err) {
      onNotify?.(err.message, 'error');
    }
  };

  const handleDeletePhoto = async (photoId) => {
    try {
      const res = await apiRequest(
        `/api/admin/vehicles/${editingVehicle.id}/photos/${photoId}`,
        { method: 'DELETE' }
      );
      setEditingVehicle(res.vehicle);
      await onReload();
      onNotify?.('Photo removed.');
    } catch (err) {
      onNotify?.(err.message, 'error');
    }
  };

  const filtered = vehicles.filter((v) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return `${v.stock_code} ${v.title} ${v.make} ${v.model} ${v.status}`.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter inventory by stock code, model, status..."
            className="input-field pl-10"
          />
        </div>
        <button type="button" onClick={openCreate} className="btn-primary py-2.5 text-xs">
          <Plus className="h-4 w-4" />
          Add New Vehicle
        </button>
      </div>

      {/* Mobile Vehicle Cards */}
      <div className="space-y-3 md:hidden">
        {filtered.map((v) => (
          <div key={v.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex gap-3">
              <img
                src={getPrimaryPhoto(v)}
                alt=""
                className="h-16 w-24 shrink-0 rounded-xl object-cover bg-slate-900"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <span className="font-mono text-[11px] font-bold text-[#9A7418]">{v.stock_code}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      v.status === 'Available'
                        ? 'bg-emerald-100 text-emerald-800'
                        : v.status === 'Sold'
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {v.status}
                  </span>
                </div>
                <div className="mt-0.5 text-sm font-bold text-slate-900 leading-snug">
                  {v.year} {v.title}
                </div>
                <div className="mt-0.5 text-[11px] text-slate-500">
                  {v.condition} • {formatMileage(v.mileage_km)} • {v.fuel_type}
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2 border-t border-slate-100 pt-2.5 text-xs">
              <div>
                <div className="font-bold text-slate-900 tabular-nums">
                  {formatCurrency(v.retail_price, currency)}
                </div>
                {v.wholesale_price > 0 && (
                  <div className="text-[11px] font-semibold text-emerald-700 tabular-nums">
                    WS: {formatCurrency(v.wholesale_price, currency)}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(v)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 cursor-pointer"
                >
                  <Edit3 className="inline h-3.5 w-3.5 mr-1" />
                  Edit / Photos
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(v)}
                  className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700 hover:bg-rose-100 cursor-pointer"
                  aria-label="Delete vehicle"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-bold">Vehicle</th>
                <th className="px-4 py-3 font-bold">Specs</th>
                <th className="px-4 py-3 font-bold">Retail / Wholesale</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={getPrimaryPhoto(v)}
                        alt=""
                        className="h-12 w-18 shrink-0 rounded-lg object-cover bg-slate-900"
                      />
                      <div>
                        <div className="font-bold text-slate-900">
                          {v.year} {v.title}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {v.stock_code} • {v.condition} • {v.category}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <div>{formatMileage(v.mileage_km)}</div>
                    <div>
                      {v.fuel_type} • {v.transmission}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">
                      {formatCurrency(v.retail_price, currency)}
                    </div>
                    {v.wholesale_price > 0 && (
                      <div className="text-[11px] font-semibold text-emerald-700">
                        WS: {formatCurrency(v.wholesale_price, currency)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        v.status === 'Available'
                          ? 'bg-emerald-100 text-emerald-800'
                          : v.status === 'Sold'
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {v.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEdit(v)}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                      >
                        <Edit3 className="inline h-3.5 w-3.5 mr-1" />
                        Edit / Photos
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(v)}
                        className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-rose-700 hover:bg-rose-100 cursor-pointer"
                        aria-label="Delete vehicle"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {editingVehicle && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 p-2 sm:p-4 backdrop-blur-xs">
          <div className="mx-auto my-3 sm:my-6 max-w-4xl rounded-3xl bg-white p-4 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="font-display text-xl font-bold text-slate-900">
                  {editingVehicle.isNew ? 'Add New Vehicle to Inventory' : `Edit: ${editingVehicle.title}`}
                </h3>
                <p className="text-xs text-slate-500">
                  Enter specifications, retail &amp; wholesale prices, and manage vehicle gallery photos.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingVehicle(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700">Listing Title *</label>
                <input
                  required
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Toyota Land Cruiser Prado TX-L"
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Stock Code (Auto if empty)</label>
                <input
                  type="text"
                  value={form.stock_code}
                  onChange={(e) => setForm({ ...form, stock_code: e.target.value })}
                  placeholder="e.g. SE-SUV-106"
                  className="input-field mt-1"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Make *</label>
                <input
                  required
                  type="text"
                  value={form.make}
                  onChange={(e) => setForm({ ...form, make: e.target.value })}
                  placeholder="Toyota"
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Model *</label>
                <input
                  required
                  type="text"
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  placeholder="Prado"
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Model Year *</label>
                <input
                  required
                  type="number"
                  min={1960}
                  max={new Date().getFullYear() + 1}
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                  className="input-field mt-1"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Condition</label>
                <select
                  value={form.condition}
                  onChange={(e) => setForm({ ...form, condition: e.target.value })}
                  className="input-field mt-1"
                >
                  <option value="Brand New">Brand New</option>
                  <option value="Reconditioned">Reconditioned</option>
                  <option value="Used">Used</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="input-field mt-1"
                >
                  <option value="SUV">SUV</option>
                  <option value="Car">Car</option>
                  <option value="Hybrid / EV">Hybrid / EV</option>
                  <option value="Pickup / Truck">Pickup / Truck</option>
                  <option value="Van">Van</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Availability Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="input-field mt-1"
                >
                  <option value="Available">Available</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Wholesale Only">Wholesale Only</option>
                  <option value="Sold">Sold</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Retail Price ({currency}) *
                </label>
                <input
                  required
                  type="number"
                  min={1}
                  value={form.retail_price}
                  onChange={(e) => setForm({ ...form, retail_price: e.target.value })}
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Wholesale Price ({currency})
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.wholesale_price}
                  onChange={(e) => setForm({ ...form, wholesale_price: e.target.value })}
                  placeholder="Optional dealer price"
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Mileage (km)</label>
                <input
                  type="number"
                  min={0}
                  value={form.mileage_km}
                  onChange={(e) => setForm({ ...form, mileage_km: e.target.value })}
                  className="input-field mt-1"
                />
              </div>

              <div className="sm:col-span-3 grid gap-4 rounded-2xl border border-amber-200 bg-amber-50/50 p-3.5 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-amber-950">
                    Private Buying Cost ({currency}) — Hidden from Public
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.cost_price}
                    onChange={(e) => setForm({ ...form, cost_price: e.target.value })}
                    placeholder="Purchase / auction + duty cost"
                    className="input-field mt-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-amber-950">
                    Repair / Detailing / Transport Cost ({currency})
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.expenses_total}
                    onChange={(e) => setForm({ ...form, expenses_total: e.target.value })}
                    placeholder="Recon, paint, tires, transport"
                    className="input-field mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Fuel Type</label>
                <select
                  value={form.fuel_type}
                  onChange={(e) => setForm({ ...form, fuel_type: e.target.value })}
                  className="input-field mt-1"
                >
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Plug-in Hybrid">Plug-in Hybrid</option>
                  <option value="Electric">Electric</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Transmission</label>
                <select
                  value={form.transmission}
                  onChange={(e) => setForm({ ...form, transmission: e.target.value })}
                  className="input-field mt-1"
                >
                  <option value="Automatic">Automatic</option>
                  <option value="CVT">CVT</option>
                  <option value="Dual-Clutch">Dual-Clutch</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Engine / Battery</label>
                <input
                  type="text"
                  value={form.engine_cc}
                  onChange={(e) => setForm({ ...form, engine_cc: e.target.value })}
                  placeholder="e.g. 2,500 cc Hybrid"
                  className="input-field mt-1"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Color</label>
                <input
                  type="text"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  placeholder="Pearl White"
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">VIN / Chassis No</label>
                <input
                  type="text"
                  value={form.vin_chassis}
                  onChange={(e) => setForm({ ...form, vin_chassis: e.target.value })}
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Registration No</label>
                <input
                  type="text"
                  value={form.registration_no}
                  onChange={(e) => setForm({ ...form, registration_no: e.target.value })}
                  placeholder="Unregistered / WP..."
                  className="input-field mt-1"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700">
                  Features (comma separated)
                </label>
                <input
                  type="text"
                  value={form.features}
                  onChange={(e) => setForm({ ...form, features: e.target.value })}
                  placeholder="Sunroof, 360 Camera, Leather Seats, Cruise Control"
                  className="input-field mt-1"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-field mt-1"
                />
              </div>

              <div className="flex flex-wrap gap-5 sm:col-span-3">
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="h-4 w-4 accent-amber-500"
                  />
                  Featured on Homepage
                </label>
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.leasing_eligible}
                    onChange={(e) => setForm({ ...form, leasing_eligible: e.target.checked })}
                    className="h-4 w-4 accent-amber-500"
                  />
                  Leasing Available
                </label>
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.exchange_eligible}
                    onChange={(e) => setForm({ ...form, exchange_eligible: e.target.checked })}
                    className="h-4 w-4 accent-amber-500"
                  />
                  Exchange Accepted
                </label>
              </div>

              <div className="flex justify-end gap-2.5 sm:col-span-3 border-t border-slate-200 pt-4">
                <button type="button" onClick={() => setEditingVehicle(null)} className="btn-secondary">
                  Close
                </button>
                <button type="submit" disabled={saving} className="btn-primary">
                  <Check className="h-4 w-4" />
                  {saving
                    ? 'Saving...'
                    : editingVehicle.isNew
                    ? 'Create Vehicle & Unlock Photos'
                    : 'Save Vehicle Details'}
                </button>
              </div>
            </form>

            {/* Photo Upload Manager */}
            {editingVehicle.id && (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-amber-600" />
                    <h4 className="font-display text-sm font-bold text-slate-900">
                      Vehicle Gallery Photos ({editingVehicle.photos?.length || 0}/12)
                    </h4>
                  </div>
                  <label className="btn-dark py-2 text-xs cursor-pointer">
                    <UploadCloud className="h-4 w-4" />
                    {uploadingPhotos ? 'Uploading...' : 'Upload Photos'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      disabled={uploadingPhotos}
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {!editingVehicle.photos?.length ? (
                  <p className="mt-3 text-xs text-slate-500">
                    No photos uploaded yet. Upload crisp JPG, PNG, or WebP images of this vehicle.
                  </p>
                ) : (
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {editingVehicle.photos.map((photo) => (
                      <div
                        key={photo.id}
                        className={`overflow-hidden rounded-xl border-2 bg-white ${
                          photo.is_primary ? 'border-amber-500' : 'border-slate-200'
                        }`}
                      >
                        <div className="aspect-[16/10] bg-slate-900">
                          <img src={assetUrl(photo.url)} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div className="flex items-center justify-between px-2 py-1.5 text-[11px]">
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(photo.id)}
                            className={`inline-flex items-center gap-1 font-semibold cursor-pointer ${
                              photo.is_primary ? 'text-amber-600' : 'text-slate-600 hover:text-amber-600'
                            }`}
                          >
                            <Star className={`h-3 w-3 ${photo.is_primary ? 'fill-current' : ''}`} />
                            {photo.is_primary ? 'Cover' : 'Set Cover'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePhoto(photo.id)}
                            className="text-rose-600 hover:text-rose-800 cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
