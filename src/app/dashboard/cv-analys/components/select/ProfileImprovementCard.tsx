'use client';

import { useState } from 'react';
import { Edit3, X, Eye, EyeOff, User, Check } from 'lucide-react';
import { RoundCheckbox, HighlightedText } from './ImprovementCard';

interface ProfileImprovementCardProps {
  currentText: string;
  improvedText: string;
  changes: string[];
  atsImpact: number;
  selected: boolean;
  onToggle: () => void;
  onEdit?: (newText: string) => void;
}

const LANK =
  'inline-flex items-center gap-1 rounded-lg px-2 py-1 text-meta font-medium text-ink-1 underline underline-offset-4 decoration-kant-stark transition-colors hover:decoration-ink-1';

/**
 * Förslaget på ny personbeskrivning. Samma form som ImprovementCard:
 * valet i ink, förslaget i en insunken yta, inga färgade ytor bakom text.
 */
export default function ProfileImprovementCard({
  currentText,
  improvedText,
  changes,
  atsImpact,
  selected,
  onToggle,
  onEdit,
}: ProfileImprovementCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(improvedText);
  const [showOriginal, setShowOriginal] = useState(false);

  const safeChanges = Array.isArray(changes) ? changes : [];

  const handleSave = () => {
    if (onEdit) onEdit(editedText);
    setIsEditing(false);
  };

  return (
    <div
      className={`overflow-hidden rounded-xl bg-panel transition-colors ${
        selected ? 'border border-ink-1' : 'border border-kant'
      }`}
    >
      <div className="p-4 sm:p-5">
        <div className="mb-4 flex items-start gap-3">
          <RoundCheckbox
            checked={selected}
            onChange={onToggle}
            ariaLabel={selected ? 'Avmarkera personbeskrivning' : 'Välj personbeskrivning'}
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <User
                className="h-5 w-5 flex-shrink-0 text-ink-2"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <h4 className="text-kort text-ink-1">Personbeskrivning</h4>
              {atsImpact > 0 && (
                <span className="inline-flex items-center rounded-md border border-kant bg-insunken px-2 py-0.5 text-meta font-medium text-ink-2">
                  +{atsImpact} läsbarhet
                </span>
              )}
            </div>
            <p className="mt-1.5 text-meta text-ink-3">
              Vi har formulerat din inledning för starkare första intryck.
            </p>
          </div>
        </div>

        {/* Flödes-vy */}
        {!isEditing ? (
          <div className="rounded-lg border border-kant bg-insunken p-3.5 shadow-insunken sm:p-4">
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <span className="text-steg uppercase text-ink-3">
                {showOriginal ? 'Nuvarande text' : 'Vårt förslag'}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowOriginal((v) => !v)}
                  className={LANK}
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
                {onEdit && !showOriginal && (
                  <button type="button" onClick={() => setIsEditing(true)} className={LANK}>
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
            ) : improvedText ? (
              <HighlightedText text={editedText} keywords={[]} detectNumbers />
            ) : (
              <p className="text-sm italic leading-relaxed text-ink-3">
                Din personbeskrivning är redan optimerad.
              </p>
            )}

            {/* Changes-meta */}
            {!showOriginal && safeChanges.length > 0 && (
              <div className="mt-3 border-t border-kant pt-3">
                <p className="mb-1.5 text-steg uppercase text-ink-3">Vad vi har ändrat</p>
                <ul className="space-y-1">
                  {safeChanges.map((change, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-meta leading-relaxed text-ink-2"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-ink-3"
                      />
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
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
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditedText(improvedText);
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
