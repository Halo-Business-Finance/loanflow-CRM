
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, FileText, Calendar, User, DollarSign, Download, Upload, Eye, Trash2, CheckCircle, RefreshCw } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { useDocuments, LeadDocument } from "@/hooks/useDocuments"
import { DocumentUploadModal } from "@/components/DocumentUploadModal"
import { DocumentViewer } from "@/components/DocumentViewer"
import { DocumentTest } from "@/components/DocumentTest"
import { formatDistanceToNow } from "date-fns"

export default function Documents() {
  const { user } = useAuth()
  const { documents, loading, uploadDocument, updateDocumentStatus, downloadDocument, deleteDocument } = useDocuments()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<LeadDocument | null>(null)
  const [showDocumentViewer, setShowDocumentViewer] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'verified': return 'default'
      case 'pending': return 'secondary'
      case 'rejected': return 'destructive'
      default: return 'secondary'
    }
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.document_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.contact_entity?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.document_type.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const statusCounts = {
    total: documents.length,
    verified: documents.filter(doc => doc.status === 'verified').length,
    pending: documents.filter(doc => doc.status === 'pending').length,
    rejected: documents.filter(doc => doc.status === 'rejected').length
  }

  const handleViewDocument = (document: LeadDocument) => {
    setSelectedDocument(document)
    setShowDocumentViewer(true)
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size'
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not uploaded'
    return formatDistanceToNow(new Date(dateString), { addSuffix: true })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="space-y-6">
          <div className="animate-fade-in">
            <div className="h-8 bg-muted rounded w-64 mb-2"></div>
            <div className="h-4 bg-muted rounded w-96"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse border border-border shadow-sm bg-white rounded-lg p-6">
                <div className="h-6 bg-muted rounded w-24 mb-4"></div>
                <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                <div className="h-8 w-8 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Debug logging - Enhanced
  console.log('=== DOCUMENTS PAGE DEBUG ===');
  console.log('Auth State:', { 
    userExists: !!user, 
    userId: user?.id,
    userEmail: user?.email
  });
  console.log('Documents State:', {
    documentsCount: documents.length, 
    loading,
    documentsPreview: documents.slice(0, 2).map(d => ({
      id: d.id.slice(0, 8),
      name: d.document_name,
      type: d.document_type,
      status: d.status,
      hasFilePath: !!d.file_path
    }))
  });
  console.log('=== END DEBUG ===');

  return (
    <>
      <DocumentTest />
      
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="space-y-6 animate-fade-in">
          {/* Header Section */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Document Command Center</h1>
            <p className="text-muted-foreground mt-2">
              Enterprise-grade secure document management with advanced upload and verification for SBA and Commercial loan CRM
            </p>
          </div>

          {/* Document Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="bg-card border-0 shadow-lg hover-scale">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Documents</p>
                    <p className="text-2xl font-bold text-foreground">{statusCounts.total}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-0 shadow-lg hover-scale">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Verified</p>
                    <p className="text-2xl font-bold text-foreground">{statusCounts.verified}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-0 shadow-lg hover-scale">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                    <p className="text-2xl font-bold text-foreground">{statusCounts.pending}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-0 shadow-lg hover-scale">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                    <p className="text-2xl font-bold text-foreground">{statusCounts.rejected}</p>
                  </div>
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Controls */}
          <div className="flex justify-between items-center mb-6">
            <Button className="flex items-center gap-2" variant="outline">
              <RefreshCw className="h-4 w-4" />
              Refresh Documents
            </Button>
            <Button onClick={() => setShowUploadModal(true)} className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Document
            </Button>
          </div>

          {/* Search and Filters */}
          <Card className="border border-border shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search documents, leads, or document types..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Documents List */}
          <div className="grid gap-6">
            {filteredDocuments.length === 0 ? (
              <Card className="border border-border shadow-sm bg-white">
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No documents found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || statusFilter !== "all" 
                      ? "Try adjusting your search or filters" 
                      : "Upload your first document to get started"}
                  </p>
                  {!searchTerm && statusFilter === "all" && (
                    <Button onClick={() => setShowUploadModal(true)} className="gap-2">
                      <Upload className="h-4 w-4" />
                      Upload First Document
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredDocuments.map((document) => (
                <Card key={document.id} className="border border-border shadow-sm bg-white hover-scale transition-all">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header Row */}
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-foreground">{document.contact_entity?.name || 'Unknown Lead'}</h3>
                            <Badge variant="secondary" className="text-xs">
                              {document.document_type}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground">Document ID: {document.id.slice(0, 8)}</p>
                        </div>
                        
                        <div className="text-right space-y-1">
                          <Badge variant={getStatusColor(document.status)}>
                            {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                          </Badge>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(document.uploaded_at)}
                          </div>
                        </div>
                      </div>

                      {/* File Information with Preview */}
                      <div className="bg-muted/30 rounded-lg p-4">
                        <div className="flex items-center gap-4">
                          {/* Document Preview Image */}
                          <div className="w-16 h-20 bg-white rounded-lg border-2 border-border shadow-sm flex-shrink-0 overflow-hidden">
                            {document.file_mime_type?.includes('pdf') ? (
                              <div className="w-full h-full bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
                                <FileText className="h-8 w-8 text-red-600" />
                              </div>
                            ) : document.file_mime_type?.startsWith('image/') ? (
                              <img 
                                src={`https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=64&h=80&fit=crop&auto=format`}
                                alt="Document preview"
                                className="w-full h-full object-cover"
                              />
                            ) : document.file_mime_type?.includes('word') || document.file_mime_type?.includes('document') ? (
                              <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                                <FileText className="h-8 w-8 text-blue-600" />
                              </div>
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                                <FileText className="h-8 w-8 text-gray-600" />
                              </div>
                            )}
                          </div>
                          
                          {/* File Details */}
                          <div className="flex-1">
                            <div className="font-medium">{document.document_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatFileSize(document.file_size)} • {document.file_mime_type || 'Unknown type'}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Uploaded {formatDate(document.uploaded_at)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-border/50">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <div>
                            <div className="text-sm text-muted-foreground">Loan Amount</div>
                            <div className="font-medium">
                              {document.contact_entity?.loan_amount 
                                ? `$${document.contact_entity.loan_amount.toLocaleString()}` 
                                : 'Not specified'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <div>
                            <div className="text-sm text-muted-foreground">Upload Date</div>
                            <div className="font-medium">{formatDate(document.uploaded_at)}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-purple-600" />
                          <div>
                            <div className="text-sm text-muted-foreground">Status</div>
                            <div className="font-medium capitalize">{document.status}</div>
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      {document.notes && (
                        <div className="pt-4 border-t border-border/50">
                          <div className="text-sm text-muted-foreground mb-1">Notes:</div>
                          <div className="text-sm">{document.notes}</div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-4 border-t border-border/50">
                        {document.file_path && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1 gap-2"
                              onClick={() => handleViewDocument(document)}
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1 gap-2"
                              onClick={() => downloadDocument(document)}
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </Button>
                          </>
                        )}
                        
                        {document.status === 'pending' && (
                          <Button 
                            size="sm" 
                            className="flex-1 gap-2"
                            onClick={() => updateDocumentStatus(document.id, 'verified')}
                          >
                            <CheckCircle className="h-4 w-4" />
                            Verify
                          </Button>
                        )}

                        {document.status === 'pending' && (
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            className="flex-1 gap-2"
                            onClick={() => updateDocumentStatus(document.id, 'rejected')}
                          >
                            Reject
                          </Button>
                        )}

                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="gap-2"
                          onClick={() => deleteDocument(document.id, document.file_path)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Upload Modal */}
          <DocumentUploadModal
            isOpen={showUploadModal}
            onClose={() => setShowUploadModal(false)}
            onUpload={uploadDocument}
          />

          {/* Document Viewer */}
          <DocumentViewer
            document={selectedDocument}
            isOpen={showDocumentViewer}
            onClose={() => {
              setShowDocumentViewer(false)
              setSelectedDocument(null)
            }}
          />
        </div>
      </div>
    </>
  )
}