import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useLocation } from 'react-router-dom';

const ZeroTrustContext = createContext(null);

// Session validation interval (every 2 minutes)
const SESSION_CHECK_INTERVAL = 120000;

// Track suspicious activity patterns
const SUSPICIOUS_THRESHOLDS = {
  rapidPageChanges: 10, // 10 page changes in 30 seconds
  failedAuthAttempts: 3,
  rapidAPIcalls: 20
};

export function ZeroTrustProvider({ children }) {
  const [securityState, setSecurityState] = useState({
    sessionValid: false,
    lastVerified: Date.now(),
    trustScore: 100,
    anomalies: [],
    isMonitoring: true
  });

  const [activityLog, setActivityLog] = useState({
    pageChanges: [],
    apiCalls: [],
    authAttempts: []
  });

  const location = useLocation();

  // Continuous session validation
  const validateSession = useCallback(async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      
      if (!isAuth && securityState.sessionValid) {
        // Session expired - trigger security event
        logSecurityEvent('SESSION_EXPIRED', { timestamp: Date.now() });
        setSecurityState(prev => ({
          ...prev,
          sessionValid: false,
          trustScore: 0,
          anomalies: [...prev.anomalies, { type: 'session_expired', timestamp: Date.now() }]
        }));
      } else if (isAuth) {
        // Verify user integrity
        const user = await base44.auth.me();
        setSecurityState(prev => ({
          ...prev,
          sessionValid: true,
          lastVerified: Date.now(),
          currentUser: user
        }));
      }
    } catch (error) {
      logSecurityEvent('SESSION_VALIDATION_ERROR', { error: error.message });
    }
  }, [securityState.sessionValid]);

  // Monitor for suspicious activity patterns
  const detectAnomalies = useCallback(() => {
    const now = Date.now();
    const thirtySecondsAgo = now - 30000;

    // Check for rapid page changes
    const recentPageChanges = activityLog.pageChanges.filter(
      timestamp => timestamp > thirtySecondsAgo
    );

    if (recentPageChanges.length > SUSPICIOUS_THRESHOLDS.rapidPageChanges) {
      logSecurityEvent('SUSPICIOUS_ACTIVITY', {
        type: 'rapid_navigation',
        count: recentPageChanges.length
      });
      
      setSecurityState(prev => ({
        ...prev,
        trustScore: Math.max(0, prev.trustScore - 20),
        anomalies: [...prev.anomalies, {
          type: 'rapid_navigation',
          timestamp: now,
          severity: 'medium'
        }]
      }));
    }

    // Check API call rate
    const recentAPICalls = activityLog.apiCalls.filter(
      timestamp => timestamp > thirtySecondsAgo
    );

    if (recentAPICalls.length > SUSPICIOUS_THRESHOLDS.rapidAPIcalls) {
      logSecurityEvent('SUSPICIOUS_ACTIVITY', {
        type: 'rapid_api_calls',
        count: recentAPICalls.length
      });
      
      setSecurityState(prev => ({
        ...prev,
        trustScore: Math.max(0, prev.trustScore - 30),
        anomalies: [...prev.anomalies, {
          type: 'rapid_api_calls',
          timestamp: now,
          severity: 'high'
        }]
      }));
    }
  }, [activityLog]);

  // Log security events server-side
  const logSecurityEvent = useCallback(async (eventType, data) => {
    const event = {
      type: eventType,
      timestamp: Date.now(),
      data,
      path: location.pathname
    };

    // Send critical security events to server for persistent audit logging
    if (['SECURITY_ALERT', 'SESSION_EXPIRED', 'SUSPICIOUS_ACTIVITY'].includes(eventType)) {
      try {
        await base44.functions.invoke('logSecurityEvent', {
          eventType,
          data,
          path: location.pathname,
          timestamp: Date.now()
        });
      } catch {
        // Silently fail - don't disrupt user experience for logging
      }
    }
  }, [location.pathname]);

  // Track page navigation
  useEffect(() => {
    setActivityLog(prev => ({
      ...prev,
      pageChanges: [...prev.pageChanges, Date.now()].slice(-20)
    }));

    logSecurityEvent('PAGE_VIEW', { path: location.pathname });
  }, [location.pathname, logSecurityEvent]);

  // Continuous session monitoring
  useEffect(() => {
    validateSession();
    const interval = setInterval(validateSession, SESSION_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [validateSession]);

  // Anomaly detection
  useEffect(() => {
    const interval = setInterval(detectAnomalies, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [detectAnomalies]);

  // Track API calls
  const trackAPICall = useCallback((endpoint) => {
    setActivityLog(prev => ({
      ...prev,
      apiCalls: [...prev.apiCalls, Date.now()].slice(-30)
    }));
    logSecurityEvent('API_CALL', { endpoint });
  }, [logSecurityEvent]);

  // Track authentication attempts
  const trackAuthAttempt = useCallback((success) => {
    setActivityLog(prev => ({
      ...prev,
      authAttempts: [...prev.authAttempts, { timestamp: Date.now(), success }].slice(-10)
    }));

    if (!success) {
      const recentFailures = activityLog.authAttempts.filter(
        attempt => !attempt.success && attempt.timestamp > Date.now() - 300000
      );

      if (recentFailures.length >= SUSPICIOUS_THRESHOLDS.failedAuthAttempts) {
        logSecurityEvent('SECURITY_ALERT', {
          type: 'multiple_failed_auth',
          count: recentFailures.length
        });
        
        setSecurityState(prev => ({
          ...prev,
          trustScore: Math.max(0, prev.trustScore - 40),
          anomalies: [...prev.anomalies, {
            type: 'failed_auth_attempts',
            timestamp: Date.now(),
            severity: 'critical'
          }]
        }));
      }
    }
  }, [activityLog.authAttempts, logSecurityEvent]);

  const value = {
    ...securityState,
    validateSession,
    trackAPICall,
    trackAuthAttempt,
    logSecurityEvent,
    activityLog
  };

  return (
    <ZeroTrustContext.Provider value={value}>
      {children}
    </ZeroTrustContext.Provider>
  );
}

export function useZeroTrust() {
  const context = useContext(ZeroTrustContext);
  if (!context) {
    throw new Error('useZeroTrust must be used within ZeroTrustProvider');
  }
  return context;
}