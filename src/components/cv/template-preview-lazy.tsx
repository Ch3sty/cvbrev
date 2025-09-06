'use client';

import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { Loader2, Eye, FileText } from 'lucide-react';
import type { CVTemplateType } from '@/lib/cv/cv-metadata';

// Lazy load TemplatePreview endast när den verkligen behövs
const TemplatePreview = lazy(() => import('./template-preview'));

interface TemplatePreviewLazyProps {
  templateId: CVTemplateType;
  cvData?: any;
  isVisible?: boolean;
  onPreviewReady?: () => void;
  className?: string;
}

// Intersection Observer för att endast ladda när komponenten är synlig
function useIntersectionObserver(
  elementRef: React.RefObject<Element | null>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      options
    );

    observer.observe(element);
    return () => observer.unobserve(element);
  }, [options, elementRef]);

  return isIntersecting;
}

export default function TemplatePreviewLazy({
  templateId,
  cvData,
  isVisible = false,
  onPreviewReady,
  className = ""
}: TemplatePreviewLazyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInViewport = useIntersectionObserver(containerRef as React.RefObject<Element>, {
    threshold: 0.1,
    rootMargin: '50px'
  });
  
  const [shouldLoad, setShouldLoad] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Ladda när synlig eller när explicit begärt
  useEffect(() => {
    if (isVisible || isInViewport) {
      setShouldLoad(true);
    }
  }, [isVisible, isInViewport]);

  // Loading fallback component
  const LoadingPlaceholder = () => (
    <div className={`min-h-[400px] bg-navy-900/50 rounded-lg border border-navy-700 flex items-center justify-center ${className}`}>
      <div className="text-center space-y-4">
        <div className="animate-pulse">
          <div className="bg-navy-700 rounded-lg w-48 h-64 mx-auto mb-4"></div>
          <div className="bg-navy-700 rounded h-4 w-32 mx-auto mb-2"></div>
          <div className="bg-navy-700 rounded h-3 w-24 mx-auto"></div>
        </div>
        <p className="text-gray-400 text-sm">Förbereder förhandsvisning...</p>
      </div>
    </div>
  );

  // Skeleton för när data laddas
  const PreviewSkeleton = () => (
    <div className="space-y-4 animate-pulse">
      <div className="bg-navy-700 rounded-lg h-64 w-full"></div>
      <div className="space-y-2">
        <div className="bg-navy-700 rounded h-4 w-3/4"></div>
        <div className="bg-navy-700 rounded h-4 w-1/2"></div>
        <div className="bg-navy-700 rounded h-4 w-2/3"></div>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className={`template-preview-container ${className}`}>
      {shouldLoad ? (
        <Suspense fallback={<LoadingPlaceholder />}>
          <TemplatePreview
            templateId={templateId}
            cvData={cvData}
            onPreviewReady={() => {
              setHasLoaded(true);
              onPreviewReady?.();
            }}
          />
        </Suspense>
      ) : (
        <LoadingPlaceholder />
      )}
    </div>
  );
}

// High-priority template preview för kritiska mallar
export function TemplatePreviewPriority({
  templateId,
  cvData,
  onPreviewReady,
  className = ""
}: TemplatePreviewLazyProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`template-preview-priority ${className}`}>
      <Suspense 
        fallback={
          <div className="min-h-[300px] bg-navy-900/50 rounded-lg border border-navy-700 flex items-center justify-center">
            <div className="text-center space-y-2">
              <Loader2 className="w-8 h-8 text-pink-500 animate-spin mx-auto" />
              <p className="text-gray-400 text-sm">Laddar förhandsvisning...</p>
            </div>
          </div>
        }
      >
        <TemplatePreview
          templateId={templateId}
          cvData={cvData}
          onPreviewReady={() => {
            setIsLoaded(true);
            onPreviewReady?.();
          }}
        />
      </Suspense>
    </div>
  );
}