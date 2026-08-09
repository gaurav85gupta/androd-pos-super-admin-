// src/pages/restaurants/RestaurantDetailPage.jsx
//
// C.3 Restaurant Actions (View / Edit / Activate / Suspend / Archive) as
// tab 1, with C.4 Configuration, C.5 Subscription, C.6 Feature Flags, and
// C.7 Users as sibling tabs on the same page -- a Super Admin managing one
// restaurant needs all of this in one place, not spread across five routes.

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { restaurantsApi } from '../../api/restaurants.api';
import { StatefulContent } from '../../components/StateViews';
import { StatusBadge } from '../../components/StatusBadge';
import { OverviewTab } from './tabs/OverviewTab';
import { ConfigTab } from './tabs/ConfigTab';
import { SubscriptionTab } from './tabs/SubscriptionTab';
import { FeatureFlagsTab } from './tabs/FeatureFlagsTab';
import { UsersTab } from './tabs/UsersTab';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'config', label: 'Configuration' },
  { key: 'subscription', label: 'Subscription' },
  { key: 'features', label: 'Feature Flags' },
  { key: 'users', label: 'Users' },
];

export function RestaurantDetailPage() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ data: null, isLoading: true, isError: false, error: null });
  const [activeTab, setActiveTab] = useState('overview');
  const [actionError, setActionError] = useState(null);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, isError: false }));
    try {
      const data = await restaurantsApi.getById(restaurantId);
      setState({ data, isLoading: false, isError: false, error: null });
    } catch (error) {
      setState({ data: null, isLoading: false, isError: true, error });
    }
  }, [restaurantId]);

  useEffect(() => { load(); }, [load]);

  async function handleAction(action) {
    setActionError(null);
    try {
      if (action === 'activate') await restaurantsApi.activate(restaurantId);
      if (action === 'suspend') await restaurantsApi.suspend(restaurantId);
      if (action === 'archive') await restaurantsApi.archive(restaurantId);
      await load();
    } catch (err) {
      setActionError(err.message);
    }
  }

  return (
    <div>
      <button type="button" className="btn btn--ghost btn--sm" onClick={() => navigate('/restaurants')}>
        &larr; Back to restaurants
      </button>

      <StatefulContent isLoading={state.isLoading} isError={state.isError} error={state.error} data={state.data} onRetry={load}>
        {(restaurant) => (
          <>
            <div className="detail-header">
              <div>
                <h1>{restaurant.name}</h1>
                <div className="detail-header__meta">
                  <span className="mono">{restaurant.restaurantCode}</span>
                  <StatusBadge status={restaurant.status} />
                </div>
              </div>
              <div className="detail-header__actions">
                {restaurant.status !== 'active' && (
                  <button type="button" className="btn btn--secondary" onClick={() => handleAction('activate')}>Activate</button>
                )}
                {restaurant.status === 'active' && (
                  <button type="button" className="btn btn--secondary" onClick={() => handleAction('suspend')}>Suspend</button>
                )}
                {restaurant.status !== 'archived' && (
                  <button type="button" className="btn btn--danger-outline" onClick={() => handleAction('archive')}>Archive</button>
                )}
              </div>
            </div>

            {actionError && <div className="login-form__error" role="alert">{actionError}</div>}

            <div className="tabs">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`tabs__item ${activeTab === tab.key ? 'tabs__item--active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="tab-panel">
              {activeTab === 'overview' && <OverviewTab restaurant={restaurant} onSaved={load} />}
              {activeTab === 'config' && <ConfigTab restaurantId={restaurantId} />}
              {activeTab === 'subscription' && <SubscriptionTab restaurantId={restaurantId} />}
              {activeTab === 'features' && <FeatureFlagsTab restaurantId={restaurantId} />}
              {activeTab === 'users' && <UsersTab restaurantId={restaurantId} />}
            </div>
          </>
        )}
      </StatefulContent>
    </div>
  );
}
