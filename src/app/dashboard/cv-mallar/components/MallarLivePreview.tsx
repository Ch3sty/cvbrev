'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Sparkles, ArrowRight, Eye } from 'lucide-react';

import { SIMPLE_TEMPLATES, getTemplateById } from '@/lib/cv/simple-templates';
import { getTemplateGenerator } from '@/lib/cv/templates';
import { getSwedishCVParser } from '@/lib/cv/swedish-cv-content-parser';
import {
  FONTS,
  DEFAULT_FONT_ID,
  getFontById,
  injectFontIntoHTML,
} from '@/lib/cv/preview-utils';
import type { CVMetadata, CVTemplateType } from '@/lib/cv/cv-metadata';

import TemplateListSidebar from './TemplateListSidebar';
import MallToolbar from './MallToolbar';
import MallInfoCard from './MallInfoCard';

interface CV {
  id: string;
  file_name: string;
  cv_text: string;
}

interface MallarLivePreviewProps {
  selectedCV: CV | null;
  isPremium: boolean;
  isGenerating: boolean;
  onGenerate: (params: {
    templateId: string;
    fontFamily: string;
    fontId: string;
    includePhoto: boolean;
    includeLinkedIn: boolean;
  }) => void;
  onUpgrade?: () => void;
  initialTemplate?: string;
}

const DEFAULT_TEMPLATE_ID = 'modern-minimal';

/**
 * Huvudkomponent fOr live-preview-vyn pa /dashboard/cv-mallar.
 *
 * Layout (desktop):
 *   ┌─ TemplateListSidebar ─┬─ Toolbar ──────────┐
 *   │  (lista mallar)        │  Preview (sticky)  │
 *   │                        │  MallInfoCard      │
 *   │                        │  Skapa CV-PDF      │
 *
 * Mobile: lista som carousel overst, preview + info under.
 */
export default function MallarLivePreview({
  selectedCV,
  isPremium,
  isGenerating,
  onGenerate,
  onUpgrade,
  initialTemplate,
}: MallarLivePreviewProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    initialTemplate || DEFAULT_TEMPLATE_ID
  );
  const [selectedFont, setSelectedFont] = useState<string>(DEFAULT_FONT_ID);
  const [includePhoto, setIncludePhoto] = useState(true);
  const [includeLinkedIn, setIncludeLinkedIn] = useState(true);

  // Parsa CV-text till CVMetadata. Cache:as via useMemo sa vi inte
  // re-parsar pa varje render om CV:t inte andrats.
  const [parsedCV, setParsedCV] = useState<CVMetadata | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  useEffect(() => {
    if (!selectedCV?.cv_text) {
      setParsedCV(null);
      return;
    }
    setIsParsing(true);
    const parser = getSwedishCVParser();
    parser
      .parseSwedishCV(selectedCV.cv_text)
      .then(setParsedCV)
      .catch(err => {
        console.error('Kunde inte parsa CV-text:', err);
        setParsedCV(null);
      })
      .finally(() => setIsParsing(false));
  }, [selectedCV?.cv_text]);

  const template = useMemo(() => getTemplateById(selectedTemplate), [selectedTemplate]);

  // Generera HTML fOr live-preview baserat pa parsed CV + mall + font + toggles.
  const previewHTML = useMemo(() => {
    if (!parsedCV || !selectedTemplate) return '';
    const generator = getTemplateGenerator(selectedTemplate as CVTemplateType);
    if (!generator) return '';
    try {
      const html = generator.generate(parsedCV, { includePhoto, includeLinkedIn });
      const font = getFontById(selectedFont);
      return injectFontIntoHTML(html, font.family);
    } catch (err) {
      console.error('Fel vid HTML-generering:', err);
      return '';
    }
  }, [parsedCV, selectedTemplate, selectedFont, includePhoto, includeLinkedIn]);

  const handleTemplateSelect = (templateId: string) => {
    const tpl = getTemplateById(templateId);
    // Reset toggles om mall inte stoder dem (annars hangs gamla state kvar)
    if (tpl?.features?.supportsPhoto !== true) setIncludePhoto(true);
    if (tpl?.features?.supportsLinkedIn !== true) setIncludeLinkedIn(true);
    setSelectedTemplate(templateId);
  };

  const handleGenerate = () => {
    const font = getFontById(selectedFont);
    onGenerate({
      templateId: selectedTemplate,
      fontFamily: font.family,
      fontId: font.id,
      includePhoto,
      includeLinkedIn,
    });
  };

  const isLockedPremium = template?.tier === 'premium' && !isPremium;
  const canGenerate = !!selectedCV && !!parsedCV && !!selectedTemplate && !isGenerating && !isLockedPremium;

  return (
    <div className="relative">
      {/* Topp-glow */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[300px] -z-10 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(249, 115, 22, 0.06) 0%, transparent 70%)',
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5 lg:gap-7">
        {/* Vansterspalt: mall-lista */}
        <aside className="lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-3rem)]">
          <TemplateListSidebar
            selectedTemplate={selectedTemplate}
            onTemplateSelect={handleTemplateSelect}
            isPremium={isPremium}
            onUpgradeClick={onUpgrade}
          />
        </aside>

        {/* Hogerspalt: preview + toolbar + info + CTA */}
        <div className="space-y-5">
          {/* Toolbar (font + toggles) */}
          <MallToolbar
            template={template}
            selectedFont={selectedFont}
            onFontChange={setSelectedFont}
            includePhoto={includePhoto}
            onTogglePhoto={() => setIncludePhoto(v => !v)}
            includeLinkedIn={includeLinkedIn}
            onToggleLinkedIn={() => setIncludeLinkedIn(v => !v)}
            isPremium={isPremium}
          />

          {/* Live-preview */}
          <PreviewContainer
            previewHTML={previewHTML}
            templateName={template?.name}
            isParsing={isParsing}
            hasCV={!!selectedCV}
          />

          {/* Mall-info */}
          <MallInfoCard template={template} />

          {/* CTA */}
          <GenerateButton
            canGenerate={canGenerate}
            isGenerating={isGenerating}
            isLockedPremium={isLockedPremium}
            onGenerate={handleGenerate}
            onUpgrade={onUpgrade}
            templateName={template?.name}
          />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  PreviewContainer                                                          */
/* -------------------------------------------------------------------------- */

function PreviewContainer({
  previewHTML,
  templateName,
  isParsing,
  hasCV,
}: {
  previewHTML: string;
  templateName: string | undefined;
  isParsing: boolean;
  hasCV: boolean;
}) {
  return (
    <div
      className="rounded-2xl bg-white border border-orange-100 overflow-hidden"
      style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.18)' }}
    >
      {/* Topp-rad: Live-preview-rubrik */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-orange-100/70 bg-orange-50/40">
        <div className="flex items-center gap-2">
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
            style={{
              background: 'linear-gradient(135deg, #F97316, #DC2626)',
            }}
          >
            <Eye className="w-3.5 h-3.5" strokeWidth={2.5} />
          </span>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-700">
              Live förhandsvisning
            </div>
            {templateName && (
              <div className="text-sm font-bold text-slate-900 leading-tight">
                {templateName}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview-area */}
      <div className="relative bg-slate-100 max-h-[800px] overflow-y-auto">
        {!hasCV && <PreviewEmptyState />}
        {hasCV && isParsing && <PreviewLoading />}
        {hasCV && !isParsing && previewHTML && (
          <AnimatePresence mode="wait">
            <motion.div
              key={previewHTML.slice(0, 100)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="p-3 sm:p-4"
            >
              <div
                className="bg-white origin-top mx-auto"
                style={{
                  width: '210mm',
                  maxWidth: '100%',
                  transform: 'scale(0.9)',
                  transformOrigin: 'top center',
                }}
                dangerouslySetInnerHTML={{ __html: previewHTML }}
              />
            </motion.div>
          </AnimatePresence>
        )}
        {hasCV && !isParsing && !previewHTML && <PreviewError />}
      </div>
    </div>
  );
}

function PreviewEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-20 min-h-[400px]">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-orange-700 bg-orange-50 mb-4"
      >
        <FileText className="w-7 h-7" strokeWidth={2} />
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1">Välj ett CV först</h3>
      <p className="text-sm text-slate-600 max-w-sm">
        När du valt ett CV ovanför ser du hur det ser ut i den valda mallen direkt här.
      </p>
    </div>
  );
}

function PreviewLoading() {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-20 min-h-[400px]">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm text-slate-600">Förbereder förhandsvisning...</p>
    </div>
  );
}

