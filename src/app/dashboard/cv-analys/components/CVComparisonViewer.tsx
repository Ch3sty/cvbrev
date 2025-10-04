// src/components/cv/analysis/CVComparisonViewer.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CVComparisonViewerProps {
  originalCV: string;
  improvedCV: string;
}

interface BlockDiff {
  type: 'unchanged' | 'changed' | 'added' | 'removed';
  originalBlock?: string | null;
  improvedBlock?: string | null;
}

/**
 * Skapar block-baserad jämförelse istället för ord-baserad
 */
function generateBlockDiff(original: string, improved: string): BlockDiff[] {
  const originalBlocks = original.split(/\n\n+/).filter(b => b.trim());
  const improvedBlocks = improved.split(/\n\n+/).filter(b => b.trim());

  const blocks: BlockDiff[] = [];
  const maxLength = Math.max(originalBlocks.length, improvedBlocks.length);

  for (let i = 0; i < maxLength; i++) {
    const origBlock = originalBlocks[i] || null;
    const impBlock = improvedBlocks[i] || null;

    if (!origBlock && impBlock) {
      // Nytt block tillagt
      blocks.push({
        type: 'added',
        improvedBlock: impBlock
      });
    } else if (origBlock && !impBlock) {
      // Block borttaget
      blocks.push({
        type: 'removed',
        originalBlock: origBlock
      });
    } else if (origBlock === impBlock) {
      // Oförändrat
      blocks.push({
        type: 'unchanged',
        originalBlock: origBlock,
        improvedBlock: impBlock
      });
    } else {
      // Block ändrat
      blocks.push({
        type: 'changed',
        originalBlock: origBlock,
        improvedBlock: impBlock
      });
    }
  }

  return blocks;
}

export default function CVComparisonViewer({
  originalCV,
  improvedCV
}: CVComparisonViewerProps) {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [highlightChanges, setHighlightChanges] = useState(true);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 10, 150));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 10, 70));

  const blockDiff = highlightChanges ? generateBlockDiff(originalCV, improvedCV) : null;

  const renderBlockDiff = (blocks: BlockDiff[]) => {
    return blocks.map((block, index) => {
      if (block.type === 'unchanged') {
        return (
          <div key={index} className="mb-4">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {block.originalBlock}
            </p>
          </div>
        );
      }

      if (block.type === 'changed') {
        return (
          <div key={index} className="mb-6 space-y-2">
            {/* Original block (röd) */}
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-red-700 uppercase">Original</span>
              </div>
              <p className="text-red-900 leading-relaxed whitespace-pre-wrap line-through opacity-75">
                {block.originalBlock}
              </p>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-green-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">→</span>
              </div>
            </div>

            {/* Improved block (grön) */}
            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-green-700 uppercase">Förbättrad</span>
              </div>
              <p className="text-green-900 leading-relaxed whitespace-pre-wrap font-medium">
                {block.improvedBlock}
              </p>
            </div>
          </div>
        );
      }

      if (block.type === 'added') {
        return (
          <div key={index} className="mb-4 bg-green-50 border-l-4 border-green-400 p-4 rounded">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-green-700 uppercase">Ny text tillagd</span>
            </div>
            <p className="text-green-900 leading-relaxed whitespace-pre-wrap font-medium">
              {block.improvedBlock}
            </p>
          </div>
        );
      }

      if (block.type === 'removed') {
        return (
          <div key={index} className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-red-700 uppercase">Text borttagen</span>
            </div>
            <p className="text-red-900 leading-relaxed whitespace-pre-wrap line-through opacity-75">
              {block.originalBlock}
            </p>
          </div>
        );
      }

      return null;
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

            {highlightChanges && blockDiff ? (
              <div className="font-sans text-gray-900 relative z-10">
                {renderBlockDiff(blockDiff)}
              </div>
            ) : (
              <div className="space-y-4 font-sans text-gray-900 relative z-10">
                {improvedCV.split(/\n\n+/).map((paragraph, index) => (
                  <p key={index} className="whitespace-pre-wrap leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      {highlightChanges && (
        <div className="flex items-center gap-6 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-50 border-l-4 border-green-400 rounded" />
            <span>Förbättrad/Tillagd</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-50 border-l-4 border-red-400 rounded" />
            <span>Original/Borttagen</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 rounded" />
            <span>Oförändrad</span>
          </div>
        </div>
      )}
    </div>
  );
}
