/**
 * Brevets ark som liten bild på Dina brev: kortet, bunten i väggen,
 * telefonens ark och mätaren Mallen. Samma brev står på upp till fem ställen
 * på sidan, så CSS:en skrivs en gång per brev (MiniatyrStilar) och varje bild
 * bär bara markupen. Skalan sätts med CSS-variabeln --mini-s per brytpunkt,
 * så att samma bild passar telefonens och datorns mått utan mätning i
 * klienten (CLS 0). Arket är alltid vitt papper.
 *
 * Serverkomponent. BrevMiniatyr (arket) tar en fast bredd i px och skriver
 * sin CSS per instans; här behövs en bredd per brytpunkt och delad CSS.
 */
import type { CSSProperties } from 'react'
import { scopaBrevHtml } from '@/lib/letters/brevmall/scopa'

export const ARK_BREDD_PX = 793.7

export interface ArkKalla {
  /** Klassen brevets CSS är scopad till. */
  scope: string
  css: string
  kropp: string
}

/** Delar brevets dokument i scopad CSS och markup. Ett anrop per brev och sida. */
export function arkKalla(html: string, scope: string): ArkKalla {
  const { css, kropp } = scopaBrevHtml(html, scope)
  return { scope, css, kropp }
}

/** CSS:en för alla brev på sidan, en gång var. */
export function MiniatyrStilar({ ark }: { ark: readonly ArkKalla[] }) {
  if (!ark.length) return null
  return <style>{ark.map((a) => a.css).join('\n')}</style>
}

/** Skalan per brytpunkt: bredden i px delat med arkets 793,7. */
export function skala(px: number): string {
  return (px / ARK_BREDD_PX).toFixed(4)
}

export function Miniatyr({ ark, mobil, dator, className }: { ark: ArkKalla; mobil: number; dator?: number; className?: string }) {
  const stil = {
    ['--mini-s' as string]: skala(mobil),
    ['--mini-s-xl' as string]: skala(dator ?? mobil),
    aspectRatio: '210 / 297',
  } as CSSProperties
  return (
    <span className={`b3-hem-mini relative block w-full overflow-hidden bg-white ${className ?? ''}`} style={stil} aria-hidden="true">
      <span
        className={`${ark.scope} absolute left-0 top-0 block origin-top-left [transform:scale(var(--mini-s))] xl:[transform:scale(var(--mini-s-xl))]`}
        style={{ width: ARK_BREDD_PX, pointerEvents: 'none' }}
        dangerouslySetInnerHTML={{ __html: ark.kropp }}
      />
    </span>
  )
}
