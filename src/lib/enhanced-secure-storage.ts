/**
 * Enhanced secure storage that prioritizes server-side sessions over localStorage
 * for sensitive data with automatic cleanup
 */

import { supabase } from '@/integrations/supabase/client';

export interface SecureStorageOptions {
  serverSide?: boolean;
  autoCleanup?: boolean;
  ttl?: number; // Time to live in minutes
}

class EnhancedSecureStorage {
  private sessionKey: string | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeCleanup();
  }

  private initializeCleanup() {
    // Auto-cleanup localStorage every 30 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredLocalStorage();
    }, 30 * 60 * 1000);

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      this.cleanupSensitiveData();
    });

    // Cleanup on visibility change (tab switch/minimize)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.cleanupSensitiveData();
      }
    });
  }

  private getEncryptionKey(): string {
    if (!this.sessionKey) {
      this.sessionKey = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    }
    return this.sessionKey;
  }

  private async encrypt(text: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const key = this.getEncryptionKey();
    const keyBytes = encoder.encode(key);
    const encrypted = new Uint8Array(data.length);
    
    for (let i = 0; i < data.length; i++) {
      encrypted[i] = data[i] ^ keyBytes[i % keyBytes.length];
    }
    
    return btoa(String.fromCharCode(...encrypted));
  }

  private async decrypt(encryptedText: string): Promise<string> {
    try {
      const encrypted = new Uint8Array(
        atob(encryptedText).split('').map(char => char.charCodeAt(0))
      );
      const key = this.getEncryptionKey();
      const keyBytes = new TextEncoder().encode(key);
      const decrypted = new Uint8Array(encrypted.length);
      
      for (let i = 0; i < encrypted.length; i++) {
        decrypted[i] = encrypted[i] ^ keyBytes[i % keyBytes.length];
      }
      
      return new TextDecoder().decode(decrypted);
    } catch (error) {
      console.error('Decryption failed');
      return '';
    }
  }

  /**
   * Store data with enhanced security options
   */
  async setItem(key: string, value: any, options: SecureStorageOptions = {}): Promise<boolean> {
    const { serverSide = true, ttl = 480 } = options; // Default 8 hours

    try {
      if (serverSide) {
        // Use server-side storage for sensitive data
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { error } = await supabase.rpc('store_secure_session_data', {
          p_key: key,
          p_value: JSON.stringify(value)
        });

        if (error) {
          console.error('Server-side storage failed');
          return false;
        }
        return true;
      } else {
        // Use encrypted localStorage with TTL
        const encrypted = await this.encrypt(JSON.stringify(value));
        const expiresAt = Date.now() + (ttl * 60 * 1000);
        const storageData = { data: encrypted, expiresAt };
        
        localStorage.setItem(`_enhanced_${key}`, JSON.stringify(storageData));
        return true;
      }
    } catch (error) {
      console.error('Enhanced secure storage failed');
      return false;
    }
  }

  /**
   * Retrieve data with automatic expiry check
   */
  async getItem(key: string, serverSide: boolean = true): Promise<any | null> {
    try {
      if (serverSide) {
        // Retrieve from server-side storage
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const result = await supabase.rpc('get_secure_session_data', {
          p_key: key
        });

        return result.data ? JSON.parse(result.data) : null;
      } else {
        // Retrieve from localStorage with expiry check
        const stored = localStorage.getItem(`_enhanced_${key}`);
        if (!stored) return null;

        const { data, expiresAt } = JSON.parse(stored);
        
        if (Date.now() > expiresAt) {
          localStorage.removeItem(`_enhanced_${key}`);
          return null;
        }

        const decrypted = await this.decrypt(data);
        return JSON.parse(decrypted);
      }
    } catch (error) {
      console.error('Enhanced secure retrieval failed');
      return null;
    }
  }

  /**
   * Remove data from both server and client
   */
  async removeItem(key: string): Promise<void> {
    try {
      // Remove from server
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.rpc('remove_secure_session_data', { p_key: key });
      }

      // Remove from localStorage
      localStorage.removeItem(`_enhanced_${key}`);
    } catch (error) {
      console.error('Enhanced secure removal failed');
    }
  }

  /**
   * Clean up expired localStorage items
   */
  private cleanupExpiredLocalStorage(): void {
    const keys = Object.keys(localStorage);
    const now = Date.now();

    keys.forEach(key => {
      if (key.startsWith('_enhanced_')) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const { expiresAt } = JSON.parse(stored);
            if (now > expiresAt) {
              localStorage.removeItem(key);
            }
          }
        } catch (error) {
          // Remove corrupted entries
          localStorage.removeItem(key);
        }
      }
    });
  }

  /**
   * Clean up all sensitive data immediately
   */
  private cleanupSensitiveData(): void {
    const sensitiveKeys = [
      '_sec_', '_enhanced_', '_fortress_', '_master_', '_audit_',
      '_security_', '_sms_code_', '_email_verification_'
    ];

    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (sensitiveKeys.some(prefix => key.startsWith(prefix))) {
        localStorage.removeItem(key);
      }
    });

    // Clear session key
    this.sessionKey = null;
  }

  /**
   * Clear all data
   */
  async clearAll(): Promise<void> {
    try {
      // Clear server-side data
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.rpc('clear_secure_session_data');
      }

      // Clear client-side data
      this.cleanupSensitiveData();
    } catch (error) {
      console.error('Enhanced secure clear failed');
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cleanupSensitiveData();
  }
}

export const enhancedSecureStorage = new EnhancedSecureStorage();

// Auto-cleanup on page unload
window.addEventListener('beforeunload', () => {
  enhancedSecureStorage.destroy();
});