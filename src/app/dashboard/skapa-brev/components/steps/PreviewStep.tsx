'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Eye, Download, Edit3, Copy, Check, FileText, ZoomIn, ZoomOut, Save } from 'lucide-react';

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
  const [zoom, setZoom] = useState(0.7);
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
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-xl border border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600 min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(Math.min(1, zoom + 0.1))}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
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

          <motion.button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Edit3 className="w-4 h-4" />
            <span className="text-sm">{isEditing ? 'Avbryt' : 'Redigera'}</span>
          </motion.button>

          {onSave && (
            <motion.button
              onClick={onSave}
              className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Save className="w-4 h-4" />
              <span className="text-sm font-medium">Spara brev</span>
            </motion.button>
          )}

          <motion.button
            onClick={onDownload}
            className="flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Ladda ner PDF</span>
          </motion.button>
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
            className="bg-white shadow-2xl rounded-lg overflow-hidden"
            style={{
              width: '210mm',
              minHeight: '297mm',
              transform: `scale(${zoom})`,
              transformOrigin: 'top center'
            }}
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