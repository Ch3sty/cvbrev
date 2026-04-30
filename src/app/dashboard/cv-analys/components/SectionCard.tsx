'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  BarChart3,
  Key,
  Type,
  AlertTriangle,
  Sparkles,
  Edit3,
  X,
  Check,
  ArrowDown,
} from 'lucide-react';

interface Improvements {
  hasQuantification?: boolean;
  keywords?: string[];
  grammarIssues?: string[];
  atsOptimization?: boolean;
}

interface SectionCardProps {
  sectionName: string;
  sectionType: 'work_experience' | 'profile' | 'skills' | 'education';
  period?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  currentText?: string;
  suggestedText: string;
  improvements: Improvements;
  atsImpact?: number;
  onTextEdit?: (newText: string) => void;
}

const PRIORITY_LABELS: Record<string, string> = {
  critical: 'Kritisk',
  high: 'Hög',
  medium: 'Mellan',
  low: 'Låg',
};

function priorityStyle(priority: SectionCardProps['priority']) {
  if (priority === 'critical') {
    return {
      background:
        'linear-gradient(135deg, rgba(220, 38, 38, 0.12) 0%, rgba(190, 24, 93, 0.08) 100%)',
      border: '1px solid rgba(220, 38, 38, 0.4)',
      color: '#991B1B',
      dot: 'linear-gradient(135deg, #DC2626, #BE185D)',
    };
  }
  if (priority === 'high') {
    return {
      background:
        'linear-gradient(135deg, rgba(249, 115, 22, 0.12) 0%, rgba(220, 38, 38, 0.08) 100%)',
      border: '1px solid rgba(249, 115, 22, 0.4)',
      color: '#9A3412',
      dot: 'linear-gradient(135deg, #F97316, #DC2626)',
    };
  }
  if (priority === 'medium') {
    return {
      background:
        'linear-gradient(135deg, rgba(251, 146, 60, 0.12) 0%, rgba(245, 158, 11, 0.08) 100%)',
      border: '1px solid rgba(251, 146, 60, 0.35)',
      color: '#9A3412',
      dot: 'linear-gradient(135deg, #FB923C, #F59E0B)',
    };
  }
  return {
    background: 'rgba(148, 163, 184, 0.1)',
    border: '1px solid rgba(148, 163, 184, 0.3)',
    color: '#475569',
    dot: '#94A3B8',
  };
}

