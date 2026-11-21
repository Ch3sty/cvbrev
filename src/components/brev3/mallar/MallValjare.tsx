'use client'

/**
 * Mallväljaren som Skriv brev och Brevet öppnar ("Byt mall" i mallkapseln):
 * de 40 mallarna i ett Sheet, som rutnät med miniatyr, namn, nivå och vald.
 * Fristående: vyn äger valet och vad som händer efter det.
 *
 *   <MallValjare open={visa} onClose={...} vald={mallId} harBetalt={...}
 *     onValj={(id) => ...} onPremium={(id) => ...} brevId={brev.id} />
 *
 * Props:
 *   open, onClose  Sheet:ets läge. Komponenten bör laddas dynamiskt av vyn
 *                  (next/dynamic) så att ingen sida bär den förrän den öppnas.
 *   vald           Mallens id som är brevets (markeras "Vald").
 *   onValj(id)     En mall användaren får ha trycktes. Sheet:et stängs inte av
 *                  sig självt: vyn stänger när valet är sparat (eller direkt).
 *   harBetalt      Betald behörighet. Utan: Premiummallar visar taggen med lås.
 *   onPremium(id)  Gratisanvändaren tryckte på en Premiummall. Saknas den är
 *                  Premiummallarna avstängda för gratis (aria-disabled).
 *   brevId         Valfritt. Med id ritas brevets egna miniatyrer (ett anrop
 *                  till POST /api/letters/[id]/forhandsvisa när arket öppnas,
 *                  "exempel" ger exempelbrevet med användarens namn).
 *                  Utan id, eller tills de är hämtade: katalogens bilder
 *                  /mallar/v2/<id>-liten.webp.
 *   fontId         Valfritt typsnitt för miniatyrerna (undefined = brevets).
 *   titel          Valfri rubrik, förval "Välj mall".
 */

import { useEffect, useMemo, useState } from 'react'
import Sheet from '@/components/shell/Sheet'
import BrevMiniatyr from '@/components/brev3/ark/BrevMiniatyr'
import { Tagg } from '@/components/brev3/kit'
import { PAKETRADER } from '@/components/paywall/paywall-copy'
import { farSparaMall } from '@/lib/letters/brevRegler'
import { mallarKatalog } from './filter'
import { forhandsvisaFlera } from './klient'
import { MALLAR_TEXT as T } from './text'

export interface MallValjareProps {
  open: boolean
  onClose: () => void
  vald: string | null
  onValj: (mallId: string) => void
  harBetalt: boolean
  onPremium?: (mallId: string) => void
  brevId?: string | null
  fontId?: string | null
  titel?: string
}

const MINI_BREDD = 132
const MINI_HOJD = 150

export default function MallValjare({ open, onClose, vald, onValj, harBetalt, onPremium, brevId, fontId, titel }: MallValjareProps) {
  const katalog = useMemo(() => mallarKatalog(), [])
  const [html, setHtml] = useState<Record<string, string>>({})

  // Brevets miniatyrer hämtas en gång, när arket öppnas första gången.
  useEffect(() => {
    if (!open || !brevId || Object.keys(html).length) return
    const ctrl = new AbortController()
    forhandsvisaFlera(
      brevId,
      katalog.map((k) => k.id),
      fontId,
      ctrl.signal,
    )
      .then(setHtml)
      .catch(() => undefined)
    return () => ctrl.abort()
  }, [open, brevId, fontId, katalog, html])

  return (
    <Sheet open={open} onClose={onClose} title={titel ?? T.valjareRubrik} description={T.valjareUnder} size="lg">
      <ul className="b3-valjare">
        {katalog.map((k) => {
          const far = farSparaMall(k.id, harBetalt)
          const avstangd = !far && !onPremium
          const ar = k.id === vald
          return (
            <li key={k.id}>
              <button
                type="button"
                className="b3-valjare-kort"
                aria-pressed={ar}
                aria-disabled={avstangd || undefined}
                onClick={() => {
                  if (far) onValj(k.id)
                  else onPremium?.(k.id)
                }}
              >
                <span className="b3-valjare-bild" aria-hidden="true">
                  {html[k.id] ? (
                    <BrevMiniatyr html={html[k.id]} bredd={MINI_BREDD} hojd={MINI_HOJD} />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/mallar/v2/${k.id}-liten.webp`} alt="" width={MINI_BREDD} height={MINI_HOJD} loading="lazy" decoding="async" />
                  )}
                </span>
                <span className="b3-valjare-text">
                  <b>{k.namn}</b>
                  {ar ? (
                    <Tagg ton="n" bock liten>
                      {T.vald}
                    </Tagg>
                  ) : k.niva === 'gratis' ? (
                    <Tagg ton="g" liten>
                      Gratis
                    </Tagg>
                  ) : (
                    <Tagg ton="p" las={!harBetalt} liten>
                      {PAKETRADER.bricka}
                    </Tagg>
                  )}
                </span>
                {avstangd ? <span className="sr-only">{T.ingarPremium}</span> : null}
              </button>
            </li>
          )
        })}
      </ul>
    </Sheet>
  )
}
