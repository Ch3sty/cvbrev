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
    // Korrigera sökvägarna
    let correctedPath = src;
    
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
  }, [src]);

  const handleImageError = () => {
    console.warn(`Kunde inte ladda bild: ${imagePath} för artikel ${slug}`);
    setImageError(true);
  };

  if (imageError || !imagePath) {
    return (
      <div className="fallback-icon-container flex items-center justify-center w-full h-full bg-gradient-to-br from-navy-800 to-navy-700">
        <FileText className="w-12 h-12 text-navy-600" />
      </div>
    );
  }

  return (
    <Image
      src={imagePath}
      alt={alt || 'Artikelbild'}
      fill
      sizes="(max-width: 768px) 100vw, 50vw"
      className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
      onError={handleImageError}
    />
  );
}