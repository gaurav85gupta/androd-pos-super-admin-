// src/components/StatusBadge.jsx
//
// The page's signature element (see design plan in styles/tokens.css):
// a colored status rail + pill used on every restaurant/device/subscription
// row so status is scannable by color alone across a long list.

const STATUS_CONFIG = {
  active: { label: 'Active', color: 'var(--status-active)', bg: 'var(--status-active-bg)' },
  trial: { label: 'Trial', color: 'var(--status-pending)', bg: 'var(--status-pending-bg)' },
  grace_period: { label: 'Grace Period', color: 'var(--status-grace)', bg: 'var(--status-grace-bg)' },
  suspended: { label: 'Suspended', color: 'var(--status-suspended)', bg: 'var(--status-suspended-bg)' },
  expired: { label: 'Expired', color: 'var(--status-suspended)', bg: 'var(--status-suspended-bg)' },
  cancelled: { label: 'Cancelled', color: 'var(--status-archived)', bg: 'var(--status-archived-bg)' },
  archived: { label: 'Archived', color: 'var(--status-archived)', bg: 'var(--status-archived-bg)' },
  pending: { label: 'Pending', color: 'var(--status-pending)', bg: 'var(--status-pending-bg)' },
  inactive: { label: 'Inactive', color: 'var(--status-archived)', bg: 'var(--status-archived-bg)' },
  removed: { label: 'Removed', color: 'var(--status-suspended)', bg: 'var(--status-suspended-bg)' },
};

export function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, color: 'var(--text-tertiary)', bg: 'var(--surface-3)' };
  return (
    <span className="status-badge" style={{ color: config.color, background: config.bg }}>
      <span className="status-badge__dot" style={{ background: config.color }} />
      {config.label}
    </span>
  );
}

/** The left-edge status rail applied to an entire table row's className, via inline CSS variable. */
export function statusRailStyle(status) {
  const config = STATUS_CONFIG[status];
  return { '--rail-color': config ? config.color : 'transparent' };
}
