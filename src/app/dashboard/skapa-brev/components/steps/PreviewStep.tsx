'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Eye, Download, Edit3, Copy, Check, FileText, Save, Info } from 'lucide-react';

interface PreviewStepProps {
  letterContent: string;
  onEdit: (content: string) => void;
  onDownload: (format: 'pdf' | 'docx') => void;
  onSave?: () => void;
  saveError?: string | null;
}

export default function PreviewStep({
  letterContent,
  onEdit,
  onDownload,
  onSave,
  saveError
}: PreviewStepProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(letterContent);
  const [copied, setCopied] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    onEdit(editedContent);
    setIsEditing(false);
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

    // Simple formatting for preview
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
      {/* Friendly Info Banner */}
      <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-900">
            <span className="font-medium">Ditt personliga brev är klart!</span> Läs gärna igenom innehållet och lägg till dina kontaktuppgifter (telefon, e-post, adress) innan du laddar ner. Du kan redigera direkt i texten.
          </p>
        </div>
      </div>

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

      {/* Action Bar - Fixed bottom på mobil, sticky på desktop */}
      <div className="fixed sm:sticky bottom-0 sm:top-4 left-0 right-0 sm:left-auto sm:right-auto z-20 bg-white sm:rounded-xl border-t-2 sm:border-2 border-gray-200 shadow-2xl sm:shadow-lg p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Sekundära actions - Left side */}
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <motion.button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-medium flex-1 sm:flex-initial min-h-[44px]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Edit3 className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{isEditing ? 'Avbryt' : 'Redigera'}</span>
            </motion.button>

            <motion.button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-medium flex-1 sm:flex-initial min-h-[44px]"
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
                onClick={onSave}
                className="flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg font-medium min-h-[44px]"
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
              onClick={() => onDownload('pdf')}
              className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 text-white bg-gradient-to-r from-red-500 to-pink-600 rounded-lg hover:from-red-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg font-medium flex-1 sm:flex-initial min-h-[44px]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              title="Ladda ned som PDF"
            >
              <Download className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">PDF</span>
            </motion.button>

            {/* DOCX Download Button - same level as Save and PDF */}
            <motion.button
              onClick={() => onDownload('docx')}
              className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg font-medium flex-1 sm:flex-initial min-h-[44px]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              title="Ladda ned som DOCX"
            >
              <Download className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">DOCX</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Document Preview */}
      <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 min-h-[400px] sm:min-h-[600px] flex items-center justify-center mb-24 sm:mb-0">
        {isEditing ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl"
          >
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full h-[600px] p-8 bg-white border border-gray-200 rounded-xl text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500"
              style={{ fontFamily: 'Georgia, serif' }}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedContent(letterContent);
                }}
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
            className="bg-white shadow-2xl rounded-lg overflow-hidden w-full max-w-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.25)' }}
          >
            {/* Page Header */}
            <div className="border-b border-gray-100 px-8 py-4 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">Personligt brev</span>
              </div>
            </div>

            {/* Page Content */}
            <div
              className="p-6 sm:p-12 md:p-16 text-gray-800"
              style={{ fontFamily: 'Georgia, serif', lineHeight: '1.8' }}
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
          💡 Klicka var som helst i brevet för att redigera. Bra att lägga till: telefonnummer, e-post och adress längst upp.
        </motion.div>
      )}
    </div>
  );
}