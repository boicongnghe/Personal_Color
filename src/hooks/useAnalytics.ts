import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';

function getSessionId(): string {
  let id = sessionStorage.getItem('clarity_session_id');
  if (!id) {
    id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem('clarity_session_id', id);
    sessionStorage.setItem('clarity_session_start', String(Date.now()));
  }
  return id;
}

async function sendEvent(payload: {
  event: string;
  page: string;
  value?: number;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const sessionId = getSessionId();
    const token = localStorage.getItem('clarity_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    await fetch(`${API_BASE}/api/analytics/event`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...payload, sessionId }),
      keepalive: true,
    });
  } catch {
    // fail silently — never break the app
  }
}

export function useAnalytics(): void {
  const location = useLocation();
  const scrollSentRef = useRef<Set<number>>(new Set());
  const pageRef = useRef<string>('');

  // Track page_view on every route change and reset scroll thresholds
  useEffect(() => {
    const page = location.pathname;
    pageRef.current = page;
    scrollSentRef.current = new Set();
    sendEvent({ event: 'page_view', page });
  }, [location.pathname]);

  // Track scroll depth — fire once per 25% threshold per page visit
  useEffect(() => {
    const handleScroll = () => {
      const el = document.documentElement;
      const scrollable = el.scrollHeight - el.clientHeight;
      if (scrollable <= 0) return;
      const pct = Math.round((el.scrollTop / scrollable) * 100);
      for (const threshold of [25, 50, 75, 100]) {
        if (pct >= threshold && !scrollSentRef.current.has(threshold)) {
          scrollSentRef.current.add(threshold);
          sendEvent({ event: 'scroll_depth', page: pageRef.current, value: threshold });
        }
      }
    };
    document.addEventListener('scroll', handleScroll, { passive: true });
    return () => document.removeEventListener('scroll', handleScroll);
  }, []);

  // Track clicks on buttons, links, and role="button" elements via delegation
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const el = target.closest('button, a, [role="button"]') as HTMLElement | null;
      if (!el) return;
      const label =
        el.getAttribute('data-track') ||
        el.getAttribute('aria-label') ||
        el.textContent?.trim().slice(0, 50) ||
        el.tagName.toLowerCase();
      if (!label) return;
      sendEvent({ event: 'click', page: pageRef.current, metadata: { element: label } });
    };
    document.addEventListener('click', handleClick, { capture: true });
    return () => document.removeEventListener('click', handleClick, { capture: true });
  }, []);

  // Track session_end when user leaves or hides the tab
  useEffect(() => {
    const sendSessionEnd = () => {
      const start = parseInt(sessionStorage.getItem('clarity_session_start') || '0', 10);
      const duration = start > 0 ? Date.now() - start : 0;
      sendEvent({ event: 'session_end', page: pageRef.current, value: duration });
    };
    const handleVisibilityChange = () => {
      if (document.hidden) sendSessionEnd();
    };
    window.addEventListener('beforeunload', sendSessionEnd);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('beforeunload', sendSessionEnd);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
}
