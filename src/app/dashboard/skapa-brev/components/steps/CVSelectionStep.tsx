'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Check, Clock, X, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useCVStore } from '@/store/cv-store';
import { Button } from '@/components/ui/button';

interface CVSelectionStepProps {
  selectedCV: string | null;
  onCVSelect: (cvId: string) => void;
  onCVUpload: (file: File) => Promise<void>;
}

export default function CVSelectionStep({
  selectedCV,
  onCVSelect,
  onCVUpload
}: CVSelectionStepProps) {
  const { cvs, fetchCVs, isLoading } = useCVStore();
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    fetchCVs();
  }, [fetchCVs]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploadingFile(file);
    setUploadError(null);

    try {
      await onCVUpload(file);
      await fetchCVs(); // Refresh CV list
      setUploadingFile(null);
    } catch (error) {
      setUploadError('Kunde inte ladda upp CV. Försök igen.');
      setUploadingFile(null);
    }
  }, [onCVUpload, fetchCVs]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Idag';
    if (diffDays === 1) return 'Igår';
    if (diffDays < 7) return `${diffDays} dagar sedan`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} veckor sedan`;
    return date.toLocaleDateString('sv-SE');
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
          transition-all duration-300
          ${isDragActive
            ? 'border-pink-500 bg-pink-50/50'
            : 'border-gray-300 hover:border-pink-400 hover:bg-gray-50/50'
          }
        `}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          {uploadingFile ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-4"
            >
              <Loader2 className="w-12 h-12 text-pink-500 mx-auto animate-spin" />
              <p className="text-lg font-medium text-gray-900">
                Laddar upp {uploadingFile.name}...
              </p>
              <p className="text-sm text-gray-600">Detta kan ta några sekunder</p>
            </motion.div>
          ) : isDragActive ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5 }}
              >
                <Upload className="w-12 h-12 text-pink-500 mx-auto" />
              </motion.div>
              <p className="text-lg font-medium text-gray-900">Släpp filen här!</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Dra och släpp ditt CV här
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  eller klicka för att välja fil
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                  PDF
                </span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                  Word
                </span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                  Text
                </span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                  Max 10MB
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Message */}
      {uploadError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
        >
          <X className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800">{uploadError}</p>
        </motion.div>
      )}

      {/* Separator */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-600">eller välj från dina sparade CV:n</span>
        </div>
      </div>

      {/* Saved CVs */}
      {isLoading ? (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 text-gray-400 mx-auto animate-spin" />
          <p className="text-gray-600 mt-2">Laddar dina CV:n...</p>
        </div>
      ) : cvs.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-xl">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Du har inga sparade CV:n ännu</p>
          <p className="text-sm text-gray-500 mt-1">Ladda upp ditt första CV ovan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cvs.map((cv) => (
            <motion.button
              key={cv.id}
              onClick={() => onCVSelect(cv.id)}
              className={`
                relative text-left p-4 rounded-xl border-2 transition-all
                ${selectedCV === cv.id
                  ? 'border-pink-500 bg-pink-50/50'
                  : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/50'
                }
              `}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Selection Indicator */}
              {selectedCV === cv.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4"
                >
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </motion.div>
              )}

              <div className="flex items-start gap-3">
                <FileText className={`w-8 h-8 flex-shrink-0 ${
                  selectedCV === cv.id ? 'text-pink-500' : 'text-blue-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {cv.file_name || 'Namnlöst CV'}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-600">
                      Uppladdad {formatDate(cv.created_at)}
                    </span>
                  </div>
                  {/* CV text preview */}
                  <p className="text-sm text-gray-600 mt-1 truncate">
                    {cv.cv_text ? cv.cv_text.substring(0, 50) + '...' : 'CV-innehåll'}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}