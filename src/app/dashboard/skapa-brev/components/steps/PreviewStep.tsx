'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Eye, Download, Edit3, Copy, Check, FileText, Save, Info } from 'lucide-react';

interface PreviewStepProps {
  letterContent: string;
  onEdit: (content: string) => void;
  onDownload: () => void;
  onSave?: () => void;
}

export default function PreviewStep({
  letterContent,
  onEdit,
  onDownload,
  onSave
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
            <span className="font-medium">Ditt brev är klart!</span> Kom ihåg att spara eller ladda ner ditt brev så att du kan använda det senare.
          </p>
        </div>
      </div>

      {/* Action Bar - Sticky during scroll */}
      <div className="sticky top-4 z-10 bg-white rounded-xl border-2 border-gray-200 shadow-lg p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left side: Secondary actions */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2.5 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Edit3 className="w-4 h-4" />
              <span className="text-sm">{isEditing ? 'Avbryt' : 'Redigera'}</span>
            </motion.button>

            <motion.button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2.5 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Kopierat!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="text-sm">Kopiera</span>
                </>
              )}
            </motion.button>
          </div>

          {/* Right side: Primary actions */}
          <div className="flex items-center gap-2">
            {onSave && (
              <motion.button
                onClick={onSave}
                className="flex items-center gap-2 px-5 py-2.5 text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Save className="w-4 h-4" />
                <span className="text-sm">Spara</span>
              </motion.button>
            )}

            <motion.button
              onClick={onDownload}
              className="flex items-center gap-2 px-5 py-2.5 text-white bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">Ladda ner</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Document Preview */}
      <div className="bg-gray-50 rounded-2xl p-6 min-h-[600px] flex items-center justify-center">
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
              className="p-16 text-gray-800"
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
          💡 Tips: Du kan redigera texten direkt eller ladda ner som PDF
        </motion.div>
      )}
    </div>
  );
}