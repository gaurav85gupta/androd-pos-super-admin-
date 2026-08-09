// src/pages/subscriptions/SubscriptionsPage.jsx -- C.5 Subscription Management, platform-wide view.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePaginatedQuery } from '../../hooks/usePaginatedQuery';
import { restaurantsApi } from '../../api/restaurants.api';
import { StatefulContent } from '../../components/StateViews';

export function SubscriptionsPage() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { items, isLoading, isError, error, reload } = usePaginatedQuery(restaurantsApi.list, {}, search);

  return (
    <div>
      <div className="page-header">
        <h1>Subscriptions</h1>
      </div>
      <p className="form-note">Pick a restaurant to view or change its plan, expiry, and renewal.</p>
      <input
        type="search"
        placeholder="Search restaurants…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="field__input filter-bar__search"
        style={{ marginBottom: 'var(--space-4)' }}
      />

      <StatefulContent
        isLoading={isLoading}
        isError={isError}
        error={error}
        data={items}
        isEmpty={(d) => d.length === 0}
        onRetry={reload}
        emptyProps={{ title: 'No restaurants found' }}
      >
        {() => (
          <table className="data-table">
            <thead><tr><th>Restaurant</th><th>Code</th><th>Plan</th></tr></thead>
            <tbody>
              {items.map((r) => (
                <tr key={r._id} className="data-table__row" onClick={() => navigate(`/restaurants/${r._id}`)}>
                  <td>{r.name}</td>
                  <td className="mono">{r.restaurantCode}</td>
                  <td className="cell-capitalize">{r.plan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </StatefulContent>
    </div>
  );
}
