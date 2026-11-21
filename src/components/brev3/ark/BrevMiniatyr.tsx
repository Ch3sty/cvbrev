/**
 * Brevet som liten bild i kort och remsor (skissen Main, `.brevk .bild`):
 * samma ark som BrevArk, skalat till `bredd`, toppen av arket syns och
 * behållaren beskär resten. Billig: ingen mätning, inget skript, ingen
 * interaktion, och den går att serverrendera (ingen klientkod).
 */
import { useId } from 'react'
import { scopaBrevHtml } from '@/lib/letters/brevmall/scopa'

const ARK_BREDD_PX = 793.7
const ARK_HOJD_PX = 1122.5

export interface BrevMiniatyrProps {
  /** Dokumentet från renderBrevHtml. */
  html: string
  /** Bildens bredd i px. */
  bredd: number
  /** Synlig höjd i px. Saknas: hela arket i A4:ans proportioner. */
  hojd?: number
  className?: string
}

export default function BrevMiniatyr({ html, bredd, hojd, className }: BrevMiniatyrProps) {
  const scope = `brevmini-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const { css, kropp } = scopaBrevHtml(html, scope)
  const s = bredd / ARK_BREDD_PX
  return (
    <div
      className={className}
      aria-hidden="true"
      style={{
        position: 'relative',
        width: bredd,
        height: hojd ?? ARK_HOJD_PX * s,
        overflow: 'hidden',
        background: '#fff',
        borderRadius: '4px 4px 0 0',
        boxShadow: '0 0 0 1px rgba(58,25,48,.08), 0 10px 24px rgba(58,25,48,.22)',
        pointerEvents: 'none',
      }}
    >
      <style>{css}</style>
      <div className={scope} style={{ width: ARK_BREDD_PX, transform: `scale(${s})`, transformOrigin: '0 0' }} dangerouslySetInnerHTML={{ __html: kropp }} />
    </div>
  )
}
