'use client'

/**
 * Uppvärmningen på provdagen i ramen (plan-testflode-2026-11-20 etapp 3):
 * tre uppgifter i Figurer och mönster, utan tid, utan nivå och utan
 * sparning. Samma gest som i Träna: tryck markerar, Svara bekräftar,
 * Förklaringen under svaren, Nästa. Servern väljer och dömer
 * (/api/traning/uppvarmning, samma kroppar som Uppvarmning). X stänger
 * direkt: inget sparas, så det finns inget att förlora. Uppvarmning står
 * kvar oanvänd till etapp 5.
 */

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { VisadFraga } from '@/lib/logicTestV7/layered.v7'
import { TRANING_HREF } from '@/lib/traning/klient'
import { PASS_COPY } from '@/lib/traning/pass-copy'
import { fetchUppvarmningApi, type UppvarmningApi, type UppvarmningSvar } from '@/components/traning/Uppvarmning'
import SessionsRam from '../SessionsRam'
import Forklaringen from '../Forklaringen'
import { ForsokIgen, Meddelande } from '../lagen/gemensamt'
import { SESSION } from '../copy'
import { MATRIS } from '../typer/Matris'

type Fas =
  | { typ: 'laddar' }
  | { typ: 'fel' }
  | { typ: 'fraga' }
  | { typ: 'sparar'; vald: number }
  | { typ: 'svarfel'; vald: number }
  | { typ: 'svar'; vald: number; svar: UppvarmningSvar }
  | { typ: 'klar' }

const U = PASS_COPY.uppvarmning
const UNDERTITEL = `Uppvärmning, ${PASS_COPY.topp.uppvarmningRad.charAt(0).toLowerCase()}${PASS_COPY.topp.uppvarmningRad.slice(1)}`

export default function MatrisUppvarmning({ api = fetchUppvarmningApi, fragor: initiala = null }: { api?: UppvarmningApi; fragor?: VisadFraga[] | null }) {
  const router = useRouter()
  const [fragor, setFragor] = useState<VisadFraga[] | null>(initiala)
  const [idx, setIdx] = useState(0)
  const [fas, setFas] = useState<Fas>(initiala ? { typ: 'fraga' } : { typ: 'laddar' })
  const [markerad, setMarkerad] = useState<number | null>(null)

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
  const ram = { lage: 'trana' as const, titel: MATRIS.namn, undertitel: UNDERTITEL, form: MATRIS.form, bekraftaAvbryt: false, onAvbryt: tillbaka }

  if (fas.typ === 'klar') {
    return (
      <SessionsRam {...ram} raknare={{ nr: antal, antal }} framsteg={1} fot={{ primar: { text: U.klarKnapp, onClick: tillbaka, data: 'klar' } }}>
        <Meddelande titel={U.klar} text={U.klarText} />
      </SessionsRam>
    )
  }

  if (fas.typ === 'laddar' || fas.typ === 'fel' || !fragor) {
    return (
      <SessionsRam {...ram} raknare={null} framsteg={0} fot={null}>
        {fas.typ === 'fel' ? (
          <Meddelande titel={SESSION.fel.hamta} text={SESSION.fel.hamtaRad}>
            <ForsokIgen onClick={() => void hamta()} />
          </Meddelande>
        ) : (
          <p aria-busy="true" className="loading-thread rounded-xl border border-kant bg-papper p-4 text-sm text-ink-3">
            {SESSION.laddar.session}
          </p>
        )}
      </SessionsRam>
    )
  }

  const q = fragor[idx]
  const u = { nyckel: q.id, grid: q.grid, options: q.options }
  const sista = idx >= fragor.length - 1
  const svar = fas.typ === 'svar' ? fas.svar : null
  const vald = fas.typ === 'fraga' ? markerad : fas.vald
  const nasta = () => {
    if (sista) setFas({ typ: 'klar' })
    else {
      setIdx(idx + 1)
      setMarkerad(null)
      setFas({ typ: 'fraga' })
    }
  }

  return (
    <SessionsRam
      {...ram}
      raknare={{ nr: idx + 1, antal }}
      framsteg={(idx + (svar ? 1 : 0)) / antal}
      nyckel={q.id}
      tangent={fas.typ === 'fraga' ? { antal: q.options.length, onValj: setMarkerad } : null}
      rad={
        fas.typ === 'svarfel' ? (
          <p role="alert" className="rounded-xl border border-kant bg-papper px-3.5 py-2.5 text-sm leading-5 text-ink-1">
            {SESSION.sparfel.blockerat}
          </p>
        ) : null
      }
      fot={{
        primar:
          fas.typ === 'svarfel'
            ? { text: SESSION.knapp.forsokIgen, onClick: () => void svara(fas.vald), data: 'forsok-igen' }
            : svar
              ? { text: sista ? U.klarKnapp : SESSION.knapp.nasta, onClick: nasta, data: 'nasta' }
              : {
                  text: SESSION.knapp.svara,
                  onClick: () => markerad !== null && void svara(markerad),
                  disabled: markerad === null,
                  laddar: fas.typ === 'sparar',
                  data: 'svara',
                },
      }}
    >
      <div className="flex flex-col gap-4">
        <MATRIS.Uppgift
          u={u}
          nr={idx + 1}
          antal={antal}
          vald={vald}
          facit={svar ? svar.rattVisat : null}
          efterFel={Boolean(svar && !svar.correct)}
          last={fas.typ !== 'fraga'}
          onValj={setMarkerad}
        />
        {svar ? <Forklaringen utfall={svar.correct ? 'ratt' : 'fel'} regel={svar.regel} rullaFram /> : null}
      </div>
    </SessionsRam>
  )
}
