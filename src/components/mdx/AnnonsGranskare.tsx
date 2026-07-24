'use client'

import { useMemo, useState } from 'react'

/**
 * Interaktiv annonsgranskare för insikten om annonsspråk. Klientkomponent utan
 * API-anrop: analysen sker i webbläsaren. Ordlistorna är en svensk anpassning
 * av kodningslistorna i Gaucher, Friesen & Kay (2011). Ett flaggat ord är en
 * fråga att ställa sig, inte en dom.
 */

const MASKULINT = [
  'driven', 'drivkraft', 'tävlingsinriktad', 'konkurrens', 'ambitiös',
  'självständig', 'självgående', 'beslutsam', 'dominant', 'orädd',
  'vinnarskalle', 'hungrig', 'resultatinriktad', 'resultatorienterad',
  'självsäker', 'offensiv', 'högt tempo', 'prestera', 'utmanande',
  'ihärdig', 'analytisk', 'oberoende',
]

const FEMININT = [
  'samarbete', 'samarbetsvillig', 'samarbetsinriktad', 'lyhörd', 'omtänksam',
  'stöttande', 'engagerad', 'lojal', 'hjälpsam', 'relationsskapande',
  'empatisk', 'ansvarsfull', 'serviceinriktad', 'förstående', 'varm',
  'omhändertagande', 'gemenskap', 'pålitlig', 'tillsammans', 'vänlig',
]

const VARNINGAR: { monster: RegExp; etikett: string; varfor: string }[] = [
  { monster: /ung(t|a)? (och hungrig|team|gäng|kontor)/i, etikett: 'ung...', varfor: 'Ålder är en diskrimineringsgrund. Beskriv kulturen utan ålderskod.' },
  { monster: /flytande svenska/i, etikett: 'flytande svenska', varfor: 'Motivera språkkravet mot arbetsuppgifterna, annars riskerar det att vara indirekt diskriminerande.' },
  { monster: /körkort/i, etikett: 'körkort', varfor: 'Är körkortet ett verkligt krav för rollen? Onödiga skallkrav smalnar av fältet skevt.' },
  { monster: /kulturfit|passar in i (gänget|teamet)|en av oss/i, etikett: 'kulturfit', varfor: 'Ospecificerat betyder det ofta "liknar oss". Definiera samarbetskompetensen i stället.' },
  { monster: /prestigelös/i, etikett: 'prestigelös', varfor: 'Otydligt honnörsord. Beskriv beteendet ni faktiskt vill se.' },
  { monster: /stresstålig/i, etikett: 'stresstålig', varfor: 'Beskriv arbetsbelastningen ärligt i stället för att be kandidaten tåla den.' },
  { monster: /ninja|rockstjärna|rockstar|superstar|guru/i, etikett: 'ninja/rockstjärna/guru', varfor: 'Smalnar fältet och säger inget om kompetensen.' },
]

const KRAVSIGNALER = [/\bminst \d+ års?\b/gi, /\bkrav\b/gi, /\bdu har\b/gi, /\bdu är\b/gi, /\bvi söker dig som\b/gi]

function hittaTraffar(text: string, ordlista: string[]): string[] {
  const lag = text.toLowerCase()
  const traffar = new Set<string>()
  for (const ord of ordlista) {
    if (lag.includes(ord)) traffar.add(ord)
  }
  return [...traffar]
}

