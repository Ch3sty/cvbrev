'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown,
  Lock,
  FileText,
  X,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react';
import { DOCX_TEMPLATES, type DocxTemplateId } from '@/lib/letters/docx-templates';
import LetterFlowStepHeader from '../LetterFlowStepHeader';

interface TemplateStepProps {
  templateId: string;
  onTemplateChange: (templateId: string) => void;
  isPremium: boolean;
  isActive: boolean;
  registerRef?: (el: HTMLElement | null) => void;
}

export default function TemplateStep({
  templateId,
  onTemplateChange,
  isPremium,
  isActive,
  registerRef,
}: TemplateStepProps) {
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const [currentMobileIndex, setCurrentMobileIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const templates = Object.entries(DOCX_TEMPLATES);

  useEffect(() => {
    const selectedIndex = templates.findIndex(([id]) => id === templateId);
    if (selectedIndex !== -1) {
      setCurrentMobileIndex(selectedIndex);
    }
  }, [templateId]);

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

  const scrollToIndex = (index: number) => {
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.offsetWidth;
      carouselRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth',
      });
    }
    setCurrentMobileIndex(index);
  };

  const handleScroll = () => {
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.offsetWidth;
      const scrollLeft = carouselRef.current.scrollLeft;
      const newIndex = Math.round(scrollLeft / cardWidth);
      if (
        newIndex !== currentMobileIndex &&
        newIndex >= 0 &&
        newIndex < templates.length
      ) {
        setCurrentMobileIndex(newIndex);
      }
    }
  };

  const TemplateCard = ({
    id,
    template,
    isSelected,
    isLocked,
  }: {
    id: string;
    template: typeof DOCX_TEMPLATES[keyof typeof DOCX_TEMPLATES];
    isSelected: boolean;
    isLocked: boolean;
  }) => (
    <motion.button
      type="button"
      onClick={() => !isLocked && onTemplateChange(id as DocxTemplateId)}
      disabled={isLocked}
      className={`
        relative p-3 rounded-2xl border-2 transition-all w-full text-left bg-white
        ${
          isSelected
            ? 'border-orange-400'
            : isLocked
            ? 'border-slate-200 opacity-60 cursor-not-allowed'
            : 'border-slate-200 hover:border-orange-300'
        }
      `}
      style={
        isSelected
          ? { boxShadow: '0 12px 28px -8px rgba(249, 115, 22, 0.35)' }
          : undefined
      }
      whileHover={!isLocked ? { y: -2 } : {}}
      whileTap={!isLocked ? { scale: 0.98 } : {}}
    >
      {template.tier === 'premium' && (
        <div className="absolute top-2.5 right-2.5 z-10">
          <div
            className={`text-white text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${
              isLocked ? 'bg-slate-700' : ''
            }`}
            style={
              isLocked
                ? undefined
                : {
                    background:
                      'linear-gradient(135deg, #D946EF, #9333EA, #DB2777)',
                  }
            }
          >
            {isLocked ? (
              <Lock className="w-3 h-3" />
            ) : (
              <Crown className="w-3 h-3" />
            )}
            Premium
          </div>
        </div>
      )}

      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center z-10"
          style={{
            background: 'linear-gradient(135deg, #10B981, #059669)',
            boxShadow: '0 4px 10px -2px rgba(16, 185, 129, 0.5)',
          }}
        >
          <Check className="w-4 h-4 text-white" strokeWidth={3} />
        </motion.div>
      )}

      <div
        className="relative w-full h-44 mb-3 bg-slate-50 rounded-xl overflow-hidden border border-slate-200 cursor-pointer group"
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
            height: '400%',
          }}
          title={`Preview av ${template.name}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="bg-white rounded-full p-2.5 shadow-lg">
            <Maximize2 className="w-5 h-5 text-slate-700" />
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
          {template.name}
          {template.tier === 'free' && (
            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full font-semibold">
              Gratis
            </span>
          )}
        </h4>
        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
          {template.description}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {template.industries.slice(0, 2).map((industry, idx) => (
            <span
              key={idx}
              className="text-[10px] bg-slate-50 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded-full font-medium"
            >
              {industry}
            </span>
          ))}
          {template.industries.length > 2 && (
            <span className="text-[10px] text-slate-500">
              +{template.industries.length - 2}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );

  return (
    <motion.section
      ref={registerRef}
      data-flow-section="template"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-white rounded-3xl border border-orange-200/50 p-5 sm:p-7"
      style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.15)' }}
    >
      <LetterFlowStepHeader
        stepNumber={3}
        title="Välj brevmall"
        description="Alla mallar är ATS-optimerade."
        isDone={!!templateId}
        isActive={isActive}
      />

      {/* Mobile Carousel */}
      <div className="block md:hidden">
        <div className="relative">
          {currentMobileIndex > 0 && (
            <button
              type="button"
              onClick={() => scrollToIndex(currentMobileIndex - 1)}
              className="absolute left-1 top-24 -translate-y-1/2 z-10 w-9 h-9 bg-white/95 backdrop-blur rounded-full shadow-lg flex items-center justify-center border border-slate-200"
              aria-label="Föregående mall"
            >
              <ChevronLeft className="w-5 h-5 text-slate-700" />
            </button>
          )}
          {currentMobileIndex < templates.length - 1 && (
            <button
              type="button"
              onClick={() => scrollToIndex(currentMobileIndex + 1)}
              className="absolute right-1 top-24 -translate-y-1/2 z-10 w-9 h-9 bg-white/95 backdrop-blur rounded-full shadow-lg flex items-center justify-center border border-slate-200"
              aria-label="Nästa mall"
            >
              <ChevronRight className="w-5 h-5 text-slate-700" />
            </button>
          )}

          <div
            ref={carouselRef}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-3 pb-4 -mx-5 px-5"
            style={{ scrollSnapType: 'x mandatory' }}
            onScroll={handleScroll}
          >
            {templates.map(([id, template]) => {
              const isSelected = templateId === id;
              const isLocked = template.tier === 'premium' && !isPremium;
              return (
                <div key={id} className="flex-shrink-0 w-full snap-center">
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

          <div className="flex justify-center gap-1.5 mt-2">
            {templates.map(([id], index) => (
              <button
                key={id}
                type="button"
                onClick={() => scrollToIndex(index)}
                className={`
                  h-2 rounded-full transition-all duration-300
                  ${
                    index === currentMobileIndex
                      ? 'w-6'
                      : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }
                `}
                style={
                  index === currentMobileIndex
                    ? {
                        background:
                          'linear-gradient(90deg, #F97316, #DC2626)',
                      }
                    : undefined
                }
                aria-label={`Gå till mall ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Grid */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-3">
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

      {/* Preview Modal */}
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
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-orange-50/50 to-white">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 truncate">
                      {DOCX_TEMPLATES[previewTemplateId as keyof typeof DOCX_TEMPLATES]?.name}
                    </h3>
                    <p className="text-sm text-slate-600 truncate">
                      {DOCX_TEMPLATES[previewTemplateId as keyof typeof DOCX_TEMPLATES]?.description}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewTemplateId(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
                  aria-label="Stäng förhandsvisning"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <div className="flex-1 overflow-auto bg-slate-50 p-4 md:p-8">
                <div className="max-w-[21cm] mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
                  <iframe
                    src={`/images/templates/${previewTemplateId}-preview.html`}
                    className="w-full border-0"
                    style={{ height: '842px', minHeight: '842px' }}
                    title={`Full preview av ${DOCX_TEMPLATES[previewTemplateId as keyof typeof DOCX_TEMPLATES]?.name}`}
                  />
                </div>
              </div>

              <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-slate-600 hidden sm:block">
                  Klicka utanför eller tryck ESC för att stänga
                </p>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setPreviewTemplateId(null)}
                    className="flex-1 sm:flex-none px-4 py-2.5 text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors min-h-[44px]"
                  >
                    Stäng
                  </button>
                  {DOCX_TEMPLATES[previewTemplateId as keyof typeof DOCX_TEMPLATES]?.tier !== 'premium' || isPremium ? (
                    <button
                      type="button"
                      onClick={() => {
                        onTemplateChange(previewTemplateId);
                        setPreviewTemplateId(null);
                      }}
                      className="flex-1 sm:flex-none px-5 py-2.5 text-white rounded-xl font-bold transition-all min-h-[44px] shadow-lg"
                      style={{
                        background:
                          'linear-gradient(135deg, #F97316, #DC2626)',
                      }}
                    >
                      Välj denna mall
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="flex-1 sm:flex-none px-5 py-2.5 text-white bg-slate-400 rounded-xl cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px]"
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
    </motion.section>
  );
}
