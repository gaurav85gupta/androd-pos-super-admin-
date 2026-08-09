// RestaurantOverviewTab.jsx -- C.3 View / Edit + system-generated identifiers.

import { useState } from 'react';
import { restaurantsApi } from '../../../api/restaurants.api';
import { format } from 'date-fns';

const TIMEZONES = ['Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore', 'Europe/London', 'America/New_York'];
const CURRENCIES = ['INR', 'USD', 'AED', 'SGD', 'GBP'];

export function RestaurantOverviewTab({ restaurant, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: restaurant.name, ownerName: restaurant.ownerName || '', contactEmail: restaurant.contactEmail,
    contactPhone: restaurant.contactPhone || '', address: restaurant.address || '', gstNumber: restaurant.gstNumber || '',
    timezone: restaurant.timezone, currency: restaurant.currency,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  function update(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    try {
      await restaurantsApi.update(restaurant._id, form);
      setEditing(false);
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  if (restaurant.status === 'archived') {
    return <p className="panel__empty">This restaurant is archived. Reactivate it to make changes.</p>;
  }

  if (!editing) {
    return (
      <div className="detail-grid">
        <DetailField label="Restaurant Name" value={restaurant.name} />
        <DetailField label="Owner Name" value={restaurant.ownerName || '—'} />
        <DetailField label="Mobile Number" value={restaurant.contactPhone || '—'} />
        <DetailField label="Email" value={restaurant.contactEmail} />
        <DetailField label="Address" value={restaurant.address || '—'} span2 />
        <DetailField label="GST Number" value={restaurant.gstNumber || '—'} />
        <DetailField label="Timezone" value={restaurant.timezone} />
        <DetailField label="Currency" value={restaurant.currency} />
        <DetailField label="Restaurant Code" value={restaurant.restaurantCode} mono />
        <DetailField label="Internal UUID" value={restaurant.internalUuid} mono />
        <DetailField label="Restaurant ID" value={restaurant._id} mono />
        <DetailField label="Created" value={format(new Date(restaurant.createdAt), 'dd MMM yyyy, HH:mm')} />
        <div className="form-actions form-actions--left">
          <button type="button" className="btn btn--secondary" onClick={() => setEditing(true)}>Edit</button>
        </div>
      </div>
    );
  }

  return (
    <div className="form-grid">
      <label className="field"><span className="field__label">Restaurant Name</span>
        <input className="field__input" value={form.name} onChange={(e) => update('name', e.target.value)} /></label>
      <label className="field"><span className="field__label">Owner Name</span>
        <input className="field__input" value={form.ownerName} onChange={(e) => update('ownerName', e.target.value)} /></label>
      <label className="field"><span className="field__label">Mobile Number</span>
        <input className="field__input" value={form.contactPhone} onChange={(e) => update('contactPhone', e.target.value)} /></label>
      <label className="field"><span className="field__label">Email</span>
        <input className="field__input" value={form.contactEmail} onChange={(e) => update('contactEmail', e.target.value)} /></label>
      <label className="field field--span2"><span className="field__label">Address</span>
        <input className="field__input" value={form.address} onChange={(e) => update('address', e.target.value)} /></label>
      <label className="field"><span className="field__label">GST Number</span>
        <input className="field__input" value={form.gstNumber} onChange={(e) => update('gstNumber', e.target.value)} /></label>
      <label className="field"><span className="field__label">Timezone</span>
        <select className="field__input" value={form.timezone} onChange={(e) => update('timezone', e.target.value)}>
          {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
        </select></label>
      <label className="field"><span className="field__label">Currency</span>
        <select className="field__input" value={form.currency} onChange={(e) => update('currency', e.target.value)}>
          {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select></label>

      {error && <div className="login-form__error" role="alert">{error}</div>}

      <div className="form-actions">
        <button type="button" className="btn btn--ghost" onClick={() => setEditing(false)}>Cancel</button>
        <button type="button" className="btn btn--primary" disabled={isSaving} onClick={handleSave}>
          {isSaving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}

function DetailField({ label, value, mono, span2 }) {
  return (
    <div className={`detail-field ${span2 ? 'detail-field--span2' : ''}`}>
      <div className="detail-field__label">{label}</div>
      <div className={`detail-field__value ${mono ? 'mono' : ''}`}>{value}</div>
    </div>
  );
}
