import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Lead } from '@/types/lead'
import { useToast } from '@/hooks/use-toast'
import { useRealtimeSubscription } from './useRealtimeSubscription'

export function useRealtimeLeads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Fetch initial leads data
  const fetchLeads = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          contact_entity:contact_entities(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Transform the data to match Lead interface
      const transformedLeads: Lead[] = (data || []).map(lead => ({
        id: lead.id,
        name: lead.contact_entity?.name || '',
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
      }))
      
      setLeads(transformedLeads)
    } catch (error) {
      console.error('Error fetching leads:', error)
      toast({
        title: "Error",
        description: "Failed to fetch leads",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Set up real-time subscription for leads
  useRealtimeSubscription({
    table: 'leads',
    onInsert: (payload) => {
      console.log('Real-time: New lead added:', payload.new)
      setLeads(prev => [payload.new, ...prev])
      toast({
        title: "New Lead Added",
        description: `Lead ${payload.new.id} has been created`,
        variant: "default"
      })
    },
    onUpdate: (payload) => {
      console.log('Real-time: Lead updated:', payload.new)
      setLeads(prev => prev.map(lead => 
        lead.id === payload.new.id ? { ...lead, ...payload.new } : lead
      ))
      toast({
        title: "Lead Updated",
        description: `Lead ${payload.new.id} has been updated`,
        variant: "default"
      })
    },
    onDelete: (payload) => {
      console.log('Real-time: Lead deleted:', payload.old)
      setLeads(prev => {
        const filtered = prev.filter(lead => lead.id !== payload.old.id)
        console.log('Leads before filter:', prev.length, 'after filter:', filtered.length)
        return filtered
      })
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
          return {
            ...lead,
            contact_entity: payload.new,
            // Map contact entity fields to lead for convenience
            name: payload.new.name,
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
    fetchLeads()
  }, [])

  const refetch = () => {
    fetchLeads()
  }

  return {
    leads,
    loading,
    refetch
  }
}