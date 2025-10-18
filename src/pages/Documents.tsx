import { StandardPageLayout } from '@/components/StandardPageLayout'
import { StandardPageHeader } from '@/components/StandardPageHeader'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, FolderOpen, Upload, Users, ChevronRight, Grid, List } from "lucide-react"
import { useState, useMemo } from "react"
import { useDocuments } from "@/hooks/useDocuments"
import { DocumentUploadModal } from "@/components/DocumentUploadModal"
import { format } from "date-fns"
import { useNavigate } from "react-router-dom"

interface LoanFolder {
  leadId: string
  leadName: string
  loanType: string
  location: string
  documentCount: number
  lastUpdated: string
  updatedBy: string
}

export default function Documents() {
  const { documents, loading, uploadDocument } = useDocuments()
  const [searchTerm, setSearchTerm] = useState("")
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const navigate = useNavigate()

  // Group documents by lead to create folder structure
  const loanFolders = useMemo(() => {
    const folderMap = new Map<string, LoanFolder>()
    
    documents.forEach(doc => {
      if (!doc.lead_id) return
      
      const leadId = doc.lead_id
      const existing = folderMap.get(leadId)
      
      if (existing) {
        existing.documentCount++
        if (new Date(doc.updated_at) > new Date(existing.lastUpdated)) {
          existing.lastUpdated = doc.updated_at
        }
      } else {
        folderMap.set(leadId, {
          leadId,
          leadName: doc.contact_entity?.business_name || doc.contact_entity?.name || 'Unknown Business',
          loanType: doc.contact_entity?.loan_type || 'General',
          location: doc.contact_entity?.location || 'Location not specified',
          documentCount: 1,
          lastUpdated: doc.updated_at,
          updatedBy: 'Loan Processing'
        })
      }
    })
    
    return Array.from(folderMap.values()).sort((a, b) => 
      new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    )
  }, [documents])

  const filteredFolders = loanFolders.filter(folder =>
    folder.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    folder.loanType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    folder.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleFolderClick = (leadId: string) => {
    navigate(`/leads/${leadId}`)
  }

  if (loading) {
    return (
      <StandardPageLayout>
        <StandardPageHeader 
          title="Files"
          description="Document Command Center - Loan Document Management"
        />
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </StandardPageLayout>
    )
  }

  return (
    <StandardPageLayout>
      <StandardPageHeader 
        title="Files"
        description="Document Command Center - Loan Document Management"
        actions={
          <Button onClick={() => setShowUploadModal(true)} className="gap-2">
            <Upload className="h-4 w-4" />
            New
          </Button>
        }
      />
      
      <div className="p-6 space-y-6">
        {/* Search and View Controls */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search folders..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 border border-border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 w-8 p-0"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Folder Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b">
          <div className="col-span-5 flex items-center gap-2">
            NAME
            <ChevronRight className="h-3 w-3 rotate-90" />
          </div>
          <div className="col-span-4">UPDATED</div>
          <div className="col-span-3 text-right">SIZE</div>
        </div>

        {/* Folder List */}
        <div className="space-y-2">
          {filteredFolders.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No loan folders found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? "Try adjusting your search" 
                  : "Upload documents to create loan folders"}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowUploadModal(true)} className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload First Document
                </Button>
              )}
            </div>
          ) : (
            filteredFolders.map((folder) => (
              <button
                key={folder.leadId}
                onClick={() => handleFolderClick(folder.leadId)}
                className="w-full grid grid-cols-12 gap-4 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors text-left items-center group"
              >
                {/* Folder Icon and Name */}
                <div className="col-span-5 flex items-center gap-3">
                  <div className="relative">
                    <FolderOpen className="h-8 w-8 text-blue-500 group-hover:text-blue-600 transition-colors" />
                    <Users className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 text-blue-600 bg-white rounded-full p-0.5" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">
                      {folder.leadName} - {folder.loanType}
                    </div>
                    {folder.location && (
                      <div className="text-xs text-muted-foreground">
                        {folder.location}
                      </div>
                    )}
                  </div>
                </div>

                {/* Updated Info */}
                <div className="col-span-4 text-sm text-muted-foreground">
                  {format(new Date(folder.lastUpdated), 'MMM d, yyyy')} by {folder.updatedBy}
                </div>

                {/* File Count */}
                <div className="col-span-3 text-right text-sm text-muted-foreground">
                  {folder.documentCount} {folder.documentCount === 1 ? 'File' : 'Files'}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Empty State Illustration */}
        {filteredFolders.length === 0 && !searchTerm && (
          <div className="flex justify-center mt-8">
            <div className="text-center space-y-4 max-w-md">
              <div className="relative inline-block">
                <FolderOpen className="h-32 w-32 text-blue-500/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-4xl">📁</div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Select a file or folder to view details.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={uploadDocument}
      />
    </StandardPageLayout>
  )
}
