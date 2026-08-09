// RestaurantUsersTab.jsx -- C.7 User Management (scoped to one restaurant).

import { useState, useEffect, useCallback } from 'react';
import { usersApi } from '../../../api/users.api';
import { StatefulContent } from '../../../components/StateViews';

const ROLES = ['owner', 'manager', 'cashier'];

export function RestaurantUsersTab({ restaurantId }) {
  const [state, setState] = useState({ data: null, isLoading: true, isError: false, error: null });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', username: '', password: '', role: 'cashier' });
  const [formError, setFormError] = useState(null);
  const [busyUserId, setBusyUserId] = useState(null);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, isError: false }));
    try {
      const data = await usersApi.list(restaurantId);
      setState({ data, isLoading: false, isError: false, error: null });
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
      setShowForm(false);
      await load();
    } catch (err) {
      setFormError(err.details ? err.details.map((d) => d.message).join(' ') : err.message);
    }
  }

  async function toggleActive(user) {
    setBusyUserId(user._id);
    try {
      await (user.isActive ? usersApi.disable(restaurantId, user._id) : usersApi.enable(restaurantId, user._id));
      await load();
    } finally {
      setBusyUserId(null);
    }
  }

  return (
    <div>
      <div className="tab-toolbar">
        <button type="button" className="btn btn--secondary btn--sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ Add user'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="form-card form-card--compact">
          <div className="form-grid">
            <label className="field"><span className="field__label">Name</span>
              <input className="field__input" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></label>
            <label className="field"><span className="field__label">Username</span>
              <input className="field__input" required value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} /></label>
            <label className="field"><span className="field__label">Password</span>
              <input type="password" className="field__input" required value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} /></label>
            <label className="field"><span className="field__label">Role</span>
              <select className="field__input" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
                {ROLES.map((r) => <option key={r} value={r}>{r[0].toUpperCase() + r.slice(1)}</option>)}
              </select></label>
          </div>
          {formError && <div className="login-form__error" role="alert">{formError}</div>}
          <div className="form-actions"><button type="submit" className="btn btn--primary btn--sm">Create user</button></div>
        </form>
      )}

      <StatefulContent
        isLoading={state.isLoading} isError={state.isError} error={state.error} data={state.data}
        isEmpty={(d) => d.items.length === 0} onRetry={load}
        emptyProps={{ title: 'No users yet', message: 'Add the first staff login for this restaurant.' }}
      >
        {(data) => (
          <table className="data-table">
            <thead><tr><th>Name</th><th>Username</th><th>Role</th><th>Status</th><th /></tr></thead>
            <tbody>
              {data.items.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td className="mono">{u.username}</td>
                  <td className="cell-capitalize">{u.role}</td>
                  <td>{u.isActive ? 'Active' : 'Disabled'}</td>
                  <td>
                    <button type="button" className="btn btn--ghost btn--sm" disabled={busyUserId === u._id} onClick={() => toggleActive(u)}>
                      {u.isActive ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </StatefulContent>
    </div>
  );
}