export default function SectionCard({
  sectionName,
  period,
  priority,
  currentText,
  suggestedText,
  improvements,
  atsImpact,
  onTextEdit,
}: SectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(suggestedText);
  const prio = priorityStyle(priority);

  const handleSave = () => {
    if (onTextEdit && editedText !== suggestedText) {
      onTextEdit(editedText);
    }
    setIsEditing(false);
  };

  const safeKeywords = Array.isArray(improvements?.keywords) ? improvements.keywords : [];
  const safeGrammar = Array.isArray(improvements?.grammarIssues)
    ? improvements.grammarIssues
    : [];

  return (
    <div
      className="relative rounded-2xl bg-white border-2 border-orange-200/60 overflow-hidden transition-all"
      style={{
        boxShadow: isExpanded
          ? '0 12px 28px -12px rgba(249, 115, 22, 0.25), 0 0 0 1px rgba(249, 115, 22, 0.2)'
          : '0 2px 8px -4px rgba(15, 23, 42, 0.06)',
      }}
    >
      {/* Topp-band */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{
          background: 'linear-gradient(90deg, #F97316, #DC2626)',
        }}
      />

      {/* Header */}
      <div className="p-4 sm:p-5 pt-5">
        <div className="flex items-start gap-3">
          <div
            className="flex-shrink-0 w-2 h-2 rounded-full mt-2"
            style={{ background: prio.dot }}
          />

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
              {sectionName}
            </h4>
            {period && (
              <p className="text-xs text-slate-500 mt-0.5">{period}</p>
            )}
          </div>

          {/* Badges till höger */}
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            {typeof atsImpact === 'number' && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
                style={{
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                }}
              >
                <Sparkles className="w-2.5 h-2.5" strokeWidth={2.5} />
                +{atsImpact} ATS
              </span>
            )}
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{
                background: prio.background,
                border: prio.border,
                color: prio.color,
              }}
            >
              {PRIORITY_LABELS[priority] || 'Mellan'}
            </span>
          </div>
        </div>

        {/* Improvement-tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {improvements && !improvements.hasQuantification && (
            <ImprovementTag
              icon={<BarChart3 className="w-3 h-3" strokeWidth={2.25} />}
              label="Behöver kvantifiering"
            />
          )}
          {safeKeywords.length > 0 && (
            <ImprovementTag
              icon={<Key className="w-3 h-3" strokeWidth={2.25} />}
              label={`${safeKeywords.length} nyckelord`}
            />
          )}
          {safeGrammar.length > 0 && (
            <ImprovementTag
              icon={<Type className="w-3 h-3" strokeWidth={2.25} />}
              label={`${safeGrammar.length} ${safeGrammar.length === 1 ? 'språkfel' : 'språkfel'}`}
            />
          )}
          {improvements?.atsOptimization && (
            <ImprovementTag
              icon={<Sparkles className="w-3 h-3" strokeWidth={2.25} />}
              label="ATS-optimering"
            />
          )}
        </div>
      </div>

      {/* Toggle-knapp */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 sm:px-5 py-3 border-t border-orange-200/40 text-left flex items-center justify-between hover:bg-orange-50/40 transition-colors"
      >
        <span className="text-sm font-semibold text-orange-700">
          {isExpanded ? 'Dölj förbättring' : 'Visa förbättring'}
        </span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-orange-700" strokeWidth={2.5} />
        ) : (
          <ChevronDown className="w-4 h-4 text-orange-700" strokeWidth={2.5} />
        )}
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-5 space-y-3">
              {!isEditing ? (
                <>
                  {/* Före */}
                  {currentText && (
                    <div className="rounded-xl bg-slate-50/80 border border-slate-200 p-4">
                      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-2 flex items-center gap-1.5">
                        <span
                          className="w-1 h-3 rounded-full bg-slate-400"
                          aria-hidden="true"
                        />
                        Nuvarande text
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {currentText}
                      </p>
                    </div>
                  )}

                  {/* Pil */}
                  <div className="flex justify-center">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #10B981, #059669)',
                        boxShadow: '0 4px 10px -2px rgba(16, 185, 129, 0.45)',
                      }}
                    >
                      <ArrowDown className="w-4 h-4 text-white" strokeWidth={3} />
                    </div>
                  </div>

                  {/* Efter */}
                  <div
                    className="relative rounded-xl p-4 border-2"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.05) 100%)',
                      borderColor: 'rgba(16, 185, 129, 0.3)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-emerald-700" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-800">
                          Vårt förslag
                        </span>
                      </div>
                      {onTextEdit && (
                        <button
                          type="button"
                          onClick={() => setIsEditing(true)}
                          className="text-xs font-semibold text-orange-700 hover:text-orange-900 inline-flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-orange-50 transition-colors"
                        >
                          <Edit3 className="w-3 h-3" strokeWidth={2.25} />
                          Redigera
                        </button>
                      )}
                    </div>

                    <HighlightedText
                      text={editedText}
                      keywords={safeKeywords}
                      hasQuantification={!improvements?.hasQuantification}
                    />

                    {/* Footer-tags */}
                    {(safeKeywords.length > 0 ||
                      improvements?.atsOptimization ||
                      !improvements?.hasQuantification) && (
                      <div className="mt-3 pt-3 border-t border-emerald-200/60 flex flex-wrap gap-1.5">
                        {!improvements?.hasQuantification && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white border border-emerald-200 text-emerald-800">
                            <BarChart3 className="w-2.5 h-2.5" strokeWidth={2.5} />
                            Kvantifierat
                          </span>
                        )}
                        {safeKeywords.length > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white border border-emerald-200 text-emerald-800">
                            <Key className="w-2.5 h-2.5" strokeWidth={2.5} />
                            {safeKeywords.length} nyckelord tillagda
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Legend */}
                  {(safeKeywords.length > 0 ||
                    !improvements?.hasQuantification) && (
                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3 px-1">
                      {safeKeywords.length > 0 && (
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className="inline-block px-1.5 rounded font-semibold"
                            style={{
                              background: 'rgba(249, 115, 22, 0.15)',
                              color: '#9A3412',
                            }}
                          >
                            Nyckelord
                          </span>
                        </span>
                      )}
                      {!improvements?.hasQuantification && (
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className="inline-block px-1.5 rounded font-semibold"
                            style={{
                              background: 'rgba(16, 185, 129, 0.15)',
                              color: '#047857',
                            }}
                          >
                            Siffror
                          </span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Grammar issues */}
                  {safeGrammar.length > 0 && (
                    <div
                      className="rounded-xl p-4 border"
                      style={{
                        background:
                          'linear-gradient(135deg, rgba(251, 146, 60, 0.08) 0%, rgba(245, 158, 11, 0.05) 100%)',
                        borderColor: 'rgba(251, 146, 60, 0.3)',
                      }}
                    >
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle
                          className="w-4 h-4 text-orange-700 mt-0.5 flex-shrink-0"
                          strokeWidth={2.25}
                        />
                        <div className="min-w-0">
                          <h5 className="text-sm font-bold text-slate-900 mb-1">
                            Språkförbättringar
                          </h5>
                          <ul className="text-xs text-slate-700 space-y-1">
                            {safeGrammar.map((issue, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span
                                  className="flex-shrink-0 w-1 h-1 rounded-full bg-orange-500 mt-1.5"
                                  aria-hidden="true"
                                />
                                <span>{issue}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-2">
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-700 mb-1.5 block">
                      Redigera förslaget
                    </span>
                    <textarea
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      className="w-full min-h-[140px] p-3 text-sm bg-white border-2 border-orange-200 rounded-xl text-slate-900 focus:outline-none focus:border-orange-500"
                      rows={6}
                    />
                  </label>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setEditedText(suggestedText);
                        setIsEditing(false);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    >
                      <X className="w-3 h-3" />
                      Avbryt
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg text-white"
                      style={{
                        background: 'linear-gradient(135deg, #10B981, #059669)',
                      }}
                    >
                      <Check className="w-3 h-3" strokeWidth={3} />
                      Spara
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ImprovementTag({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
      style={{
        background:
          'linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(220, 38, 38, 0.05) 100%)',
        border: '1px solid rgba(249, 115, 22, 0.25)',
        color: '#9A3412',
      }}
    >
      {icon}
      {label}
    </span>
  );
}

function HighlightedText({
  text,
  keywords,
  hasQuantification,
}: {
  text: string;
  keywords: string[];
  hasQuantification: boolean;
}) {
  if (keywords.length === 0 && !text.match(/\d+/)) {
    return (
      <p className="text-sm text-slate-900 font-medium leading-relaxed whitespace-pre-wrap">
        {text}
      </p>
    );
  }

  // Build highlights
  const keywordPattern =
    keywords.length > 0
      ? new RegExp(`\\b(${keywords.map(escapeRegex).join('|')})\\b`, 'gi')
      : null;
  const numberPattern =
    /\b\d+([,.]\d+)?(%|MSEK|SEK|kr|st|personer|anställda|medlemmar)?\b/g;

  const highlights: Array<{ start: number; end: number; type: 'keyword' | 'number' }> = [];

  if (keywordPattern) {
    let match;
    while ((match = keywordPattern.exec(text)) !== null) {
      highlights.push({
        start: match.index,
        end: match.index + match[0].length,
        type: 'keyword',
      });
    }
  }

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

  highlights.sort((a, b) => a.start - b.start);

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  highlights.forEach((highlight, i) => {
    if (highlight.start > lastIndex) {
      parts.push(text.substring(lastIndex, highlight.start));
    }
    parts.push(
      <span
        key={`hl-${i}`}
        className="px-1 rounded font-bold"
        style={
          highlight.type === 'keyword'
            ? { background: 'rgba(249, 115, 22, 0.18)', color: '#9A3412' }
            : { background: 'rgba(16, 185, 129, 0.18)', color: '#047857' }
        }
      >
        {text.substring(highlight.start, highlight.end)}
      </span>
    );
    lastIndex = highlight.end;
  });
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  void hasQuantification;

  return (
    <p className="text-sm text-slate-900 font-medium leading-relaxed whitespace-pre-wrap">
      {parts}
    </p>
  );
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
