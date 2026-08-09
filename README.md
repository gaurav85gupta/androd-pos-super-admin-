# TableFlow Super Admin Platform (Phase C)

A separate React web app (Vite) for restaurant provisioning, subscription
management, device control, and platform operations. Deployed independently
from the Android app; talks to the Phase B/C backend's `/api/v1` REST API.

## Quick start

```bash
npm install
cp .env.example .env.local   # set VITE_API_BASE_URL if not localhost:4000
npm run dev
```

First-time setup: create a Super Admin account on the backend before logging in:
```bash
cd ../tableflow-server
node scripts/seedSuperAdmin.js --name "Jane Admin" --email jane@tableflow.app --password "changeMe123!"
```

## Design direction

A dense **ops cockpit**, not a marketing surface: deep ink-navy surfaces,
a signal-amber accent (deliberately echoing the Android app's "ticket
amber" from Phase A for cross-product cohesion), and a signature **status
rail** — a colored left-edge bar on every restaurant/device row so a Super
Admin can triage a long list by color alone. See `src/styles/tokens.css`
for the full token rationale.

## Structure (C.14 sections)

```
src/
  auth/         AuthContext (login/logout/session restore), RequireAuth guard,
                token storage, idle session-timeout hook
  api/          one file per backend domain -- client.js does envelope
                unwrapping + token refresh; nothing else touches axios directly
  layout/       AppLayout (sidebar + topbar), NotificationCenter
  components/   StateViews (Loading/Empty/Error/Retry), StatusBadge
  hooks/        usePaginatedQuery (pagination + server-side filtering + debounced search)
  pages/
    login/        C.1
    dashboard/     C.2
    restaurants/   C.3, with tabs/ for C.4 Config, C.5 Subscription, C.6 Features, C.7 Users
    users/         C.7 (platform-wide entry point)
    devices/       C.8
    subscriptions/ C.5 (platform-wide entry point)
    features/      C.6 (platform-wide entry point)
    activity/      C.9
    settings/      C.1 password change + C.17 future-hook placeholders
```

## Design decisions

- **Business logic stays on the backend** (C.12): every page calls one
  `src/api/*.api.js` function and renders the result; no page computes
  subscription status, feature entitlement, or tenant scoping itself.
- **CSRF**: not applicable here by design — the app sends the access token
  as an explicit `Authorization` header (never an ambient cookie), so
  cross-site request forgery (which relies on the browser auto-attaching
  credentials) doesn't apply. See the comment in `src/auth/tokenStorage.js`
  for the full reasoning and the tradeoff being made instead (XSS surface).
- **Session Timeout**: 20 minutes of no mouse/keyboard/touch/scroll activity
  triggers an automatic logout (`useSessionTimeout`), independent of the
  JWT's own expiry.
- **Restaurant delete is never physical** (C.3): there is no delete button
  or endpoint anywhere in this app — only Archive, matching the backend's
  `archiveRestaurant` (soft status change).
- **C.9 Activity Logs are read-only** in this UI by design — no edit/delete
  action exists for a log entry anywhere.

## ✅ Verified, not just written

- `npm install` completed cleanly (95 packages, zero vulnerabilities flagged).
- **`npm run build` succeeded on the real Vite production build** — 988
  modules transformed, correctly code-split by route (confirming
  `React.lazy()` wiring for C.15 Lazy Loading actually works), zero errors.
  This is strong, genuine proof every import, JSX file, and component
  reference in the 36-file `src/` tree is syntactically and referentially
  correct — a build failure would have surfaced immediately on any typo,
  missing export, or broken import.
- A static cross-check independently confirmed all 36 files' relative
  imports resolve to real files on disk (redundant with the build success,
  run as a second, different method of verification).

## ⚠️ What I could NOT verify here

I could not run the app against a **live backend** in this sandbox (no
MongoDB available, as noted in the Phase B/C backend's own README), so I
did not click through an actual login → dashboard → create restaurant →
manage subscription flow end-to-end in a browser. The build succeeding and
the API layer matching the backend's confirmed-working routes gives strong
confidence, but please run `npm run dev` against a real backend (with a
seeded Super Admin account) and click through the flows in
`docs/C18_ACCEPTANCE_WALKTHROUGH.md` before treating this as fully proven.
If anything breaks, tell me the exact error and I'll fix it immediately.
