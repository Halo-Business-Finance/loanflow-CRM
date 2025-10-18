import { supabase } from "@/integrations/supabase/client";

export interface SecurityConfig {
  enableMFA: boolean;
  enforcePasswordPolicy: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  enableGeoRestrictions: boolean;
}

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

export interface RateLimitResult {
  allowed: boolean;
  attempts_remaining: number;
  reset_time: string;
}

export interface SecurityEventData {
  user_id?: string;
  event_type: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  device_fingerprint?: string;
  location?: Record<string, any>;
}

export class SecurityManager {
  // Password validation
  static async validatePassword(password: string): Promise<PasswordValidationResult> {
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-auth', {
        body: {
          action: 'validate_password',
          password
        }
      });

      if (error) throw error;
      return data.validation_result;
    } catch (error: any) {
      console.error('Password validation error:', error);
      return {
        valid: false,
        errors: ['Password validation failed. Please try again.']
      };
    }
  }

  // Rate limiting
  static async checkRateLimit(identifier: string, action: string = 'login'): Promise<RateLimitResult> {
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-auth', {
        body: {
          action: 'check_rate_limit',
          identifier,
          action_type: action
        }
      });

      if (error) throw error;
      return data.rate_limit_result;
    } catch (error: any) {
      console.error('Rate limit check error:', error);
      return {
        allowed: false,
        attempts_remaining: 0,
        reset_time: new Date(Date.now() + 60 * 60 * 1000).toISOString()
      };
    }
  }

  // Security event logging
  static async logSecurityEvent(eventData: SecurityEventData): Promise<string | null> {
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-auth', {
        body: {
          action: 'log_security_event',
          ...eventData
        }
      });

      if (error) throw error;
      return data.event_id;
    } catch (error: any) {
      console.error('Security event logging error:', error);
      return null;
    }
  }

  // Session validation
  static async validateSession(): Promise<{
    valid: boolean;
    user?: any;
    security?: {
      risk_score: number;
      is_suspicious: boolean;
      requires_mfa: boolean;
    };
  }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        return { valid: false };
      }

      const { data, error } = await supabase.functions.invoke('enhanced-auth', {
        body: {
          action: 'validate_session'
        }
      });

      if (error) throw error;
      return {
        valid: true,
        user: data.user,
        security: data.security
      };
    } catch (error: any) {
      console.error('Session validation error:', error);
      return { valid: false };
    }
  }

  // Device fingerprinting
  static generateDeviceFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }
    
    const fingerprint = {
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      canvas: canvas.toDataURL(),
      userAgent: navigator.userAgent.substring(0, 100) // Truncate for storage
    };

    return btoa(JSON.stringify(fingerprint)).substring(0, 64);
  }

  // Geo-location detection
  static async getLocationData(): Promise<Record<string, any>> {
    return new Promise((resolve) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            });
          },
          () => {
            // Fallback to IP-based location
            resolve({ source: 'ip' });
          },
          { timeout: 5000 }
        );
      } else {
        resolve({ source: 'unavailable' });
      }
    });
  }

  // Secure password generation
  static generateSecurePassword(length: number = 16): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = uppercase + lowercase + numbers + symbols;
    let password = '';
    
    // Ensure at least one character from each category
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest with random characters
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  // Advanced input sanitization with comprehensive security measures
  static sanitizeInput(input: string, options: {
    allowHtml?: boolean;
    maxLength?: number;
    allowedChars?: RegExp;
    stripDangerous?: boolean;
  } = {}): string {
    if (!input || typeof input !== 'string') return '';

    const { 
      allowHtml = false, 
      maxLength = 1000, 
      allowedChars = null,
      stripDangerous = true 
    } = options;

    let sanitized = input;

    // Length validation
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    // Strip dangerous patterns if enabled
    if (stripDangerous) {
      // SQL injection patterns
      sanitized = sanitized.replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi, '');
      
      // Command injection patterns
      sanitized = sanitized.replace(/[;&|`$(){}[\]\\]/g, '');
      
      // Path traversal patterns
      sanitized = sanitized.replace(/\.\.[\/\\]/g, '');
      
      // Null bytes and control characters
      sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
    }

    // HTML/XSS sanitization
    if (!allowHtml) {
      sanitized = sanitized
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .replace(/javascript:/gi, '')
        .replace(/vbscript:/gi, '')
        .replace(/data:/gi, '')
        .replace(/on\w+=/gi, '');
    }

    // Character whitelist if provided
    if (allowedChars) {
      sanitized = sanitized.replace(new RegExp(`[^${allowedChars.source}]`, 'g'), '');
    }

    return sanitized.trim();
  }

  // Specialized sanitization methods
  static sanitizeEmail(email: string): string {
    if (!email) return '';
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const sanitized = SecurityManager.sanitizeInput(email.toLowerCase().trim(), {
      allowedChars: /[a-zA-Z0-9._%+-@]/,
      maxLength: 254
    });
    return emailRegex.test(sanitized) ? sanitized : '';
  }

  static sanitizePhone(phone: string): string {
    if (!phone) return '';
    return SecurityManager.sanitizeInput(phone, {
      allowedChars: /[0-9+\s()-]/,
      maxLength: 20,
      stripDangerous: false
    }).replace(/[^\d+]/g, '');
  }

  // CSRF token management
  static generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Security headers validation
  static validateSecurityHeaders(response: Response): boolean {
    const requiredHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection'
    ];

    return requiredHeaders.every(header => 
      response.headers.has(header)
    );
  }

  // Enhanced encryption utilities with key derivation
  static async encryptSensitiveData(data: string, key?: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      
      // Use PBKDF2 for proper key derivation
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(key || await this.generateMasterKey()),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );

      const derivedKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );

      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        derivedKey,
        dataBuffer
      );

      // Combine salt, IV and encrypted data
      const combined = new Uint8Array(salt.length + iv.length + encryptedData.byteLength);
      combined.set(salt);
      combined.set(iv, salt.length);
      combined.set(new Uint8Array(encryptedData), salt.length + iv.length);

      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Enhanced encryption error:', error);
      throw new Error('Encryption failed');
    }
  }

  // Decrypt with enhanced security
  static async decryptSensitiveData(encryptedData: string, key?: string): Promise<string> {
    try {
      const combined = new Uint8Array(
        atob(encryptedData).split('').map(char => char.charCodeAt(0))
      );
      
      const salt = combined.slice(0, 16);
      const iv = combined.slice(16, 28);
      const encrypted = combined.slice(28);
      
      const encoder = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(key || await this.generateMasterKey()),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );

      const derivedKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );
      
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        derivedKey,
        encrypted
      );
      
      return new TextDecoder().decode(decrypted);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Decryption failed');
    }
  }

  // Generate or retrieve master encryption key without persisting to localStorage
  private static async generateMasterKey(): Promise<string> {
    // In-memory ephemeral cache for this runtime
    // @ts-ignore
    if ((SecurityManager as any)._ephemeralMasterKey) {
      // @ts-ignore
      return (SecurityManager as any)._ephemeralMasterKey as string;
    }

    const sessionKey = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('_master_security_key_session') : null;
    if (sessionKey) {
      // @ts-ignore
      (SecurityManager as any)._ephemeralMasterKey = sessionKey;
      return sessionKey;
    }

    const key = Array.from(crypto.getRandomValues(new Uint8Array(64)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('_master_security_key_session', key);
    }
    // @ts-ignore
    (SecurityManager as any)._ephemeralMasterKey = key;
    return key;
  }

  // Audit logging for frontend actions
  static async logUserAction(action: string, details?: Record<string, any>): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await this.logSecurityEvent({
        user_id: user.id,
        event_type: 'user_action',
        severity: 'low',
        details: {
          action,
          timestamp: new Date().toISOString(),
          ...details
        },
        device_fingerprint: this.generateDeviceFingerprint()
      });
    } catch (error) {
      console.error('User action logging error:', error);
    }
  }

  // Security checklist validation
  static async performSecurityCheck(): Promise<{
    score: number;
    checks: Array<{ name: string; passed: boolean; message: string }>;
  }> {
    const checks = [];
    let score = 0;

    // Check if HTTPS is being used
    const httpsCheck = location.protocol === 'https:';
    checks.push({
      name: 'HTTPS',
      passed: httpsCheck,
      message: httpsCheck ? 'Connection is secure' : 'Connection is not secure'
    });
    if (httpsCheck) score += 20;

    // Check if session exists
    const { data: { session } } = await supabase.auth.getSession();
    const sessionCheck = !!session;
    checks.push({
      name: 'Authentication',
      passed: sessionCheck,
      message: sessionCheck ? 'User is authenticated' : 'User is not authenticated'
    });
    if (sessionCheck) score += 20;

    // Check MFA status
    if (session) {
      const { data: mfaSettings } = await supabase
        .from('mfa_settings')
        .select('is_enabled')
        .single();
      
      const mfaEnabled = mfaSettings?.is_enabled || false;
      checks.push({
        name: 'Multi-Factor Authentication',
        passed: mfaEnabled,
        message: mfaEnabled ? 'MFA is enabled' : 'MFA is not enabled'
      });
      if (mfaEnabled) score += 30;
    }

    // Check password policy compliance
    try {
      const { data: policy } = await supabase
        .from('password_policies')
        .select('*')
        .eq('is_active', true)
        .single();
      
      const policyExists = !!policy;
      checks.push({
        name: 'Password Policy',
        passed: policyExists,
        message: policyExists ? 'Password policy is enforced' : 'No password policy found'
      });
      if (policyExists) score += 15;
    } catch (error) {
      checks.push({
        name: 'Password Policy',
        passed: false,
        message: 'Unable to verify password policy'
      });
    }

    // Check for recent security events
    try {
      const { data: recentEvents } = await supabase
        .from('security_events')
        .select('severity')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .eq('severity', 'high');
      
      const noRecentThreats = !recentEvents || recentEvents.length === 0;
      checks.push({
        name: 'Recent Security Threats',
        passed: noRecentThreats,
        message: noRecentThreats ? 'No recent high-severity threats' : `${recentEvents?.length} recent high-severity threats detected`
      });
      if (noRecentThreats) score += 15;
    } catch (error) {
      checks.push({
        name: 'Recent Security Threats',
        passed: false,
        message: 'Unable to check for recent threats'
      });
    }

    return { score, checks };
  }

  // Generate secure token (alias for generateCSRFToken)
  static generateSecureToken(length: number = 32): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(length)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Secure constant-time string comparison
  static secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    
    return result === 0;
  }
}