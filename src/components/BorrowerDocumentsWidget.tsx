import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download, Upload, Folder, MoreHorizontal, Link, Share, CheckSquare } from "lucide-react"
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

  return (
    <Card className="border-0 shadow-sm bg-card">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span className="text-sm font-medium">Files</span>
            <span className="text-sm">&gt;</span>
            <span className="text-sm font-medium text-foreground">Loan Documents</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
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
            {/* Table Header */}
            <div className="grid grid-cols-[1fr_200px_120px] gap-4 px-4 py-2 border-b bg-muted/30 text-xs font-medium text-muted-foreground uppercase">
              <div className="flex items-center gap-1">
                Name <span className="text-[10px]">↑</span>
              </div>
              <div>Updated</div>
              <div>Size</div>
            </div>

            {/* Document Rows */}
            <div className="divide-y max-h-[400px] overflow-y-auto">
              {leadDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="grid grid-cols-[1fr_200px_120px] gap-4 px-4 py-3 hover:bg-muted/50 transition-colors group"
                >
                  {/* Name Column */}
                  <div className="flex items-center gap-3 min-w-0">
                    <Folder className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                    <span className="text-sm font-medium truncate">
                      {doc.document_name}
                    </span>
                  </div>

                  {/* Updated Column */}
                  <div className="flex items-center text-sm text-muted-foreground">
                    {format(new Date(doc.created_at), 'MMM d, yyyy')} by Loan Processing
                  </div>

                  {/* Size Column */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {formatFileSize(doc.file_size)}
                    </span>
                    
                    {/* Action Buttons (visible on hover) */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
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
                        className="h-7 w-7 p-0"
                      >
                        <Link className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                      >
                        <Share className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                      >
                        <CheckSquare className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
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
