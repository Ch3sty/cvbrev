'use client';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, X, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useProfile } from '@/hooks/use-profile';

interface InlineCVUploadProps {
  onSuccess: (cvId: string) => void;
  onCancel?: () => void;
  showCancel?: boolean;
}

export default function InlineCVUpload({
  onSuccess,
  onCancel,
  showCancel = true
}: InlineCVUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [gdprAccepted, setGdprAccepted] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { uploadCV, subscriptionTier } = useProfile();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: uploading
  });

  async function handleUpload() {
    if (!selectedFile) {
      setError('Välj en fil först');
      return;
    }

    if (!gdprAccepted) {
      setError('Du måste acceptera GDPR-villkoren för att fortsätta');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      await uploadCV(selectedFile);
      setSuccess(true);

      // Hämta CV-id (senaste uppladdade)
      const response = await fetch('/api/cv/list');
      const data = await response.json();

      if (data.success && data.cvs && data.cvs.length > 0) {
        const latestCv = data.cvs[0];

        setTimeout(() => {
          onSuccess(latestCv.id);
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || 'Ett oväntat fel uppstod vid uppladdning');
      setUploading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-xl border-2 border-slate-200 p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Ladda upp ditt CV
          </h3>
          <p className="text-sm text-slate-600">
            För att skapa personliga brev behöver vi ditt CV
          </p>
        </div>
        {showCancel && onCancel && (
          <button
            onClick={onCancel}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            disabled={uploading}
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h4 className="text-lg font-semibold text-slate-900 mb-2">
              CV uppladdat! 🎉
            </h4>
            <p className="text-sm text-slate-600">
              Återvänder till guiden...
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Dropzone */}
            {!selectedFile ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8 text-blue-500" />
                  </div>
                  <p className="text-sm font-medium text-slate-900 mb-1">
                    {isDragActive
                      ? 'Släpp filen här...'
                      : 'Dra och släpp ditt CV här'}
                  </p>
                  <p className="text-xs text-slate-500 mb-4">
                    eller klicka för att välja fil
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <span className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600">
                      PDF
                    </span>
                    <span className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600">
                      Word
                    </span>
                    <span className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600">
                      Text
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Max 5MB</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Selected file */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <FileText className="w-10 h-10 text-blue-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-slate-600">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  {!uploading && (
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="p-2 hover:bg-blue-100 rounded-lg transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4 text-slate-600" />
                    </button>
                  )}
                </div>

                {/* GDPR Consent */}
                <label className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={gdprAccepted}
                    onChange={(e) => setGdprAccepted(e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-500 border-slate-300 rounded focus:ring-blue-500"
                    disabled={uploading}
                  />
                  <span className="text-sm text-slate-700 flex-1">
                    Jag samtycker till att mitt CV behandlas enligt{' '}
                    <a
                      href="/gdpr"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      GDPR-riktlinjerna
                    </a>
                    . Ditt CV kommer endast att användas för att skapa personliga brev och
                    analyser åt dig. Vi delar aldrig din information med tredje part.
                  </span>
                </label>

                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200"
                    >
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700 flex-1">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Upload button */}
                <button
                  onClick={handleUpload}
                  disabled={!gdprAccepted || uploading}
                  className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Laddar upp...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Ladda upp CV
                    </>
                  )}
                </button>

                {subscriptionTier === 'free' && (
                  <p className="text-xs text-center text-slate-500">
                    Som gratisanvändare kan du ladda upp upp till 2 CV. Uppgradera till Premium för obegränsade CV:n.
                  </p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
