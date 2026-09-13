'use client';

import Image from 'next/image';
import { Lock, ShieldCheck, Crown, ChevronRight } from 'lucide-react';
import { type SimpleTemplate } from '@/lib/cv/simple-templates';

/**
 * Delarna som mallväljaren använder: kategoripillren och raden i listan.
 *
 * Den gamla sidopanelen och mobilkarusellen som låg här ersattes av
 * TemplateSelector för länge sedan men blev kvar som död kod; de är borta
 * nu. Kvar är bara det som faktiskt renderas.
 */

export type CategoryFilter = 'all' | 'modern' | 'traditional' | 'creative';

export const TEMPLATE_CATEGORIES: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: 'Alla' },
  { value: 'modern', label: 'Modern' },
  { value: 'traditional', label: 'Traditionell' },
  { value: 'creative', label: 'Kreativ' },
];

export function CategoryPill({
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
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex min-h-[44px] flex-shrink-0 items-center whitespace-nowrap rounded-md border px-3.5 text-sm font-medium transition-colors ${
        active
          ? 'border-ink-1 bg-ink-1 text-white'
          : 'border-kant-stark bg-panel text-ink-1 hover:bg-insunken'
      }`}
    >
      {label}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  TemplateRow                                                               */
/* -------------------------------------------------------------------------- */

export function TemplateRow({
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
        className={`flex w-full items-center gap-3 overflow-hidden rounded-xl border p-3 text-left transition-colors ${
          isSelected
            ? 'border-ink-1 bg-panel'
            : 'border-kant bg-panel hover:border-kant-stark'
        }`}
      >
        {/* Thumbnail: papperet får vara vitt */}
        <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-kant bg-white">
          <Image
            src={template.imagePath}
            alt={template.name}
            fill
            className="object-cover object-top"
            sizes="48px"
          />
          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink-1/60">
              <Lock className="h-3.5 w-3.5 text-white" strokeWidth={1.75} aria-hidden="true" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex items-center gap-1.5">
            <span className="truncate text-kort text-ink-1">{template.name}</span>
            {template.tier === 'premium' && (
              <Crown
                className="h-3.5 w-3.5 flex-shrink-0 text-ink-3"
                strokeWidth={1.75}
                aria-hidden="true"
              />
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-meta text-ink-3">
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
              {template.category === 'modern' && 'Modern'}
              {template.category === 'traditional' && 'Traditionell'}
              {template.category === 'creative' && 'Kreativ'}
            </span>
            {template.tier === 'free' && <span>· Gratis</span>}
          </div>
        </div>

        {/* Pil */}
        <ChevronRight
          className="h-4 w-4 flex-shrink-0 text-ink-3"
          strokeWidth={1.75}
          aria-hidden="true"
        />
      </button>
    </li>
  );
}
