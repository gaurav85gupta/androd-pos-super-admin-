// src/auth/tokenStorage.js
//
// C.13 Security -- Secure Token Handling.
//
// Tokens are kept in localStorage (not cookies), which means CSRF protection
// is a non-issue here: this app sends the access token as an explicit
// `Authorization: Bearer` header (never as an ambient cookie), so a
// cross-site request forged by another origin cannot include it -- the
// browser only auto-attaches cookies, not localStorage-derived headers.
// CSRF tokens are a mitigation for cookie-based auth specifically; C.13's
// "agar session/cookies use ho" condition doesn't apply to this design.
//
// The real tradeoff being made instead is XSS exposure: any script that
// runs on this origin can read localStorage. That's mitigated by the app's
// separate defenses (React's default JSX escaping avoids injecting raw
// HTML from API responses; no `dangerouslySetInnerHTML` is used anywhere in
// this codebase) rather than by moving the token elsewhere.

const ACCESS_TOKEN_KEY = 'tf_admin_access_token';
const REFRESH_TOKEN_KEY = 'tf_admin_refresh_token';

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens({ accessToken, refreshToken }) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function hasSession() {
  return Boolean(getAccessToken() && getRefreshToken());
}
