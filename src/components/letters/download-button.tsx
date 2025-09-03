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
}

export default function DownloadButton({
  format,
  letterContent,
  metadata,
  className = '',
  showTemplateSelector = true,
  showPreview = true
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

  const handlePreview = async () => {
    if (format !== 'pdf') return; // Preview endast för PDF
    
    try {
      setIsGeneratingPreview(true);
      setError(null);

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
      setPreviewImage(data.preview);
      setShowPreviewModal(true);
    } catch (error: any) {
      console.error('Preview error:', error);
      setError(error.message || 'Kunde inte generera förhandsvisning');
      
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
    const baseStyle = "px-4 py-2 text-white rounded-md flex items-center justify-center transition-colors";
    
    if (format === 'pdf') {
      return `${baseStyle} bg-orange-600 hover:bg-orange-700 ${className}`;
    } else if (format === 'docx') {
      return `${baseStyle} bg-purple-600 hover:bg-purple-700 ${className}`;
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
            className="px-3 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
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
              {format === 'pdf' ? (
                <FileText className="w-4 h-4 mr-2" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {format.toUpperCase()}
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
      
      {/* Preview Modal */}
      {showPreviewModal && previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
          <div className="bg-navy-800 rounded-lg max-w-4xl max-h-[90vh] overflow-hidden shadow-xl border border-gray-700">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Eye className="w-5 h-5 mr-2 text-blue-400" />
                Förhandsvisning - {templateOptions.find(t => t.value === selectedTemplate)?.label}
              </h3>
              <button
                onClick={closePreview}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-4">
              <div className="bg-white rounded-md p-2 shadow-inner">
                <img
                  src={previewImage}
                  alt="Brief preview"
                  className="max-w-full h-auto rounded border"
                  style={{ maxHeight: '70vh' }}
                />
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-700 bg-navy-900/30 flex justify-between">
              <div className="text-sm text-gray-400">
                Detta är en förhandsvisning av hur ditt PDF kommer att se ut.
              </div>
              <div className="flex gap-2">
                <button
                  onClick={closePreview}
                  className="px-4 py-2 bg-navy-700 text-white rounded-md hover:bg-navy-600 transition-colors"
                >
                  Stäng
                </button>
                <button
                  onClick={() => {
                    closePreview();
                    handleDownload();
                  }}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors flex items-center"
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