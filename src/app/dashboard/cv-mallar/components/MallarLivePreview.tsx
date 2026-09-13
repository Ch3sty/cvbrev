'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { FileText, Crown, ArrowRight, Eye } from 'lucide-react';

import { getTemplateById } from '@/lib/cv/simple-templates';
import {
  DEFAULT_FONT_ID,
  getFontById,
} from '@/lib/cv/preview-utils';

import TemplateSelector from './TemplateSelector';
import MallToolbar from './MallToolbar';
import MallInfoCard from './MallInfoCard';
import StepHeader from './StepHeader';

interface CV {
  id: string;
  file_name: string;
  cv_text: string;
  /** Pre-parsed CV-metadata - skickas till preview-API for hogsta kvalitet */
  structured_data?: any;
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

const DEFAULT_TEMPLATE_ID = 'norrsken';
const PREVIEW_DEBOUNCE_MS = 250;

/**
 * Huvudkomponent fOr live-preview-vyn pa /dashboard/cv-mallar.
 *
 * Layout (desktop): split-view med 360px lista vanster + flex preview hoger.
 * Mobile: lista som carousel overst, preview + info under.
 *
 * Preview-HTML hamtas fran /api/cv/preview-html (samme server-parser som PDF-flow)
 * for att garantera att preview matchar PDF-output exakt.
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

  const [previewHTML, setPreviewHTML] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const fetchAbortRef = useRef<AbortController | null>(null);

  const template = useMemo(() => getTemplateById(selectedTemplate), [selectedTemplate]);

  // Hamta preview-HTML fran API nar nagot relevant andras.
  // Debounce 250ms sa snabba andringar (toggla photo + LinkedIn snabbt) inte
  // skickar 3 requests.
  useEffect(() => {
    if (!selectedCV?.cv_text || !selectedTemplate) {
      setPreviewHTML('');
      setPreviewError(null);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (fetchAbortRef.current) fetchAbortRef.current.abort();

    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      fetchAbortRef.current = controller;

      setIsLoading(true);
      setPreviewError(null);

      try {
        const tpl = getTemplateById(selectedTemplate);
        const supportsPhoto = tpl?.features?.supportsPhoto === true;
        const supportsLinkedIn = tpl?.features?.supportsLinkedIn === true;

        const templateOptions: { includePhoto?: boolean; includeLinkedIn?: boolean } = {};
        if (supportsPhoto) templateOptions.includePhoto = includePhoto;
        if (supportsLinkedIn) templateOptions.includeLinkedIn = includeLinkedIn;

        const font = getFontById(selectedFont);

        const response = await fetch('/api/cv/preview-html', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            template: selectedTemplate,
            // Skicka pre-parsed structured_data om finns (hogsta kvalitet)
            // - sparar AI-cost och tid och far exakt samma resultat som PDF
            structuredData: selectedCV.structured_data || undefined,
            cvText: selectedCV.cv_text,
            templateOptions,
            fontFamily: font.family,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || 'Kunde inte hämta förhandsvisning');
        }

        const data = await response.json();
        if (!controller.signal.aborted) {
          setPreviewHTML(data.html || '');
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        console.error('Fel vid preview-hamtning:', err);
        if (!controller.signal.aborted) {
          setPreviewError(err?.message || 'Något gick fel vid förhandsvisning');
          setPreviewHTML('');
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, PREVIEW_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [selectedCV?.cv_text, selectedTemplate, selectedFont, includePhoto, includeLinkedIn]);

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
  const canGenerate = !!selectedCV && !!selectedTemplate && !isGenerating && !isLockedPremium;

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

      <div className="flex flex-col gap-7 min-w-0">
        {/* Steg 2: Vala mall */}
        <section>
          <StepHeader
            number={2}
            title="Välj din mall"
            description="Bläddra i listan eller öppna galleriet för att se alla 16 mallar."
          />
          <TemplateSelector
            selectedTemplate={selectedTemplate}
            onTemplateSelect={handleTemplateSelect}
            isPremium={isPremium}
            onUpgradeClick={onUpgrade}
          />
        </section>

        {/* Steg 3: Granska och anpassa */}
        <section>
          <StepHeader
            number={3}
            title="Granska och ladda ner"
            description="Så här kommer ditt CV se ut. Anpassa typsnitt och alternativ innan du laddar ner."
          />
          <div className="flex flex-col gap-5">
            {/* Live-preview */}
            <PreviewContainer
              previewHTML={previewHTML}
              templateName={template?.name}
              isLoading={isLoading}
              previewError={previewError}
              hasCV={!!selectedCV}
            />

            {/* Mall-info */}
            <MallInfoCard template={template} />

            {/* Toolbar (font + toggles) - placerad direkt over CTA sa
                anvandaren ser senaste anpassning innan generering */}
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
        </section>
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
  isLoading,
  previewError,
  hasCV,
}: {
  previewHTML: string;
  templateName: string | undefined;
  isLoading: boolean;
  previewError: string | null;
  hasCV: boolean;
}) {
  return (
    <div
      className="rounded-xl bg-white border border-orange-100 overflow-hidden"
      >
      {/* Topp-rad: Live-preview-rubrik */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-orange-100/70 bg-orange-50/40">
        <div className="flex items-center gap-2">
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
            style={{
              background: '#EA580C',
            }}
          >
            <Eye className="w-3.5 h-3.5" strokeWidth={2.5} />
          </span>
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-orange-700">
              Live förhandsvisning
            </div>
            {templateName && (
              <div className="text-sm font-bold text-neutral-900 leading-tight">
                {templateName}
              </div>
            )}
          </div>
        </div>
        {isLoading && (
          <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {/* Preview-area: skala A4-bredden till tillgangligt utrymme pa mobil */}
      <div className="relative bg-neutral-100 max-h-[850px] overflow-y-auto overflow-x-hidden">
        {!hasCV && <PreviewEmptyState />}
        {hasCV && previewError && <PreviewError message={previewError} />}
        {hasCV && !previewError && previewHTML && (
          /* Nyckeln byts nar previewn andras, sa React monterar om noden och
             in-tonningen kor pa nytt. AnimatePresence "wait" tonade forst ut
             den gamla; med bara en in-tonning byts innehallet direkt och tonas
             in, vilket ser likadant ut men utan bibliotek. Enbart opacity, sa
             ingen layoutforskjutning. */
          <div
            key={previewHTML.slice(0, 100)}
            className="motion-safe:animate-[fadeIn_200ms_ease-out_both]"
          >
            <ScaledPreview html={previewHTML} />
          </div>
        )}
        {hasCV && !previewError && !previewHTML && isLoading && <PreviewLoading />}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  ScaledPreview - skalar A4-bredden till mobilskarm                          */
/* -------------------------------------------------------------------------- */

const A4_WIDTH_PX = 794; // 210mm @ 96dpi
/** 297mm @ 96dpi. En A4-sida har känd proportion även innan innehållet mätts. */
const A4_HEIGHT_PX = 1123;
const HORIZONTAL_PADDING = 24; // 12px var sida

function ScaledPreview({ html }: { html: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(A4_WIDTH_PX + HORIZONTAL_PADDING);
  const [contentHeight, setContentHeight] = useState(0);

  // Matt tillgangligt utrymme i wrapper-divren
  useEffect(() => {
    if (!wrapperRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  // Matt riktig hojd pa det renderade CV:t (foran scaling)
  useEffect(() => {
    if (!contentRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContentHeight(entry.contentRect.height);
      }
    });
    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [html]);

  const availableWidth = Math.max(containerWidth - HORIZONTAL_PADDING, 280);
  const scale = availableWidth < A4_WIDTH_PX ? availableWidth / A4_WIDTH_PX : 1;
  const scaledHeight = contentHeight * scale;

  return (
    <div ref={wrapperRef} className="px-3 sm:px-4 py-3 sm:py-4 flex justify-center">
      {/* Outer-div har den slutgiltiga (skalade) hojden sa containern reserverar
          ratt utrymme. transform paverkar inte layout-storlek, dafor reservation. */}
      <div
        style={{
          // Bredden följer föräldern, höjden följer A4-proportionen via CSS.
          // Tidigare räknades båda ur en JS-mätning av containern, som
          // startade på desktop-bredd och korrigerades efter första
          // renderingen. Det var samma gissning som MallToolbar gjorde, och
          // den ritade om hela kolumnen på mobil. aspect-ratio reserverar
          // ytan redan i server-HTML, utan att någon behöver mäta.
          width: '100%',
          maxWidth: `${A4_WIDTH_PX}px`,
          aspectRatio: `${A4_WIDTH_PX} / ${A4_HEIGHT_PX}`,
          height: contentHeight > 0 ? `${scaledHeight}px` : undefined,
          flexShrink: 0,
        }}
      >
        {/* Mallens HTML är ett helt CV-dokument och har därför en egen h1 med
            personens namn. Helt rätt i en PDF, men här ligger dokumentet inuti
            en sida som redan har sin rubrik, så sidan fick två h1 och
            rubrikträdet sa emot sig själv. Förhandsvisningen är en bild av
            resultatet, inte läsbar struktur: role="img" kapslar in den och
            håller mallens rubriker utanför sidans disposition. */}
        <div
          ref={contentRef}
          className="bg-white"
          role="img"
          aria-label="Förhandsvisning av ditt CV i vald mall"
          style={{
            width: `${A4_WIDTH_PX}px`,
            transform: scale < 1 ? `scale(${scale})` : undefined,
            transformOrigin: 'top left',
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}

function PreviewEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-20 min-h-[70vh] sm:min-h-[560px]">
      <div className="w-14 h-14 rounded-xl flex items-center justify-center text-orange-700 bg-orange-50 mb-4">
        <FileText className="w-7 h-7" strokeWidth={2} />
      </div>
      <h3 className="text-base font-bold text-neutral-900 mb-1">Välj ett CV först</h3>
      <p className="text-sm text-neutral-600 max-w-sm">
        När du valt ett CV ovanför ser du hur det ser ut i den valda mallen direkt här.
      </p>
    </div>
  );
}

function PreviewLoading() {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-20 min-h-[70vh] sm:min-h-[560px]">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm text-neutral-600">Förbereder förhandsvisning...</p>
    </div>
  );
}

function PreviewError({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-20 min-h-[70vh] sm:min-h-[560px]">
      <p className="text-sm text-neutral-600 mb-2">{message}</p>
      <p className="text-xs text-neutral-500">Försök välja en annan mall eller ladda om sidan.</p>
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
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-white font-semibold text-base min-h-[56px] transition-all hover: active:scale-[0.99]"
        style={{
          background: '#EA580C',
        }}
      >
        <Crown className="w-5 h-5" strokeWidth={2.5} />
        Lås upp Premium för {templateName || 'denna mall'}
      </button>
    );
  }

  return (
    <button
      onClick={onGenerate}
      disabled={!canGenerate}
      className={`w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-white font-semibold text-base min-h-[56px] transition-all ${
        canGenerate ? 'hover: active:scale-[0.99]' : 'opacity-50 cursor-not-allowed'
      }`}
      style={{
        background: '#EA580C',
      }}
    >
      {isGenerating ? (
        <>
          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Skapar PDF...
        </>
      ) : (
        <>
          <FileText className="w-5 h-5" strokeWidth={2.5} />
          Skapa CV-PDF
          <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
        </>
      )}
    </button>
  );
}
