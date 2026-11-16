'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight, ShieldCheck, FileText, ArrowRight, CheckCircle2, Star, Layers } from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import FaqAccordion from '@/components/exempel-shared/FaqAccordion'
import {
  IconVard,
  IconTech,
  IconEkonomi,
  IconService,
  IconUtbildning,
  IconOffentlig,
  IconHantverk,
  IconIndustri,
  IconLogistik,
  IconStudent,
} from '@/app/(public)/exempel/components/illustrations/ExempelIcons'
import type { Yrkesmall } from '../yrkesmall-data'
import MallVisningCv, { type ArtikelMall } from '@/components/artiklar/MallVisningCv'
import { MALL_KATALOG } from '@/lib/cv/mallar/katalog'
import { ARTIKEL, DOK, KNAPP, UPPLADDNING } from '@/components/cv/Dokument/texter'
import ViktigtPunkter from './components/ViktigtPunkter'
import VarforVarMallPassar from './components/VarforVarMallPassar'
import ArbetsuppgifterList from './components/ArbetsuppgifterList'
import BranschtermerList from './components/BranschtermerList'
import StortExempelCTA from './components/StortExempelCTA'
import TypiskaArbetsgivare from './components/TypiskaArbetsgivare'
import Utbildningsvagar from './components/Utbildningsvagar'

const KATEGORI_ICON: Record<Yrkesmall['kategori'], ({ className }: { className?: string }) => React.ReactElement> = {
  'vard': IconVard,
  'utbildning': IconUtbildning,
  'service': IconService,
  'teknik': IconTech,
  'ekonomi': IconEkonomi,
  'offentlig-sektor': IconOffentlig,
  'hantverk': IconHantverk,
  'industri': IconIndustri,
  'logistik': IconLogistik,
  'student': IconStudent,
}

/**
 * Fem mallar för yrkets dokument (plan-mallar 3.2, yrkessidorna): yrkets
 * gratismall först, sedan katalogens ordning. Inga namn hårdkodade.
 */
function femFor(gratisId: string): ArtikelMall[] {
  const forst = MALL_KATALOG.find((m) => m.id === gratisId)
  const ovriga = MALL_KATALOG.filter((m) => m.id !== gratisId)
  return [...(forst ? [forst] : []), ...ovriga].slice(0, 5).map((m) => ({
    id: m.id,
    namn: m.namn,
    rad: ARTIKEL.mallrad(m.niva === 'gratis', m.word),
    bild: m.bild.liten,
  }))
}

const KATEGORI_LABEL: Record<Yrkesmall['kategori'], string> = {
  'vard': 'Vård',
  'utbildning': 'Utbildning',
  'service': 'Service',
  'teknik': 'Tech',
  'ekonomi': 'Ekonomi',
  'offentlig-sektor': 'Offentlig sektor',
  'hantverk': 'Hantverk',
  'industri': 'Teknik',
  'logistik': 'Logistik',
  'student': 'Student',
}

interface YrkesmallContentProps {
  data: Yrkesmall
  relaterade: Yrkesmall[]
}

