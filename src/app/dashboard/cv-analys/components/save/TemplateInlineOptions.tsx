'use client';

import { useEffect, useState } from 'react';
import { Camera, Linkedin, Check } from 'lucide-react';
import Link from 'next/link';
import type { SimpleTemplate } from '@/lib/cv/simple-templates';

interface TemplateInlineOptionsProps {
  template: SimpleTemplate | null;
  userProfile: {
    hasPhoto: boolean;
    hasLinkedIn: boolean;
  };
  onOptionsChange?: (options: { includePhoto: boolean; includeLinkedIn: boolean }) => void;
}

/**
 * Compact inline-chips för foto/LinkedIn (under mall-carousel).
 * Visas endast om mallen stöder dem.
 */
export default function TemplateInlineOptions({
  template,
  userProfile,
  onOptionsChange,
}: TemplateInlineOptionsProps) {
  const [includePhoto, setIncludePhoto] = useState(false);
  const [includeLinkedIn, setIncludeLinkedIn] = useState(false);

  useEffect(() => {
    if (template?.features?.supportsPhoto && userProfile.hasPhoto) {
      setIncludePhoto(true);
    } else {
      setIncludePhoto(false);
    }

    if (template?.features?.supportsLinkedIn && userProfile.hasLinkedIn) {
      setIncludeLinkedIn(true);
    } else {
      setIncludeLinkedIn(false);
    }
  }, [template, userProfile]);

  useEffect(() => {
    onOptionsChange?.({ includePhoto, includeLinkedIn });
  }, [includePhoto, includeLinkedIn, onOptionsChange]);

  if (!template?.features) return null;

  const { supportsPhoto, supportsLinkedIn } = template.features;
  if (!supportsPhoto && !supportsLinkedIn) return null;

  const hasMissingData =
    (supportsPhoto && !userProfile.hasPhoto) ||
    (supportsLinkedIn && !userProfile.hasLinkedIn);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-steg uppercase text-ink-3">Anpassa</span>

        {supportsPhoto && (
          <OptionChip
            icon={Camera}
            label="Profilfoto"
            checked={includePhoto}
            available={userProfile.hasPhoto}
            onToggle={() => userProfile.hasPhoto && setIncludePhoto((v) => !v)}
          />
        )}

        {supportsLinkedIn && (
          <OptionChip
            icon={Linkedin}
            label="LinkedIn"
            checked={includeLinkedIn}
            available={userProfile.hasLinkedIn}
            onToggle={() => userProfile.hasLinkedIn && setIncludeLinkedIn((v) => !v)}
          />
        )}
      </div>

      {hasMissingData && (
        <Link
          href="/dashboard/profil"
          className="inline-flex items-center text-sm font-medium text-ink-1 underline underline-offset-4 decoration-kant-stark transition-colors hover:decoration-ink-1"
        >
          Lägg till saknad info i profilen
        </Link>
      )}
    </div>
  );
}

function OptionChip({
  icon: Icon,
  label,
  checked,
  available,
  onToggle,
}: {
  icon: typeof Camera;
  label: string;
  checked: boolean;
  available: boolean;
  onToggle: () => void;
}) {
  const isActive = checked && available;

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={!available}
      aria-pressed={isActive}
      className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-md border px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed ${
        isActive
          ? 'border-ink-1 bg-panel text-ink-1'
          : !available
            ? 'border-dashed border-kant-stark bg-insunken text-ink-3'
            : 'border-kant-stark bg-panel text-ink-1 hover:bg-insunken'
      }`}
    >
      {isActive ? (
        <Check className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
      ) : (
        <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
      )}
      <span>{label}</span>
      {!available && <span className="ml-1 text-meta">(saknas)</span>}
    </button>
  );
}
