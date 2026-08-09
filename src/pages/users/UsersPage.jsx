// src/pages/users/UsersPage.jsx
//
// C.7 User Management -- top-level nav entry. Users are inherently
// restaurant-scoped (see backend's B.6 multi-tenant model), so rather than
// a fake "all users across all restaurants" list (which the backend
// deliberately does not expose, to avoid a query that ignores tenant
// scoping), this page guides the admin to pick a restaurant first, where
// the full Users tab (create/edit/disable) lives.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePaginatedQuery } from '../../hooks/usePaginatedQuery';
import { restaurantsApi } from '../../api/restaurants.api';
import { StatefulContent } from '../../components/StateViews';
import { StatusBadge } from '../../components/StatusBadge';

export function UsersPage() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { items, isLoading, isError, error, reload } = usePaginatedQuery(restaurantsApi.list, { status: 'active' }, search);

  return (
    <div>
      <div className="page-header">
        <h1>Users</h1>
      </div>
      <p className="form-note">
        Users belong to a specific restaurant. Search for a restaurant below to manage its staff (owner, manager, cashier) accounts.
      </p>
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
            <thead><tr><th>Restaurant</th><th>Code</th><th>Status</th></tr></thead>
            <tbody>
              {items.map((r) => (
                <tr key={r._id} className="data-table__row" onClick={() => navigate(`/restaurants/${r._id}`)}>
                  <td>{r.name}</td>
                  <td className="mono">{r.restaurantCode}</td>
                  <td><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </StatefulContent>
    </div>
  );
}
