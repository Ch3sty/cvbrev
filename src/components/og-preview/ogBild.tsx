/**
 * Ritar en delningsbild (og:image) med sajtens rubriksnitt.
 *
 * Satori läser bara ttf, otf och woff, inte woff2, och har inga egna
 * typsnitt. Schibsted Grotesk ligger därför som ttf i src/assets/fonts
 * (vikterna 500 och 800, samma filer som bilden för Räkna ut) och läses
 * från disk en gång per process. next.config.ts tar med filerna i de
 * funktioner som ritar bilder vid anrop (nyckeln 'opengraph-image' i
 * outputFileTracingIncludes); de statiska bilderna ritas redan i bygget.
 *
 * Varje opengraph-image.tsx anropar ogBild(<OgFrame ... />) i stället för
 * new ImageResponse, och får då snitt och mått utan egen kod. Filen läser
 * från disk och får bara importeras i serverkod.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { ReactElement } from 'react'
import { ImageResponse } from 'next/og'

export const OG_STORLEK = { width: 1200, height: 630 } as const

let typsnitt: Promise<[Buffer, Buffer]> | null = null

function laddaTypsnitt(): Promise<[Buffer, Buffer]> {
  typsnitt ??= Promise.all([
    readFile(path.join(process.cwd(), 'src', 'assets', 'fonts', 'SchibstedGrotesk-Medium.ttf')),
    readFile(path.join(process.cwd(), 'src', 'assets', 'fonts', 'SchibstedGrotesk-ExtraBold.ttf')),
  ])
  return typsnitt
}

export async function ogBild(bild: ReactElement): Promise<ImageResponse> {
  let filer: [Buffer, Buffer]
  try {
    filer = await laddaTypsnitt()
  } catch (e) {
    // Hellre en bild i standardsnittet än ingen bild alls: saknas filerna i
    // funktionen (fel i spårningen på Vercel) ska delningen ändå få sin bild.
    typsnitt = null
    console.error('[ogBild] typsnittet gick inte att läsa, ritar utan:', e instanceof Error ? e.message : String(e))
    return new ImageResponse(bild, { ...OG_STORLEK })
  }
  const [medium, extrabold] = filer
  return new ImageResponse(bild, {
    ...OG_STORLEK,
    fonts: [
      { name: 'Schibsted Grotesk', data: medium, weight: 500, style: 'normal' },
      { name: 'Schibsted Grotesk', data: extrabold, weight: 800, style: 'normal' },
    ],
  })
}