export default function AnnonsGranskare() {
  const [text, setText] = useState('')

  const analys = useMemo(() => {
    if (text.trim().length < 40) return null
    const maskulina = hittaTraffar(text, MASKULINT)
    const feminina = hittaTraffar(text, FEMININT)
    const varningar = VARNINGAR.filter((v) => v.monster.test(text))
    const kravsignaler = KRAVSIGNALER.reduce((n, m) => n + (text.match(m)?.length ?? 0), 0)
    return { maskulina, feminina, varningar, kravsignaler }
  }, [text])

  const balans = analys
    ? analys.maskulina.length + analys.feminina.length === 0
      ? 0.5
      : analys.feminina.length / (analys.maskulina.length + analys.feminina.length)
    : 0.5

  return (
    <div className="not-prose my-10 rounded-2xl border border-orange-200 bg-gradient-to-b from-orange-50/70 to-white p-6 sm:p-8">
      <h2 className="text-xl font-black text-slate-900 mb-1">Granska er annons</h2>
      <p className="text-sm text-slate-600 mb-5">
        Klistra in annonstexten så flaggar granskaren könskodade ord, vanliga
        exkluderare och kravtäthet. Allt sker i din webbläsare, texten skickas
        ingenstans.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={7}
        placeholder="Klistra in annonstexten här (minst några meningar)..."
        className="w-full rounded-xl border border-orange-200 bg-white p-4 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 mb-5"
      />

      {analys ? (
        <>
          {/* Könskodning */}
          <div className="rounded-xl border border-orange-100 bg-white p-4 sm:p-5 mb-3">
            <div className="flex items-baseline justify-between mb-2">
              <p className="text-sm font-bold text-slate-800 mb-0">Könskodade ord</p>
              <p className="text-xs text-slate-500 mb-0">
                {analys.maskulina.length} maskulint / {analys.feminina.length} feminint kodade
              </p>
            </div>
            <div className="h-3 rounded-full bg-slate-100 overflow-hidden flex mb-3" aria-hidden="true">
              <div className="h-full bg-sky-500" style={{ width: `${Math.round((1 - balans) * 100)}%` }} />
              <div className="h-full bg-orange-400" style={{ width: `${Math.round(balans * 100)}%` }} />
            </div>
            <div className="flex flex-wrap gap-2">
              {analys.maskulina.map((o) => (
                <span key={o} className="rounded-full bg-sky-50 border border-sky-200 px-3 py-1 text-xs font-semibold text-sky-800">
                  {o}
                </span>
              ))}
              {analys.feminina.map((o) => (
                <span key={o} className="rounded-full bg-orange-50 border border-orange-200 px-3 py-1 text-xs font-semibold text-orange-800">
                  {o}
                </span>
              ))}
              {analys.maskulina.length + analys.feminina.length === 0 && (
                <span className="text-sm text-slate-500">Inga ord ur kodningslistorna hittades.</span>
              )}
            </div>
            {analys.maskulina.length >= 3 && analys.feminina.length === 0 && (
              <p className="text-sm text-slate-600 mt-3 mb-0">
                Tydlig maskulin slagsida. Forskningen (Gaucher m.fl., 2011) visar att
                det sänker upplevd tillhörighet hos kvinnor och krymper fältet. Byt
                några honnörsord mot konkreta arbetsuppgifter.
              </p>
            )}
          </div>

          {/* Exkluderare */}
          <div className="rounded-xl border border-orange-100 bg-white p-4 sm:p-5 mb-3">
            <p className="text-sm font-bold text-slate-800 mb-2">Vanliga exkluderare</p>
            {analys.varningar.length === 0 ? (
              <p className="text-sm text-slate-500 mb-0">Inga av de vanligaste exkluderarna hittades.</p>
            ) : (
              <ul className="space-y-2 mb-0">
                {analys.varningar.map((v) => (
                  <li key={v.etikett} className="text-sm text-slate-600">
                    <span className="font-bold text-red-700">{v.etikett}:</span> {v.varfor}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Kravtäthet */}
          <div className="rounded-xl border border-orange-100 bg-white p-4 sm:p-5 mb-4">
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-bold text-slate-800 mb-0">Kravsignaler i texten</p>
              <p className={`text-lg font-black mb-0 tabular-nums ${analys.kravsignaler > 6 ? 'text-red-700' : 'text-emerald-700'}`}>
                {analys.kravsignaler}
              </p>
            </div>
            <p className="text-sm text-slate-600 mt-1 mb-0">
              {analys.kravsignaler > 6
                ? 'Många kravformuleringar. Långa kravlistor avskräcker kvalificerade sökande selektivt: behåll skallkraven, flytta resten till meriterande eller stryk.'
                : 'Rimlig kravtäthet. Kontrollera att varje krav som står kvar finns i kravprofilen.'}
            </p>
          </div>
        </>
      ) : (
        <p className="text-sm text-slate-400 mb-4">Analysen visas när texten är inklistrad.</p>
      )}

      <p className="text-xs text-slate-500 mb-0">
        Ordlistorna är en svensk anpassning av kodningslistorna i Gaucher, Friesen
        &amp; Kay (2011). Ett flaggat ord är en fråga att ställa er, inte en dom:
        avgörande är om ordet beskriver ett verkligt krav ur kravprofilen.
      </p>
    </div>
  )
}
