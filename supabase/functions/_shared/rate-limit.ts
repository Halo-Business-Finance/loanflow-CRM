// Rate limiting utilities for Edge Functions
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface RateLimitConfig {
  action: string;
  maxAttempts: number;
  windowMinutes: number;
}

export const checkRateLimit = async (
  supabase: SupabaseClient,
  userId: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; error?: string }> => {
  try {
    const identifier = `${userId}:${config.action}`;
    
    const { data, error } = await supabase.rpc('check_rate_limit', {
      action: config.action,
      identifier,
      max_attempts: config.maxAttempts,
      window_minutes: config.windowMinutes
    });
    
    if (error) {
      console.error('Rate limit check failed:', error);
      // Fail open (allow request) if rate limit check fails
      return { allowed: true };
    }
    
    if (!data || !data.allowed) {
      return { 
        allowed: false, 
        error: `Rate limit exceeded. Maximum ${config.maxAttempts} requests per ${config.windowMinutes} minutes.`
      };
    }
    
    return { allowed: true };
  } catch (error) {
    console.error('Rate limit error:', error);
    // Fail open (allow request) if rate limit check fails
    return { allowed: true };
  }
};

// Predefined rate limit configs for common operations
export const RATE_LIMITS = {
  ADMIN_CREATE_USER: { action: 'admin_create_user', maxAttempts: 10, windowMinutes: 60 },
  ADMIN_UPDATE_USER: { action: 'admin_update_user', maxAttempts: 20, windowMinutes: 60 },
  ADMIN_DELETE_USER: { action: 'admin_delete_user', maxAttempts: 5, windowMinutes: 60 },
  ADMIN_RESET_PASSWORD: { action: 'admin_reset_password', maxAttempts: 10, windowMinutes: 60 },
  ADMIN_GET_USERS: { action: 'admin_get_users', maxAttempts: 100, windowMinutes: 60 },
  AUDIT_LOG: { action: 'audit_log', maxAttempts: 100, windowMinutes: 60 },
  BLOCKCHAIN_HASH: { action: 'blockchain_hash', maxAttempts: 50, windowMinutes: 60 },
};
