'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Lock, FileText, X, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';
import { DOCX_TEMPLATES, type DocxTemplateId } from '@/lib/letters/docx-templates';

interface TemplateStepProps {
  templateId: string;
  onTemplateChange: (templateId: string) => void;
  isPremium: boolean;
}

export default function TemplateStep({
  templateId,
  onTemplateChange,
  isPremium
}: TemplateStepProps) {
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const [currentMobileIndex, setCurrentMobileIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const templates = Object.entries(DOCX_TEMPLATES);

  // Sync carousel index with selected template
  useEffect(() => {
    const selectedIndex = templates.findIndex(([id]) => id === templateId);
    if (selectedIndex !== -1) {
      setCurrentMobileIndex(selectedIndex);
    }
  }, [templateId]);

  // ESC key handler for modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && previewTemplateId) {
        setPreviewTemplateId(null);
      }
    };

    if (previewTemplateId) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [previewTemplateId]);

  // Scroll to index on mobile
  const scrollToIndex = (index: number) => {
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.offsetWidth;
      carouselRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
      });
    }
    setCurrentMobileIndex(index);
  };

  // Handle scroll end to update index
  const handleScroll = () => {
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.offsetWidth;
      const scrollLeft = carouselRef.current.scrollLeft;
      const newIndex = Math.round(scrollLeft / cardWidth);
      if (newIndex !== currentMobileIndex && newIndex >= 0 && newIndex < templates.length) {
        setCurrentMobileIndex(newIndex);
      }
    }
  };

  const TemplateCard = ({ id, template, isSelected, isLocked }: {
    id: string;
    template: typeof DOCX_TEMPLATES[keyof typeof DOCX_TEMPLATES];
    isSelected: boolean;
    isLocked: boolean;
  }) => (
    <motion.button
      onClick={() => !isLocked && onTemplateChange(id as DocxTemplateId)}
      disabled={isLocked}
      className={`
        relative p-4 rounded-xl border-2 transition-all w-full
        ${isSelected
          ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50'
          : isLocked
          ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
        }
      `}
      whileHover={!isLocked ? { scale: 1.02, y: -2 } : {}}
      whileTap={!isLocked ? { scale: 0.98 } : {}}
    >
      {/* Premium Badge */}
      {template.tier === 'premium' && (
        <div className="absolute top-2 right-2 z-10">
          <div className={`${isLocked ? 'bg-gray-800' : 'bg-gradient-to-r from-purple-600 to-pink-600'} text-white text-xs px-2 py-1 rounded-full flex items-center gap-1`}>
            {isLocked ? <Lock className="w-3 h-3" /> : <Crown className="w-3 h-3" />}
            Premium
          </div>
        </div>
      )}

      {/* Selection Indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center z-10"
        >
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </motion.div>
      )}

      {/* Template Preview */}
      <div
        className="relative w-full h-48 mb-3 bg-gray-50 rounded-lg overflow-hidden border border-gray-200 cursor-pointer group"
        onClick={(e) => {
          e.stopPropagation();
          setPreviewTemplateId(id);
        }}
      >
        <iframe
          src={`/images/templates/${id}-preview.html`}
          className="w-full h-full pointer-events-none"
          style={{
            transform: 'scale(0.25)',
            transformOrigin: 'top left',
            width: '400%',
            height: '400%'
          }}
          title={`Preview av ${template.name}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent pointer-events-none" />

        {/* Expand button overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="bg-white rounded-full p-3 shadow-lg">
            <Maximize2 className="w-6 h-6 text-gray-700" />
          </div>
        </div>
      </div>

      <div className="text-left">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          {template.name}
          {template.tier === 'free' && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Gratis</span>
          )}
        </h4>
        <p className="text-sm text-gray-600 mt-1">{template.description}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {template.industries.slice(0, 2).map((industry, idx) => (
            <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
              {industry}
            </span>
          ))}
          {template.industries.length > 2 && (
            <span className="text-xs text-gray-500">+{template.industries.length - 2}</span>
          )}
        </div>
      </div>
    </motion.button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Välj din brevmall</h3>
        <p className="text-sm text-gray-600">
          Alla mallar är ATS-optimerade och professionellt designade
        </p>
      </div>

      {/* Mobile Carousel */}
      <div className="block md:hidden">
        <div className="relative">
          {/* Navigation buttons */}
          {currentMobileIndex > 0 && (
            <button
              onClick={() => scrollToIndex(currentMobileIndex - 1)}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-lg flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
          )}
          {currentMobileIndex < templates.length - 1 && (
            <button
              onClick={() => scrollToIndex(currentMobileIndex + 1)}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-lg flex items-center justify-center"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          )}

          {/* Carousel */}
          <div
            ref={carouselRef}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4 pb-4"
            style={{ scrollSnapType: 'x mandatory' }}
            onScroll={handleScroll}
          >
            {templates.map(([id, template]) => {
              const isSelected = templateId === id;
              const isLocked = template.tier === 'premium' && !isPremium;

              return (
                <div
                  key={id}
                  className="flex-shrink-0 w-full snap-center px-2"
                >
                  <TemplateCard
                    id={id}
                    template={template}
                    isSelected={isSelected}
                    isLocked={isLocked}
                  />
                </div>
              );
            })}
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {templates.map(([id], index) => (
              <button
                key={id}
                onClick={() => scrollToIndex(index)}
                className={`
                  h-2 rounded-full transition-all duration-300
                  ${index === currentMobileIndex
                    ? 'w-6 bg-pink-500'
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }
                `}
                aria-label={`Gå till mall ${index + 1}`}
              />
            ))}
          </div>

          {/* Current template name */}
          <p className="text-center text-sm text-gray-600 mt-2">
            {templates[currentMobileIndex]?.[1]?.name} ({currentMobileIndex + 1}/{templates.length})
          </p>
        </div>
      </div>

      {/* Desktop Grid */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(([id, template]) => {
          const isSelected = templateId === id;
          const isLocked = template.tier === 'premium' && !isPremium;

          return (
            <TemplateCard
              key={id}
              id={id}
              template={template}
              isSelected={isSelected}
              isLocked={isLocked}
            />
          );
        })}
      </div>

      {/* Template Preview Modal */}
      <AnimatePresence>
        {previewTemplateId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPreviewTemplateId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {DOCX_TEMPLATES[previewTemplateId as keyof typeof DOCX_TEMPLATES]?.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {DOCX_TEMPLATES[previewTemplateId as keyof typeof DOCX_TEMPLATES]?.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewTemplateId(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-auto bg-gray-50 p-4 md:p-8">
                <div className="max-w-[21cm] mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
                  <iframe
                    src={`/images/templates/${previewTemplateId}-preview.html`}
                    className="w-full border-0"
                    style={{
                      height: '842px',
                      minHeight: '842px'
                    }}
                    title={`Full preview av ${DOCX_TEMPLATES[previewTemplateId as keyof typeof DOCX_TEMPLATES]?.name}`}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-sm text-gray-600 hidden sm:block">
                  Klicka utanför för att stänga eller tryck ESC
                </p>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setPreviewTemplateId(null)}
                    className="flex-1 sm:flex-none px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Stäng
                  </button>
                  {DOCX_TEMPLATES[previewTemplateId as keyof typeof DOCX_TEMPLATES]?.tier !== 'premium' || isPremium ? (
                    <button
                      onClick={() => {
                        onTemplateChange(previewTemplateId);
                        setPreviewTemplateId(null);
                      }}
                      className="flex-1 sm:flex-none px-4 py-2 text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 rounded-lg transition-colors font-medium"
                    >
                      Välj denna mall
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex-1 sm:flex-none px-4 py-2 text-white bg-gray-400 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      Premium krävs
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
