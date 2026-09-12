'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Edit3, X, Eye, EyeOff, Briefcase, BarChart3, Key, Type } from 'lucide-react';

interface Improvements {
  hasQuantification?: boolean;
  keywords?: string[];
  grammarIssues?: string[];
  atsOptimization?: boolean;
}

interface ImprovementCardProps {
  /** Sektionens namn (jobbtitel - företag) */
  title: string;
  period?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  currentText: string;
  suggestedText: string;
  improvements: Improvements;
  atsImpact?: number;
  selected: boolean;
  onToggle: () => void;
  onTextEdit?: (newText: string) => void;
}

const PRIORITY_LABELS: Record<string, string> = {
  critical: 'Kritisk',
  high: 'Hög',
  medium: 'Mellan',
  low: 'Låg',
};

export default function ImprovementCard({
  title,
  period,
  priority,
  currentText,
  suggestedText,
  improvements,
  atsImpact,
  selected,
  onToggle,
  onTextEdit,
}: ImprovementCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(suggestedText);
  const [showOriginal, setShowOriginal] = useState(false);

  const safeKeywords = Array.isArray(improvements?.keywords) ? improvements.keywords : [];
  const safeGrammar = Array.isArray(improvements?.grammarIssues) ? improvements.grammarIssues : [];

  const handleSave = () => {
    if (onTextEdit && editedText !== suggestedText) {
      onTextEdit(editedText);
    }
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`relative rounded-xl bg-white overflow-hidden transition-all ${
        selected ? 'border-2 border-emerald-500' : 'border-2 border-orange-200/60'
      }`}
    >
      <div className="p-4 sm:p-5 pt-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <RoundCheckbox
            checked={selected}
            onChange={onToggle}
            ariaLabel={selected ? `Avmarkera ${title}` : `Välj ${title}`}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 flex-wrap">
              <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-neutral-700" strokeWidth={2.25} />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-neutral-900 text-sm sm:text-base leading-tight">
                  {title}
                </h4>
                {period && <p className="text-xs text-neutral-500 mt-0.5">{period}</p>}
              </div>
            </div>

            {/* Tags-rad */}
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {typeof atsImpact === 'number' && atsImpact > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-emerald-600">
                  +{atsImpact} ATS
                </span>
              )}
              <PriorityBadge priority={priority} />
              {safeKeywords.length > 0 && (
                <Tag icon={<Key className="w-2.5 h-2.5" />} label={`${safeKeywords.length} nyckelord`} />
              )}
              {improvements && !improvements.hasQuantification && (
                <Tag icon={<BarChart3 className="w-2.5 h-2.5" />} label="Behöver siffror" />
              )}
              {safeGrammar.length > 0 && (
                <Tag icon={<Type className="w-2.5 h-2.5" />} label={`${safeGrammar.length} språkfel`} />
              )}
            </div>
          </div>
        </div>

        {/* Flödes-vy */}
        {!isEditing ? (
          <div
            className="rounded-xl p-3.5 sm:p-4 border-2 bg-white"
            style={{
              borderColor: 'rgba(16, 185, 129, 0.25)',
            }}
          >
            {/* Mode-toggle */}
            <div className="flex items-center justify-between mb-2.5 gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">
                {showOriginal ? 'Nuvarande text' : 'Vårt förslag'}
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowOriginal((v) => !v)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-orange-700 hover:bg-orange-50 transition-colors"
                  aria-pressed={showOriginal}
                >
                  {showOriginal ? (
                    <>
                      <EyeOff className="w-3 h-3" strokeWidth={2.5} />
                      Visa förslag
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3" strokeWidth={2.5} />
                      Visa nuvarande
                    </>
                  )}
                </button>
                {onTextEdit && !showOriginal && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-orange-700 hover:bg-orange-50 transition-colors"
                  >
                    <Edit3 className="w-3 h-3" strokeWidth={2.5} />
                    Redigera
                  </button>
                )}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={showOriginal ? 'original' : 'suggested'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {showOriginal ? (
                  <p className="text-sm text-neutral-600 italic leading-relaxed whitespace-pre-wrap">
                    {currentText || 'Ingen tidigare text.'}
                  </p>
                ) : (
                  <HighlightedText
                    text={editedText}
                    keywords={safeKeywords}
                    detectNumbers={!improvements?.hasQuantification}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Footer-meta */}
            {!showOriginal &&
              (safeKeywords.length > 0 || !improvements?.hasQuantification) && (
                <div className="mt-3 pt-3 border-t border-emerald-200/60 flex items-center gap-3 flex-wrap text-xs">
                  {safeKeywords.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-orange-700 font-semibold">
                      <span className="inline-block w-2 h-2 rounded-full bg-orange-600" />
                      {safeKeywords.length} nyckelord tillagda
                    </span>
                  )}
                  {!improvements?.hasQuantification && (
                    <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-600" />
                      Kvantifiering föreslagen
                    </span>
                  )}
                </div>
              )}
          </div>
        ) : (
          <div className="space-y-2.5">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-orange-700 mb-1.5 block">
                Redigera förslaget
              </span>
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full min-h-[140px] p-3 text-base bg-white border-2 border-orange-200 rounded-xl text-neutral-900 focus:outline-none focus:border-orange-500 resize-y"
                rows={6}

                enterKeyHint="enter"

                inputMode="text"

                autoComplete="off"
              />
            </label>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setEditedText(suggestedText);
                  setIsEditing(false);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 min-h-[44px]"
              >
                <X className="w-3 h-3" />
                Avbryt
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-colors min-h-[44px]"
              >
                <Check className="w-3 h-3" strokeWidth={3} />
                Spara
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function PriorityBadge({ priority }: { priority: ImprovementCardProps['priority'] }) {
  const styles =
    priority === 'critical' || priority === 'high'
      ? {
          background: 'rgba(249, 115, 22, 0.12)',
          border: '1px solid rgba(249, 115, 22, 0.4)',
          color: '#9A3412',
        }
      : priority === 'medium'
      ? {
          background: 'rgba(251, 146, 60, 0.1)',
          border: '1px solid rgba(251, 146, 60, 0.35)',
          color: '#9A3412',
        }
      : {
          background: 'rgba(148, 163, 184, 0.1)',
          border: '1px solid rgba(148, 163, 184, 0.3)',
          color: '#475569',
        };

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider"
      style={styles}
    >
      {PRIORITY_LABELS[priority] || 'Mellan'}
    </span>
  );
}

function Tag({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{
        background: 'rgba(249, 115, 22, 0.06)',
        border: '1px solid rgba(249, 115, 22, 0.22)',
        color: '#9A3412',
      }}
    >
      {icon}
      {label}
    </span>
  );
}

