'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, Pencil, Trash2, Download, MoreHorizontal,
  RefreshCw, FileType, FileText,
} from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { LetterPaperThumbnail } from './illustrations/LetterIcons';
import { DOCX_TEMPLATES } from '@/lib/letters/docx-templates';

interface LetterCardCompactProps {
  letter: any;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (id: string, format: 'pdf' | 'docx') => void;
  isDeleting: boolean;
}

/**
 * Kompakt list-rad för översiktsvy. ~64px hög med mini-thumbnail till vänster,
 * företag/tjänst som rubrik, datum + taggar på höger, mer-meny längst höger.
 *
 * Behåller hela kortet klickbart till visa-sidan, samma mer-meny som
 * grid-versionen (popover på desktop, bottom sheet på mobil).
 */
export default function LetterCardCompact({
  letter,
  onView,
  onEdit,
  onDelete,
  onDownload,
  isDeleting,
}: LetterCardCompactProps) {
  const [showMobileSheet, setShowMobileSheet] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const createdDate = letter.created_at ? new Date(letter.created_at) : new Date();
  const dateStr = createdDate.toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'short',
  });

  const templateName =
    letter.template_id && DOCX_TEMPLATES[letter.template_id as keyof typeof DOCX_TEMPLATES]
      ? DOCX_TEMPLATES[letter.template_id as keyof typeof DOCX_TEMPLATES].name
      : null;

  const tonalityDisplay = letter.tonality
    ? letter.tonality.charAt(0).toUpperCase() + letter.tonality.slice(1)
    : null;

  const primary = letter.company || letter.job_title || letter.title || 'Ansökningsbrev';
  const secondary = letter.company && letter.job_title ? letter.job_title : null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ x: 2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="group relative bg-white rounded-xl border border-orange-200/50 hover:border-orange-300 transition-colors"
        style={{ boxShadow: '0 2px 8px -4px rgba(249, 115, 22, 0.08)' }}
      >
        {/* Hela raden klickbar → visa-sidan */}
        <button
          type="button"
          onClick={() => onView(letter.id)}
          className="absolute inset-0 z-10 focus:outline-none focus:ring-2 focus:ring-orange-300/60 focus:ring-offset-2 rounded-xl"
          aria-label={`Visa brev till ${primary}`}
        />

        <div className="relative flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3">
          {/* Mini-thumbnail */}
          <div className="flex-shrink-0">
            <LetterPaperThumbnail
              seed={letter.id || primary}
              className="w-10 h-[52px] sm:w-11 sm:h-[58px]"
            />
          </div>

          {/* Titel + tjänst */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-[15px] font-bold text-slate-900 leading-tight truncate">
              {primary}
            </h3>
            {secondary && (
              <p className="text-xs sm:text-[13px] text-slate-600 truncate mt-0.5">{secondary}</p>
            )}
          </div>

          {/* Datum + taggar (desktop) */}
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            {tonalityDisplay && (
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-[10px] font-semibold">
                {tonalityDisplay}
              </span>
            )}
            {templateName && (
              <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-semibold">
                {templateName}
              </span>
            )}
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-[0.06em] tabular-nums">
              {dateStr}
            </span>
          </div>

          {/* Mobile: bara datum (kompakt) */}
          <span className="sm:hidden text-[11px] font-semibold text-slate-500 uppercase tabular-nums flex-shrink-0">
            {dateStr}
          </span>

          {/* Mer-meny — desktop popover */}
          <div className="hidden lg:block flex-shrink-0 z-20">
            <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
              <Popover.Trigger asChild>
                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-orange-50/40 transition-colors pointer-events-auto"
                  aria-label="Fler alternativ"
                >
                  <MoreHorizontal className="w-4 h-4" strokeWidth={2.5} />
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
                      onEdit(letter.id);
                      setPopoverOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-orange-50/40 flex items-center gap-2.5 transition-colors"
                  >
                    <Pencil className="w-4 h-4 text-orange-600" strokeWidth={2.25} />
                    Redigera
                  </button>
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

          {/* Mer-meny — mobil bottom sheet trigger */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowMobileSheet(true);
            }}
            className="lg:hidden flex-shrink-0 w-8 h-8 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-orange-50/40 z-20 pointer-events-auto"
            aria-label="Fler alternativ"
          >
            <MoreHorizontal className="w-4 h-4" strokeWidth={2.5} />
          </button>
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
