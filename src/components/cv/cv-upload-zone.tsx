'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Loader2, FileText, Shield, Check } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface CVUploadZoneProps {
  onUpload: (file: File) => Promise<void>;
  onGdprChange?: (accepted: boolean) => void;
  disabled?: boolean;
  maxSizeMB?: number;
  className?: string;
}

export default function CVUploadZone({
  onUpload,
  onGdprChange,
  disabled = false,
  maxSizeMB = 10,
  className = ''
}: CVUploadZoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [gdprAccepted, setGdprAccepted] = useState(false);

  const handleGdprChange = useCallback((accepted: boolean) => {
    setGdprAccepted(accepted);
    onGdprChange?.(accepted);
  }, [onGdprChange]);

  // onDrop väljer bara filen, laddar INTE upp
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0 || disabled) return;

    const file = acceptedFiles[0];
    setSelectedFile(file);
    setUploadError(null);
  }, [disabled]);

  // Explicit upload-funktion som körs när användaren klickar på knappen
  const handleUploadClick = async () => {
    if (!selectedFile || !gdprAccepted || isUploading) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      await onUpload(selectedFile);
      // Reset efter lyckad uppladdning
      setSelectedFile(null);
      setGdprAccepted(false);
      handleGdprChange(false);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Kunde inte ladda upp CV. Försök igen.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadError(null);
    setGdprAccepted(false);
    handleGdprChange(false);
  };

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
    disabled: disabled || isUploading || !!selectedFile // Disabled när fil är vald
  });

  return (
    <div className={className}>
      {/* Step 1: Upload Zone - Visas BARA om ingen fil är vald */}
      {!selectedFile && (
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
            {isDragActive ? (
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
      )}

      {/* Step 2: Selected File Preview */}
      {selectedFile && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-blue-200 shadow-lg"
        >
          <div className="flex items-center gap-4">
            <motion.div
              className="p-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-md"
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <FileText className="w-8 h-8 text-white" />
            </motion.div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 text-lg truncate">
                {selectedFile.name}
              </h3>
              <p className="text-sm text-slate-600">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>

            <motion.button
              onClick={handleRemoveFile}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              disabled={isUploading}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-6 h-6" />
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Step 3: GDPR Consent Box - Visas BARA om fil är vald */}
      {selectedFile && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`
            mt-6 p-6 rounded-2xl border-2 backdrop-blur-sm shadow-lg
            transition-all duration-300
            ${gdprAccepted
              ? 'bg-gradient-to-r from-emerald-50/90 via-green-50/90 to-emerald-50/90 border-emerald-400 shadow-emerald-500/20'
              : 'bg-gradient-to-r from-blue-50/90 via-purple-50/90 to-pink-50/90 border-blue-300'
            }
          `}
        >
          <div className="flex items-start gap-4">
            <motion.div
              className={`
                p-3 rounded-xl flex-shrink-0 shadow-md
                ${gdprAccepted
                  ? 'bg-gradient-to-br from-emerald-500 to-green-500'
                  : 'bg-gradient-to-br from-blue-500 to-purple-500'
                }
              `}
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Shield className="w-6 h-6 text-white" />
            </motion.div>

            <div className="flex-1">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex-shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={gdprAccepted}
                    onChange={(e) => handleGdprChange(e.target.checked)}
                    className="peer sr-only"
                    disabled={isUploading}
                  />
                  <motion.div
                    className={`
                      w-6 h-6 rounded-lg border-2 flex items-center justify-center
                      transition-all duration-300 shadow-sm
                      ${gdprAccepted
                        ? 'bg-gradient-to-br from-emerald-500 to-green-500 border-emerald-500'
                        : 'bg-white border-gray-300 group-hover:border-blue-400'
                      }
                    `}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <AnimatePresence>
                      {gdprAccepted && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          <Check className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>

                <div className="flex-1">
                  <p className="font-bold text-slate-900 mb-1 text-base">
                    GDPR-samtycke krävs
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Jag godkänner att mitt CV behandlas enligt GDPR och Jobbcoach.ai:s{' '}
                    <a
                      href="/integritetspolicy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 underline font-semibold transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      integritetspolicy
                    </a>
                    . Dina personuppgifter hanteras säkert och används endast för att förbättra din jobbsökning.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 4: Upload Button - Visas BARA om fil är vald */}
      {selectedFile && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={handleUploadClick}
          disabled={!gdprAccepted || isUploading}
          className={`
            mt-6 w-full py-4 px-6 rounded-2xl font-bold text-white text-lg
            flex items-center justify-center gap-3
            transition-all duration-300 shadow-lg
            ${!gdprAccepted
              ? 'bg-gray-400 cursor-not-allowed opacity-60'
              : isUploading
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600'
              : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 hover:shadow-xl hover:scale-[1.02]'
            }
          `}
          whileHover={!gdprAccepted || isUploading ? {} : { y: -2 }}
          whileTap={!gdprAccepted || isUploading ? {} : { scale: 0.98 }}
        >
          {isUploading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="w-6 h-6" />
              </motion.div>
              <span>Laddar upp CV...</span>
            </>
          ) : (
            <>
              <Upload className="w-6 h-6" />
              <span>Ladda upp CV</span>
            </>
          )}
        </motion.button>
      )}

      {/* Tooltip for disabled button */}
      {selectedFile && !gdprAccepted && !isUploading && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-center text-sm text-slate-600"
        >
          Du måste godkänna GDPR-samtycket för att ladda upp
        </motion.p>
      )}

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
