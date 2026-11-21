'use client'

/**
 * Väggens rad uppe till höger (Main, Hem-ny): "Bygger på CV:t {namn}", "Byt
 * CV" och "Skriv nytt brev". Byt CV öppnar CV-väljaren i ett ark; valet
 * gäller nästa brev och står kvar i adressen (?cv=), så att sidan ritas om på
 * servern med det CV:t i alla länkar till Skriv.
 *
 * Arket och väljaren laddas först när de öppnas.
 */
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { HemCv } from './data'

const Sheet = dynamic(() => import('@/components/shell/Sheet'), { ssr: false })
const CvPickerGrid = dynamic(() => import('@/app/dashboard/skapa-brev/components/CvPickerGrid'), { ssr: false })

/** Samma utseende som väggradens länkar (.b3-cvrad a), för knappen Byt CV. */
export const VAGG_LANK =
  'inline-flex min-h-11 cursor-pointer items-center whitespace-nowrap border-0 bg-transparent p-0 text-[color:var(--vagg-ink)] underline underline-offset-[3px] [font:inherit]'

export interface CvValProps {
  cvs: readonly HemCv[]
  lastaCvIds: readonly string[]
  valtCvId: string | null
}

/** Arket med CV-väljaren och dess öppnare. children får öppna-funktionen. */
export function CvValjare({ cvs, lastaCvIds, valtCvId, children }: CvValProps & { children: (oppna: () => void) => React.ReactNode }) {
  const router = useRouter()
  const [oppen, setOppen] = useState(false)
  const valj = (id: string) => {
    setOppen(false)
    if (id !== valtCvId) router.replace(`/dashboard/mina-brev?cv=${encodeURIComponent(id)}`, { scroll: false })
  }
  return (
    <>
      {children(() => setOppen(true))}
      {oppen ? (
        <Sheet open onClose={() => setOppen(false)} title="Byt CV" description="Nästa brev skrivs mot det CV du väljer.">
          <CvPickerGrid cvs={cvs.map((c) => ({ id: c.id, file_name: c.namn, created_at: c.created_at }))}lockedCvIds={new Set(lastaCvIds)} selectedCV={valtCvId} onCVSelect={valj} />
        </Sheet>
      ) : null}
    </>
  )
}

export default function CvRad({ cvNamn, skrivHref, ...val }: CvValProps & { cvNamn: string | null; skrivHref?: string }) {
  return (
    <div className="b3-cvrad">
      {cvNamn ? (
        <span>
          Bygger på CV:t <b>{cvNamn}</b>
        </span>
      ) : null}
      {val.cvs.length > 0 ? (
        <CvValjare {...val}>
          {(oppna) => (
            <button type="button" onClick={oppna} className={VAGG_LANK}>
              Byt CV
            </button>
          )}
        </CvValjare>
      ) : null}
      {skrivHref ? <Link href={skrivHref}>Skriv nytt brev</Link> : null}
    </div>
  )
}
