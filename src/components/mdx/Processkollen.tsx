'use client'

import { useState } from 'react'

/**
 * Processkollen: interaktiv självskattning på pillarsidan om kompetensbaserad
 * rekrytering. Tio ja/nej-frågor mappade mot metodens steg. Vid nej visas var
 * läckan sitter och vilken insikt som täpper den.
 */

type Fraga = {
  text: string
  lacka: string
  lank?: { href: string; text: string }
}

const FRAGOR: Fraga[] = [
  {
    text: 'Skrevs kravprofilen färdig innan ni såg den första kandidaten?',
    lacka: 'En profil skriven efteråt är en efterhandskonstruktion som bekräftar favoriten.',
    lank: { href: '/for-rekryterare/insikter/kravprofil', text: 'Så skrivs en kravprofil som styr' },
  },
  {
    text: 'Har profilen högst sex kärnkompetenser?',
    lacka: 'Femton viktiga kompetenser betyder att bedömarna själva väljer vad som väger.',
    lank: { href: '/for-rekryterare/insikter/kravprofil', text: 'Så skrivs en kravprofil som styr' },
  },
  {
    text: 'Innehåller annonsen enbart krav som finns i kravprofilen?',
    lacka: 'Varje extra önskemål smalnar av fältet, ofta skevt.',
    lank: { href: '/for-rekryterare/insikter/skriva-jobbannons', text: 'Annonsspråket som breddar fältet' },
  },
  {
    text: 'Granskas ansökningar avidentifierat i den första sållningen?',
    lacka: 'Det är i CV-sållningen namnet och fotot sorterar som mest.',
    lank: { href: '/for-rekryterare/insikter/anonymiserad-rekrytering', text: 'Vad forskningen visar om anonymisering' },
  },
  {
    text: 'Kommer ett objektivt mått, test eller arbetsprov, in före intervjuerna?',
    lacka: 'Ju senare det objektiva måttet kommer, desto mer hinner intrycken sortera.',
    lank: { href: '/for-rekryterare/insikter/kognitiva-tester-rekrytering-forskning', text: 'Vad urvalsforskningen visar' },
  },
  {
    text: 'Får alla kandidater samma grundfrågor i intervjun?',
    lacka: 'Olika frågor gör bedömningarna omöjliga att jämföra.',
    lank: { href: '/for-rekryterare/insikter/strukturerad-intervju-och-test', text: 'Strukturerad intervju i praktiken' },
  },
  {
    text: 'Bedöms svaren mot ankarskalor som bestämts i förväg?',
    lacka: 'Utan ankare glider bedömningen tillbaka till helhetsintryck.',
    lank: { href: '/for-rekryterare/insikter/strukturerad-intervju-och-test', text: 'Strukturerad intervju i praktiken' },
  },
  {
    text: 'Poängsätter bedömarna oberoende av varandra, före diskussionen?',
    lacka: 'Gruppdiskussion före individuell bedömning gör den mest seniora rösten till facit.',
    lank: { href: '/for-rekryterare/insikter/strukturerad-intervju-och-test', text: 'Strukturerad intervju i praktiken' },
  },
  {
    text: 'Ställs samma kompetensförankrade frågor till alla referenser?',
    lacka: 'Fri referenstagning är en ostrukturerad intervju med tredje part.',
  },
  {
    text: 'Dokumenteras slutbeslutet mot kravprofilen, kompetens för kompetens?',
    lacka: 'Odokumenterade beslut går inte att försvara den dag någon frågar.',
  },
]

export default function Processkollen() {
  const [svar, setSvar] = useState<(boolean | null)[]>(Array(FRAGOR.length).fill(null))

  const besvarade = svar.filter((s) => s !== null).length
  const poang = svar.filter((s) => s === true).length
  const klar = besvarade === FRAGOR.length

  const omdome =
    poang >= 9
      ? 'Kompetensbaserad på riktigt. Läckorna nedan, om några, är finlir.'
      : poang >= 6
        ? 'God grund, men läckorna nedan släpper in magkänslan där det kostar mest.'
        : 'Processen är i praktiken intrycksstyrd, oavsett vad den kallas. Börja med läckorna nedan.'

  const satt = (i: number, varde: boolean) => {
    setSvar((prev) => prev.map((s, j) => (j === i ? varde : s)))
  }

  return (
    <div className="not-prose my-10 rounded-2xl border border-orange-200 bg-gradient-to-b from-orange-50/70 to-white p-6 sm:p-8">
      <h2 className="text-xl font-black text-slate-900 mb-1">Processkollen</h2>
      <p className="text-sm text-slate-600 mb-6">
        Tio ja/nej-frågor om er senaste rekrytering. Svara ärligt, resultatet
        stannar i din webbläsare.
      </p>

      <div className="rounded-xl border border-orange-100 bg-white overflow-hidden mb-5">
        {FRAGOR.map((f, i) => (
          <div
            key={f.text}
            className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-orange-50 last:border-b-0"
          >
            <span className="text-sm text-slate-700">{f.text}</span>
            <div className="flex gap-1.5 shrink-0">
              {([true, false] as const).map((v) => (
                <button
                  key={String(v)}
                  type="button"
                  onClick={() => satt(i, v)}
                  aria-pressed={svar[i] === v}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                    svar[i] === v
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
        ))}
      </div>

      {klar ? (
        <>
          <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-900 px-4 sm:px-5 py-4 mb-4">
            <span className="text-sm font-bold text-white">{omdome}</span>
            <span className="text-xl sm:text-2xl font-black text-orange-400 tabular-nums whitespace-nowrap">
              {poang} av {FRAGOR.length}
            </span>
          </div>
          {poang < FRAGOR.length && (
            <div className="rounded-xl border border-orange-100 bg-white p-4 sm:p-5 mb-4">
              <p className="text-sm font-bold text-slate-800 mb-3">Era läckor, i processordning:</p>
              <ul className="space-y-3 mb-0">
                {FRAGOR.map((f, i) =>
                  svar[i] === false ? (
                    <li key={f.text} className="text-sm text-slate-600">
                      {f.lacka}{' '}
                      {f.lank && (
                        <a href={f.lank.href} className="font-bold text-orange-700 hover:text-orange-800">
                          {f.lank.text} →
                        </a>
                      )}
                    </li>
                  ) : null
                )}
              </ul>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-slate-400 mb-4">
          {besvarade} av {FRAGOR.length} besvarade. Resultatet visas när alla frågor fått svar.
        </p>
      )}

      <p className="text-xs text-slate-500 mb-0">
        Frågorna motsvarar metodens steg i insikten ovan. Varje nej är en punkt
        där fri bedömning släpps in, och det är där osaklighet enligt
        forskningen får sitt utrymme.
      </p>
    </div>
  )
}
