'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ChevronRight, ShieldCheck, Crown, FileText, ArrowRight, CheckCircle2, Eye } from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import FaqAccordion from '@/components/exempel-shared/FaqAccordion'
import { getTemplateById } from '@/lib/cv/simple-templates'
import type { Yrkesmall } from '../yrkesmall-data'

interface YrkesmallContentProps {
  data: Yrkesmall
  relaterade: Yrkesmall[]
}

export default function YrkesmallContent({ data, relaterade }: YrkesmallContentProps) {
  const template = getTemplateById(data.mallId)

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/30 via-white to-orange-50/40">
      <Breadcrumb
        items={[
          { name: 'Hem', href: '/' },
          { name: 'CV-mallar', href: '/cv-mallar' },
          { name: data.namn, href: `/cv-mallar/${data.slug}` },
        ]}
      />

      {/* Hero: stort namn + mall-thumbnail + CTA */}
      <section className="container mx-auto px-3 sm:px-4 pt-6 pb-12 sm:pt-10 sm:pb-16 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 lg:gap-14 items-center">
          {/* Vanster: text */}
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
              {data.intro} ATS-säker, gratis att ladda ner och anpassad för svenska arbetsgivare 2026.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard/cv-mallar"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-bold text-sm transition-all hover:shadow-xl"
                style={{
                  background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                  boxShadow: '0 8px 24px -8px rgba(220, 38, 38, 0.4)',
                }}
              >
                Använd mallen
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </Link>
              <Link
                href={`/cv-exempel/${data.slug}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-orange-200 text-slate-800 font-bold text-sm hover:border-orange-300 transition-all"
              >
                <Eye className="w-4 h-4" strokeWidth={2.4} />
                Se färdigt CV-exempel
              </Link>
            </div>
          </div>

          {/* Höger: mall-thumbnail */}
          <div className="lg:order-2">
            <div className="relative aspect-[3/4] bg-white rounded-3xl border border-orange-100 overflow-hidden" style={{ boxShadow: '0 12px 40px -12px rgba(249, 115, 22, 0.25)' }}>
              {template && (
                <Image
                  src={template.imagePath}
                  alt={`${template.name} CV-mall för ${data.namnBestamd}`}
                  fill
                  className="object-cover object-top"
                  sizes="(min-width: 1024px) 320px, 100vw"
                  priority
                />
              )}
              <div className="absolute top-3 left-3 right-3 flex justify-between gap-2">
                {template?.features?.atsSafe && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                    <ShieldCheck className="w-2.5 h-2.5" strokeWidth={2.5} />
                    ATS-säker
                  </span>
                )}
                {template?.tier === 'premium' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold ml-auto">
                    <Crown className="w-2.5 h-2.5" strokeWidth={2.5} />
                    Premium
                  </span>
                )}
              </div>
            </div>
            <div className="mt-3 text-center text-xs text-slate-500">
              <span className="font-bold text-slate-700">{template?.name}</span> — {template?.tier === 'free' ? 'Gratis' : 'Premium'}
            </div>
          </div>
        </div>
      </section>

      {/* "Varför just denna mall för {yrke}?" - UNIK content per yrke */}
      <section className="container mx-auto px-3 sm:px-4 pb-12 sm:pb-16 max-w-6xl">
        <div className="bg-white rounded-3xl border border-orange-100 p-6 sm:p-10" style={{ boxShadow: '0 8px 32px -12px rgba(249, 115, 22, 0.12)' }}>
          <div className="flex items-center gap-3 mb-6">
            <span
              className="w-1 h-8 rounded-sm"
              style={{ background: 'linear-gradient(180deg, #F97316 0%, #DC2626 100%)' }}
              aria-hidden
            />
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Varför {template?.name}-mallen passar {data.namnBestamd}
            </h2>
          </div>

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
        </div>
      </section>

      {/* Vad rekryterare letar efter - UNIK content (skiljer sig från cv-exempel) */}
      <section className="container mx-auto px-3 sm:px-4 pb-12 sm:pb-16 max-w-3xl">
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-emerald-50 text-emerald-700 border border-emerald-200 mb-4">
            Rekryterar-perspektiv
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3 leading-[1.1]">
            Vad rekryterare letar efter i ett {data.namnBestamd}-CV
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Tre saker som avgör om du går vidare till intervju.
          </p>
        </div>

        <div className="space-y-8">
          {data.rekryterarTipsen.map((tip, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35 }}
              className="bg-white rounded-2xl border border-slate-200 p-6"
            >
              <div className="flex items-baseline gap-3 mb-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm"
                  style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)' }}
                >
                  {idx + 1}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                  {tip.rubrik}
                </h3>
              </div>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed pl-11">
                {tip.text}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Checklista */}
      <section className="container mx-auto px-3 sm:px-4 pb-12 sm:pb-16 max-w-3xl">
        <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-200 rounded-3xl p-6 sm:p-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
              Checklista för {data.namnBestamd}-CV
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Det här ska finnas med — bocka av efter hand som du fyller i mallen.
            </p>
          </div>

          <ul className="space-y-2.5">
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
      </section>

      {/* Cross-link till cv-exempel + brev-exempel */}
      <section className="container mx-auto px-3 sm:px-4 pb-12 sm:pb-16 max-w-6xl">
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
              Se hur ett komplett CV för {data.namnBestamd} ser ut — innehåll, formuleringar och struktur.
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
                <FileText className="w-5 h-5" strokeWidth={2.4} />
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
      </section>

      {/* Relaterade yrkesmallar */}
      <section className="container mx-auto px-3 sm:px-4 pb-12 sm:pb-16 max-w-6xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
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
                    {y.mallNamn}-mallen
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-snug line-clamp-2">{y.intro}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-3 sm:px-4 py-12 sm:py-16 max-w-3xl">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">
            Vanliga frågor om {data.namnBestamd}-CV
          </h2>
        </div>
        <FaqAccordion variant="cv" yrke={data.namn} items={data.faqItems} />
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-3 sm:px-4 py-8 sm:py-16 max-w-4xl">
        <div className="bg-gradient-to-br from-orange-500 to-pink-600 rounded-3xl p-8 sm:p-12 text-center text-white">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-3 leading-tight">
            Klar att skapa ditt {data.namnBestamd}-CV?
          </h2>
          <p className="text-base sm:text-lg text-white/90 mb-6 max-w-xl mx-auto">
            Använd {template?.name}-mallen direkt i appen. Gratis att börja, ingen kortuppgift krävs.
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
