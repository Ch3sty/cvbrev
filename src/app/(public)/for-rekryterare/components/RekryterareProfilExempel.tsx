'use client'

import { motion } from 'framer-motion'
import {
  Briefcase,
  GraduationCap,
  Languages,
  Lock,
  Quote,
  ShieldCheck,
} from 'lucide-react'
import type { ReactNode } from 'react'

/**
 * "Så ser hela profilen ut" — statisk men verklighetstrogen mock av
 * detaljprofilen i rekryterarportalen, för en fiktiv redovisningsekonom.
 * Strukturen speglar src/app/rekryterare/kandidat/[userId]/page.tsx
 * (profilhuvud → pitch → erfarenhet → utbildning/språk → verifierade
 * resultat → villkor) men allt är hårdkodat — ingen API-koppling.
 * Ändra portalens utseende först, spegla hit sen.
 */

// === Mock-data för den fiktiva kandidaten ===
const EXPERIENCE = [
  {
    position: 'Redovisningsansvarig',
    period: '2022 – pågående',
    description:
      'Ansvarar för koncernbokslut i ett växande byggbolag. Byggde upp rutinerna för projektredovisning från grunden.',
  },
  {
    position: 'Redovisningsekonom',
    period: '2019 – 2022',
    description:
      'Löpande redovisning, moms och månadsbokslut för tre bolag i en byggkoncern.',
  },
  {
    position: 'Ekonomiassistent',
    period: '2018 – 2019',
    description: 'Leverantörsreskontra och avstämningar. Första rollen efter examen.',
  },
]

const TEST_RESULTS = [
  { label: 'Matrislogik · Expertnivå', value: 'Topp 10 % av 1 240 testade · 1 försök' },
  { label: 'Numeriskt · Standardnivå', value: 'Topp 15 % av 890 testade · 1 försök' },
]

const STRENGTHS = ['Strukturerad', 'Analytisk']

const CONTEXT_TAGS = ['Analytiskt djuparbete', 'Noggrannhet och självständigt ansvar']

// Bipolära spektra (band 1-5 → punktposition), samma som portalens rapport.
const SPECTRA: Array<{ left: string; right: string; band: number }> = [
  { left: 'Improviserar och anpassar', right: 'Planerar och strukturerar', band: 5 },
  { left: 'Snabb till beslut', right: 'Grundlig före beslut', band: 4 },
  { left: 'Får energi av eget fokusarbete', right: 'Får energi av samarbete i grupp', band: 2 },
]

const BAND_POSITION: Record<number, number> = { 1: 10, 2: 30, 3: 50, 4: 70, 5: 90 }

const TERMS = [
  { label: 'Tillträde', value: 'Omgående' },
  { label: 'Arbetsplats', value: 'Hybrid' },
  { label: 'Omfattning', value: 'Heltid' },
  { label: 'Körkort', value: 'B-körkort' },
]

/** Litet chip som markerar vad som låses upp efter accepterad kontakt. */
function LockChip() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-500 text-[11px] font-bold">
      <Lock className="w-3 h-3" aria-hidden="true" />
      Visas efter accepterad kontakt
    </span>
  )
}

/** Vitt profilkort med orange accentlinje — samma formspråk som PortalCard i portalen. */
function MockCard({
  title,
  sub,
  badge,
  children,
}: {
  title?: string
  sub?: string
  badge?: ReactNode
  children: ReactNode
}) {
  return (
    <div
      className="relative bg-white rounded-3xl border border-orange-100 p-4 sm:p-6 overflow-hidden"
      style={{ boxShadow: '0 4px 16px -8px rgba(249, 115, 22, 0.15)' }}
    >
      <div
        className="absolute top-0 inset-x-0 h-0.5"
        style={{ background: 'linear-gradient(90deg, #FB923C, #DC2626)' }}
        aria-hidden="true"
      />
      {(title || badge) && (
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            {title && (
              <h3 className="text-[15px] sm:text-base font-bold text-slate-900">
                {title}
              </h3>
            )}
            {sub && (
              <p className="text-[13px] text-slate-500 mt-0.5 leading-relaxed">
                {sub}
              </p>
            )}
          </div>
          {badge}
        </div>
      )}
      <div className={title || badge ? 'mt-4' : ''}>{children}</div>
    </div>
  )
}

