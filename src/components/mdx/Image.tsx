// src/components/mdx/Image.tsx
//
// Bilder i artiklarnas MDX. Serverkomponent: bildens mått läses ur filen i
// public/ vid rendering, så att ytan är reserverad innan bilden laddats.
// Utan mått (width 0, height 0, height auto) växte bilden från noll när den
// kom, och allt under den flyttade sig: CLS 0,06 på artiklarna på desktop
// när framer-motion-animationen som dolde det togs bort (visuella linjen,
// docs/bygg-noter-paket.md). src, alt och bildtexten är oförändrade.

import fs from 'node:fs';
import path from 'node:path';
import NextImage, { ImageProps as NextImageProps } from 'next/image';
import React from 'react';

interface CustomImageProps extends Omit<NextImageProps, 'alt'> {
    alt: string;
}

/** Bredd och höjd ur en webp-, png- eller jpeg-fil i public/, annars null. */
function matt(src: unknown): { w: number; h: number } | null {
    if (typeof src !== 'string' || !src.startsWith('/')) return null;
    try {
        const fil = path.join(process.cwd(), 'public', decodeURIComponent(src.split('?')[0]));
        const fd = fs.openSync(fil, 'r');
        const b = Buffer.alloc(64 * 1024);
        const n = fs.readSync(fd, b, 0, b.length, 0);
        fs.closeSync(fd);
        // WebP
        if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
            const typ = b.toString('ascii', 12, 16);
            if (typ === 'VP8X') return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
            if (typ === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
            if (typ === 'VP8L') {
                const bits = b.readUInt32LE(21);
                return { w: 1 + (bits & 0x3fff), h: 1 + ((bits >> 14) & 0x3fff) };
            }
        }
        // PNG
        if (b.readUInt32BE(0) === 0x89504e47) return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
        // JPEG: leta upp SOF-markören.
        if (b[0] === 0xff && b[1] === 0xd8) {
            let i = 2;
            while (i < n - 9) {
                if (b[i] !== 0xff) { i++; continue; }
                const m = b[i + 1];
                if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
                    return { w: b.readUInt16BE(i + 7), h: b.readUInt16BE(i + 5) };
                }
                i += 2 + b.readUInt16BE(i + 2);
            }
        }
    } catch {
        return null;
    }
    return null;
}

const CustomImage = ({ src, alt, priority = false, className = '', ...rest }: CustomImageProps) => {
    const m = matt(src);
    return (
        <figure className={`my-6 flex flex-col items-center ${className}`}>
            <NextImage
                src={src}
                alt={alt}
                width={m?.w ?? 0}
                height={m?.h ?? 0}
                sizes="(min-width: 1024px) 720px, 100vw"
                style={{
                    width: '100%',
                    height: 'auto',
                    objectFit: 'contain',
                    aspectRatio: m ? `${m.w} / ${m.h}` : undefined,
                }}
                priority={priority}
                className="rounded-md"
                {...rest}
            />
            {alt && <figcaption className="mt-2 text-center text-meta text-ink-3">{alt}</figcaption>}
        </figure>
    );
};

export default CustomImage;