export default function YrkesmallContent({ data, relaterade }: YrkesmallContentProps) {


  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/30 via-white to-orange-50/40">
      {/* Breadcrumb i samma container som hero så den linjerar med h1 */}
      <div className="container mx-auto px-3 sm:px-4 pt-4 sm:pt-6 max-w-6xl">
        <Breadcrumb
          items={[
            { name: 'Hem', href: '/' },
            { name: 'CV-mallar', href: '/cv-mallar' },
            { name: data.namn, href: `/cv-mallar/${data.slug}` },
          ]}
        />
      </div>

      {/* Hjälten är dokumentet (skissen yta 2, granskningen B5): H1 och första
          ingresstycket som förut (SEO), sedan yrkets exempel-CV i
          gratismallen med titeln förifylld, uppladdningsraden och raden om
          premiummallarna. Samma mönster på alla yrkessidor. */}
      <section id="preview" className="container mx-auto max-w-6xl scroll-mt-6 px-3 pb-10 sm:px-4 sm:pb-14">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_minmax(360px,560px)] lg:gap-12">
          <div>
            <p className="text-ey uppercase text-ton-ink">CV-mall för {KATEGORI_LABEL[data.kategori]}</p>
            <h1 className="mt-3 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ink-1 sm:text-5xl lg:text-6xl">
              CV-mall för {data.namn}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-2 sm:text-lg lg:text-xl">{data.heroIngress || data.intro}</p>
            <p className="mt-4 text-sm text-ink-3">ATS-säkra · Uppdaterade 2026 · Svenska arbetsgivare</p>
          </div>
          <div className="w-full rounded-xl border border-kant bg-panel p-4 sm:p-6">
            <MallVisningCv
              mallar={femFor(data.freeMallId)}
              yrke={data.slug}
              titelForval={data.namn}
              etiketter={{ namn: UPPLADDNING.namn, titel: UPPLADDNING.titel, fortsatt: KNAPP.fortsatt, svep: DOK.svep }}
              uppladdning={
                <div className="mt-2.5 flex items-center justify-between gap-3 rounded-xl border border-kant bg-papper px-3 py-2">
                  <p className="text-[13px] leading-5 text-ink-2">{ARTIKEL.uppladdning}</p>
                  <a
                    href="/cv-mallar#ladda-upp"
                    data-cta-klick="/cv-mallar#ladda-upp"
                    className="inline-flex h-11 shrink-0 items-center rounded-xl border border-kant-stark bg-papper px-4 text-sm font-semibold text-ink-1"
                  >
                    {ARTIKEL.laddaUpp}
                  </a>
                </div>
              }
              efter={<p className="mt-3 text-[13px] text-ink-2">{ARTIKEL.yrkesrad('yrket')}</p>}
            />
            <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm">
              <Link href={`/cv-exempel/${data.slug}`} className="inline-flex min-h-11 items-center font-medium text-ink-1 underline decoration-kant-stark underline-offset-4">
                Se CV-exempel
              </Link>
              <Link
                href={`/personligt-brev-exempel/${data.slug}`}
                className="inline-flex min-h-11 items-center font-medium text-ink-1 underline decoration-kant-stark underline-offset-4"
              >
                Personligt brev
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* SEO Intro: 185-220 ord rik content under hero */}
      {data.seoIntro && (
        <section className="container mx-auto px-3 sm:px-4 pb-12 sm:pb-16 max-w-3xl">
          <div
            className="prose prose-slate max-w-none text-base sm:text-lg leading-relaxed text-slate-700"
            style={{ fontFamily: "'Source Serif Pro', Georgia, serif" }}
          >
            {data.seoIntro.split(/\n\n+/).map((stycke, i) => (
              <p key={i} className="mb-5 last:mb-0">
                {stycke}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* Viktigt att tanka pa (NY djup-content) — fallback till varforDennaMall om saknas */}
      {data.viktigtAttTankaPa && data.viktigtAttTankaPa.length > 0 ? (
        <SectionWrapper>
          <SectionTitle
            eyebrow="Viktigt att tänka på"
            title={`Så bygger du ett starkt ${data.namnBestamd}-CV`}
            description="Sex punkter som rekryterare specifikt letar efter i din ansökan."
          />
          <ViktigtPunkter punkter={data.viktigtAttTankaPa} />
        </SectionWrapper>
      ) : (
        <SectionWrapper>
          <SectionTitle
            eyebrow="Varför just dessa mallar"
            title={`Mallarna ${data.freeMallNamn} och ${data.premiumMallNamn} för ${data.namnBestamd}`}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.varforDennaMall.map((reason, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="flex items-start gap-3 p-4 bg-orange-50/40 rounded-2xl"
              >
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white mt-0.5"
                  style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)' }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                </span>
                <p className="text-sm sm:text-base text-slate-800 leading-relaxed">{reason}</p>
              </motion.div>
            ))}
          </div>
        </SectionWrapper>
      )}

      {/* Vanliga arbetsuppgifter (NY) */}
      {data.arbetsuppgifter && data.arbetsuppgifter.length > 0 && (
        <SectionWrapper>
          <SectionTitle
            eyebrow="Yrkesinnehåll"
            title={`Vanliga arbetsuppgifter för ${data.namnBestamd}`}
            description="Vad du faktiskt gör i rollen och vad rekryterare förväntar sig att du har erfarenhet av."
            color="emerald"
          />
          <ArbetsuppgifterList grupper={data.arbetsuppgifter} />
        </SectionWrapper>
      )}

      {/* Vad rekryterare letar efter */}
      <SectionWrapper narrow>
        <SectionTitle
          eyebrow="Rekryterar-perspektiv"
          title={`Vad rekryterare letar efter i ett ${data.namnBestamd}-CV`}
          description={data.rekryterarTipsen.length > 3 ? 'Sex saker som avgör om du går vidare till intervju.' : 'Tre saker som avgör om du går vidare till intervju.'}
          color="emerald"
        />
        <div className="space-y-6">
          {data.rekryterarTipsen.map((tip, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-baseline gap-3 mb-3">
                <span
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm"
                  style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)' }}
                >
                  {idx + 1}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                  {tip.rubrik}
                </h3>
              </div>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed pl-11">{tip.text}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* Varför vår mall passar yrket (NY designresonemang) */}
      {data.varforVarMallPassar && data.varforVarMallPassar.length > 0 && (
        <SectionWrapper>
          <SectionTitle
            eyebrow="Vår design"
            title={`Så har vi byggt mallarna för ${data.namnBestamd}`}
            description={`Det här är våra designval och varför mallen ${data.freeMallNamn} och ${data.premiumMallNamn}, som ingår i Premium, fungerar för rollen.`}
          />
          <VarforVarMallPassar punkter={data.varforVarMallPassar} yrkesNamn={data.namn} />
        </SectionWrapper>
      )}

      {/* Stora CTA-kort (CV-exempel + brev) — flyttade hit fran botten */}
      <SectionWrapper>
        <div className="space-y-4">
          <StortExempelCTA
            variant="cv-exempel"
            yrkesNamn={data.namn}
            namnBestamd={data.namnBestamd}
            slug={data.slug}
          />
          <StortExempelCTA
            variant="personligt-brev"
            yrkesNamn={data.namn}
            namnBestamd={data.namnBestamd}
            slug={data.slug}
          />
        </div>
      </SectionWrapper>

      {/* Personlig profil — exempel + tips */}
      <SectionWrapper narrow>
        <SectionTitle
          eyebrow="Personlig profil"
          title={`Personlig profil för ${data.namnBestamd}`}
          description="Sammanfattningen längst upp på CV:t är det första rekryteraren läser. Här är ett konkret exempel och våra bästa tips."
          color="orange"
        />
        <div className="bg-white rounded-3xl border border-orange-100 p-6 sm:p-8" style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.12)' }}>
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange-700 mb-2">
            Exempel
          </div>
          <blockquote className="text-base sm:text-lg text-slate-800 leading-relaxed italic border-l-4 border-orange-400 pl-4 mb-6">
            {data.profilExempel}
          </blockquote>
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange-700 mb-2">
            Så skriver du
          </div>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed">{data.profilTips}</p>
        </div>
      </SectionWrapper>

      {/* Kompetenser */}
      <SectionWrapper narrow>
        <SectionTitle
          eyebrow="Kompetenser"
          title={`Vilka kompetenser ska finnas på ett ${data.namnBestamd}-CV`}
          description="Vi har samlat de tekniska och personliga kompetenser som rekryterare värderar mest för rollen."
          color="emerald"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-4 h-4 text-orange-700" strokeWidth={2.5} />
              <h3 className="text-base font-black text-slate-900 uppercase tracking-wide text-sm">Tekniska kompetenser</h3>
            </div>
            <ul className="space-y-2">
              {data.kompetenser.tekniska.map((k, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5" />
                  {k}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-emerald-700" strokeWidth={2.5} />
              <h3 className="text-base font-black text-slate-900 uppercase tracking-wide text-sm">Personliga egenskaper</h3>
            </div>
            <ul className="space-y-2">
              {data.kompetenser.personliga.map((k, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
                  {k}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SectionWrapper>

      {/* Branschterminologi (NY accordion) */}
      {data.branschtermer && data.branschtermer.length > 0 && (
        <SectionWrapper narrow>
          <SectionTitle
            eyebrow="Branschterminologi"
            title={`Termer, system och lagar för ${data.namnBestamd}`}
            description="De begrepp rekryterare och chefer använder i jobbannonser. Klicka för att expandera varje grupp."
          />
          <BranschtermerList grupper={data.branschtermer} />
        </SectionWrapper>
      )}

      {/* Tips per sektion */}
      <SectionWrapper narrow>
        <SectionTitle
          eyebrow="Skriv-guide"
          title="Vad ska stå i varje sektion av CV:t"
          description={`Vi går igenom de viktigaste sektionerna i ett ${data.namnBestamd}-CV och vad som ska finnas med i varje.`}
          color="orange"
        />
        <div className="space-y-4">
          {data.sektionTips.map((tip, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-baseline gap-3">
                <span className="flex-shrink-0 text-[11px] font-bold uppercase tracking-[0.16em] text-orange-700 mt-1 min-w-[100px]">
                  {tip.sektion}
                </span>
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed">{tip.tips}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ATS-info */}
      <SectionWrapper narrow>
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="flex-shrink-0 w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-6 h-6" strokeWidth={2.5} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700 mb-1">
                ATS-säkerhet
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-3 leading-tight">
                Är mallen ATS-säker för {data.namnBestamd}?
              </h3>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">{data.atsInfo}</p>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* Checklista */}
      <SectionWrapper narrow>
        <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-200 rounded-3xl p-6 sm:p-10">
          <div className="text-center mb-6">
            <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange-700 mb-2">
              Checklista
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
              Det här ska finnas med i ditt {data.namnBestamd}-CV
            </h2>
          </div>
          <ul className="space-y-2.5 max-w-2xl mx-auto">
            {data.checklista.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-orange-100/60">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={3} />
                </span>
                <span className="text-sm sm:text-base text-slate-800">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </SectionWrapper>

      {/* Typiska arbetsgivare (NY) */}
      {data.typiskaArbetsgivare && data.typiskaArbetsgivare.length > 0 && (
        <SectionWrapper>
          <SectionTitle
            eyebrow="Var jobben finns"
            title={`Typiska arbetsgivare för ${data.namnBestamd}`}
            description="Var de flesta tjänsterna finns och hur arbetsmarknaden ser ut."
            color="emerald"
          />
          <TypiskaArbetsgivare grupper={data.typiskaArbetsgivare} />
        </SectionWrapper>
      )}

      {/* Utbildningsvagar (NY) */}
      {data.utbildningsvagar && data.utbildningsvagar.length > 0 && (
        <SectionWrapper narrow>
          <SectionTitle
            eyebrow="Utbildning"
            title={`Hur du blir ${data.namnBestamd}`}
            description="Vanliga vägar in i yrket och vad som krävs."
          />
          <Utbildningsvagar vagar={data.utbildningsvagar} />
        </SectionWrapper>
      )}

      {/* Relaterade yrkesmallar */}
      {relaterade.length > 0 && (
        <SectionWrapper>
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Andra yrkesmallar du kanske gillar
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {relaterade.map((y) => {
              const Icon = KATEGORI_ICON[y.kategori]
              return (
                <Link
                  key={y.slug}
                  href={`/cv-mallar/${y.slug}`}
                  className="group block bg-white rounded-3xl border border-orange-100 p-5 hover:border-orange-200 transition-colors h-full"
                  style={{ boxShadow: '0 6px 24px -14px rgba(249, 115, 22, 0.16)' }}
                  aria-label={`Se CV-mall för ${y.namn}`}
                >
                  <Icon className="w-12 h-12 sm:w-14 sm:h-14 mb-3" />

                  <div className="text-[10px] font-bold uppercase tracking-wide text-orange-700 mb-1">
                    {KATEGORI_LABEL[y.kategori]}
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 mb-2 leading-tight">
                    {y.namn}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3 line-clamp-3">
                    {y.intro}
                  </p>

                  <span className="inline-flex items-center gap-1.5 text-orange-700 font-bold text-sm group-hover:gap-2.5 transition-all whitespace-nowrap">
                    <FileText className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
                    Se CV-mall
                    <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.5} />
                  </span>
                </Link>
              )
            })}
          </div>
        </SectionWrapper>
      )}

      {/* FAQ */}
      <SectionWrapper narrow>
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">
            Vanliga frågor om {data.namnBestamd}-CV
          </h2>
        </div>
        <FaqAccordion variant="cv" yrke={data.namn} items={data.faqItems} />
      </SectionWrapper>

      {/* Final CTA */}
      <section className="container mx-auto px-3 sm:px-4 py-8 sm:py-16 max-w-4xl">
        <div className="bg-gradient-to-br from-orange-500 to-pink-600 rounded-3xl p-8 sm:p-12 text-center text-white">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-3 leading-tight">
            Klar att skapa ditt {data.namnBestamd}-CV?
          </h2>
          <p className="text-base sm:text-lg text-white/90 mb-6 max-w-xl mx-auto">
            Använd någon av våra mallar direkt i appen. Gratis att börja, ingen kortuppgift krävs.
          </p>
          <Link
            href="/verktyg/cv-mallar"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white text-slate-900 font-bold text-base hover:bg-slate-50 transition-colors"
          >
            Skapa CV nu
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </Link>
        </div>
      </section>
    </div>
  )
}

// ============================================================================
// Hjalp-komponenter
// ============================================================================

function SectionWrapper({ children, narrow }: { children: React.ReactNode; narrow?: boolean }) {
  return (
    <section className={`container mx-auto px-3 sm:px-4 pb-12 sm:pb-16 ${narrow ? 'max-w-3xl' : 'max-w-6xl'}`}>
      {children}
    </section>
  )
}

function SectionTitle({
  eyebrow,
  title,
  description,
  color = 'orange',
}: {
  eyebrow: string
  title: string
  description?: string
  color?: 'orange' | 'emerald'
}) {
  const eyebrowColor = color === 'emerald'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : 'bg-orange-50 text-orange-700 border-orange-200'

  return (
    <div className="text-center mb-8 sm:mb-10">
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] border ${eyebrowColor} mb-4`}>
        {eyebrow}
      </div>
      <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3 leading-[1.1]">
        {title}
      </h2>
      {description && (
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </div>
  )
}
