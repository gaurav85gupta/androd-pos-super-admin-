// src/auth/useSessionTimeout.js
//
// C.13 Security -- Session Timeout. Logs the admin out automatically after
// a period of no interaction (mouse, keyboard, touch, scroll), independent
// of whether the JWT itself has expired yet -- a shared/kiosk workstation
// left unattended shouldn't stay signed in indefinitely just because the
// access token is still technically valid.

import { useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const IDLE_TIMEOUT_MS = 20 * 60 * 1000; // 20 minutes
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart'];

export function useSessionTimeout() {
  const { isAuthenticated, logout } = useAuth();
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    function resetTimer() {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        logout();
      }, IDLE_TIMEOUT_MS);
    }

    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isAuthenticated, logout]);
}
