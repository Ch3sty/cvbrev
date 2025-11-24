'use client'

import { useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, CheckCircle, Sparkles, Eye, FileText, Lightbulb,
  ChevronDown, ChevronUp, Award, TrendingUp, Star, Download
} from 'lucide-react'

import PremiumNavbar from '@/components/PremiumNavbar'

// SEO: Lazy-load InteractiveCVPreview för bättre Page Speed
const InteractiveCVPreview = dynamic(
  () => import('./InteractiveCVPreview'),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-xl border-2 border-slate-200 p-8 shadow-lg animate-pulse">
        <div className="space-y-4">
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6"></div>
        </div>
      </div>
    )
  }
)

interface CVExampleData {
  yrke: string
  sokvolym: number
  intro: string
  seoIntro?: string
  exempelCV: any
  varforDetFungerar: Array<{
    rubrik: string
    text: string
  }>
  tips: Array<{
    rubrik: string
    text: string
  }>
  faq: Array<{
    fraga: string
    svar: string
  }>
  relaterade: Array<{
    yrke: string
    slug: string
  }>
}

export default function CVExempelPage({ data }: { data: CVExampleData }) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [expandedTip, setExpandedTip] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <PremiumNavbar />

      {/* Breadcrumb */}
      <div className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-slate-600 hover:text-cyan-600 transition-colors">
              Hem
            </Link>
            <span className="text-slate-400">/</span>
            <Link href="/cv-exempel" className="text-slate-600 hover:text-cyan-600 transition-colors">
              CV-exempel
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-slate-900 font-semibold">{data.yrke}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-cyan-50 via-white to-indigo-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-50 to-indigo-50 rounded-full mb-6 border border-cyan-100">
                <Star className="w-4 h-4 text-cyan-600" />
                <span className="text-sm font-semibold text-cyan-900">
                  Professionellt CV-exempel
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                CV-exempel: {data.yrke}
              </h1>

              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                {data.intro}
              </p>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/verktyg/cv-mallar">
                  <motion.button
                    className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Download className="w-5 h-5" />
                    Ladda ner CV-mallar
                  </motion.button>
                </Link>

                <button
                  onClick={() => {
                    const element = document.getElementById('preview')
                    element?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="px-6 py-3 bg-white text-slate-900 font-semibold rounded-xl border-2 border-slate-200 hover:border-cyan-600 transition-all duration-300 flex items-center gap-2"
                >
                  <Eye className="w-5 h-5" />
                  Visa CV-förhandsvisning
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SEO Intro Section */}
      {data.seoIntro && (
        <section className="py-12 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  Så skriver du ett CV som {data.yrke.toLowerCase()}
                </h2>
                <div className="text-slate-700 leading-relaxed text-lg space-y-4">
                  {data.seoIntro.split('\n\n').map((paragraph, pIdx) => (
                    <p key={pIdx}>{paragraph.trim()}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Interactive CV Preview */}
      <section id="preview" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <InteractiveCVPreview exempelCV={data.exempelCV} yrke={data.yrke} />
        </div>
      </section>

      {/* Varför det fungerar */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Varför det här CV:t fungerar
              </h2>
              <p className="text-lg text-slate-600">
                Lär dig principerna bakom ett professionellt CV
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {data.varforDetFungerar.map((item, idx) => (
                <motion.div
                  key={idx}
                  className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-cyan-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-2">{item.rubrik}</h3>
                      <p className="text-slate-600 text-sm leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-full mb-4 border border-amber-100">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-900">
                  Expertråd
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Tips för ditt CV som {data.yrke}
              </h2>
              <p className="text-lg text-slate-600">
                Praktiska råd för att optimera ditt CV
              </p>
            </div>

            <div className="space-y-4">
              {data.tips.map((tip, idx) => (
                <motion.div
                  key={idx}
                  className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <button
                    onClick={() => setExpandedTip(expandedTip === idx ? null : idx)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">{idx + 1}</span>
                      </div>
                      <span className="font-semibold text-slate-900 text-left">{tip.rubrik}</span>
                    </div>
                    {expandedTip === idx ? (
                      <ChevronUp className="w-5 h-5 text-slate-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-600 flex-shrink-0" />
                    )}
                  </button>
                  <AnimatePresence>
                    {expandedTip === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-6 pb-4 bg-white">
                          {tip.text.split('\n\n').map((paragraph, pIdx) => (
                            <p key={pIdx} className="text-slate-600 leading-relaxed mb-3 last:mb-0">
                              {paragraph.trim()}
                            </p>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Vanliga frågor om CV för {data.yrke}
              </h2>
              <p className="text-lg text-slate-600">
                Få svar på dina frågor om CV-skrivande
              </p>
            </div>

            <div className="space-y-4">
              {data.faq.map((item, idx) => (
                <motion.div
                  key={idx}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-semibold text-slate-900 text-left pr-4">{item.fraga}</span>
                    {expandedFaq === idx ? (
                      <ChevronUp className="w-5 h-5 text-slate-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-600 flex-shrink-0" />
                    )}
                  </button>
                  <AnimatePresence>
                    {expandedFaq === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-6 pb-4">
                          <p className="text-slate-600 leading-relaxed">{item.svar}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Related Examples */}
      {data.relaterade && data.relaterade.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
                Relaterade CV-exempel
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {data.relaterade.map((related, idx) => (
                  <Link key={idx} href={`/cv-exempel/${related.slug}`}>
                    <motion.div
                      className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-cyan-500 hover:shadow-md transition-all cursor-pointer"
                      whileHover={{ y: -4 }}
                    >
                      <div className="flex items-center gap-2 text-slate-900 font-semibold">
                        <FileText className="w-5 h-5 text-cyan-600" />
                        {related.yrke}
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-cyan-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Redo att skapa ditt CV?
              </h2>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Ladda ner en professionell CV-mall och börja fylla i din information. Klart på minuter, ser proffsigt ut.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/verktyg/cv-mallar">
                  <motion.button
                    className="px-8 py-4 bg-white text-cyan-600 font-bold text-lg rounded-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Sparkles className="w-6 h-6" />
                    Ladda ner CV-mallar
                  </motion.button>
                </Link>

                <Link href="/cv-exempel">
                  <motion.button
                    className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white text-white font-bold text-lg rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center gap-3"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Se fler CV-exempel
                  </motion.button>
                </Link>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-6 text-white/80 text-sm mt-8">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span>8 professionella mallar</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span>100% ATS-kompatibla</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span>Ladda ner direkt</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
