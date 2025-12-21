'use client';

import { useState, useRef } from 'react';
import { Upload, User, Trash2, Crown } from 'lucide-react';

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string;
  onUploadComplete: (photoUrl: string) => void;
  onRemovePhoto: () => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
  maxSizeBytes?: number;
  isUploading?: boolean;
}

export function ProfilePhotoUpload({
  currentPhotoUrl,
  onUploadComplete,
  onRemovePhoto,
  onError,
  onSuccess,
  maxSizeBytes = 2 * 1024 * 1024, // 2MB
  isUploading = false
}: ProfilePhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return 'Endast bildfiler tillåts (JPG, PNG, WebP)';
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
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
      onSuccess('Profilbild uppladdad framgångsrikt');
    } catch (error) {
      console.error('Upload error:', error);
      onError(error instanceof Error ? error.message : 'Ett fel uppstod vid uppladdning');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
    // Reset input så samma fil kan väljas igen
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

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemovePhoto = async () => {
    try {
      const response = await fetch('/api/profile/photo/delete', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Borttagning misslyckades');
      }

      onRemovePhoto();
      onSuccess('Profilbild borttagen framgångsrikt');
    } catch (error) {
      onError('Kunde inte ta bort profilbild');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Profilbild <span className="text-xs text-gray-500 font-normal">(Valfritt)</span>
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Används endast för att personalisera dina CV-mallar. Ingen annan kan se denna bild.
          </p>
        </div>
        <div className="flex items-center text-xs text-pink-700 bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-300 px-2 py-1 rounded-full">
          <Crown className="w-3 h-3 mr-1" />
          Premium
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Current Photo Preview */}
        <div
          className={`w-16 h-16 rounded-full bg-gray-100 border-2 ${
            isDragging ? 'border-pink-500 bg-pink-50' : 'border-gray-200'
          } flex items-center justify-center overflow-hidden transition-all duration-200 ${
            isDragging ? 'scale-105' : ''
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {currentPhotoUrl && !isUploading ? (
            <img
              src={currentPhotoUrl}
              alt="Profilbild"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className={`w-8 h-8 ${isDragging ? 'text-pink-500' : 'text-gray-400'}`} />
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <button
              className="flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700 font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? 'Laddar upp...' : 'Ladda upp bild'}
            </button>

            {currentPhotoUrl && (
              <button
                className="flex items-center justify-center px-4 py-2.5 bg-white text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-50 hover:text-gray-900 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                onClick={handleRemovePhoto}
                disabled={isUploading}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Ta bort
              </button>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-2">
            JPG, PNG eller WebP. Max 2MB. Rekommenderat: 400x400px.
            <br />
            <span className="text-gray-400">Du kan dra och släppa en bild ovan.</span>
          </p>
        </div>
      </div>

      {/* Hidden file input */}
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
