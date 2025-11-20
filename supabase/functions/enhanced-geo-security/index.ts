import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SecureLogger } from '../_shared/secure-logger.ts'

const logger = new SecureLogger('enhanced-geo-security')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get client IP from headers
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    '127.0.0.1'

    const userAgent = req.headers.get('user-agent') || ''
    
    logger.info('Enhanced geo-security check', { ip: clientIP })

    // Enhanced IP validation
    const isValidIP = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(clientIP)
    
    if (!isValidIP && clientIP !== '127.0.0.1') {
      logger.warn('Invalid IP format detected', { ip: clientIP })
      return new Response(
        JSON.stringify({
          allowed: false,
          reason: 'Invalid IP format detected',
          risk_factors: ['invalid_ip_format'],
          security_level: 'high'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check for private/local IPs (enhanced detection)
    const privateIPRanges = [
      /^10\./,           // 10.0.0.0/8
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,  // 172.16.0.0/12
      /^192\.168\./,     // 192.168.0.0/16
      /^127\./,          // 127.0.0.0/8 (localhost)
      /^169\.254\./,     // 169.254.0.0/16 (link-local)
      /^0\./,            // 0.0.0.0/8 (invalid)
      /^224\./,          // 224.0.0.0/8 (multicast)
    ]

    const isPrivateIP = privateIPRanges.some(range => range.test(clientIP))
    
    // Risk assessment
    let riskScore = 0
    const riskFactors: string[] = []

    if (isPrivateIP) {
      riskScore += 30
      riskFactors.push('private_ip_detected')
    }

    // Check for VPN/Proxy indicators in User Agent
    const vpnIndicators = [
      /vpn/i,
      /proxy/i,
      /tunnel/i,
      /tor/i,
      /anonymous/i,
    ]

    if (vpnIndicators.some(indicator => indicator.test(userAgent))) {
      riskScore += 40
      riskFactors.push('vpn_proxy_indicators')
    }

    // Check for headless browsers or automation tools
    const automationIndicators = [
      /headless/i,
      /phantom/i,
      /selenium/i,
      /chromedriver/i,
      /puppeteer/i,
      /playwright/i,
    ]

    if (automationIndicators.some(indicator => indicator.test(userAgent))) {
      riskScore += 50
      riskFactors.push('automation_detected')
    }

    // Check IP reputation in database
    const { data: ipRestriction } = await supabase
      .from('ip_restrictions')
      .select('is_allowed, risk_level, last_seen')
      .eq('ip_address', clientIP)
      .single()

    if (ipRestriction) {
      if (!ipRestriction.is_allowed) {
        riskScore += 60
        riskFactors.push('blocked_ip')
      }
      
      // Update last seen
      await supabase
        .from('ip_restrictions')
        .update({ last_seen: new Date().toISOString() })
        .eq('ip_address', clientIP)
    } else {
      // Log new IP for future reference
      await supabase
        .from('ip_restrictions')
        .upsert({
          ip_address: clientIP,
          is_allowed: riskScore < 50, // Auto-allow low risk IPs
          risk_level: riskScore >= 60 ? 'high' : riskScore >= 30 ? 'medium' : 'low',
          country_code: 'US', // Default assumption
          notes: `First seen with risk score: ${riskScore}`
        })
    }

    // Determine security level
    let securityLevel = 'low'
    if (riskScore >= 60) securityLevel = 'critical'
    else if (riskScore >= 40) securityLevel = 'high'
    else if (riskScore >= 20) securityLevel = 'medium'

    // Log security event for high-risk access
    if (riskScore >= 40) {
      await supabase
        .from('security_events')
        .insert({
          event_type: 'high_risk_geo_access',
          severity: securityLevel,
          details: {
            ip_address: clientIP,
            user_agent: userAgent,
            risk_score: riskScore,
            risk_factors: riskFactors
          },
          ip_address: clientIP,
          user_agent: userAgent
        })
    }

    // Allow access unless critical risk
    const allowed = riskScore < 80

    return new Response(
      JSON.stringify({
        allowed,
        risk_score: riskScore,
        risk_factors: riskFactors,
        security_level: securityLevel,
        reason: allowed ? 'Access granted' : 'Access denied due to high security risk',
        country_code: 'US', // Simplified for now
        ip_address: clientIP
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    logger.error('Enhanced geo-security error', error)
    return new Response(
      JSON.stringify({
        allowed: false,
        reason: 'Security validation failed',
        risk_factors: ['validation_error'],
        security_level: 'high'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})