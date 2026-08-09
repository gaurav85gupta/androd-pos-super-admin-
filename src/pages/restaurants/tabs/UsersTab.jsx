// src/pages/restaurants/tabs/UsersTab.jsx -- C.7 User Management (within a restaurant's detail page).

import { useState, useEffect, useCallback } from 'react';
import { usersApi } from '../../../api/users.api';
import { StatefulContent } from '../../../components/StateViews';
import { StatusBadge } from '../../../components/StatusBadge';

const ROLES = ['owner', 'manager', 'cashier'];

export function UsersTab({ restaurantId }) {
  const [state, setState] = useState({ data: null, isLoading: true, isError: false, error: null });
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({ name: '', username: '', password: '', role: 'cashier' });
  const [formError, setFormError] = useState(null);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, isError: false }));
    try {
      const data = await usersApi.list(restaurantId);
      setState({ data: data.items, isLoading: false, isError: false, error: null });
    } catch (error) {
      setState({ data: null, isLoading: false, isError: true, error });
    }
  }, [restaurantId]);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(e) {
    e.preventDefault();
    setFormError(null);
    try {
      await usersApi.create(restaurantId, form);
      setForm({ name: '', username: '', password: '', role: 'cashier' });
      setIsCreating(false);
      await load();
    } catch (err) {
      setFormError(err.message);
    }
  }

  async function handleToggleActive(user) {
    try {
      if (user.isActive) await usersApi.disable(restaurantId, user._id);
      else await usersApi.enable(restaurantId, user._id);
      await load();
    } catch {
      // Surface via reload -- the StatefulContent error boundary isn't
      // appropriate here since the list itself is fine; a toast system is a
      // future enhancement (not built in this phase).
    }
  }

  return (
    <StatefulContent
      isLoading={state.isLoading}
      isError={state.isError}
      error={state.error}
      data={state.data}
      isEmpty={(d) => d.length === 0 && !isCreating}
      onRetry={load}
      emptyProps={{ title: 'No staff users yet', action: (
        <button type="button" className="btn btn--primary" onClick={() => setIsCreating(true)}>+ Add user</button>
      ) }}
    >
      {(users) => (
        <div>
          <div className="panel__row-header">
            <h3 className="panel__title">Staff users</h3>
            {!isCreating && (
              <button type="button" className="btn btn--secondary btn--sm" onClick={() => setIsCreating(true)}>+ Add user</button>
            )}
          </div>

          {isCreating && (
            <form onSubmit={handleCreate} className="form-grid panel">
              <label className="field">
                <span className="field__label">Name</span>
                <input className="field__input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </label>
              <label className="field">
                <span className="field__label">Username</span>
                <input className="field__input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
              </label>
              <label className="field">
                <span className="field__label">Password</span>
                <input type="password" className="field__input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              </label>
              <label className="field">
                <span className="field__label">Role</span>
                <select className="field__input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </label>
              {formError && <div className="login-form__error field--span-2" role="alert">{formError}</div>}
              <div className="form-actions field--span-2">
                <button type="button" className="btn btn--ghost" onClick={() => setIsCreating(false)}>Cancel</button>
                <button type="submit" className="btn btn--primary">Create user</button>
              </div>
            </form>
          )}

          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Username</th><th>Role</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="data-table__row">
                  <td>{u.name}</td>
                  <td className="mono">{u.username}</td>
                  <td className="cell-capitalize">{u.role}</td>
                  <td><StatusBadge status={u.isActive ? 'active' : 'inactive'} /></td>
                  <td>
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => handleToggleActive(u)}>
                      {u.isActive ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </StatefulContent>
  );
}
