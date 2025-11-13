/**
 * LinkedIn-optimering Landing Page - KOMPLETT VERSION
 * Med SEO-optimering, UX-förbättringar och animerad demo
 * Uppdaterad: 2025-01-28
 */
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Linkedin, ArrowRight, CheckCircle, Star, Users, TrendingUp,
  Target, Sparkles, Shield, Eye, Search, Award, ChevronDown,
  Copy, Clipboard, BrainCircuit, Zap, Heart, X
} from 'lucide-react'
import PremiumNavbar from '@/components/PremiumNavbar'
import LinkedInOptimizationDemo from '@/components/LinkedInOptimizationDemo'
import Breadcrumb from '@/components/Breadcrumb'

export default function LinkedInOptimeringSida() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  // Schema markup data
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Vad är LinkedIn-optimering och varför behöver jag det?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "LinkedIn-optimering innebär att anpassa din profil så att den rankar högt i rekryterares sökningar. Över 80% av rekryterare använder LinkedIn Recruiter för att hitta kandidater, och deras sökningar baseras på specifika keywords. Om din profil saknar dessa termer kommer du inte upp i resultaten – oavsett hur kompetent du är. Optimering handlar om att tala samma språk som rekryterare söker på, samtidigt som din profil ska låta naturlig och professionell."
        }
      },
      {
        "@type": "Question",
        "name": "Hur vet jag vilka keywords jag ska använda?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Vårt AI-verktyg analyserar tusentals jobbannonser inom din bransch och identifierar de mest frekventa och relevanta söktermer rekryterare använder. Du får en lista med prioriterade keywords anpassade efter din roll, bransch och erfarenhetsnivå. Vi visar också exakt var och hur ofta du ska använda varje keyword (headline, About, Experience, Skills) för maximal effekt utan att det låter robotiskt."
        }
      },
      {
        "@type": "Question",
        "name": "Kommer min LinkedIn-profil att låta robotisk efter optimering?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolut inte! Det vanligaste misstaget är att keyword-stuffa – alltså att fylla profilen med sökord utan sammanhang. Vårt verktyg balanserar SEO-optimering med naturlig läsbarhet. Vi integrerar keywords i meningsfulla meningar som berättar din historia och visar din kompetens. Målet är att din profil ska både ranka högt OCH övertyga rekryterare att kontakta dig när de läser den."
        }
      },
      {
        "@type": "Question",
        "name": "Hur lång tid tar det att optimera min LinkedIn-profil?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Själva AI-optimeringen tar 30-60 sekunder. Att kopiera och klistra in resultatet på LinkedIn tar ytterligare 2-3 minuter. Totalt är processen klar på cirka 5 minuter. Du behöver inte logga in på LinkedIn i vårt verktyg – du kopierar helt enkelt din nuvarande profiltext, klistrar in i vårt verktyg, får optimerade förslag, och uppdaterar sedan din LinkedIn-profil manuellt."
        }
      },
      {
        "@type": "Question",
        "name": "Måste jag betala för att använda LinkedIn-optimering?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Nej, vårt LinkedIn-optimeringsverktyg är gratis att testa. Alla användare får optimera sin headline och About-sektion utan kostnad. För premium-funktioner som unlimited optimeringar, skills-analys, och A/B-testning av olika versioner behöver du en premium-prenumeration – men grundfunktionen är helt gratis."
        }
      },
      {
        "@type": "Question",
        "name": "Hur ofta ska jag uppdatera min LinkedIn-profil?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Rekommendationen är att optimera din profil varje gång du byter roll, lär dig nya skills, eller märker att du inte får kontakter från rekryterare. Som minimum bör du uppdatera din profil var 6:e månad för att signalera aktivitet till LinkedIns algoritm. Aktiva profiler rankas 40% högre än inaktiva profiler i rekryterares sökningar."
        }
      }
    ]
  }

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Jobbcoach.ai - LinkedIn-optimeringsverktyg",
    "url": "https://jobbcoach.ai/verktyg/linkedin-optimering",
    "description": "AI-verktyg som optimerar din LinkedIn-profil för rekryterares sökningar. Få 3x fler synligheter och kontakter från rekryterare.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "SEK",
      "description": "Gratis att testa"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.7",
      "reviewCount": "1200",
      "bestRating": "5",
      "worstRating": "1"
    }
  }

  const breadcrumbItems = [
    { name: 'Hem', href: '/' },
    { name: 'Verktyg', href: '/verktyg' },
    { name: 'LinkedIn-optimering', href: '/verktyg/linkedin-optimering' }
  ]

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Hur optimerar man sin LinkedIn-profil för rekryterare",
    "description": "Steg-för-steg guide för att optimera din LinkedIn-profil så att rekryterare hittar dig i sina sökningar",
    "totalTime": "PT5M",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Kopiera din nuvarande LinkedIn-profiltext",
        "text": "Kopiera texten från din LinkedIn Headline, About-sektion och eventuellt dina Experience-beskrivningar. Du behöver inte logga in i vårt verktyg – allt görs manuellt på din egen LinkedIn-profil.",
        "position": 1
      },
      {
        "@type": "HowToStep",
        "name": "Klistra in i LinkedIn-optimeringsverktyget",
        "text": "Klistra in din profiltext i vårt AI-verktyg. Välj din bransch och erfarenhetsnivå så att AI:n kan anpassa keywords efter rätt målgrupp.",
        "position": 2
      },
      {
        "@type": "HowToStep",
        "name": "AI analyserar och genererar optimerad version",
        "text": "Vårt AI-verktyg analyserar din text och identifierar vilka keywords rekryterare söker efter inom din bransch. AI:n genererar en optimerad version som både rankar högt i sökningar och låter professionell.",
        "position": 3
      },
      {
        "@type": "HowToStep",
        "name": "Granska och redigera förslag",
        "text": "Få en optimerad version av din Headline och About-sektion med keywords markerade. Du kan se exakt vilka förändringar som gjorts och varför. Redigera om du vill anpassa tonaliteten.",
        "position": 4
      },
      {
        "@type": "HowToStep",
        "name": "Uppdatera din LinkedIn-profil",
        "text": "Kopiera den optimerade texten och klistra in på din LinkedIn-profil. Klart! Din profil är nu optimerad för att synas i rekryterares sökningar.",
        "position": 5
      }
    ]
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Schema.org markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />

      <PremiumNavbar />

      <div className="container mx-auto px-4 pt-24">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Hero Section */}
      <section className="pt-32 pb-24 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white to-indigo-50/30" />
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full mix-blend-multiply filter blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Hero content grid */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Text content */}
              <div>
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Linkedin className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-900">Nytt verktyg</span>
                </motion.div>

                <motion.h1
                  className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                >
                  LinkedIn-optimering för jobbsökare:{' '}
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    syns i rekryterarnas sökningar
                  </span>
                </motion.h1>

                <motion.p
                  className="text-xl text-slate-600 mb-6 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  80% av rekryterare söker kandidater via LinkedIn. Om din profil inte är optimerad för AI-drivna sökningar syns du inte – även om du är perfekt för jobbet.
                </motion.p>

                <motion.p
                  className="text-lg text-slate-500 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.6 }}
                >
                  Med rätt <strong>LinkedIn-optimering</strong> kan du öka din synlighet med 3x och få fler kontakter från rekryterare. Vårt AI-verktyg hjälper dig optimera keywords, headline, About-sektion och skills på 5 minuter.
                </motion.p>

                <motion.div
                  className="flex flex-col sm:flex-row gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <Link
                    href="/dashboard/linkedin-optimizer"
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 inline-flex items-center justify-center gap-2"
                  >
                    Få en optimerad LinkedIn-profil på 5 minuter
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href="/artiklar/ai-rekrytering-sverige"
                    className="px-8 py-4 bg-white text-slate-900 font-semibold rounded-xl border-2 border-slate-200 hover:border-blue-600 transition-all duration-300 inline-flex items-center justify-center gap-2"
                  >
                    Se hur AI påverkar din jobbsökning
                  </Link>
                </motion.div>

                <motion.div
                  className="flex items-center gap-6 mt-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Gratis att testa</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Optimerad för rekryteringssystem</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Klart på 5 min</span>
                  </div>
                </motion.div>
              </div>

              {/* Right: Animated demo */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                <LinkedInOptimizationDemo />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Varför LinkedIn-optimering är avgörande för jobbsökare
              </h2>
              <p className="text-lg text-slate-600 mb-6">
                Även med rätt kompetens kan en icke-optimerad LinkedIn-profil göra dig osynlig för rekryterare
              </p>
              <p className="text-slate-600">
                Om du känner igen dig i något av detta är din LinkedIn-profil förmodligen inte optimerad för hur rekryterare faktiskt söker:
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Search,
                  title: 'Du saknar de nyckelord rekryterare söker på',
                  description: 'Rekryterare använder LinkedIn Recruiter och söker på specifika termer som "Scrum Master", "stakeholder management" eller "budget-ansvar". Om din profil saknar dessa exakta ord kommer du inte upp i sökresultatet – oavsett hur kompetent du är.',
                  stat: '73% av profiler saknar viktiga nyckelord'
                },
                {
                  icon: Eye,
                  title: 'Din Headline är för generisk',
                  description: 'Headline är det första – och ibland enda – rekryterare ser i sökresultat. En headline som bara säger "Projektledare på Företag AB" ger ingen kontext om vad du kan eller vilken bransch du jobbar inom. Rekryterare scrollar vidare.',
                  stat: 'Optimerade headlines får 2.5x fler klick'
                },
                {
                  icon: TrendingUp,
                  title: 'LinkedIn vet inte att du är aktiv',
                  description: 'LinkedIns algoritm prioriterar profiler som är aktiva och kompletta. Om du inte uppdaterat din profil på länge, saknar endorsements, eller har osynliga skills hamnar du längre ner i sökresultaten – även om du matchar sökningen perfekt.',
                  stat: 'Aktiva profiler rankas 40% högre'
                }
              ].map((problem, idx) => (
                <motion.div
                  key={idx}
                  className="bg-slate-50 rounded-xl p-6 border border-slate-200"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                >
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                    <problem.icon className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{problem.title}</h3>
                  <p className="text-slate-600 text-sm mb-4">{problem.description}</p>
                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-xs font-medium text-red-600">{problem.stat}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Simple CTA before FAQ */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              Redo att optimera din LinkedIn-profil?
            </h2>
            <p className="text-lg text-slate-600 mb-6">
              Kom igång gratis och få din optimerade profil på 5 minuter
            </p>
            <Link
              href="/dashboard/linkedin-optimizer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
            >
              Optimera min profil nu
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Vanliga frågor om LinkedIn-optimering
              </h2>
              <p className="text-lg text-slate-600">
                Allt du behöver veta för att förstå och använda LinkedIn-optimering
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  question: 'Vad är LinkedIn-optimering och varför behöver jag det?',
                  answer: 'LinkedIn-optimering innebär att anpassa din profil så att den rankar högt i rekryterares sökningar. Över 80% av rekryterare använder LinkedIn Recruiter för att hitta kandidater, och deras sökningar baseras på specifika keywords. Om din profil saknar dessa termer kommer du inte upp i resultaten – oavsett hur kompetent du är. Optimering handlar om att tala samma "språk" som rekryterare söker på, samtidigt som din profil ska låta naturlig och professionell.'
                },
                {
                  question: 'Hur vet jag vilka keywords jag ska använda?',
                  answer: 'Vårt AI-verktyg analyserar tusentals jobbannonser inom din bransch och identifierar de mest frekventa och relevanta söktermer rekryterare använder. Du får en lista med prioriterade keywords anpassade efter din roll, bransch och erfarenhetsnivå. Vi visar också exakt var och hur ofta du ska använda varje keyword (headline, About, Experience, Skills) för maximal effekt utan att det låter robotiskt.'
                },
                {
                  question: 'Kommer min LinkedIn-profil att låta robotisk efter optimering?',
                  answer: 'Absolut inte! Det vanligaste misstaget är att "keyword-stuffa" – alltså att fylla profilen med sökord utan sammanhang. Vårt verktyg balanserar SEO-optimering med naturlig läsbarhet. Vi integrerar keywords i meningsfulla meningar som berättar din historia och visar din kompetens. Målet är att din profil ska både ranka högt OCH övertyga rekryterare att kontakta dig när de läser den.'
                },
                {
                  question: 'Hur lång tid tar det att optimera min LinkedIn-profil?',
                  answer: 'Själva AI-optimeringen tar 30-60 sekunder. Att kopiera och klistra in resultatet på LinkedIn tar ytterligare 2-3 minuter. Totalt är processen klar på cirka 5 minuter. Du behöver inte logga in på LinkedIn i vårt verktyg – du kopierar helt enkelt din nuvarande profiltext, klistrar in i vårt verktyg, får optimerade förslag, och uppdaterar sedan din LinkedIn-profil manuellt.'
                },
                {
                  question: 'Måste jag betala för att använda LinkedIn-optimering?',
                  answer: 'Nej, vårt LinkedIn-optimeringsverktyg är gratis att testa. Alla användare får optimera sin headline och About-sektion utan kostnad. För premium-funktioner som unlimited optimeringar, skills-analys, och A/B-testning av olika versioner behöver du en premium-prenumeration – men grundfunktionen är helt gratis.'
                },
                {
                  question: 'Hur ofta ska jag uppdatera min LinkedIn-profil?',
                  answer: 'Rekommendationen är att optimera din profil varje gång du byter roll, lär dig nya skills, eller märker att du inte får kontakter från rekryterare. Som minimum bör du uppdatera din profil var 6:e månad för att signalera aktivitet till LinkedIns algoritm. Aktiva profiler rankas 40% högre än inaktiva profiler i rekryterares sökningar.'
                }
              ].map((faq, idx) => (
                <motion.div
                  key={idx}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05, duration: 0.5 }}
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-semibold text-slate-900 pr-4">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-600 flex-shrink-0 transition-transform duration-300 ${
                        expandedFaq === idx ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {expandedFaq === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-5 text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                          {faq.answer}
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

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Redo att synas för rätt rekryterare?
              </h2>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Gör som 1 200+ andra jobbsökare. Optimera din LinkedIn-profil med AI på 5 minuter och få 3x fler kontakter från rekryterare.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/dashboard/linkedin-optimizer"
                  className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 inline-flex items-center justify-center gap-2"
                >
                  Kom igång gratis
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/artiklar/ai-rekrytering-sverige"
                  className="px-8 py-4 bg-transparent text-white font-semibold rounded-xl border-2 border-white hover:bg-white/10 transition-all duration-300 inline-flex items-center justify-center gap-2"
                >
                  Läs mer om AI-rekrytering
                </Link>
              </div>

              <div className="mt-8 flex items-center justify-center gap-8 text-white/80 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Inget kreditkort krävs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Klart på 5 minuter</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>1 200+ nöjda användare</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
