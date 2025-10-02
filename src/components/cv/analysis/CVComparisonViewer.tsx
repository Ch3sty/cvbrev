// src/components/cv/analysis/CVComparisonViewer.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateWordDiff, type DiffSegment } from '@/lib/cv/cvDiffUtils';

interface CVComparisonViewerProps {
  originalCV: string;
  improvedCV: string;
}

export default function CVComparisonViewer({
  originalCV,
  improvedCV
}: CVComparisonViewerProps) {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [highlightChanges, setHighlightChanges] = useState(true);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 10, 150));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 10, 70));

  const diff = highlightChanges ? generateWordDiff(originalCV, improvedCV) : null;

  const renderDiffText = (segments: DiffSegment[]) => {
    return segments.map((segment, index) => {
      if (segment.type === 'unchanged') {
        return <span key={index}>{segment.text}</span>;
      } else if (segment.type === 'added') {
        return (
          <span
            key={index}
            className="bg-green-100 text-green-900 border-b-2 border-green-400"
          >
            {segment.text}
          </span>
        );
      } else {
        return (
          <span
            key={index}
            className="bg-red-100 text-red-900 line-through"
          >
            {segment.text}
          </span>
        );
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 70}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium text-gray-700 min-w-[60px] text-center">
            {zoomLevel}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 150}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>

        {/* Highlight Toggle */}
        <Button
          variant={highlightChanges ? 'default' : 'outline'}
          size="sm"
          onClick={() => setHighlightChanges(!highlightChanges)}
          className="flex items-center gap-2"
        >
          {highlightChanges ? (
            <>
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Markera ändringar</span>
            </>
          ) : (
            <>
              <EyeOff className="w-4 h-4" />
              <span className="hidden sm:inline">Dölj markeringar</span>
            </>
          )}
        </Button>
      </div>

      {/* Comparison View */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Original CV */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-100 border-b border-gray-200 px-4 py-3">
            <h4 className="font-semibold text-gray-900">Nuvarande CV</h4>
          </div>
          <div
            className="p-6 bg-white overflow-auto max-h-[600px]"
            style={{ fontSize: `${zoomLevel}%` }}
          >
            <div className="space-y-4 font-sans text-gray-900">
              {originalCV.split(/\n\n+/).map((paragraph, index) => (
                <p key={index} className="whitespace-pre-wrap leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Improved CV */}
        <div className="border border-green-200 rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 px-4 py-3">
            <h4 className="font-semibold text-gray-900">Förbättrat CV</h4>
            <p className="text-xs text-gray-600 mt-1">
              {highlightChanges ? 'Grönt = nytt, Rött = borttaget' : 'Markeringar dolda'}
            </p>
          </div>
          <div
            className="p-6 bg-white overflow-auto max-h-[600px] relative"
            style={{ fontSize: `${zoomLevel}%` }}
          >
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-green-50/30 to-emerald-50/30" />

            <div className="whitespace-pre-wrap font-sans text-gray-900 relative z-10">
              {highlightChanges && diff ? renderDiffText(diff) : improvedCV}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      {highlightChanges && (
        <div className="flex items-center gap-6 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border-b-2 border-green-400 rounded" />
            <span>Tillagd text</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 rounded line-through" />
            <span>Borttagen text</span>
          </div>
        </div>
      )}
    </div>
  );
}
