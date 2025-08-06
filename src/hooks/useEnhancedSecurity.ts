/**
 * Enhanced security hook that combines all security improvements
 */

import { useEffect, useCallback } from 'react';
import { enhancedSecureStorage } from '@/lib/enhanced-secure-storage';
import { errorSanitizer, handleSanitizedError } from '@/lib/error-sanitizer';
import { applyClientSecurityHeaders } from '@/lib/security-headers';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';

export const useEnhancedSecurity = () => {
  const { user } = useAuth();

  // Initialize client-side security
  useEffect(() => {
    try {
      applyClientSecurityHeaders();
    } catch (error) {
      console.error('Failed to apply security headers');
    }
  }, []);

  // Cleanup sensitive data on user logout
  useEffect(() => {
    if (!user) {
      enhancedSecureStorage.clearAll();
    }
  }, [user]);

  // Enhanced storage methods
  const setSecureItem = useCallback(async (
    key: string,
    value: any,
    serverSide: boolean = true
  ): Promise<boolean> => {
    try {
      return await enhancedSecureStorage.setItem(key, value, { 
        serverSide,
        autoCleanup: true,
        ttl: serverSide ? 480 : 60 // 8 hours server, 1 hour client
      });
    } catch (error) {
      handleSanitizedError(error, 'secure_storage_set', (msg) => toast.error(msg));
      return false;
    }
  }, []);

  const getSecureItem = useCallback(async (
    key: string,
    serverSide: boolean = true
  ): Promise<any | null> => {
    try {
      return await enhancedSecureStorage.getItem(key, serverSide);
    } catch (error) {
      handleSanitizedError(error, 'secure_storage_get');
      return null;
    }
  }, []);

  const removeSecureItem = useCallback(async (key: string): Promise<void> => {
    try {
      await enhancedSecureStorage.removeItem(key);
    } catch (error) {
      handleSanitizedError(error, 'secure_storage_remove');
    }
  }, []);

  // Enhanced error handling
  const handleError = useCallback((error: any, context?: string) => {
    return handleSanitizedError(error, context, (msg) => toast.error(msg));
  }, []);

  // Security validation
  const validateInput = useCallback((input: string, type: 'email' | 'text' | 'phone' = 'text') => {
    try {
      // Basic client-side validation before server validation
      if (!input || input.trim().length === 0) {
        return { valid: false, error: 'Input is required' };
      }

      if (input.length > 1000) {
        return { valid: false, error: 'Input too long' };
      }

      // XSS prevention
      const xssPatterns = [
        /<script[^>]*>.*?<\/script>/gi,
        /javascript:/gi,
        /vbscript:/gi,
        /on\w+\s*=/gi
      ];

      if (xssPatterns.some(pattern => pattern.test(input))) {
        return { valid: false, error: 'Invalid characters detected' };
      }

      // Type-specific validation
      switch (type) {
        case 'email':
          const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
          if (!emailRegex.test(input)) {
            return { valid: false, error: 'Invalid email format' };
          }
          break;
        case 'phone':
          const phoneRegex = /^[\d\s\-\(\)\+]+$/;
          if (!phoneRegex.test(input)) {
            return { valid: false, error: 'Invalid phone format' };
          }
          break;
      }

      return { valid: true, sanitized: input.trim() };
    } catch (error) {
      return { valid: false, error: 'Validation failed' };
    }
  }, []);

  // Monitor suspicious activity
  const logSecurityEvent = useCallback(async (
    eventType: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    details?: any
  ) => {
    try {
      if (!user) return;

      // Only log in production or for high/critical events
      if (!import.meta.env.PROD && severity !== 'high' && severity !== 'critical') {
        return;
      }

      // Log to local storage for batching (privacy-preserving)
      const events = JSON.parse(localStorage.getItem('_security_events') || '[]');
      events.push({
        type: eventType,
        severity,
        timestamp: Date.now(),
        details: severity === 'high' || severity === 'critical' ? details : undefined
      });

      // Keep only last 50 events
      if (events.length > 50) {
        events.splice(0, events.length - 50);
      }

      localStorage.setItem('_security_events', JSON.stringify(events));

      // For critical events, immediately notify
      if (severity === 'critical') {
        toast.error('Security alert detected. Please review your account.');
      }
    } catch (error) {
      console.error('Failed to log security event');
    }
  }, [user]);

  return {
    setSecureItem,
    getSecureItem,
    removeSecureItem,
    handleError,
    validateInput,
    logSecurityEvent,
    errorSanitizer
  };
};
