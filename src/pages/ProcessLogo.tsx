import React, { useEffect, useState } from 'react';
import { removeBackground, loadImage } from '@/lib/remove-background';
import { Button } from '@/components/ui/button';
import logoImage from '@/assets/loanflow-logo.png';

export default function ProcessLogo() {
  const [processing, setProcessing] = useState(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);

  const processLogo = async () => {
    try {
      setProcessing(true);
      console.log('Fetching logo image...');
      
      // Fetch the logo image
      const response = await fetch(logoImage);
      const blob = await response.blob();
      
      // Load image
      const img = await loadImage(blob);
      
      // Remove background
      const transparentBlob = await removeBackground(img);
      
      // Create URL for display and download
      const url = URL.createObjectURL(transparentBlob);
      setProcessedUrl(url);
      
      console.log('Background removed successfully!');
    } catch (error) {
      console.error('Error processing logo:', error);
    } finally {
      setProcessing(false);
    }
  };

  const downloadImage = () => {
    if (processedUrl) {
      const a = document.createElement('a');
      a.href = processedUrl;
      a.download = 'loanflow-logo-transparent.png';
      a.click();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-4">
      <h1 className="text-2xl font-bold">Logo Background Removal</h1>
      
      <div className="flex gap-4">
        <Button onClick={processLogo} disabled={processing}>
          {processing ? 'Processing...' : 'Remove Background'}
        </Button>
        {processedUrl && (
          <Button onClick={downloadImage}>
            Download Transparent Logo
          </Button>
        )}
      </div>

      {processedUrl && (
        <div className="mt-8 p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Processed Logo (Transparent):</h2>
          <div className="bg-gray-200 dark:bg-gray-800 p-4 rounded" style={{ 
            backgroundImage: 'repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 20px 20px'
          }}>
            <img src={processedUrl} alt="Transparent logo" className="max-w-md" />
          </div>
        </div>
      )}
    </div>
  );
}
