'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, Check, Upload, ArrowRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { useCVStore } from '@/store/cv-store';
import { formatCVDate } from '@/lib/utils/date-formatter';
import InlineCVUpload from './InlineCVUpload';

interface UnifiedCVSelectorProps {
  selectedCV: string | null;
  onCVSelect: (cvId: string) => void;
  variant?: 'grid' | 'compact';
  showEmptyState?: boolean;
  showHeader?: boolean;
}

export default function UnifiedCVSelector({
  selectedCV,
  onCVSelect,
  variant = 'grid',
  showEmptyState = true,
  showHeader = true
}: UnifiedCVSelectorProps) {
  const { cvs, isLoading, fetchCVs } = useCVStore();
  const [showInlineUpload, setShowInlineUpload] = useState(false);

  // fetchCVs removed - parent component should handle this to avoid race conditions

  async function handleUploadSuccess(cvId: string) {
    setShowInlineUpload(false);
    await fetchCVs(); // Refresh CV list
    onCVSelect(cvId); // Auto-select the uploaded CV
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  // Empty state
  if (cvs.length === 0 && showEmptyState) {
    if (showInlineUpload) {
      return (
        <InlineCVUpload
          onSuccess={handleUploadSuccess}
          onCancel={() => setShowInlineUpload(false)}
          showCancel={true}
        />
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="border-2 border-dashed border-gray-300 rounded-2xl p-12 bg-gray-50"
      >
        <div className="flex flex-col items-center justify-center text-gray-600">
          <motion.div
            className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-4"
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <FileText className="w-10 h-10 text-blue-600" />
          </motion.div>
          <p className="text-lg font-semibold text-gray-900 mb-2">Inga CV:n uppladdade än</p>
          <p className="text-sm text-gray-500 mb-6">Ladda upp ditt CV för att komma igång</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowInlineUpload(true)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ladda upp här
            </button>
            <Link
              href="/dashboard/profil/cv"
              className="inline-flex items-center px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:shadow transition-all font-medium"
            >
              <Upload className="w-4 h-4 mr-2" />
              Gå till Mina CV:n
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  // Compact variant (list-style for sidebars)
  if (variant === 'compact') {
    return (
      <div className="space-y-2">
        {cvs.map((cv, index) => {
          const isSelected = selectedCV === cv.id;

          return (
            <motion.button
              key={cv.id}
              onClick={() => onCVSelect(cv.id)}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                w-full text-left p-3 rounded-lg border transition-all duration-300 relative
                ${isSelected
                  ? 'bg-pink-50/80 border-pink-500 ring-2 ring-pink-400/30 shadow-lg'
                  : 'bg-white/60 border-gray-200 hover:bg-gray-50/80 hover:border-gray-300 hover:shadow-md'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 p-2 rounded-lg ${
                  isSelected ? 'bg-pink-100' : 'bg-gray-100'
                }`}>
                  <FileText className={`w-4 h-4 ${
                    isSelected ? 'text-pink-600' : 'text-gray-500'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate text-sm ${
                    isSelected ? 'text-gray-900' : 'text-gray-700'
                  }`}>
                    {cv.file_name}
                  </p>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatCVDate(cv.created_at)}
                  </div>
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="flex-shrink-0"
                  >
                    <Check className="w-5 h-5 text-pink-600" />
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    );
  }

  // Grid variant (default - card-style like "Mina CV:n")
  return (
    <div>
      {/* Header */}
      {showHeader && (
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Välj ditt CV</h2>
          <p className="text-gray-600">Välj det CV du vill använda</p>
        </div>
      )}

      {/* CV Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cvs.map((cv, index) => {
          const isSelected = selectedCV === cv.id;

          return (
            <motion.button
              key={cv.id}
              onClick={() => onCVSelect(cv.id)}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              className={`
                group relative bg-white border-2 rounded-2xl overflow-hidden transition-all text-left
                ${isSelected
                  ? 'border-pink-400 shadow-2xl ring-4 ring-pink-400/20'
                  : 'border-gray-200 hover:border-pink-400 hover:shadow-2xl'
                }
              `}
            >
              {/* Selection Check Indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute top-3 right-3 w-8 h-8 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg z-10"
                >
                  <Check className="w-5 h-5 text-white" />
                </motion.div>
              )}

              {/* CV Icon Header */}
              <div className="p-6 bg-gradient-to-br from-pink-50 to-purple-50 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <motion.div
                      className="p-3 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex-shrink-0"
                      whileHover={{ rotate: 5, scale: 1.1 }}
                    >
                      <FileText className="w-6 h-6 text-white" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-lg truncate mb-1">
                        {cv.file_name}
                      </h3>
                      <div className="flex items-center text-xs text-gray-600">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatCVDate(cv.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CV Preview */}
              <div className="p-6">
                <div className="bg-gray-50 rounded-xl p-4 max-h-32 overflow-hidden relative border border-gray-100">
                  <div className="text-xs text-gray-700 line-clamp-4">
                    {cv.cv_text && cv.cv_text.length > 200
                      ? cv.cv_text.slice(0, 200) + '...'
                      : cv.cv_text || 'Ingen förhandsgranskning tillgänglig'}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50 to-transparent" />
                </div>
              </div>

              {/* Hover Indicator */}
              {!isSelected && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Upload CTA (always visible at bottom) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg"
      >
        <div className="flex items-start gap-2">
          <Upload className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-blue-800 font-medium mb-1">
              Vill du ladda upp ett nytt CV?
            </p>
            <p className="text-xs text-blue-700 mb-2">
              Gå till "Mina CV:n" för att ladda upp fler CV:n
            </p>
            <Link
              href="/dashboard/profil/cv"
              className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-700 underline"
            >
              Gå till Mina CV:n
              <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
