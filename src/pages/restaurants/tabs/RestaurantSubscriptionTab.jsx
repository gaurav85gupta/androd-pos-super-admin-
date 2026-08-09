// RestaurantSubscriptionTab.jsx -- C.5 Subscription Management.

import { useState, useEffect, useCallback } from 'react';
import { subscriptionsApi } from '../../../api/subscriptions.api';
import { StatefulContent } from '../../../components/StateViews';
import { StatusBadge } from '../../../components/StatusBadge';
import { format } from 'date-fns';

const PLANS = ['trial', 'basic', 'pro'];
const FEATURE_KEYS = ['counter', 'dashboard', 'menu', 'billSettings', 'intelligence', 'printing', 'kot'];

export function RestaurantSubscriptionTab({ restaurantId }) {
  const [state, setState] = useState({ data: null, isLoading: true, isError: false, error: null });
  const [renewDays, setRenewDays] = useState(30);
  const [busy, setBusy] = useState(false);

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
    setBusy(true);
    try {
      await subscriptionsApi.renew(restaurantId, Number(renewDays));
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function handleSuspend() {
    if (!window.confirm('Suspend this subscription? The restaurant will lose access to paid features.')) return;
    setBusy(true);
    try {
      await subscriptionsApi.suspend(restaurantId);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function handlePlanChange(plan) {
    setBusy(true);
    try {
      const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
      await subscriptionsApi.changePlan(restaurantId, { plan, expiresAt, features: FEATURE_KEYS });
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <StatefulContent isLoading={state.isLoading} isError={state.isError} error={state.error} data={state.data} onRetry={load}>
      {(sub) => (
        <div className="detail-grid">
          <div className="detail-field"><div className="detail-field__label">Current Plan</div>
            <div className="detail-field__value cell-capitalize">{sub.plan}</div></div>
          <div className="detail-field"><div className="detail-field__label">Status</div>
            <div className="detail-field__value"><StatusBadge status={sub.status} /></div></div>
          <div className="detail-field"><div className="detail-field__label">Started</div>
            <div className="detail-field__value">{format(new Date(sub.startedAt), 'dd MMM yyyy')}</div></div>
          <div className="detail-field"><div className="detail-field__label">Expiry Date</div>
            <div className="detail-field__value">{format(new Date(sub.expiresAt), 'dd MMM yyyy')}</div></div>

          <div className="detail-field detail-field--span2">
            <div className="detail-field__label">Change Plan</div>
            <div className="inline-actions">
              {PLANS.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`btn btn--sm ${sub.plan === p ? 'btn--primary' : 'btn--secondary'}`}
                  disabled={busy}
                  onClick={() => handlePlanChange(p)}
                >
                  {p[0].toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="detail-field detail-field--span2">
            <div className="detail-field__label">Renewal</div>
            <div className="inline-actions">
              <select className="field__input" value={renewDays} onChange={(e) => setRenewDays(e.target.value)} style={{ width: 140 }}>
                <option value={30}>+30 days</option>
                <option value={90}>+90 days</option>
                <option value={365}>+365 days</option>
              </select>
              <button type="button" className="btn btn--primary btn--sm" disabled={busy} onClick={handleRenew}>Renew</button>
              <button type="button" className="btn btn--danger-ghost btn--sm" disabled={busy} onClick={handleSuspend}>Suspend subscription</button>
            </div>
          </div>
        </div>
      )}
    </StatefulContent>
  );
}
