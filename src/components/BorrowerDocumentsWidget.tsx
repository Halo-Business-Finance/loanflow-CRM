import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download, Upload, Folder, MoreHorizontal, Link, Share, CheckSquare, ChevronRight, ChevronDown } from "lucide-react"
import { useDocuments } from "@/hooks/useDocuments"
import { format } from "date-fns"
import { DocumentUploadModal } from "@/components/DocumentUploadModal"

interface BorrowerDocumentsWidgetProps {
  leadId: string
  contactEntityId: string
}

export function BorrowerDocumentsWidget({ leadId, contactEntityId }: BorrowerDocumentsWidgetProps) {
  const { documents, loading, downloadDocument, uploadDocument } = useDocuments()
  const [leadDocuments, setLeadDocuments] = useState<any[]>([])
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['business-tax', 'personal-tax']))

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

  const folders = [
    { id: 'business-tax', name: 'Business Tax Returns', icon: Folder },
    { id: 'personal-tax', name: 'Personal Tax Returns', icon: Folder },
    { id: 'financial-statements', name: 'P&L and Balance Sheet', icon: Folder },
    { id: 'bank-statements', name: 'Bank Statements', icon: Folder },
    { id: 'debt-schedule', name: 'Debt Schedule and Notes', icon: Folder },
    { id: 'loan-application', name: 'Loan Application & Driver\'s License', icon: Folder },
    { id: 'ar-ap', name: 'AR & AP', icon: Folder },
    { id: 'projections', name: 'Projections, Resume & Business Plan', icon: Folder }
  ]

  return (
    <Card className="border-0 shadow-sm bg-card">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span className="text-sm font-medium text-foreground">Loan Documents</span>
          </div>
          <div className="flex items-center gap-2">
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
              {folders.map((folder) => (
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
                      0
                    </Badge>
                  </div>

                  {/* Folder Contents */}
                  {expandedFolders.has(folder.id) && (
                    <div className="bg-muted/20">
                      <div className="px-4 py-6 text-center text-sm text-muted-foreground italic">
                        No documents in this folder yet
                      </div>
                    </div>
                  )}
                </div>
              ))}
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
