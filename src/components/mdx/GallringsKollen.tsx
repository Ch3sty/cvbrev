'use client'

import { useState } from 'react'

/**
 * Gallringskollen: interaktiv uppslagning på GDPR-pillaren. Välj uppgiftstyp
 * i rekryteringen → hur länge den får sparas, på vilken grund och vad som
 * gäller praktiskt. Bygger på IMY:s vägledning för arbetsliv och
 * rekryteringssystem. Vägledning, inte juridisk rådgivning.
 */

type Uppgift = {
  id: string
  label: string
  tid: string
  grund: string
  praktik: string
  ton: 'ok' | 'varning' | 'stopp'
}

const UPPGIFTER: Uppgift[] = [
  {
    id: 'ansokan',
    label: 'Ansökningshandlingar (kandidat som inte anställdes)',
    tid: 'Gallras när rekryteringen avslutats. Får sparas så länge en förbigången kandidat kan driva diskrimineringstvist, i praktiken räknar arbetsgivarsidan med upp till två år.',
    grund: 'Berättigat intresse under processen, därefter försvar mot rättsliga anspråk.',
    praktik: 'Sätt gallringsdatum när tjänsten tillsätts, inte "tills vidare". Underlaget är ert försvar vid en tvist, därför sparas hela urvalsunderlaget lika länge.',
    ton: 'ok',
  },
  {
    id: 'anteckningar',
    label: 'Intervjuanteckningar och bedömningar',
    tid: 'Samma som ansökningshandlingarna: till avslutad rekrytering, plus tvistefristen.',
    grund: 'Del av urvalsunderlaget, samma grunder som ansökan.',
    praktik: 'Skriv anteckningar som tål att läsas av kandidaten, registerutdragsrätten omfattar dem. Sakliga bedömningar mot ankarskalor är både bättre urval och bättre juridik.',
    ton: 'ok',
  },
  {
    id: 'test',
    label: 'Testresultat från urvalstester',
    tid: 'Samma tvistefristlogik som övrigt urvalsunderlag, därefter gallring.',
    grund: 'Berättigat intresse som del av urvalet, resultatet ska vara relevant för tjänsten.',
    praktik: 'Spara resultatet och beslutsunderlaget, inte mer. Kandidaten har rätt att få veta hur resultat användes i beslutet.',
    ton: 'ok',
  },
  {
    id: 'referens',
    label: 'Referensanteckningar',
    tid: 'Samma som övrigt urvalsunderlag: till avslutad rekrytering plus tvistefristen.',
    grund: 'Berättigat intresse. Referenssvar är personuppgifter om kandidaten, ibland även om referenten.',
    praktik: 'Dokumentera svar på de strukturerade frågorna, inte löst prat. Känsliga uppgifter som slinker med i samtalet ska inte antecknas alls.',
    ton: 'ok',
  },
  {
    id: 'pool',
    label: 'Profil sparad för framtida rekryteringar (kandidatpool)',
    tid: 'Så länge samtycket gäller. Sätt en giltighetstid och förnya aktivt, gallra direkt vid återkallelse.',
    grund: 'Aktivt samtycke krävs, enligt IMY räcker inga andra grunder för att spara till framtida rekryteringar.',
    praktik: 'Samtycke med datum vid inträde, möjlighet att uppdatera och lämna vid varje kontakt, automatisk gallring när samtycket löper ut.',
    ton: 'varning',
  },
  {
    id: 'utdrag',
    label: 'Utdrag ur belastningsregistret',
    tid: 'Sparas aldrig. Där kontroll är tillåten antecknas endast att utdraget visats upp.',
    grund: 'Uppgifter om lagöverträdelser är som huvudregel förbjudna att behandla för privata arbetsgivare, kontroller är lagreglerade för specifika områden.',
    praktik: 'Kandidaten beställer och visar själv sitt utdrag där regelverket kräver det. Kopiera inte, fotografera inte, arkivera inte.',
    ton: 'stopp',
  },
  {
    id: 'kanslig',
    label: 'Känsliga uppgifter (hälsa, religion, facklig tillhörighet...)',
    tid: 'Ska inte samlas in alls i rekrytering, och inte antecknas när de ändå framkommer.',
    grund: 'Normalt förbjudna att behandla i rekrytering, undantagen är få och smala.',
    praktik: 'En intervjuanteckning om kandidatens hälsa är en liggande risk. Utbilda alla som antecknar.',
    ton: 'stopp',
  },
]

const TON_STIL = {
  ok: { border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-800', etikett: 'Spara med gallringsdatum' },
  varning: { border: 'border-amber-200', badge: 'bg-amber-100 text-amber-800', etikett: 'Kräver samtycke' },
  stopp: { border: 'border-red-200', badge: 'bg-red-100 text-red-800', etikett: 'Spara inte' },
} as const

export default function GallringsKollen() {
  const [valdId, setValdId] = useState<string>('ansokan')
  const vald = UPPGIFTER.find((u) => u.id === valdId) ?? UPPGIFTER[0]
  const stil = TON_STIL[vald.ton]

  return (
    <div className="not-prose my-10 rounded-2xl border border-orange-200 bg-gradient-to-b from-orange-50/70 to-white p-6 sm:p-8">
      <h2 className="text-xl font-black text-slate-900 mb-1">Gallringskollen</h2>
      <p className="text-sm text-slate-600 mb-5">
        Välj uppgiftstyp så visas hur länge den får sparas, på vilken grund och
        vad som gäller i praktiken, enligt IMY:s vägledning.
      </p>

      <div className="flex flex-wrap gap-2 mb-5">
        {UPPGIFTER.map((u) => (
          <button
            key={u.id}
            type="button"
            onClick={() => setValdId(u.id)}
            className={`rounded-lg border px-3 py-2 text-xs font-semibold text-left transition-colors ${
              u.id === valdId
                ? 'border-orange-600 bg-orange-600 text-white'
                : 'border-orange-200 bg-white text-slate-700 hover:border-orange-400'
            }`}
          >
            {u.label}
          </button>
        ))}
      </div>

      <div className={`rounded-xl border ${stil.border} bg-white p-4 sm:p-5 mb-4`}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <p className="text-sm font-bold text-slate-900 mb-0">{vald.label}</p>
          <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${stil.badge}`}>
            {stil.etikett}
          </span>
        </div>
        <dl className="space-y-3 mb-0">
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Hur länge</dt>
            <dd className="text-sm text-slate-700 ml-0">{vald.tid}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Grund</dt>
            <dd className="text-sm text-slate-700 ml-0">{vald.grund}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">I praktiken</dt>
            <dd className="text-sm text-slate-700 ml-0">{vald.praktik}</dd>
          </div>
        </dl>
      </div>

      <p className="text-xs text-slate-500 mb-0">
        Sammanställningen bygger på IMY:s vägledning för arbetsliv och
        rekryteringssystem och är vägledning, inte juridisk rådgivning.
        Offentliga arbetsgivare har därtill arkivregler som kan påverka
        gallringen.
      </p>
    </div>
  )
}
