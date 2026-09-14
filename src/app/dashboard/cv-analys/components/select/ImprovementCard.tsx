'use client';

import { useState } from 'react';
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
    <div
      className={`overflow-hidden rounded-xl bg-panel transition-colors ${
        selected ? 'border border-ink-1' : 'border border-kant'
      }`}
    >
      <div className="p-4 sm:p-5">
        {/* Header */}
        <div className="mb-4 flex items-start gap-3">
          <RoundCheckbox
            checked={selected}
            onChange={onToggle}
            ariaLabel={selected ? `Avmarkera ${title}` : `Välj ${title}`}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              <Briefcase
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-ink-2"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-kort leading-tight text-ink-1">{title}</h4>
                {period && <p className="mt-0.5 text-meta text-ink-3">{period}</p>}
              </div>
            </div>

            {/* Tags-rad */}
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {typeof atsImpact === 'number' && atsImpact > 0 && (
                <Tag label={`+${atsImpact} läsbarhet`} />
              )}
              <Tag label={PRIORITY_LABELS[priority] || 'Mellan'} />
              {safeKeywords.length > 0 && (
                <Tag
                  icon={<Key className="h-3 w-3" strokeWidth={1.75} />}
                  label={`${safeKeywords.length} nyckelord`}
                />
              )}
              {improvements && !improvements.hasQuantification && (
                <Tag
                  icon={<BarChart3 className="h-3 w-3" strokeWidth={1.75} />}
                  label="Behöver siffror"
                />
              )}
              {safeGrammar.length > 0 && (
                <Tag
                  icon={<Type className="h-3 w-3" strokeWidth={1.75} />}
                  label={`${safeGrammar.length} språkfel`}
                />
              )}
            </div>
          </div>
        </div>

        {/* Flödes-vy */}
        {!isEditing ? (
          <div className="rounded-lg border border-kant bg-insunken p-3.5 shadow-insunken sm:p-4">
            {/* Mode-toggle */}
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <span className="text-steg uppercase text-ink-3">
                {showOriginal ? 'Nuvarande text' : 'Vårt förslag'}
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowOriginal((v) => !v)}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-meta font-medium text-ink-1 underline underline-offset-4 decoration-kant-stark transition-colors hover:decoration-ink-1"
                  aria-pressed={showOriginal}
                >
                  {showOriginal ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                      Visa förslag
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                      Visa nuvarande
                    </>
                  )}
                </button>
                {onTextEdit && !showOriginal && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-meta font-medium text-ink-1 underline underline-offset-4 decoration-kant-stark transition-colors hover:decoration-ink-1"
                  >
                    <Edit3 className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                    Redigera
                  </button>
                )}
              </div>
            </div>

            {showOriginal ? (
              <p className="whitespace-pre-wrap text-sm italic leading-relaxed text-ink-3">
                {currentText || 'Ingen tidigare text.'}
              </p>
            ) : (
              <HighlightedText
                text={editedText}
                keywords={safeKeywords}
                detectNumbers={!improvements?.hasQuantification}
              />
            )}

            {/* Footer-meta */}
            {!showOriginal &&
              (safeKeywords.length > 0 || !improvements?.hasQuantification) && (
                <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-kant pt-3 text-meta text-ink-3">
                  {safeKeywords.length > 0 && (
                    <span>{safeKeywords.length} nyckelord tillagda</span>
                  )}
                  {!improvements?.hasQuantification && (
                    <span>Kvantifiering föreslagen</span>
                  )}
                </div>
              )}
          </div>
        ) : (
          <div className="space-y-2.5">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-2">
                Redigera förslaget
              </span>
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="block min-h-[140px] w-full resize-y rounded-lg border border-kant bg-insunken p-3 text-base text-ink-1 shadow-insunken placeholder:text-ink-3 focus:border-ink-1 focus:outline-none focus:ring-1 focus:ring-ink-1"
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
                className="inline-flex h-11 items-center gap-1 rounded-lg border border-kant-stark bg-panel px-3 text-sm font-medium text-ink-1 transition-colors hover:bg-insunken"
              >
                <X className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                Avbryt
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex h-11 items-center gap-1 rounded-lg bg-ink-1 px-3 text-sm font-semibold text-white transition-colors hover:bg-ink-hover"
              >
                <Check className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                Spara
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Tag({ icon, label }: { icon?: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-kant bg-insunken px-2 py-0.5 text-meta font-medium text-ink-2">
      {icon ? <span aria-hidden="true">{icon}</span> : null}
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
      className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-1 ${
        checked
          ? 'border-ink-1 bg-ink-1'
          : 'border-kant-stark bg-panel hover:border-ink-1'
      }`}
    >
      {checked && (
        <Check className="h-3.5 w-3.5 text-white" strokeWidth={2} aria-hidden="true" />
      )}
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
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-1">
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
        className="rounded px-1 font-semibold text-ink-1 underline decoration-kant-stark decoration-2 underline-offset-2"
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
    <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-1">
      {parts}
    </p>
  );
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
