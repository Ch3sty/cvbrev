'use client';

import { motion } from 'framer-motion';
import { FileText, Layout, Sparkles, Loader2, Crown, ImageIcon, Linkedin } from 'lucide-react';
import { getTemplateById } from '@/lib/cv/simple-templates';

interface CvMallarSummaryProps {
  cvName: string | null;
  templateId: string | null;
  isPremium: boolean;
  isGenerating: boolean;
  includePhoto: boolean;
  includeLinkedIn: boolean;
  onTogglePhoto: () => void;
  onToggleLinkedIn: () => void;
  onGenerate: () => void;
  onUpgrade: () => void;
}

export default function CvMallarSummary({
  cvName,
  templateId,
  isPremium,
  isGenerating,
  includePhoto,
  includeLinkedIn,
  onTogglePhoto,
  onToggleLinkedIn,
  onGenerate,
  onUpgrade,
}: CvMallarSummaryProps) {
  const template = templateId ? getTemplateById(templateId) : null;
  const supportsCustomization = !!template?.features?.supportsPhoto || !!template?.features?.supportsLinkedIn;
  const isLockedPremium = template?.tier === 'premium' && !isPremium;
  const canGenerate = !!cvName && !!template && !isLockedPremium;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-white rounded-3xl border border-orange-200/50 p-5 sm:p-7"
      style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.18)' }}
    >
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600 mb-2">
        Dina val
      </div>
      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-1">
        Klart att skapa
      </h3>
      <p className="text-sm text-slate-600 mb-5">
        Vi formaterar ditt innehåll med vald design och laddar ner en PDF.
      </p>

      <ul className="divide-y divide-slate-100 mb-5">
        <SummaryRow
          icon={FileText}
          label="CV"
          value={cvName || '—'}
          ok={!!cvName}
        />
        <SummaryRow
          icon={Layout}
          label="Mall"
          value={template?.name || '—'}
          ok={!!template}
        />
      </ul>

      {/* Customization-toggles om mallen stödjer det och inte är låst */}
      {supportsCustomization && !isLockedPremium && (
        <div className="space-y-2 mb-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Anpassa
          </div>
          {template?.features?.supportsPhoto && (
            <ToggleRow
              icon={ImageIcon}
              label="Inkludera profilbild"
              checked={includePhoto}
              onToggle={onTogglePhoto}
            />
          )}
          {template?.features?.supportsLinkedIn && (
            <ToggleRow
              icon={Linkedin}
              label="Inkludera LinkedIn-URL"
              checked={includeLinkedIn}
              onToggle={onToggleLinkedIn}
            />
          )}
        </div>
      )}

      {/* CTA */}
      {isLockedPremium ? (
        <button
          type="button"
          onClick={onUpgrade}
          className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl font-bold text-white text-base shadow-lg transition-all min-h-[56px]"
          style={{
            background: 'linear-gradient(135deg, #D946EF 0%, #9333EA 50%, #DB2777 100%)',
            boxShadow: '0 12px 28px -8px rgba(168, 85, 247, 0.45)',
          }}
        >
          <Crown className="w-5 h-5" strokeWidth={2.5} />
          Lås upp Premium
        </button>
      ) : (
        <button
          type="button"
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating}
          className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl font-bold text-white text-base shadow-lg transition-all min-h-[56px] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background:
              !canGenerate || isGenerating
                ? '#94A3B8'
                : 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
            boxShadow:
              !canGenerate || isGenerating
                ? 'none'
                : '0 12px 28px -8px rgba(220, 38, 38, 0.45)',
          }}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Skapar PDF…
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" strokeWidth={2.5} />
              Skapa CV-PDF
            </>
          )}
        </button>
      )}
      <div className="text-center text-xs text-slate-500 mt-3">
        {isLockedPremium
          ? 'Premium krävs för denna mall.'
          : 'Genereras direkt och laddas ner till din enhet.'}
      </div>
    </motion.section>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
  ok,
}: {
  icon: typeof FileText;
  label: string;
  value: string;
  ok: boolean;
}) {
  return (
    <li className="flex items-center gap-3 py-2.5 text-sm">
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
          ok
            ? 'bg-orange-50 text-orange-600'
            : 'bg-slate-100 text-slate-400'
        }`}
      >
        <Icon className="w-4 h-4" strokeWidth={2.25} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </div>
        <div
          className={`truncate font-medium ${
            ok ? 'text-slate-900' : 'text-slate-400'
          }`}
        >
          {value}
        </div>
      </div>
    </li>
  );
}

function ToggleRow({
  icon: Icon,
  label,
  checked,
  onToggle,
}: {
  icon: typeof FileText;
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all min-h-[52px] text-left ${
        checked
          ? 'border-orange-300 bg-orange-50/50'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
      role="switch"
      aria-checked={checked}
    >
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
          checked ? 'text-white' : 'bg-slate-100 text-slate-500'
        }`}
        style={
          checked
            ? { background: 'linear-gradient(135deg, #F97316, #DC2626)' }
            : undefined
        }
      >
        <Icon className="w-4 h-4" strokeWidth={2.25} />
      </div>
      <span className="flex-1 text-sm font-semibold text-slate-900">
        {label}
      </span>
      {/* Toggle switch */}
      <span
        className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
          checked ? '' : 'bg-slate-300'
        }`}
        style={
          checked
            ? { background: 'linear-gradient(135deg, #F97316, #DC2626)' }
            : undefined
        }
        aria-hidden="true"
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </span>
    </button>
  );
}
