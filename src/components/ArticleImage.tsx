'use client';

import Image from 'next/image';
import { FileText } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ArticleImageProps {
  src: string;
  alt: string;
  slug: string;
}

export default function ArticleImage({ src, alt, slug }: ArticleImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imagePath, setImagePath] = useState('');

  useEffect(() => {
    try {
      // Validate src first
      if (!src || typeof src !== 'string' || src.trim() === '') {
        console.warn('Invalid image src provided:', src);
        setImagePath('');
        setImageError(true);
        return;
      }

      // Korrigera sökvägarna
      let correctedPath = src.trim();

      // Ta bort '/public' om det finns i början av sökvägen
      if (correctedPath.startsWith('/public/')) {
        correctedPath = correctedPath.replace('/public', '');
      } else if (correctedPath.startsWith('public/')) {
        correctedPath = correctedPath.replace('public', '');
      }

      // Lägg till inledande / om det saknas
      if (!correctedPath.startsWith('/') && !correctedPath.startsWith('http')) {
        correctedPath = `/${correctedPath}`;
      }

      console.log(`Original bildväg: ${src}, Korrigerad: ${correctedPath}`);
      setImagePath(correctedPath);
    } catch (error) {
      console.error('Error processing image path:', error);
      setImagePath('');
      setImageError(true);
    }
  }, [src]);

  const handleImageError = () => {
    console.warn(`Kunde inte ladda bild: ${imagePath} för artikel ${slug}`);
    setImageError(true);
  };

  if (imageError || !imagePath) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
        <FileText className="w-12 h-12 text-gray-400" />
      </div>
    );
  }

  return (
    <Image
      src={imagePath}
      alt={alt || 'Artikelbild'}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
      onError={handleImageError}
    />
  );
}