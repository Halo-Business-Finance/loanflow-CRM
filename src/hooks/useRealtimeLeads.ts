import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Lead } from '@/types/lead'
import { useToast } from '@/hooks/use-toast'
import { useRealtimeSubscription } from './useRealtimeSubscription'
import { useAuth } from '@/components/auth/AuthProvider'

export function useRealtimeLeads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { user, loading: authLoading } = useAuth()

  // Fetch initial leads data
  const fetchLeads = async () => {
    try {
      setLoading(true)
      
      // Add debugging
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Current session:', session)
      console.log('User authenticated:', !!session?.user)
      
      if (!session?.user) {
        console.warn('No authenticated user found, skipping leads fetch')
        setLeads([])
        return
      }
      
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          contact_entity:contact_entities(*)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase query error:', error)
        throw error
      }
      
      // Transform the data to match Lead interface
      const transformedLeads: Lead[] = (data || []).map(lead => {
        // Compute name from first_name and last_name, fallback to name field
        const computedName = lead.contact_entity?.first_name || lead.contact_entity?.last_name
          ? `${lead.contact_entity?.first_name || ''} ${lead.contact_entity?.last_name || ''}`.trim()
          : (lead.contact_entity?.name || '')
        
        return {
          id: lead.id,
          lead_number: lead.lead_number,
          name: computedName,
          email: lead.contact_entity?.email === '[SECURED]' ? '***@***.com' : (lead.contact_entity?.email || ''),
          phone: lead.contact_entity?.phone === '[SECURED]' ? '***-***-****' : (lead.contact_entity?.phone || ''),
          business_name: lead.contact_entity?.business_name || '',
          location: lead.contact_entity?.location || '',
          loan_amount: lead.contact_entity?.loan_amount || 0,
          loan_type: lead.contact_entity?.loan_type || '',
          credit_score: lead.contact_entity?.credit_score || 0,
          stage: lead.contact_entity?.stage || 'Initial Contact',
          priority: lead.contact_entity?.priority || 'Medium',
          net_operating_income: lead.contact_entity?.net_operating_income || 0,
          naics_code: lead.contact_entity?.naics_code || '',
          ownership_structure: lead.contact_entity?.ownership_structure || '',
          created_at: lead.created_at,
          updated_at: lead.updated_at,
          user_id: lead.user_id,
          contact_entity_id: lead.contact_entity_id,
          last_contact: lead.updated_at,
          is_converted_to_client: false,
          contact_entity: lead.contact_entity
        }
      })
      
      setLeads(transformedLeads)
    } catch (error) {
      console.warn('Leads fetch failed (non-blocking):', error)
      // Suppress user-facing toast to avoid noisy popups on dashboards
      // You can trigger a refetch manually from the Leads page if needed.
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
    refetch
  }
}