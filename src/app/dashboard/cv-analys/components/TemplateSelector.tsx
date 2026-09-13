'use client';

import Image from 'next/image';
import { Crown, Lock } from 'lucide-react';
import { SIMPLE_TEMPLATES, type SimpleTemplate } from '@/lib/cv/simple-templates';

interface TemplateSelectorProps {
  selectedTemplateId: string | null;
  onSelectTemplate: (templateId: string) => void;
  subscriptionTier: 'free' | 'premium';
}

/**
 * Mallväljaren i CV-analysens sparsteg.
 *
 * Bort: embla-karusellen med rosa ringar, blå funktionspillar, gradienter i
 * kanterna, det oskarpa premiumrutnätet och pilknapparna. Kvar: ett rutnät
 * av mallar som ryms i vyn, med samma regel som förut (premium leder till
 * prenumerationssidan i stället för att väljas).
 */
export default function TemplateSelector({
  selectedTemplateId,
  onSelectTemplate,
  subscriptionTier,
}: TemplateSelectorProps) {
  const isPremium = subscriptionTier === 'premium';

  const handleTemplateClick = (template: SimpleTemplate) => {
    if (template.tier === 'premium' && !isPremium) {
      window.location.href = '/dashboard/profil/prenumeration';
      return;
    }
    onSelectTemplate(template.id);
  };

  return (
    <div>
      <h4 className="text-kort text-ink-1">Välj CV-mall</h4>
      <p className="mt-0.5 text-meta text-ink-3">
        {SIMPLE_TEMPLATES.length} mallar att välja mellan.
      </p>

      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {SIMPLE_TEMPLATES.map((template) => {
          const isSelected = selectedTemplateId === template.id;
          const isLocked = template.tier === 'premium' && !isPremium;

          return (
            <li key={template.id}>
              <button
                type="button"
                onClick={() => handleTemplateClick(template)}
                aria-pressed={isSelected}
                className={`w-full rounded-xl border p-2 text-left transition-colors ${
                  isSelected
                    ? 'border-ink-1 bg-panel'
                    : 'border-kant bg-panel hover:border-kant-stark'
                }`}
              >
                {/* Papperet får vara vitt */}
                <div className="relative mb-2 aspect-[3/4] overflow-hidden rounded-lg border border-kant bg-white">
                  {template.imagePath && (
                    <Image
                      src={template.imagePath}
                      alt={template.name}
                      fill
                      className="object-cover object-top"
                      sizes="(min-width: 1024px) 200px, (min-width: 640px) 220px, 160px"
                    />
                  )}
                  {isLocked && (
                    <span className="absolute inset-0 flex items-center justify-center bg-ink-1/60">
                      <Lock
                        className="h-5 w-5 text-white"
                        strokeWidth={1.75}
                        aria-hidden="true"
                      />
                    </span>
                  )}
                  {isSelected && (
                    <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-ink-1">
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
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 px-1">
                  <span className="flex-1 truncate text-kort text-ink-1">
                    {template.name}
                  </span>
                  {template.tier === 'premium' && (
                    <Crown
                      className="h-3.5 w-3.5 flex-shrink-0 text-ink-3"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                  )}
                </div>
                <p className="mt-0.5 line-clamp-2 px-1 text-meta leading-snug text-ink-3">
                  {template.description}
                </p>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
