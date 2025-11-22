'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, Download, Edit3, Copy, Check, FileText, Save, Info, Layout, Crown, Lock, Loader2 } from 'lucide-react';
import { DOCX_TEMPLATES, type DocxTemplateId } from '@/lib/letters/docx-templates';
import { extractEditableContent, isTemplateHTML as checkIsTemplateHTML } from '@/lib/letters/extract-editable-content';
import FontSelector, { type FontId, FONTS } from '../FontSelector';

interface PreviewStepProps {
  letterContent: string;
  templateId: string;
  onEdit: (content: string) => void;
  onDownload: (format: 'pdf' | 'docx') => void;
  onSave?: () => void;
  selectedFont: FontId;
  onFontChange: (fontId: FontId) => void;
  saveError?: string | null;
  isPremium?: boolean;
  isRegeneratingTemplate?: boolean;
}

export default function PreviewStep({
  letterContent,
  templateId,
  onEdit,
  onDownload,
  onSave,
  selectedFont,
  onFontChange,
  saveError,
  isPremium = false,
  isRegeneratingTemplate = false
}: PreviewStepProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(letterContent);
  const [editableText, setEditableText] = useState(''); // Clean text för redigering
  const [copied, setCopied] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [isDocxGenerating, setIsDocxGenerating] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const selectedFontData = FONTS[selectedFont];

  const currentTemplate = DOCX_TEMPLATES[templateId as DocxTemplateId];

  // Update editedContent when letterContent changes (e.g., after template regeneration)
  useEffect(() => {
    setEditedContent(letterContent);
  }, [letterContent]);

  const handleCopy = async () => {
    // Kopiera clean text istället för HTML
    const textToCopy = checkIsTemplateHTML(editedContent)
      ? extractEditableContent(editedContent)
      : editedContent;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartEdit = () => {
    // Extrahera clean text när edit-läge startar
    const cleanText = checkIsTemplateHTML(editedContent)
      ? extractEditableContent(editedContent)
      : editedContent;
    setEditableText(cleanText);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    // När användaren sparar, skicka den redigerade texten (INTE HTML)
    // Parent-komponenten måste regenerera HTML med nya texten
    onEdit(editableText);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditableText('');
  };

  const handleSave = async () => {
    if (onSave) {
      await onSave();
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    }
  };

  const handleDownloadPdf = async () => {
    setIsPdfGenerating(true);
    try {
      await onDownload('pdf');
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handleDownloadDocx = async () => {
    setIsDocxGenerating(true);
    try {
      await onDownload('docx');
    } finally {
      setIsDocxGenerating(false);
    }
  };

  const isTemplateHTML = (content: string) => {
    // Check if content is already formatted HTML from a template
    return content.includes('<div') || content.includes('<style');
  };

  const formatContent = (content: string) => {
    // Safety check to prevent React error #300
    if (typeof content !== 'string') {
      console.error('❌ formatContent received non-string:', typeof content, content);
      return '<div class="p-4 bg-red-50 border border-red-200 rounded"><p class="text-red-600">Fel: Kunde inte formatera innehållet. Vänligen kontakta support.</p></div>';
    }

    if (content.trim() === '') {
      console.warn('⚠️ formatContent received empty string');
      return '<div class="p-4 bg-yellow-50 border border-yellow-200 rounded"><p class="text-yellow-600">Tomt innehåll mottaget.</p></div>';
    }

    // If content is already template HTML, return it as-is
    if (isTemplateHTML(content)) {
      console.log('✅ Rendering template HTML with profile data');
      return content;
    }

    // Otherwise, format plain text for display (fallback for legacy content)
    console.log('⚠️ Formatting plain text content (legacy fallback)');
    return content
      .split('\n')
      .map(line => {
        if (line.trim() === '') return '<br/>';
        if (line.startsWith('Hej') || line.startsWith('Dear')) {
          return `<p class="font-semibold mb-4">${line}</p>`;
        }
        if (line.startsWith('Med vänlig hälsning') || line.startsWith('Best regards')) {
          return `<p class="mt-6 font-medium">${line}</p>`;
        }
        return `<p class="mb-3">${line}</p>`;
      })
      .join('');
  };

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      {showSaveSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">Brevet är sparat!</p>
              <p className="text-sm text-green-700">Du kan ladda ner det nedan eller hitta det senare under "Mina Brev".</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Error Banner */}
      {saveError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900 mb-1">Kunde inte spara brevet</p>
              <p className="text-sm text-red-700">{saveError}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Action Bar - Sticky på desktop, normal flow på mobil */}
      <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Sekundära actions - Left side */}
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <motion.button
              onClick={isEditing ? handleCancelEdit : handleStartEdit}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-medium flex-1 sm:flex-initial"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Edit3 className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{isEditing ? 'Avbryt' : 'Redigera'}</span>
            </motion.button>

            <motion.button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-medium flex-1 sm:flex-initial"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm">Kopierat!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">Kopiera</span>
                </>
              )}
            </motion.button>
          </div>

          {/* Primära actions - Right side with consistent alignment */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 sm:flex-initial">
            {/* Optional label for desktop - positioned above all buttons */}
            <span className="text-xs text-gray-600 font-medium px-1 hidden sm:block sm:sr-only">
              Primära åtgärder:
            </span>

            {/* All primary action buttons at same level for proper alignment */}
            {onSave && (
              <motion.button
                onClick={handleSave}
                className="flex items-center justify-center gap-2 px-5 py-2.5 text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                title="Spara brevet"
              >
                <Save className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">Spara</span>
              </motion.button>
            )}

            {/* PDF Download Button - same level as Save */}
            <motion.button
              onClick={handleDownloadPdf}
              disabled={isPdfGenerating}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-white bg-gradient-to-r from-red-500 to-pink-600 rounded-lg hover:from-red-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg font-medium flex-1 sm:flex-initial disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={isPdfGenerating ? {} : { scale: 1.02 }}
              whileTap={isPdfGenerating ? {} : { scale: 0.98 }}
              title="Ladda ned som PDF"
            >
              {isPdfGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin" />
                  <span className="text-sm">Genererar PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">PDF</span>
                </>
              )}
            </motion.button>

            {/* DOCX Download Button - same level as Save and PDF */}
            <motion.button
              onClick={handleDownloadDocx}
              disabled={isDocxGenerating}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg font-medium flex-1 sm:flex-initial disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={isDocxGenerating ? {} : { scale: 1.02 }}
              whileTap={isDocxGenerating ? {} : { scale: 0.98 }}
              title="Ladda ned som DOCX"
            >
              {isDocxGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin" />
                  <span className="text-sm">Genererar DOCX...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">DOCX</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Font Selector */}
      <FontSelector
        selectedFont={selectedFont}
        onFontChange={onFontChange}
        isPremium={isPremium}
      />

      {/* Document Preview */}
      <div className={`bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 min-h-[400px] relative ${isTemplateHTML(editedContent) ? '' : 'flex items-center justify-center'}`}>
        {/* Loading Overlay for Template Regeneration */}
        {isRegeneratingTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl z-10 flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 text-pink-600 animate-spin" />
              <div className="text-center">
                <p className="text-lg font-medium text-gray-900">Uppdaterar brevmall...</p>
                <p className="text-sm text-gray-600 mt-1">Genererar om brevet med den nya designen</p>
              </div>
            </div>
          </motion.div>
        )}

        {isEditing ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl"
          >
            <textarea
              value={editableText}
              onChange={(e) => setEditableText(e.target.value)}
              className="w-full h-[600px] p-8 bg-white border border-gray-200 rounded-xl text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500"
              style={{ fontFamily: selectedFontData.fallback }}
              placeholder="Skriv ditt brev här..."
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Avbryt
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 text-white bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg hover:from-pink-700 hover:to-purple-700"
              >
                Spara ändringar
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            ref={previewRef}
            className={
              isTemplateHTML(editedContent)
                ? 'w-full mx-auto' // Template HTML: full width, let parent control constraints
                : 'bg-white shadow-2xl rounded-lg overflow-hidden w-full max-w-4xl' // Legacy styling for plain text
            }
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={isTemplateHTML(editedContent) ? {} : { boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.25)' }}
          >
            {/* Page Header - Only for plain text (legacy) */}
            {!isTemplateHTML(editedContent) && (
              <div className="border-b border-gray-100 px-8 py-4 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Personligt brev</span>
                </div>
              </div>
            )}

            {/* Page Content */}
            <div
              className={isTemplateHTML(editedContent) ? '' : 'p-6 sm:p-12 md:p-16 text-gray-800'}
              style={
                isTemplateHTML(editedContent)
                  ? { fontFamily: selectedFontData.fallback }
                  : { fontFamily: selectedFontData.fallback, lineHeight: '1.8' }
              }
              dangerouslySetInnerHTML={{ __html: formatContent(editedContent) }}
            />
          </motion.div>
        )}
      </div>

      {/* Help Text */}
      {!isEditing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-gray-600"
        >
          💡 Dina kontaktuppgifter från profilen är redan inkluderade. Klicka på "Redigera" om du vill göra ändringar.
        </motion.div>
      )}
    </div>
  );
}