'use client';

import { useState, useRef } from 'react';
import { Upload, User, Trash2, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string;
  onUploadComplete: (photoUrl: string) => void;
  onRemovePhoto: () => void;
  maxSizeBytes?: number;
  isUploading?: boolean;
}

export function ProfilePhotoUpload({
  currentPhotoUrl,
  onUploadComplete,
  onRemovePhoto,
  maxSizeBytes = 2 * 1024 * 1024, // 2MB
  isUploading = false
}: ProfilePhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
      toast({
        title: 'Fel vid uppladdning',
        description: error,
        variant: 'destructive'
      });
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
      
      toast({
        title: 'Profilbild uppladdad',
        description: 'Din profilbild har sparats framgångsrikt',
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Uppladdning misslyckades',
        description: error instanceof Error ? error.message : 'Ett fel uppstod',
        variant: 'destructive'
      });
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
      toast({
        title: 'Profilbild borttagen',
        description: 'Din profilbild har tagits bort',
      });
    } catch (error) {
      toast({
        title: 'Fel vid borttagning',
        description: 'Kunde inte ta bort profilbild',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Profilbild <span className="text-xs text-gray-400 font-normal">(Valfritt)</span>
          </label>
          <p className="text-xs text-gray-400 mb-3">
            Används endast för att personalisera dina CV-mallar. Ingen annan kan se denna bild.
          </p>
        </div>
        <div className="flex items-center text-xs text-pink-400 bg-pink-500/10 px-2 py-1 rounded-full">
          <Crown className="w-3 h-3 mr-1" />
          Premium
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Current Photo Preview */}
        <div 
          className={`w-16 h-16 rounded-full bg-navy-700 border-2 ${
            isDragging ? 'border-pink-500 bg-pink-500/10' : 'border-gray-600'
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
            <User className={`w-8 h-8 ${isDragging ? 'text-pink-400' : 'text-gray-400'}`} />
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <Button 
              variant="secondary" 
              size="sm" 
              className="relative overflow-hidden"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? 'Laddar upp...' : 'Ladda upp bild'}
            </Button>
            
            {currentPhotoUrl && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRemovePhoto}
                disabled={isUploading}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Ta bort
              </Button>
            )}
          </div>
          
          <p className="text-xs text-gray-500 mt-1">
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