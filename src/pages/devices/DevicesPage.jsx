// src/pages/devices/DevicesPage.jsx -- C.8 Device Management.

import { useState } from 'react';
import { devicesApi } from '../../api/devices.api';
import { usePaginatedQuery } from '../../hooks/usePaginatedQuery';
import { StatefulContent } from '../../components/StateViews';
import { StatusBadge } from '../../components/StatusBadge';
import { formatDistanceToNow } from 'date-fns';

export function DevicesPage() {
  const [status, setStatus] = useState('');
  const [actionError, setActionError] = useState(null);
  const { items, total, isLoading, isError, error, reload, loadMore } = usePaginatedQuery(devicesApi.list, { status: status || undefined }, '');

  async function handleAction(deviceId, action) {
    setActionError(null);
    try {
      if (action === 'approve') await devicesApi.approve(deviceId);
      if (action === 'disable') await devicesApi.disable(deviceId);
      if (action === 'remove') await devicesApi.remove(deviceId);
      await reload();
    } catch (err) {
      setActionError(err.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Devices</h1>
      </div>

      <div className="filter-bar">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="field__input filter-bar__select">
          <option value="">All statuses</option>
          <option value="pending">Pending approval</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="removed">Removed</option>
        </select>
      </div>

      {actionError && <div className="login-form__error" role="alert">{actionError}</div>}

      <StatefulContent
        isLoading={isLoading}
        isError={isError}
        error={error}
        data={items}
        isEmpty={(d) => d.length === 0}
        onRetry={reload}
        emptyProps={{ title: 'No devices found' }}
      >
        {() => (
          <>
            <table className="data-table">
              <thead>
                <tr><th>Device Name</th><th>Restaurant</th><th>Last Login</th><th>Last Sync</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {items.map((d) => (
                  <tr key={d._id} className="data-table__row">
                    <td>
                      <div className="cell-primary">{d.deviceName || 'Unnamed device'}</div>
                      <div className="cell-secondary mono">{d.deviceIdentifier}</div>
                    </td>
                    <td>{d.restaurantId?.name || '—'} <span className="cell-secondary mono">{d.restaurantId?.restaurantCode}</span></td>
                    <td className="cell-secondary">{d.lastLoginAt ? formatDistanceToNow(new Date(d.lastLoginAt), { addSuffix: true }) : '—'}</td>
                    <td className="cell-secondary">{d.lastSeenAt ? formatDistanceToNow(new Date(d.lastSeenAt), { addSuffix: true }) : '—'}</td>
                    <td><StatusBadge status={d.status} /></td>
                    <td className="actions-cell">
                      {d.status === 'pending' && (
                        <button type="button" className="btn btn--secondary btn--sm" onClick={() => handleAction(d._id, 'approve')}>Approve</button>
                      )}
                      {d.status !== 'inactive' && d.status !== 'removed' && (
                        <button type="button" className="btn btn--ghost btn--sm" onClick={() => handleAction(d._id, 'disable')}>Disable</button>
                      )}
                      {d.status !== 'removed' && (
                        <button type="button" className="btn btn--danger-outline btn--sm" onClick={() => handleAction(d._id, 'remove')}>Remove</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="list-footer">
              <span className="cell-secondary">{items.length} of {total} devices</span>
              {loadMore && <button type="button" className="btn btn--secondary btn--sm" onClick={loadMore}>Load more</button>}
            </div>
          </>
        )}
      </StatefulContent>
    </div>
  );
}
