import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download, Eye, Upload } from "lucide-react"
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

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      verified: "default",
      rejected: "destructive"
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status}
      </Badge>
    )
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown"
    const mb = bytes / (1024 * 1024)
    return mb >= 1 ? `${mb.toFixed(2)} MB` : `${(bytes / 1024).toFixed(2)} KB`
  }

  return (
    <Card className="border-0 shadow-sm bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Borrower Documents
          </CardTitle>
          <Button
            onClick={() => setIsUploadModalOpen(true)}
            size="sm"
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <div className="text-sm text-muted-foreground py-4 text-center">
            Loading documents...
          </div>
        ) : leadDocuments.length === 0 ? (
          <div className="text-sm text-muted-foreground py-4 text-center italic">
            No documents uploaded yet
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {leadDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <p className="text-sm font-medium truncate">
                      {doc.document_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="capitalize">{doc.document_type}</span>
                    <span>•</span>
                    <span>{formatFileSize(doc.file_size)}</span>
                    <span>•</span>
                    <span>{format(new Date(doc.created_at), 'MMM d, yyyy')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                  {getStatusBadge(doc.status)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadDocument(doc)}
                    className="h-8 w-8 p-0"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
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
