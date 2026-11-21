'use client'

/**
 * Påminnelsen vid nedladdningen när [antal] står kvar i CV:t (efterrättning
 * A 2026-11-21). Gäller CV-rummets nedladdningar (Mallar och arbetsläget),
 * aldrig den publika prova-sidan eller breven.
 *
 *   rad      En lugn rad vid nedladdningsknappen: "Två rader har [antal]
 *            kvar." och länken Fyll i siffrorna. Ingen andra kopparknapp.
 *   ark      Trycker hon på Ladda ner med platshållare kvar frågar arket
 *            först (samma Ark som resten av rummet): Fyll i siffrorna, eller
 *            Ladda ner ändå, som laddar ner som vanligt.
 *   stoppa   Nedladdningens gemensamma väg anropar stoppa(fortsätt) precis
 *            före filen skapas, så att PDF och Word gör likadant. true betyder
 *            att arket visas och att fortsätt körs först vid Ladda ner ändå.
 *
 * Platshållarna räknas med poängmodellens regel (platshallareKvar), så
 * påminnelsen försvinner när hon sparat sina siffror i arbetsläget.
 */
import { useCallback, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import Ark from '@/components/cv/Dokument/Ark'
import type { PlatshallareKvar } from '@/lib/cv/poang'
import { SIFFROR } from './texter'

/** Vart Fyll i siffrorna leder: arbetsläget (länk) eller bladet i arbetsläget självt. */
export type FyllISiffror = { href: string } | { onClick: () => void }

export interface SiffrorKvar {
  /** Rader med platshållare kvar. */
  antal: number
  /** Raden vid nedladdningsknappen, null när inget står kvar. */
  rad: ReactNode
  /** Arket; rendera det alltid, det syns bara när stoppa() öppnat det. */
  ark: ReactNode
  /**
   * `nu`: platshållarna i CV:t just nu, när det kan ha sparats sedan
   * senaste renderingen (arbetsläget sparar bladet direkt före filen).
   */
  stoppa: (fortsatt: () => void, nu?: readonly PlatshallareKvar[]) => boolean
}

export function useSiffrorKvar(kvar: readonly PlatshallareKvar[], fyllI: FyllISiffror | null): SiffrorKvar {
  const [oppet, setOppet] = useState(false)
  const [arkAntal, setArkAntal] = useState(0)
  const vantar = useRef<(() => void) | null>(null)
  const antal = kvar.length

  const stoppa = useCallback(
    (fortsatt: () => void, nu?: readonly PlatshallareKvar[]) => {
      const n = nu ? nu.length : antal
      if (n === 0) return false
      vantar.current = fortsatt
      setArkAntal(n)
      setOppet(true)
      return true
    },
    [antal]
  )

  const stang = () => {
    vantar.current = null
    setOppet(false)
  }

  const anda = () => {
    const f = vantar.current
    vantar.current = null
    setOppet(false)
    f?.()
  }

  const lank = (klass: string, text: string, efter?: () => void) =>
    !fyllI ? null : 'href' in fyllI ? (
      <Link href={fyllI.href} className={klass} data-fyll-siffror onClick={efter}>
        {text}
      </Link>
    ) : (
      <button
        type="button"
        className={klass}
        data-fyll-siffror
        onClick={() => {
          efter?.()
          fyllI.onClick()
        }}
      >
        {text}
      </button>
    )

  const rad =
    antal > 0 ? (
      <p className="cv3-siffror-rad" data-siffror-rad>
        {SIFFROR.rad(antal)} {lank('cv3-siffror-lank', SIFFROR.knapp)}
      </p>
    ) : null

  const ark = (
    <Ark
      open={oppet && arkAntal > 0}
      onClose={stang}
      rubrik={SIFFROR.arkRubrik(arkAntal)}
      under={SIFFROR.arkText}
      fot={
        <div className="cv3-siffror-fot" data-siffror-ark>
          {lank('t3-stor t3-stor-bred', SIFFROR.knapp, stang)}
          <button type="button" className="t3-liten cv3-bred" onClick={anda} data-ladda-anda>
            {SIFFROR.laddaAnda}
          </button>
        </div>
      }
    >
      {null}
    </Ark>
  )

  return { antal, rad, ark, stoppa }
}
