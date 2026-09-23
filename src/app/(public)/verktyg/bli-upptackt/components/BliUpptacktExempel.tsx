/**
 * Avidentifierad exempelprofil: exakt vad en rekryterare ser, inte mer.
 * Arbetsstilen visas som två spektra i ord, aldrig som siffror, och
 * testresultatet som percentil, aldrig som råpoäng.
 */

const SKILLS = ['Bokslut', 'Koncernredovisning', 'Fortnox']

const SPEKTRA = [
  { vanster: 'Improviserar och anpassar', hoger: 'Planerar och strukturerar', lage: '90%', aktiv: 'hoger' as const },
  { vanster: 'Får energi av eget fokusarbete', hoger: 'Får energi av samarbete i grupp', lage: '30%', aktiv: 'vanster' as const },
]

export default function BliUpptacktExempel() {
  return (
    <section aria-label="Det här ser en rekryterare av din profil" className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-14">
      <div>
        <p className="text-steg uppercase text-ink-3">Exempelprofil</p>
        <h2 className="mt-2 text-h2-pub text-ink-1">Det här ser en rekryterare av din profil</h2>
        <p className="mt-3 max-w-[60ch] text-base leading-[27px] text-ink-2">
          Rekryteraren ser din yrkesroll, region, kompetenser, dina testresultat och din arbetsstil. Rekryteraren ser
          inte ditt namn, ditt foto, dina kontaktuppgifter, ditt CV-dokument, ditt lönespann eller vilket företag du
          jobbar på i dag.
        </p>
      </div>

      <div className="rounded-xl border border-kant bg-panel p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-insunken text-lg font-semibold text-ink-1" aria-hidden="true">
            R
          </div>
          <div>
            <div className="text-kort font-semibold text-ink-1">Redovisningsekonom</div>
            <div className="text-meta text-ink-3">Stockholm · Anonym</div>
          </div>
        </div>

        <p className="mt-3 text-meta text-ink-2">
          <b className="font-semibold text-ink-1">8 års erfarenhet</b> · Senast: Redovisningsansvarig (4 år) · Civilekonom
        </p>
        <p className="mt-2 text-sm italic leading-relaxed text-ink-2">
          &ldquo;Redovisningsekonom med åtta år i byggbranschen. Trivs bäst där struktur saknas och behöver byggas upp.&rdquo;
        </p>

        <div className="mt-4 space-y-3 rounded-lg bg-insunken p-3">
          {SPEKTRA.map((s) => (
            <div key={s.vanster}>
              <div className="flex items-baseline justify-between gap-3 text-xs">
                <span className={s.aktiv === 'vanster' ? 'font-semibold text-ink-1' : 'text-ink-3'}>{s.vanster}</span>
                <span className={`text-right ${s.aktiv === 'hoger' ? 'font-semibold text-ink-1' : 'text-ink-3'}`}>{s.hoger}</span>
              </div>
              <div className="relative mt-1.5 h-1 rounded-full bg-kant" aria-hidden="true">
                <span className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink-1" style={{ left: s.lage }} />
              </div>
            </div>
          ))}
          <p className="text-xs text-ink-2">Trivs när processer är tydliga och kvalitet hinner göras rätt.</p>
        </div>

        <ul className="mt-4 flex flex-wrap gap-1.5">
          <li className="rounded-md border border-kant-stark px-2.5 py-1 text-xs font-medium text-ink-1">Matrislogik · topp 10 %</li>
          <li className="rounded-md border border-kant-stark px-2.5 py-1 text-xs font-medium text-ink-1">Strukturerad</li>
          {SKILLS.map((s) => (
            <li key={s} className="rounded-md border border-kant px-2.5 py-1 text-xs text-ink-2">
              {s}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
