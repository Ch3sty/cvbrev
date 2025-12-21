/**
 * Premium 2025 Letter List Item
 * Inspirerad av Linear, Notion och Vercel Dashboard
 *
 * Features:
 * - Subtle hover-effekter med elevation
 * - Progressive disclosure av actions (desktop)
 * - Bottom sheet för actions (mobil)
 * - Smart popover-meny (ingen clipping)
 * - Optimal touch-targets (48x48px minimum)
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Eye, Pencil, Trash2, Download,
  Calendar, MessageSquare, Palette, MoreVertical,
  RefreshCw, X
} from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { DOCX_TEMPLATES } from '@/lib/letters/docx-templates';
import { htmlToPlainText, createPreview } from '@/utils/helpers';

// Types
interface LetterListItemProps {
  letter: any;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (id: string, format: 'pdf' | 'docx') => void;
  isDeleting: boolean;
}

// Clean preview helper
const getCleanPreview = (content: string, maxLength = 140): string => {
  if (!content) return 'Ingen förhandsgranskning tillgänglig';

  let cleaned = htmlToPlainText(content);
  cleaned = cleaned.replace(/[\w.-]+@[\w.-]+\.\w+/g, '');
  cleaned = cleaned.replace(/(\+46|0)[\s-]?\d{2,3}[\s-]?\d{2,3}[\s-]?\d{2,4}/g, '');
  cleaned = cleaned.replace(/^\d{1,2}[\s/.-]\w+[\s/.-]?\d{2,4}\s*/i, '');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  const sentences = cleaned.split(/(?<=[.!?])\s+/);
  const meaningfulSentence = sentences.find(s => s.length > 30) || sentences[0] || cleaned;

  return createPreview(meaningfulSentence, maxLength);
};

