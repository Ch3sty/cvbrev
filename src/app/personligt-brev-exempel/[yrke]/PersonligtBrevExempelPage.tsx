'use client'

import { useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, ArrowRight, CheckCircle, Sparkles, Download, Copy,
  ChevronDown, ChevronUp, ChevronRight, Eye, FileText, Target, Lightbulb,
  Award, TrendingUp, Users, Clock, Star, Play, X, AlertCircle, Zap, BookOpen
} from 'lucide-react'

import PremiumNavbar from '@/components/PremiumNavbar'

// SEO: Lazy-load InteractiveLetterPreview för bättre Page Speed
// SSR disabled eftersom komponenten är client-only, men vi har statiskt innehåll som fallback
const InteractiveLetterPreview = dynamic(
  () => import('./InteractiveLetterPreview'),
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

interface ExampleData {
  yrke: string
  sokvolym: number
  intro: string
  seoIntro?: string // SEO-rik introduktionstext
  exempelBrev: {
    namn: string
    adress: string
    telefon: string
    epost: string
    arbetsgivare: string
    roll: string
    datum: string
    brevText: string
  }
  varforDetFungerar: Array<{
    titel: string
    beskrivning: string
  }>
  tips: Array<{
    rubrik: string
    text: string
  }>
  relaterade: Array<{
    yrke: string
    slug: string
  }>
  faq: Array<{
    q: string
    a: string
  }>
  relateradeArtiklar?: Array<{
    titel: string
    slug: string
  }>
  relateradeVerktyg?: Array<{
    namn: string
    slug: string
    beskrivning: string
  }>
}

export default function PersonligtBrevExempelPage({ data }: { data: ExampleData }) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [showCopyNotification, setShowCopyNotification] = useState(false)
  const [activeTab, setActiveTab] = useState<'exempel' | 'analys' | 'tips'>('exempel')

  const handleCopy = () => {
    navigator.clipboard.writeText(data.exempelBrev.brevText)
    setShowCopyNotification(true)
    setTimeout(() => setShowCopyNotification(false), 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <PremiumNavbar />

      {/* Copy Notification */}
      <AnimatePresence>
        {showCopyNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-green-600 text-white rounded-xl shadow-2xl flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Kopierat till urklipp!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breadcrumb */}
      <div className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-slate-600 hover:text-blue-600 transition-colors">
              Hem
            </Link>
            <span className="text-slate-400">/</span>
            <Link href="/personligt-brev-exempel" className="text-slate-600 hover:text-blue-600 transition-colors">
              Personligt brev exempel
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-slate-900 font-semibold">{data.yrke}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-6">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">
                  {data.sokvolym}+ söker efter detta exempel varje månad
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                Personligt brev exempel: {data.yrke}
              </h1>

              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                {data.intro}
              </p>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/dashboard/skapa-brev">
                  <motion.button
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Sparkles className="w-5 h-5" />
                    Skapa mitt personliga brev
                  </motion.button>
                </Link>

                <button
                  onClick={() => {
                    const element = document.getElementById('exempel')
                    element?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="px-6 py-3 bg-white text-slate-900 font-semibold rounded-xl border-2 border-slate-200 hover:border-blue-600 transition-all duration-300 flex items-center gap-2"
                >
                  <Eye className="w-5 h-5" />
                  Visa exempel
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
                  Så skriver du ett personligt brev som {data.yrke.toLowerCase()}
                </h2>
                <p className="text-slate-700 leading-relaxed text-lg">
                  {data.seoIntro}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Sidebar - Tips */}
              <div className="lg:col-span-1 space-y-6">
                {/* Key Insights */}
                <motion.div
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-slate-900">Viktigt att tänka på</h3>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">Anpassa alltid brevet till den specifika jobbannonsen</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">Använd branschspecifika nyckelord för ATS-system</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">Håll brevet mellan 250-400 ord</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">Ge konkreta exempel istället för vaga påståenden</span>
                    </li>
                  </ul>
                </motion.div>

                {/* Stats */}
                <motion.div
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="font-bold text-slate-900 mb-4">Statistik</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-600">ATS-kompatibilitet</span>
                        <span className="text-sm font-bold text-green-600">95%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                          initial={{ width: 0 }}
                          animate={{ width: '95%' }}
                          transition={{ delay: 0.5, duration: 1 }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-600">Läsbarhet</span>
                        <span className="text-sm font-bold text-blue-600">92%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                          initial={{ width: 0 }}
                          animate={{ width: '92%' }}
                          transition={{ delay: 0.6, duration: 1 }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-600">Nyckelordsoptimering</span>
                        <span className="text-sm font-bold text-purple-600">88%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                          initial={{ width: 0 }}
                          animate={{ width: '88%' }}
                          transition={{ delay: 0.7, duration: 1 }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* CTA Box */}
                <motion.div
                  className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-6 text-white"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold mb-2">Skapa ditt personliga brev</h3>
                  <p className="text-white/90 text-sm mb-4">
                    Ladda upp ditt CV, klistra in jobbannonsen, välj mall – klart på 60 sekunder. ATS-optimerat och skräddarsytt för jobbet.
                  </p>
                  <Link href="/dashboard/skapa-brev">
                    <button className="w-full px-4 py-3 bg-white text-purple-600 font-semibold rounded-xl hover:shadow-xl transition-all">
                      Kom igång gratis
                    </button>
                  </Link>
                </motion.div>
              </div>

              {/* Main Content Area */}
              <div className="lg:col-span-2">
                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-slate-200">
                  {[
                    { id: 'exempel' as const, label: 'Komplett exempel', icon: FileText },
                    { id: 'analys' as const, label: 'Varför det fungerar', icon: Target },
                    { id: 'tips' as const, label: 'Tips för ditt yrke', icon: Lightbulb }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-3 font-semibold transition-all ${
                        activeTab === tab.id
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                  {activeTab === 'exempel' && (
                    <motion.div
                      key="exempel"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      id="exempel"
                    >
                      <InteractiveLetterPreview exempelBrev={data.exempelBrev} />
                    </motion.div>
                  )}

                  {activeTab === 'analys' && (
                    <motion.div
                      key="analys"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      {data.varforDetFungerar.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                              <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 mb-2">{item.titel}</h3>
                              <p className="text-slate-600 leading-relaxed">{item.beskrivning}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {activeTab === 'tips' && (
                    <motion.div
                      key="tips"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      {data.tips.map((tip, idx) => (
                        <div
                          key={idx}
                          className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Lightbulb className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 mb-2">{tip.rubrik}</h3>
                              <p className="text-slate-600 leading-relaxed">{tip.text}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Examples */}
      {data.relaterade.length > 0 && (
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
                Andra exempel som kan intressera dig
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {data.relaterade.map((related, idx) => (
                  <Link key={idx} href={`/personligt-brev-exempel/${related.slug}`}>
                    <motion.div
                      className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer"
                      whileHover={{ y: -4 }}
                    >
                      <h3 className="font-bold text-slate-900 mb-2">{related.yrke}</h3>
                      <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm">
                        <span>Se exempel</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}


      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
              Vanliga frågor om personligt brev för {data.yrke.toLowerCase()}
            </h2>
            <div className="space-y-4">
              {data.faq.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-100 transition-colors"
                  >
                    <span className="font-semibold text-slate-900 text-left pr-4">{item.q}</span>
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
                          <p className="text-slate-600 leading-relaxed">{item.a}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Relaterade Artiklar Section */}
      {data.relateradeArtiklar && data.relateradeArtiklar.length > 0 && (
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
                Läs mer om att söka jobb som {data.yrke.toLowerCase()}
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {data.relateradeArtiklar.map((artikel: any, idx: number) => (
                  <motion.div
                    key={idx}
                    className="bg-white rounded-xl p-6 border border-slate-200 hover:border-blue-600 transition-all cursor-pointer group"
                    whileHover={{ y: -4 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {artikel.titel}
                        </h3>
                        <p className="text-sm text-slate-500">Kommer snart</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Relaterade Verktyg Section */}
      {data.relateradeVerktyg && data.relateradeVerktyg.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">
                Verktyg som hjälper dig i din jobbsökning
              </h2>
              <p className="text-slate-600 text-center mb-8 max-w-2xl mx-auto">
                Använd våra kostnadsfria verktyg för att skapa ett komplett och professionellt ansökningspaket
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                {data.relateradeVerktyg.map((verktyg: any, idx: number) => (
                  <Link key={idx} href={verktyg.slug}>
                    <motion.div
                      className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100 hover:border-blue-600 transition-all cursor-pointer group h-full"
                      whileHover={{ y: -4 }}
                    >
                      <div className="flex flex-col h-full">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                          <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {verktyg.namn}
                        </h3>
                        <p className="text-sm text-slate-600 flex-grow">
                          {verktyg.beskrivning}
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-blue-600 font-semibold text-sm">
                          <span>Använd verktyget</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              Redo att skapa ditt personliga brev?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Skapa ditt personliga brev på 60 sekunder – ladda upp CV, klistra in jobbannonsen, välj mall. Skräddarsytt för jobbet
            </p>
            <Link href="/dashboard/skapa-brev">
              <motion.button
                className="px-8 py-4 bg-white text-blue-600 font-bold text-lg rounded-xl hover:shadow-2xl transition-all flex items-center gap-3 mx-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="w-6 h-6" />
                Skapa mitt personliga brev nu
              </motion.button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
