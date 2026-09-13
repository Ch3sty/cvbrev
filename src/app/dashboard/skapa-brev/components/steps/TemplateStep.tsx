'use client';

/**
 * Steg 3: hur ska brevet se ut?
 *
 * Mallkorten följer ChoiceCard-reglerna (kant ink-1 plus bock vid val) men
 * har miniatyren ovanför texten, så de ritas här. Karusell på mobil, rutnät
 * från md. Förhandsvisningen i full storlek öppnas i ett Sheet. Ingen rörelse,
 * ingen orange yta.
 */

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DOCX_TEMPLATES, type DocxTemplateId } from '@/lib/letters/docx-templates';
import Sheet from '@/components/shell/Sheet';
import { IkonMallar } from '@/components/illustrations/Ikoner';

interface TemplateStepProps {
  templateId: string;
  onTemplateChange: (templateId: string) => void;
  isPremium: boolean;
  isActive: boolean;
  registerRef?: (el: HTMLElement | null) => void;
}

type Template = (typeof DOCX_TEMPLATES)[keyof typeof DOCX_TEMPLATES];

const CHECK = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 10.5l4 4 8-9" />
  </svg>
);

function TemplateCard({
  id,
  template,
  isSelected,
  isLocked,
  showPreview,
  onSelect,
  onOpenPreview,
}: {
  id: string;
  template: Template;
  isSelected: boolean;
  isLocked: boolean;
  /**
   * Ska mallens iframe monteras alls? Varje iframe är ett eget dokument som
   * konkurrerar om nätverket och CPU:n. På mobil monteras bara den aktiva
   * mallen och dess grannar; resten får en platshållare med samma höjd.
   */
  showPreview: boolean;
  onSelect: () => void;
  onOpenPreview: () => void;
}) {
  const meta = [
    template.tier === 'premium' ? 'Premium' : 'Gratis',
    ...template.industries.slice(0, 2),
  ].join(' · ');

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      disabled={isLocked}
      onClick={onSelect}
      className={`relative w-full rounded-xl border bg-panel p-3 text-left transition-[border-color] duration-[160ms] ease-out disabled:cursor-not-allowed disabled:opacity-60 ${
        isSelected ? 'border-ink-1 shadow-val' : 'border-kant hover:border-kant-stark'
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute right-5 top-5 z-10 inline-flex h-[22px] w-[22px] items-center justify-center rounded-full bg-ink-1 text-white transition-opacity duration-[160ms] ${
          isSelected ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {CHECK}
      </span>

      {/* Miniatyren. Klick här öppnar förhandsvisningen i stället för att
          välja mallen; därför stoppas händelsen. */}
      <div
        className="relative h-44 w-full overflow-hidden rounded-lg border border-kant bg-insunken shadow-insunken"
        onClick={(e) => {
          e.stopPropagation();
          onOpenPreview();
        }}
      >
        {showPreview ? (
          <iframe
            src={`/images/templates/${id}-preview.html`}
            loading="lazy"
            className="pointer-events-none h-full w-full"
            style={{
              transform: 'scale(0.25)',
              transformOrigin: 'top left',
              width: '400%',
              height: '400%',
            }}
            title={`Förhandsvisning av ${template.name}`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-3" aria-hidden="true">
            <IkonMallar size={24} />
          </div>
        )}
        <span className="absolute bottom-2 right-2 rounded-lg border border-kant bg-panel px-2 py-0.5 text-meta text-ink-2">
          Visa större
        </span>
      </div>

      <span className="mt-3 block text-sm font-semibold leading-5 tracking-tight text-ink-1">
        {template.name}
      </span>
      <span className="mt-0.5 block text-sm leading-[22px] text-ink-2">{template.description}</span>
      <span className="mt-1 block text-meta text-ink-3">{meta}</span>
    </button>
  );
}

export default function TemplateStep({
  templateId,
  onTemplateChange,
  isPremium,
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

  const scrollToIndex = (index: number) => {
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.offsetWidth;
      carouselRef.current.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
    }
    setCurrentMobileIndex(index);
  };

  const handleScroll = () => {
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.offsetWidth;
      const newIndex = Math.round(carouselRef.current.scrollLeft / cardWidth);
      if (newIndex !== currentMobileIndex && newIndex >= 0 && newIndex < templates.length) {
        setCurrentMobileIndex(newIndex);
      }
    }
  };

  const previewTemplate = previewTemplateId
    ? DOCX_TEMPLATES[previewTemplateId as keyof typeof DOCX_TEMPLATES]
    : null;
  const previewLocked = !!previewTemplate && previewTemplate.tier === 'premium' && !isPremium;

  const ARROW =
    'absolute top-24 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg border border-kant bg-panel text-ink-1 shadow-svav';

  return (
    <section ref={registerRef} data-flow-section="template">
      {/* Mobil: karusell */}
      <div className="block md:hidden">
        <div className="relative">
          {currentMobileIndex > 0 ? (
            <button
              type="button"
              onClick={() => scrollToIndex(currentMobileIndex - 1)}
              className={`${ARROW} left-1`}
              aria-label="Föregående mall"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
            </button>
          ) : null}
          {currentMobileIndex < templates.length - 1 ? (
            <button
              type="button"
              onClick={() => scrollToIndex(currentMobileIndex + 1)}
              className={`${ARROW} right-1`}
              aria-label="Nästa mall"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
            </button>
          ) : null}

          <div
            ref={carouselRef}
            role="radiogroup"
            aria-label="Brevmall"
            className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2"
            onScroll={handleScroll}
          >
            {templates.map(([id, template], index) => {
              const isLocked = template.tier === 'premium' && !isPremium;
              // Aktiv mall plus en granne åt varje håll.
              const showPreview = Math.abs(index - currentMobileIndex) <= 1;
              return (
                <div key={id} className="w-full flex-shrink-0 snap-center">
                  <TemplateCard
                    id={id}
                    template={template}
                    isSelected={templateId === id}
                    isLocked={isLocked}
                    showPreview={showPreview}
                    onSelect={() => onTemplateChange(id as DocxTemplateId)}
                    onOpenPreview={() => setPreviewTemplateId(id)}
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-2 flex justify-center gap-1.5">
            {templates.map(([id], index) => (
              <button
                key={id}
                type="button"
                onClick={() => scrollToIndex(index)}
                className={`h-2 rounded-full transition-[width,background-color] duration-[160ms] ${
                  index === currentMobileIndex ? 'w-6 bg-ink-1' : 'w-2 bg-kant-stark'
                }`}
                aria-label={`Gå till mall ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Desktop: rutnät. Alla monteras, loading="lazy" sköter vikningen. */}
      <div role="radiogroup" aria-label="Brevmall" className="hidden gap-3 md:grid md:grid-cols-2 lg:grid-cols-3">
        {templates.map(([id, template]) => (
          <TemplateCard
            key={id}
            id={id}
            template={template}
            isSelected={templateId === id}
            isLocked={template.tier === 'premium' && !isPremium}
            showPreview
            onSelect={() => onTemplateChange(id as DocxTemplateId)}
            onOpenPreview={() => setPreviewTemplateId(id)}
          />
        ))}
      </div>

      <Sheet
        open={!!previewTemplateId}
        onClose={() => setPreviewTemplateId(null)}
        title={previewTemplate?.name}
        description={previewTemplate?.description}
        size="lg"
        footer={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-5">
            {previewLocked ? (
              <p className="text-sm text-ink-2">Den här mallen ingår i Premium.</p>
            ) : null}
            <button
              type="button"
              onClick={() => setPreviewTemplateId(null)}
              className="inline-flex min-h-11 items-center justify-center text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 hover:text-ink-1"
            >
              Stäng
            </button>
            {!previewLocked ? (
              <button
                type="button"
                onClick={() => {
                  if (previewTemplateId) onTemplateChange(previewTemplateId);
                  setPreviewTemplateId(null);
                }}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-medium text-white transition-colors hover:bg-ink-hover"
              >
                Välj denna mall
              </button>
            ) : null}
          </div>
        }
      >
        {previewTemplateId ? (
          /* A4-proportionen via aspect-ratio i stället för en fast höjd. */
          <div className="mx-auto w-full max-w-[21cm] overflow-hidden rounded-lg border border-kant bg-panel">
            <iframe
              src={`/images/templates/${previewTemplateId}-preview.html`}
              className="w-full border-0"
              style={{ aspectRatio: '210 / 297' }}
              title={`Förhandsvisning av ${previewTemplate?.name ?? 'mall'}`}
            />
          </div>
        ) : null}
      </Sheet>
    </section>
  );
}
