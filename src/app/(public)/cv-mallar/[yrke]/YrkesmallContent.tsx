'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ChevronRight, ShieldCheck, Crown, FileText, ArrowRight, CheckCircle2, Eye, Sparkles, BookOpen, Layers } from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import FaqAccordion from '@/components/exempel-shared/FaqAccordion'
import { getTemplateById } from '@/lib/cv/simple-templates'
import type { Yrkesmall } from '../yrkesmall-data'

interface YrkesmallContentProps {
  data: Yrkesmall
  relaterade: Yrkesmall[]
}

export default function YrkesmallContent({ data, relaterade }: YrkesmallContentProps) {
  const freeTemplate = getTemplateById(data.freeMallId)
  const premiumTemplate = getTemplateById(data.premiumMallId)

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/30 via-white to-orange-50/40">
      <Breadcrumb
        items={[
          { name: 'Hem', href: '/' },
          { name: 'CV-mallar', href: '/cv-mallar' },
          { name: data.namn, href: `/cv-mallar/${data.slug}` },
        ]}
      />

      {/* Hero med text + två mallkort */}
      <section className="container mx-auto px-3 sm:px-4 pt-6 pb-10 sm:pt-10 sm:pb-14 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_460px] gap-10 lg:gap-12 items-center">
          {/* Vänster: text */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-5">
              <FileText className="w-3.5 h-3.5" strokeWidth={2.5} />
              CV-mall för {data.namnBestamd}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.05] tracking-tight mb-5">
              CV-mall för{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {data.namn}
              </span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-slate-600 leading-relaxed mb-7 max-w-xl">
              {data.intro} Välj mellan vår gratis-mall och premium-varianten. Båda är ATS-säkra och optimerade för svenska arbetsgivare 2026.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/cv-exempel/${data.slug}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-orange-200 text-slate-800 font-bold text-sm hover:border-orange-300 transition-all"
              >
                <Eye className="w-4 h-4" strokeWidth={2.4} />
                Se färdigt CV-exempel
              </Link>
            </div>
          </div>

          {/* Höger: två mallkort sida vid sida */}
          <div className="grid grid-cols-2 gap-3 lg:gap-4">
            {/* Gratis-mall */}
            <div className="flex flex-col bg-white rounded-2xl border-2 border-emerald-200 overflow-hidden" style={{ boxShadow: '0 12px 36px -12px rgba(16, 185, 129, 0.25)' }}>
              <div className="relative aspect-[3/4] bg-slate-50">
                {freeTemplate && (
                  <Image
                    src={freeTemplate.imagePath}
                    alt={`${freeTemplate.name} CV-mall för ${data.namnBestamd} (gratis)`}
                    fill
                    className="object-cover object-top"
                    sizes="(min-width: 1024px) 220px, 50vw"
                    priority
                  />
                )}
                <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                  Gratis
                </span>
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <div className="font-black text-sm text-slate-900">{data.freeMallNamn}</div>
                <div className="text-[11px] text-slate-600 mb-2">ATS-säker · ren design</div>
                <Link
                  href="/dashboard/cv-mallar"
                  className="mt-auto inline-flex items-center justify-center gap-1 px-3 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
                >
                  Använd gratis
                  <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
                </Link>
              </div>
            </div>

            {/* Premium-mall */}
            <div className="flex flex-col bg-white rounded-2xl border-2 border-orange-300 overflow-hidden" style={{ boxShadow: '0 12px 36px -12px rgba(249, 115, 22, 0.32)' }}>
              <div className="relative aspect-[3/4] bg-slate-50">
                {premiumTemplate && (
                  <Image
                    src={premiumTemplate.imagePath}
                    alt={`${premiumTemplate.name} CV-mall för ${data.namnBestamd} (premium)`}
                    fill
                    className="object-cover object-top"
                    sizes="(min-width: 1024px) 220px, 50vw"
                  />
                )}
                <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                  <Crown className="w-2.5 h-2.5" strokeWidth={2.5} />
                  Premium
                </span>
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <div className="font-black text-sm text-slate-900">{data.premiumMallNamn}</div>
                <div className="text-[11px] text-slate-600 mb-2">Foto + LinkedIn · visuellt rikare</div>
                <Link
                  href="/dashboard/cv-mallar"
                  className="mt-auto inline-flex items-center justify-center gap-1 px-3 py-2 rounded-full text-white font-bold text-xs transition-all hover:shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                  }}
                >
                  Lås upp premium
                  <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Varför mallen är bra */}
      <SectionWrapper>
        <SectionTitle
          eyebrow="Varför just dessa mallar"
          title={`${data.freeMallNamn} och ${data.premiumMallNamn} för ${data.namnBestamd}`}
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

      {/* Vad rekryterare letar efter */}
      <SectionWrapper narrow>
        <SectionTitle
          eyebrow="Rekryterar-perspektiv"
          title={`Vad rekryterare letar efter i ett ${data.namnBestamd}-CV`}
          description="Tre saker som avgör om du går vidare till intervju."
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
              <Sparkles className="w-4 h-4 text-emerald-700" strokeWidth={2.5} />
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

      {/* Cross-link CV-exempel + brev */}
      <SectionWrapper>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href={`/cv-exempel/${data.slug}`}
            className="group bg-white border border-orange-100 hover:border-orange-300 rounded-2xl p-6 transition-all"
            style={{ boxShadow: '0 4px 16px -10px rgba(249, 115, 22, 0.15)' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <span
                className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white"
                style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)' }}
              >
                <Eye className="w-5 h-5" strokeWidth={2.4} />
              </span>
              <h3 className="text-lg font-black text-slate-900">Färdigt CV-exempel</h3>
            </div>
            <p className="text-sm text-slate-600 mb-3">
              Se hur ett komplett CV för {data.namnBestamd} ser ut. Konkret innehåll, formuleringar och struktur.
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-bold text-orange-700 group-hover:translate-x-0.5 transition-transform">
              Se exempel
              <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
            </span>
          </Link>

          <Link
            href={`/personligt-brev-exempel/${data.slug}`}
            className="group bg-white border border-orange-100 hover:border-orange-300 rounded-2xl p-6 transition-all"
            style={{ boxShadow: '0 4px 16px -10px rgba(249, 115, 22, 0.15)' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <span
                className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white"
                style={{ background: 'linear-gradient(135deg, #DC2626, #BE185D)' }}
              >
                <BookOpen className="w-5 h-5" strokeWidth={2.4} />
              </span>
              <h3 className="text-lg font-black text-slate-900">Personligt brev</h3>
            </div>
            <p className="text-sm text-slate-600 mb-3">
              Skriv ett starkt personligt brev som matchar ditt CV. Se exempel för {data.namnBestamd}.
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-bold text-orange-700 group-hover:translate-x-0.5 transition-transform">
              Se brev-exempel
              <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
            </span>
          </Link>
        </div>
      </SectionWrapper>

      {/* Relaterade yrkesmallar */}
      {relaterade.length > 0 && (
        <SectionWrapper>
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Andra yrkesmallar du kanske gillar
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relaterade.map((y) => (
              <Link
                key={y.slug}
                href={`/cv-mallar/${y.slug}`}
                className="group bg-white border border-slate-200 hover:border-orange-200 rounded-2xl p-5 transition-all"
                style={{ boxShadow: '0 4px 14px -10px rgba(0, 0, 0, 0.08)' }}
              >
                <div className="flex items-start gap-3 mb-2">
                  <span
                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white"
                    style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)' }}
                  >
                    <FileText className="w-4 h-4" strokeWidth={2.4} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-slate-900 leading-tight">{y.namn}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wide text-orange-700 mt-0.5">
                      {y.freeMallNamn} · {y.premiumMallNamn}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-snug line-clamp-2">{y.intro}</p>
              </Link>
            ))}
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
            href="/dashboard/cv-mallar"
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
