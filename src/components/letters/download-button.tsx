'use client';

import { useState } from 'react';
import { FileText, Download, Loader } from 'lucide-react';

interface DownloadButtonProps {
  format: 'pdf' | 'docx';
  letterContent: string;
  metadata: {
    title?: string;
    company?: string;
    position?: string;
    [key: string]: any;
  };
  className?: string;
}

export default function DownloadButton({
  format,
  letterContent,
  metadata,
  className = ''
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      setError(null);

      console.log(`Starting ${format} download...`);

      // Anropa API:et för att generera dokumentet
      const response = await fetch('/api/letters/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: letterContent,
          format,
          metadata
        }),
      });

      if (!response.ok) {
        console.error(`Download failed with status: ${response.status}`);
        let errorMessage = `Kunde inte ladda ned som ${format.toUpperCase()}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        
        throw new Error(errorMessage);
      }

      // Kontrollera att responsen innehåller data
      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error(`Tomma data returnerades för ${format.toUpperCase()}`);
      }
      
      console.log(`Downloaded ${format} with size: ${blob.size} bytes`);

      // Ladda ned filen
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${metadata.title || 'Ansökningsbrev'}.${format}`;
      document.body.appendChild(a);
      a.click();
      
      // Rensa upp
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error(`${format.toUpperCase()} download error:`, error);
      setError(error.message || `Kunde inte ladda ned som ${format.toUpperCase()}`);
      
      // Visa felmeddelandet i 5 sekunder
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setIsDownloading(false);
    }
  };

  const getButtonStyle = () => {
    const baseStyle = "px-4 py-2 text-white rounded-md flex items-center justify-center transition-colors";
    
    if (format === 'pdf') {
      return `${baseStyle} bg-orange-600 hover:bg-orange-700 ${className}`;
    } else if (format === 'docx') {
      return `${baseStyle} bg-purple-600 hover:bg-purple-700 ${className}`;
    }
    
    return baseStyle;
  };

  return (
    <div>
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className={getButtonStyle()}
      >
        {isDownloading ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            Laddar...
          </>
        ) : (
          <>
            {format === 'pdf' ? (
              <FileText className="w-4 h-4 mr-2" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {format.toUpperCase()}
          </>
        )}
      </button>
      
      {error && (
        <div className="mt-2 text-sm text-red-500">
          {error}
        </div>
      )}
    </div>
  );
}