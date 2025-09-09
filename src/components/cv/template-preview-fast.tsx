'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, Eye, AlertCircle, RefreshCw, Zap, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { CVTemplateType } from '@/lib/cv/cv-metadata';

interface TemplatePreviewFastProps {
  templateId: CVTemplateType | null;
  cvData: any;
  customization?: any;
  onPreviewReady?: (isReady: boolean) => void;
  className?: string;
  priority?: 'high' | 'medium' | 'low';
}

// Static fallback previews (base64 encoded thumbnails)
const STATIC_PREVIEWS: Record<CVTemplateType, string> = {
  'klassisk': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgdmlld0JveD0iMCAwIDIwMCAyODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjgwIiBmaWxsPSJ3aGl0ZSIvPgo8cmVjdCB4PSIyMCIgeT0iMjAiIHdpZHRoPSIxNjAiIGhlaWdodD0iNCIgZmlsbD0iIzEzMUIzMiIvPgo8cmVjdCB4PSIyMCIgeT0iMzQiIHdpZHRoPSIxMjAiIGhlaWdodD0iMiIgZmlsbD0iIzZCNzI4MCIvPgo8cmVjdCB4PSIyMCIgeT0iNTAiIHdpZHRoPSIxNDAiIGhlaWdodD0iMiIgZmlsbD0iIzM3NDE1MSIvPgo8cmVjdCB4PSIyMCIgeT0iNTgiIHdpZHRoPSIxMzAiIGhlaWdodD0iMiIgZmlsbD0iIzM3NDE1MSIvPgo8cmVjdCB4PSIyMCIgeT0iNzQiIHdpZHRoPSI4MCIgaGVpZ2h0PSIzIiBmaWxsPSIjRUM0ODk5Ii8+CjxyZWN0IHg9IjIwIiB5PSI5MCIgd2lkdGg9IjE0MCIgaGVpZ2h0PSIyIiBmaWxsPSIjMzc0MTUxIi8+CjxyZWN0IHg9IjIwIiB5PSI5OCIgd2lkdGg9IjEyNSIgaGVpZ2h0PSIyIiBmaWxsPSIjMzc0MTUxIi8+Cjx0ZXh0IHg9IjIwIiB5PSIxNDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzEzMUIzMiI+S2xhc3Npc2sgU3ZlbnNrPC90ZXh0Pgo8L3N2Zz4K',
  'modern': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgdmlld0JveD0iMCAwIDIwMCAyODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjgwIiBmaWxsPSJ3aGl0ZSIvPgo8cmVjdCB3aWR0aD0iMTQwIiBoZWlnaHQ9IjI4MCIgZmlsbD0iIzEzMUIzMiIvPgo8cmVjdCB4PSIxNCIgeT0iMjAiIHdpZHRoPSIxMDAiIGhlaWdodD0iNCIgZmlsbD0id2hpdGUiLz4KPHJlY3QgeD0iMTQiIHk9IjM0IiB3aWR0aD0iODAiIGhlaWdodD0iMiIgZmlsbD0iI0ZBRkFGQSIvPgo8cmVjdCB4PSIxNTAiIHk9IjIwIiB3aWR0aD0iMzAiIGhlaWdodD0iNCIgZmlsbD0iIzEzMUIzMiIvPgo8cmVjdCB4PSIxNTAiIHk9IjM0IiB3aWR0aD0iNDAiIGhlaWdodD0iMiIgZmlsbD0iIzM3NDE1MSIvPgo8dGV4dCB4PSIxNSIgeT0iMjYwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IndoaXRlIj5Nb2Rlcm4gVHbDpWtvbHVtbnM8L3RleHQ+Cjwvc3ZnPgo=',
  'minimalistisk': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgdmlld0JveD0iMCAwIDIwMCAyODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjgwIiBmaWxsPSIjRkFGQUZBIi8+CjxyZWN0IHg9IjQwIiB5PSI0MCIgd2lkdGg9IjEyMCIgaGVpZ2h0PSIzIiBmaWxsPSIjMTMxQjMyIi8+CjxyZWN0IHg9IjQwIiB5PSI1NiIgd2lkdGg9IjgwIiBoZWlnaHQ9IjEiIGZpbGw9IiM2QjcyODAiLz4KPHJlY3QgeD0iNDAiIHk9IjgwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEiIGZpbGw9IiMzNzQxNTEiLz4KPHJlY3QgeD0iNDAiIHk9Ijg4IiB3aWR0aD0iOTAiIGhlaWdodD0iMSIgZmlsbD0iIzM3NDE1MSIvPgo8bGluZSB4MT0iNDAiIHkxPSIxMDAiIHgyPSIxMDAiIHkyPSIxMDAiIHN0cm9rZT0iI0VDNDg5OSIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjx0ZXh0IHg9IjQwIiB5PSIyNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzM3NDE1MSI+TWluaW1hbGlzdGlzayBQcmVtaXVtPC90ZXh0Pgo8L3N2Zz4K',
  'modern-tech': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgdmlld0JveD0iMCAwIDIwMCAyODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InRlY2giIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgo8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMkU1MjY2O3N0b3Atb3BhY2l0eToxIiAvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMxRDI5NDI7c3RvcC1vcGFjaXR5OjEiIC8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyODAiIGZpbGw9InVybCgjdGVjaCkiLz4KPHJlY3QgeD0iMjAiIHk9IjIwIiB3aWR0aD0iMTYwIiBoZWlnaHQ9IjQiIGZpbGw9IndoaXRlIi8+CjxyZWN0IHg9IjIwIiB5PSIzNCIgd2lkdGg9IjEyMCIgaGVpZ2h0PSIyIiBmaWxsPSIjNjM5MkYxIi8+CjxyZWN0IHg9IjIwIiB5PSI1MCIgd2lkdGg9IjE0MCIgaGVpZ2h0PSIyIiBmaWxsPSJ3aGl0ZSIvPgo8cmVjdCB4PSIyMCIgeT0iNTgiIHdpZHRoPSIxMzAiIGhlaWdodD0iMiIgZmlsbD0id2hpdGUiLz4KPHJlY3QgeD0iMjAiIHk9Ijc0IiB3aWR0aD0iODAiIGhlaWdodD0iMyIgZmlsbD0iIzYzOTJGMSIvPgo8dGV4dCB4PSIyMCIgeT0iMjYwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IndoaXRlIj5Nb2Rlcm4gVGVjaDwvdGV4dD4KPC9zdmc+Cg==',
  'ats-optimerad': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgdmlld0JveD0iMCAwIDIwMCAyODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjgwIiBmaWxsPSJ3aGl0ZSIvPgo8cmVjdCB4PSIzMCIgeT0iMzAiIHdpZHRoPSIxNDAiIGhlaWdodD0iNCIgZmlsbD0iIzEzMUIzMiIvPgo8cmVjdCB4PSIzMCIgeT0iNDQiIHdpZHRoPSIxMDAiIGhlaWdodD0iMiIgZmlsbD0iIzM3NDE1MSIvPgo8cmVjdCB4PSIzMCIgeT0iNjAiIHdpZHRoPSIxMzAiIGhlaWdodD0iMiIgZmlsbD0iIzM3NDE1MSIvPgo8cmVjdCB4PSIzMCIgeT0iNjgiIHdpZHRoPSIxMjAiIGhlaWdodD0iMiIgZmlsbD0iIzM3NDE1MSIvPgo8cmVjdCB4PSIzMCIgeT0iNzYiIHdpZHRoPSIxMTAiIGhlaWdodD0iMiIgZmlsbD0iIzM3NDE1MSIvPgo8cmVjdCB4PSIzMCIgeT0iOTAiIHdpZHRoPSI2MCIgaGVpZ2h0PSIzIiBmaWxsPSIjMTk4NzU0Ii8+CjxjaXJjbGUgY3g9IjE3MCIgY3k9IjMwIiByPSI0IiBmaWxsPSIjMTk4NzU0Ii8+Cjx0ZXh0IHg9IjMwIiB5PSIyNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzM3NDE1MSI+QVRTLU9wdGltZXJhZDwvdGV4dD4KPC9zdmc+Cg==',
  'kreativ': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgdmlld0JveD0iMCAwIDIwMCAyODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImNyZWF0aXZlIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I0VGNEQzNzsiLz4KPHN0b3Agb2Zmc2V0PSI1MCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNFNzI4M0I7Ii8+CjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I0I5MzIyQjsiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgZmlsbD0iI0ZCRkJGQiIvPgo8cGF0aCBkPSJNMCAwTDIwMCAwTDE4MCAyMDBMNDAuMDAwMSAyNDBMMCAwWiIgZmlsbD0idXJsKCNjcmVhdGl2ZSkiLz4KPHJlY3QgeD0iMjAiIHk9IjIwIiB3aWR0aD0iMTIwIiBoZWlnaHQ9IjMiIGZpbGw9IndoaXRlIi8+CjxyZWN0IHg9IjIwIiB5PSIzNCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjIiIGZpbGw9IndoaXRlIi8+CjxyZWN0IHg9IjIwIiB5PSI1MCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIyIiBmaWxsPSIjMTMxQjMyIi8+CjxyZWN0IHg9IjIwIiB5PSI1OCIgd2lkdGg9IjkwIiBoZWlnaHQ9IjIiIGZpbGw9IiMxMzFCMzIiLz4KPHRleHQgeD0iMjAiIHk9IjI2MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSIjMTMxQjMyIj5LcmVhdGl2IFByb2Zlc3Npb25hbDwvdGV4dD4KPC9zdmc+Cg==',
  'akademisk': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgdmlld0JveD0iMCAwIDIwMCAyODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjgwIiBmaWxsPSJ3aGl0ZSIvPgo8cmVjdCB4PSIyNSIgeT0iMjUiIHdpZHRoPSIxNTAiIGhlaWdodD0iNCIgZmlsbD0iIzFEMjk0MiIvPgo8cmVjdCB4PSIyNSIgeT0iMzkiIHdpZHRoPSIxMTAiIGhlaWdodD0iMiIgZmlsbD0iIzM3NDE1MSIvPgo8cmVjdCB4PSIyNSIgeT0iNTUiIHdpZHRoPSIxMzAiIGhlaWdodD0iMiIgZmlsbD0iIzM3NDE1MSIvPgo8cmVjdCB4PSIyNSIgeT0iNjMiIHdpZHRoPSIxMjAiIGhlaWdodD0iMiIgZmlsbD0iIzM3NDE1MSIvPgo8cmVjdCB4PSIyNSIgeT0iNzEiIHdpZHRoPSIxMTAiIGhlaWdodD0iMiIgZmlsbD0iIzM3NDE1MSIvPgo8cmVjdCB4PSIyNSIgeT0iODUiIHdpZHRoPSI3MCIgaGVpZ2h0PSIzIiBmaWxsPSIjMkU1MjY2Ii8+CjxyZWN0IHg9IjI1IiB5PSIxMDAiIHdpZHRoPSIxMjAiIGhlaWdodD0iMiIgZmlsbD0iIzM3NDE1MSIvPgo8dGV4dCB4PSIyNSIgeT0iMjYwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiMzNzQxNTEiPkFrYWRlbWlzayBFeGNlbGxlbmNlPC90ZXh0Pgo8L3N2Zz4K'
};

