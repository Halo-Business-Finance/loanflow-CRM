import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface BlockchainRequest {
  recordType: string
  recordId: string
  data: any
  metadata?: any
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get request body
    const { recordType, recordId, data, metadata = {} }: BlockchainRequest = await req.json()

    if (!recordType || !recordId || !data) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: recordType, recordId, data' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate cryptographic hash of the data
    const encoder = new TextEncoder()
    const dataString = JSON.stringify(data)
    const dataBuffer = encoder.encode(dataString)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = new Uint8Array(hashBuffer)
    const dataHash = Array.from(hashArray, byte => byte.toString(16).padStart(2, '0')).join('')

    // Create blockchain record
    const { data: blockchainRecord, error: createError } = await supabase
      .rpc('create_blockchain_record', {
        p_record_type: recordType,
        p_record_id: recordId,
        p_data_hash: dataHash,
        p_metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          version: '1.0',
          hash_algorithm: 'SHA-256'
        }
      })

    if (createError) {
      console.error('Error creating blockchain record:', createError)
      return new Response(
        JSON.stringify({ error: 'Failed to create blockchain record' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Simulate blockchain transaction (replace with actual blockchain integration)
    const mockTransactionHash = `0x${Array.from(crypto.getRandomValues(new Uint8Array(32)), 
      byte => byte.toString(16).padStart(2, '0')).join('')}`
    const mockBlockNumber = Math.floor(Math.random() * 1000000) + 15000000
    const mockBlockchainHash = `0x${Array.from(crypto.getRandomValues(new Uint8Array(32)), 
      byte => byte.toString(16).padStart(2, '0')).join('')}`

    // Update blockchain record with transaction details
    const { error: updateError } = await supabase
      .from('blockchain_records')
      .update({
        blockchain_hash: mockBlockchainHash,
        transaction_hash: mockTransactionHash,
        block_number: mockBlockNumber,
        verification_status: 'verified',
        verified_at: new Date().toISOString()
      })
      .eq('id', blockchainRecord)

    if (updateError) {
      console.error('Error updating blockchain record:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update blockchain record' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Log security event
    await supabase
      .from('security_events')
      .insert({
        event_type: 'blockchain_hash_created',
        severity: 'low',
        details: {
          record_type: recordType,
          record_id: recordId,
          data_hash: dataHash,
          transaction_hash: mockTransactionHash,
          block_number: mockBlockNumber
        }
      })

    return new Response(
      JSON.stringify({
        success: true,
        blockchainRecordId: blockchainRecord,
        dataHash: dataHash,
        transactionHash: mockTransactionHash,
        blockNumber: mockBlockNumber,
        blockchainHash: mockBlockchainHash,
        verificationStatus: 'verified'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error: unknown) {
    console.error('Blockchain hash function error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})