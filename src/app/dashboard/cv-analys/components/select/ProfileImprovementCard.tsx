'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`relative rounded-xl bg-white overflow-hidden transition-all ${
        selected ? 'border-2 border-emerald-500' : 'border-2 border-orange-200/60'
      }`}
    >
      <div className="p-4 sm:p-5 pt-5">
        <div className="flex items-start gap-3 mb-4">
          <RoundCheckbox
            checked={selected}
            onChange={onToggle}
            ariaLabel={selected ? 'Avmarkera personbeskrivning' : 'Välj personbeskrivning'}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center">
                <User className="w-4 h-4 text-neutral-700" strokeWidth={2.25} />
              </div>
              <h4 className="font-bold text-neutral-900 text-sm sm:text-base">
                Personbeskrivning
              </h4>
              {atsImpact > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-emerald-600">
                  +{atsImpact} ATS
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-600 mt-1.5">
              Vi har formulerat din inledning för starkare första intryck.
            </p>
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
                {onEdit && !showOriginal && (
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
                ) : improvedText ? (
                  <HighlightedText text={editedText} keywords={[]} detectNumbers />
                ) : (
                  <p className="text-sm text-neutral-600 italic leading-relaxed">
                    Din personbeskrivning är redan optimerad.
                  </p>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Changes-meta */}
            {!showOriginal && safeChanges.length > 0 && (
              <div className="mt-3 pt-3 border-t border-emerald-200/60">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-orange-700 mb-1.5 block">
                  Vad vi har ändrat
                </span>
                <ul className="space-y-1">
                  {safeChanges.map((change, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs text-neutral-700 leading-relaxed"
                    >
                      <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5 bg-orange-600" />
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
                  setEditedText(improvedText);
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
