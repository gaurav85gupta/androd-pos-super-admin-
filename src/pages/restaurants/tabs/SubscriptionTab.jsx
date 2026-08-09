// src/pages/restaurants/tabs/SubscriptionTab.jsx -- C.5 Subscription Management.

import { useState, useEffect, useCallback } from 'react';
import { subscriptionsApi } from '../../../api/subscriptions.api';
import { StatefulContent } from '../../../components/StateViews';
import { StatusBadge } from '../../../components/StatusBadge';
import { format } from 'date-fns';

const PLANS = ['trial', 'basic', 'pro'];
const ALL_FEATURES = ['counter', 'dashboard', 'menu', 'billSettings', 'intelligence', 'printing', 'kot'];

export function SubscriptionTab({ restaurantId }) {
  const [state, setState] = useState({ data: null, isLoading: true, isError: false, error: null });
  const [renewDays, setRenewDays] = useState(30);
  const [actionError, setActionError] = useState(null);
  const [isPlanEditorOpen, setIsPlanEditorOpen] = useState(false);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, isError: false }));
    try {
      const data = await subscriptionsApi.get(restaurantId);
      setState({ data, isLoading: false, isError: false, error: null });
    } catch (error) {
      setState({ data: null, isLoading: false, isError: true, error });
    }
  }, [restaurantId]);

  useEffect(() => { load(); }, [load]);

  async function handleRenew() {
    setActionError(null);
    try {
      await subscriptionsApi.renew(restaurantId, Number(renewDays));
      await load();
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handleSuspend() {
    setActionError(null);
    try {
      await subscriptionsApi.suspend(restaurantId);
      await load();
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handlePlanChange(formData) {
    setActionError(null);
    try {
      await subscriptionsApi.changePlan(restaurantId, formData);
      setIsPlanEditorOpen(false);
      await load();
    } catch (err) {
      setActionError(err.message);
    }
  }

  return (
    <StatefulContent isLoading={state.isLoading} isError={state.isError} error={state.error} data={state.data} onRetry={load}>
      {(subscription) => (
        <div className="config-sections">
          <div className="panel">
            <div className="panel__row-header">
              <h3 className="panel__title">Current plan</h3>
              <StatusBadge status={subscription.status} />
            </div>
            <div className="detail-grid">
              <DetailField label="Plan" value={subscription.plan} />
              <DetailField label="Expiry Date" value={format(new Date(subscription.expiresAt), 'dd MMM yyyy')} />
              <DetailField label="Features included" value={subscription.features.join(', ')} />
            </div>

            {actionError && <div className="login-form__error" role="alert">{actionError}</div>}

            <div className="form-actions form-actions--start">
              <div className="renew-control">
                <input
                  type="number"
                  className="field__input renew-control__input"
                  value={renewDays}
                  onChange={(e) => setRenewDays(e.target.value)}
                  min={1}
                />
                <button type="button" className="btn btn--secondary" onClick={handleRenew}>Renew (days)</button>
              </div>
              <button type="button" className="btn btn--secondary" onClick={() => setIsPlanEditorOpen((v) => !v)}>
                Change plan
              </button>
              <button type="button" className="btn btn--danger-outline" onClick={handleSuspend}>Suspend subscription</button>
            </div>
          </div>

          {isPlanEditorOpen && <PlanEditor current={subscription} onSubmit={handlePlanChange} onCancel={() => setIsPlanEditorOpen(false)} />}
        </div>
      )}
    </StatefulContent>
  );
}

function PlanEditor({ current, onSubmit, onCancel }) {
  const [plan, setPlan] = useState(current.plan);
  const [expiresAt, setExpiresAt] = useState(current.expiresAt.slice(0, 10));
  const [features, setFeatures] = useState(current.features);

  function toggleFeature(key) {
    setFeatures((f) => (f.includes(key) ? f.filter((k) => k !== key) : [...f, key]));
  }

  return (
    <div className="panel">
      <h3 className="panel__title">Change plan</h3>
      <div className="form-grid">
        <label className="field">
          <span className="field__label">Plan</span>
          <select className="field__input" value={plan} onChange={(e) => setPlan(e.target.value)}>
            {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>
        <label className="field">
          <span className="field__label">Expiry Date</span>
          <input type="date" className="field__input" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
        </label>
      </div>
      <div className="field__label" style={{ marginTop: 'var(--space-4)' }}>Included features</div>
      <div className="checkbox-grid">
        {ALL_FEATURES.map((key) => (
          <label key={key} className="checkbox-item">
            <input type="checkbox" checked={features.includes(key)} onChange={() => toggleFeature(key)} />
            {key}
          </label>
        ))}
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>Cancel</button>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => onSubmit({ plan, expiresAt: new Date(expiresAt).toISOString(), features })}
        >
          Save plan
        </button>
      </div>
    </div>
  );
}

function DetailField({ label, value }) {
  return (
    <div className="detail-field">
      <div className="detail-field__label">{label}</div>
      <div className="detail-field__value">{value}</div>
    </div>
  );
}
