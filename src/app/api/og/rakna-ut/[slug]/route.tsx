/**
 * GET /api/og/rakna-ut/<slug>?<parametrar>
 *
 * Delningsbilden för ett kalkylatorresultat. Samma parametrar som den
 * delade länken; resultatet räknas med samma funktioner som sidan, så talet
 * i bilden är talet på sidan. Den delade vyn (/rakna-ut/<slug>/delad) pekar
 * og:image och twitter:image hit.
 *
 * Node-runtime: typsnitten (Schibsted Grotesk 500 och 800) läses från
 * src/assets/fonts, som next.config.ts tar med i funktionen. Svaret cachas
 * av CDN:et (samma parametrar ger alltid samma bild), och proxyn hoppar
 * över /api/og.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { ImageResponse } from 'next/og'
import { arSlug } from '@/lib/rakna/delning'
import { sammanfatta } from '@/lib/rakna/sammanfattning'
import { BREDD, HOJD, RaknaUtBild } from './bild'

export const runtime = 'nodejs'

let typsnitt: Promise<[Buffer, Buffer]> | null = null
function laddaTypsnitt() {
  const mapp = path.join(process.cwd(), 'src', 'assets', 'fonts')
  typsnitt ??= Promise.all([
    readFile(path.join(mapp, 'SchibstedGrotesk-Medium.ttf')),
    readFile(path.join(mapp, 'SchibstedGrotesk-ExtraBold.ttf')),
  ])
  return typsnitt
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!arSlug(slug)) return new Response('Okänd kalkylator', { status: 404 })

  const sok = new URL(request.url).searchParams
  const { sammanfattning } = sammanfatta(slug, sok)
  const [medium, extrabold] = await laddaTypsnitt()

  return new ImageResponse(<RaknaUtBild s={sammanfattning} />, {
    width: BREDD,
    height: HOJD,
    fonts: [
      { name: 'Schibsted', data: medium, weight: 500, style: 'normal' },
      { name: 'Schibsted', data: extrabold, weight: 800, style: 'normal' },
    ],
    headers: {
      'Cache-Control': 'public, max-age=86400, s-maxage=31536000, immutable',
    },
  })
}
