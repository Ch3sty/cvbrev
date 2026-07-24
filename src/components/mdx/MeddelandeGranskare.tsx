'use client'

import { useMemo, useState } from 'react'

/**
 * Meddelandegranskare för insikten om uppsökande rekrytering. Syskon till
 * AnnonsGranskare: analysen sker helt i webbläsaren. Längdgränserna följer
 * LinkedIns InMail-data (kortast svarar bäst), substans- och fraskontrollerna
 * följer insiktens meddelandeanatomi.
 */

const SPAMFRASER: { monster: RegExp; etikett: string; varfor: string }[] = [
  { monster: /spännande (möjlighet|tjänst|roll|utmaning)/i, etikett: 'spännande möjlighet', varfor: 'Utbytbart smicker. Säg vad rollen är i stället.' },
  { monster: /får jag berätta mer|vill du veta mer\?/i, etikett: 'får jag berätta mer?', varfor: 'Ber om arbete i stället för att leverera substans. Berätta direkt.' },
  { monster: /perfekt (match|matchning)|du är precis (rätt|den)/i, etikett: 'perfekt match', varfor: 'Overifierbart påstående. Visa i stället vad i profilen som gjorde kontakten riktad.' },
  { monster: /unik (chans|möjlighet)/i, etikett: 'unik chans', varfor: 'Kandidater som kontaktas ofta har hört det förr. Substans slår superlativ.' },
  { monster: /ledande (bolag|företag|aktör)/i, etikett: 'ledande bolag', varfor: 'Alla skriver det. Namnge bolaget eller beskriv vad ni faktiskt gör.' },
  { monster: /expansiv fas|spännande (resa|tillväxtresa)/i, etikett: 'expansiv fas/resa', varfor: 'Klyscha utan information. Vad betyder det för rollen?' },
  { monster: /vass profil|imponerande (profil|bakgrund)/i, etikett: 'vass/imponerande profil', varfor: 'Generiskt beröm läses som massutskick. Nämn det specifika i stället.' },
  { monster: /hoppas (att )?det är okej att jag hör av mig/i, etikett: 'hoppas det är okej...', varfor: 'Urskuldande inledning sänker meddelandet. Gå rakt på ärendet, respektfullt.' },
]

const SUBSTANS = [
  { id: 'roll', etikett: 'Rollens innehåll', monster: /rollen|uppgift|ansvar|arbetar med|teamet|uppdraget|innebär/i },
  { id: 'villkor', etikett: 'Villkorsram', monster: /lön|villkor|\bkr\b|distans|hybrid|på plats|omfattning|heltid|deltid|tillträde/i },
  { id: 'nasta', etikett: 'Nästa steg', monster: /nästa steg|samtal|ring|träffas|höras|återkom|boka|kalender|kaffe/i },
]

