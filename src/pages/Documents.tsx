import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Search, FolderOpen, Upload, Users, ChevronRight, Grid, List, Trash2, Download, CheckSquare, FileText, Clock, AlertCircle, Maximize2, Minimize2, ArrowUpDown, ArrowUp, ArrowDown, Star, History } from "lucide-react"
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
  const [isCompact, setIsCompact] = useState(false)
  const [selectedFolders, setSelectedFolders] = useState<Set<string>>(new Set())
  const [sortColumn, setSortColumn] = useState<'name' | 'updated' | 'size' | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
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
        // Construct location from available fields
        const locationParts = [];
        if (doc.contact_entity?.business_city) locationParts.push(doc.contact_entity.business_city);
        if (doc.contact_entity?.business_state) locationParts.push(doc.contact_entity.business_state);
        const constructedLocation = locationParts.length > 0 
          ? locationParts.join(', ') 
          : (doc.contact_entity?.location || 'Location not specified');
        
        folderMap.set(leadId, {
          leadId,
          leadName: doc.contact_entity?.business_name || doc.contact_entity?.name || 'Unknown Business',
          loanType: doc.contact_entity?.loan_type || 'General',
          location: constructedLocation,
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

  // Handle sorting
  const handleSort = (column: 'name' | 'updated' | 'size') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  // Sort filtered folders
  const sortedFolders = useMemo(() => {
    if (!sortColumn) return filteredFolders

    return [...filteredFolders].sort((a, b) => {
      let comparison = 0

      switch (sortColumn) {
        case 'name':
          comparison = a.leadName.localeCompare(b.leadName)
          break
        case 'updated':
          comparison = new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime()
          break
        case 'size':
          comparison = a.documentCount - b.documentCount
          break
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [filteredFolders, sortColumn, sortDirection])

  // Render sort icon
  const SortIcon = ({ column }: { column: 'name' | 'updated' | 'size' }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-3 w-3 text-primary" />
      : <ArrowDown className="h-3 w-3 text-primary" />
  }

  // Calculate metrics
  const metrics = useMemo(() => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const recentUploads = documents.filter(doc => 
      new Date(doc.created_at) > sevenDaysAgo
    ).length
    
    const pendingDocuments = documents.filter(doc => 
      doc.status === 'pending' || doc.status === 'pending_review'
    ).length
    
    return {
      totalFolders: loanFolders.length,
      totalFiles: documents.length,
      recentUploads,
      pendingDocuments
    }
  }, [documents, loanFolders])

  const handleFolderClick = (leadId: string, event: React.MouseEvent) => {
    // Don't navigate if clicking on checkbox area
    if ((event.target as HTMLElement).closest('[data-checkbox]')) {
      return
    }
    navigate(`/documents/loan/${leadId}`)
  }

  const toggleSelectFolder = (leadId: string) => {
    setSelectedFolders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(leadId)) {
        newSet.delete(leadId)
      } else {
        newSet.add(leadId)
      }
      return newSet
    })
  }

  const toggleSelectAll = () => {
    if (selectedFolders.size === filteredFolders.length) {
      setSelectedFolders(new Set())
    } else {
      setSelectedFolders(new Set(filteredFolders.map(f => f.leadId)))
    }
  }

  const handleBulkDelete = () => {
    // Placeholder for bulk delete functionality
    console.log('Bulk delete:', Array.from(selectedFolders))
    setSelectedFolders(new Set())
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <div className="w-64 border-r border-border bg-card/50 p-4">
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-8 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <div className="border-b border-border p-4">
            <div className="h-10 bg-muted rounded animate-pulse"></div>
          </div>
          <div className="p-6 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Sidebar */}
      <div className="w-64 border-r border-border bg-card/50 p-4 space-y-6">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground px-3">Quick Access</h3>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-sm"
          >
            <History className="h-4 w-4" />
            Recent Files
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-sm"
          >
            <Star className="h-4 w-4" />
            Favorites
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="border-b border-border bg-card/50 px-6 py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-foreground">Files</h1>
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search files and folders"
                  className="pl-10 bg-background"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              Add Users
            </Button>
            <Button onClick={() => setShowUploadModal(true)} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-4">
            {sortedFolders.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-lg border border-border">
                <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a file or folder to view details.</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchTerm ? "No folders match your search" : "Upload documents to create loan folders"}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setShowUploadModal(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload First Document
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-medium text-muted-foreground border-b border-border">
                  <button
                    onClick={() => handleSort('name')}
                    className="col-span-6 flex items-center gap-2 hover:text-foreground transition-colors text-left"
                  >
                    NAME
                    <SortIcon column="name" />
                  </button>
                  <button
                    onClick={() => handleSort('updated')}
                    className="col-span-4 flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    UPDATED
                    <SortIcon column="updated" />
                  </button>
                  <button
                    onClick={() => handleSort('size')}
                    className="col-span-2 text-right flex items-center justify-end gap-2 hover:text-foreground transition-colors"
                  >
                    SIZE
                    <SortIcon column="size" />
                  </button>
                </div>

                {/* Folder Rows */}
                <div className="space-y-1">
                  {sortedFolders.map((folder) => (
                    <div
                      key={folder.leadId}
                      onClick={(e) => handleFolderClick(folder.leadId, e)}
                      className="grid grid-cols-12 gap-4 px-4 py-3 rounded-md hover:bg-muted/50 transition-colors cursor-pointer items-center group"
                    >
                      {/* Name Column */}
                      <div className="col-span-6 flex items-center gap-3">
                        <FolderOpen className="h-5 w-5 text-blue-500 flex-shrink-0" />
                        <span className="text-sm font-medium text-foreground truncate">
                          {folder.leadName} - {folder.loanType}
                        </span>
                      </div>

                      {/* Updated Column */}
                      <div className="col-span-4 text-sm text-muted-foreground">
                        {format(new Date(folder.lastUpdated), 'MMM d, yyyy')} by {folder.updatedBy}
                      </div>

                      {/* Size Column */}
                      <div className="col-span-2 text-right text-sm text-muted-foreground">
                        {folder.documentCount} Files
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={uploadDocument}
      />
    </div>
  )
}
