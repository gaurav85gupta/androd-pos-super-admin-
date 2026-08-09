// src/layout/NotificationCenter.jsx
//
// C.11 Notification Center. Derives alerts from data the app already
// fetches for the Dashboard (expiring subscriptions) rather than requiring
// a dedicated notifications backend endpoint in this phase -- device
// offline / login failure / sync failure notifications are noted as a
// future hook below, once the backend emits events those can subscribe to.

import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../api/dashboard.api';
import { formatDistanceToNow } from 'date-fns';

const POLL_INTERVAL_MS = 60_000;

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [expiring, setExpiring] = useState([]);
  const navigate = useNavigate();
  const containerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const summary = await dashboardApi.getSummary();
        if (!cancelled) setExpiring(summary.expiringSubscriptions || []);
      } catch {
        // Silent -- a failed notification poll shouldn't interrupt the admin's work.
      }
    }
    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const count = expiring.length;

  return (
    <div className="notif" ref={containerRef}>
      <button type="button" className="notif__trigger" onClick={() => setOpen((v) => !v)} aria-label="Notifications">
        <span aria-hidden="true">&#128276;</span>
        {count > 0 && <span className="notif__badge">{count}</span>}
      </button>
      {open && (
        <div className="notif__panel">
          <div className="notif__panel-header">Subscription alerts</div>
          {count === 0 ? (
            <div className="notif__empty">No subscriptions expiring soon.</div>
          ) : (
            <ul className="notif__list">
              {expiring.map((sub) => (
                <li key={sub.restaurantId} className="notif__item">
                  <button
                    type="button"
                    className="notif__item-btn"
                    onClick={() => { setOpen(false); navigate(`/restaurants/${sub.restaurantId}`); }}
                  >
                    <strong>{sub.restaurantName}</strong>
                    <span>Expires {formatDistanceToNow(new Date(sub.expiresAt), { addSuffix: true })}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {/* Future hooks (C.17-adjacent): Device Offline, Login Failure, Sync
              Failure notifications will populate this same panel once the
              backend exposes event streams for them. */}
        </div>
      )}
    </div>
  );
}
