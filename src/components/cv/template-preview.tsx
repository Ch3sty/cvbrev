'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, Eye, AlertCircle, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CVTemplateType, CVMetadata } from '@/lib/cv/cv-metadata';

interface TemplatePreviewProps {
  templateId: CVTemplateType | null;
  cvData: any; // CV data from store
  onPreviewReady?: (isReady: boolean) => void;
  className?: string;
}

interface PreviewCache {
  [key: string]: {
    imageUrl: string;
    timestamp: number;
    error?: string;
  };
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const PREVIEW_WIDTH = 794;
const PREVIEW_HEIGHT = 1123;

export default function TemplatePreview({ 
  templateId, 
  cvData, 
  onPreviewReady,
  className = "" 
}: TemplatePreviewProps) {
  // State management
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cacheRef = useRef<PreviewCache>({});
  const abortControllerRef = useRef<AbortController | null>(null);

  // Generate cache key for template and CV combination
  const generateCacheKey = useCallback((templateId: string, cvId: string): string => {
    return `${templateId}_${cvId}_${Date.now().toString(36)}`;
  }, []);

  // Clean expired cache entries
  const cleanCache = useCallback(() => {
    const now = Date.now();
    Object.keys(cacheRef.current).forEach(key => {
      if (now - cacheRef.current[key].timestamp > CACHE_DURATION) {
        // Revoke blob URL to prevent memory leaks
        if (cacheRef.current[key].imageUrl.startsWith('blob:')) {
          URL.revokeObjectURL(cacheRef.current[key].imageUrl);
        }
        delete cacheRef.current[key];
      }
    });
  }, []);

  // Generate preview image from HTML
  const generatePreviewImage = useCallback(async (
    templateId: CVTemplateType, 
    cvData: any
  ): Promise<string> => {
    const cacheKey = generateCacheKey(templateId, cvData?.id || 'default');
    
    // Check cache first
    cleanCache();
    const cached = cacheRef.current[cacheKey];
    if (cached && !cached.error) {
      return cached.imageUrl;
    }

    // Cancel previous request if still running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();

    try {
      // Generate preview HTML with actual CV data or mock data
      const mockCvMetadata: CVMetadata = {
        personalInfo: {
          fullName: cvData?.file_name?.replace(/\.[^/.]+$/, '') || 'Förhandsvisning',
          email: 'exempel@email.se',
          phone: '070-123 45 67',
          address: 'Stockholm, Sverige',
          linkedIn: '',
          website: '',
          github: ''
        },
        summary: cvData?.cv_text?.substring(0, 200) + '...' || 'Detta är en förhandsvisning av hur ditt CV kommer att se ut med denna mall...',
        experience: [{
          position: 'Tidigare roller',
          company: 'Ditt CV-innehåll här',
          location: 'Stockholm',
          startDate: '2020-01-01',
          description: ['Se ditt riktiga CV-innehåll i den färdiga PDF:en'],
          achievements: []
        }],
        education: [{
          degree: 'Din utbildning',
          institution: 'Visas här i den färdiga PDF:en',
          location: 'Stockholm',
          graduationYear: '2020'
        }],
        skills: [{
          category: 'Dina färdigheter',
          skills: ['Visas här i den färdiga PDF:en']
        }],
        projects: [],
        certifications: [],
        languages: [],
        interests: [],
        references: 'Referenser lämnas på begäran'
      };

      // Request preview generation from API
      const response = await fetch('/api/cv/generate-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template: templateId,
          cvData: mockCvMetadata,
          options: {
            width: PREVIEW_WIDTH,
            height: PREVIEW_HEIGHT,
            format: 'png'
          }
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`Preview generation failed: ${response.status}`);
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);

      // Cache the result
      cacheRef.current[cacheKey] = {
        imageUrl,
        timestamp: Date.now()
      };

      return imageUrl;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Preview generation was cancelled');
      }
      
      const errorMessage = error.message || 'Preview generation failed';
      
      // Cache error to prevent repeated failed requests
      cacheRef.current[cacheKey] = {
        imageUrl: '',
        timestamp: Date.now(),
        error: errorMessage
      };
      
      throw new Error(errorMessage);
    }
  }, [generateCacheKey, cleanCache]);

  // Main preview generation function
  const generatePreview = useCallback(async () => {
    if (!templateId || !cvData) {
      setPreviewImage(null);
      setError(null);
      onPreviewReady?.(false);
      return;
    }

    setIsGenerating(true);
    setError(null);
    onPreviewReady?.(false);

    try {
      const imageUrl = await generatePreviewImage(templateId, cvData);
      setPreviewImage(imageUrl);
      onPreviewReady?.(true);
    } catch (error: any) {
      console.error('Preview generation error:', error);
      setError(error.message);
      setPreviewImage(null);
      onPreviewReady?.(false);
    } finally {
      setIsGenerating(false);
    }
  }, [templateId, cvData, generatePreviewImage, onPreviewReady]);

  // Generate preview when template or CV changes
  useEffect(() => {
    const timeoutId = setTimeout(generatePreview, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [generatePreview]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up abort controller
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Clean up blob URLs
      Object.values(cacheRef.current).forEach(cached => {
        if (cached.imageUrl.startsWith('blob:')) {
          URL.revokeObjectURL(cached.imageUrl);
        }
      });
    };
  }, []);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Render loading state
  if (isGenerating) {
    return (
      <div className={`bg-navy-900/50 rounded-lg p-4 border border-navy-600 ${className}`}>
        <div className="flex items-center justify-center h-96 text-gray-400">
          <div className="text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-pink-500" />
            <p className="text-lg font-medium mb-2">Genererar förhandsvisning...</p>
            <p className="text-sm text-gray-500">Detta kan ta några sekunder</p>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={`bg-navy-900/50 rounded-lg p-4 border border-navy-600 ${className}`}>
        <div className="flex items-center justify-center h-96 text-gray-400">
          <div className="text-center max-w-sm">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <p className="text-lg font-medium mb-2 text-red-400">Fel vid förhandsvisning</p>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <Button 
              onClick={generatePreview}
              variant="outline"
              size="sm"
              className="border-navy-600 hover:bg-navy-700"
            >
              Försök igen
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render empty state
  if (!templateId) {
    return (
      <div className={`bg-navy-900/50 rounded-lg p-4 border border-navy-600 ${className}`}>
        <div className="flex items-center justify-center h-96 text-gray-400">
          <div className="text-center">
            <Eye className="w-12 h-12 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Välj en mall för förhandsvisning</p>
            <p className="text-sm text-gray-500">Förhandsvisning visas här när du väljer en CV-mall</p>
          </div>
        </div>
      </div>
    );
  }

  // Render preview image
  return (
    <>
      <div className={`bg-navy-900/50 rounded-lg p-4 border border-navy-600 relative group ${className}`}>
        {previewImage && (
          <div className="relative">
            <div className="bg-white rounded border overflow-hidden shadow-lg">
              <img
                src={previewImage}
                alt={`CV-mall förhandsvisning: ${templateId}`}
                className="w-full h-auto max-h-96 object-contain"
                style={{ aspectRatio: `${PREVIEW_WIDTH}/${PREVIEW_HEIGHT}` }}
                onError={() => setError('Kunde inte ladda förhandsvisning')}
              />
            </div>
            
            {/* Fullscreen toggle button */}
            <Button
              onClick={toggleFullscreen}
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white border-gray-300"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Fullscreen modal */}
      {isFullscreen && previewImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={previewImage}
              alt={`CV-mall förhandsvisning: ${templateId}`}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
            <Button
              onClick={toggleFullscreen}
              variant="outline"
              size="sm"
              className="absolute top-4 right-4 bg-white/90 hover:bg-white border-gray-300"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}