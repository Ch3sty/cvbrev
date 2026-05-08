'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Lock, ShieldCheck, Crown, ChevronRight } from 'lucide-react';
import { SIMPLE_TEMPLATES, type SimpleTemplate } from '@/lib/cv/simple-templates';

type CategoryFilter = 'all' | 'modern' | 'traditional' | 'creative';

interface TemplateListSidebarProps {
  selectedTemplate: string | null;
  onTemplateSelect: (templateId: string) => void;
  isPremium: boolean;
  onUpgradeClick?: () => void;
}

const CATEGORIES: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: 'Alla' },
  { value: 'modern', label: 'Modern' },
  { value: 'traditional', label: 'Traditionell' },
  { value: 'creative', label: 'Kreativ' },
];

/**
 * Kompakt vertikal mall-lista (desktop) eller horisontell carousel (mobile).
 *
 * Skiljer sig fran TemplateGalleryGrid genom att vara mycket kompaktare —
 * ~6-8 mallar ryms synliga utan scroll. Live-preview visar mallen i sin
 * helhet hoger om listan.
 */
export default function TemplateListSidebar({
  selectedTemplate,
  onTemplateSelect,
  isPremium,
  onUpgradeClick,
}: TemplateListSidebarProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');

  const filteredTemplates = useMemo(() => {
    if (activeCategory === 'all') return SIMPLE_TEMPLATES;
    return SIMPLE_TEMPLATES.filter(t => t.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="flex flex-col h-full">
      {/* Header med kategori-filter */}
      <div className="flex-shrink-0 mb-4">
        <h2 className="text-base font-black text-slate-900 mb-3 px-1">
          {filteredTemplates.length} mallar
        </h2>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
          {CATEGORIES.map(cat => (
            <CategoryPill
              key={cat.value}
              label={cat.label}
              active={activeCategory === cat.value}
              onClick={() => setActiveCategory(cat.value)}
            />
          ))}
        </div>
      </div>

      {/* Mall-lista — desktop vertikal, mobile horisontell carousel */}
      <div className="flex-1 lg:overflow-y-auto -mx-1 px-1 lg:pb-4">
        {/* Desktop: vertikal lista */}
        <ul className="hidden lg:flex flex-col gap-2">
          {filteredTemplates.map(template => (
            <TemplateRow
              key={template.id}
              template={template}
              isSelected={selectedTemplate === template.id}
              isPremiumUser={isPremium}
              onSelect={() => {
                if (template.tier === 'premium' && !isPremium) {
                  onUpgradeClick?.();
                  return;
                }
                onTemplateSelect(template.id);
              }}
            />
          ))}
        </ul>

        {/* Mobile: horisontell carousel */}
        <ul className="lg:hidden flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4">
          {filteredTemplates.map(template => (
            <TemplateCardMobile
              key={template.id}
              template={template}
              isSelected={selectedTemplate === template.id}
              isPremiumUser={isPremium}
              onSelect={() => {
                if (template.tier === 'premium' && !isPremium) {
                  onUpgradeClick?.();
                  return;
                }
                onTemplateSelect(template.id);
              }}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  CategoryPill                                                              */
/* -------------------------------------------------------------------------- */

function CategoryPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all min-h-[32px] ${
        active
          ? 'text-white shadow-md'
          : 'bg-white border border-orange-100 text-slate-700 hover:border-orange-200'
      }`}
      style={
        active
          ? {
              background: 'linear-gradient(135deg, #F97316, #DC2626)',
              boxShadow: '0 4px 12px -4px rgba(220, 38, 38, 0.4)',
            }
          : undefined
      }
    >
      {label}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  TemplateRow (desktop)                                                     */
/* -------------------------------------------------------------------------- */

function TemplateRow({
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
        className={`group w-full text-left p-3 rounded-2xl border transition-all flex items-center gap-3 relative overflow-hidden ${
          isSelected
            ? 'border-orange-300 bg-orange-50/50'
            : 'border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50/30'
        }`}
        style={
          isSelected
            ? { boxShadow: '0 4px 14px -4px rgba(249, 115, 22, 0.25)' }
            : undefined
        }
      >
        {/* Vald-indikator — animerad puls */}
        {isSelected && (
          <motion.div
            layoutId="selectedDot"
            className="absolute left-0 top-0 bottom-0 w-1"
            style={{
              background: 'linear-gradient(180deg, #F97316, #DC2626)',
            }}
          />
        )}

        {/* Thumbnail */}
        <div className="flex-shrink-0 w-12 h-16 rounded-lg overflow-hidden bg-slate-50 border border-slate-200 relative">
          <Image
            src={template.imagePath}
            alt={template.name}
            fill
            className="object-cover object-top"
            sizes="48px"
          />
          {isLocked && (
            <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
              <Lock className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className={`font-bold text-sm truncate ${isSelected ? 'text-slate-900' : 'text-slate-800'}`}>
              {template.name}
            </span>
            {template.tier === 'premium' && (
              <Crown
                className={`w-3 h-3 flex-shrink-0 ${isLocked ? 'text-amber-500' : 'text-orange-600'}`}
                strokeWidth={2.5}
                fill={isLocked ? 'rgb(251 191 36)' : 'rgb(234 88 12)'}
              />
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {isAtsSafe && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                <ShieldCheck className="w-2.5 h-2.5" strokeWidth={3} />
                ATS
              </span>
            )}
            <span className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">
              {template.category === 'modern' && 'Modern'}
              {template.category === 'traditional' && 'Traditionell'}
              {template.category === 'creative' && 'Kreativ'}
            </span>
            {template.tier === 'free' && (
              <span className="text-[10px] uppercase tracking-wide text-emerald-700 font-semibold">
                · Gratis
              </span>
            )}
          </div>
        </div>

        {/* Pil */}
        <ChevronRight
          className={`flex-shrink-0 w-4 h-4 transition-transform ${
            isSelected ? 'text-orange-600 translate-x-0.5' : 'text-slate-400 group-hover:text-orange-500'
          }`}
          strokeWidth={2.5}
        />
      </button>
    </li>
  );
}

/* -------------------------------------------------------------------------- */
/*  TemplateCardMobile (mobile carousel)                                       */
/* -------------------------------------------------------------------------- */

function TemplateCardMobile({
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
    <li className="flex-shrink-0 snap-start" style={{ width: '160px' }}>
      <button
        onClick={onSelect}
        className={`w-full text-left p-2 rounded-2xl border transition-all relative ${
          isSelected
            ? 'border-orange-300 bg-orange-50/50'
            : 'border-slate-200 bg-white'
        }`}
      >
        <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-slate-50 border border-slate-200 mb-2">
          <Image
            src={template.imagePath}
            alt={template.name}
            fill
            className="object-cover object-top"
            sizes="160px"
          />
          {isLocked && (
            <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
          )}
          {isSelected && (
            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
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
