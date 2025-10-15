'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Loader2, FileText } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface CVUploadZoneProps {
  onUpload: (file: File) => Promise<void>;
  disabled?: boolean;
  maxSizeMB?: number;
  className?: string;
}

export default function CVUploadZone({
  onUpload,
  disabled = false,
  maxSizeMB = 10,
  className = ''
}: CVUploadZoneProps) {
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0 || disabled) return;

    const file = acceptedFiles[0];
    setUploadingFile(file);
    setUploadError(null);
    setIsUploading(true);

    try {
      await onUpload(file);
      setUploadingFile(null);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Kunde inte ladda upp CV. Försök igen.');
      setUploadingFile(null);
    } finally {
      setIsUploading(false);
    }
  }, [onUpload, disabled]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    maxSize: maxSizeMB * 1024 * 1024,
    disabled: disabled || isUploading
  });

  return (
    <div className={className}>
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
          transition-all duration-300
          ${isDragActive
            ? 'border-pink-500 bg-pink-50/50'
            : disabled || isUploading
            ? 'border-gray-300 bg-gray-50 cursor-not-allowed opacity-50'
            : 'border-gray-300 hover:border-pink-400 hover:bg-gray-50/50'
          }
        `}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          {isUploading ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-4"
            >
              <Loader2 className="w-12 h-12 text-pink-500 mx-auto animate-spin" />
              <p className="text-lg font-medium text-gray-900">
                Laddar upp {uploadingFile?.name}...
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
                  Max {maxSizeMB}MB
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
          className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
        >
          <X className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800">{uploadError}</p>
        </motion.div>
      )}
    </div>
  );
}
