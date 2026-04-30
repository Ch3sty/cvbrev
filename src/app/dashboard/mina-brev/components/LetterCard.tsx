'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, Pencil, Trash2, Download, Calendar, MoreHorizontal,
  RefreshCw, X, FileType, FileText
} from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { LetterDocIcon } from './illustrations/LetterIcons';
import { DOCX_TEMPLATES } from '@/lib/letters/docx-templates';
import { htmlToPlainText, createPreview } from '@/utils/helpers';

interface LetterCardProps {
  letter: any;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (id: string, format: 'pdf' | 'docx') => void;
  isDeleting: boolean;
}

const getCleanPreview = (content: string, maxLength = 140): string => {
  if (!content) return '';
  let cleaned = htmlToPlainText(content);
  cleaned = cleaned.replace(/[\w.-]+@[\w.-]+\.\w+/g, '');
  cleaned = cleaned.replace(/(\+46|0)[\s-]?\d{2,3}[\s-]?\d{2,3}[\s-]?\d{2,4}/g, '');
  cleaned = cleaned.replace(/^\d{1,2}[\s/.-]\w+[\s/.-]?\d{2,4}\s*/i, '');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  const sentences = cleaned.split(/(?<=[.!?])\s+/);
  const meaningfulSentence = sentences.find((s) => s.length > 30) || sentences[0] || cleaned;
  return createPreview(meaningfulSentence, maxLength);
};

