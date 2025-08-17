import { useState, useEffect } from "react"
import { Search, User, Users, DollarSign, FileText, LucideIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/components/auth/AuthProvider"
import { useNavigate } from "react-router-dom"

interface SearchResult {
  id: string
  type: 'lead' | 'client' | 'loan'
  title: string
  subtitle: string
  stage?: string
  amount?: number
}

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  const searchData = async (searchQuery: string) => {
    if (!user || !searchQuery || searchQuery.length < 2) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      // Search leads with contact entity data
      const { data: leads } = await supabase
        .from('leads')
        .select(`
          id, user_id,
          contact_entity:contact_entities!contact_entity_id (
            name, email, stage, loan_amount
          )
        `)
        .eq('user_id', user.id)
        .or(`contact_entities.name.ilike.%${searchQuery}%,contact_entities.email.ilike.%${searchQuery}%`)
        .limit(5)

      // Search clients with contact entity data
      const { data: clients } = await supabase
        .from('clients')
        .select(`
          id, user_id, status,
          contact_entity:contact_entities!contact_entity_id (
            name, email
          )
        `)
        .eq('user_id', user.id)
        .or(`contact_entities.name.ilike.%${searchQuery}%,contact_entities.email.ilike.%${searchQuery}%`)
        .limit(5)

      // Search loans
      const { data: loans } = await supabase
        .from('loans')
        .select(`
          id, loan_amount, loan_type, status,
          clients!inner(
            contact_entity:contact_entities!contact_entity_id (
              name
            )
          )
        `)
        .eq('user_id', user.id)
        .or(`loan_type.ilike.%${searchQuery}%`)
        .limit(5)

      const searchResults: SearchResult[] = []

      // Add leads to results
      leads?.forEach(lead => {
        searchResults.push({
          id: lead.id,
          type: 'lead',
          title: lead.contact_entity?.name || 'Unknown Lead',
          subtitle: lead.contact_entity?.email || '',
          stage: lead.contact_entity?.stage,
          amount: lead.contact_entity?.loan_amount
        })
      })

      // Add clients to results
      clients?.forEach(client => {
        searchResults.push({
          id: client.id,
          type: 'client',
          title: client.contact_entity?.name || 'Unknown Client',
          subtitle: client.contact_entity?.email || '',
          stage: client.status
        })
      })

      // Add loans to results
      loans?.forEach(loan => {
        searchResults.push({
          id: loan.id,
          type: 'loan',
          title: `${loan.loan_type} - $${loan.loan_amount?.toLocaleString()}`,
          subtitle: loan.clients?.contact_entity?.name || 'Unknown Client',
          stage: loan.status
        })
      })

      setResults(searchResults)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchData(query)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [query, user])

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'lead') {
      navigate(`/leads/${result.id}`)
    } else if (result.type === 'client') {
      navigate(`/clients/${result.id}`)
    } else if (result.type === 'loan') {
      // Navigate to client who owns this loan
      navigate('/clients') // Could be improved to navigate to specific client
    }
    setIsOpen(false)
    setQuery("")
  }

  const getIcon = (type: string): LucideIcon => {
    switch (type) {
      case 'lead': return User
      case 'client': return Users
      case 'loan': return DollarSign
      default: return FileText
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-start text-muted-foreground hover:bg-muted"
          data-search-trigger
        >
          <Search className="mr-2 h-4 w-4 text-muted-foreground" />
          Search everything...
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Search CRM</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads, clients, loans..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
          
          {loading && (
            <div className="text-center py-4 text-muted-foreground">
              Searching...
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {results.map((result) => {
                const IconComponent = getIcon(result.type)
                return (
                  <div
                    key={`${result.type}-${result.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => handleResultClick(result)}
                  >
                    <IconComponent className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{result.title}</div>
                      <div className="text-sm text-muted-foreground truncate">{result.subtitle}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {result.stage && (
                        <Badge variant="secondary" className="text-xs">
                          {result.stage}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs capitalize">
                        {result.type}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50 text-muted-foreground" />
              <p>No results found for "{query}"</p>
            </div>
          )}

          {query.length < 2 && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50 text-muted-foreground" />
              <p>Type at least 2 characters to search</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}