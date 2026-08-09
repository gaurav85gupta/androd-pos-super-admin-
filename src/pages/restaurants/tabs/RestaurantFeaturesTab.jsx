// RestaurantFeaturesTab.jsx -- C.6 Feature Flag Management.

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

export function RestaurantFeaturesTab({ restaurantId }) {
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
    setPendingKey(key);
    setToggleError(null);
    try {
      const updated = await featureFlagsApi.set(restaurantId, key, !currentValue);
      setState((s) => ({ ...s, data: updated }));
    } catch (err) {
      setToggleError(err.message); // e.g. plan doesn't include this feature
    } finally {
      setPendingKey(null);
    }
  }

  return (
    <StatefulContent isLoading={state.isLoading} isError={state.isError} error={state.error} data={state.data} onRetry={load}>
      {(flags) => (
        <div>
          {toggleError && <div className="login-form__error" role="alert" style={{ marginBottom: 16 }}>{toggleError}</div>}
          <ul className="toggle-list">
            {Object.entries(FEATURE_LABELS).map(([key, label]) => (
              <li key={key} className="toggle-list__item">
                <span>{label}</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={Boolean(flags[key])}
                  className={`switch ${flags[key] ? 'switch--on' : ''}`}
                  disabled={pendingKey === key}
                  onClick={() => handleToggle(key, flags[key])}
                >
                  <span className="switch__thumb" />
                </button>
              </li>
            ))}
          </ul>
          <p className="form-hint">Android login ke baad sirf enabled features hi visible hote hain.</p>
        </div>
      )}
    </StatefulContent>
  );
}
