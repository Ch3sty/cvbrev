'use client'

/**
 * Förhandsvisningens klientdelar: växla ljust och mörkt läge, och öppna
 * spärren i båda varianterna. ?sparr=nedladdning|vecka öppnar direkt (för
 * skärmdumpar), ?tema=mork|ljus väljer läge.
 */

import { useEffect, useState, type ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import BrevSparrLaddare from '@/components/brev3/kit/BrevSparrLaddare'
import { LitenKnapp } from '@/components/brev3/kit/delar'

export function TemaVal() {
  const sok = useSearchParams()
  const [tema, setTema] = useState<'ljus' | 'mork' | 'system'>('system')
  useEffect(() => {
    const t = sok.get('tema')
    if (t === 'mork' || t === 'ljus') setTema(t)
  }, [sok])
  useEffect(() => {
    const r = document.documentElement
    if (tema === 'system') r.removeAttribute('data-theme')
    else r.setAttribute('data-theme', tema === 'mork' ? 'dark' : 'light')
  }, [tema])
  return (
    <div className="b3-seg" role="group" aria-label="Läge">
      {(['ljus', 'mork', 'system'] as const).map((t) => (
        <button key={t} type="button" aria-pressed={tema === t} onClick={() => setTema(t)}>
          {t === 'ljus' ? 'Ljust' : t === 'mork' ? 'Mörkt' : 'System'}
        </button>
      ))}
    </div>
  )
}

export function SparrVal({ brev }: { brev: ReactNode }) {
  const sok = useSearchParams()
  const [oppen, setOppen] = useState<'nedladdning' | 'vecka' | null>(null)
  const [kvitto, setKvitto] = useState<string | null>(null)
  useEffect(() => {
    const s = sok.get('sparr')
    if (s === 'nedladdning' || s === 'vecka') setOppen(s)
  }, [sok])
  return (
    <div className="flex flex-wrap items-center gap-3">
      <LitenKnapp onClick={() => setOppen('nedladdning')}>Öppna spärren: nedladdning</LitenKnapp>
      <LitenKnapp onClick={() => setOppen('vecka')}>Öppna spärren: vecka</LitenKnapp>
      {kvitto ? <span className="text-sm font-semibold">{kvitto}</span> : null}
      <BrevSparrLaddare
        open={oppen !== null}
        variant={oppen ?? 'nedladdning'}
        onClose={() => setOppen(null)}
        brevRubrik="Ditt brev till Nordanvind Energi"
        onKopiera={() => setKvitto('Texten är kopierad')}
        nastaGratis="2026-11-27T08:00:00Z"
        idag={new Date('2026-11-21T10:00:00Z')}
        jobb={{ titel: 'Projektledare, systembyte', foretag: 'Tallbacka Logistik', sistaDag: 'Sista dag 6 dec' }}
        returTill="/dashboard/mina-brev/mallar?ladda=1"
      >
        {brev}
      </BrevSparrLaddare>
    </div>
  )
}
