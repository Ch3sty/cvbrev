'use client';

import { useState, useEffect } from 'react';
import { Camera, Linkedin, AlertTriangle, Check, Sliders, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { SimpleTemplate } from '@/lib/cv/simple-templates';

interface TemplateOptionsProps {
  template: SimpleTemplate | null;
  userProfile: {
    hasPhoto: boolean;
    hasLinkedIn: boolean;
  };
  onOptionsChange?: (options: { includePhoto: boolean; includeLinkedIn: boolean }) => void;
}

export default function TemplateOptions({
  template,
  userProfile,
  onOptionsChange,
}: TemplateOptionsProps) {
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
    <div
      className="relative rounded-2xl overflow-hidden p-4 sm:p-5"
      style={{
        background:
          'linear-gradient(135deg, rgba(249, 115, 22, 0.06) 0%, rgba(220, 38, 38, 0.04) 100%)',
        border: '1px solid rgba(249, 115, 22, 0.2)',
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white"
          style={{
            background: 'linear-gradient(135deg, #F97316, #DC2626)',
            boxShadow: '0 4px 12px -3px rgba(220, 38, 38, 0.35)',
          }}
        >
          <Sliders className="w-5 h-5" strokeWidth={2.25} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-700 mb-0.5">
            Anpassa mallen
          </div>
          <h5 className="font-bold text-slate-900 text-sm sm:text-base">
            {template.name}
          </h5>
          <p className="text-xs text-slate-600 mt-0.5">
            Den här mallen stödjer extra funktioner.
          </p>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {supportsPhoto && (
          <OptionRow
            icon={Camera}
            label="Inkludera profilfoto"
            checked={includePhoto}
            available={userProfile.hasPhoto}
            onChange={setIncludePhoto}
          />
        )}

        {supportsLinkedIn && (
          <OptionRow
            icon={Linkedin}
            label="Inkludera LinkedIn-länk"
            checked={includeLinkedIn}
            available={userProfile.hasLinkedIn}
            onChange={setIncludeLinkedIn}
          />
        )}
      </div>

      {/* Saknad info-banner */}
      {hasMissingData && (
        <div
          className="mt-4 rounded-xl px-3.5 py-3 border flex items-start gap-2.5"
          style={{
            background:
              'linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(245, 158, 11, 0.06) 100%)',
            borderColor: 'rgba(251, 146, 60, 0.3)',
          }}
        >
          <AlertTriangle
            className="w-4 h-4 text-orange-700 mt-0.5 flex-shrink-0"
            strokeWidth={2.25}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 mb-0.5">
              Saknad information
            </p>
            <p className="text-xs text-slate-700 mb-2 leading-relaxed">
              Vissa funktioner kräver att du först lägger till informationen i din profil.
            </p>
            <Link
              href="/profile"
              className="inline-flex items-center gap-1 text-xs font-semibold text-orange-700 hover:text-orange-900"
            >
              Gå till profil
              <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function OptionRow({
  icon: Icon,
  label,
  checked,
  available,
  onChange,
}: {
  icon: typeof Camera;
  label: string;
  checked: boolean;
  available: boolean;
  onChange: (checked: boolean) => void;
}) {
  const isActive = checked && available;

  return (
    <button
      type="button"
      onClick={() => available && onChange(!checked)}
      disabled={!available}
      aria-pressed={isActive}
      className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border-2 transition-all text-left min-h-[56px] ${
        isActive
          ? 'border-emerald-500 bg-white'
          : !available
          ? 'border-slate-200 bg-slate-50/60 opacity-60 cursor-not-allowed'
          : 'border-orange-200/60 bg-white hover:border-orange-400 hover:bg-orange-50/40'
      }`}
      style={{
        boxShadow: isActive
          ? '0 0 0 4px rgba(16, 185, 129, 0.12), 0 4px 12px -4px rgba(16, 185, 129, 0.2)'
          : 'none',
      }}
    >
      {/* Custom checkbox */}
      <div
        className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
          isActive
            ? 'border-emerald-500 bg-emerald-500'
            : !available
            ? 'border-slate-300 bg-white'
            : 'border-orange-300 bg-white'
        }`}
      >
        {isActive && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
      </div>

      {/* Icon */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white ${
          !available ? 'opacity-50' : ''
        }`}
        style={{
          background: isActive
            ? 'linear-gradient(135deg, #10B981, #059669)'
            : 'linear-gradient(135deg, #F97316, #DC2626)',
        }}
      >
        <Icon className="w-4 h-4" strokeWidth={2.25} />
      </div>

      {/* Label + status */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-slate-900 text-sm">{label}</div>
        {!available && (
          <div className="text-[11px] text-rose-600 mt-0.5 font-medium">
            Saknas i profil
          </div>
        )}
      </div>

      {/* Status-badge */}
      {available && (
        <span
          className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
          style={
            isActive
              ? {
                  background:
                    'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  color: '#047857',
                }
              : {
                  background: 'rgba(148, 163, 184, 0.12)',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  color: '#475569',
                }
          }
        >
          {isActive ? 'På' : 'Av'}
        </span>
      )}
    </button>
  );
}
