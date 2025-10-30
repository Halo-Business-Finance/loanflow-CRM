import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Lead } from '@/types/lead'
import { useToast } from '@/hooks/use-toast'
import { useRealtimeSubscription } from './useRealtimeSubscription'
import { useAuth } from '@/components/auth/AuthProvider'

export function useRealtimeLeads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { user, loading: authLoading } = useAuth()

  // Fetch initial leads data (safe two-step query to avoid ambiguous joins)
  const fetchLeads = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (!user) {
        console.warn('No authenticated user in context, skipping leads fetch')
        setLeads([])
        setLoading(false)
        return
      }
      console.log('Fetching leads for user:', user.id)

      // 1) Fetch leads
      const { data: leadRows, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      if (leadsError) throw leadsError

      // 2) Fetch related contact entities (explicit second query avoids ambiguous FK embed errors)
      const contactEntityIds = (leadRows || [])
        .map((l: any) => l.contact_entity_id)
        .filter((id: string | null) => !!id)

      let contactMap: Record<string, any> = {}
      if (contactEntityIds.length > 0) {
        const { data: contactRows, error: contactError } = await supabase
          .from('contact_entities')
          .select('*')
          .in('id', Array.from(new Set(contactEntityIds)))

        if (!contactError && contactRows) {
          contactMap = contactRows.reduce((acc: Record<string, any>, c: any) => {
            acc[c.id] = c
            return acc
          }, {})
        }
      }

      // Normalize into Lead interface
      const transformedLeads: Lead[] = (leadRows || []).map((lead: any) => {
        const ce = contactMap[lead.contact_entity_id]
        const computedName = ce?.first_name || ce?.last_name
          ? `${ce?.first_name || ''} ${ce?.last_name || ''}`.trim()
          : (ce?.name || '')

        return {
          id: lead.id,
          lead_number: lead.lead_number,
          name: computedName,
          email: ce?.email === '[SECURED]' ? '***@***.com' : (ce?.email || ''),
          phone: ce?.phone === '[SECURED]' ? '***-***-****' : (ce?.phone || ''),
          business_name: ce?.business_name || '',
          location: ce?.location || '',
          loan_amount: ce?.loan_amount || 0,
          loan_type: ce?.loan_type || '',
          credit_score: ce?.credit_score || 0,
          stage: ce?.stage || 'Initial Contact',
          priority: ce?.priority || 'Medium',
          net_operating_income: ce?.net_operating_income || 0,
          naics_code: ce?.naics_code || '',
          ownership_structure: ce?.ownership_structure || '',
          created_at: lead.created_at,
          updated_at: lead.updated_at,
          user_id: lead.user_id,
          contact_entity_id: lead.contact_entity_id,
          last_contact: lead.updated_at,
          is_converted_to_client: false,
          contact_entity: ce
        }
      })

      setLeads(transformedLeads)
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to load leads'
      console.error('❌ Leads fetch failed:', err)
      setError(errorMsg)
      setLeads([])
    } finally {
      setLoading(false)
    }
  }

  // Set up real-time subscription for leads
  useRealtimeSubscription({
    table: 'leads',
    onInsert: (payload) => {
      console.log('Real-time: New lead added:', payload.new)
      // Refetch to get properly transformed data
      fetchLeads()
    },
    onUpdate: (payload) => {
      console.log('Real-time: Lead updated:', payload.new)
      // Refetch to get properly transformed data
      fetchLeads()
    },
    onDelete: (payload) => {
      console.log('Real-time: Lead deleted:', payload.old)
      setLeads(prev => prev.filter(lead => lead.id !== payload.old.id))
      toast({
        title: "Lead Deleted",
        description: `Lead has been removed`,
        variant: "destructive"
      })
    }
  })

  // Set up real-time subscription for contact entities (linked to leads)
  useRealtimeSubscription({
    table: 'contact_entities',
    onUpdate: (payload) => {
      console.log('Contact entity updated:', payload.new)
      setLeads(prev => prev.map(lead => {
        if (lead.contact_entity_id === payload.new.id) {
          // Compute name from first_name and last_name, fallback to name field
          const computedName = payload.new.first_name || payload.new.last_name
            ? `${payload.new.first_name || ''} ${payload.new.last_name || ''}`.trim()
            : (payload.new.name || '')
          
          return {
            ...lead,
            contact_entity: payload.new,
            // Map contact entity fields to lead for convenience
            name: computedName,
            email: payload.new.email,
            phone: payload.new.phone,
            business_name: payload.new.business_name,
            loan_amount: payload.new.loan_amount,
            loan_type: payload.new.loan_type,
            stage: payload.new.stage,
            priority: payload.new.priority
          }
        }
        return lead
      }))
    }
  })

  useEffect(() => {
    // Only fetch leads if user is authenticated and auth is not loading
    if (!authLoading && user) {
      fetchLeads()
    } else if (!authLoading && !user) {
      // User is not authenticated, clear leads and stop loading
      setLeads([])
      setLoading(false)
    }
  }, [user, authLoading])

  const refetch = () => {
    fetchLeads()
  }

  return {
    leads,
    loading,
    error,
    refetch
  }
}