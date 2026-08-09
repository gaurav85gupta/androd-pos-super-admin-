// src/pages/restaurants/RestaurantsListPage.jsx
//
// C.3 Restaurant Management (list + actions) + C.10 Search & Filters.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { restaurantsApi } from '../../api/restaurants.api';
import { usePaginatedQuery } from '../../hooks/usePaginatedQuery';
import { StatefulContent } from '../../components/StateViews';
import { StatusBadge, statusRailStyle } from '../../components/StatusBadge';
import { format } from 'date-fns';

export function RestaurantsListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [plan, setPlan] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const { items, total, isLoading, isError, error, reload, loadMore } = usePaginatedQuery(
    restaurantsApi.list,
    { status: status || undefined, plan: plan || undefined, sortBy, sortOrder },
    search,
  );

  return (
    <div>
      <div className="page-header">
        <h1>Restaurants</h1>
        <button type="button" className="btn btn--primary" onClick={() => navigate('/restaurants/new')}>
          + New Restaurant
        </button>
      </div>

      <div className="filter-bar">
        <input
          type="search"
          placeholder="Search by name, code, or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="field__input filter-bar__search"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="field__input filter-bar__select">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="archived">Archived</option>
        </select>
        <select value={plan} onChange={(e) => setPlan(e.target.value)} className="field__input filter-bar__select">
          <option value="">All plans</option>
          <option value="trial">Trial</option>
          <option value="basic">Basic</option>
          <option value="pro">Pro</option>
        </select>
        <select
          value={`${sortBy}:${sortOrder}`}
          onChange={(e) => { const [b, o] = e.target.value.split(':'); setSortBy(b); setSortOrder(o); }}
          className="field__input filter-bar__select"
        >
          <option value="createdAt:desc">Newest first</option>
          <option value="createdAt:asc">Oldest first</option>
          <option value="name:asc">Name A–Z</option>
          <option value="name:desc">Name Z–A</option>
        </select>
      </div>

      <StatefulContent
        isLoading={isLoading}
        isError={isError}
        error={error}
        data={items}
        isEmpty={(d) => d.length === 0}
        onRetry={reload}
        emptyProps={{ title: 'No restaurants match your filters', message: 'Try adjusting search or filters, or create a new restaurant.' }}
      >
        {() => (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Restaurant</th>
                  <th>Code</th>
                  <th>Owner</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r._id} className="data-table__row" style={statusRailStyle(r.status)} onClick={() => navigate(`/restaurants/${r._id}`)}>
                    <td>
                      <div className="cell-primary">{r.name}</div>
                      <div className="cell-secondary">{r.contactEmail}</div>
                    </td>
                    <td className="mono">{r.restaurantCode}</td>
                    <td>{r.ownerName || '—'}</td>
                    <td className="cell-capitalize">{r.plan}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td className="cell-secondary">{format(new Date(r.createdAt), 'dd MMM yyyy')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="list-footer">
              <span className="cell-secondary">{items.length} of {total} restaurants</span>
              {loadMore && (
                <button type="button" className="btn btn--secondary btn--sm" onClick={loadMore}>
                  Load more
                </button>
              )}
            </div>
          </>
        )}
      </StatefulContent>
    </div>
  );
}
