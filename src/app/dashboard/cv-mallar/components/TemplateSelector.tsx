'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { ChevronDown, LayoutGrid, List, ShieldCheck, Crown, Lock } from 'lucide-react';
import { SIMPLE_TEMPLATES, getTemplateById, type SimpleTemplate } from '@/lib/cv/simple-templates';
import {
  CategoryPill,
  TemplateRow,
  TEMPLATE_CATEGORIES,
  type CategoryFilter,
} from './TemplateListSidebar';

interface TemplateSelectorProps {
  selectedTemplate: string;
  onTemplateSelect: (templateId: string) => void;
  isPremium: boolean;
  onUpgradeClick?: () => void;
}

type ViewMode = 'closed' | 'dropdown' | 'gallery';

/**
 * Kompakt mall-vajare som ersatter TemplateListSidebar.
 *
 * - Default: en knapp som visar vald mall (~70px hOg)
 * - Klick pa knappen: oppnar dropdown med lista
 * - Klick pa "Galleri"-toggle: oppnar grid-vy med thumbnails
 * - Bara ett state at gangen (dropdown ELLER galleri)
 */
export default function TemplateSelector({
  selectedTemplate,
  onTemplateSelect,
  isPremium,
  onUpgradeClick,
}: TemplateSelectorProps) {
  const [view, setView] = useState<ViewMode>('closed');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const containerRef = useRef<HTMLDivElement>(null);

  const current = useMemo(() => getTemplateById(selectedTemplate), [selectedTemplate]);

  const filteredTemplates = useMemo(() => {
    if (activeCategory === 'all') return SIMPLE_TEMPLATES;
    return SIMPLE_TEMPLATES.filter(t => t.category === activeCategory);
  }, [activeCategory]);

  // Click-outside stOnger dropdown (men INTE galleri - galleri ar inline-expanderat)
  useEffect(() => {
    if (view !== 'dropdown') return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setView('closed');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [view]);

  // Gråa mallar går att förhandsvisa i full storlek, inte ladda ned
  // (spec-onboarding 2026-09-22, sektion 3). Valet släpps alltid igenom,
  // spärren sitter på nedladdningen.
  const handleSelect = (templateId: string) => {
    onTemplateSelect(templateId);
    setView('closed');
  };

  const isAtsSafe = current?.features?.atsSafe === true;
  const isLocked = current?.tier === 'premium' && !isPremium;

  return (
    <div ref={containerRef} className="relative">
      {/* Topp-knapp + galleri-toggle */}
      <div className="flex items-stretch gap-2 rounded-xl border border-kant bg-panel p-2">
        {/* Vänster: vald mall, klick = dropdown */}
        <button
          type="button"
          onClick={() => setView(v => (v === 'dropdown' ? 'closed' : 'dropdown'))}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg p-1.5 text-left transition-colors hover:bg-insunken"
          aria-expanded={view === 'dropdown'}
          aria-label="Byt mall"
        >
          {/* Thumbnail: papperet får vara vitt */}
          <span className="relative h-14 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-kant bg-white">
            {current && (
              <Image
                src={current.imagePath}
                alt={current.name}
                fill
                className="object-cover object-top"
                sizes="40px"
              />
            )}
            {isLocked && (
              <span className="absolute inset-0 flex items-center justify-center bg-ink-1/60">
                <Lock className="h-3 w-3 text-white" strokeWidth={1.75} aria-hidden="true" />
              </span>
            )}
          </span>

          {/* Info */}
          <span className="min-w-0 flex-1">
            <span className="block text-steg uppercase text-ink-3">Aktiv mall</span>
            <span className="mt-0.5 flex items-center gap-1.5">
              <span className="truncate text-kort text-ink-1">
                {current?.name || 'Välj mall'}
              </span>
              {current?.tier === 'premium' && (
                <Crown
                  className="h-3.5 w-3.5 flex-shrink-0 text-ink-3"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
              )}
            </span>
            {/* Raden får INTE radbryta. Med flex-wrap rymdes "ATS-säker
                Modern · Gratis" på två rader med reservsnittet och på en
                enda när Inter tonade in: kortet krympte 24 px och allt under
                det flyttades 46 px uppåt, alltså sidans hela CLS på 0,05.
                En rad med truncate kan bara ha en höjd. */}
            <span className="flex items-center gap-1.5 overflow-hidden whitespace-nowrap text-meta text-ink-3">
              {isAtsSafe && (
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck
                    className="h-3.5 w-3.5 text-positiv"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  ATS-säker
                </span>
              )}
              <span>
                {current?.category === 'modern' && 'Modern'}
                {current?.category === 'traditional' && 'Traditionell'}
                {current?.category === 'creative' && 'Kreativ'}
              </span>
              {current?.tier === 'free' && <span>· Gratis</span>}
            </span>
          </span>

          <ChevronDown
            className={`h-5 w-5 flex-shrink-0 text-ink-3 transition-transform ${
              view === 'dropdown' ? 'rotate-180' : ''
            }`}
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </button>

        {/* Galleri-toggle */}
        <button
          type="button"
          onClick={() => setView(v => (v === 'gallery' ? 'closed' : 'gallery'))}
          className={`inline-flex min-h-[44px] flex-shrink-0 items-center gap-1.5 rounded-lg border border-kant-stark px-3 text-sm font-medium transition-colors sm:px-4 ${
            view === 'gallery'
              ? 'bg-insunken text-ink-1'
              : 'bg-panel text-ink-1 hover:bg-insunken'
          }`}
          aria-pressed={view === 'gallery'}
          aria-label={view === 'gallery' ? 'Stäng galleri' : 'Visa galleri'}
        >
          {view === 'gallery' ? (
            <>
              <List className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              <span className="hidden sm:inline">Lista</span>
            </>
          ) : (
            <>
              <LayoutGrid className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              <span className="hidden sm:inline">Galleri</span>
            </>
          )}
        </button>
      </div>

      {/* Dropdown-lista */}
      {view === 'dropdown' && (
        <div
          className="absolute left-0 right-0 top-full z-30 mt-2 rounded-xl border border-kant bg-panel max-h-[440px] overflow-y-auto motion-safe:animate-[dropdownIn_150ms_ease-out_both]"
        >
            <div className="sticky top-0 z-10 border-b border-kant bg-panel px-3 pb-2 pt-3">
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                {TEMPLATE_CATEGORIES.map(cat => (
                  <CategoryPill
                    key={cat.value}
                    label={cat.label}
                    active={activeCategory === cat.value}
                    onClick={() => setActiveCategory(cat.value)}
                  />
                ))}
              </div>
            </div>
            <ul className="p-2 flex flex-col gap-1.5">
              {filteredTemplates.map(template => (
                <TemplateRow
                  key={template.id}
                  template={template}
                  isSelected={selectedTemplate === template.id}
                  isPremiumUser={isPremium}
                  onSelect={() => handleSelect(template.id)}
                />
              ))}
            </ul>
        </div>
      )}

      {/* Galleri-vy (inline, expanderar nedåt).
          Höjden animeras med grid-template-rows i stället för height: auto,
          som framer-motion använde. Skillnaden spelar roll för oss: grid-raden
          går från 0fr till 1fr utan att webbläsaren behöver mäta om innehållet,
          och expansionen sker bara på användarens klick, aldrig vid inladdning.
          CLS på sidan ska förbli 0. */}
      {view === 'gallery' && (
        <div className="grid grid-rows-[0fr] opacity-0 motion-safe:animate-[galleryIn_250ms_ease-out_forwards] motion-reduce:grid-rows-[1fr] motion-reduce:opacity-100">
          <div className="overflow-hidden">
            <div className="mt-3 rounded-xl border border-kant bg-panel p-4"
              >
              {/* Kategori-pillar */}
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide mb-3 border-b border-kant pb-3">
                {TEMPLATE_CATEGORIES.map(cat => (
                  <CategoryPill
                    key={cat.value}
                    label={cat.label}
                    active={activeCategory === cat.value}
                    onClick={() => setActiveCategory(cat.value)}
                  />
                ))}
              </div>

              {/* Grid 2 kol mobil, 3 tablet, 4 desktop */}
              <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredTemplates.map(template => (
                  <GalleryCard
                    key={template.id}
                    template={template}
                    isSelected={selectedTemplate === template.id}
                    isPremiumUser={isPremium}
                    onSelect={() => handleSelect(template.id)}
                  />
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes dropdownIn {
              from { opacity: 0; transform: translateY(-8px); }
              to   { opacity: 1; transform: translateY(0); }
            }
            @keyframes galleryIn {
              from { grid-template-rows: 0fr; opacity: 0; }
              to   { grid-template-rows: 1fr; opacity: 1; }
            }
          `,
        }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  GalleryCard                                                               */
/* -------------------------------------------------------------------------- */

function GalleryCard({
  template,
  isSelected,
  isPremiumUser,
  onSelect,
}: {
  template: SimpleTemplate;
  isSelected: boolean;
  isPremiumUser: boolean;
  onSelect: () => void;
}) {
  const isLocked = template.tier === 'premium' && !isPremiumUser;
  const isAtsSafe = template.features?.atsSafe === true;

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={isSelected}
        className={`w-full rounded-xl border p-2 text-left transition-colors ${
          isSelected
            ? 'border-ink-1 bg-panel'
            : 'border-kant bg-panel hover:border-kant-stark'
        } ${isLocked ? 'opacity-[.55]' : ''}`}
      >
        {/* Papperet får vara vitt */}
        <div className="relative mb-2 aspect-[3/4] overflow-hidden rounded-lg border border-kant bg-white">
          <Image
            src={template.imagePath}
            alt={template.name}
            fill
            className="object-cover object-top"
            sizes="(min-width: 1024px) 200px, (min-width: 640px) 220px, 160px"
          />
          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink-1/60">
              <Lock className="h-5 w-5 text-white" strokeWidth={1.75} aria-hidden="true" />
            </div>
          )}
          {isSelected && (
            <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-ink-1">
              <svg
                className="h-3.5 w-3.5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}
        </div>
        <div className="px-1">
          <div className="mb-0.5 flex items-center gap-1">
            <span className="flex-1 truncate text-kort text-ink-1">{template.name}</span>
            {template.tier === 'premium' && (
              <Crown
                className="h-3.5 w-3.5 flex-shrink-0 text-ink-3"
                strokeWidth={1.75}
                aria-hidden="true"
              />
            )}
          </div>
          {isAtsSafe && (
            <div className="flex items-center gap-1 text-meta text-ink-3">
              <ShieldCheck
                className="h-3.5 w-3.5 text-positiv"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              ATS-säker
            </div>
          )}
        </div>
      </button>
    </li>
  );
}
