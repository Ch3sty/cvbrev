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
 *   onPremium(id)  Valfritt. Gratisanvändaren tryckte på en Premiummall.
 *                  Mallen väljs aldrig: väljaren visar raden "Den här mallen
 *                  ingår i Premium." (PAKETRADER.mallIngar) överst, med en
 *                  länk till /priser, och anropar onPremium om den finns.
 *   brevId         Valfritt. Med id ritas brevets egna miniatyrer (ett anrop
 *                  till POST /api/letters/[id]/forhandsvisa när arket öppnas,
 *                  "exempel" ger exempelbrevet med användarens namn).
 *                  Utan id, eller tills de är hämtade: katalogens bilder
 *                  /mallar/v2/<id>-liten.webp.
 *   fontId         Valfritt typsnitt för miniatyrerna (undefined = brevets).
 *   titel          Valfri rubrik, förval "Välj mall".
 */

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
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
  const [premiumMall, setPremiumMall] = useState<string | null>(null)

  // Raden om Premium gäller ett tryck; den försvinner när arket stängs.
  useEffect(() => {
    if (!open) setPremiumMall(null)
  }, [open])

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
      {premiumMall ? (
        <p role="status" className="m-0 mb-3 rounded-[14px] bg-[color:var(--b3-mjuk)] px-3 py-2.5 text-[14px] leading-5 text-[color:var(--b3-ink)]">
          <b>{PAKETRADER.mallIngar}</b>{' '}
          <Link href="/priser" className="font-semibold underline underline-offset-[3px]">
            {T.seVadSomIngar}
          </Link>
        </p>
      ) : null}
      <ul className="b3-valjare">
        {katalog.map((k) => {
          const far = farSparaMall(k.id, harBetalt)
          const premium = !far
          const ar = k.id === vald
          return (
            <li key={k.id}>
              <button
                type="button"
                className="b3-valjare-kort"
                aria-pressed={ar}
                onClick={() => {
                  if (far) {
                    setPremiumMall(null)
                    onValj(k.id)
                  } else {
                    setPremiumMall(k.id)
                    onPremium?.(k.id)
                  }
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
                {premium ? <span className="sr-only">{T.ingarPremium}</span> : null}
              </button>
            </li>
          )
        })}
      </ul>
    </Sheet>
  )
}
