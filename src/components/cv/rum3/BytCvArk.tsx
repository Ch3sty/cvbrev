'use client'

/**
 * Arket Byt CV (byggspecen avsnitt 3): alla sparade CV, det som visas
 * markerat, låsta med "Låst. Ingår i Premium.". Per CV: Visa (byter CV på
 * fliken, ?cv=<id>), Råtext (dagens "Öppna råtext i nytt fönster") och Ta
 * bort med samma bekräftelsedialog som Mina CV hade. Längst ner: Skapa nytt CV.
 *
 * Används på alla tre flikarna via CvRad.
 */
import { useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import Ark from '@/components/cv/Dokument/Ark'
import { IkonLas, IkonSida } from '@/components/illustrations/MallIkoner'
import { formatCVDate } from '@/lib/utils/date-formatter'
import { flikHref, type CvFlik } from './flikar'
import { BYT_ARK } from './texter'
import { oppnaRatext } from './ratext'

const ConfirmDialog = dynamic(() => import('@/components/shell/ConfirmDialog'), { ssr: false })

/** Ett sparat CV i raden och arket. */
export interface CvListRad {
  id: string
  /** cv_texts.file_name */
  namn: string
  skapad: string
  andrad?: string | null
  /** Utanför gratisnivåns två aktiva (getActiveCvIds). */
  last: boolean
  /** Byggt i CV-byggaren och inte nedladdat än. */
  utkast?: boolean
  /** Senaste analysens poäng för just det här CV:t. */
  poang?: number | null
  /** Råtexten, för "Råtext". */
  cvText?: string | null
}

export interface BytCvArkProps {
  open: boolean
  onClose: () => void
  cvs: readonly CvListRad[]
  aktivtId: string | null
  /** Fliken arket öppnades från; Visa stannar på den. */
  sida: CvFlik
  /** Klientbyte i stället för länk (Mallar byter CV utan ny sidladdning). */
  onValj?: (id: string) => void
  onNytt: () => void
  /** Efter en borttagning; utelämnad laddas fliken om. */
  onBorttaget?: (id: string) => void
}

export default function BytCvArk({ open, onClose, cvs, aktivtId, sida, onValj, onNytt, onBorttaget }: BytCvArkProps) {
  const [taBort, setTaBort] = useState<CvListRad | null>(null)
  const [tarBort, setTarBort] = useState<string | null>(null)
  const [fel, setFel] = useState<string | null>(null)

  const bekrafta = async () => {
    if (!taBort) return
    const id = taBort.id
    setTarBort(id)
    setFel(null)
    try {
      const res = await fetch('/api/cv/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(j.error || 'Kunde inte ta bort CV')
      }
      setTaBort(null)
      if (onBorttaget) onBorttaget(id)
      // Borttaget CV som visades: fliken utan ?cv= visar nästa.
      else window.location.assign(id === aktivtId ? flikHref(sida) : window.location.href)
    } catch (e) {
      setFel((e as Error).message)
      setTaBort(null)
    } finally {
      setTarBort(null)
    }
  }

  return (
    <>
      <Ark
        open={open && !taBort}
        onClose={onClose}
        rubrik={BYT_ARK.rubrik}
        under={BYT_ARK.under}
        fot={
          <button type="button" onClick={onNytt} className="t3-liten cv3-bred">
            {BYT_ARK.nytt}
          </button>
        }
      >
        {fel ? (
          <p role="alert" className="mb-2 text-sm text-fel">
            {fel}
          </p>
        ) : null}
        <ul className="grid gap-2 pb-2" data-byt-cv>
          {cvs.map((c) => {
            const aktiv = c.id === aktivtId
            const meta = c.last
              ? BYT_ARK.last
              : [
                  c.utkast ? BYT_ARK.utkast : typeof c.poang === 'number' ? BYT_ARK.poang(c.poang) : BYT_ARK.inteAnalyserat,
                  BYT_ARK.andrat(formatCVDate(c.andrad ?? c.skapad).toLowerCase()),
                ].join(' ')
            return (
              <li key={c.id} className="cv3-bytrad" data-aktiv={aktiv ? '' : undefined} data-last={c.last ? '' : undefined}>
                <span className="cv3-bytrad-ik" aria-hidden="true">
                  {c.last ? <IkonLas size={18} /> : <IkonSida size={18} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-bold leading-5 text-ink-1">{c.namn}</span>
                  <span className="block text-[13px] leading-[18px] text-[color:var(--cv3-ink-2)]">
                    {aktiv ? <b className="font-semibold text-[color:var(--sess-ratt-ink)]">{BYT_ARK.visasNu}. </b> : null}
                    {meta}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-4">
                    {!aktiv && !c.last ? (
                      onValj ? (
                        <button type="button" className="cv3-textlank" onClick={() => onValj(c.id)}>
                          {BYT_ARK.visa}
                        </button>
                      ) : (
                        <Link href={flikHref(sida, c.id)} className="cv3-textlank" onClick={onClose}>
                          {BYT_ARK.visa}
                        </Link>
                      )
                    ) : null}
                    {!c.last && c.cvText ? (
                      <button type="button" className="cv3-textlank" onClick={() => oppnaRatext(c)}>
                        {BYT_ARK.ratext}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="cv3-textlank cv3-textlank-fel"
                      disabled={tarBort === c.id}
                      onClick={() => setTaBort(c)}
                    >
                      {tarBort === c.id ? BYT_ARK.tarBort : BYT_ARK.taBort}
                    </button>
                  </span>
                </span>
              </li>
            )
          })}
        </ul>
      </Ark>
      {taBort ? (
        <ConfirmDialog
          open
          onCancel={() => setTaBort(null)}
          onConfirm={bekrafta}
          title={BYT_ARK.bekraftaRubrik}
          description={BYT_ARK.bekrafta(taBort.namn || 'CV:t')}
          confirmLabel={BYT_ARK.bekraftaKnapp}
          destructive
        />
      ) : null}
    </>
  )
}
