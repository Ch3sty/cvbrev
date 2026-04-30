'use client';

import { useState, useRef } from 'react';
import { Upload, Trash2, User } from 'lucide-react';
import Image from 'next/image';

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
      return `Bilden är för stor. Max ${maxSizeMB}MB tillåts`;
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
        className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 transition-all"
        style={{
          border: isDragging
            ? '2px dashed #F97316'
            : '1px solid rgba(249, 115, 22, 0.25)',
        }}
      >
        {/* Förhandsvisning */}
        <div
          className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0"
          style={{
            border: isDragging
              ? '2px solid #F97316'
              : '1px solid rgba(249, 115, 22, 0.25)',
          }}
        >
          {currentPhotoUrl && !busy ? (
            <Image
              src={currentPhotoUrl}
              alt="Profilbild"
              fill
              sizes="48px"
              className="object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
              }}
            >
              <User className="w-5 h-5 text-orange-400" strokeWidth={2} />
            </div>
          )}
        </div>

        {/* Knappar */}
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
          <button
            type="button"
            disabled={busy}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-white font-semibold text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #F97316, #DC2626)',
              boxShadow: '0 3px 10px -3px rgba(220, 38, 38, 0.4)',
            }}
          >
            <Upload className="w-3 h-3" strokeWidth={2.5} />
            {busy ? 'Laddar upp…' : currentPhotoUrl ? 'Byt bild' : 'Ladda upp'}
          </button>

          {currentPhotoUrl && (
            <button
              type="button"
              disabled={busy}
              onClick={handleRemovePhoto}
              className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-50 font-medium text-xs transition-all disabled:opacity-50"
            >
              <Trash2 className="w-3 h-3" strokeWidth={2.25} />
              Ta bort
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
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
