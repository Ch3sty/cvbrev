'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  FileText,
  Eye,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  Maximize2,
  GitCompare,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CVPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalCV: string;
  improvedCV: string;
  metrics?: {
    keywordOptimization: number;
    atsScore: number;
    overallImprovement: number;
  };
}

type ViewMode = 'split' | 'original' | 'improved' | 'compare';

export default function CVPreviewModal({
  isOpen,
  onClose,
  originalCV,
  improvedCV,
  metrics
}: CVPreviewModalProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [highlightChanges, setHighlightChanges] = useState(true);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 50));
  };

  const handleResetZoom = () => {
    setZoomLevel(100);
  };

  const renderContent = (content: string, isImproved: boolean) => {
    return (
      <div
        className={`
          prose prose-sm max-w-none p-6
          ${highlightChanges && isImproved ? 'improved-content' : ''}
        `}
        style={{
          fontSize: `${zoomLevel}%`,
          transition: 'font-size 0.2s ease'
        }}
      >
        <div className="whitespace-pre-wrap font-sans text-gray-900">
          {content}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-4 md:inset-8 z-50 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="w-full h-full bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200/80 flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-white shadow-sm">
                    <GitCompare className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      CV-jämförelse
                    </h2>
                    <p className="text-sm text-gray-600">
                      Granska dina förbättringar
                    </p>
                  </div>
                </div>

                {/* View Mode Selector */}
                <div className="flex items-center gap-2">
                  <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                    <button
                      onClick={() => setViewMode('split')}
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-all duration-200 ${
                        viewMode === 'split'
                          ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Delad vy
                    </button>
                    <button
                      onClick={() => setViewMode('original')}
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-all duration-200 ${
                        viewMode === 'original'
                          ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Original
                    </button>
                    <button
                      onClick={() => setViewMode('improved')}
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-all duration-200 ${
                        viewMode === 'improved'
                          ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Förbättrad
                    </button>
                  </div>

                  <button
                    onClick={onClose}
                    className="ml-2 p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                    aria-label="Stäng"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Toolbar */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-4">
                  {/* Zoom Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleZoomOut}
                      className="p-1.5 rounded hover:bg-gray-200 transition-colors duration-200"
                      aria-label="Zooma ut"
                    >
                      <ZoomOut className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                      onClick={handleResetZoom}
                      className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-200 rounded transition-colors duration-200"
                    >
                      {zoomLevel}%
                    </button>
                    <button
                      onClick={handleZoomIn}
                      className="p-1.5 rounded hover:bg-gray-200 transition-colors duration-200"
                      aria-label="Zooma in"
                    >
                      <ZoomIn className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>

                  {/* Highlight Toggle */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={highlightChanges}
                      onChange={(e) => setHighlightChanges(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`
                      w-10 h-6 rounded-full transition-colors duration-200
                      ${highlightChanges ? 'bg-pink-600' : 'bg-gray-300'}
                    `}>
                      <motion.div
                        className="w-5 h-5 bg-white rounded-full shadow-sm"
                        animate={{ x: highlightChanges ? 20 : 2 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        style={{ marginTop: '2px' }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">
                      Markera ändringar
                    </span>
                  </label>
                </div>

                {/* Metrics */}
                {metrics && (
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <Sparkles className="h-3 w-3 mr-1" />
                      +{metrics.overallImprovement}% förbättring
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      ATS: {metrics.atsScore}%
                    </Badge>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      Nyckelord: +{metrics.keywordOptimization}%
                    </Badge>
                  </div>
                )}
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-hidden">
                <div className="h-full flex">
                  {viewMode === 'split' && (
                    <>
                      {/* Original CV */}
                      <div className="flex-1 border-r border-gray-200 overflow-auto">
                        <div className="sticky top-0 bg-white/95 backdrop-blur px-6 py-3 border-b border-gray-100">
                          <h3 className="font-medium text-gray-900">
                            Original CV
                          </h3>
                        </div>
                        {renderContent(originalCV, false)}
                      </div>

                      {/* Improved CV */}
                      <div className="flex-1 overflow-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-pink-50 to-purple-50 px-6 py-3 border-b border-gray-100">
                          <h3 className="font-medium text-gray-900">
                            Förbättrad version
                          </h3>
                        </div>
                        {renderContent(improvedCV, true)}
                      </div>
                    </>
                  )}

                  {viewMode === 'original' && (
                    <div className="flex-1 overflow-auto">
                      <div className="sticky top-0 bg-white/95 backdrop-blur px-6 py-3 border-b border-gray-100">
                        <h3 className="font-medium text-gray-900">
                          Original CV
                        </h3>
                      </div>
                      {renderContent(originalCV, false)}
                    </div>
                  )}

                  {viewMode === 'improved' && (
                    <div className="flex-1 overflow-auto">
                      <div className="sticky top-0 bg-gradient-to-r from-pink-50 to-purple-50 px-6 py-3 border-b border-gray-100">
                        <h3 className="font-medium text-gray-900">
                          Förbättrad version
                        </h3>
                      </div>
                      {renderContent(improvedCV, true)}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Tips: Använd delad vy för att jämföra versioner sida vid sida
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="bg-white hover:bg-gray-50"
                  >
                    Stäng
                  </Button>
                  <Button className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white">
                    <Download className="mr-2 h-4 w-4" />
                    Ladda ner förbättrad
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Custom styles for highlighting changes */}
          <style jsx>{`
            .improved-content {
              position: relative;
            }
            .improved-content::before {
              content: '';
              position: absolute;
              inset: 0;
              background: linear-gradient(
                135deg,
                rgba(219, 39, 119, 0.03),
                rgba(147, 51, 234, 0.03)
              );
              pointer-events: none;
              border-radius: 0.5rem;
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
}