export default function MeddelandeGranskare() {
  const [text, setText] = useState('')
  const [riktadRad, setRiktadRad] = useState<boolean | null>(null)

  const analys = useMemo(() => {
    if (text.trim().length < 30) return null
    const tecken = text.trim().length
    const spam = SPAMFRASER.filter((s) => s.monster.test(text))
    const substans = SUBSTANS.map((s) => ({ ...s, finns: s.monster.test(text) }))
    return { tecken, spam, substans }
  }, [text])

  const langdBedomning = analys
    ? analys.tecken <= 400
      ? { text: 'Under 400 tecken: den längd som svarar bäst i LinkedIns data.', ok: true }
      : analys.tecken <= 800
        ? { text: 'Över 400 tecken. Fungerar, men kortare svarar bättre: stryk det som inte är substans.', ok: true }
        : { text: 'Långt: meddelanden i den här längden svarar sämst i LinkedIns data. Halvera.', ok: false }
    : null

  return (
    <div className="not-prose my-10 rounded-2xl border border-orange-200 bg-gradient-to-b from-orange-50/70 to-white p-6 sm:p-8">
      <h2 className="text-xl font-black text-slate-900 mb-1">Granska ert meddelande</h2>
      <p className="text-sm text-slate-600 mb-5">
        Klistra in utkastet så kontrolleras längd, substans och de fraser som
        får meddelanden att läsas som massutskick. Allt sker i din webbläsare.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={7}
        placeholder="Klistra in ditt meddelande här..."
        className="w-full rounded-xl border border-orange-200 bg-white p-4 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 mb-5"
      />

      {analys && langdBedomning ? (
        <>
          {/* Längd */}
          <div className="rounded-xl border border-orange-100 bg-white p-4 sm:p-5 mb-3">
            <div className="flex items-baseline justify-between mb-1">
              <p className="text-sm font-bold text-slate-800 mb-0">Längd</p>
              <p className={`text-lg font-black mb-0 tabular-nums ${langdBedomning.ok ? 'text-emerald-700' : 'text-red-700'}`}>
                {analys.tecken} tecken
              </p>
            </div>
            <p className="text-sm text-slate-600 mb-0">{langdBedomning.text}</p>
          </div>

          {/* Substans */}
          <div className="rounded-xl border border-orange-100 bg-white p-4 sm:p-5 mb-3">
            <p className="text-sm font-bold text-slate-800 mb-2">Substanskoll</p>
            <ul className="space-y-1.5 mb-0">
              {analys.substans.map((s) => (
                <li key={s.id} className="text-sm flex items-center gap-2">
                  <span className={`font-black ${s.finns ? 'text-emerald-600' : 'text-red-600'}`}>
                    {s.finns ? '✓' : '✗'}
                  </span>
                  <span className="text-slate-600">
                    {s.etikett}
                    {!s.finns && s.id === 'roll' && ': vad går jobbet ut på?'}
                    {!s.finns && s.id === 'villkor' && ': ort/distans, omfattning eller lönespann saknas.'}
                    {!s.finns && s.id === 'nasta' && ': gör det lätt att svara med ett litet, konkret steg.'}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Riktad rad, självskattning */}
          <div className="rounded-xl border border-orange-100 bg-white p-4 sm:p-5 mb-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-slate-800 mb-0">
                Finns en rad som bara kan handla om just den här personen?
              </p>
              <div className="flex gap-1.5 shrink-0">
                {([true, false] as const).map((v) => (
                  <button
                    key={String(v)}
                    type="button"
                    onClick={() => setRiktadRad(v)}
                    aria-pressed={riktadRad === v}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                      riktadRad === v
                        ? v
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-red-600 bg-red-600 text-white'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-400'
                    }`}
                  >
                    {v ? 'Ja' : 'Nej'}
                  </button>
                ))}
              </div>
            </div>
            {riktadRad === false && (
              <p className="text-sm text-slate-600 mt-2 mb-0">
                Då är sourcingen inte färdig. Den raden är skillnaden mellan
                riktad kontakt och massutskick, och individuellt riktade
                meddelanden svarar ~15 procent bättre i LinkedIns data.
              </p>
            )}
          </div>

          {/* Spamfraser */}
          <div className="rounded-xl border border-orange-100 bg-white p-4 sm:p-5 mb-4">
            <p className="text-sm font-bold text-slate-800 mb-2">Fraser som läses som massutskick</p>
            {analys.spam.length === 0 ? (
              <p className="text-sm text-slate-500 mb-0">Inga av de vanligaste klyschorna hittades.</p>
            ) : (
              <ul className="space-y-2 mb-0">
                {analys.spam.map((s) => (
                  <li key={s.etikett} className="text-sm text-slate-600">
                    <span className="font-bold text-red-700">{s.etikett}:</span> {s.varfor}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : (
        <p className="text-sm text-slate-400 mb-4">Analysen visas när texten är inklistrad.</p>
      )}

      <p className="text-xs text-slate-500 mb-0">
        Längdgränserna följer LinkedIns publicerade InMail-data, övriga kontroller
        insiktens meddelandeanatomi. Granskaren bedömer form, inte ärlighet:
        substans som inte stämmer får svar en gång, aldrig två.
      </p>
    </div>
  )
}
