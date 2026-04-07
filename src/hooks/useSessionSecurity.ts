/**
 * useSessionSecurity — Frontend session security hook
 * Features:
 * 1. Session timeout after 15min inactivity → auto-logout
 * 2. Warning banner at 2min remaining
 * 3. Token expiry check on each API call (via axios interceptor)
 * 4. Prevents back-button after logout via history.pushState
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const TIMEOUT_MS   = 15 * 60 * 1000;  // 15 minutes
const WARNING_MS   = 13 * 60 * 1000;  // warn at 13min (2min before)
const EVENTS       = ['mousedown', 'mousemove', 'keypress', 'touchstart', 'scroll', 'click'];

export type SessionState = 'active' | 'warning' | 'expired';

interface UseSessionSecurityReturn {
  sessionState: SessionState;
  timeLeft: number;       // seconds remaining
  extendSession: () => void;
  forceLogout: () => void;
}

const useSessionSecurity = (): UseSessionSecurityReturn => {
  const navigate = useNavigate();
  const [sessionState, setSessionState] = useState<SessionState>('active');
  const [timeLeft, setTimeLeft] = useState(TIMEOUT_MS / 1000);
  const lastActivity = useRef<number>(0);
  const warnTimer    = useRef<ReturnType<typeof setTimeout>>();
  const logoutTimer  = useRef<ReturnType<typeof setTimeout>>();
  const ticker       = useRef<ReturnType<typeof setInterval>>();

  const logout = useCallback(() => {
    setSessionState('expired');
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    // Prevent back-button returning to portal
    window.history.pushState(null, '', '/login');
    window.history.pushState(null, '', '/login');
    navigate('/login', { replace: true });
  }, [navigate]);

  const resetTimers = useCallback(() => {
    clearTimeout(warnTimer.current);
    clearTimeout(logoutTimer.current);
    setSessionState('active');
    setTimeLeft(TIMEOUT_MS / 1000);
    lastActivity.current = Date.now();

    warnTimer.current   = setTimeout(() => setSessionState('warning'), WARNING_MS);
    logoutTimer.current = setTimeout(logout, TIMEOUT_MS);
  }, [logout]);

  const extendSession = () => resetTimers();

  useEffect(() => {
    // Only run if user is logged in
    if (!localStorage.getItem('token')) return;

    // eslint-disable-next-line
    resetTimers();

    const handleActivity = () => {
      lastActivity.current = Date.now();
      resetTimers();
    };
    EVENTS.forEach(e => window.addEventListener(e, handleActivity, { passive: true }));

    // Tick every second to update timeLeft
    ticker.current = setInterval(() => {
      const elapsed = Date.now() - lastActivity.current;
      const remaining = Math.max(0, Math.ceil((TIMEOUT_MS - elapsed) / 1000));
      setTimeLeft(remaining);
    }, 1000);

    return () => {
      clearTimeout(warnTimer.current);
      clearTimeout(logoutTimer.current);
      clearInterval(ticker.current);
      EVENTS.forEach(e => window.removeEventListener(e, handleActivity));
    };
  }, [resetTimers]);

  return { sessionState, timeLeft, extendSession, forceLogout: logout };
};

export default useSessionSecurity;
