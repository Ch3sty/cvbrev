'use client'

/**
 * Annonsens fot på telefon i fem lägen, för kitsidan (Jobbsöket omgång 2,
 * byggspecen 3.4). Egen klientfil: knapparna tar onClick, och kitsidan är
 * en serverkomponent som inte kan skicka funktioner. Foten döljs från
 * 1280 px, som i appen; granska i 360 och 412 px.
 */

import { FastFot } from '@/components/jobb3/kit'
import { AnnonsFotMobil, type AnnonsHandlingar, type SoktLage, type SparLage } from '@/components/jobb3/jobb/AnnonsVy'

const LAGEN: { namn: string; spara: SparLage; sokt: SoktLage }[] = [
  { namn: 'Inget gjort', spara: 'idle', sokt: 'idle' },
  { namn: 'Sparad', spara: 'sparad', sokt: 'idle' },
  { namn: 'Sökt', spara: 'idle', sokt: 'sokt' },
  { namn: 'Kunde inte spara', spara: 'fel', sokt: 'idle' },
  { namn: 'Sparar', spara: 'sparar', sokt: 'idle' },
]

const ingenting = () => {}

export function AnnonsFotDemo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 12 }}>
      {LAGEN.map((l) => {
        const h: AnnonsHandlingar = { onSkrivBrev: ingenting, onSpara: ingenting, onSokt: ingenting, spara: l.spara, sokt: l.sokt }
        return (
          <div key={l.namn} style={{ maxWidth: 412, padding: '0 16px' }}>
            <p className="j3-fin" style={{ marginBottom: 6 }}>
              {l.namn}
            </p>
            <FastFot rader>
              <AnnonsFotMobil job={{}} handlingar={h} />
            </FastFot>
          </div>
        )
      })}
    </div>
  )
}
