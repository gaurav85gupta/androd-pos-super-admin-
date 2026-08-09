// src/pages/restaurants/tabs/OverviewTab.jsx -- C.3 View / Edit.

import { useState } from 'react';
import { restaurantsApi } from '../../../api/restaurants.api';
import { format } from 'date-fns';

export function OverviewTab({ restaurant, onSaved }) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: restaurant.name, ownerName: restaurant.ownerName || '', contactEmail: restaurant.contactEmail,
    contactPhone: restaurant.contactPhone || '', address: restaurant.address || '', gstNumber: restaurant.gstNumber || '',
    timezone: restaurant.timezone, currency: restaurant.currency,
  });
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      await restaurantsApi.update(restaurant._id, form);
      setIsEditing(false);
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  if (restaurant.status === 'archived' && !isEditing) {
    return <p className="panel__empty">This restaurant is archived and cannot be edited. Reactivate it first.</p>;
  }

  if (!isEditing) {
    return (
      <div className="detail-grid">
        <DetailField label="Owner" value={restaurant.ownerName || '—'} />
        <DetailField label="Email" value={restaurant.contactEmail} />
        <DetailField label="Phone" value={restaurant.contactPhone || '—'} />
        <DetailField label="Address" value={restaurant.address || '—'} />
        <DetailField label="GST Number" value={restaurant.gstNumber || '—'} />
        <DetailField label="Timezone" value={restaurant.timezone} />
        <DetailField label="Currency" value={restaurant.currency} />
        <DetailField label="Restaurant Code" value={restaurant.restaurantCode} mono />
        <DetailField label="Internal UUID" value={restaurant.internalUuid} mono />
        <DetailField label="Created" value={format(new Date(restaurant.createdAt), 'dd MMM yyyy, HH:mm')} />
        <div className="detail-grid__actions">
          <button type="button" className="btn btn--secondary" onClick={() => setIsEditing(true)}>Edit details</button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="form-grid">
      <label className="field">
        <span className="field__label">Restaurant Name</span>
        <input className="field__input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      </label>
      <label className="field">
        <span className="field__label">Owner Name</span>
        <input className="field__input" value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} />
      </label>
      <label className="field">
        <span className="field__label">Email</span>
        <input type="email" className="field__input" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
      </label>
      <label className="field">
        <span className="field__label">Phone</span>
        <input className="field__input" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
      </label>
      <label className="field field--span-2">
        <span className="field__label">Address</span>
        <input className="field__input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
      </label>
      <label className="field">
        <span className="field__label">GST Number</span>
        <input className="field__input" value={form.gstNumber} onChange={(e) => setForm({ ...form, gstNumber: e.target.value })} />
      </label>

      {error && <div className="login-form__error field--span-2" role="alert">{error}</div>}

      <div className="form-actions field--span-2">
        <button type="button" className="btn btn--ghost" onClick={() => setIsEditing(false)}>Cancel</button>
        <button type="submit" className="btn btn--primary" disabled={isSaving}>{isSaving ? 'Saving…' : 'Save changes'}</button>
      </div>
    </form>
  );
}

function DetailField({ label, value, mono }) {
  return (
    <div className="detail-field">
      <div className="detail-field__label">{label}</div>
      <div className={`detail-field__value ${mono ? 'mono' : ''}`}>{value}</div>
    </div>
  );
}
