'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Linkedin, AlertCircle, Check } from 'lucide-react';
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
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-2"
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
          Anpassa
        </span>

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
          href="/profile"
          className="inline-flex items-center gap-1.5 text-xs text-rose-700 hover:text-rose-900 font-semibold"
        >
          <AlertCircle className="w-3.5 h-3.5" strokeWidth={2.25} />
          <span>Lägg till saknad info i profilen</span>
        </Link>
      )}
    </motion.div>
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
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all min-h-[32px] disabled:cursor-not-allowed"
      style={
        isActive
          ? {
              background: 'linear-gradient(135deg, #10B981, #059669)',
              border: '1px solid transparent',
              color: 'white',
              boxShadow: '0 4px 10px -3px rgba(16, 185, 129, 0.4)',
            }
          : !available
          ? {
              background: 'rgba(148, 163, 184, 0.1)',
              border: '1px dashed rgba(148, 163, 184, 0.4)',
              color: '#64748B',
            }
          : {
              background: 'white',
              border: '1px solid rgba(249, 115, 22, 0.35)',
              color: '#9A3412',
            }
      }
    >
      {isActive ? (
        <Check className="w-3 h-3" strokeWidth={3} />
      ) : (
        <Icon className="w-3 h-3" strokeWidth={2.25} />
      )}
      <span>{label}</span>
      {!available && (
        <span className="ml-1 text-[10px] opacity-70">(saknas)</span>
      )}
    </button>
  );
}
