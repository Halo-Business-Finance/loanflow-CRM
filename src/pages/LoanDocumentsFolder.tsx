import { StandardPageLayout } from '@/components/StandardPageLayout'
import { StandardPageHeader } from '@/components/StandardPageHeader'
import { BorrowerDocumentsWidget } from '@/components/BorrowerDocumentsWidget'
import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Building2 } from 'lucide-react'

interface LeadInfo {
  id: string
  contact_entity?: {
    name: string
    business_name?: string
    loan_type?: string
    location?: string
  }
}

export default function LoanDocumentsFolder() {
  const { leadId } = useParams<{ leadId: string }>()
  const navigate = useNavigate()
  const [leadInfo, setLeadInfo] = useState<LeadInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeadInfo = async () => {
      if (!leadId) return

      try {
        const { data, error } = await supabase
          .from('leads')
          .select(`
            id,
            contact_entity:contact_entities!contact_entity_id(
              name,
              business_name,
              loan_type,
              location
            )
          `)
          .eq('id', leadId)
          .maybeSingle()

        if (error) throw error
        setLeadInfo(data)
      } catch (error) {
        console.error('Error fetching lead info:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeadInfo()
  }, [leadId])

  if (loading) {
    return (
      <StandardPageLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mb-4"></div>
            <div className="h-4 bg-muted rounded w-96"></div>
          </div>
        </div>
      </StandardPageLayout>
    )
  }

  if (!leadInfo || !leadId) {
    return (
      <StandardPageLayout>
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Loan not found</h2>
          <Button onClick={() => navigate('/documents')}>
            Back to Documents
          </Button>
        </div>
      </StandardPageLayout>
    )
  }

  const businessName = leadInfo.contact_entity?.business_name || leadInfo.contact_entity?.name || 'Unknown Business'
  const loanType = leadInfo.contact_entity?.loan_type || 'Loan'
  const location = leadInfo.contact_entity?.location

  return (
    <StandardPageLayout>
      <div className="border-b">
        <div className="p-6">
          <Button variant="outline" onClick={() => navigate('/documents')} className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to All Loans
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{businessName} - {loanType}</h1>
            {location && (
              <p className="text-sm text-muted-foreground">
                {location}
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <BorrowerDocumentsWidget 
          leadId={leadId} 
          contactEntityId={leadInfo.contact_entity?.name || ''} 
        />
      </div>
    </StandardPageLayout>
  )
}
