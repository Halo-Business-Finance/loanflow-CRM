import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Eye,
  Download,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// File validation schema
const fileValidationSchema = z.object({
  file: z.custom<File>((file) => file instanceof File, {
    message: 'Please select a file',
  }),
  documentType: z.string().min(1, 'Document type is required'),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

// Allowed file types with MIME types
const ALLOWED_FILE_TYPES = {
  'application/pdf': { ext: 'PDF', icon: '📄', description: 'PDF Document' },
  'application/msword': { ext: 'DOC', icon: '📝', description: 'Word Document' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { 
    ext: 'DOCX', icon: '📝', description: 'Word Document' 
  },
  'application/vnd.ms-excel': { ext: 'XLS', icon: '📊', description: 'Excel Spreadsheet' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { 
    ext: 'XLSX', icon: '📊', description: 'Excel Spreadsheet' 
  },
  'image/jpeg': { ext: 'JPG', icon: '🖼️', description: 'JPEG Image' },
  'image/png': { ext: 'PNG', icon: '🖼️', description: 'PNG Image' },
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Required loan documents
const REQUIRED_DOCUMENTS = [
  { id: 'tax-returns', label: 'Business Tax Returns (2 years)', required: true },
  { id: 'personal-tax', label: 'Personal Tax Returns (2 years)', required: true },
  { id: 'financial-statements', label: 'P&L and Balance Sheet', required: true },
  { id: 'bank-statements', label: 'Bank Statements (3 months)', required: true },
  { id: 'debt-schedule', label: 'Debt Schedule and Notes', required: true },
  { id: 'loan-app', label: 'Loan Application & Driver\'s License', required: true },
  { id: 'ar-ap', label: 'AR & AP', required: false },
  { id: 'projections', label: 'Projections, Resume & Business Plan', required: false },
  { id: 'sba-docs', label: 'SBA & Bank Documents', required: false },
  { id: 'corp-docs', label: 'Corp Articles, Operating Agreement & EIN', required: false },
];

interface UploadedDocument {
  id: string;
  document_type: string;
  document_name: string;
  file_size: number;
  file_mime_type: string;
  status: string;
  uploaded_at: string;
  notes?: string;
  file_path?: string;
}

interface LoanDocumentSubmissionProps {
  leadId: string;
  contactEntityId: string;
  leadName: string;
}

export function LoanDocumentSubmission({ 
  leadId, 
  contactEntityId, 
  leadName 
}: LoanDocumentSubmissionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [notes, setNotes] = useState('');
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    fetchUploadedDocuments();
  }, [leadId]);

  const fetchUploadedDocuments = async () => {
    if (!user || !leadId) return;

    try {
      const { data, error } = await supabase
        .from('lead_documents')
        .select('*')
        .eq('lead_id', leadId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setUploadedDocs(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!Object.keys(ALLOWED_FILE_TYPES).includes(file.type)) {
      return `Invalid file type. Allowed types: ${Object.values(ALLOWED_FILE_TYPES)
        .map(t => t.ext)
        .join(', ')}`;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds maximum limit of ${(MAX_FILE_SIZE / (1024 * 1024)).toFixed(0)}MB`;
    }

    // Check filename for special characters
    const invalidChars = /[<>:"/\\|?*\x00-\x1f]/g;
    if (invalidChars.test(file.name)) {
      return 'Filename contains invalid characters';
    }

    return null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setValidationError('');
    
    if (!file) {
      setSelectedFile(null);
      return;
    }

    const error = validateFile(file);
    if (error) {
      setValidationError(error);
      toast({
        title: 'Invalid File',
        description: error,
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedDocType || !user) {
      setValidationError('Please select a file and document type');
      return;
    }

    // Validate with zod schema
    try {
      fileValidationSchema.parse({
        file: selectedFile,
        documentType: selectedDocType,
        notes: notes || undefined,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        setValidationError(error.errors[0].message);
        return;
      }
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Generate secure file path
      const timestamp = Date.now();
      const sanitizedFileName = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}_${sanitizedFileName}`;
      const filePath = `${user.id}/${leadId}/${fileName}`;

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('lead-documents')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      clearInterval(progressInterval);
      setUploadProgress(95);

      if (uploadError) throw uploadError;

      // Create database record
      const { error: dbError } = await supabase
        .from('lead_documents')
        .insert({
          lead_id: leadId,
          contact_entity_id: contactEntityId,
          user_id: user.id,
          document_name: selectedFile.name,
          document_type: selectedDocType,
          file_path: filePath,
          file_size: selectedFile.size,
          file_mime_type: selectedFile.type,
          status: 'pending',
          notes: notes || null,
        });

      if (dbError) throw dbError;

      setUploadProgress(100);

      toast({
        title: 'Success',
        description: `${selectedFile.name} uploaded successfully`,
      });

      // Reset form
      setSelectedFile(null);
      setSelectedDocType('');
      setNotes('');
      setValidationError('');
      
      // Refresh documents list
      await fetchUploadedDocuments();

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload document',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (docId: string, filePath?: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      // Delete from storage
      if (filePath) {
        await supabase.storage
          .from('lead-documents')
          .remove([filePath]);
      }

      // Delete from database
      const { error } = await supabase
        .from('lead_documents')
        .delete()
        .eq('id', docId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Document deleted successfully',
      });

      await fetchUploadedDocuments();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete document',
        variant: 'destructive',
      });
    }
  };

  const getCompletionStatus = () => {
    const requiredDocs = REQUIRED_DOCUMENTS.filter(d => d.required);
    const uploadedRequired = requiredDocs.filter(doc => 
      uploadedDocs.some(up => up.document_type === doc.label)
    );
    return {
      total: requiredDocs.length,
      completed: uploadedRequired.length,
      percentage: Math.round((uploadedRequired.length / requiredDocs.length) * 100),
    };
  };

  const status = getCompletionStatus();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Loan Document Submission</CardTitle>
              <CardDescription>
                Upload required documents for {leadName}
              </CardDescription>
            </div>
            <Badge variant={status.completed === status.total ? 'default' : 'secondary'}>
              {status.completed} of {status.total} Required
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Completion Progress</span>
              <span className="font-medium">{status.percentage}%</span>
            </div>
            <Progress value={status.percentage} className="h-2" />
          </div>

          {/* Upload Section */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
            <div className="space-y-2">
              <Label htmlFor="doc-type" className="text-sm font-medium">
                Document Type <span className="text-destructive">*</span>
              </Label>
              <select
                id="doc-type"
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="">Select document type...</option>
                {REQUIRED_DOCUMENTS.map((doc) => (
                  <option key={doc.id} value={doc.label}>
                    {doc.label} {doc.required && '*'}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file-upload" className="text-sm font-medium">
                Select File <span className="text-destructive">*</span>
              </Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/30 transition-colors">
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {selectedFile ? (
                    <div className="flex items-center gap-3 justify-center">
                      <FileText className="h-8 w-8 text-primary" />
                      <div className="text-left">
                        <div className="font-medium">{selectedFile.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedFile(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                      <div className="text-sm">
                        <span className="font-medium text-primary">Click to upload</span>
                        {' '}or drag and drop
                      </div>
                      <div className="text-xs text-muted-foreground">
                        PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (max 10MB)
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any relevant notes..."
                maxLength={500}
                rows={3}
              />
              <div className="text-xs text-muted-foreground text-right">
                {notes.length}/500
              </div>
            </div>

            {validationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}

            {uploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} />
                <p className="text-sm text-center text-muted-foreground">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={!selectedFile || !selectedDocType || uploading}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </div>

          {/* Uploaded Documents */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Uploaded Documents</h3>
            {uploadedDocs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No documents uploaded yet
              </div>
            ) : (
              <div className="space-y-2">
                {uploadedDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/20"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{doc.document_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {doc.document_type} • {(doc.file_size / 1024).toFixed(2)} KB
                        </div>
                      </div>
                      <Badge variant={doc.status === 'verified' ? 'default' : 'secondary'}>
                        {doc.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(doc.id, doc.file_path)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
