'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  FileText, Mail, Eye, Clock, Shield, Target,
  CheckCircle, ArrowRight, Sparkles, ChevronDown, ChevronUp,
  Users, Briefcase, Heart, Code
} from 'lucide-react'

// Components
import PremiumNavbar from '@/components/PremiumNavbar'
import Breadcrumb from '@/components/Breadcrumb'

// Populära exempel data
const popularCVExamples = [
  { title: 'Undersköterska', slug: 'underskoterska', icon: Heart, category: 'Vård' },
  { title: 'Lärare', slug: 'larare', icon: Users, category: 'Utbildning' },
  { title: 'Ekonomiassistent', slug: 'ekonomiassistent', icon: Briefcase, category: 'Ekonomi' },
]

const popularLetterExamples = [
  { title: 'Undersköterska', slug: 'underskoterska', icon: Heart, category: 'Vård' },
  { title: 'Lärare', slug: 'larare', icon: Users, category: 'Utbildning' },
  { title: 'Receptionist', slug: 'receptionist', icon: Briefcase, category: 'Service' },
]

export default function ExempelPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'cv' | 'brev'>('cv')

  // Schema.org markup
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Exempel på Personliga Brev och CV - Gratis Mallar",
    "description": "Se professionella exempel på personliga brev och CV för alla branscher. ATS-optimerade mallar, yrkespecifika guider och kostnadsfria tips.",
    "url": "https://jobbcoach.ai/exempel",
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Hem", "item": "https://jobbcoach.ai" },
        { "@type": "ListItem", "position": 2, "name": "Exempel", "item": "https://jobbcoach.ai/exempel" }
      ]
    }
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Varför ska jag använda exempel för CV och personligt brev?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Exempel visar dig exakt vilken struktur, tonalitet och innehåll som fungerar för ditt specifika yrke. Istället för att gissa dig fram ser du beprövade formuleringar som rekryterare uppskattar. Det sparar tid och minskar risken att din ansökan sorteras bort av ATS-system."
        }
      },
      {
        "@type": "Question",
        "name": "Är exemplen gratis att använda?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ja, alla våra exempel är helt kostnadsfria att läsa och använda som inspiration. Du kan se fullständiga CV- och brevexempel för över 30 olika yrken utan att skapa konto. För att skapa egna dokument med våra verktyg kan du registrera dig gratis."
        }
      },
      {
        "@type": "Question",
        "name": "Hur väljer jag rätt exempel för mitt yrke?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Börja med att leta efter ditt exakta yrke i vår lista. Om det inte finns, välj ett närliggande yrke inom samma bransch. En ekonom kan till exempel titta på ekonomiassistent-exemplet, medan en undersköterska hittar sitt eget yrke direkt."
        }
      },
      {
        "@type": "Question",
        "name": "Vad betyder ATS-optimerade exempel?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "ATS (Applicant Tracking System) är rekryteringssystem som 97% av stora svenska företag använder för att automatiskt filtrera ansökningar. Våra exempel är skrivna med rätt nyckelord, struktur och formatering för att passera dessa filter och nå fram till en mänsklig rekryterare."
        }
      },
      {
        "@type": "Question",
        "name": "Kan jag kopiera exemplen direkt?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Vi rekommenderar att du använder exemplen som inspiration snarare än att kopiera rakt av. Rekryterare känner igen kopierade texter. Anpassa alltid innehållet till din egen erfarenhet, kompetens och det specifika jobbet du söker för bästa resultat."
        }
      }
    ]
  }

  const breadcrumbItems = [
    { name: 'Hem', href: '/' },
    { name: 'Exempel', href: '/exempel' }
  ]

  const benefits = [
    {
      icon: Eye,
      title: 'Se rätt struktur',
      description: 'Lär dig vilka rubriker, ordning och formatering som rekryterare förväntar sig',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Clock,
      title: 'Spara tid',
      description: 'Börja med en beprövad struktur istället för att gissa dig fram',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Shield,
      title: 'Undvik misstag',
      description: 'Se vad som fungerar så du slipper vanliga fel som sorterar bort din ansökan',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: Target,
      title: 'Anpassa till din bransch',
      description: 'Varje bransch har sina preferenser - se skillnaden mellan IT, vård, service, etc.',
      gradient: 'from-purple-500 to-pink-500'
    }
  ]

  const faqs = [
    {
      question: 'Varför ska jag använda exempel för CV och personligt brev?',
      answer: 'Exempel visar dig exakt vilken struktur, tonalitet och innehåll som fungerar för ditt specifika yrke. Istället för att gissa dig fram ser du beprövade formuleringar som rekryterare uppskattar. Det sparar tid och minskar risken att din ansökan sorteras bort av ATS-system.'
    },
    {
      question: 'Är exemplen gratis att använda?',
      answer: 'Ja, alla våra exempel är helt kostnadsfria att läsa och använda som inspiration. Du kan se fullständiga CV- och brevexempel för över 30 olika yrken utan att skapa konto. För att skapa egna dokument med våra verktyg kan du registrera dig gratis.'
    },
    {
      question: 'Hur väljer jag rätt exempel för mitt yrke?',
      answer: 'Börja med att leta efter ditt exakta yrke i vår lista. Om det inte finns, välj ett närliggande yrke inom samma bransch. En ekonom kan till exempel titta på ekonomiassistent-exemplet, medan en undersköterska hittar sitt eget yrke direkt.'
    },
    {
      question: 'Vad betyder ATS-optimerade exempel?',
      answer: 'ATS (Applicant Tracking System) är rekryteringssystem som 97% av stora svenska företag använder för att automatiskt filtrera ansökningar. Våra exempel är skrivna med rätt nyckelord, struktur och formatering för att passera dessa filter och nå fram till en mänsklig rekryterare.'
    },
    {
      question: 'Kan jag kopiera exemplen direkt?',
      answer: 'Vi rekommenderar att du använder exemplen som inspiration snarare än att kopiera rakt av. Rekryterare känner igen kopierade texter. Anpassa alltid innehållet till din egen erfarenhet, kompetens och det specifika jobbet du söker för bästa resultat.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Schema.org markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <PremiumNavbar />

      <div className="container mx-auto px-4 pt-24">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Hero Section */}
      <section className="pt-32 pb-24 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-transparent to-red-50 pointer-events-none" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 text-sm font-semibold rounded-full">
                <Sparkles className="w-4 h-4" />
                30 yrken • Gratis
              </span>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              Se hur riktiga CV:n och personliga brev ser ut
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Se hur andra skriver sina CV:n och personliga brev för samma yrke som du söker.
              Rätt struktur, rätt längd – inga gissningar.
            </motion.p>

            <motion.div
              className="flex flex-wrap justify-center items-center gap-6 mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span><strong>29</strong> CV-exempel</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span><strong>30+</strong> brevexempel</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>ATS-optimerade</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>100% gratis</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Link
                href="#categories"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-orange-500/25 transition-all duration-300"
              >
                Utforska exempel
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Two Category Feature Cards */}
      <section id="categories" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <motion.h2
                className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                Välj kategori
              </motion.h2>
              <motion.p
                className="text-lg text-slate-600"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.6 }}
              >
                Vi har professionella exempel för både CV och personliga brev
              </motion.p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* CV-Exempel Card */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group"
              >
                <Link href="/cv-exempel" className="block h-full">
                  <div className="bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 h-full">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mb-6">
                      <FileText className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 mb-3">CV-Exempel</h3>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">29 yrken</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">ATS-optimerade</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Svensk standard</span>
                    </div>

                    <p className="text-slate-600 mb-6 leading-relaxed">
                      Se kompletta CV:n för 29 olika yrken. Varje exempel visar hur andra i din bransch
                      beskriver sin erfarenhet och strukturerar sitt CV.
                    </p>

                    <ul className="space-y-2 mb-8">
                      {['Professionell struktur', 'Kvantifierade resultat', 'Rätt nyckelord', 'Branschanpassat'].map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                          <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>

                    <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
                      Visa CV-exempel
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </Link>
              </motion.div>

              {/* Personligt Brev Card */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group"
              >
                <Link href="/personligt-brev-exempel" className="block h-full">
                  <div className="bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 h-full">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-600 to-rose-600 rounded-2xl flex items-center justify-center mb-6">
                      <Mail className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 mb-3">Personligt Brev-Exempel</h3>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">30+ yrken</span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">Skräddarsydda</span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">Engagerande</span>
                    </div>

                    <p className="text-slate-600 mb-6 leading-relaxed">
                      Se hur andra skriver sina personliga brev för samma yrke.
                      Exemplen visar rätt längd, tonalitet och struktur.
                    </p>

                    <ul className="space-y-2 mb-8">
                      {['Rätt tonalitet', 'Optimal längd', 'Engagerande inledning', 'Stark avslutning'].map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                          <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>

                    <div className="flex items-center gap-2 text-purple-600 font-semibold group-hover:gap-3 transition-all">
                      Visa brevexempel
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Varför Exempel Hjälper */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <motion.h2
                className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                Varför är exempel så värdefulla?
              </motion.h2>
              <motion.p
                className="text-lg text-slate-600"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.6 }}
              >
                Se vad som fungerar innan du börjar skriva
              </motion.p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, idx) => (
                <motion.div
                  key={idx}
                  className="bg-white rounded-xl p-6 border border-slate-200 hover:border-orange-300 hover:shadow-lg transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${benefit.gradient} rounded-xl flex items-center justify-center mb-4`}>
                    <benefit.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{benefit.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Popular Examples Preview */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <motion.h2
                className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                Populära exempel
              </motion.h2>
              <motion.p
                className="text-lg text-slate-600"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.6 }}
              >
                Börja här - dessa söks mest av jobbsökare
              </motion.p>
            </div>

            {/* Tab Switcher */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex bg-slate-100 rounded-xl p-1">
                <button
                  onClick={() => setActiveTab('cv')}
                  className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    activeTab === 'cv'
                      ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  CV-exempel
                </button>
                <button
                  onClick={() => setActiveTab('brev')}
                  className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    activeTab === 'brev'
                      ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Personligt brev
                </button>
              </div>
            </div>

            {/* Examples Grid */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10"
            >
              {(activeTab === 'cv' ? popularCVExamples : popularLetterExamples).map((example, idx) => (
                <Link
                  key={idx}
                  href={activeTab === 'cv' ? `/cv-exempel/${example.slug}` : `/personligt-brev-exempel/${example.slug}`}
                  className="group"
                >
                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:border-orange-300 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-4 mb-3">
                      <div className={`w-10 h-10 ${activeTab === 'cv' ? 'bg-blue-100' : 'bg-purple-100'} rounded-lg flex items-center justify-center`}>
                        <example.icon className={`w-5 h-5 ${activeTab === 'cv' ? 'text-blue-600' : 'text-purple-600'}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{example.title}</h3>
                        <p className="text-xs text-slate-500">{example.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-orange-600 font-medium group-hover:gap-3 transition-all">
                      Visa exempel
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </motion.div>

            <div className="text-center">
              <Link
                href={activeTab === 'cv' ? '/cv-exempel' : '/personligt-brev-exempel'}
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:border-orange-500 hover:text-orange-600 transition-all duration-300"
              >
                Visa alla {activeTab === 'cv' ? 'CV-exempel' : 'brevexempel'}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <motion.h2
                className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                Vanliga frågor
              </motion.h2>
              <motion.p
                className="text-lg text-slate-600"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.6 }}
              >
                Svar på de vanligaste frågorna om våra exempel
              </motion.p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <motion.div
                  key={idx}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05, duration: 0.4 }}
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                    aria-expanded={expandedFaq === idx}
                  >
                    <span className="font-semibold text-slate-900 pr-4">{faq.question}</span>
                    {expandedFaq === idx ? (
                      <ChevronUp className="w-5 h-5 text-slate-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-600 flex-shrink-0" />
                    )}
                  </button>
                  {expandedFaq === idx && (
                    <div className="px-6 pb-4">
                      <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-orange-600 to-red-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Skapa ditt eget CV nu
              </h2>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Använd våra verktyg för att skapa professionella CV och personliga brev.
                Baserat på exemplen du sett, anpassat till dig.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link
                  href="/cv-mallar"
                  className="px-8 py-4 bg-white text-orange-600 font-semibold rounded-xl hover:bg-slate-50 hover:shadow-2xl transition-all duration-300 inline-flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  Skapa CV
                </Link>
                <Link
                  href="/create-letter"
                  className="px-8 py-4 bg-orange-700 text-white font-semibold rounded-xl hover:bg-orange-800 transition-all duration-300 inline-flex items-center justify-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  Skapa Personligt Brev
                </Link>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-6 text-white/80 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span>ATS-optimerat</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span>Klart på 60 sekunder</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span>Gratis att börja</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
