'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  X,
  Loader2,
  FileText,
  Shield,
  Check,
  AlertCircle,
} from 'lucide-react';
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
  className = '',
}: CVUploadZoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [gdprAccepted, setGdprAccepted] = useState(false);

  const handleGdprChange = useCallback(
    (accepted: boolean) => {
      setGdprAccepted(accepted);
      onGdprChange?.(accepted);
    },
    [onGdprChange]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0 || disabled) return;
      setSelectedFile(acceptedFiles[0]);
      setUploadError(null);
    },
    [disabled]
  );

  const handleUploadClick = async () => {
    if (!selectedFile || !gdprAccepted || isUploading) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
      setGdprAccepted(false);
      handleGdprChange(false);
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : 'Kunde inte ladda upp CV. Försök igen.'
      );
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
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    maxSize: maxSizeMB * 1024 * 1024,
    disabled: disabled || isUploading || !!selectedFile,
  });

  return (
    <div className={className}>
      {/* Step 1: Dropzone */}
      {!selectedFile && (
        <div
          {...getRootProps()}
          className={`relative overflow-hidden rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 ${
            isDragActive
              ? 'border-orange-500 bg-orange-50/60 scale-[1.01]'
              : disabled || isUploading
              ? 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-60'
              : 'border-orange-300/70 bg-orange-50/20 hover:border-orange-400 hover:bg-orange-50/40'
          }`}
        >
          <input {...getInputProps()} />

          <DotPatternBg />

          <div className="relative px-6 py-10 sm:py-12 text-center">
            <AnimatePresence mode="wait">
              {isDragActive ? (
                <motion.div
                  key="active"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center gap-4"
                >
                  <motion.div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white"
                    style={{
                      background:
                        'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                      boxShadow: '0 12px 24px -8px rgba(220, 38, 38, 0.5)',
                    }}
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    <Upload className="w-7 h-7" strokeWidth={2.5} />
                  </motion.div>
                  <p className="text-base sm:text-lg font-semibold text-slate-900">
                    Släpp så börjar vi
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white"
                    style={{
                      background:
                        'linear-gradient(135deg, #FB923C 0%, #DC2626 100%)',
                      boxShadow: '0 8px 18px -6px rgba(220, 38, 38, 0.4)',
                    }}
                  >
                    <Upload className="w-7 h-7" strokeWidth={2.25} />
                  </div>
                  <div>
                    <p className="text-base sm:text-lg font-semibold text-slate-900 mb-1">
                      Dra och släpp ditt CV här
                    </p>
                    <p className="text-sm text-slate-600">
                      eller klicka för att välja fil
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-center mt-1">
                    {['PDF', 'Word', 'Text', `Max ${maxSizeMB} MB`].map((label) => (
                      <span
                        key={label}
                        className="px-2.5 py-1 rounded-full bg-white border border-orange-200/70 text-[11px] font-semibold text-orange-700"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Step 2: File preview */}
      {selectedFile && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-orange-200/70 p-4 sm:p-5"
          style={{
            background:
              'linear-gradient(135deg, rgba(255, 247, 237, 0.7), rgba(254, 226, 226, 0.7))',
          }}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div
              className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-white"
              style={{
                background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                boxShadow: '0 6px 14px -4px rgba(220, 38, 38, 0.35)',
              }}
            >
              <FileText className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2.25} />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base truncate">
                {selectedFile.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-slate-600">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <span className="text-slate-300">·</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-700">
                  <Check className="w-3 h-3" strokeWidth={3} />
                  Klart att laddas upp
                </span>
              </div>
            </div>

            <button
              onClick={handleRemoveFile}
              disabled={isUploading}
              className="flex-shrink-0 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors touch-manipulation min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Ta bort fil"
            >
              <X className="w-5 h-5" strokeWidth={2.25} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 3: GDPR consent */}
      {selectedFile && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={`mt-4 rounded-2xl border p-4 sm:p-5 transition-all ${
            gdprAccepted
              ? 'border-emerald-200 bg-emerald-50/60'
              : 'border-slate-200 bg-white'
          }`}
        >
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={gdprAccepted}
                onChange={(e) => handleGdprChange(e.target.checked)}
                className="peer sr-only"
                disabled={isUploading}
              />
              <motion.div
                className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
                  gdprAccepted
                    ? 'border-emerald-500'
                    : 'border-slate-300 group-hover:border-orange-400'
                }`}
                style={
                  gdprAccepted
                    ? {
                        background:
                          'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      }
                    : { background: 'white' }
                }
                whileTap={{ scale: 0.92 }}
              >
                <AnimatePresence>
                  {gdprAccepted && (
                    <motion.div
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 320 }}
                    >
                      <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Shield
                  className={`w-4 h-4 ${
                    gdprAccepted ? 'text-emerald-600' : 'text-orange-600'
                  }`}
                  strokeWidth={2.25}
                />
                <p className="font-semibold text-slate-900 text-sm sm:text-base">
                  GDPR-samtycke krävs
                </p>
                {!gdprAccepted && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700">
                    Krävs
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Jag godkänner att mitt CV behandlas enligt GDPR och Jobbcoach.ai:s{' '}
                <a
                  href="/integritetspolicy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-700 hover:text-orange-800 underline font-semibold"
                  onClick={(e) => e.stopPropagation()}
                >
                  integritetspolicy
                </a>
                . Dina personuppgifter hanteras säkert och används endast för
                att förbättra din jobbsökning.
              </p>
            </div>
          </label>
        </motion.div>
      )}

      {/* Step 4: Upload button */}
      {selectedFile && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={handleUploadClick}
          disabled={!gdprAccepted || isUploading}
          whileHover={!gdprAccepted || isUploading ? {} : { y: -2 }}
          whileTap={!gdprAccepted || isUploading ? {} : { scale: 0.98 }}
          className={`mt-4 w-full py-3.5 sm:py-4 px-5 rounded-2xl font-bold text-white text-sm sm:text-base flex items-center justify-center gap-2 transition-all touch-manipulation min-h-[52px] ${
            !gdprAccepted ? 'cursor-not-allowed' : 'cursor-pointer'
          }`}
          style={
            !gdprAccepted
              ? { background: '#CBD5E1' }
              : {
                  background: 'linear-gradient(90deg, #F97316, #DC2626)',
                  boxShadow: '0 12px 24px -8px rgba(220, 38, 38, 0.45)',
                }
          }
        >
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Laddar upp och tolkar...</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" strokeWidth={2.5} />
              <span>Ladda upp CV</span>
            </>
          )}
        </motion.button>
      )}

      {selectedFile && !gdprAccepted && !isUploading && (
        <p className="mt-2 text-center text-xs text-slate-500">
          Kryssa i GDPR-rutan för att fortsätta
        </p>
      )}

      {/* Error */}
      <AnimatePresence>
        {uploadError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 rounded-2xl border border-red-200 bg-red-50/80 p-4 flex items-start gap-3"
          >
            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
              <AlertCircle className="w-5 h-5" strokeWidth={2.25} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-red-900 text-sm mb-0.5">
                Uppladdningen misslyckades
              </p>
              <p className="text-xs sm:text-sm text-red-700 leading-snug">
                {uploadError}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DotPatternBg() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
      aria-hidden="true"
    >
      <pattern
        id="upload-zone-dots"
        x="0"
        y="0"
        width="32"
        height="32"
        patternUnits="userSpaceOnUse"
      >
        <circle cx="16" cy="16" r="1" fill="#FB923C" />
      </pattern>
      <rect width="100%" height="100%" fill="url(#upload-zone-dots)" opacity="0.4" />
    </svg>
  );
}