export default function RekryterareProfilExempel() {
  return (
    <section className="relative py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[32px] bg-gradient-to-b from-orange-50/70 to-white border border-orange-100 p-4 sm:p-10 lg:p-14">
          {/* Sektion-header med brygga från träffkorten */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.4 }}
            className="text-center mb-10 sm:mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-white text-orange-700 border border-orange-200 mb-4">
              Hela profilen
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight mb-3">
              Så ser hela profilen ut
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
              Träffkortet är den första sorteringen. Ett klick öppnar hela
              profilen: kandidatens egen pitch, arbetshistorik, utbildning och
              verifierade testresultat. Namn och arbetsgivare låses upp först
              när kandidaten tackar ja, och just därför är de som svarar
              faktiskt intresserade.
            </p>
          </motion.div>

          {/* Profil-mocken */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45 }}
            className="max-w-3xl mx-auto space-y-4 sm:space-y-5"
          >
            {/* Profilhuvud */}
            <MockCard>
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                  style={{
                    background:
                      'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                  }}
                  aria-hidden="true"
                >
                  R
                </div>
                <div className="min-w-0">
                  <p className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">
                    Redovisningsekonom
                  </p>
                  <p className="text-[13px] text-slate-500">
                    Stockholms län · 8 års erfarenhet · Civilekonom · Anonym
                    profil
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {['Matrislogik · topp 10 %', 'Numeriskt · topp 15 %'].map(
                  (badge) => (
                    <span
                      key={badge}
                      className="inline-flex items-center gap-1.5 text-[11.5px] font-bold rounded-full px-2.5 py-1 bg-orange-50 border border-orange-200 text-orange-900"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-sm bg-orange-500 rotate-45"
                        aria-hidden="true"
                      />
                      {badge}
                    </span>
                  )
                )}
                {STRENGTHS.map((chip) => (
                  <span
                    key={chip}
                    className="inline-flex items-center gap-1.5 text-[11.5px] font-bold rounded-full px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-800"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-indigo-500"
                      aria-hidden="true"
                    />
                    {chip}
                  </span>
                ))}
                {['Koncernbokslut', 'Projektredovisning', 'Moms'].map(
                  (skill) => (
                    <span
                      key={skill}
                      className="text-[11.5px] font-semibold rounded-full px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-600"
                    >
                      {skill}
                    </span>
                  )
                )}
              </div>

              {/* Kandidatens egen pitch */}
              <blockquote className="relative rounded-2xl border border-orange-100 bg-orange-50/40 px-4 py-3.5 sm:px-5">
                <Quote
                  className="w-4 h-4 text-orange-400 mb-1.5"
                  aria-hidden="true"
                />
                <p className="text-[13.5px] sm:text-sm text-slate-700 leading-relaxed italic">
                  Redovisningsekonom med åtta år i byggbranschen. Trivs bäst
                  där struktur saknas och behöver byggas upp.
                </p>
                <footer className="mt-1.5 text-[11.5px] font-bold uppercase tracking-wide text-orange-700/70">
                  Kandidatens egen pitch
                </footer>
              </blockquote>
            </MockCard>

            {/* Arbetslivserfarenhet som tidslinje */}
            <MockCard title="Arbetslivserfarenhet">
              <div className="space-y-0">
                {EXPERIENCE.map((exp, i) => (
                  <div key={exp.position} className="flex gap-3">
                    {/* Ikon + tidslinjelinje */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <span
                        className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600"
                        aria-hidden="true"
                      >
                        <Briefcase className="w-4 h-4" />
                      </span>
                      {i < EXPERIENCE.length - 1 && (
                        <span
                          className="w-px flex-1 bg-orange-100 my-1"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    <div
                      className={`min-w-0 ${i < EXPERIENCE.length - 1 ? 'pb-5' : ''}`}
                    >
                      <p className="text-sm font-bold text-slate-900">
                        {exp.position}
                      </p>
                      <p className="text-[12.5px] text-slate-500 flex items-center gap-1.5 flex-wrap mt-0.5">
                        <LockChip />
                        <span>· {exp.period}</span>
                      </p>
                      <p className="mt-1 text-[13px] text-slate-600 leading-relaxed">
                        {exp.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 pt-3.5 border-t border-orange-50 text-[12.5px] text-slate-500 leading-relaxed">
                Arbetsgivarna låses upp när kandidaten tackar ja till kontakt.
                Skyddet gör att kandidater vågar visa upp sig medan de har
                jobb kvar, och det är därför poolen har profiler du inte
                hittar någon annanstans.
              </p>
            </MockCard>

            {/* Utbildning och språk */}
            <MockCard title="Utbildning och språk">
              <div className="flex gap-3">
                <span
                  className="flex-shrink-0 w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600"
                  aria-hidden="true"
                >
                  <GraduationCap className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900">
                    Civilekonomexamen, redovisning och finansiering
                  </p>
                  <p className="text-[12.5px] text-slate-500">
                    Handelshögskola i Stockholm · Examen 2018
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <Languages
                  className="w-4 h-4 text-slate-400 flex-shrink-0"
                  aria-hidden="true"
                />
                {['Svenska · modersmål', 'Engelska · flytande'].map((lang) => (
                  <span
                    key={lang}
                    className="text-[11.5px] font-semibold rounded-full px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-600"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </MockCard>

            {/* Verifierade resultat */}
            <MockCard
              title="Verifierade resultat"
              sub="Slutförda rekryteringstester på Jobbcoach.ai, bästa resultat per nivå."
              badge={
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                  <ShieldCheck className="w-3 h-3" aria-hidden="true" />
                  Verifierat av oss
                </span>
              }
            >
              <div className="space-y-2">
                {TEST_RESULTS.map((result) => (
                  <div
                    key={result.label}
                    className="flex items-center justify-between gap-3 rounded-xl border border-orange-100 bg-orange-50/30 px-3.5 py-2.5"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <ShieldCheck
                        className="w-4 h-4 text-orange-600 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <span className="text-[13px] font-bold text-slate-800">
                        {result.label}
                      </span>
                    </div>
                    <span className="text-[12.5px] font-bold text-orange-800 flex-shrink-0 text-right">
                      {result.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {STRENGTHS.map((chip) => (
                  <span
                    key={chip}
                    className="inline-flex items-center gap-1.5 text-[12px] font-bold rounded-full px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-800"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-indigo-500"
                      aria-hidden="true"
                    />
                    {chip}
                  </span>
                ))}
                <span className="text-[12px] text-slate-500 self-center">
                  Personlighetsstyrkor, delade med kandidatens samtycke.
                </span>
              </div>
              <p className="mt-3 text-[12.5px] text-slate-500 leading-relaxed">
                Percentilerna jämför kandidaten med alla som gjort samma test
                hos oss. Du behöver inte lita på CV-formuleringar, resultaten
                kommer från riktiga test gjorda på vår plattform.
              </p>
            </MockCard>

            {/* Arbetsstil: fullständig rapport (arketyp + spektra + Trivs när) */}
            <MockCard title="Arbetsstil">
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 px-4 py-3.5 mb-4">
                <p className="text-[15px] font-extrabold text-indigo-900">
                  Strukturerad analytiker
                </p>
                <p className="mt-0.5 text-[13px] text-indigo-900/70 leading-relaxed">
                  Metodisk problemlösare som gärna tänker nytt, men aldrig
                  slarvigt.
                </p>
              </div>

              {/* Spektra: punkt på linje, aldrig siffror */}
              <div className="space-y-3.5 mb-4">
                {SPECTRA.map((s) => {
                  const pos = BAND_POSITION[s.band] ?? 50
                  return (
                    <div key={s.left}>
                      <div className="flex items-baseline justify-between gap-3 mb-1.5">
                        <span className={`text-[12px] leading-snug ${s.band <= 2 ? 'font-bold text-indigo-900' : 'text-slate-500'}`}>
                          {s.left}
                        </span>
                        <span className={`text-[12px] leading-snug text-right ${s.band >= 4 ? 'font-bold text-indigo-900' : 'text-slate-500'}`}>
                          {s.right}
                        </span>
                      </div>
                      <div className="relative h-4" aria-hidden="true">
                        <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 h-[3px] rounded-full bg-indigo-100" />
                        <div
                          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 bg-indigo-500 border-indigo-500"
                          style={{ left: `${pos}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Trivs när / Utmanas när */}
              <div className="rounded-xl border border-indigo-100 bg-white p-3 mb-4">
                <p className="text-[13px] text-slate-700 leading-relaxed">
                  <span className="font-bold text-indigo-900">Trivs när</span> processer
                  är tydliga och kvalitet hinner göras rätt.{' '}
                  <span className="font-bold text-slate-700">Utmanas när</span> planer
                  rivs upp dagligen utan förklaring.
                </p>
              </div>

              {/* Låst onboarding + intervjuguide */}
              <div className="pt-4 border-t border-indigo-50">
                <p className="flex items-start gap-2 text-[12.5px] text-slate-500 leading-relaxed">
                  <Lock
                    className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-slate-400"
                    aria-hidden="true"
                  />
                  Onboardingguide och en intervjuguide byggd på kandidatens
                  styrkor låses upp när kandidaten tackar ja.
                </p>
              </div>

              <p className="mt-3 text-[12px] text-slate-400 leading-relaxed">
                Rapporten beskriver arbetssätt och trivsel, inte kompetens eller
                förväntad prestation. Kandidaten ser exakt samma rapport som du.
              </p>
            </MockCard>

            {/* Söker mig till: kandidatens självvalda kontexttaggar */}
            <MockCard title="Söker mig till">
              <div className="flex flex-wrap gap-2">
                {CONTEXT_TAGS.map((tag) => (
                  <span
                    key={tag}
                    className="text-[12.5px] font-semibold rounded-full px-3 py-1.5 bg-white border border-indigo-200 text-indigo-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-[12px] text-slate-400 leading-relaxed">
                Kandidatens egna ord om var hen trivs, byggda på personlighetstestet.
                Beskriver trivsel och arbetssätt, aldrig lämplighet eller förväntad
                prestation.
              </p>
            </MockCard>

            {/* Villkor */}
            <MockCard title="Villkor">
              <dl className="grid gap-x-6 gap-y-3 grid-cols-2 sm:grid-cols-4">
                {TERMS.map((term) => (
                  <div key={term.label}>
                    <dt className="text-[11.5px] font-bold uppercase tracking-wide text-slate-400">
                      {term.label}
                    </dt>
                    <dd className="text-[13.5px] font-semibold text-slate-800 mt-0.5">
                      {term.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </MockCard>
          </motion.div>

          <p className="text-center text-[13px] text-slate-500 mt-6">
            Exempelprofil med fiktiva uppgifter. Profilerna i poolen är
            verkliga arbetssökande som själva valt att synas.
          </p>
        </div>
      </div>
    </section>
  )
}
