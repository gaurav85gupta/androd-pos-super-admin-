// src/pages/dashboard/DashboardPage.jsx
//
// C.2 Super Admin Dashboard -- all 7 widgets from the brief.

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../../api/dashboard.api';
import { StatefulContent } from '../../components/StateViews';
import { formatDistanceToNow } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const STATUS_COLORS = { active: '#3ac17e', suspended: '#e5484d', archived: '#667085' };

function Widget({ label, value, accent }) {
  return (
    <div className="widget">
      <div className="widget__label">{label}</div>
      <div className="widget__value" style={accent ? { color: accent } : undefined}>{value}</div>
    </div>
  );
}

export function DashboardPage() {
  const [state, setState] = useState({ data: null, isLoading: true, isError: false, error: null });
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, isError: false }));
    try {
      const data = await dashboardApi.getSummary();
      setState({ data, isLoading: false, isError: false, error: null });
    } catch (error) {
      setState({ data: null, isLoading: false, isError: true, error });
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      <StatefulContent
        isLoading={state.isLoading}
        isError={state.isError}
        error={state.error}
        data={state.data}
        onRetry={load}
      >
        {(data) => {
          const pieData = [
            { name: 'Active', key: 'active', value: data.activeRestaurants },
            { name: 'Suspended', key: 'suspended', value: data.suspendedRestaurants },
            { name: 'Archived', key: 'archived', value: data.archivedRestaurants },
          ].filter((d) => d.value > 0);

          return (
            <>
              <div className="widget-grid">
                <Widget label="Total Restaurants" value={data.totalRestaurants} />
                <Widget label="Active Restaurants" value={data.activeRestaurants} accent="var(--status-active)" />
                <Widget label="Suspended Restaurants" value={data.suspendedRestaurants} accent="var(--status-suspended)" />
                <Widget label="Total Devices" value={data.totalDevices} />
                <Widget label="Active Subscriptions" value={data.activeSubscriptions} accent="var(--accent-500)" />
                <Widget label="Expiring Subscriptions" value={data.expiringSubscriptions.length} accent="var(--status-grace)" />
              </div>

              <div className="dashboard-lower">
                <div className="panel">
                  <h2 className="panel__title">Restaurant status split</h2>
                  {pieData.length === 0 ? (
                    <p className="panel__empty">No restaurants yet.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3}>
                          {pieData.map((entry) => (
                            <Cell key={entry.key} fill={STATUS_COLORS[entry.key]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--surface-4)', borderRadius: 8 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="panel">
                  <h2 className="panel__title">Recent activity</h2>
                  {data.recentActivity.length === 0 ? (
                    <p className="panel__empty">No activity recorded yet.</p>
                  ) : (
                    <ul className="activity-feed">
                      {data.recentActivity.map((entry) => (
                        <li key={entry._id} className="activity-feed__item">
                          <span className="activity-feed__action">{entry.action.replaceAll('_', ' ').toLowerCase()}</span>
                          <span className="activity-feed__meta">
                            {entry.actorLabel || entry.actorType} · {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => navigate('/activity')}>
                    View all activity
                  </button>
                </div>
              </div>
            </>
          );
        }}
      </StatefulContent>
    </div>
  );
}
