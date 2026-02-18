import { useEffect, useRef } from 'react';

const TURNSTILE_SITE_KEY = '0x4AAAAAACfCmTzJWe5rVK9c';
const TURNSTILE_SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

/**
 * Reusable Cloudflare Turnstile widget for bot protection.
 *
 * Props:
 *   onSuccess(token)  — called when challenge passes, returns the verification token
 *   onError(code)     — called on widget error
 *   onExpired()       — called when token expires (5 min lifetime)
 *   action            — custom action tag for analytics (e.g., "checkout", "login")
 *   theme             — "light" | "dark" | "auto" (default: "light")
 *   className         — optional wrapper className
 */
export default function TurnstileWidget({ onSuccess, onError, onExpired, action = '', theme = 'light', className = '' }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const callbacksRef = useRef({ onSuccess, onError, onExpired });

  // Keep callbacks up to date without triggering re-renders
  useEffect(() => {
    callbacksRef.current = { onSuccess, onError, onExpired };
  }, [onSuccess, onError, onExpired]);

  useEffect(() => {
    let cancelled = false;

    function doRender() {
      if (cancelled || !containerRef.current || !window.turnstile) return;

      // Clean up previous widget if exists
      if (widgetIdRef.current !== null) {
        try { window.turnstile.remove(widgetIdRef.current); } catch (e) { /* ignore */ }
        widgetIdRef.current = null;
      }

      containerRef.current.innerHTML = '';

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme,
        action,
        retry: 'auto',
        'retry-interval': 5000,
        callback: (token) => {
          console.log('[Turnstile] Success — token received');
          callbacksRef.current.onSuccess?.(token);
        },
        'error-callback': (errorCode) => {
          console.error('[Turnstile] Error code:', errorCode);
          callbacksRef.current.onError?.(errorCode);
          // Return true to suppress Turnstile's own console warnings
          return true;
        },
        'expired-callback': () => {
          console.warn('[Turnstile] Token expired');
          callbacksRef.current.onExpired?.();
        },
      });
    }

    function loadAndRender() {
      // Script already loaded
      if (window.turnstile) {
        doRender();
        return;
      }

      // Script tag already exists — wait for it
      const existingScript = document.querySelector(`script[src*="challenges.cloudflare.com/turnstile"]`);
      if (existingScript) {
        const checkReady = setInterval(() => {
          if (window.turnstile) {
            clearInterval(checkReady);
            doRender();
          }
        }, 100);
        return;
      }

      // Load script fresh
      const script = document.createElement('script');
      script.src = TURNSTILE_SCRIPT_URL;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // Wait a tick for window.turnstile to initialize
        setTimeout(() => doRender(), 100);
      };
      script.onerror = () => {
        console.error('[Turnstile] Failed to load script');
        callbacksRef.current.onError?.('script-load-failed');
      };
      document.head.appendChild(script);
    }

    loadAndRender();

    return () => {
      cancelled = true;
      if (widgetIdRef.current !== null && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current); } catch (e) { /* ignore */ }
        widgetIdRef.current = null;
      }
    };
  }, [action, theme]); // Only re-render widget if action or theme changes

  return (
    <div ref={containerRef} className={className} />
  );
}