/* --- RoundCheckbox + HighlightedText (delas av flera kort) --- */

export function RoundCheckbox({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  onChange: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
        checked
          ? 'border-transparent'
          : 'border-orange-300 bg-white hover:border-orange-500'
      }`}
      style={
        checked
          ? {
              background: '#EA580C',
            }
          : undefined
      }
    >
      {checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
    </button>
  );
}

export function HighlightedText({
  text,
  keywords,
  detectNumbers,
}: {
  text: string;
  keywords: string[];
  detectNumbers: boolean;
}) {
  if (keywords.length === 0 && (!detectNumbers || !text.match(/\d/))) {
    return (
      <p className="text-sm text-neutral-900 font-medium leading-relaxed whitespace-pre-wrap">
        {text}
      </p>
    );
  }

  const keywordPattern =
    keywords.length > 0
      ? new RegExp(`\\b(${keywords.map(escapeRegex).join('|')})\\b`, 'gi')
      : null;
  const numberPattern = /\b\d+([,.]\d+)?(%|MSEK|SEK|kr|st|personer|anställda|medlemmar|år|månader)?\b/g;

  const highlights: Array<{ start: number; end: number; type: 'keyword' | 'number' }> = [];

  if (keywordPattern) {
    let m;
    while ((m = keywordPattern.exec(text)) !== null) {
      highlights.push({
        start: m.index,
        end: m.index + m[0].length,
        type: 'keyword',
      });
    }
  }

  if (detectNumbers) {
    let m;
    while ((m = numberPattern.exec(text)) !== null) {
      const overlaps = highlights.some(
        (h) =>
          (m!.index >= h.start && m!.index < h.end) ||
          (m!.index + m![0].length > h.start && m!.index + m![0].length <= h.end)
      );
      if (!overlaps) {
        highlights.push({
          start: m.index,
          end: m.index + m[0].length,
          type: 'number',
        });
      }
    }
  }

  highlights.sort((a, b) => a.start - b.start);

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  highlights.forEach((h, i) => {
    if (h.start > lastIndex) {
      parts.push(text.substring(lastIndex, h.start));
    }
    parts.push(
      <span
        key={`hl-${i}`}
        className="px-1 rounded font-bold"
        style={
          h.type === 'keyword'
            ? { background: 'rgba(249, 115, 22, 0.18)', color: '#9A3412' }
            : { background: 'rgba(16, 185, 129, 0.18)', color: '#047857' }
        }
      >
        {text.substring(h.start, h.end)}
      </span>
    );
    lastIndex = h.end;
  });
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return (
    <p className="text-sm text-neutral-900 font-medium leading-relaxed whitespace-pre-wrap">
      {parts}
    </p>
  );
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
