'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
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

  const handleSelect = (templateId: string) => {
    const tpl = getTemplateById(templateId);
    if (tpl?.tier === 'premium' && !isPremium) {
      onUpgradeClick?.();
      return;
    }
    onTemplateSelect(templateId);
    setView('closed');
  };

  const isAtsSafe = current?.features?.atsSafe === true;
  const isLocked = current?.tier === 'premium' && !isPremium;

  return (
    <div ref={containerRef} className="relative">
      {/* Topp-knapp + galleri-toggle */}
      <div
        className="flex items-stretch gap-2 p-2 rounded-2xl bg-orange-50/40 border border-orange-200"
        style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.18)' }}
      >
        {/* Aktiv-pip (vänster kant) */}
        <span
          aria-hidden
          className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full"
          style={{ background: 'linear-gradient(180deg, #F97316, #DC2626)' }}
        />

        {/* Vänster: vald mall, klick = dropdown */}
        <button
          onClick={() => setView(v => (v === 'dropdown' ? 'closed' : 'dropdown'))}
          className="flex-1 flex items-center gap-3 p-1.5 rounded-xl hover:bg-white/60 transition-colors text-left min-w-0"
          aria-expanded={view === 'dropdown'}
          aria-label="Byt mall"
        >
          {/* Thumbnail */}
          <span className="relative flex-shrink-0 w-10 h-14 rounded-lg overflow-hidden bg-white border border-orange-100">
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
              <span className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                <Lock className="w-3 h-3 text-white" strokeWidth={2.5} />
              </span>
            )}
          </span>

          {/* Info */}
          <span className="flex-1 min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-orange-700 mb-0.5">
              Aktiv mall
            </span>
            <span className="flex items-center gap-1.5 mb-0.5">
              <span className="text-sm font-bold text-slate-900 truncate">
                {current?.name || 'Välj mall...'}
              </span>
              {current?.tier === 'premium' && (
                <Crown
                  className={`w-3 h-3 flex-shrink-0 ${isLocked ? 'text-amber-500' : 'text-orange-600'}`}
                  strokeWidth={2.5}
                  fill={isLocked ? 'rgb(251 191 36)' : 'rgb(234 88 12)'}
                />
              )}
            </span>
            <span className="flex items-center gap-1.5 flex-wrap">
              {isAtsSafe && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                  <ShieldCheck className="w-2.5 h-2.5" strokeWidth={3} />
                  ATS
                </span>
              )}
              <span className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">
                {current?.category === 'modern' && 'Modern'}
                {current?.category === 'traditional' && 'Traditionell'}
                {current?.category === 'creative' && 'Kreativ'}
              </span>
              {current?.tier === 'free' && (
                <span className="text-[10px] uppercase tracking-wide text-emerald-700 font-semibold">
                  · Gratis
                </span>
              )}
            </span>
          </span>

          <ChevronDown
            className={`flex-shrink-0 w-5 h-5 text-slate-500 transition-transform ${
              view === 'dropdown' ? 'rotate-180' : ''
            }`}
            strokeWidth={2.5}
          />
        </button>

        {/* Galleri-toggle */}
        <button
          onClick={() => setView(v => (v === 'gallery' ? 'closed' : 'gallery'))}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 sm:px-4 rounded-xl border font-semibold text-xs uppercase tracking-wide transition-all min-h-[44px] ${
            view === 'gallery'
              ? 'text-white border-transparent shadow-md'
              : 'bg-white border-orange-100 text-slate-700 hover:border-orange-200'
          }`}
          style={
            view === 'gallery'
              ? {
                  background: 'linear-gradient(135deg, #F97316, #DC2626)',
                  boxShadow: '0 4px 12px -4px rgba(220, 38, 38, 0.4)',
                }
              : undefined
          }
          aria-pressed={view === 'gallery'}
          aria-label={view === 'gallery' ? 'Stäng galleri' : 'Visa galleri'}
        >
          {view === 'gallery' ? (
            <>
              <List className="w-4 h-4" strokeWidth={2.5} />
              <span className="hidden sm:inline">Lista</span>
            </>
          ) : (
            <>
              <LayoutGrid className="w-4 h-4" strokeWidth={2.5} />
              <span className="hidden sm:inline">Galleri</span>
            </>
          )}
        </button>
      </div>

      {/* Dropdown-lista */}
      <AnimatePresence>
        {view === 'dropdown' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-orange-100 z-30 max-h-[440px] overflow-y-auto"
            style={{ boxShadow: '0 16px 40px -12px rgba(249, 115, 22, 0.2)' }}
          >
            <div className="sticky top-0 bg-white border-b border-orange-100 px-3 pt-3 pb-2 z-10">
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Galleri-vy (inline, expanderar nedat) */}
      <AnimatePresence>
        {view === 'gallery' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="mt-3 p-4 rounded-2xl bg-white border border-orange-100"
              style={{ boxShadow: '0 8px 24px -12px rgba(249, 115, 22, 0.15)' }}
            >
              {/* Kategori-pillar */}
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-3 mb-3 border-b border-orange-100/70">
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
          </motion.div>
        )}
      </AnimatePresence>
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
        onClick={onSelect}
        className={`group w-full text-left p-2 rounded-2xl border transition-all ${
          isSelected
            ? 'border-orange-300 bg-orange-50/50'
            : 'border-slate-200 bg-white hover:border-orange-200'
        }`}
        style={
          isSelected
            ? { boxShadow: '0 4px 14px -4px rgba(249, 115, 22, 0.25)' }
            : undefined
        }
      >
        <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-slate-50 border border-slate-200 mb-2">
          <Image
            src={template.imagePath}
            alt={template.name}
            fill
            className="object-cover object-top"
            sizes="(min-width: 1024px) 200px, (min-width: 640px) 220px, 160px"
          />
          {isLocked && (
            <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
          )}
          {isSelected && (
            <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)' }}
            >
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}
        </div>
        <div className="px-1">
          <div className="flex items-center gap-1 mb-0.5">
            <span className="font-bold text-sm text-slate-900 truncate flex-1">{template.name}</span>
            {template.tier === 'premium' && (
              <Crown className="w-3 h-3 text-orange-600 flex-shrink-0" strokeWidth={2.5} fill="rgb(234 88 12)" />
            )}
          </div>
          {isAtsSafe && (
            <div className="flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
              <ShieldCheck className="w-2.5 h-2.5" strokeWidth={3} />
              ATS-säker
            </div>
          )}
        </div>
      </button>
    </li>
  );
}
