'use client'

/**
 * Uppvärmningen på provdagen (spec-rummen 6 våg 2 och 3b, konceptets 1d,
 * testansvarigs villkor i 16.2 fråga 4): tre frågor du redan kan, utan tid,
 * utan nivå och utan sparning. Ingen tidsrad, ingen dagsring, inget som
 * räknar. Servern väljer frågorna (seedat på konto och dag) och dömer
 * (/api/traning/uppvarmning); svaret visar regeln, och efter den tredje
 * står en lugn rad och vägen tillbaka.
 */

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { KNAPP_PRIMAR, KNAPPRAD, LANK } from '@/components/shell/knappar'
import type { VisadFraga } from '@/lib/logicTestV7/layered.v7'
import { TRANING_HREF } from '@/lib/traning/klient'
import { PASS_COPY } from '@/lib/traning/pass-copy'
import PassFraga from './PassFraga'
import PassShell from './PassShell'
import Regelpanel from './Regelpanel'

export type UppvarmningSvar = { correct: boolean; rattVisat: number; regel: string }

export interface UppvarmningApi {
  hamta(): Promise<VisadFraga[] | null>
  svara(questionId: string, selectedIndex: number): Promise<UppvarmningSvar | null>
}

export const fetchUppvarmningApi: UppvarmningApi = {
  async hamta() {
    try {
      const r = await fetch('/api/traning/uppvarmning', { cache: 'no-store' })
      if (!r.ok) return null
      return ((await r.json()) as { fragor: VisadFraga[] }).fragor
    } catch {
      return null
    }
  },
  async svara(questionId, selectedIndex) {
    try {
      const r = await fetch('/api/traning/uppvarmning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, selectedIndex }),
      })
      if (!r.ok) return null
      return (await r.json()) as UppvarmningSvar
    } catch {
      return null
    }
  },
}

type Fas =
  | { typ: 'laddar' }
  | { typ: 'fel' }
  | { typ: 'fraga' }
  | { typ: 'sparar'; vald: number }
  | { typ: 'svarfel'; vald: number }
  | { typ: 'svar'; vald: number; svar: UppvarmningSvar }
  | { typ: 'klar' }

const U = PASS_COPY.uppvarmning

export default function Uppvarmning({ api = fetchUppvarmningApi, fragor: initiala = null }: { api?: UppvarmningApi; fragor?: VisadFraga[] | null }) {
  const router = useRouter()
  const [fragor, setFragor] = useState<VisadFraga[] | null>(initiala)
  const [idx, setIdx] = useState(0)
  const [fas, setFas] = useState<Fas>(initiala ? { typ: 'fraga' } : { typ: 'laddar' })

  const hamta = useCallback(async () => {
    setFas({ typ: 'laddar' })
    const f = await api.hamta()
    if (!f || f.length === 0) {
      setFas({ typ: 'fel' })
      return
    }
    setFragor(f)
    setIdx(0)
    setFas({ typ: 'fraga' })
  }, [api])

  useEffect(() => {
    if (!initiala) void hamta()
  }, [initiala, hamta])

  const svara = useCallback(
    async (vald: number) => {
      const q = fragor?.[idx]
      if (!q) return
      setFas({ typ: 'sparar', vald })
      const s = await api.svara(q.id, vald)
      setFas(s ? { typ: 'svar', vald, svar: s } : { typ: 'svarfel', vald })
    },
    [api, fragor, idx]
  )

  const tillbaka = () => router.push(TRANING_HREF)
  const antal = fragor?.length ?? 3

  if (fas.typ === 'klar') {
    return (
      <PassShell titel={PASS_COPY.topp.uppvarmning} undertitel={PASS_COPY.topp.uppvarmningRad} fraga={null} antal={null} tid={null} onAvsluta={tillbaka}>
        <section role="status" className="rounded-2xl border border-kant bg-papper p-4">
          <h2 className="text-kort-t text-ink-1">{U.klar}</h2>
          <p className="mt-1.5 text-sm leading-[21px] text-ink-2">{U.klarText}</p>
          <div className={KNAPPRAD}>
            <Link href={TRANING_HREF} className={KNAPP_PRIMAR}>
              {PASS_COPY.knapp.tillbaka}
            </Link>
          </div>
        </section>
      </PassShell>
    )
  }

  if (fas.typ === 'laddar' || fas.typ === 'fel' || !fragor) {
    return (
      <PassShell titel={PASS_COPY.topp.uppvarmning} undertitel={PASS_COPY.topp.uppvarmningRad} fraga={null} antal={null} tid={null} onAvsluta={tillbaka}>
        {fas.typ === 'fel' ? (
          <section role="status" className="rounded-2xl border border-kant bg-papper p-4">
            <h2 className="text-kort-t text-ink-1">{PASS_COPY.fel.hamta}</h2>
            <div className={KNAPPRAD}>
              <button type="button" onClick={() => void hamta()} className={KNAPP_PRIMAR}>
                {PASS_COPY.knapp.forsokIgen}
              </button>
              <Link href={TRANING_HREF} className={`${LANK} inline-flex min-h-9 items-center justify-center`}>
                {PASS_COPY.knapp.tillbaka}
              </Link>
            </div>
          </section>
        ) : (
          <div aria-busy="true" className="loading-thread aspect-square w-full rounded-2xl border border-kant bg-papper" />
        )}
      </PassShell>
    )
  }

  const q = fragor[idx]
  const sista = idx >= fragor.length - 1
  const svar = fas.typ === 'svar' ? fas.svar : null
  const vald = fas.typ === 'fraga' ? null : fas.vald

  let fot: React.ReactNode = undefined
  if (fas.typ === 'svarfel') {
    fot = (
      <button type="button" onClick={() => void svara(fas.vald)} className={KNAPP_PRIMAR}>
        {PASS_COPY.knapp.forsokIgen}
      </button>
    )
  } else if (svar) {
    fot = (
      <button
        type="button"
        onClick={() => {
          if (sista) setFas({ typ: 'klar' })
          else {
            setIdx(idx + 1)
            setFas({ typ: 'fraga' })
          }
        }}
        className={KNAPP_PRIMAR}
      >
        {sista ? U.klarKnapp : U.nasta}
      </button>
    )
  }

  return (
    <PassShell
      titel={PASS_COPY.topp.uppvarmning}
      undertitel={PASS_COPY.topp.uppvarmningRad}
      fraga={idx + 1}
      antal={antal}
      tid={null}
      onAvsluta={tillbaka}
      fot={fot}
      nyckel={q.id}
      banner={
        fas.typ === 'svarfel' ? (
          <p role="alert" className="rounded-xl border border-kant bg-papper px-4 py-3 text-sm leading-5 text-ink-1">
            {PASS_COPY.fel.svar}
          </p>
        ) : null
      }
    >
      <PassFraga key={q.id} fraga={q} vald={vald} ratt={svar ? svar.rattVisat : null} last={fas.typ !== 'fraga'} onValj={(i) => void svara(i)} />
      {svar ? <Regelpanel rad={svar.correct ? U.ratt : U.fel} regel={svar.regel} visaVidSvar /> : null}
    </PassShell>
  )
}