export default function LetterCard({
  letter,
  onView,
  onEdit,
  onDelete,
  onDownload,
  isDeleting,
}: LetterCardProps) {
  const [showMobileSheet, setShowMobileSheet] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const createdDate = letter.created_at ? new Date(letter.created_at) : new Date();
  const dateStr = createdDate.toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const templateName =
    letter.template_id && DOCX_TEMPLATES[letter.template_id as keyof typeof DOCX_TEMPLATES]
      ? DOCX_TEMPLATES[letter.template_id as keyof typeof DOCX_TEMPLATES].name
      : null;

  const tonalityDisplay = letter.tonality
    ? letter.tonality.charAt(0).toUpperCase() + letter.tonality.slice(1)
    : null;

  const titleParts =
    letter.company && letter.job_title
      ? { primary: letter.company, secondary: letter.job_title }
      : letter.company
      ? { primary: letter.company, secondary: null }
      : letter.job_title
      ? { primary: letter.job_title, secondary: null }
      : { primary: letter.title || 'Ansökningsbrev', secondary: null };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        className="group relative bg-white rounded-2xl border border-orange-200/50 transition-shadow"
        style={{ boxShadow: '0 6px 24px -12px rgba(249, 115, 22, 0.12)' }}
      >
        {/* Klickbar yta för "öppna brevet" — täcker hela kortet utom action-knappar */}
        <button
          type="button"
          onClick={() => onView(letter.id)}
          className="absolute inset-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-300/50 focus:ring-offset-2"
          aria-label={`Visa brev till ${titleParts.primary}`}
        />

        <div className="relative p-4 sm:p-5 pointer-events-none">
          <div className="flex items-start gap-3 sm:gap-4">
            {/* Brev-ikon med orange/röd-DNA */}
            <div className="flex-shrink-0">
              <LetterDocIcon className="w-11 h-11 sm:w-12 sm:h-12" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight truncate">
                    {titleParts.primary}
                    {titleParts.secondary && (
                      <>
                        <span className="text-slate-300 mx-1.5 font-normal">·</span>
                        <span className="text-slate-700 font-semibold">{titleParts.secondary}</span>
                      </>
                    )}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {dateStr}
                    </span>
                    {tonalityDisplay && (
                      <span className="text-slate-400">{tonalityDisplay}</span>
                    )}
                    {templateName && (
                      <span className="text-slate-400">{templateName}</span>
                    )}
                  </div>
                </div>

                {/* Desktop: Actions inline */}
                <div className="hidden lg:flex items-center gap-1.5 flex-shrink-0 pointer-events-auto">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(letter.id);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold shadow-sm hover:shadow-md transition-shadow"
                    style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)' }}
                  >
                    <Eye className="w-3.5 h-3.5" strokeWidth={2.5} />
                    Visa
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(letter.id);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-700 bg-white border border-slate-200 hover:border-orange-300 hover:bg-orange-50/40 text-xs font-semibold transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" strokeWidth={2.5} />
                    Redigera
                  </button>

                  <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <Popover.Trigger asChild>
                      <button
                        type="button"
                        onClick={(e) => e.stopPropagation()}
                        className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 transition-colors"
                        aria-label="Fler alternativ"
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" strokeWidth={2.5} />
                      </button>
                    </Popover.Trigger>
                    <Popover.Portal>
                      <Popover.Content
                        align="end"
                        sideOffset={8}
                        className="z-50 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 min-w-[200px] animate-in fade-in-0 zoom-in-95"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            onDownload(letter.id, 'pdf');
                            setPopoverOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-orange-50/40 flex items-center gap-2.5 transition-colors"
                        >
                          <FileType className="w-4 h-4 text-orange-600" strokeWidth={2.25} />
                          Ladda ned PDF
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onDownload(letter.id, 'docx');
                            setPopoverOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-orange-50/40 flex items-center gap-2.5 transition-colors"
                        >
                          <FileText className="w-4 h-4 text-blue-600" strokeWidth={2.25} />
                          Ladda ned Word
                        </button>
                        <div className="h-px bg-slate-100 my-1" />
                        <button
                          type="button"
                          onClick={() => {
                            onDelete(letter.id);
                            setPopoverOpen(false);
                          }}
                          disabled={isDeleting}
                          className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={2.25} />
                          ) : (
                            <Trash2 className="w-4 h-4" strokeWidth={2.25} />
                          )}
                          Ta bort
                        </button>
                      </Popover.Content>
                    </Popover.Portal>
                  </Popover.Root>
                </div>

                {/* Mobile: meny-knapp */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMobileSheet(true);
                  }}
                  className="lg:hidden flex-shrink-0 w-9 h-9 inline-flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-50 pointer-events-auto"
                  aria-label="Fler alternativ"
                >
                  <MoreHorizontal className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>

              {/* Preview-text */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2 mt-2">
                {getCleanPreview(letter.content, 140)}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile bottom sheet */}
      <AnimatePresence>
        {showMobileSheet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
            onClick={() => setShowMobileSheet(false)}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-slate-300 rounded-full" />
              </div>
              <div className="px-4 pb-8 pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    onView(letter.id);
                    setShowMobileSheet(false);
                  }}
                  className="w-full px-4 py-3.5 rounded-xl text-white font-semibold text-sm flex items-center gap-3"
                  style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)' }}
                >
                  <Eye className="w-4 h-4" strokeWidth={2.5} />
                  Visa brev
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onEdit(letter.id);
                    setShowMobileSheet(false);
                  }}
                  className="w-full px-4 py-3.5 rounded-xl text-slate-800 bg-white border border-slate-200 font-semibold text-sm flex items-center gap-3"
                >
                  <Pencil className="w-4 h-4" strokeWidth={2.5} />
                  Redigera
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDownload(letter.id, 'pdf');
                    setShowMobileSheet(false);
                  }}
                  className="w-full px-4 py-3.5 rounded-xl text-slate-800 bg-white border border-slate-200 font-semibold text-sm flex items-center gap-3"
                >
                  <Download className="w-4 h-4 text-orange-600" strokeWidth={2.5} />
                  Ladda ned PDF
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDownload(letter.id, 'docx');
                    setShowMobileSheet(false);
                  }}
                  className="w-full px-4 py-3.5 rounded-xl text-slate-800 bg-white border border-slate-200 font-semibold text-sm flex items-center gap-3"
                >
                  <Download className="w-4 h-4 text-blue-600" strokeWidth={2.5} />
                  Ladda ned Word
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDelete(letter.id);
                    setShowMobileSheet(false);
                  }}
                  disabled={isDeleting}
                  className="w-full px-4 py-3.5 rounded-xl text-red-600 bg-red-50 border border-red-200 font-semibold text-sm flex items-center gap-3 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={2.5} />
                  ) : (
                    <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                  )}
                  {isDeleting ? 'Tar bort...' : 'Ta bort'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowMobileSheet(false)}
                  className="w-full px-4 py-3 mt-2 rounded-xl text-slate-600 bg-slate-50 text-sm"
                >
                  Avbryt
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
