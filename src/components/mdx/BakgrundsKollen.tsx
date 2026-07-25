'use client'

import { useState } from 'react'

/**
 * Bakgrundskollen: interaktiv uppslagning i insikten om bakgrundskontroller.
 * Välj kontrolltyp → tillåtet med villkor, gråzon eller otillåtet som
 * huvudregel, med motivering. Rättsläget per 2026, vägledning och inte
 * juridisk rådgivning.
 */

type Kontroll = {
  id: string
  label: string
  status: 'villkor' | 'grazon' | 'otillatet'
  bedomning: string
  villkor: string
}

const KONTROLLER: Kontroll[] = [
  {
    id: 'utdrag-reglerat',
    label: 'Belastningsregisterutdrag, lagreglerat område',
    status: 'villkor',
    bedomning: 'Inom skola, LSS-verksamhet, vissa finans- och säkerhetsroller, och sedan 1 mars 2026 fler kommunala anställningar, finns lagstöd för registerkontroll.',
    villkor: 'Kandidaten beställer och visar själv sitt utdrag. Ni antecknar endast att det visats, utdraget sparas aldrig. Kontrollera vilket regelverk som gäller er verksamhet och följ dess form exakt.',
  },
  {
    id: 'utdrag-ovrigt',
    label: 'Belastningsregisterutdrag, övriga roller',
    status: 'grazon',
    bedomning: 'Att be kandidaten frivilligt visa ett utdrag är inte uttryckligen förbjudet idag, men praxisen är kritiserad, uppgifter om lagöverträdelser är som huvudregel förbjudna att behandla, och en statlig utredning om hela området redovisas 2027.',
    villkor: 'Gör det bara om rollen sakligt motiverar det, anteckna endast att utdrag visats, och var beredd att ompröva rutinen när rättsläget skärps.',
  },
  {
    id: 'misstanke',
    label: 'Misstankeregistret',
    status: 'otillatet',
    bedomning: 'Endast tillgängligt där lagen uttryckligen ger tillgång, till exempel vissa kommunala anställningar enligt 2026 års regler. Utanför de områdena: nej.',
    villkor: 'Har er verksamhet inte uttryckligt lagstöd finns ingen laglig väg, och att fråga kandidaten om pågående utredningar är inte en genväg.',
  },
  {
    id: 'kredit',
    label: 'Kreditupplysning',
    status: 'villkor',
    bedomning: 'Tillåten när det finns legitimt behov: roller med betydande ekonomiskt ansvar, som ekonomichef eller andra som hanterar stora belopp för bolagets räkning.',
    villkor: 'Behovet ska vara sakligt kopplat till tjänsten, kandidaten får en omfrågandekopia och bör informeras i förväg. Slentrianmässig kreditkoll av alla kandidater är oproportionerlig.',
  },
  {
    id: 'sociala',
    label: 'Sökningar på sociala medier',
    status: 'grazon',
    bedomning: 'Även offentliga uppgifter blir personuppgiftsbehandling när de samlas in och vägs in. Relevans, proportionalitet och transparens krävs, känsliga uppgifter får inte samlas in.',
    villkor: 'Sök yrkesrelaterat, informera kandidaten om att sökningar görs, anteckna bara det som är sakligt relevant för tjänsten. En privat semesterbild är inte urvalsunderlag.',
  },
  {
    id: 'halsa',
    label: 'Hälsofrågor och drogtester',
    status: 'grazon',
    bedomning: 'Hälsa är en känslig uppgift, normalt förbjuden att behandla i rekrytering. Drogtest förekommer legitimt i säkerhetskritiska roller, men kräver saklig motivering och korrekt hantering.',
    villkor: 'Ställ aldrig allmänna hälsofrågor, fråga aldrig om graviditet eller familjeplaner, det är diskrimineringsterritorium. Drogtest bara där säkerhetsskäl bär det, via företagshälsovård.',
  },
  {
    id: 'bakvag',
    label: 'Referenser utanför kandidatens lista ("bakvägen")',
    status: 'grazon',
    bedomning: 'Att ringa gamla arbetsgivare kandidaten inte angett är personuppgiftsbehandling som kandidaten inte informerats om, och skvaller från bakvägen är ostrukturerad information med okänd agenda.',
    villkor: 'Håll er till kandidatens referenser, komplettera hellre med fler egna frågor. Vill ni tala med någon utanför listan: fråga kandidaten först.',
  },
]

const STATUS_STIL = {
  villkor: { border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-800', etikett: 'Tillåtet med villkor' },
  grazon: { border: 'border-amber-200', badge: 'bg-amber-100 text-amber-800', etikett: 'Gråzon' },
  otillatet: { border: 'border-red-200', badge: 'bg-red-100 text-red-800', etikett: 'Otillåtet som huvudregel' },
} as const

export default function BakgrundsKollen() {
  const [valdId, setValdId] = useState<string>('utdrag-reglerat')
  const vald = KONTROLLER.find((k) => k.id === valdId) ?? KONTROLLER[0]
  const stil = STATUS_STIL[vald.status]

  return (
    <div className="not-prose my-10 rounded-2xl border border-orange-200 bg-gradient-to-b from-orange-50/70 to-white p-6 sm:p-8">
      <h2 className="text-xl font-black text-slate-900 mb-1">Bakgrundskollen</h2>
      <p className="text-sm text-slate-600 mb-5">
        Välj kontrolltyp så visas vad som gäller: tillåtet med villkor, gråzon
        eller otillåtet som huvudregel. Rättsläget per 2026.
      </p>

      <div className="flex flex-wrap gap-2 mb-5">
        {KONTROLLER.map((k) => (
          <button
            key={k.id}
            type="button"
            onClick={() => setValdId(k.id)}
            className={`rounded-lg border px-3 py-2 text-xs font-semibold text-left transition-colors ${
              k.id === valdId
                ? 'border-orange-600 bg-orange-600 text-white'
                : 'border-orange-200 bg-white text-slate-700 hover:border-orange-400'
            }`}
          >
            {k.label}
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
            <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Bedömning</dt>
            <dd className="text-sm text-slate-700 ml-0">{vald.bedomning}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Så gör ni rätt</dt>
            <dd className="text-sm text-slate-700 ml-0">{vald.villkor}</dd>
          </div>
        </dl>
      </div>

      <p className="text-xs text-slate-500 mb-0">
        Sammanställningen speglar rättsläget 2026, inklusive de utökade
        registerkontrollerna i kommuner från 1 mars 2026, och är vägledning,
        inte juridisk rådgivning. En statlig utredning om bakgrundskontroller
        redovisas 2027 och kan ändra bilden.
      </p>
    </div>
  )
}
