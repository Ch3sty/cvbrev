// src/components/mdx/Image.tsx
// UPPDATERAD: Anpassad för att fungera bättre inom .prose

import NextImage, { ImageProps as NextImageProps } from 'next/image';
import React from 'react';

interface CustomImageProps extends Omit<NextImageProps, 'alt'> {
    alt: string;
}

const CustomImage = ({ src, alt, priority = false, className = '', ...rest }: CustomImageProps) => {
    // Försök att inte använda fill, använd istället width/height om möjligt,
    // eller låt bilden anpassa sig till containerns bredd med width=0, height=0 och style.
    // Eftersom vi är i .prose, är det ofta bäst att låta bilden ta upp tillgänglig bredd.

    return (
        // Omslutande div för marginal och rundade hörn (optionellt)
        <figure className={`my-6 flex flex-col items-center ${className}`}> {/* Tog bort shadow, lade till flex */}
             <NextImage
                src={src}
                alt={alt}
                width={0} // Sätt till 0 för att basera på style
                height={0} // Sätt till 0 för att basera på style
                sizes="100vw" // Standard, låt CSS/browsern avgöra
                style={{ width: '100%', height: 'auto', objectFit: 'contain' }} // Låt bilden anpassa höjd automatiskt, begränsa bredd till 100% av container
                priority={priority} // Skicka vidare priority
                className="rounded-md" // Lägg till rundade hörn direkt på bilden
                {...rest} // Skicka vidare övriga props
             />
              {/* Bildtext */}
              {alt && <figcaption className="mt-2 text-center text-sm text-gray-500 italic">{alt}</figcaption>}
        </figure>
    );
};

export default CustomImage;