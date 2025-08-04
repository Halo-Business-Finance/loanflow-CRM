import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, ExternalLink, FileText, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LeadDocument } from '@/hooks/useDocuments';

// Adobe DC View SDK types
declare global {
  interface Window {
    AdobeDC?: {
      View: new (config: { clientId: string; divId: string }) => {
        previewFile: (
          fileConfig: {
            content: { location: { url: string } };
            metaData: { fileName: string };
          },
          viewerConfig: {
            embedMode: string;
            showAnnotationTools: boolean;
            showLeftHandPanel: boolean;
            showDownloadPDF: boolean;
            showPrintPDF: boolean;
            showTopToolbar: boolean;
            defaultViewMode: string;
          }
        ) => void;
      };
    };
  }
}

interface DocumentViewerProps {
  document: LeadDocument | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentViewer({ document, isOpen, onClose }: DocumentViewerProps) {
  const [loading, setLoading] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [viewerError, setViewerError] = useState(false);
  const [adobeConfig, setAdobeConfig] = useState<{clientId: string, isDemo: boolean} | null>(null);
  const [adobeView, setAdobeView] = useState<any>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Determine file types
  const isPdf = document?.file_mime_type?.includes('pdf') || document?.document_name?.toLowerCase().endsWith('.pdf');
  const isWordDoc = document?.file_mime_type?.includes('word') || 
                   document?.file_mime_type?.includes('document') ||
                   document?.document_name?.toLowerCase().match(/\.(doc|docx)$/);
  const isImage = document?.file_mime_type?.startsWith('image/');

  const getDocumentUrl = async (filePath: string) => {
    try {
      setLoading(true);
      console.log('Getting document URL for:', filePath);
      
      // Try downloading the file and creating a blob URL to avoid CORS issues
      try {
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('lead-documents')
          .download(filePath);

        if (!downloadError && fileData) {
          console.log('Successfully downloaded file, creating blob URL');
          const blobUrl = URL.createObjectURL(fileData);
          setDocumentUrl(blobUrl);
          return blobUrl;
        }
      } catch (e) {
        console.log('Download method failed, trying public URL');
      }
      
      // Fallback to public URL
      const publicUrl = `https://gshxxsniwytjgcnthyfq.supabase.co/storage/v1/object/public/lead-documents/${filePath}`;
      console.log('Trying public URL:', publicUrl);
      
      // Test if the public URL works
      try {
        const response = await fetch(publicUrl, { method: 'HEAD' });
        if (response.ok) {
          console.log('Public URL works, using it');
          setDocumentUrl(publicUrl);
          return publicUrl;
        }
      } catch (e) {
        console.log('Public URL failed, trying signed URL');
      }
      
      // Final fallback to signed URL
      const { data, error } = await supabase.storage
        .from('lead-documents')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) {
        console.error('Supabase storage error:', error);
        throw error;
      }
      
      console.log('Successfully got signed URL');
      setDocumentUrl(data.signedUrl);
      return data.signedUrl;
    } catch (error) {
      console.error('Error getting document URL:', error);
      toast({
        title: "Error",
        description: "Failed to load document. You can still download it.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get Adobe configuration
  const getAdobeConfig = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-adobe-config');
      if (error) throw error;
      console.log('Adobe config retrieved:', data);
      setAdobeConfig(data);
      return data;
    } catch (error) {
      console.error('Error getting Adobe config:', error);
      // Fallback to demo config
      const fallbackConfig = { clientId: 'dc-pdf-embed-demo', isDemo: true };
      setAdobeConfig(fallbackConfig);
      return fallbackConfig;
    }
  };

  // Load Adobe PDF SDK
  const loadAdobeSDK = () => {
    return new Promise<void>((resolve, reject) => {
      if (window.AdobeDC) {
        resolve();
        return;
      }

      const script = window.document.createElement('script');
      script.src = 'https://acrobatservices.adobe.com/view-sdk/viewer.js';
      script.onload = () => {
        console.log('Adobe PDF SDK loaded successfully');
        resolve();
      };
      script.onerror = () => {
        console.error('Failed to load Adobe PDF SDK');
        reject(new Error('Failed to load Adobe PDF SDK'));
      };
      window.document.head.appendChild(script);
    });
  };

  // Initialize Adobe PDF Viewer
  const initializeAdobeViewer = async (url: string) => {
    try {
      if (!adobeConfig) {
        const config = await getAdobeConfig();
        if (!config) throw new Error('No Adobe config available');
      }

      await loadAdobeSDK();

      if (!window.AdobeDC || !viewerRef.current) {
        throw new Error('Adobe SDK not available or viewer container not ready');
      }

      // Clear previous viewer
      if (viewerRef.current) {
        viewerRef.current.innerHTML = '';
      }

      const adobeDCView = new window.AdobeDC.View({
        clientId: adobeConfig?.clientId || 'dc-pdf-embed-demo',
        divId: 'adobe-dc-view'
      });

      console.log('Initializing Adobe PDF viewer with URL:', url);

      adobeDCView.previewFile({
        content: { location: { url } },
        metaData: { fileName: document?.document_name || 'document.pdf' }
      }, {
        embedMode: 'SIZED_CONTAINER',
        showAnnotationTools: false,
        showLeftHandPanel: true,
        showDownloadPDF: true,
        showPrintPDF: true,
        showTopToolbar: true,
        defaultViewMode: 'FIT_PAGE'
      });

      setAdobeView(adobeDCView);
      console.log('Adobe PDF viewer initialized successfully');
      
    } catch (error) {
      console.error('Error initializing Adobe viewer:', error);
      setViewerError(true);
      toast({
        title: "PDF Viewer Error",
        description: "Failed to load Adobe PDF viewer. Please try downloading the document.",
        variant: "destructive",
      });
    }
  };

  const downloadDocument = async () => {
    if (!document?.file_path) return;

    try {
      console.log('Downloading document:', document.file_path);
      const { data, error } = await supabase.storage
        .from('lead-documents')
        .download(document.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.document_name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Document downloaded successfully",
      });
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive",
      });
    }
  };

  const openInNewTab = async () => {
    if (!document?.file_path) return;
    
    const url = await getDocumentUrl(document.file_path);
    if (url) {
      window.open(url, '_blank');
    }
  };

  // Load document URL when modal opens
  useEffect(() => {
    if (isOpen && document?.file_path && !documentUrl) {
      getDocumentUrl(document.file_path);
    }
    if (!isOpen) {
      setDocumentUrl(null);
      setViewerError(false);
      setAdobeView(null);
      // Clear Adobe viewer container
      if (viewerRef.current) {
        viewerRef.current.innerHTML = '';
      }
    }
  }, [isOpen, document?.file_path, documentUrl]);

  // Initialize Adobe viewer when document URL is ready
  useEffect(() => {
    if (isOpen && documentUrl && isPdf && !viewerError && !adobeView) {
      console.log('Document URL ready, initializing Adobe viewer...');
      initializeAdobeViewer(documentUrl);
    }
  }, [isOpen, documentUrl, isPdf, viewerError, adobeView]);

  // Helper function to format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size'
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  };

  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] w-[90vw]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DialogTitle className="text-lg font-semibold">
                {document.document_name}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {document.document_type}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {document.file_mime_type || 'Unknown type'}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {formatFileSize(document.file_size)}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadDocument}
                className="gap-1"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={openInNewTab}
                className="gap-1"
              >
                <ExternalLink className="h-4 w-4" />
                Open in Browser
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="gap-1"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading document...</span>
            </div>
          ) : documentUrl ? (
            <div className="h-[70vh] border rounded-lg overflow-hidden relative">
              {isPdf ? (
                <div className="w-full h-full bg-gray-50 flex flex-col">
                  <div className="flex items-center justify-between p-3 bg-white border-b">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium">PDF Document</span>
                      <Badge variant="default" className="text-xs">
                        PDF Reader: Adobe PDF Embed {adobeConfig?.isDemo ? '(Demo)' : '(Licensed)'}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => window.open(documentUrl, '_blank')}
                        className="gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Open in Browser
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadDocument}
                        className="gap-1"
                      >
                        <Download className="h-3 w-3" />
                        Download
                      </Button>
                    </div>
                  </div>
                  
                  {/* Adobe PDF Embed SDK Viewer */}
                  <div className="flex-1">
                    {viewerError ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-muted/50">
                        <div className="text-center space-y-4">
                          <div className="w-20 h-24 bg-gradient-to-b from-red-50 to-red-100 rounded-lg flex items-center justify-center mx-auto border-2 border-red-200">
                            <FileText className="h-10 w-10 text-red-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-lg">Adobe PDF Viewer Error</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              The Adobe PDF viewer encountered an issue, but you can still access the file.
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={() => window.open(documentUrl, '_blank')} className="gap-2">
                              <ExternalLink className="h-4 w-4" />
                              Open PDF in Browser
                            </Button>
                            <Button variant="outline" onClick={downloadDocument} className="gap-2">
                              <Download className="h-4 w-4" />
                              Download PDF
                            </Button>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setViewerError(false);
                              setAdobeView(null);
                              if (documentUrl) {
                                initializeAdobeViewer(documentUrl);
                              }
                            }}
                            className="gap-1"
                          >
                            <Loader2 className="h-3 w-3" />
                            Try Again
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        id="adobe-dc-view" 
                        ref={viewerRef}
                        className="w-full h-full"
                        style={{ minHeight: '500px' }}
                      />
                    )}
                  </div>
                </div>
              ) : isImage ? (
                <div className="w-full h-full flex items-center justify-center bg-muted/50">
                  <img
                    src={documentUrl}
                    alt={document.document_name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : isWordDoc ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-muted/50">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-24 bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg flex items-center justify-center mx-auto border-2 border-blue-200">
                      <FileText className="h-10 w-10 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">{document.document_name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatFileSize(document.file_size)} • Word Document
                      </p>
                    </div>
                    <p className="text-muted-foreground max-w-md">
                      Word documents cannot be previewed directly. Click "Open in Browser" to view or download the file.
                    </p>
                    <div className="flex gap-2">
                      <Button onClick={() => window.open(documentUrl, '_blank')} className="gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Open in Browser
                      </Button>
                      <Button variant="outline" onClick={downloadDocument} className="gap-2">
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-muted/50">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-24 bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg flex items-center justify-center mx-auto border-2 border-gray-200">
                      <FileText className="h-10 w-10 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">{document.document_name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatFileSize(document.file_size)} • {document.file_mime_type || 'Unknown type'}
                      </p>
                    </div>
                    <p className="text-muted-foreground max-w-md">
                      This file type cannot be previewed directly. You can download or try opening in a new tab.
                    </p>
                    <div className="flex gap-2">
                      <Button onClick={downloadDocument} className="gap-2">
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                      <Button variant="outline" onClick={() => window.open(documentUrl, '_blank')} className="gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Try in Browser
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-96">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">Failed to load document</p>
                <Button onClick={() => document?.file_path && getDocumentUrl(document.file_path)} variant="outline">
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>

        {document.notes && (
          <div className="border-t pt-4">
            <div className="text-sm text-muted-foreground mb-1">Notes:</div>
            <div className="text-sm">{document.notes}</div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}