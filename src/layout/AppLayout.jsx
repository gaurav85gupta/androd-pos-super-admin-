// src/layout/AppLayout.jsx
//
// C.14 UI Foundation. Fixed sidebar with the 8 sections from the brief +
// a persistent top bar hosting the Notification Center (C.11). This shell
// wraps every authenticated route; individual pages only render their
// content area.

import { NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useSessionTimeout } from '../auth/useSessionTimeout';
import { NotificationCenter } from './NotificationCenter';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: '\u2302' },
  { to: '/restaurants', label: 'Restaurants', icon: '\u2637' },
  { to: '/users', label: 'Users', icon: '\u25A4' },
  { to: '/devices', label: 'Devices', icon: '\u25A2' },
  { to: '/subscriptions', label: 'Subscriptions', icon: '\u25C8' },
  { to: '/features', label: 'Features', icon: '\u2699' },
  { to: '/activity', label: 'Activity Logs', icon: '\u2261' },
  { to: '/settings', label: 'Settings', icon: '\u2699\uFE0E' },
];

export function AppLayout() {
  useSessionTimeout();
  const { admin, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNavOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__brand">
          <span className="sidebar__brand-mark">TF</span>
          <span className="sidebar__brand-name">TableFlow Admin</span>
        </div>
        <nav className="sidebar__nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
              onClick={() => setMobileNavOpen(false)}
            >
              <span className="sidebar__icon" aria-hidden="true">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar__footer">
          <div className="sidebar__admin">
            <div className="sidebar__admin-avatar">{admin?.role === 'super_admin' ? 'SA' : '?'}</div>
            <div>
              <div className="sidebar__admin-name">Super Admin</div>
            </div>
          </div>
          <button type="button" className="btn btn--ghost btn--sm" onClick={logout}>
            Log out
          </button>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <button
            type="button"
            className="topbar__menu-toggle"
            onClick={() => setMobileNavOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            {'\u2261'}
          </button>
          <div className="topbar__spacer" />
          <NotificationCenter />
        </header>
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
