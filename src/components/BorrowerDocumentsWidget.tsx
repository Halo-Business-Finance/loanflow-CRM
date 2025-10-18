import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { FileText, Download, Upload, Folder, MoreHorizontal, Link, Share, CheckSquare, ChevronRight, ChevronDown, Trash2 } from "lucide-react"
import { useDocuments } from "@/hooks/useDocuments"
import { format } from "date-fns"
import { DocumentUploadModal } from "@/components/DocumentUploadModal"
import { useToast } from "@/hooks/use-toast"

interface BorrowerDocumentsWidgetProps {
  leadId: string
  contactEntityId: string
}

export function BorrowerDocumentsWidget({ leadId, contactEntityId }: BorrowerDocumentsWidgetProps) {
  const { documents, loading, downloadDocument, uploadDocument, deleteDocument } = useDocuments()
  const [leadDocuments, setLeadDocuments] = useState<any[]>([])
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['business-tax', 'personal-tax']))
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  useEffect(() => {
    if (documents) {
      const filtered = documents.filter(doc => doc.lead_id === leadId)
      setLeadDocuments(filtered)
    }
  }, [documents, leadId])

  const handleUpload = async (
    uploadLeadId: string,
    uploadContactEntityId: string,
    file: File,
    documentType: string,
    notes?: string,
    customDocumentName?: string
  ) => {
    await uploadDocument(uploadLeadId, uploadContactEntityId, file, documentType, notes, customDocumentName)
    setIsUploadModalOpen(false)
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown"
    const mb = bytes / (1024 * 1024)
    return mb >= 1 ? `${mb.toFixed(2)} MB` : `${(bytes / 1024).toFixed(2)} KB`
  }

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(folderId)) {
        newSet.delete(folderId)
      } else {
        newSet.add(folderId)
      }
      return newSet
    })
  }

  const toggleDocumentSelection = (docId: string) => {
    setSelectedDocuments(prev => {
      const newSet = new Set(prev)
      if (newSet.has(docId)) {
        newSet.delete(docId)
      } else {
        newSet.add(docId)
      }
      return newSet
    })
  }

  const handleDeleteDocument = async (doc: any) => {
    try {
      await deleteDocument(doc.id, doc.file_path)
      toast({
        title: "Document deleted",
        description: "The document has been successfully deleted.",
      })
      setSelectedDocuments(prev => {
        const newSet = new Set(prev)
        newSet.delete(doc.id)
        return newSet
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete document. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleBulkDelete = async () => {
    const docsToDelete = leadDocuments.filter(doc => selectedDocuments.has(doc.id))
    
    try {
      await Promise.all(
        docsToDelete.map(doc => deleteDocument(doc.id, doc.file_path))
      )
      toast({
        title: "Documents deleted",
        description: `${docsToDelete.length} document(s) have been successfully deleted.`,
      })
      setSelectedDocuments(new Set())
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete some documents. Please try again.",
        variant: "destructive",
      })
    }
  }

  const folders = [
    { id: 'business-tax', name: 'Business Tax Returns', icon: Folder },
    { id: 'personal-tax', name: 'Personal Tax Returns', icon: Folder },
    { id: 'financial-statements', name: 'P&L and Balance Sheet', icon: Folder },
    { id: 'bank-statements', name: 'Bank Statements', icon: Folder },
    { id: 'debt-schedule', name: 'Debt Schedule and Notes', icon: Folder },
    { id: 'loan-application', name: 'Loan Application & Driver\'s License', icon: Folder },
    { id: 'ar-ap', name: 'AR & AP', icon: Folder },
    { id: 'projections', name: 'Projections, Resume & Business Plan', icon: Folder },
    { id: 'sba-bank', name: 'SBA & Bank Documents', icon: Folder },
    { id: 'corp-docs', name: 'Corp Articles, Operating Agreement & EIN Form', icon: Folder },
    { id: 'pfs-reo', name: 'PFS & REO', icon: Folder }
  ]

  return (
    <Card className="border-0 shadow-sm bg-card">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span className="text-sm font-medium text-foreground">Loan Documents</span>
            {selectedDocuments.size > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedDocuments.size} selected
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectedDocuments.size > 0 && (
              <Button
                onClick={handleBulkDelete}
                size="sm"
                variant="destructive"
                className="h-8 px-3 gap-2"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete ({selectedDocuments.size})
              </Button>
            )}
            <Button
              onClick={() => setIsUploadModalOpen(true)}
              size="sm"
              className="h-8 px-3 gap-2"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="text-sm text-muted-foreground py-8 text-center">
            Loading documents...
          </div>
        ) : leadDocuments.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center italic">
            No documents uploaded yet
          </div>
        ) : (
          <div className="w-full">
            {/* Folders */}
            <div className="divide-y">
              {folders.map((folder) => {
                // Filter documents for this specific folder
                const folderDocuments = leadDocuments.filter(doc => {
                  const docType = doc.document_type?.toLowerCase() || ''
                  const folderId = folder.id
                  
                  // Map document types to folders
                  if (folderId === 'business-tax' && docType.includes('business') && docType.includes('tax')) return true
                  if (folderId === 'personal-tax' && docType.includes('personal') && docType.includes('tax')) return true
                  if (folderId === 'financial-statements' && (docType.includes('p&l') || docType.includes('balance'))) return true
                  if (folderId === 'bank-statements' && docType.includes('bank') && docType.includes('statement')) return true
                  if (folderId === 'debt-schedule' && (docType.includes('debt') || docType.includes('schedule'))) return true
                  if (folderId === 'loan-application' && (docType.includes('loan application') || docType.includes('license'))) return true
                  if (folderId === 'ar-ap' && (docType.includes('ar') || docType.includes('ap'))) return true
                  if (folderId === 'projections' && (docType.includes('projection') || docType.includes('resume') || docType.includes('business plan'))) return true
                  if (folderId === 'sba-bank' && docType.includes('sba')) return true
                  if (folderId === 'corp-docs' && (docType.includes('corp') || docType.includes('operating') || docType.includes('ein'))) return true
                  if (folderId === 'pfs-reo' && (docType.includes('pfs') || docType.includes('reo'))) return true
                  
                  return false
                })

                return (
                  <div key={folder.id}>
                    {/* Folder Header */}
                    <div
                      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => toggleFolder(folder.id)}
                    >
                      {expandedFolders.has(folder.id) ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <Folder className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm font-medium">{folder.name}</span>
                      <Badge variant="secondary" className="ml-auto">
                        {folderDocuments.length}
                      </Badge>
                    </div>

                    {/* Folder Contents */}
                    {expandedFolders.has(folder.id) && (
                      <div className="bg-muted/20">
                        {folderDocuments.length > 0 ? (
                          <div className="divide-y">
                            {folderDocuments.map((doc) => (
                              <div
                                key={doc.id}
                                className="grid grid-cols-[auto_1fr_200px_120px] gap-4 px-4 py-3 hover:bg-muted/50 transition-colors group items-center"
                              >
                                {/* Checkbox */}
                                <Checkbox
                                  checked={selectedDocuments.has(doc.id)}
                                  onCheckedChange={() => toggleDocumentSelection(doc.id)}
                                  onClick={(e) => e.stopPropagation()}
                                />

                                {/* Name Column */}
                                <div className="flex items-center gap-3 min-w-0">
                                  <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                  <span className="text-sm font-medium truncate">
                                    {doc.document_name}
                                  </span>
                                </div>

                                {/* Updated Column */}
                                <div className="flex items-center text-sm text-muted-foreground">
                                  {format(new Date(doc.created_at), 'MMM d, yyyy')}
                                </div>

                                {/* Size & Actions Column */}
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-muted-foreground">
                                    {formatFileSize(doc.file_size)}
                                  </span>
                                  
                                  {/* Action Buttons */}
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0"
                                      onClick={() => downloadDocument(doc)}
                                    >
                                      <Download className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                      onClick={() => handleDeleteDocument(doc)}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="px-4 py-6 text-center text-sm text-muted-foreground italic">
                            No documents in this folder yet
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>

      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
        preSelectedLeadId={leadId}
      />
    </Card>
  )
}
