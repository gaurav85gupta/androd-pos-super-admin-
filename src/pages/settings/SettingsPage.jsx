// src/pages/settings/SettingsPage.jsx -- C.1 Password Change.

import { useState } from 'react';
import { authApi } from '../../api/auth.api';

export function SettingsPage() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (form.newPassword !== form.confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.changePassword(form.currentPassword, form.newPassword);
      setSuccess(true);
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Settings</h1>
      </div>

      <div className="panel" style={{ maxWidth: 440 }}>
        <h3 className="panel__title">Change password</h3>
        <form onSubmit={handleSubmit} className="form-grid">
          <label className="field field--span-2">
            <span className="field__label">Current password</span>
            <input
              type="password"
              className="field__input"
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              required
            />
          </label>
          <label className="field field--span-2">
            <span className="field__label">New password</span>
            <input
              type="password"
              className="field__input"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              required
              minLength={8}
            />
          </label>
          <label className="field field--span-2">
            <span className="field__label">Confirm new password</span>
            <input
              type="password"
              className="field__input"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
            />
          </label>

          {error && <div className="login-form__error field--span-2" role="alert">{error}</div>}
          {success && <div className="form-success field--span-2" role="status">Password changed successfully.</div>}

          <div className="form-actions field--span-2">
            <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Change password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
