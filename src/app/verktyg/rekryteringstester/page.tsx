'use client'

import { motion } from 'framer-motion'
import {
  Brain, Target, TrendingUp, CheckCircle, Sparkles,
  Grid3x3, BookOpen, Calculator, Clock, Lock, Unlock,
  ChevronDown, ChevronUp, ArrowRight, Star
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import PremiumNavbar from '@/components/PremiumNavbar'
import RecruitmentTestDemo from '@/components/RecruitmentTestDemo'
import Breadcrumb from '@/components/Breadcrumb'

const testTypes = [
  {
    icon: Grid3x3,
    name: 'Matrislogik',
    description: 'Identifiera mönster och relationer i 3×3 matriser',
    questions: 15,
    time: '25 min',
    color: 'purple',
    gradient: 'from-purple-600 to-indigo-600',
    free: 'Grundnivå: 15 frågor',
    premium: 'Avancerad: 30 frågor + detaljerade förklaringar'
  },
  {
    icon: BookOpen,
    name: 'Verbalt Resonemang',
    description: 'Analysera texter och dra logiska slutsatser',
    questions: 12,
    time: '25 min',
    color: 'green',
    gradient: 'from-green-600 to-emerald-600',
    free: 'Grundnivå: 12 textavsnitt',
    premium: 'Avancerad: 24 textavsnitt + detaljerade förklaringar'
  },
  {
    icon: Calculator,
    name: 'Numeriskt Resonemang',
    description: 'Tolka data och lösa numeriska problem',
    questions: 20,
    time: '20 min',
    color: 'blue',
    gradient: 'from-blue-600 to-cyan-600',
    free: 'Grundnivå: 20 frågor',
    premium: 'Avancerad: 40 frågor + detaljerade förklaringar'
  }
]

const howItWorks = [
  {
    icon: Brain,
    title: 'Välj testtyp',
    description: 'Matrislogik, verbalt eller numeriskt resonemang',
    color: 'from-purple-600 to-indigo-600'
  },
  {
    icon: Sparkles,
    title: 'Träna realistiskt',
    description: 'Frågor som liknar verkliga rekryteringstester',
    color: 'from-green-600 to-emerald-600'
  },
  {
    icon: CheckCircle,
    title: 'Se lösningar',
    description: 'Steg-för-steg förklaringar för varje fråga',
    color: 'from-blue-600 to-cyan-600'
  },
  {
    icon: TrendingUp,
    title: 'Följ framsteg',
    description: 'Spåra din utveckling över tid',
    color: 'from-orange-600 to-red-600'
  },
  {
    icon: Target,
    title: 'Klara testet',
    description: 'Gå till din rekrytering med självförtroende',
    color: 'from-pink-600 to-rose-600'
  }
]

const whyTrain = [
  {
    icon: Clock,
    title: 'Känner igen mönster snabbare',
    description: 'Träning gör att du identifierar uppgiftstyper direkt och vet exakt hur du ska lösa dem.',
    stat: '40% snabbare'
  },
  {
    icon: Target,
    title: 'Minskar stress och nervositet',
    description: 'När du vet vad som väntar känns testet mindre skrämmande. Du kan fokusera på lösningen istället för att oroa dig.',
    stat: '73% mindre stress'
  },
  {
    icon: TrendingUp,
    title: 'Ökar chanser att klara cutoff',
    description: 'De flesta företag har en minimigräns. Träning kan vara skillnaden mellan att gå vidare eller bli utslängd.',
    stat: '+18% resultat'
  }
]

const comparisonTable = [
  { feature: 'Matrislogik – Grundnivå', free: true, premium: true },
  { feature: 'Verbalt Resonemang – Grundnivå', free: true, premium: true },
  { feature: 'Numeriskt Resonemang – Grundnivå', free: true, premium: true },
  { feature: 'Matrislogik – Avancerad', free: false, premium: true },
  { feature: 'Verbalt Resonemang – Avancerad', free: false, premium: true },
  { feature: 'Numeriskt Resonemang – Avancerad', free: false, premium: true },
  { feature: 'Detaljerade förklaringar', free: false, premium: true },
  { feature: 'Obegränsade försök', free: false, premium: true },
  { feature: 'Spåra framsteg över tid', free: false, premium: true }
]

const faqs = [
  {
    question: 'Vad är logiska tester vid rekrytering?',
    answer: 'Logiska tester är standardiserade tester som arbetsgivare använder för att bedöma kandidaters kognitiva förmågor. De mäter logiskt tänkande, problemlösning och analytisk förmåga – egenskaper som är svåra att bedöma i ett CV eller intervju.'
  },
  {
    question: 'Vilka typer av logiska tester finns det?',
    answer: 'De tre vanligaste typerna är: Matrislogik (visuellt mönsterigenkänning), Verbalt resonemang (textanalys och slutsatsdragning) och Numeriskt resonemang (dataanalys och matematisk problemlösning). Många arbetsgivare kombinerar flera testtyper.'
  },
  {
    question: 'Hjälper träning verkligen?',
    answer: 'Ja, definitivt. Forskning visar att träning kan öka resultaten med upp till 18%. Du lär dig känna igen mönster, hantera tidspress bättre och minskar stress. Många som misslyckas första gången klarar testet efter träning.'
  },
  {
    question: 'Hur lång tid tar varje test?',
    answer: 'Matrislogik och Verbalt resonemang tar cirka 25 minuter vardera, medan Numeriskt resonemang tar cirka 20 minuter. Tidsbegränsningen är en viktig del av testet – träning hjälper dig att arbeta snabbare under press.'
  },
  {
    question: 'Vad är skillnaden mellan Grund och Avancerad?',
    answer: 'Grundnivå innehåller färre frågor och är perfekt för att komma igång. Avancerad nivå har dubbelt så många frågor, högre svårighetsgrad och detaljerade steg-för-steg förklaringar som hjälper dig förstå logiken bakom varje svar.'
  },
  {
    question: 'Kan jag träna gratis?',
    answer: 'Ja! Alla tre testtyper finns tillgängliga på grundnivå utan att du behöver skapa konto eller betala. Du kan börja träna direkt och se om det passar dig innan du uppgraderar.'
  },
  {
    question: 'Vad ingår i Premium?',
    answer: 'Premium ger dig tillgång till alla avancerade tester (dubbelt så många frågor per testtyp), detaljerade förklaringar för varje fråga, obegränsade försök och möjlighet att spåra din utveckling över tid. Kostar 149 kr/månad.'
  },
  {
    question: 'Liknar era tester verkliga rekryteringstester?',
    answer: 'Ja, våra tester är designade för att efterlikna de vanligaste typerna av logiska tester som används av svenska arbetsgivare och rekryteringsföretag. Frågorna följer samma struktur och svårighetsgrad.'
  },
  {
    question: 'Hur många gånger kan jag göra testerna?',
    answer: 'Med Premium har du obegränsade försök på alla tester. Gratis-versionen låter dig göra varje test flera gånger, men utan samma variation och förklaringar som Premium erbjuder.'
  },
  {
    question: 'Vad händer om jag inte klarar ett test?',
    answer: 'Det är helt normalt att inte klara alla frågor första gången! Poängen med träning är att du ska förbättras över tid. Se varje försök som en lärandeupplevelse – använd förklaringarna för att förstå var du gjorde fel och försök igen.'
  }
]

const testimonials = [
  {
    name: 'Emma L.',
    role: 'Civilekonom',
    text: 'Jag hade aldrig gjort matrislogik förut och blev panikslag när jag såg det i ansökan. Efter en veckas träning här kände jag mig så mycket mer förberedd. Jag fick jobbet!',
    rating: 5,
    testType: 'Matrislogik'
  },
  {
    name: 'Marcus A.',
    role: 'Projektledare',
    text: 'Verbala tester var mitt svagaste område. Premium-förklaringarna hjälpte mig förstå exakt hur jag skulle tänka. Från 60% rätt till 85% på två veckor.',
    rating: 5,
    testType: 'Verbalt Resonemang'
  },
  {
    name: 'Sofia K.',
    role: 'IT-konsult',
    text: 'Numeriskt resonemang kändes omöjligt först. Men efter att ha tränat här och läst förklaringarna började det klicka. Rekommenderar starkt Premium!',
    rating: 5,
    testType: 'Numeriskt Resonemang'
  }
]

export default function RekryteringstesterPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const breadcrumbItems = [
    { name: 'Hem', href: '/' },
    { name: 'Verktyg', href: '/verktyg' },
    { name: 'Rekryteringstester', href: '/verktyg/rekryteringstester' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Logiska Tester – Träna Rekryteringstester Gratis",
            "description": "Träna på matrislogik, verbalt resonemang och numeriskt resonemang. Förbered dig för rekryteringstester med realistiska övningar.",
            "url": "https://jobbcoach.ai/verktyg/rekryteringstester",
            "applicationCategory": "EducationalApplication",
            "operatingSystem": "Web",
            "offers": [
              {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "SEK",
                "name": "Gratis Tester",
                "description": "Träna på grundnivå för alla testtyper"
              },
              {
                "@type": "Offer",
                "price": "149",
                "priceCurrency": "SEK",
                "name": "Premium Tester",
                "description": "Avancerade tester, detaljerade förklaringar och obegränsade försök"
              }
            ],
            "featureList": [
              "Matrislogik",
              "Verbalt resonemang",
              "Numeriskt resonemang",
              "Detaljerade förklaringar",
              "Spåra framsteg"
            ]
          })
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(faq => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
              }
            }))
          })
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "Hur du tränar på logiska tester",
            "step": howItWorks.map((step, index) => ({
              "@type": "HowToStep",
              "position": index + 1,
              "name": step.title,
              "text": step.description
            }))
          })
        }}
      />

      <PremiumNavbar />

      <div className="container mx-auto px-4 pt-24">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-32 pb-16 md:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Träna på logiska tester{' '}
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">
                gratis
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              Öka dina chanser att klara rekryteringstester. Träna på matrislogik, verbalt och numeriskt resonemang med realistiska frågor. Starta direkt – inget konto krävs.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                href="/dashboard/tester"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
              >
                Börja träna gratis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#hur-det-fungerar"
                className="px-8 py-4 bg-white text-slate-900 rounded-xl font-semibold border-2 border-slate-200 hover:border-purple-600 hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                Se hur det fungerar
              </a>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-slate-600">Gratis grundnivå</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-slate-600">Inget konto krävs</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <RecruitmentTestDemo />
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-white py-16 border-y border-slate-200">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Varför misslyckas så många på rekryteringstester?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Det handlar sällan om kompetens – det handlar om förberedelse
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                stat: '67%',
                label: 'klarar inte cutoff',
                description: 'De flesta företag har en minimigräns. Om du inte når den spelar dina kvalifikationer ingen roll.',
                icon: Target
              },
              {
                stat: '45 sek',
                label: 'per fråga i snitt',
                description: 'Tidspressen är brutal. Utan träning hinner du inte tänka klart innan tiden tar slut.',
                icon: Clock
              },
              {
                stat: '83%',
                label: 'har aldrig tränat',
                description: 'De flesta går in helt oförberedda. De som tränat har en enorm fördel från start.',
                icon: Brain
              }
            ].map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 border-2 border-slate-200 hover:border-purple-300 hover:shadow-xl transition-all"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-4xl font-bold text-slate-900 mb-2">{item.stat}</p>
                  <p className="text-lg font-semibold text-slate-900 mb-3">{item.label}</p>
                  <p className="text-slate-600">{item.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Test Types Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Tre typer av logiska tester
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Träna på alla tre för att vara maximalt förberedd
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testTypes.map((test, index) => {
              const Icon = test.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-8 border-2 border-slate-200 hover:shadow-xl transition-all"
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${test.gradient} rounded-2xl flex items-center justify-center mb-6`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{test.name}</h3>
                  <p className="text-slate-600 mb-6">{test.description}</p>

                  <div className="flex items-center gap-4 mb-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">{test.questions} frågor</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">{test.time}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Unlock className="w-5 h-5 text-green-600 mt-0.5" />
                      <p className="text-sm text-slate-600">{test.free}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
                      <p className="text-sm text-slate-600">{test.premium}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="hur-det-fungerar" className="bg-gradient-to-br from-slate-50 to-white py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Så fungerar träningen
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Fem enkla steg till bättre testresultat
            </p>
          </motion.div>

          <div className="grid md:grid-cols-5 gap-6">
            {howItWorks.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:shadow-xl transition-all h-full">
                    <div className={`w-12 h-12 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-sm font-bold text-slate-900 mb-2">{step.title}</p>
                    <p className="text-xs text-slate-600">{step.description}</p>
                  </div>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-slate-300 to-transparent" />
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Train Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Varför träning gör skillnad
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Forskningsbevisade effekter av träning på logiska tester
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {whyTrain.map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-8 border-2 border-slate-200 hover:shadow-xl transition-all"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-green-600">{item.stat}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600">{item.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="bg-white py-16 border-y border-slate-200">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Välj rätt nivå för dig
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Börja gratis och uppgradera när du vill träna mer
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 border-2 border-slate-200"
            >
              <div className="flex items-center gap-3 mb-6">
                <Unlock className="w-8 h-8 text-slate-600" />
                <h3 className="text-2xl font-bold text-slate-900">Gratis</h3>
              </div>

              <p className="text-4xl font-bold text-slate-900 mb-1">
                0 kr
              </p>
              <p className="text-slate-600 mb-8">Perfekt för att komma igång</p>

              <Link
                href="/dashboard/tester"
                className="block w-full py-3 px-6 bg-slate-900 text-white rounded-xl font-semibold text-center hover:bg-slate-800 transition-colors mb-8"
              >
                Börja träna gratis
              </Link>

              <div className="space-y-3">
                {comparisonTable.filter(row => row.free).map((row, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-slate-700">{row.feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Premium Plan */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-8 border-2 border-purple-400 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 bg-yellow-400 text-slate-900 px-3 py-1 rounded-full text-sm font-bold">
                Populärast
              </div>

              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-8 h-8 text-white" />
                <h3 className="text-2xl font-bold text-white">Premium</h3>
              </div>

              <p className="text-4xl font-bold text-white mb-1">
                149 kr
                <span className="text-lg font-normal text-purple-100">/månad</span>
              </p>
              <p className="text-purple-100 mb-8">Allting du behöver för att klara testet</p>

              <Link
                href="/dashboard/tester"
                className="block w-full py-3 px-6 bg-white text-purple-600 rounded-xl font-semibold text-center hover:bg-purple-50 transition-colors mb-8"
              >
                Uppgradera till Premium
              </Link>

              <div className="space-y-3">
                {comparisonTable.map((row, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
                    <span className="text-sm text-white">{row.feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Vanliga frågor
            </h2>
            <p className="text-xl text-slate-600">
              Allt du behöver veta om logiska tester
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-semibold text-slate-900 pr-8">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-5 text-slate-600 border-t border-slate-100">
                    <p className="pt-4">{faq.answer}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gradient-to-br from-slate-50 to-white py-16 border-y border-slate-200">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Vad säger användarna?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Verkliga resultat från personer som fick jobbet
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 border-2 border-slate-200 hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{testimonial.name}</p>
                    <p className="text-sm text-slate-600">{testimonial.role}</p>
                  </div>
                  <span className="text-xs text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                    {testimonial.testType}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl p-12 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Redo att börja träna?
              </h2>
              <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
                Starta gratis idag och öka dina chanser att klara rekryteringstestet. Ingen registrering krävs för grundnivån.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/dashboard/tester"
                  className="px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all flex items-center justify-center gap-2 group shadow-xl"
                >
                  Börja träna gratis
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/pricing"
                  className="px-8 py-4 bg-purple-700 text-white rounded-xl font-semibold hover:bg-purple-800 transition-all flex items-center justify-center gap-2 border-2 border-purple-400"
                >
                  Se Premium-funktioner
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-purple-100">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>3 testtyper</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Realistiska frågor</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Detaljerade förklaringar</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
