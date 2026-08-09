// src/pages/activity/ActivityPage.jsx -- C.9 Activity Logs.

import { useState } from 'react';
import { activityLogsApi } from '../../api/activityLogs.api';
import { usePaginatedQuery } from '../../hooks/usePaginatedQuery';
import { StatefulContent } from '../../components/StateViews';
import { format } from 'date-fns';

const ACTIONS = [
  'RESTAURANT_CREATED', 'RESTAURANT_UPDATED', 'RESTAURANT_ACTIVATED', 'RESTAURANT_SUSPENDED', 'RESTAURANT_ARCHIVED',
  'SUBSCRIPTION_CHANGED', 'SUBSCRIPTION_RENEWED', 'SUBSCRIPTION_SUSPENDED', 'FEATURE_FLAG_UPDATED',
  'USER_CREATED', 'USER_UPDATED', 'USER_DISABLED', 'USER_ENABLED',
  'DEVICE_REGISTERED', 'DEVICE_APPROVED', 'DEVICE_DISABLED', 'DEVICE_REMOVED',
  'SUPER_ADMIN_LOGIN', 'SUPER_ADMIN_LOGIN_FAILED', 'LOGIN_FAILED',
];

export function ActivityPage() {
  const [action, setAction] = useState('');
  const { items, total, isLoading, isError, error, reload, loadMore } = usePaginatedQuery(activityLogsApi.list, { action: action || undefined }, '');

  return (
    <div>
      <div className="page-header">
        <h1>Activity Logs</h1>
      </div>

      <div className="filter-bar">
        <select value={action} onChange={(e) => setAction(e.target.value)} className="field__input filter-bar__select">
          <option value="">All actions</option>
          {ACTIONS.map((a) => <option key={a} value={a}>{a.replaceAll('_', ' ')}</option>)}
        </select>
      </div>

      <StatefulContent
        isLoading={isLoading}
        isError={isError}
        error={error}
        data={items}
        isEmpty={(d) => d.length === 0}
        onRetry={reload}
        emptyProps={{ title: 'No activity recorded yet' }}
      >
        {() => (
          <>
            <table className="data-table">
              <thead><tr><th>Action</th><th>Actor</th><th>Restaurant</th><th>When</th></tr></thead>
              <tbody>
                {items.map((log) => (
                  <tr key={log._id} className="data-table__row">
                    <td className="cell-capitalize">{log.action.replaceAll('_', ' ').toLowerCase()}</td>
                    <td>{log.actorLabel || log.actorType}</td>
                    <td className="cell-secondary">{log.restaurantId || '—'}</td>
                    <td className="cell-secondary">{format(new Date(log.createdAt), 'dd MMM yyyy, HH:mm')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="list-footer">
              <span className="cell-secondary">{items.length} of {total} entries</span>
              {loadMore && <button type="button" className="btn btn--secondary btn--sm" onClick={loadMore}>Load more</button>}
            </div>
          </>
        )}
      </StatefulContent>
    </div>
  );
}
