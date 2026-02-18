import { useEffect, useRef, useCallback } from 'react';

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
  const scriptLoadedRef = useRef(false);

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile) return;

    // Clean up previous widget if exists
    if (widgetIdRef.current !== null) {
      try { window.turnstile.remove(widgetIdRef.current); } catch (e) { /* ignore */ }
      widgetIdRef.current = null;
    }

    // Clear the container
    containerRef.current.innerHTML = '';

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      theme,
      action,
      callback: (token) => {
        if (onSuccess) onSuccess(token);
      },
      'error-callback': (errorCode) => {
        if (onError) onError(errorCode);
      },
      'expired-callback': () => {
        if (onExpired) onExpired();
      },
    });
  }, [action, theme, onSuccess, onError, onExpired]);

  useEffect(() => {
    // Check if script is already loaded
    if (window.turnstile) {
      scriptLoadedRef.current = true;
      renderWidget();
      return;
    }

    // Check if script tag already exists (loading in progress)
    const existingScript = document.querySelector(`script[src="${TURNSTILE_SCRIPT_URL}"]`);
    if (existingScript) {
      // Wait for it to load
      const checkReady = setInterval(() => {
        if (window.turnstile) {
          clearInterval(checkReady);
          scriptLoadedRef.current = true;
          renderWidget();
        }
      }, 100);
      return () => clearInterval(checkReady);
    }

    // Load script dynamically
    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      scriptLoadedRef.current = true;
      // Small delay to ensure turnstile object is available
      setTimeout(() => renderWidget(), 50);
    };
    script.onerror = () => {
      console.error('[Turnstile] Failed to load Turnstile script');
      if (onError) onError('script-load-failed');
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup widget on unmount
      if (widgetIdRef.current !== null && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current); } catch (e) { /* ignore */ }
        widgetIdRef.current = null;
      }
    };
  }, [renderWidget, onError]);

  return (
    <div ref={containerRef} className={className} />
  );
}
