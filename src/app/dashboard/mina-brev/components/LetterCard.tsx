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

interface LetterCardProps {
  letter: any;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (id: string, format: 'pdf' | 'docx') => void;
  isDeleting: boolean;
}

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

  const primary = letter.company || letter.job_title || letter.title || 'Ansökningsbrev';
  const secondary = letter.company && letter.job_title ? letter.job_title : null;

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        className="group relative bg-white rounded-2xl border border-orange-200/50 overflow-hidden cursor-pointer"
        style={{ boxShadow: '0 8px 32px -16px rgba(249, 115, 22, 0.18)' }}
      >
        {/* Hela kortet är klickbart → visa-sidan. Ligger under z-stacken så
            mer-meny och dess bottom sheet/popover fortfarande tar emot klick. */}
        <button
          type="button"
          onClick={() => onView(letter.id)}
          className="absolute inset-0 z-10 focus:outline-none focus:ring-2 focus:ring-orange-300/60 focus:ring-offset-2 rounded-2xl"
          aria-label={`Visa brev till ${primary}`}
        />

        {/* TOP: thumbnail-yta med orange-tonad bakgrund och dot-pattern */}
        <div className="relative aspect-[16/10] bg-gradient-to-br from-orange-50/80 via-white to-orange-100/40 overflow-hidden">
          {/* Subtila bakgrundsprickar */}
          <svg
            aria-hidden="true"
            className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
          >
            <pattern
              id={`lc-dots-${letter.id}`}
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="10" cy="10" r="0.8" fill="#FB923C" />
            </pattern>
            <rect width="100%" height="100%" fill={`url(#lc-dots-${letter.id})`} opacity="0.5" />
          </svg>

          {/* Pappers-thumbnail roterad lite, rätar upp vid hover */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="transform transition-transform duration-500 ease-out group-hover:rotate-0 group-hover:scale-[1.04]"
              style={{
                transform: 'rotate(-3deg)',
                filter: 'drop-shadow(0 10px 18px rgba(0, 0, 0, 0.10))',
              }}
            >
              <LetterPaperThumbnail
                seed={letter.id || primary}
                className="w-24 h-32 sm:w-28 sm:h-36"
              />
            </div>
          </div>

          {/* Mer-meny: top-höger, ovanpå klickbara ytan */}
          <div className="absolute top-3 right-3 z-20">
            {/* Desktop: popover */}
            <div className="hidden lg:block pointer-events-auto">
              <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
                <Popover.Trigger asChild>
                  <button
                    type="button"
                    onClick={(e) => e.stopPropagation()}
                    className="w-9 h-9 inline-flex items-center justify-center rounded-full text-slate-600 hover:text-slate-900 bg-white/95 backdrop-blur-sm border border-slate-200/80 hover:border-orange-300 shadow-sm hover:shadow-md transition-all"
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

            {/* Mobile: trigger för bottom sheet */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowMobileSheet(true);
              }}
              className="lg:hidden w-9 h-9 inline-flex items-center justify-center rounded-full text-slate-600 bg-white/95 backdrop-blur-sm border border-slate-200/80 shadow-sm pointer-events-auto"
              aria-label="Fler alternativ"
            >
              <MoreHorizontal className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>

          {/* Liten datum-badge i top-vänster */}
          <div className="absolute top-3 left-3 z-20 pointer-events-none">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-sm text-[10px] font-bold uppercase tracking-[0.14em] text-orange-700 border border-orange-200/80 shadow-sm">
              {dateStr}
            </span>
          </div>
        </div>

        {/* BOTTOM: metadata */}
        <div className="relative p-4 sm:p-5 space-y-2">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight line-clamp-2">
            {primary}
          </h3>
          {secondary && (
            <p className="text-sm text-slate-600 line-clamp-1 -mt-1">{secondary}</p>
          )}

          {/* Taggar */}
          {(tonalityDisplay || templateName) && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tonalityDisplay && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-[11px] font-semibold">
                  {tonalityDisplay}
                </span>
              )}
              {templateName && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200 text-[11px] font-semibold">
                  {templateName}
                </span>
              )}
            </div>
          )}
        </div>
      </motion.article>

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
