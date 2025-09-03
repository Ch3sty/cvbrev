'use client';

import { useState } from 'react';
import { FileText, Download, Loader, Eye, X, ChevronDown } from 'lucide-react';
import { TemplateType } from '@/lib/pdf/letter-templates';

interface DownloadButtonProps {
  format: 'pdf' | 'docx';
  letterContent: string;
  metadata: {
    title?: string;
    company?: string;
    position?: string;
    job_title?: string;
    [key: string]: any;
  };
  className?: string;
  showTemplateSelector?: boolean;
  showPreview?: boolean;
  onLoadingChange?: (isLoading: boolean, message?: string) => void; // Ny prop för loading-feedback
}

export default function DownloadButton({
  format,
  letterContent,
  metadata,
  className = '',
  showTemplateSelector = true,
  showPreview = true,
  onLoadingChange
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('formal');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);

  const templateOptions = [
    { value: 'formal' as TemplateType, label: 'Formell', description: 'Klassisk formell brevmall enligt svenska standarder' },
    { value: 'modern' as TemplateType, label: 'Modern', description: 'Modern och ren brevmall med elegant typografi' },
    { value: 'semi-formal' as TemplateType, label: 'Semi-formell', description: 'Balanserad brevmall mellan formell och modern stil' }
  ];

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      setError(null);
      
      // Notifiera parent om loading-start
      if (onLoadingChange) {
        onLoadingChange(true, `Genererar ${format.toUpperCase()}, detta kan ta några sekunder...`);
      }

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
          metadata,
          template: format === 'pdf' ? selectedTemplate : undefined
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
      
      // Notifiera parent om framgång
      if (onLoadingChange) {
        setTimeout(() => onLoadingChange(false, `${format.toUpperCase()} har laddats ned!`), 100);
      }
    } catch (error: any) {
      console.error(`${format.toUpperCase()} download error:`, error);
      setError(error.message || `Kunde inte ladda ned som ${format.toUpperCase()}`);
      
      // Notifiera parent om fel
      if (onLoadingChange) {
        onLoadingChange(false, error.message || `Kunde inte ladda ned som ${format.toUpperCase()}`);
      }
      
      // Visa felmeddelandet i 5 sekunder
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePreview = async () => {
    if (format !== 'pdf') return; // Preview endast för PDF
    
    try {
      setIsGeneratingPreview(true);
      setError(null);
      
      // Notifiera parent om preview-generering
      if (onLoadingChange) {
        onLoadingChange(true, 'Genererar förhandsvisning...');
      }

      const response = await fetch('/api/letters/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: letterContent,
          metadata,
          template: selectedTemplate
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kunde inte generera förhandsvisning');
      }

      const data = await response.json();
      
      if (data.fallback) {
        setError('Förhandsvisning inte tillgänglig - PDF kommer att genereras direkt');
        setTimeout(() => {
          setError(null);
        }, 3000);
        return;
      }
      
      setPreviewImage(data.preview);
      setShowPreviewModal(true);
      
      // Notifiera parent att preview är klar
      if (onLoadingChange) {
        onLoadingChange(false);
      }
    } catch (error: any) {
      console.error('Preview error:', error);
      setError(error.message || 'Kunde inte generera förhandsvisning');
      
      // Notifiera parent om fel
      if (onLoadingChange) {
        onLoadingChange(false, error.message || 'Kunde inte generera förhandsvisning');
      }
      
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const closePreview = () => {
    setShowPreviewModal(false);
    setPreviewImage(null);
  };

  const getButtonStyle = () => {
    const baseStyle = "px-3 py-2 text-sm font-medium text-white rounded-md flex items-center justify-center transition-colors border";
    
    if (format === 'pdf') {
      return `${baseStyle} bg-pink-600 hover:bg-pink-700 border-pink-500 hover:border-pink-400 shadow-sm ${className}`;
    } else if (format === 'docx') {
      // Förbättrad DOCX-knapp med synligare border och bättre kontrast
      return `${baseStyle} bg-blue-600 hover:bg-blue-700 border-blue-400 hover:border-blue-300 shadow-sm ${className}`;
    }
    
    return baseStyle;
  };

  return (
    <div className="space-y-3">
      {/* Template Selector för PDF */}
      {format === 'pdf' && showTemplateSelector && (
        <div className="relative">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Brevmall
          </label>
          <div className="relative">
            <button
              onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
              className="w-full px-3 py-2 text-left bg-navy-700 border border-gray-600 rounded-md text-white hover:bg-navy-600 transition-colors flex items-center justify-between"
            >
              <span>{templateOptions.find(t => t.value === selectedTemplate)?.label}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showTemplateDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showTemplateDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-navy-800 border border-gray-600 rounded-md shadow-lg z-10">
                {templateOptions.map((template) => (
                  <button
                    key={template.value}
                    onClick={() => {
                      setSelectedTemplate(template.value);
                      setShowTemplateDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-left hover:bg-navy-700 transition-colors ${
                      selectedTemplate === template.value ? 'bg-navy-700' : ''
                    }`}
                  >
                    <div className="text-white font-medium">{template.label}</div>
                    <div className="text-gray-400 text-xs">{template.description}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Action buttons */}
      <div className="flex gap-2">
        {/* Preview button för PDF */}
        {format === 'pdf' && showPreview && (
          <button
            onClick={handlePreview}
            disabled={isGeneratingPreview}
            className="px-3 py-2 text-sm font-medium text-white bg-navy-700 hover:bg-navy-600 rounded-md border border-gray-500 hover:border-gray-400 transition-colors flex items-center justify-center shadow-sm"
            title="Förhandsgranska PDF"
          >
            {isGeneratingPreview ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
        
        {/* Download button */}
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className={`flex-1 ${getButtonStyle()}`}
        >
          {isDownloading ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Laddar...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              {format === 'pdf' ? 'Ladda ned PDF' : 'Ladda ned DOCX'}
            </>
          )}
        </button>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mt-2 text-sm text-red-500">
          {error}
        </div>
      )}
      
      {/* Preview Modal - Förbättrad modal med bättre design */}
      {showPreviewModal && previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-navy-800 rounded-lg max-w-5xl max-h-[95vh] overflow-hidden shadow-2xl border border-gray-700 mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <Eye className="w-5 h-5 mr-2 text-pink-400" />
                Förhandsvisning - {templateOptions.find(t => t.value === selectedTemplate)?.label}
              </h3>
              <button
                onClick={closePreview}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-navy-700"
                title="Stäng förhandsvisning"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 max-h-[75vh] overflow-auto">
              <div className="bg-white rounded-lg p-4 shadow-inner">
                <img
                  src={previewImage}
                  alt="Brevförhandsvisning"
                  className="max-w-full h-auto rounded border shadow-sm"
                  style={{ maxHeight: '65vh' }}
                />
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-5 border-t border-gray-700 bg-navy-900/30 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-400 text-center sm:text-left">
                Detta är en förhandsvisning av hur ditt PDF kommer att se ut.
              </div>
              <div className="flex gap-3 flex-shrink-0">
                <button
                  onClick={closePreview}
                  className="px-4 py-2 bg-navy-700 text-white rounded-md hover:bg-navy-600 transition-colors border border-gray-600"
                >
                  Stäng
                </button>
                <button
                  onClick={() => {
                    closePreview();
                    handleDownload();
                  }}
                  className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors flex items-center border border-pink-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Ladda ned PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}