// Loading stages for better UX
const LOADING_STAGES = [
  { id: 'init', label: 'Initialiserar...', duration: 200 },
  { id: 'template', label: 'Laddar mall...', duration: 500 },
  { id: 'data', label: 'Bearbetar CV-data...', duration: 300 },
  { id: 'layout', label: 'Skapar layout...', duration: 800 },
  { id: 'render', label: 'Genererar förhandsvisning...', duration: 1200 },
  { id: 'optimize', label: 'Optimerar kvalitet...', duration: 400 }
];

export default function TemplatePreviewFast({
  templateId,
  cvData,
  customization,
  onPreviewReady,
  className = "",
  priority = 'medium'
}: TemplatePreviewFastProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [useStaticFallback, setUseStaticFallback] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<Map<string, string>>(new Map());

  // Cache key för att undvika onödiga regenereringar
  const cacheKey = `${templateId}_${cvData?.id}_${JSON.stringify(customization)}`;

  // Progress simulation för bättre UX
  const simulateProgress = useCallback(() => {
    setStartTime(Date.now());
    let stageIndex = 0;
    let totalProgress = 0;
    
    const updateStage = () => {
      if (stageIndex < LOADING_STAGES.length) {
        setCurrentStage(stageIndex);
        
        const stage = LOADING_STAGES[stageIndex];
        const stageProgress = (100 / LOADING_STAGES.length);
        
        // Smooth progress within stage
        const progressInterval = setInterval(() => {
          totalProgress += (stageProgress / (stage.duration / 50));
          setProgress(Math.min(totalProgress, (stageIndex + 1) * stageProgress));
        }, 50);
        
        setTimeout(() => {
          clearInterval(progressInterval);
          stageIndex++;
          updateStage();
        }, stage.duration);
      }
    };
    
    updateStage();
  }, []);

  const generatePreview = useCallback(async (force = false) => {
    if (!templateId || !cvData?.cv_text || (!force && isGenerating)) return;

    // Check cache first
    if (!force && cacheRef.current.has(cacheKey)) {
      const cachedUrl = cacheRef.current.get(cacheKey);
      if (cachedUrl) {
        setPreviewImage(cachedUrl);
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
    setUseStaticFallback(false);
    setProgress(0);
    setCurrentStage(0);

    // Start progress simulation
    simulateProgress();

    // Show static preview immediately for better perceived performance
    if (STATIC_PREVIEWS[templateId]) {
      setPreviewImage(STATIC_PREVIEWS[templateId]);
    }

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Förhandsvisning tog för lång tid')), 15000)
      );

      const fetchPromise = fetch('/api/cv/generate-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
            quality: priority === 'high' ? 'high' : 'standard',
            ...customization
          }
        }),
        signal: abortControllerRef.current.signal
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

      if (!response.ok) {
        throw new Error(`Fel ${response.status}: Kunde inte generera förhandsvisning`);
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);

      // Cache the result
      cacheRef.current.set(cacheKey, imageUrl);
      setPreviewImage(imageUrl);
      setProgress(100);
      onPreviewReady?.(true);

      const totalTime = Date.now() - startTime;
      console.log(`✅ Preview för ${templateId} genererad på ${totalTime}ms`);

    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Preview generation error:', error);
        
        // Fallback till statisk preview
        if (STATIC_PREVIEWS[templateId] && !useStaticFallback) {
          setUseStaticFallback(true);
          setPreviewImage(STATIC_PREVIEWS[templateId]);
          setError(`Live preview misslyckades. Visar statisk förhandsvisning.`);
          onPreviewReady?.(true);
        } else {
          setError(error.message || 'Ett oväntat fel inträffade');
          setPreviewImage(null);
          onPreviewReady?.(false);
        }
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  }, [templateId, cvData, customization, cacheKey, isGenerating, onPreviewReady, simulateProgress, startTime, useStaticFallback, priority]);

  // Auto-generate on mount
  useEffect(() => {
    generatePreview(false);
  }, [templateId, cvData?.id]);

  // Force refresh
  const handleRefresh = useCallback(() => {
    generatePreview(true);
  }, [generatePreview]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Cleanup blob URLs
      cacheRef.current.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  // Render loading state with progress
  if (isGenerating && !previewImage) {
    const currentStageData = LOADING_STAGES[currentStage] || LOADING_STAGES[0];
    
    return (
      <div className={`bg-navy-900/50 rounded-lg border border-navy-700 min-h-[400px] ${className}`}>
        <div className="p-6 space-y-6">
          {/* Progress header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Loader2 className="w-5 h-5 text-pink-500 animate-spin" />
              <span className="text-white font-medium">Genererar förhandsvisning</span>
            </div>
            <div className="text-sm text-gray-400">
              {Math.round(progress)}%
            </div>
          </div>
          
          {/* Progress bar */}
          <Progress value={progress} className="h-2" />
          
          {/* Current stage */}
          <div className="text-center space-y-2">
            <p className="text-pink-400 font-medium">{currentStageData.label}</p>
            <p className="text-gray-500 text-sm">
              Steg {currentStage + 1} av {LOADING_STAGES.length}
            </p>
          </div>
          
          {/* Stage indicators */}
          <div className="flex justify-center space-x-2">
            {LOADING_STAGES.map((stage, index) => (
              <div
                key={stage.id}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index < currentStage 
                    ? 'bg-green-500' 
                    : index === currentStage 
                      ? 'bg-pink-500 animate-pulse' 
                      : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render error state with fallback options
  if (error && !previewImage) {
    return (
      <div className={`bg-navy-900/50 rounded-lg border border-red-600/50 min-h-[400px] ${className}`}>
        <div className="p-6 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <div className="space-y-2">
            <p className="text-white font-medium">Förhandsvisning misslyckades</p>
            <p className="text-gray-400 text-sm">{error}</p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button 
              onClick={handleRefresh}
              variant="outline" 
              size="sm"
              className="border-red-600 text-red-400 hover:bg-red-600/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Försök igen
            </Button>
            {STATIC_PREVIEWS[templateId!] && (
              <Button
                onClick={() => {
                  setUseStaticFallback(true);
                  setPreviewImage(STATIC_PREVIEWS[templateId!]);
                  setError(null);
                  onPreviewReady?.(true);
                }}
                variant="outline"
                size="sm"
                className="border-blue-600 text-blue-400 hover:bg-blue-600/10"
              >
                <Eye className="w-4 h-4 mr-2" />
                Visa grundlayout
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`template-preview-fast relative ${className}`}>
      {/* Status header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {useStaticFallback ? (
            <Badge variant="outline" className="text-amber-400 border-amber-500">
              <Eye className="w-3 h-3 mr-1" />
              Statisk preview
            </Badge>
          ) : (
            <Badge variant="outline" className="text-green-400 border-green-500">
              <CheckCircle className="w-3 h-3 mr-1" />
              Live preview
            </Badge>
          )}
          
          {isGenerating && (
            <Badge variant="outline" className="text-pink-400 border-pink-500">
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
        </div>
      </div>

      {/* Preview container */}
      <div className="preview-container relative bg-white rounded-lg overflow-hidden shadow-lg aspect-[794/1123]">
        {previewImage && (
          <>
            <img
              src={previewImage}
              alt={`CV Preview - ${templateId}`}
              className="w-full h-full object-contain"
              onLoad={() => onPreviewReady?.(true)}
              onError={() => {
                console.error('Image failed to load');
                if (!useStaticFallback && STATIC_PREVIEWS[templateId!]) {
                  setUseStaticFallback(true);
                  setPreviewImage(STATIC_PREVIEWS[templateId!]);
                } else {
                  setError('Kunde inte ladda förhandsvisning');
                  setPreviewImage(null);
                }
                onPreviewReady?.(false);
              }}
            />
            
            {/* Loading overlay for updates */}
            {isGenerating && (
              <div className="absolute inset-0 bg-navy-900/80 flex items-center justify-center backdrop-blur-sm">
                <div className="text-center space-y-2">
                  <Loader2 className="w-8 h-8 text-pink-500 animate-spin mx-auto" />
                  <p className="text-white text-sm">Uppdaterar förhandsvisning...</p>
                  <div className="text-xs text-gray-400">
                    {Math.round(progress)}% klart
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Fallback warning */}
        {useStaticFallback && (
          <div className="absolute top-2 left-2 bg-amber-500/90 text-white text-xs px-2 py-1 rounded flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            Grundlayout
          </div>
        )}
      </div>

      {/* Performance info */}
      {process.env.NODE_ENV === 'development' && startTime > 0 && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          Genererad på {Date.now() - startTime}ms • Prioritet: {priority}
        </div>
      )}
    </div>
  );
}