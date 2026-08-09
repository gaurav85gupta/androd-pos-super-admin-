// src/pages/restaurants/RestaurantFormPage.jsx
//
// C.3 Restaurant Create -- all fields from the brief. Restaurant Code,
// Restaurant ID, and Internal UUID are system-generated (never shown as
// editable inputs here) and appear read-only on the detail page after
// creation.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { restaurantsApi } from '../../api/restaurants.api';

const TIMEZONES = ['Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore', 'Europe/London', 'America/New_York'];
const CURRENCIES = ['INR', 'USD', 'AED', 'SGD', 'GBP'];
const PLANS = ['trial', 'basic', 'pro'];

const initialForm = {
  name: '', ownerName: '', contactEmail: '', contactPhone: '', address: '',
  gstNumber: '', plan: 'trial', timezone: 'Asia/Kolkata', currency: 'INR',
};

export function RestaurantFormPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError(null);
    setErrors({});
    setIsSubmitting(true);
    try {
      const restaurant = await restaurantsApi.create(form);
      navigate(`/restaurants/${restaurant._id}`);
    } catch (err) {
      if (err.code === 'VALIDATION_ERROR' && err.details) {
        const fieldErrors = {};
        err.details.forEach((d) => { fieldErrors[d.field] = d.message; });
        setErrors(fieldErrors);
      } else {
        setSubmitError(err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>New Restaurant</h1>
      </div>

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-grid">
          <label className="field">
            <span className="field__label">Restaurant Name *</span>
            <input className="field__input" value={form.name} onChange={(e) => update('name', e.target.value)} required />
            {errors.name && <span className="field__error">{errors.name}</span>}
          </label>

          <label className="field">
            <span className="field__label">Owner Name *</span>
            <input className="field__input" value={form.ownerName} onChange={(e) => update('ownerName', e.target.value)} required />
            {errors.ownerName && <span className="field__error">{errors.ownerName}</span>}
          </label>

          <label className="field">
            <span className="field__label">Mobile Number *</span>
            <input className="field__input" value={form.contactPhone} onChange={(e) => update('contactPhone', e.target.value)} required />
            {errors.contactPhone && <span className="field__error">{errors.contactPhone}</span>}
          </label>

          <label className="field">
            <span className="field__label">Email *</span>
            <input type="email" className="field__input" value={form.contactEmail} onChange={(e) => update('contactEmail', e.target.value)} required />
            {errors.contactEmail && <span className="field__error">{errors.contactEmail}</span>}
          </label>

          <label className="field field--span-2">
            <span className="field__label">Address</span>
            <input className="field__input" value={form.address} onChange={(e) => update('address', e.target.value)} />
          </label>

          <label className="field">
            <span className="field__label">GST Number (optional)</span>
            <input className="field__input" value={form.gstNumber} onChange={(e) => update('gstNumber', e.target.value)} />
          </label>

          <label className="field">
            <span className="field__label">Plan</span>
            <select className="field__input" value={form.plan} onChange={(e) => update('plan', e.target.value)}>
              {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>

          <label className="field">
            <span className="field__label">Timezone</span>
            <select className="field__input" value={form.timezone} onChange={(e) => update('timezone', e.target.value)}>
              {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </label>

          <label className="field">
            <span className="field__label">Currency</span>
            <select className="field__input" value={form.currency} onChange={(e) => update('currency', e.target.value)}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>

        <p className="form-note">
          Restaurant ID, Restaurant Code, and Internal UUID will be generated automatically after creation.
        </p>

        {submitError && <div className="login-form__error" role="alert">{submitError}</div>}

        <div className="form-actions">
          <button type="button" className="btn btn--ghost" onClick={() => navigate('/restaurants')}>Cancel</button>
          <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
            {isSubmitting ? 'Creating…' : 'Create Restaurant'}
          </button>
        </div>
      </form>
    </div>
  );
}
