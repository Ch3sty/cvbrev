'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ChevronDown, ChevronUp, Sparkles, Edit3, Check, X } from 'lucide-react';

interface ProfileSummaryCardProps {
  currentText: string;
  improvedText: string;
  changes: string[];
  atsImpact: number;
  selected: boolean;
  onToggle: () => void;
  onEdit?: (newText: string) => void;
}

export default function ProfileSummaryCard({
  currentText,
  improvedText,
  changes,
  atsImpact,
  selected,
  onToggle,
  onEdit,
}: ProfileSummaryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editedText, setEditedText] = useState(improvedText);
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveEdit = () => {
    if (onEdit) onEdit(editedText);
    setIsEditing(false);
  };

  const safeChanges = Array.isArray(changes) ? changes : [];

  return (
    <div
      className={`relative rounded-2xl bg-white transition-all overflow-hidden ${
        selected ? 'border-2 border-emerald-500' : 'border-2 border-orange-200/60'
      }`}
      style={{
        boxShadow: selected
          ? '0 0 0 4px rgba(16, 185, 129, 0.12), 0 8px 20px -8px rgba(16, 185, 129, 0.25)'
          : '0 2px 8px -4px rgba(15, 23, 42, 0.06)',
      }}
    >
      {/* Topp-band */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{
          background: selected
            ? 'linear-gradient(90deg, #10B981, #059669)'
            : 'linear-gradient(90deg, #F97316, #DC2626)',
        }}
      />

      {/* Header */}
      <div className="p-4 sm:p-5 pt-5">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onToggle}
            aria-pressed={selected}
            aria-label={selected ? 'Avmarkera personbeskrivning' : 'Välj personbeskrivning'}
            className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
              selected
                ? 'border-emerald-500 bg-emerald-500'
                : 'border-orange-300 bg-white hover:border-orange-500'
            }`}
            style={{
              boxShadow: selected
                ? '0 4px 10px -2px rgba(16, 185, 129, 0.4)'
                : 'none',
            }}
          >
            {selected && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <div
                className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-white"
                style={{
                  background: 'linear-gradient(135deg, #F97316, #DC2626)',
                }}
              >
                <User className="w-4 h-4" strokeWidth={2.25} />
              </div>
              <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                Personbeskrivning
              </h4>
              <div
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
                style={{
                  background: 'linear-gradient(135deg, #F97316, #DC2626)',
                }}
              >
                <Sparkles className="w-2.5 h-2.5" strokeWidth={2.5} />
                +{atsImpact} ATS
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Din inledning har optimerats för ATS och engagemang.
            </p>
            {!isExpanded && safeChanges.length > 0 && (
              <p className="text-xs text-slate-500 mt-2">
                <span className="font-semibold text-orange-700">
                  {safeChanges.length} förbättringar:
                </span>{' '}
                {safeChanges[0]}
                {safeChanges.length > 1 && `, +${safeChanges.length - 1} till...`}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Dölj detaljer' : 'Visa detaljer'}
            className="flex-shrink-0 w-8 h-8 rounded-lg hover:bg-orange-50 flex items-center justify-center text-slate-500 transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" strokeWidth={2.25} />
            ) : (
              <ChevronDown className="w-4 h-4" strokeWidth={2.25} />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-5 space-y-3">
              {/* Original-text */}
              <div className="rounded-xl bg-slate-50/80 border border-slate-200 p-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-2">
                  Nuvarande text
                </div>
                <p className="text-sm text-slate-700 leading-relaxed italic">
                  {currentText}
                </p>
              </div>

              {/* Pil */}
              <div className="flex justify-center">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #F97316, #DC2626)',
                    boxShadow: '0 4px 10px -2px rgba(220, 38, 38, 0.45)',
                  }}
                >
                  <ChevronDown className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
              </div>

              {/* Förbättrad text */}
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
                  {onEdit && !isEditing && (
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

                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      className="w-full min-h-[120px] p-3 text-sm bg-white border border-emerald-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      rows={5}
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setEditedText(improvedText);
                          setIsEditing(false);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      >
                        <X className="w-3 h-3" />
                        Avbryt
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveEdit}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg text-white"
                        style={{
                          background:
                            'linear-gradient(135deg, #10B981, #059669)',
                        }}
                      >
                        <Check className="w-3 h-3" strokeWidth={3} />
                        Spara
                      </button>
                    </div>
                  </div>
                ) : improvedText ? (
                  <p className="text-sm text-slate-900 font-medium leading-relaxed">
                    {editedText}
                  </p>
                ) : (
                  <p className="text-sm text-slate-600 italic">
                    Din personbeskrivning är redan optimerad. Inga ändringar föreslås.
                  </p>
                )}
              </div>

              {/* Förbättrings-lista */}
              {safeChanges.length > 0 && (
                <div className="rounded-xl border border-orange-200/60 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-700 mb-2">
                    Vad vi har ändrat
                  </div>
                  <ul className="space-y-1.5">
                    {safeChanges.map((change, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-slate-700"
                      >
                        <span
                          className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2"
                          style={{
                            background:
                              'linear-gradient(135deg, #F97316, #DC2626)',
                          }}
                        />
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
