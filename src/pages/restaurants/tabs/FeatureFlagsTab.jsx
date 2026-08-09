// src/pages/restaurants/tabs/FeatureFlagsTab.jsx -- C.6 Feature Flag Management.

import { useState, useEffect, useCallback } from 'react';
import { featureFlagsApi } from '../../../api/subscriptions.api';
import { StatefulContent } from '../../../components/StateViews';

const FEATURE_LABELS = {
  counter: 'Counter',
  dashboard: 'Dashboard',
  menu: 'Menu',
  billSettings: 'Bill Settings',
  intelligence: 'Intelligence',
  printing: 'Printing',
  kot: 'KOT',
};

export function FeatureFlagsTab({ restaurantId }) {
  const [state, setState] = useState({ data: null, isLoading: true, isError: false, error: null });
  const [pendingKey, setPendingKey] = useState(null);
  const [toggleError, setToggleError] = useState(null);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, isError: false }));
    try {
      const data = await featureFlagsApi.get(restaurantId);
      setState({ data, isLoading: false, isError: false, error: null });
    } catch (error) {
      setState({ data: null, isLoading: false, isError: true, error });
    }
  }, [restaurantId]);

  useEffect(() => { load(); }, [load]);

  async function handleToggle(key, currentValue) {
    setToggleError(null);
    setPendingKey(key);
    try {
      const updated = await featureFlagsApi.set(restaurantId, key, !currentValue);
      setState((s) => ({ ...s, data: updated }));
    } catch (err) {
      setToggleError(err.message);
    } finally {
      setPendingKey(null);
    }
  }

  return (
    <StatefulContent isLoading={state.isLoading} isError={state.isError} error={state.error} data={state.data} onRetry={load}>
      {(flags) => (
        <div className="panel">
          <p className="form-note">
            Turning a feature ON requires it be included in the restaurant's current subscription plan.
            Android login only shows enabled features to staff.
          </p>
          {toggleError && <div className="login-form__error" role="alert">{toggleError}</div>}
          <ul className="flag-list">
            {Object.entries(FEATURE_LABELS).map(([key, label]) => (
              <li key={key} className="flag-list__item">
                <span>{label}</span>
                <button
                  type="button"
                  className={`toggle ${flags[key] ? 'toggle--on' : ''}`}
                  onClick={() => handleToggle(key, flags[key])}
                  disabled={pendingKey === key}
                  aria-pressed={Boolean(flags[key])}
                  aria-label={`Toggle ${label}`}
                >
                  <span className="toggle__thumb" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </StatefulContent>
  );
}
