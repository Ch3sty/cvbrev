'use client';

/**
 * Fotouppladdning inline i profilen. Två knappar i Trådens form: en
 * sekundär "Ladda upp" eller "Byt bild" och en textlänk "Ta bort".
 * Släppytan blir kant-stark vid drag. Samma API-anrop som förut.
 */

import { useState, useRef } from 'react';

interface InlineProfilePhotoUploadProps {
  currentPhotoUrl?: string;
  onUploadComplete: (photoUrl: string) => void;
  onRemovePhoto: () => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
  maxSizeBytes?: number;
  isUploading?: boolean;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export function InlineProfilePhotoUpload({
  currentPhotoUrl,
  onUploadComplete,
  onRemovePhoto,
  onError,
  onSuccess,
  maxSizeBytes = 2 * 1024 * 1024,
  isUploading = false,
}: InlineProfilePhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      return 'Endast JPG, PNG och WebP-filer stöds';
    }
    if (file.size > maxSizeBytes) {
      const maxSizeMB = Math.round(maxSizeBytes / (1024 * 1024));
      return `Bilden är för stor. Max ${maxSizeMB} MB tillåts`;
    }
    return null;
  };

  const handleFileUpload = async (file: File) => {
    const error = validateFile(file);
    if (error) {
      onError(error);
      return;
    }

    setIsWorking(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/profile/photo/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Uppladdning misslyckades');
      }

      const { photoUrl } = await response.json();
      onUploadComplete(photoUrl);
      onSuccess('Profilbild uppladdad');
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Ett fel uppstod vid uppladdning');
    } finally {
      setIsWorking(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
    event.target.value = '';
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleRemovePhoto = async () => {
    setIsWorking(true);
    try {
      const response = await fetch('/api/profile/photo/delete', { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Borttagning misslyckades');
      }
      onRemovePhoto();
      onSuccess('Profilbild borttagen');
    } catch {
      onError('Kunde inte ta bort profilbild');
    } finally {
      setIsWorking(false);
    }
  };

  const busy = isUploading || isWorking;

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className={`flex flex-wrap items-center gap-2 rounded-lg border border-dashed p-3 transition-colors duration-[120ms] ${
          isDragging ? 'border-kant-stark bg-insunken' : 'border-kant bg-panel'
        }`}
      >
        <button
          type="button"
          disabled={busy}
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex h-11 items-center justify-center rounded-lg border border-kant bg-panel px-4 text-sm font-medium text-ink-1 transition-colors hover:border-kant-stark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? 'Laddar upp' : currentPhotoUrl ? 'Byt bild' : 'Ladda upp'}
        </button>

        {currentPhotoUrl && (
          <button
            type="button"
            disabled={busy}
            onClick={handleRemovePhoto}
            className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 hover:text-ink-1 disabled:opacity-60"
          >
            Ta bort
          </button>
        )}
      </div>

      <p className="mt-2 text-meta text-ink-3">
        Du väljer själv när du skapar varje CV om bilden ska vara med. JPG, PNG eller WebP, max 2 MB.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