function PreviewError() {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-20 min-h-[400px]">
      <p className="text-sm text-slate-600">
        Kunde inte generera förhandsvisning. Försök välja en annan mall.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  GenerateButton                                                            */
/* -------------------------------------------------------------------------- */

function GenerateButton({
  canGenerate,
  isGenerating,
  isLockedPremium,
  onGenerate,
  onUpgrade,
  templateName,
}: {
  canGenerate: boolean;
  isGenerating: boolean;
  isLockedPremium: boolean;
  onGenerate: () => void;
  onUpgrade?: () => void;
  templateName: string | undefined;
}) {
  if (isLockedPremium) {
    return (
      <button
        onClick={onUpgrade}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-white font-black text-base min-h-[56px] transition-all hover:shadow-xl active:scale-[0.99]"
        style={{
          background: 'linear-gradient(135deg, #8B5CF6 0%, #DC2626 50%, #BE185D 100%)',
          boxShadow: '0 12px 32px -10px rgba(220, 38, 38, 0.45)',
        }}
      >
        <Sparkles className="w-5 h-5" strokeWidth={2.5} />
        Lås upp Premium för {templateName || 'denna mall'}
      </button>
    );
  }

  return (
    <button
      onClick={onGenerate}
      disabled={!canGenerate}
      className={`w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-white font-black text-base min-h-[56px] transition-all ${
        canGenerate ? 'hover:shadow-xl active:scale-[0.99]' : 'opacity-50 cursor-not-allowed'
      }`}
      style={{
        background: 'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
        boxShadow: canGenerate ? '0 12px 32px -10px rgba(220, 38, 38, 0.45)' : 'none',
      }}
    >
      {isGenerating ? (
        <>
          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Skapar PDF...
        </>
      ) : (
        <>
          <Sparkles className="w-5 h-5" strokeWidth={2.5} />
          Skapa CV-PDF
          <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
        </>
      )}
    </button>
  );
}
