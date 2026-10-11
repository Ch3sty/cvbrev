'use client';

/**
 * Uppladdningen av ett CV (Mina CV, Jobbsökets hem i läge A, analysens
 * första steg). Rummens material (våg 4): streckad kant på papper-2, ikonen
 * utan ruta bakom, chipen som rummets Chip, samtycket som ett val med
 * bläckkant och kopparknappen först när en fil är vald. Ingen rörelse utom
 * spinnern under uppladdningen.
 */

import { useState, useCallback } from 'react';
import {
  Upload,
  X,
  Loader2,
  FileText,
  Shield,
  Check,
  AlertCircle,
} from '@/components/illustrations/RumIkoner';
import { useDropzone } from 'react-dropzone';
import { KNAPP_PRIMAR } from '@/components/shell/knappar';

type UploadPhase = 'uploading' | 'vision';

interface CVUploadZoneProps {
  onUpload: (
    file: File,
    onPhaseChange?: (phase: UploadPhase, label: string) => void,
  ) => Promise<void>;
  onGdprChange?: (accepted: boolean) => void;
  disabled?: boolean;
  maxSizeMB?: number;
  className?: string;
}

const PHASE_LABELS: Record<UploadPhase, string> = {
  uploading: 'Laddar upp och tolkar...',
  vision:
    'Datan ligger bakom grafik. Vi läser igenom det, tar några sekunder till...',
};

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
  const [phase, setPhase] = useState<UploadPhase>('uploading');

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
    setPhase('uploading');
    setUploadError(null);

    try {
      await onUpload(selectedFile, (newPhase) => {
        setPhase(newPhase);
      });
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
      setPhase('uploading');
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
      {/* Steg 1: släppytan */}
      {!selectedFile && (
        <div
          {...getRootProps()}
          className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-colors duration-200 ${
            isDragActive
              ? 'border-koppar bg-papper-2'
              : disabled || isUploading
              ? 'cursor-not-allowed border-kant bg-papper-2 opacity-60'
              : 'border-kant-stark bg-papper-2 hover:border-ink-3'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-3 px-6 py-9 text-center sm:py-11">
            <Upload className="h-10 w-10 text-ton-ink" />
            {isDragActive ? (
              <p className="text-base font-semibold text-ink-1">Släpp så börjar vi</p>
            ) : (
              <>
                <div>
                  <p className="text-base font-semibold text-ink-1">Dra och släpp ditt CV här</p>
                  <p className="mt-0.5 text-sm text-ink-2">eller klicka för att välja fil</p>
                </div>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {['PDF', 'Word', 'Text', `Max ${maxSizeMB} MB`].map((label) => (
                    <span
                      key={label}
                      className="inline-flex h-7 items-center rounded-lg border border-kant bg-papper px-2.5 text-xs font-medium text-ink-2"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Steg 2: vald fil */}
      {selectedFile && (
        <div className="flex items-center gap-3 rounded-xl border border-kant bg-papper p-4">
          <FileText className="h-10 w-10 shrink-0 text-ton-ink" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold leading-5 text-ink-1">{selectedFile.name}</p>
            <p className="mt-0.5 text-meta text-ink-3">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · Klart att laddas upp
            </p>
          </div>
          <button
            type="button"
            onClick={handleRemoveFile}
            disabled={isUploading}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-papper-2 hover:text-ink-1"
            aria-label="Ta bort fil"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Steg 3: samtycket, ett val i formuläret (bläckkant när det är valt) */}
      {selectedFile && (
        <label
          className={`mt-3 flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
            gdprAccepted ? 'border-ink-1 shadow-val' : 'border-kant'
          } bg-papper`}
        >
          <input
            type="checkbox"
            checked={gdprAccepted}
            onChange={(e) => handleGdprChange(e.target.checked)}
            className="peer sr-only"
            disabled={isUploading}
          />
          <span
            aria-hidden="true"
            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[color:var(--fokus)] ${
              gdprAccepted ? 'border-ink-1 bg-ink-1 text-papper' : 'border-kant-stark bg-papper'
            }`}
          >
            {gdprAccepted ? <Check className="h-4 w-4" strokeWidth={2.5} /> : null}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4 shrink-0 text-ink-3" />
              <span className="text-[15px] font-semibold leading-5 text-ink-1">GDPR-samtycke krävs</span>
            </span>
            <span className="mt-1 block text-sm leading-[21px] text-ink-2">
              Jag godkänner att mitt CV behandlas enligt GDPR och Jobbcoach.ai:s{' '}
              <a
                href="/integritetspolicy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-ink-1 underline decoration-kant-stark underline-offset-4"
                onClick={(e) => e.stopPropagation()}
              >
                integritetspolicy
              </a>
              . Dina personuppgifter hanteras säkert och används endast för att förbättra din jobbsökning.
            </span>
          </span>
        </label>
      )}

      {/* Steg 4: uppladdningen */}
      {selectedFile && (
        <button
          type="button"
          onClick={handleUploadClick}
          disabled={!gdprAccepted || isUploading}
          className={`${KNAPP_PRIMAR} mt-3 h-auto min-h-12 py-3 text-center disabled:cursor-not-allowed`}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-5 w-5 shrink-0 animate-spin" />
              <span className="leading-tight">{PHASE_LABELS[phase]}</span>
            </>
          ) : (
            <span>Ladda upp CV</span>
          )}
        </button>
      )}

      {selectedFile && !gdprAccepted && !isUploading && (
        <p className="mt-2 text-center text-meta text-ink-3">Kryssa i GDPR-rutan för att fortsätta</p>
      )}

      {/* Fel */}
      {uploadError && (
        <div role="alert" className="mt-3 flex items-start gap-2.5 rounded-xl border border-fel-kant bg-fel-mjuk p-3 text-fel">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Uppladdningen misslyckades</p>
            <p className="mt-0.5 text-sm leading-[21px] text-fel-morker">{uploadError}</p>
          </div>
        </div>
      )}
    </div>
  );
}
