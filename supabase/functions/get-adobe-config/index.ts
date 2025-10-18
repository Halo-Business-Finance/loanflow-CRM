import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('🔧 Adobe Config Function Called - Method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🔍 Getting Adobe credentials from environment...');
    
    // Get Adobe credentials from Supabase secrets
    const adobeClientId = Deno.env.get('ADOBE_CLIENT_ID') || 'dc-pdf-embed-demo'
    const adobeApiKey = Deno.env.get('ADOBE_API_KEY') || null
    const isDemo = adobeClientId === 'dc-pdf-embed-demo'
    
    console.log('📋 Adobe Client ID found:', adobeClientId ? '✅ Yes' : '❌ No');
    console.log('🔑 Adobe API Key found:', adobeApiKey ? '✅ Yes' : '❌ No');
    console.log('🎭 Is Demo mode:', isDemo);
    
    const configResponse = { 
      clientId: adobeClientId,
      hasApiKey: !!adobeApiKey,
      isDemo: isDemo,
      status: isDemo ? 'demo' : 'licensed',
      features: {
        pdfViewer: true,
        documentEmbed: true,
        apiAccess: !!adobeApiKey,
        advancedFeatures: !isDemo && !!adobeApiKey
      }
    };
    
    console.log('✅ Returning Adobe config:', configResponse);
    
    return new Response(
      JSON.stringify(configResponse),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    )
  } catch (error) {
    console.error('❌ Error getting Adobe config:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to get Adobe configuration',
        clientId: 'dc-pdf-embed-demo',
        isDemo: true
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    )
  }
})