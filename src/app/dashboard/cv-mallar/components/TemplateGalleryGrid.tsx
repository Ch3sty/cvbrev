'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Crown,
  Lock,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { SIMPLE_TEMPLATES, type SimpleTemplate } from '@/lib/cv/simple-templates';

type Category = SimpleTemplate['category'] | 'all';

interface TemplateGalleryGridProps {
  selectedTemplate: string | null;
  onTemplateSelect: (templateId: string) => void;
  isPremium: boolean;
  onUpgradeClick: () => void;
}

const CATEGORY_PILLS: Array<{ id: Category; label: string }> = [
  { id: 'all', label: 'Alla mallar' },
  { id: 'modern', label: 'Modern' },
  { id: 'traditional', label: 'Traditionell' },
  { id: 'creative', label: 'Kreativ' },
];

export default function TemplateGalleryGrid({
  selectedTemplate,
  onTemplateSelect,
  isPremium,
  onUpgradeClick,
}: TemplateGalleryGridProps) {
  const [category, setCategory] = useState<Category>('all');
  const [mobileIndex, setMobileIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const filtered =
    category === 'all'
      ? SIMPLE_TEMPLATES
      : SIMPLE_TEMPLATES.filter((t) => t.category === category);

  // Sync carousel-index med selected
  useEffect(() => {
    const idx = filtered.findIndex((t) => t.id === selectedTemplate);
    if (idx !== -1) setMobileIndex(idx);
  }, [selectedTemplate, category]); // eslint-disable-line react-hooks/exhaustive-deps

  const scrollToIndex = (i: number) => {
    if (carouselRef.current) {
      const w = carouselRef.current.offsetWidth;
      carouselRef.current.scrollTo({ left: i * w, behavior: 'smooth' });
    }
    setMobileIndex(i);
  };

  const handleScroll = () => {
    if (!carouselRef.current) return;
    const w = carouselRef.current.offsetWidth;
    const i = Math.round(carouselRef.current.scrollLeft / w);
    if (i !== mobileIndex && i >= 0 && i < filtered.length) {
      setMobileIndex(i);
    }
  };

  return (
    <div className="space-y-5">
      {/* Kategori-pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
        {CATEGORY_PILLS.map((pill) => {
          const isActive = pill.id === category;
          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => setCategory(pill.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all min-h-[36px] ${
                isActive
                  ? 'text-white shadow-md'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-orange-300'
              }`}
              style={
                isActive
                  ? {
                      background:
                        'linear-gradient(135deg, #F97316, #DC2626)',
                      boxShadow: '0 4px 12px -2px rgba(220, 38, 38, 0.35)',
                    }
                  : undefined
              }
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {/* Mobile carousel */}
      <div className="block md:hidden">
        <div className="relative">
          {mobileIndex > 0 && (
            <button
              type="button"
              onClick={() => scrollToIndex(mobileIndex - 1)}
              className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white/95 backdrop-blur rounded-full shadow-lg flex items-center justify-center border border-slate-200"
              aria-label="Föregående mall"
            >
              <ChevronLeft className="w-5 h-5 text-slate-700" />
            </button>
          )}
          {mobileIndex < filtered.length - 1 && (
            <button
              type="button"
              onClick={() => scrollToIndex(mobileIndex + 1)}
              className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white/95 backdrop-blur rounded-full shadow-lg flex items-center justify-center border border-slate-200"
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
            {filtered.map((template) => {
              const isSelected = selectedTemplate === template.id;
              const isLocked = template.tier === 'premium' && !isPremium;
              return (
                <div key={template.id} className="flex-shrink-0 w-full snap-center">
                  <TemplateCard
                    template={template}
                    isSelected={isSelected}
                    isLocked={isLocked}
                    onSelect={() => onTemplateSelect(template.id)}
                    onUpgrade={onUpgradeClick}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex justify-center gap-1.5 mt-2">
            {filtered.map((t, i) => (
              <button
                key={t.id}
                type="button"
                onClick={() => scrollToIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === mobileIndex ? 'w-6' : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
                style={
                  i === mobileIndex
                    ? { background: 'linear-gradient(90deg, #F97316, #DC2626)' }
                    : undefined
                }
                aria-label={`Gå till mall ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Desktop grid */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((template) => {
          const isSelected = selectedTemplate === template.id;
          const isLocked = template.tier === 'premium' && !isPremium;
          return (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={isSelected}
              isLocked={isLocked}
              onSelect={() => onTemplateSelect(template.id)}
              onUpgrade={onUpgradeClick}
            />
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-slate-500 text-sm">
          Inga mallar hittades i denna kategori.
        </div>
      )}
    </div>
  );
}

function TemplateCard({
  template,
  isSelected,
  isLocked,
  onSelect,
  onUpgrade,
}: {
  template: SimpleTemplate;
  isSelected: boolean;
  isLocked: boolean;
  onSelect: () => void;
  onUpgrade: () => void;
}) {
  const handleClick = () => {
    if (isLocked) onUpgrade();
    else onSelect();
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      whileHover={!isLocked ? { y: -3 } : {}}
      whileTap={!isLocked ? { scale: 0.98 } : {}}
      className={`group relative w-full text-left bg-white rounded-2xl border-2 transition-all overflow-hidden focus:outline-none ${
        isSelected
          ? 'border-emerald-500'
          : isLocked
          ? 'border-slate-200 cursor-pointer'
          : 'border-slate-200 hover:border-orange-300'
      }`}
      style={
        isSelected
          ? {
              boxShadow:
                '0 0 0 4px rgba(16, 185, 129, 0.15), 0 12px 28px -8px rgba(16, 185, 129, 0.3)',
            }
          : { boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)' }
      }
      aria-pressed={isSelected}
    >
      {/* Topp-linje (orange/röd default, emerald när vald) */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] z-10"
        style={{
          background: isSelected
            ? 'linear-gradient(90deg, #10B981, #059669)'
            : 'linear-gradient(90deg, #F97316, #DC2626)',
        }}
      />

      {/* Premium-badge */}
      {template.tier === 'premium' && (
        <div className="absolute top-2.5 right-2.5 z-20">
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
            {isLocked ? <Lock className="w-3 h-3" /> : <Crown className="w-3 h-3" />}
            Premium
          </div>
        </div>
      )}

      {/* Vald check-badge */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center z-20"
          style={{
            background: 'linear-gradient(135deg, #10B981, #059669)',
            boxShadow: '0 4px 10px -2px rgba(16, 185, 129, 0.5)',
          }}
        >
          <Check className="w-4 h-4 text-white" strokeWidth={3} />
        </motion.div>
      )}

      {/* Preview */}
      <div className="relative bg-slate-50 aspect-[3/4] overflow-hidden border-b border-slate-100">
        <Image
          src={template.imagePath}
          alt={`${template.name} CV-mall`}
          fill
          className={`object-contain p-3 transition-opacity ${isLocked ? 'opacity-50' : 'opacity-100'}`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Lock overlay för premium-låsta */}
        {isLocked && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center">
            <div className="bg-white rounded-2xl px-4 py-3 shadow-lg border border-slate-200 text-center">
              <Lock className="w-5 h-5 text-slate-700 mx-auto mb-1.5" strokeWidth={2.25} />
              <div className="text-xs font-bold text-slate-900 mb-2">Premium-mall</div>
              <span
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-white px-3 py-1.5 rounded-lg"
                style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)' }}
              >
                <Crown className="w-3 h-3" />
                Lås upp
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h4 className="text-sm font-bold text-slate-900 leading-tight">
          {template.name}
        </h4>
        <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
          {template.description}
        </p>
        <div className="mt-2.5 flex items-center gap-1.5">
          <CategoryBadge category={template.category} />
          {template.tier === 'free' && (
            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full font-semibold">
              Gratis
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}

function CategoryBadge({ category }: { category: SimpleTemplate['category'] }) {
  const labels: Record<SimpleTemplate['category'], string> = {
    modern: 'Modern',
    traditional: 'Traditionell',
    creative: 'Kreativ',
  };
  return (
    <span className="text-[10px] bg-slate-50 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded-full font-medium">
      {labels[category]}
    </span>
  );
}