export default function PremiumLetterListItem({
  letter,
  onView,
  onEdit,
  onDelete,
  onDownload,
  isDeleting
}: LetterListItemProps) {
  const [showMobileSheet, setShowMobileSheet] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Format date
  const createdDate = letter.created_at ? new Date(letter.created_at) : new Date();
  const dateStr = createdDate.toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  // Template name
  const templateName = letter.template_id && DOCX_TEMPLATES[letter.template_id as keyof typeof DOCX_TEMPLATES]
    ? DOCX_TEMPLATES[letter.template_id as keyof typeof DOCX_TEMPLATES].name
    : null;

  // Tonality display
  const tonalityDisplay = letter.tonality
    ? letter.tonality.charAt(0).toUpperCase() + letter.tonality.slice(1)
    : null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          group relative
          bg-white rounded-xl
          border border-gray-100
          hover:border-pink-200/50
          shadow-sm hover:shadow-xl hover:shadow-purple-500/5
          transition-all duration-300 ease-out
          hover:-translate-y-1
          overflow-visible
        "
      >
        <div className="p-4 sm:p-5 lg:p-6">
          {/* Header Section */}
          <div className="flex items-start justify-between gap-4 mb-3">
            {/* Left: Icon + Info */}
            <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
              {/* Icon */}
              <div className="
                relative flex-shrink-0
                w-12 h-12 sm:w-14 sm:h-14
                bg-gradient-to-br from-pink-500 to-purple-600
                rounded-2xl
                flex items-center justify-center
                shadow-lg shadow-pink-500/25
                group-hover:shadow-xl group-hover:shadow-pink-500/30
                transition-shadow duration-300
              ">
                <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>

              {/* Info Column */}
              <div className="flex-1 min-w-0">
                {/* Title: Company · Job Title */}
                <h3 className="
                  font-semibold text-gray-900
                  text-base sm:text-lg
                  mb-2 leading-tight
                ">
                  {letter.company && letter.job_title ? (
                    <>
                      <span className="text-gray-900">{letter.company}</span>
                      <span className="text-gray-300 mx-2">·</span>
                      <span className="text-gray-700">{letter.job_title}</span>
                    </>
                  ) : letter.company ? (
                    letter.company
                  ) : letter.job_title ? (
                    letter.job_title
                  ) : (
                    letter.title || 'Ansökningsbrev'
                  )}
                </h3>

                {/* Metadata Pills */}
                <div className="flex flex-wrap gap-2 mb-3 sm:mb-0">
                  {/* Date */}
                  <span className="
                    inline-flex items-center gap-1.5
                    px-2.5 py-1
                    text-xs font-medium
                    bg-gray-50 text-gray-600
                    rounded-full
                    border border-gray-100
                  ">
                    <Calendar className="w-3 h-3" />
                    {dateStr}
                  </span>

                  {/* Tonality */}
                  {tonalityDisplay && (
                    <span className="
                      inline-flex items-center gap-1.5
                      px-2.5 py-1
                      text-xs font-medium
                      bg-pink-50 text-pink-700
                      rounded-full
                      border border-pink-100
                    ">
                      <MessageSquare className="w-3 h-3" />
                      {tonalityDisplay}
                    </span>
                  )}

                  {/* Template */}
                  {templateName && (
                    <span className="
                      inline-flex items-center gap-1.5
                      px-2.5 py-1
                      text-xs font-medium
                      bg-purple-50 text-purple-700
                      rounded-full
                      border border-purple-100
                    ">
                      <Palette className="w-3 h-3" />
                      {templateName}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Desktop Actions (Progressive Disclosure) */}
            <div className="
              hidden lg:flex
              items-center gap-2
              opacity-0 group-hover:opacity-100
              transition-opacity duration-200
            ">
              {/* Visa - Primary */}
              <motion.button
                onClick={() => onView(letter.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="
                  px-4 py-2
                  bg-gradient-to-r from-pink-600 to-purple-600
                  hover:from-pink-700 hover:to-purple-700
                  text-white text-sm font-medium
                  rounded-lg
                  shadow-md hover:shadow-lg
                  transition-all duration-200
                  flex items-center gap-2
                "
              >
                <Eye className="w-4 h-4" />
                Visa
              </motion.button>

              {/* Redigera - Secondary */}
              <motion.button
                onClick={() => onEdit(letter.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="
                  px-4 py-2
                  text-gray-700
                  bg-white hover:bg-gray-50
                  border-2 border-gray-200 hover:border-gray-300
                  rounded-lg
                  text-sm font-medium
                  transition-all duration-200
                  flex items-center gap-2
                "
              >
                <Pencil className="w-4 h-4" />
                Redigera
              </motion.button>

              {/* More Menu - Popover */}
              <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
                <Popover.Trigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="
                      w-10 h-10
                      text-gray-600 hover:text-gray-900
                      bg-white hover:bg-gray-50
                      border-2 border-gray-200 hover:border-gray-300
                      rounded-lg
                      transition-all duration-200
                      flex items-center justify-center
                    "
                  >
                    <MoreVertical className="w-4 h-4" />
                  </motion.button>
                </Popover.Trigger>

                <Popover.Portal>
                  <Popover.Content
                    align="end"
                    sideOffset={8}
                    className="
                      z-50
                      bg-white rounded-xl
                      shadow-xl border border-gray-200
                      py-2 min-w-[180px]
                      animate-in fade-in-0 zoom-in-95
                      data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
                    "
                  >
                    <button
                      onClick={() => { onDownload(letter.id, 'pdf'); setPopoverOpen(false); }}
                      className="
                        w-full px-4 py-2.5
                        text-left text-sm font-medium
                        text-gray-700 hover:bg-gray-50
                        flex items-center gap-3
                        transition-colors
                      "
                    >
                      <FileText className="w-4 h-4 text-pink-600" />
                      Ladda ned PDF
                    </button>
                    <button
                      onClick={() => { onDownload(letter.id, 'docx'); setPopoverOpen(false); }}
                      className="
                        w-full px-4 py-2.5
                        text-left text-sm font-medium
                        text-gray-700 hover:bg-gray-50
                        flex items-center gap-3
                        transition-colors
                      "
                    >
                      <FileText className="w-4 h-4 text-blue-600" />
                      Ladda ned Word
                    </button>
                    <div className="h-px bg-gray-100 my-1" />
                    <button
                      onClick={() => { onDelete(letter.id); setPopoverOpen(false); }}
                      disabled={isDeleting}
                      className="
                        w-full px-4 py-2.5
                        text-left text-sm font-medium
                        text-red-600 hover:bg-red-50
                        flex items-center gap-3
                        transition-colors
                        disabled:opacity-50
                      "
                    >
                      {isDeleting ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      Ta bort
                    </button>
                    <Popover.Arrow className="fill-white" />
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            </div>
          </div>

          {/* Preview Text - Indented under icon */}
          <p className="
            text-sm text-gray-600 leading-relaxed
            line-clamp-2
            mb-4 sm:mb-0 lg:mb-0
            pl-0 sm:pl-[72px]
            opacity-80 group-hover:opacity-100
            transition-opacity duration-300
          ">
            {getCleanPreview(letter.content, 160)}
          </p>

          {/* Mobile/Tablet Actions */}
          <div className="lg:hidden mt-4 space-y-2">
            {/* Primary Action - Full width */}
            <motion.button
              onClick={() => onView(letter.id)}
              whileTap={{ scale: 0.98 }}
              className="
                w-full px-4 py-3
                bg-gradient-to-r from-pink-600 to-purple-600
                hover:from-pink-700 hover:to-purple-700
                text-white font-medium
                rounded-lg
                shadow-md active:shadow-lg
                transition-all duration-150
                flex items-center justify-center gap-2
              "
            >
              <Eye className="w-4 h-4" />
              Visa brev
            </motion.button>

            {/* Secondary Actions - Grid */}
            <div className="grid grid-cols-3 gap-2">
              <motion.button
                onClick={() => onEdit(letter.id)}
                whileTap={{ scale: 0.98 }}
                className="
                  px-3 py-2.5
                  text-gray-700 bg-white
                  border-2 border-gray-200 hover:border-gray-300
                  rounded-lg
                  text-sm font-medium
                  transition-all
                  flex items-center justify-center gap-2
                "
              >
                <Pencil className="w-4 h-4" />
                <span className="hidden sm:inline">Redigera</span>
              </motion.button>

              <motion.button
                onClick={() => setShowMobileSheet(true)}
                whileTap={{ scale: 0.98 }}
                className="
                  px-3 py-2.5
                  text-gray-700 bg-white
                  border-2 border-gray-200 hover:border-gray-300
                  rounded-lg
                  text-sm font-medium
                  transition-all
                  flex items-center justify-center gap-2
                "
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Ladda ned</span>
              </motion.button>

              <motion.button
                onClick={() => onDelete(letter.id)}
                disabled={isDeleting}
                whileTap={{ scale: 0.98 }}
                className="
                  px-3 py-2.5
                  text-red-600 bg-red-50
                  border-2 border-red-200 hover:border-red-300
                  rounded-lg
                  text-sm font-medium
                  transition-all
                  disabled:opacity-50
                  flex items-center justify-center gap-2
                "
              >
                {isDeleting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Ta bort</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile Bottom Sheet */}
      <AnimatePresence>
        {showMobileSheet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileSheet(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="
                absolute bottom-0 left-0 right-0
                bg-white rounded-t-3xl
                shadow-2xl
                max-h-[80vh] overflow-y-auto
              "
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>

              {/* Content */}
              <div className="px-4 pb-8 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Åtgärder
                </h3>

                <div className="space-y-2">
                  <button
                    onClick={() => { onDownload(letter.id, 'pdf'); setShowMobileSheet(false); }}
                    className="
                      w-full px-4 py-4
                      text-left text-base font-medium
                      text-gray-900 bg-gray-50 hover:bg-gray-100
                      rounded-xl
                      flex items-center gap-3
                      transition-colors
                    "
                  >
                    <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-pink-600" />
                    </div>
                    Ladda ned som PDF
                  </button>

                  <button
                    onClick={() => { onDownload(letter.id, 'docx'); setShowMobileSheet(false); }}
                    className="
                      w-full px-4 py-4
                      text-left text-base font-medium
                      text-gray-900 bg-gray-50 hover:bg-gray-100
                      rounded-xl
                      flex items-center gap-3
                      transition-colors
                    "
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    Ladda ned som Word
                  </button>

                  <button
                    onClick={() => { onDelete(letter.id); setShowMobileSheet(false); }}
                    disabled={isDeleting}
                    className="
                      w-full px-4 py-4
                      text-left text-base font-medium
                      text-red-600 bg-red-50 hover:bg-red-100
                      rounded-xl
                      flex items-center gap-3
                      transition-colors
                      disabled:opacity-50
                    "
                  >
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      {isDeleting ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    {isDeleting ? 'Tar bort...' : 'Ta bort brevet'}
                  </button>
                </div>

                <button
                  onClick={() => setShowMobileSheet(false)}
                  className="
                    w-full mt-4 px-4 py-3
                    text-center text-base font-medium
                    text-gray-700 bg-white
                    border-2 border-gray-200
                    rounded-xl
                    transition-colors
                  "
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
