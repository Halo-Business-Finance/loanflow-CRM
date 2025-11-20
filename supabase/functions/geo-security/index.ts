import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SecureLogger } from '../_shared/secure-logger.ts'

const logger = new SecureLogger('geo-security')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get client IP address - handle forwarded IPs properly
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIP = req.headers.get('x-real-ip');
    
    // Parse the first IP from forwarded chain
    let clientIP = 'unknown';
    if (forwardedFor) {
      clientIP = forwardedFor.split(',')[0].trim();
    } else if (realIP) {
      clientIP = realIP.trim();
    }

    // Known Tor exit nodes and VPN/Proxy indicators - be more specific
    const suspiciousHeaders = [
      'tor-exit-node',
      'x-tor'
    ];

    const userAgent = req.headers.get('user-agent') || '';
    // Only flag as suspicious for actual Tor/proxy indicators, not normal headers
    const isSuspicious = suspiciousHeaders.some(header => req.headers.has(header)) ||
                        userAgent.toLowerCase().includes('tor browser') ||
                        userAgent.toLowerCase().includes('phantom') ||
                        userAgent.toLowerCase().includes('headless');

    // Check IP geolocation using a free service
    let countryCode = 'UNKNOWN';
    let isAllowed = false; // Default to blocked for security
    
    logger.info('Geo-security check initiated', { suspicious: isSuspicious })
    
    try {
      // Skip geolocation for localhost/private IPs and allow them (development)
      if (clientIP === 'unknown' || clientIP.startsWith('127.') || 
          clientIP.startsWith('192.168.') || clientIP.startsWith('10.') ||
          clientIP.startsWith('172.')) {
        logger.info('Local/private IP detected, allowing access for development')
        countryCode = 'US';
        isAllowed = true;
      } else {
        // Use ipapi.co for geolocation (free tier: 1000 requests/day)
        const geoResponse = await fetch(`https://ipapi.co/${clientIP}/json/`);
        const geoData = await geoResponse.json();
        countryCode = geoData.country_code || 'UNKNOWN';
        
        logger.info('Geolocation check completed', { country: countryCode })

        // Allow US users unless they are actually suspicious
        if (countryCode === 'US') {
          isAllowed = !isSuspicious;
        } else {
          isAllowed = false; // Block non-US
        }
        
        logger.info('Access decision made', { 
          country: countryCode, 
          suspicious: isSuspicious, 
          allowed: isAllowed 
        })
      }
      
    } catch (geoError) {
      logger.error('Geolocation check failed', geoError)
      // Default to blocked on errors for security
      isAllowed = false;
      countryCode = 'UNKNOWN';
    }

    // Log the IP restriction (IP will be redacted by SecureLogger)
    try {
      await supabase
        .from('ip_restrictions')
        .upsert({
          ip_address: clientIP,
          country_code: countryCode,
          is_allowed: isAllowed,
          reason: !isAllowed ? 
            (countryCode !== 'US' ? 'Non-US location' : 'Suspicious traffic detected') : 
            'Allowed US location'
        });
    } catch (logError) {
      logger.error('Failed to log IP restriction', logError)
    }

    // Log security event if blocked
    if (!isAllowed) {
      try {
        await supabase.rpc('log_security_event', {
          p_event_type: 'geo_restriction_blocked',
          p_severity: 'high',
          p_details: {
            country_code: countryCode,
            suspicious_headers: suspiciousHeaders.filter(h => req.headers.has(h)),
            reason: countryCode !== 'US' ? 'Non-US location' : 'Suspicious traffic'
          },
          p_ip_address: clientIP,
          p_user_agent: userAgent
        });
      } catch (eventError) {
        logger.error('Failed to log security event', eventError)
      }
    }

    return new Response(
      JSON.stringify({
        allowed: isAllowed,
        country: countryCode,
        reason: !isAllowed ? 'Access restricted to US locations only' : 'Access allowed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: isAllowed ? 200 : 403
      }
    );

  } catch (error) {
    logger.error('Geo-security check error', error)
    return new Response(
      JSON.stringify({ 
        error: 'Security check failed',
        allowed: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});