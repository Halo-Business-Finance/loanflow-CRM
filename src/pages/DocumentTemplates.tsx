import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Download, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StandardPageLayout } from "@/components/StandardPageLayout"
import { StandardPageHeader } from "@/components/StandardPageHeader"
import { TemplateUploadModal } from "@/components/TemplateUploadModal"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useRoleBasedAccess } from "@/hooks/useRoleBasedAccess"
import { format } from "date-fns"

interface DocumentTemplate {
  id: string
  name: string
  description: string | null
  template_type: string
  file_path: string
  file_format: string
  file_size: number | null
  usage_count: number
  is_active: boolean
  created_at: string
  updated_at: string
  last_modified: string
}

export default function DocumentTemplates() {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const { toast } = useToast()
  const { canAccessAdminFeatures } = useRoleBasedAccess()

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTemplates(data || [])
    } catch (error: any) {
      console.error('Error fetching templates:', error)
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (template: DocumentTemplate) => {
    try {
      // Increment usage count
      await supabase.rpc('increment_template_usage', { template_id: template.id })

      // Get download URL
      const { data } = supabase.storage
        .from('document-templates')
        .getPublicUrl(template.file_path)

      // Download the file
      window.open(data.publicUrl, '_blank')

      toast({
        title: "Success",
        description: "Template downloaded successfully"
      })
    } catch (error: any) {
      console.error('Download error:', error)
      toast({
        title: "Error",
        description: "Failed to download template",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (templateId: string, filePath: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('document-templates')
        .remove([filePath])

      if (storageError) throw storageError

      // Delete from database
      const { error: dbError } = await supabase
        .from('document_templates')
        .delete()
        .eq('id', templateId)

      if (dbError) throw dbError

      toast({
        title: "Success",
        description: "Template deleted successfully"
      })

      fetchTemplates()
    } catch (error: any) {
      console.error('Delete error:', error)
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive"
      })
    }
  }

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return 'Unknown'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getTemplateTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      "Business Tax Returns": "Business Tax Returns",
      "Personal Tax Returns": "Personal Tax Returns",
      "P&L and Balance Sheet": "P&L and Balance Sheet",
      "Bank Statements": "Bank Statements",
      "Debt Schedule and Notes": "Debt Schedule and Notes",
      "Loan Application & Driver's License": "Loan Application & Driver's License",
      "AR & AP": "AR & AP",
      "Projections, Resume & Business Plan": "Projections, Resume & Business Plan",
      "SBA & Bank Documents": "SBA & Bank Documents",
      "Corp Articles, Operating Agreement & EIN Form": "Corp Articles, Operating Agreement & EIN Form",
      "Miscellaneous": "Miscellaneous"
    }
    return labels[type] || type
  }

  return (
    <StandardPageLayout>
      <StandardPageHeader
        title="Document Templates"
        description="Manage and customize loan document templates"
        actions={
          canAccessAdminFeatures() && (
            <Button onClick={() => setShowUploadModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          )
        }
      />

      <div className="p-6">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-full" />
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No templates available</p>
              <p className="text-sm text-muted-foreground mb-4">
                {canAccessAdminFeatures() ? "Upload your first template to get started" : "Templates will appear here once uploaded"}
              </p>
              {canAccessAdminFeatures() && (
                <Button onClick={() => setShowUploadModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Template
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span className="line-clamp-1">{template.name}</span>
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {template.description || getTemplateTypeLabel(template.template_type)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Type: {getTemplateTypeLabel(template.template_type)}</p>
                      <p>Size: {formatFileSize(template.file_size)}</p>
                      <p>Format: {template.file_format.toUpperCase()}</p>
                      <p>Last modified: {format(new Date(template.last_modified), 'MMM d, yyyy')}</p>
                      <p>Used: {template.usage_count} times</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleDownload(template)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      {canAccessAdminFeatures() && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(template.id, template.file_path)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {canAccessAdminFeatures() && (
        <TemplateUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onSuccess={fetchTemplates}
        />
      )}
    </StandardPageLayout>
  )
}
