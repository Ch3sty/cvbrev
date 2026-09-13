'use client';
import { useState, useCallback } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useProfile } from '@/hooks/use-profile';

interface InlineCVUploadProps {
  /** Anropas med det uppladdade CV:t så fort servern bekräftat det. */
  onComplete: (cv: { id: string }) => void;
  onCancel?: () => void;
  showCancel?: boolean;
  /** Dölj kortets egen rubrik när föräldern redan satt en. */
  hideHeader?: boolean;
}

export default function InlineCVUpload({
  onComplete,
  onCancel,
  showCancel = true,
  hideHeader = false
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
      // onComplete-callbacken ger oss raden direkt från uppladdningen, så vi
      // slipper gissa vilket CV som är det nyss uppladdade.
      const title = selectedFile.name.split('.').slice(0, -1).join('.');
      await uploadCV(selectedFile, title, undefined, (cv) => {
        setSuccess(true);
        onComplete(cv);
      });
    } catch (err: any) {
      setError(err.message || 'Ett oväntat fel uppstod vid uppladdning');
      setUploading(false);
    }
  }

  return (
    <div className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
      <div className={`flex items-start justify-between ${hideHeader ? '' : 'mb-4'}`}>
        {hideHeader ? (
          <span />
        ) : (
          <div>
            <h3 className="text-kort text-ink-1">Ladda upp ditt CV</h3>
            <p className="mt-1 text-sm text-ink-2">
              För att skapa personliga brev behöver vi ditt CV
            </p>
          </div>
        )}
        {showCancel && onCancel && (
          <button
            onClick={onCancel}
            aria-label="Avbryt"
            className="rounded-lg p-2 text-ink-2 transition-colors hover:bg-insunken"
            disabled={uploading}
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        )}
      </div>

      {success ? (
        <div key="success" className="py-8 text-center">
          <p className="text-kort text-ink-1">CV:t är inläst</p>
          <p className="mt-1 text-sm text-ink-2">Vi tittar igenom det åt dig.</p>
        </div>
      ) : (
        <div key="upload">
          {!selectedFile ? (
            <div
              {...getRootProps()}
              className={`cursor-pointer rounded-lg border border-dashed p-6 text-center transition-colors ${
                isDragActive
                  ? 'border-ink-1 bg-insunken'
                  : 'border-kant-stark bg-insunken shadow-insunken hover:border-ink-1'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center">
                <Upload className="h-6 w-6 text-ink-2" strokeWidth={1.75} />
                <p className="mt-3 text-sm font-medium text-ink-1">
                  {isDragActive ? 'Släpp filen här' : 'Dra och släpp ditt CV här'}
                </p>
                <p className="mt-1 text-meta text-ink-3">eller klicka för att välja fil</p>
                <p className="mt-3 text-meta text-ink-3">PDF, Word eller text. Max 5 MB.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border border-kant bg-insunken p-3 shadow-insunken">
                <FileText className="h-6 w-6 flex-shrink-0 text-ink-2" strokeWidth={1.75} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-1">{selectedFile.name}</p>
                  <p className="text-meta text-ink-3">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>
                {!uploading && (
                  <button
                    onClick={() => setSelectedFile(null)}
                    aria-label="Ta bort filen"
                    className="flex-shrink-0 rounded-lg p-2 text-ink-2 transition-colors hover:bg-panel"
                  >
                    <X className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                )}
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-kant bg-panel p-3">
                <input
                  type="checkbox"
                  checked={gdprAccepted}
                  onChange={(e) => setGdprAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-kant-stark accent-[color:var(--ink-1)] focus:ring-1 focus:ring-ink-1"
                  disabled={uploading}
                />
                <span className="flex-1 text-sm text-ink-2">
                  Jag samtycker till att mitt CV behandlas enligt{' '}
                  <a
                    href="/gdpr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink-1 underline underline-offset-4 decoration-kant-stark hover:decoration-ink-1"
                  >
                    GDPR-riktlinjerna
                  </a>
                  . Ditt CV används bara för att skapa brev och analyser åt dig. Vi delar det
                  aldrig med tredje part.
                </span>
              </label>

              {error && (
                <div className="rounded-lg border border-fel-kant bg-fel-mjuk p-3">
                  <p className="text-sm text-fel">{error}</p>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!gdprAccepted || uploading}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-hover disabled:opacity-40"
              >
                {uploading ? 'Laddar upp...' : 'Ladda upp CV'}
              </button>

              {subscriptionTier === 'free' && (
                <p className="text-center text-meta text-ink-3">
                  Som gratisanvändare kan du ladda upp två CV. Premium ger obegränsat.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
