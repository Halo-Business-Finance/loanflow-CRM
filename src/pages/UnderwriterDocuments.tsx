import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Upload, CheckCircle, Clock, AlertTriangle, RefreshCw, Filter, FileCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/components/auth/AuthProvider"
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription"
import { useRoleBasedAccess } from "@/hooks/useRoleBasedAccess"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

interface DocumentMetrics {
  pending: number
  verified: number
  rejected: number
  total: number
}

interface RecentDocument {
  id: string
  file_name: string
  document_status: string
  lead_id: string
  uploaded_at: string
  contact_entity?: {
    name: string
  }
}

export default function UnderwriterDocuments() {
  const { user } = useAuth()
  const { hasMinimumRole } = useRoleBasedAccess()
  const [activeTab, setActiveTab] = useState("pending")
  const [metrics, setMetrics] = useState<DocumentMetrics>({
    pending: 0,
    verified: 0,
    rejected: 0,
    total: 0
  })
  const [recentDocuments, setRecentDocuments] = useState<RecentDocument[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      
      // Build query based on role
      let query = supabase
        .from('lead_documents')
        .select(`
          id,
          document_name,
          status,
          lead_id,
          uploaded_at,
          created_at,
          user_id,
          contact_entity_id,
          contact_entities(name)
        `)
        .order('uploaded_at', { ascending: false })

      // Filter by user if not manager/admin
      if (!hasMinimumRole('manager')) {
        query = query.eq('user_id', user?.id)
      }

      const { data, error } = await query

      if (error) throw error

      // Calculate metrics
      const pending = data?.filter(d => d.status === 'pending').length || 0
      const verified = data?.filter(d => d.status === 'verified').length || 0
      const rejected = data?.filter(d => d.status === 'rejected').length || 0

      setMetrics({
        pending,
        verified,
        rejected,
        total: data?.length || 0
      })

      // Get recent documents (top 5)
      const recent = data?.slice(0, 5).map(doc => ({
        id: doc.id,
        file_name: doc.document_name,
        document_status: doc.status,
        lead_id: doc.lead_id || '',
        uploaded_at: doc.uploaded_at || doc.created_at,
        contact_entity: doc.contact_entities
      })) || []

      setRecentDocuments(recent)
    } catch (error) {
      console.error('Error fetching documents:', error)
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [user?.id])

  // Real-time subscription
  useRealtimeSubscription({
    table: 'lead_documents',
    event: '*',
    onChange: () => {
      fetchDocuments()
    }
  })
  return (
    <div className="min-h-screen bg-background">
      <div className="p-8 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Document Review
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Review and process loan documents for underwriting decisions
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              onClick={fetchDocuments}
              disabled={loading}
              className="h-8 text-xs font-medium bg-[#0f62fe] hover:bg-[#0353e9] text-white border-2 border-[#001f3f]"
            >
              <RefreshCw className={`h-3 w-3 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {/* Document Review Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-card shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                  {loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold text-primary">{metrics.pending}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Documents awaiting review</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Approved</p>
                  {loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold text-primary">{metrics.verified}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Documents approved</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Requires Attention</p>
                  {loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold text-primary">{metrics.rejected}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Documents with issues</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Processed</p>
                  {loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold text-primary">{metrics.total}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Total documents</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for different document views */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-[#0A1628] p-1 gap-2">
              <TabsTrigger 
                value="pending" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-white hover:text-white rounded-md flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                <span>Pending</span>
              </TabsTrigger>
              <TabsTrigger 
                value="approved" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-white hover:text-white rounded-md flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Approved</span>
              </TabsTrigger>
              <TabsTrigger 
                value="attention" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-white hover:text-white rounded-md flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Attention</span>
              </TabsTrigger>
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-white hover:text-white rounded-md flex items-center gap-2"
              >
                <FileCheck className="w-4 h-4" />
                <span>All Documents</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-6">
              <Card className="bg-card border-2 border-border/60">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                    <Clock className="h-5 w-5 text-primary" />
                    Pending Review
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Documents awaiting review
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <Skeleton className="h-8 w-8 rounded" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-48" />
                              <Skeleton className="h-3 w-32" />
                            </div>
                          </div>
                          <Skeleton className="h-8 w-24" />
                        </div>
                      ))}
                    </div>
                  ) : recentDocuments.filter(d => d.document_status === 'pending').length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No pending documents</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentDocuments.filter(d => d.document_status === 'pending').map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center space-x-4">
                            <FileText className="h-8 w-8 text-primary" />
                            <div>
                              <p className="font-medium">{doc.file_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {doc.contact_entity?.name || 'Unknown'} • {new Date(doc.uploaded_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="default" 
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => window.location.href = `/lead/${doc.lead_id}/documents`}
                          >
                            Review
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="approved" className="space-y-6">
              <Card className="bg-card border-2 border-border/60">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Approved Documents
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Documents that have been approved
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <Skeleton className="h-8 w-8 rounded" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-48" />
                              <Skeleton className="h-3 w-32" />
                            </div>
                          </div>
                          <Skeleton className="h-8 w-24" />
                        </div>
                      ))}
                    </div>
                  ) : recentDocuments.filter(d => d.document_status === 'verified').length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No approved documents</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentDocuments.filter(d => d.document_status === 'verified').map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center space-x-4">
                            <FileText className="h-8 w-8 text-green-600" />
                            <div>
                              <p className="font-medium">{doc.file_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {doc.contact_entity?.name || 'Unknown'} • {new Date(doc.uploaded_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => window.location.href = `/lead/${doc.lead_id}/documents`}
                          >
                            View Details
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attention" className="space-y-6">
              <Card className="bg-card border-2 border-border/60">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Requires Attention
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Documents with issues that need attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {[1].map((i) => (
                        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <Skeleton className="h-8 w-8 rounded" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-48" />
                              <Skeleton className="h-3 w-32" />
                            </div>
                          </div>
                          <Skeleton className="h-8 w-24" />
                        </div>
                      ))}
                    </div>
                  ) : recentDocuments.filter(d => d.document_status === 'rejected').length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No documents requiring attention</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentDocuments.filter(d => d.document_status === 'rejected').map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center space-x-4">
                            <FileText className="h-8 w-8 text-red-600" />
                            <div>
                              <p className="font-medium">{doc.file_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {doc.contact_entity?.name || 'Unknown'} • {new Date(doc.uploaded_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => window.location.href = `/lead/${doc.lead_id}/documents`}
                          >
                            Review Issue
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="all" className="space-y-6">
              <Card className="bg-card border-2 border-border/60">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                    <FileText className="h-5 w-5 text-primary" />
                    All Documents
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Latest documents processed by the underwriting team
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <Skeleton className="h-8 w-8 rounded" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-48" />
                              <Skeleton className="h-3 w-32" />
                            </div>
                          </div>
                          <Skeleton className="h-8 w-24" />
                        </div>
                      ))}
                    </div>
                  ) : recentDocuments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No documents found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentDocuments.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center space-x-4">
                            <FileText className="h-8 w-8 text-primary" />
                            <div>
                              <p className="font-medium">{doc.file_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {doc.contact_entity?.name || 'Unknown'} • {new Date(doc.uploaded_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-1.5 py-0 ${
                              doc.document_status === 'verified' ? 'text-green-600' :
                              doc.document_status === 'rejected' ? 'text-red-600' :
                              'text-yellow-600'
                            }`}>
                              {doc.document_status === 'verified' ? 'Approved' :
                               doc.document_status === 'rejected' ? 'Rejected' :
                               'Under Review'}
                            </span>
                            <Button 
                              size="sm" 
                              variant="default" 
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={() => window.location.href = `/lead/${doc.lead_id}/documents`}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}