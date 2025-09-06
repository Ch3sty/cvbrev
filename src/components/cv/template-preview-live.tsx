'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Loader2, Eye, AlertCircle, Maximize2, Minimize2, RefreshCw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { CVTemplateType, CVMetadata } from '@/lib/cv/cv-metadata';

interface TemplatePreviewLiveProps {
  templateId: CVTemplateType | null;
  cvData: any;
  customization?: any;
  onPreviewReady?: (isReady: boolean) => void;
  autoUpdate?: boolean;
  className?: string;
}

interface PreviewCache {
  [key: string]: {
    imageUrl: string;
    timestamp: number;
    error?: string;
  };
}

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes för live preview
const PREVIEW_UPDATE_DEBOUNCE = 500; // 500ms debounce för changes

export default function TemplatePreviewLive({ 
  templateId, 
  cvData, 
  customization,
  onPreviewReady,
  autoUpdate = true,
  className = "" 
}: TemplatePreviewLiveProps) {
  // State management
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  const [updateCount, setUpdateCount] = useState(0);
  
  // Refs
  const cacheRef = useRef<PreviewCache>({});
  const abortControllerRef = useRef<AbortController | null>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Generate enhanced cache key including customization
  const cacheKey = useMemo(() => {
    if (!templateId || !cvData?.id) return null;
    const customHash = customization ? JSON.stringify(customization) : 'default';
    return `${templateId}_${cvData.id}_${btoa(customHash ?? '').slice(0, 10)}`;
  }, [templateId, cvData?.id, customization]);

  // Clean expired cache entries
  const cleanCache = useCallback(() => {
    const now = Date.now();
    const cache = cacheRef.current;
    
    Object.keys(cache).forEach(key => {
      if (now - cache[key].timestamp > CACHE_DURATION) {
        if (cache[key].imageUrl.startsWith('blob:')) {
          URL.revokeObjectURL(cache[key].imageUrl);
        }
        delete cache[key];
      }
    });
  }, []);

  // Generate preview with optimized API call
  const generatePreview = useCallback(async (force = false) => {
    if (!templateId || !cvData?.cv_text || (!force && isGenerating)) return;

    const key = cacheKey;
    if (!key) return;

    // Check cache first (unless forced refresh)
    if (!force && cacheRef.current[key]) {
      const cached = cacheRef.current[key];
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        if (cached.error) {
          setError(cached.error);
          setPreviewImage(null);
        } else {
          setPreviewImage(cached.imageUrl);
          setError(null);
        }
        onPreviewReady?.(true);
        return;
      }
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/cv/generate-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template: templateId,
          cvData: {
            personalInfo: {
              fullName: cvData.file_name?.replace(/\.pdf$/, '') || 'Ditt namn',
              email: 'din@email.com',
              phone: '+46 70 123 45 67',
              location: 'Stockholm, Sverige'
            },
            summary: cvData.cv_text?.substring(0, 200) || 'Din professionella sammanfattning...',
            experience: [{
              company: 'Exempel AB',
              position: 'Din position',
              startDate: '2023',
              endDate: 'Nuvarande',
              description: 'Dina arbetsuppgifter och prestationer...'
            }],
            education: [{
              institution: 'Exempel Universitet',
              degree: 'Din utbildning',
              startDate: '2020',
              endDate: '2023'
            }],
            skills: ['Kompetens 1', 'Kompetens 2', 'Kompetens 3']
          },
          options: {
            colorScheme: customization?.colorScheme || 'default',
            fontSize: customization?.fontSize || 'medium',
            ...customization
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
      cleanCache();
      cacheRef.current[key] = {
        imageUrl,
        timestamp: Date.now()
      };

      setPreviewImage(imageUrl);
      setLastUpdated(Date.now());
      setUpdateCount(prev => prev + 1);
      onPreviewReady?.(true);

    } catch (error: any) {
      if (error.name !== 'AbortError') {
        const errorMessage = error.message || 'Failed to generate preview';
        setError(errorMessage);
        
        // Cache error to avoid repeated failures
        if (key) {
          cacheRef.current[key] = {
            imageUrl: '',
            timestamp: Date.now(),
            error: errorMessage
          };
        }
        
        console.error('Preview generation error:', error);
        onPreviewReady?.(false);
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  }, [templateId, cvData, customization, cacheKey, isGenerating, onPreviewReady, cleanCache]);

  // Debounced update for live changes
  const debouncedUpdate = useCallback(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      generatePreview(false);
    }, PREVIEW_UPDATE_DEBOUNCE);
  }, [generatePreview]);

  // Auto-generate preview on mount and dependencies change
  useEffect(() => {
    generatePreview(false);
  }, [templateId, cvData?.id]); // Only trigger on template or CV change

  // Live updates for customization changes
  useEffect(() => {
    if (autoUpdate && customization) {
      debouncedUpdate();
    }
  }, [customization, autoUpdate, debouncedUpdate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      
      // Cleanup blob URLs
      Object.values(cacheRef.current).forEach(cached => {
        if (cached.imageUrl.startsWith('blob:')) {
          URL.revokeObjectURL(cached.imageUrl);
        }
      });
    };
  }, []);

  // Manual refresh
  const handleRefresh = useCallback(() => {
    generatePreview(true);
  }, [generatePreview]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // Render loading state
  if (isGenerating && !previewImage) {
    return (
      <div className={`bg-navy-900/50 rounded-lg border border-navy-700 flex items-center justify-center min-h-[400px] ${className}`}>
        <div className="text-center space-y-4">
          <div className="relative">
            <Loader2 className="w-12 h-12 text-pink-500 animate-spin mx-auto" />
            {autoUpdate && (
              <Zap className="w-4 h-4 text-amber-400 absolute -top-1 -right-1" />
            )}
          </div>
          <div className="space-y-2">
            <p className="text-white font-medium">Genererar live förhandsvisning...</p>
            <p className="text-gray-400 text-sm">
              {autoUpdate ? 'Live-uppdatering aktiverad' : 'Väntar på generering'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error && !previewImage) {
    return (
      <div className={`bg-navy-900/50 rounded-lg border border-red-600/50 flex items-center justify-center min-h-[400px] ${className}`}>
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <div className="space-y-2">
            <p className="text-white font-medium">Kunde inte generera förhandsvisning</p>
            <p className="text-gray-400 text-sm">{error}</p>
            <Button 
              onClick={handleRefresh}
              variant="outline" 
              size="sm"
              className="border-red-600 text-red-400 hover:bg-red-600/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Försök igen
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`template-preview-live relative ${className}`}>
      {/* Header with controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-400 border-green-500">
            <Eye className="w-3 h-3 mr-1" />
            Live Preview
          </Badge>
          {updateCount > 1 && (
            <Badge variant="outline" className="text-blue-400 border-blue-500">
              {updateCount} uppdateringar
            </Badge>
          )}
          {isGenerating && (
            <Badge variant="outline" className="text-amber-400 border-amber-500">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Uppdaterar...
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleRefresh}
            variant="ghost"
            size="sm"
            disabled={isGenerating}
            className="text-gray-400 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            onClick={toggleFullscreen}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Preview container */}
      <div className={`preview-container relative bg-white rounded-lg overflow-hidden shadow-lg ${
        isFullscreen 
          ? 'fixed inset-4 z-50 bg-black/90 flex items-center justify-center' 
          : 'aspect-[794/1123]'
      }`}>
        {previewImage && (
          <>
            <img
              src={previewImage}
              alt={`CV Preview - ${templateId}`}
              className={`${
                isFullscreen 
                  ? 'max-h-full max-w-full object-contain' 
                  : 'w-full h-full object-contain'
              }`}
              onLoad={() => onPreviewReady?.(true)}
              onError={() => {
                setError('Kunde inte ladda förhandsvisning');
                onPreviewReady?.(false);
              }}
            />
            
            {/* Loading overlay för updates */}
            {isGenerating && (
              <div className="absolute inset-0 bg-navy-900/80 flex items-center justify-center backdrop-blur-sm">
                <div className="text-center space-y-2">
                  <Loader2 className="w-8 h-8 text-pink-500 animate-spin mx-auto" />
                  <p className="text-white text-sm">Uppdaterar...</p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Timestamp */}
        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          Uppdaterad: {new Date(lastUpdated).toLocaleTimeString()}
        </div>
      </div>

      {/* Fullscreen close overlay */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-40 bg-black/80 cursor-pointer"
          onClick={toggleFullscreen}
        />
      )}
    </div>
  );
}