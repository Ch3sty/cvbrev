'use client'

/**
 * "Något ser fel ut" (tillagg-variation 3.2): en textlänk under regeln i
 * passet och i genomgången. Ett ark med tre val, ett frivilligt textfält om
 * 200 tecken och Skicka. Kvittot är en rad. Ingen belöning, ingen ny vy.
 * Visas aldrig under ett pågående övningsprov (regelpanelen visas inte där).
 *
 * Rapporten går till /api/traning/fraga-rapport med frågans id. Går det
 * inte att skicka står felet på en rad och arket ligger kvar.
 */

import { useId, useState } from 'react'
import { KNAPP_PRIMAR_SMAL, KNAPP_SEKUNDAR_SMAL, LANK } from '@/components/shell/knappar'
import { RAPPORT_COPY as C, RAPPORT_KOMMENTAR_MAX, RAPPORT_ORSAKER, type RapportOrsak, type RapportTestKind } from '@/lib/traning/fragaRapport'

export interface FragaRapportProps {
  qId: string
  sessionId?: string | null
  testKind?: RapportTestKind
  bankVersion?: number | null
}

type Lage = 'stangd' | 'oppen' | 'skickar' | 'skickad' | 'fel'

export default function FragaRapport({ qId, sessionId = null, testKind = 'matris', bankVersion = null }: FragaRapportProps) {
  const [lage, setLage] = useState<Lage>('stangd')
  const [orsak, setOrsak] = useState<RapportOrsak | null>(null)
  const [kommentar, setKommentar] = useState('')
  const rubrikId = useId()

  if (lage === 'skickad') return <p className="mt-2 text-sm text-ink-2" role="status">{C.kvitto}</p>
  if (lage === 'stangd') {
    return (
      <button type="button" className={`${LANK} mt-2 inline-flex min-h-9 items-center`} onClick={() => setLage('oppen')} data-fraga-rapport>
        {C.lank}
      </button>
    )
  }

  const skicka = async () => {
    if (!orsak) return
    setLage('skickar')
    try {
      const svar = await fetch('/api/traning/fraga-rapport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q_id: qId, session_id: sessionId, test_kind: testKind, bank_version: bankVersion, orsak, kommentar: kommentar.trim() || null }),
      })
      setLage(svar.ok || svar.status === 429 ? 'skickad' : 'fel')
    } catch {
      setLage('fel')
    }
  }

  return (
    <div role="group" aria-labelledby={rubrikId} className="mt-3 rounded-[14px] border border-kant bg-papper px-4 py-3.5" data-fraga-rapport-ark>
      <p id={rubrikId} className="text-sm font-medium text-ink-1">{C.rubrik}</p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {RAPPORT_ORSAKER.map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={orsak === o}
            onClick={() => setOrsak(o)}
            className={`min-h-10 rounded-full border px-3.5 text-sm ${orsak === o ? 'border-ink-1 bg-ink-1 text-white' : 'border-kant-stark text-ink-1'}`}
          >
            {C.orsak[o]}
          </button>
        ))}
      </div>
      <label className="mt-3 block text-sm text-ink-2">
        {C.kommentar}
        <textarea
          value={kommentar}
          maxLength={RAPPORT_KOMMENTAR_MAX}
          onChange={(e) => setKommentar(e.target.value)}
          rows={2}
          className="mt-1 block w-full rounded-[10px] border border-kant-stark bg-transparent px-3 py-2 text-[15px] text-ink-1"
        />
      </label>
      {lage === 'fel' ? <p className="mt-2 text-sm text-fel" role="alert">{C.fel}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" disabled={!orsak || lage === 'skickar'} onClick={() => void skicka()} className={KNAPP_PRIMAR_SMAL}>
          {C.skicka}
        </button>
        <button type="button" onClick={() => setLage('stangd')} className={KNAPP_SEKUNDAR_SMAL}>
          {C.avbryt}
        </button>
      </div>
    </div>
  )
}
