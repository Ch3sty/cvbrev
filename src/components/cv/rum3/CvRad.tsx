'use client'

/**
 * Raden till höger i väggen (skissen Main): "CV: <namn>  Byt CV  Skapa nytt".
 * Byt CV syns bara när det finns fler än ett CV; namnet är CV:ts file_name.
 * Raden äger de två arken (Byt CV och Ett CV till), och andra knappar på
 * sidan öppnar dem med oppnaBytCv() och oppnaNyttCv(fil?), så att varje
 * flik får samma ark utan att skriva om dem.
 *
 * Utan CV syns ingen rad, men arken finns (Hem-ny öppnar uppladdningen).
 */
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import BytCvArk, { type CvListRad } from './BytCvArk'
import NyttCvArk from './NyttCvArk'
import { flikHref, type CvFlik } from './flikar'
import { CV_RAD } from './texter'

const BYT = 'cv3:byt'
const NYTT = 'cv3:nytt'

/** Öppnar Byt CV-arket från en knapp var som helst på fliken. */
export function oppnaBytCv(): void {
  window.dispatchEvent(new CustomEvent(BYT))
}
/** Öppnar arket Ett CV till, med en redan vald fil om den finns. */
export function oppnaNyttCv(fil?: File | null): void {
  window.dispatchEvent(new CustomEvent(NYTT, { detail: fil ?? null }))
}

export interface CvRadProps {
  cvs: readonly CvListRad[]
  aktivtId: string | null
  sida: CvFlik
  /** Gratisnivåns CV-kvot är full: Ett CV till visar betalväggen. */
  fullt: boolean
  /** Klientbyte av CV (Mallar). Utelämnat: länk med ?cv=. */
  onValj?: (id: string) => void
  /** Efter borttagning. Utelämnat: fliken laddas om. */
  onBorttaget?: (id: string) => void
  /** Efter uppladdning. Utelämnat: Ditt CV med det nya CV:t. */
  onUppladdat?: (id: string) => void
  /** Bara arken, ingen rad (Hem-ny). */
  utanRad?: boolean
}

export default function CvRad({ cvs, aktivtId, sida, fullt, onValj, onBorttaget, onUppladdat, utanRad }: CvRadProps) {
  const router = useRouter()
  const [byt, setByt] = useState(false)
  const [nytt, setNytt] = useState<{ fil: File | null } | null>(null)

  useEffect(() => {
    const b = () => {
      setNytt(null)
      setByt(true)
    }
    const n = (e: Event) => {
      setByt(false)
      setNytt({ fil: ((e as CustomEvent).detail as File | null) ?? null })
    }
    window.addEventListener(BYT, b)
    window.addEventListener(NYTT, n)
    return () => {
      window.removeEventListener(BYT, b)
      window.removeEventListener(NYTT, n)
    }
  }, [])

  const aktivt = cvs.find((c) => c.id === aktivtId) ?? null
  const uppladdat = (id: string) => {
    setNytt(null)
    if (onUppladdat) return onUppladdat(id)
    router.push(flikHref('cv', id))
    router.refresh()
  }

  return (
    <>
      {!utanRad && aktivt ? (
        <p className="cv3-cvrad" data-cv-rad>
          <span className="min-w-0 truncate">
            {CV_RAD.cv} <b>{aktivt.namn}</b>
          </span>
          {cvs.length > 1 ? (
            <button type="button" onClick={() => setByt(true)} aria-haspopup="dialog">
              {CV_RAD.byt}
            </button>
          ) : null}
          <button type="button" onClick={() => setNytt({ fil: null })} aria-haspopup="dialog">
            {CV_RAD.skapa}
          </button>
        </p>
      ) : null}
      <BytCvArk
        open={byt}
        onClose={() => setByt(false)}
        cvs={cvs}
        aktivtId={aktivtId}
        sida={sida}
        onValj={
          onValj
            ? (id) => {
                setByt(false)
                onValj(id)
              }
            : undefined
        }
        onNytt={() => {
          setByt(false)
          setNytt({ fil: null })
        }}
        onBorttaget={onBorttaget}
      />
      <NyttCvArk
        open={nytt !== null}
        onClose={() => setNytt(null)}
        fullt={fullt && !nytt?.fil}
        startFil={nytt?.fil ?? null}
        onOppnaByt={() => {
          setNytt(null)
          setByt(true)
        }}
        onUppladdat={uppladdat}
      />
    </>
  )
}
