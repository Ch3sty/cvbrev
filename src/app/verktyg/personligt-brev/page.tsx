/**
 * Personligt Brev Landing Page - KOMPLETT VERSION
 * Med SEO-optimering, UX-copy och AILiveWriting-demo
 * Uppdaterad: 2025-01-28
 */
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  FileText, ArrowRight, CheckCircle, Users, TrendingUp,
  Target, Sparkles, Shield, Clock, Search, AlertTriangle,
  Upload, User, Zap, Download, BarChart, Building,
  ChevronDown, HelpCircle, X, Copy, Clipboard, Database
} from 'lucide-react'
import PremiumNavbar from '@/components/PremiumNavbar'
import AILiveWriting from '@/components/AILiveWriting'
import Breadcrumb from '@/components/Breadcrumb'

export default function PersonligtBrevSida() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  // Schema markup data
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Hur anpassar jag tonaliteten i mitt personliga brev?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Du väljer ton direkt i genereringssteget: Formell & Professionell (bank, juridik), Entusiastisk & Personlig (startup, media), eller Resultatfokuserad & Självsäker (sälj, ledning). Verktyget justerar automatiskt ordval, meningslängd och graden av personlighet efter vald ton."
        }
      },
      {
        "@type": "Question",
        "name": "Hur långt ska mitt personliga brev vara?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Våra genererade brev är alltid 250-350 ord (3/4 A4-sida) – den optimala längden enligt svenska rekryterare. Kortare än så känns ointresserat, längre än så läses sällan. Vi strukturerar brevet i 3-4 stycken för maximal läsbarhet."
        }
      },
      {
        "@type": "Question",
        "name": "Vad händer om jobbannonsen är vag eller kort?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Verktyget extraherar nyckelord från det som finns och kompletterar med branschspecifika kompetenser baserat på jobbtiteln. För mycket vaga annonser kan du lägga till extra kontext (t.ex. företagets värderingar från hemsidan) i fritextfältet."
        }
      },
      {
        "@type": "Question",
        "name": "Kan jag lägga till personliga anekdoter i brevet?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ja! Efter generering kan du redigera och lägga till personliga exempel, anekdoter eller specifika projekt. Många användare lägger till 1-2 meningar om varför de är passionerade för just detta företag eller denna bransch – det gör brevet mer äkta."
        }
      },
      {
        "@type": "Question",
        "name": "Hur hanterar verktyget karriärbyten i brevet?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Om ditt CV visar karriärbyte (t.ex. lärare → HR) kan du specificera detta i briefen. Verktyget formulerar då överbryggande kompetenser (pedagogik → utbildning av personal) och ramar in bytet som en styrka snarare än ett problem."
        }
      },
      {
        "@type": "Question",
        "name": "Hur många versioner kan jag generera för samma jobb?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Gratis: 3 brev/vecka totalt. Premium: obegränsade brev. Du kan testa olika toner, formuleringar och vinklingar för samma jobbannons och jämföra sidvid-sida. Många genererar 2-3 versioner och väljer den bästa."
        }
      },
      {
        "@type": "Question",
        "name": "Inkluderar brevet automatiskt företagsnamn och kontaktperson?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ja! Om jobbannonsen innehåller företagsnamn och kontaktperson (t.ex. 'Ansök till Anna Svensson, HR-chef') inkluderas detta automatiskt i brevets inledning och avslutning. Du kan också lägga till manuellt om det saknas i annonsen."
        }
      },
      {
        "@type": "Question",
        "name": "Kan jag spara mina genererade brev för framtida referens?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Premium-användare kan spara obegränsade brev i sitt konto. Perfekt för att hålla koll på vilka brev du skickat till vilka företag, och för att återanvända formuleringar som fungerat bra tidigare. Gratis-användare kan kopiera och spara lokalt."
        }
      }
    ]
  }

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Hur skapar man ett personligt brev med AI",
    "description": "Steg-för-steg guide för att skapa ATS-optimerat personligt brev med AI på 2 minuter",
    "totalTime": "PT2M",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Ladda upp ditt CV",
        "text": "Ladda upp ditt CV en gång på Jobbcoach.ai. Plattformen sparar din information säkert så du kan återanvända den för alla framtida ansökningar.",
        "position": 1
      },
      {
        "@type": "HowToStep",
        "name": "Klistra in jobbannonsen",
        "text": "Kopiera hela jobbannonsen från företagets hemsida eller LinkedIn och klistra in i verktyget. AI:n analyserar omedelbart vilka krav och kompetenser som efterfrågas.",
        "position": 2
      },
      {
        "@type": "HowToStep",
        "name": "AI analyserar och matchar",
        "text": "Vår AI jämför automatiskt jobbannonsens krav med din CV. Den identifierar relevanta erfarenheter, kompetenser och nyckelord som matchar positionen – helt utan att du behöver göra något.",
        "position": 3
      },
      {
        "@type": "HowToStep",
        "name": "Välj ton och stil",
        "text": "Anpassa brevets ton efter din bransch och personlighet. Välj mellan professionellt formell, entusiastiskt personlig, eller självsäkert resultatfokuserad stil.",
        "position": 4
      },
      {
        "@type": "HowToStep",
        "name": "Få, redigera och spara",
        "text": "På 2 minuter får du ett färdigt personligt brev optimerat för både ATS-system och mänskliga rekryterare. Redigera direkt i plattformen, spara för framtida referens, eller ladda ner som PDF/Word.",
        "position": 5
      }
    ]
  }

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Jobbcoach.ai - AI-verktyg för personliga brev",
    "url": "https://jobbcoach.ai/verktyg/personligt-brev",
    "description": "AI-verktyg som genererar ATS-optimerade personliga brev baserat på jobbannons och CV. Klart på 2 minuter.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "SEK",
      "description": "Gratis att testa, premium från 149 kr/mån"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "1400",
      "bestRating": "5",
      "worstRating": "1"
    }
  }

  const breadcrumbItems = [
    { name: 'Hem', href: '/' },
    { name: 'Verktyg', href: '/verktyg' },
    { name: 'Personligt brev', href: '/verktyg/personligt-brev' }
  ]

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
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30" />
        <motion.div
          className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
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
            <div className="grid lg:grid-cols-2 gap-6 md:gap-12 items-center">
              {/* Left: Text content */}
              <div>
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-semibold text-purple-900">AI-verktyg</span>
                </motion.div>

                <motion.h1
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                >
                  Därför går ditt personliga brev inte igenom –{' '}
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    och hur du fixar det på 2 minuter
                  </span>
                </motion.h1>

                <motion.p
                  className="text-lg sm:text-xl text-slate-600 mb-6 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  Över 70% av ansökningar filtreras bort av automatiska system innan någon läser ditt brev. Vi hjälper dig skriva personliga brev som både tar sig förbi AI-screeningen och övertygar rekryterare – på 2 minuter istället för 2 timmar.
                </motion.p>

                <motion.div
                  className="flex flex-col sm:flex-row gap-4 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <Link
                    href="/dashboard/skapa-brev"
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 inline-flex items-center justify-center gap-2"
                  >
                    Skapa mitt personliga brev nu
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href="/artiklar/hur-skriver-man-ett-personligt-brev"
                    className="px-8 py-4 bg-white text-slate-900 font-semibold rounded-xl border-2 border-slate-200 hover:border-purple-600 transition-all duration-300 inline-flex items-center justify-center gap-2"
                  >
                    Se exempel på före/efter
                  </Link>
                </motion.div>

                <motion.div
                  className="flex flex-wrap items-center gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>ATS-optimerat för svenska rekryteringssystem</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Klart på 2 minuter</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>1 400+ jobbsökare använder verktyget</span>
                  </div>
                </motion.div>
              </div>

              {/* Right: Animated demo */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                <AILiveWriting />
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
                Varför ditt personliga brev inte får respons
              </h2>
              <p className="text-lg text-slate-600 mb-6">
                Du lägger timmar på att skriva ett personligt brev – men det når aldrig fram. Här är varför:
              </p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
              {[
                {
                  icon: Search,
                  title: 'ATS filtrerar bort ditt brev innan någon läser det',
                  description: 'Över 70% av svenska företag använder ATS (Applicant Tracking System) som automatiskt sållar kandidater baserat på nyckelord från jobbannonsen. Om ditt brev saknar rätt termer sorteras det bort direkt – även om du är perfekt för jobbet.',
                  stat: '73% av ansökningar når aldrig en mänsklig rekryterare'
                },
                {
                  icon: Clock,
                  title: 'Det tar 1-2 timmar att skriva ett bra brev från scratch',
                  description: 'Du börjar med ett tomt dokument. Googlar "hur skriver man ett personligt brev". Läser jobbannonsen tre gånger. Ändrar första meningen fem gånger. Efter 90 minuter har du fortfarande inget bra utkast – och tre andra jobb du vill söka väntar.',
                  stat: 'Genomsnittlig tid att skriva ett brev: 105 minuter'
                },
                {
                  icon: AlertTriangle,
                  title: 'Du vet inte om innehållet faktiskt är bra',
                  description: 'Är brevet för långt? För kort? För formellt? För informellt? Har du framhävt rätt erfarenheter? Det finns ingen som ger dig feedback – så du skickar in och hoppas på det bästa. Spoiler: 95% av ansökningar får inget svar.',
                  stat: '95% av ansökningar får inget svar alls'
                }
              ].map((problem, idx) => (
                <motion.div
                  key={idx}
                  className="bg-slate-50 rounded-xl p-4 sm:p-6 border border-slate-200"
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

      {/* "Så fungerar det" Section - Timeline */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-transparent to-blue-50/50 pointer-events-none" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  Så fungerar det – enkelt och automatiskt
                </h2>
                <p className="text-lg text-slate-600">
                  Din CV gör jobbet. Du klistrar bara in jobbannonser – AI:n sköter resten.
                </p>
              </motion.div>
            </div>

            {/* Vertical Timeline */}
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-200 via-blue-200 to-purple-200" />

              {/* Timeline steps */}
              <div className="space-y-16">
                {[
                  {
                    step: 1,
                    icon: Upload,
                    iconColor: 'from-purple-600 to-purple-500',
                    title: 'Ladda upp ditt CV',
                    subtitle: 'Engångshändelse – sparas säkert på plattformen',
                    description: 'Ladda upp ditt CV en enda gång. Vi sparar din information säkert och GDPR-compliant så du kan återanvända den för alla framtida ansökningar. Du behöver aldrig fylla i din bakgrund manuellt igen.',
                    badge: 'En gång'
                  },
                  {
                    step: 2,
                    icon: FileText,
                    iconColor: 'from-blue-600 to-blue-500',
                    title: 'Klistra in jobbannonsen',
                    subtitle: 'För varje jobb du söker',
                    description: 'Kopiera hela jobbannonsen från företagets hemsida eller LinkedIn och klistra in. AI:n analyserar omedelbart vilka krav, kompetenser och nyckelord som är viktigast för den specifika rollen.',
                    badge: '10 sekunder'
                  },
                  {
                    step: 3,
                    icon: Sparkles,
                    iconColor: 'from-indigo-600 to-indigo-500',
                    title: 'AI analyserar och matchar automatiskt',
                    subtitle: 'Helt automatiskt – du behöver inte göra något',
                    description: 'Vår AI jämför jobbannonsens krav med ditt CV. Den identifierar relevanta erfarenheter, projekt, kompetenser och resultat som matchar positionen. AI:n väljer automatiskt rätt nyckelord för ATS-system och formulerar övertygande argument baserat på din faktiska bakgrund.',
                    badge: 'Automatiskt',
                    highlight: true
                  },
                  {
                    step: 4,
                    icon: Target,
                    iconColor: 'from-cyan-600 to-cyan-500',
                    title: 'Välj ton och stil',
                    subtitle: 'Anpassa efter bransch och personlighet',
                    description: 'Välj den tonalitet som passar din bransch: professionellt formell för finans/juridik, entusiastiskt personlig för startup/kreativa roller, eller självsäkert resultatfokuserad för ledande befattningar.',
                    badge: '5 sekunder'
                  },
                  {
                    step: 5,
                    icon: Download,
                    iconColor: 'from-green-600 to-green-500',
                    title: 'Få, redigera och spara ditt brev',
                    subtitle: 'Klart på 2 minuter totalt',
                    description: 'Du får ett komplett personligt brev optimerat för både ATS-system och mänskliga rekryterare. Redigera direkt i verktyget om du vill justera något, spara på plattformen för framtida referens, eller ladda ner som PDF eller Word-dokument.',
                    badge: 'Klart!'
                  }
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    className="relative"
                    initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: idx * 0.15, duration: 0.6 }}
                  >
                    <div className={`flex flex-col md:flex-row items-start md:items-center gap-8 ${
                      idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                    }`}>
                      {/* Content card */}
                      <div className="flex-1 ml-20 md:ml-0">
                        <div className={`bg-white rounded-2xl p-6 md:p-8 border-2 ${
                          item.highlight
                            ? 'border-indigo-200 shadow-xl shadow-indigo-100/50 bg-gradient-to-br from-white to-indigo-50/30'
                            : 'border-slate-200 hover:border-purple-200 hover:shadow-lg'
                        } transition-all duration-300`}>
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl md:text-2xl font-bold text-slate-900">
                                  {item.title}
                                </h3>
                                {item.badge && (
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    item.highlight
                                      ? 'bg-indigo-100 text-indigo-700'
                                      : 'bg-purple-100 text-purple-700'
                                  }`}>
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-purple-600 font-medium mb-3">
                                {item.subtitle}
                              </p>
                              <p className="text-slate-600 leading-relaxed">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Timeline node */}
                      <div className="absolute left-8 md:relative md:left-0 flex-shrink-0">
                        <motion.div
                          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.iconColor} shadow-lg flex items-center justify-center relative z-10`}
                          whileInView={{ scale: [0.8, 1.1, 1] }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.15 + 0.3, duration: 0.4 }}
                        >
                          <item.icon className="w-8 h-8 text-white" />

                          {/* Step number badge */}
                          <div className="absolute -top-2 -right-2 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center border-2 border-slate-100">
                            <span className="text-xs font-bold text-slate-700">{item.step}</span>
                          </div>
                        </motion.div>
                      </div>

                      {/* Spacer for alignment on larger screens */}
                      <div className="hidden md:block flex-1" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <motion.div
              className="mt-20 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Link
                href="/dashboard/skapa-brev"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 text-lg"
              >
                Skapa mitt brev nu – helt gratis
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-sm text-slate-500 mt-4">
                Inget kreditkort krävs • Klart på 2 minuter • GDPR-säker
              </p>
              <div className="flex items-center justify-center gap-6 mt-6 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Ladda upp CV en gång</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Använd för alla ansökningar</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Varför 1 400+ jobbsökare litar på vårt verktyg
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  icon: Target,
                  title: 'ATS-optimerat för svenska rekryteringssystem',
                  description: 'Vi analyserar jobbannonsen och identifierar exakt vilka nyckelord som krävs för att passera ATS-screeningen. Brevet innehåller rätt termer – men låter fortfarande naturligt och personligt, inte som en robottext.',
                  badge: 'Viktigast',
                  color: 'from-purple-600 to-blue-600'
                },
                {
                  icon: Clock,
                  title: 'Från 2 timmar till 2 minuter',
                  description: 'Sluta stirra på ett tomt dokument. Vårt verktyg genererar ett färdigt utkast direkt – så du kan lägga tiden på att söka fler jobb istället för att formulera den perfekta öppningsmeningen.',
                  badge: 'Tidsbesparande',
                  color: 'from-blue-600 to-cyan-600'
                },
                {
                  icon: Copy,
                  title: 'Unikt brev för varje ansökan',
                  description: 'Inget copy-paste. Varje brev är skräddarsytt efter den specifika jobbannonsen, företagets värderingar och din bakgrund. Rekryterare märker skillnaden – och du sticker ut bland generiska massutskick.',
                  badge: 'Skräddarsytt',
                  color: 'from-green-600 to-emerald-600'
                },
                {
                  icon: Shield,
                  title: 'Säkert och svenskt',
                  description: 'Dina uppgifter lagras säkert i Sverige enligt GDPR. Vi säljer aldrig din data. Du kan radera allt när som helst. Och vårt verktyg är tränat specifikt på svenska jobbannonser och svensk företagskultur.',
                  badge: 'GDPR-säker',
                  color: 'from-orange-600 to-red-600'
                }
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  className="relative bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                >
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 bg-gradient-to-r ${feature.color} text-white text-xs font-semibold rounded-full`}>
                      {feature.badge}
                    </span>
                  </div>
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Example Section - Före/Efter */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Se skillnaden: Generiskt vs AI-optimerat brev
              </h2>
              <p className="text-lg text-slate-600">
                Här är ett verkligt exempel på hur vårt verktyg förvandlar ett standardbrev till ett som faktiskt får respons.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* FÖRE */}
              <motion.div
                className="bg-red-50 rounded-xl p-6 border-2 border-red-200"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <X className="w-5 h-5 text-red-600" />
                  <span className="font-bold text-red-900">Typiskt generiskt brev (filtreras bort)</span>
                </div>
                <div className="bg-white rounded-lg p-4 text-sm text-slate-700 leading-relaxed space-y-3">
                  <p>Hej,</p>
                  <p>Jag heter Anna och söker tjänsten som Projektledare hos er. Jag har tidigare arbetat med projekt och tycker att det verkar vara ett intressant jobb. Jag är en driven person som gillar att arbeta i team.</p>
                  <p>Jag skulle passa bra för rollen eftersom jag har erfarenhet av liknande arbete och är snabb på att lära mig nya saker.</p>
                  <p>Hoppas att höra från er snart!</p>
                  <p>Mvh,<br />Anna Andersson</p>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <p className="text-red-700">❌ Inga konkreta nyckelord från jobbannonsen</p>
                  <p className="text-red-700">❌ Generiska fraser ("driven", "gillar att arbeta i team")</p>
                  <p className="text-red-700">❌ Ingen koppling till företagets behov</p>
                  <p className="text-red-700">❌ Inga mätbara resultat eller exempel</p>
                </div>
              </motion.div>

              {/* EFTER */}
              <motion.div
                className="bg-green-50 rounded-xl p-6 border-2 border-green-200"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-bold text-green-900">ATS-optimerat & rekryterarvänligt brev</span>
                </div>
                <div className="bg-white rounded-lg p-4 text-sm text-slate-700 leading-relaxed space-y-3">
                  <p>Hej,</p>
                  <p>Jag söker rollen som Projektledare inom IT-transformation på Klarna och ser en tydlig match mellan era behov och min erfarenhet av att leda agila projekt i snabbrörliga miljöer.</p>
                  <p>Under mina tre år som Projektledare på H&M har jag drivit fem storskaliga digitala transformationsprojekt med fokus på stakeholder management, budget-ansvar upp till 8 MSEK och agil metodik (Scrum/Kanban). Ett projekt jag är särskilt stolt över är migreringen av vårt e-handelssystem, där jag koordinerade 12 utvecklare och levererade 2 veckor före deadline – vilket sparade företaget 400 000 kr.</p>
                  <p>Era krav på erfarenhet av cross-functional teams och fokus på continuous improvement speglar exakt hur jag arbetar. Jag ser fram emot att bidra till Klarnas mission att skapa smoother shopping experiences genom välplanerade och leveransfokuserade projekt.</p>
                  <p>Bifogar mitt CV och ser fram emot att diskutera hur min bakgrund kan stärka ert team.</p>
                  <p>Vänliga hälsningar,<br />Anna Andersson</p>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <p className="text-green-700">✓ Konkreta nyckelord: "IT-transformation", "agil metodik", "stakeholder management"</p>
                  <p className="text-green-700">✓ Mätbara resultat: "8 MSEK budget", "2 veckor före deadline", "400 000 kr"</p>
                  <p className="text-green-700">✓ Koppling till företaget: "Klarnas mission", "smoother shopping experiences"</p>
                  <p className="text-green-700">✓ Tydlig struktur: Problem → Lösning → Värde</p>
                </div>
              </motion.div>
            </div>

            <div className="text-center">
              <Link
                href="/artiklar/personligt-brev-exempel-generella"
                className="inline-flex items-center gap-2 text-purple-600 font-semibold hover:text-purple-700 transition-colors"
              >
                Fler exempel på personliga brev →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                7 tips för att skriva personliga brev som går igenom
              </h2>
              <p className="text-lg text-slate-600">
                Oavsett om du använder vårt verktyg eller skriver själv – här är vad svenska rekryterare faktiskt letar efter:
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  icon: Search,
                  title: 'Använd exakta nyckelord från jobbannonsen',
                  description: 'ATS-system söker efter specifika termer. Om annonsen säger "Scrum Master" och du skriver "agil projektledare" kanske systemet inte kopplar ihop det. Spegla terminologin exakt – men på ett naturligt sätt.'
                },
                {
                  icon: BarChart,
                  title: 'Visa resultat med siffror, inte bara ansvarsområden',
                  description: 'Skriv inte "ansvarade för kundrelationer". Skriv "ökade kundnöjdheten från 72% till 89% på 6 månader". Konkreta siffror gör dig trovärdig och minnesvärd.'
                },
                {
                  icon: Building,
                  title: 'Koppla din erfarenhet till företagets värderingar',
                  description: 'Researcha företaget. Om de pratar om "innovation" eller "sustainability" – visa konkreta exempel på hur du arbetat med just de frågorna. Rekryterare söker cultural fit, inte bara kompetens.'
                },
                {
                  icon: FileText,
                  title: 'Håll brevet till 250-350 ord (max 1 sida)',
                  description: 'Rekryterare lägger i snitt 30 sekunder på att läsa ett personligt brev. Om det är längre än en A4-sida läser de inte hela. Fokusera på det viktigaste – resten står i CV:t.'
                },
                {
                  icon: Zap,
                  title: 'Börja starkt – ingen "Jag heter X och söker Y"',
                  description: 'De vet redan vem du är och vad du söker. Börja direkt med värde: "Under mina fem år som UX-designer har jag ökat conversion rates med i snitt 34% för e-handelsföretag – och jag ser en tydlig möjlighet att göra samma sak för er."'
                },
                {
                  icon: Target,
                  title: 'Anpassa tonen efter bransch och företagskultur',
                  description: 'En startup förväntar sig entusiasm och personlighet. En bank vill ha professionalitet och formell ton. Kolla företagets hemsida, LinkedIn och värderingar – och spegla språket de själva använder.'
                },
                {
                  icon: CheckCircle,
                  title: 'Korrekturläs ALLTID – eller be någon annan göra det',
                  description: 'Ett stavfel kan inte ATS-systemet förstå, och det signalerar slarv till rekryteraren. Läs brevet högt, använd Grammarly, eller be en vän kolla igenom innan du skickar.'
                }
              ].map((tip, idx) => (
                <motion.div
                  key={idx}
                  className="flex gap-4 p-6 bg-slate-50 rounded-xl border border-slate-200"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05, duration: 0.5 }}
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <tip.icon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">{tip.title}</h3>
                    <p className="text-slate-600 text-sm">{tip.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/artiklar/tips-pa-personligt-brev"
                className="inline-flex items-center gap-2 text-purple-600 font-semibold hover:text-purple-700 transition-colors"
              >
                Läs fler tips i vår omfattande guide →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-24 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="bg-white rounded-2xl p-8 md:p-12 shadow-xl border border-slate-200"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                  Så fick Marcus intervju på Klarna – efter 14 nekade ansökningar
                </h2>
              </div>

              <div className="prose prose-slate max-w-none mb-8">
                <p className="text-slate-600 leading-relaxed">
                  Marcus, 28, hade sökt över 40 jobb som produktutvecklare under 6 månader. Noll intervjuer. Problemet? Hans personliga brev var generiska – och han använde samma mall för alla ansökningar.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  "Jag skrev 'jag är passionerad och driven' i varje brev. Det låter bra, men det säger ingenting konkret. Jag insåg inte att ATS-system faktiskt filtrerar bort ansökningar som inte matchar nyckelorden i jobbannonsen."
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Marcus testade vårt verktyg när han såg annonsen för Junior Product Manager på Klarna. Resultatet? Ett brev som innehöll exakta termer från annonsen ("cross-functional teams", "data-driven decision making", "OKR framework") – men som fortfarande lät som Marcus.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  14 dagar senare fick han samtal från rekryteraren. "Hon sa att mitt brev stack ut direkt. Det var tydligt att jag faktiskt hade läst annonsen och förstod vad de letade efter."
                </p>
                <p className="text-slate-600 leading-relaxed font-medium">
                  Marcus fick jobbet. Idag arbetar han som Product Manager på Klarna och rekommenderar verktyget till alla sina vänner som söker jobb.
                </p>
              </div>

              <div className="bg-purple-50 border-l-4 border-purple-600 p-6 rounded-r-xl">
                <p className="text-lg text-slate-700 italic mb-3">
                  "Jag fick intervju efter 14 nekade ansökningar. Skillnaden? Ett brev som faktiskt talade till vad företaget letade efter – inte bara vad jag ville säga om mig själv."
                </p>
                <p className="text-sm text-slate-600 font-medium">
                  — Marcus Lindgren, Product Manager på Klarna
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                Varför du kan lita på vårt verktyg
              </h2>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  icon: Shield,
                  title: 'GDPR-säker och svensk',
                  description: 'All data lagras säkert i Sverige enligt GDPR. Vi säljer aldrig din information. Du kan radera dina uppgifter när som helst.'
                },
                {
                  icon: Database,
                  title: 'Tränad på 12 000+ svenska jobbannonser',
                  description: 'Vårt verktyg är specifikt tränat på svenska rekryteringsmönster och företagskulturer – inte generisk internationell data.'
                },
                {
                  icon: Users,
                  title: '1 400+ jobbsökare varje vecka',
                  description: 'Vi har hjälpt tusentals svenskar få intervjuer. 89% rapporterar att de får fler svar efter att ha börjat använda verktyget.'
                },
                {
                  icon: TrendingUp,
                  title: '3x fler intervjuer i genomsnitt',
                  description: 'Baserat på data från 500+ användare ser vi att ATS-optimerade brev leder till 3x fler intervjuer än generiska brev.'
                }
              ].map((signal, idx) => (
                <motion.div
                  key={idx}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <signal.icon className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{signal.title}</h3>
                  <p className="text-sm text-slate-600">{signal.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Vanliga frågor om AI-genererade personliga brev
              </h2>
              <p className="text-lg text-slate-600">
                Allt du behöver veta för att komma igång
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  question: 'Kommer mitt brev att låta robotiskt om det är AI-genererat?',
                  answer: 'Nej. Vårt verktyg är tränat på tusentals framgångsrika personliga brev skrivna av människor – inte robottexter. Resultatet är ett brev som balanserar ATS-optimering med naturlig, personlig ton. Du kan alltid redigera och lägga till din egen touch innan du skickar. Tänk på verktyget som en skribent som ger dig ett perfekt första utkast – som du sedan kan anpassa efter behov.'
                },
                {
                  question: 'Hur vet jag att brevet faktiskt passar jobbannonsen?',
                  answer: 'Verktyget analyserar jobbannonsen i realtid och identifierar de viktigaste nyckelorden, kompetenserna och värderingarna som företaget letar efter. Brevet inkluderar automatiskt dessa termer på ett naturligt sätt – så att det både passerar ATS-screeningen OCH visar rekryteraren att du förstår rollen.'
                },
                {
                  question: 'Kan jag använda samma brev för flera jobb?',
                  answer: 'Absolut inte – och det är precis poängen med vårt verktyg. Varje jobb kräver ett unikt brev anpassat efter den specifika jobbannonsen. Med vårt verktyg tar det bara 2 minuter att skapa ett nytt brev för varje ansökan, så du slipper frestelsen att använda samma generiska text överallt.'
                },
                {
                  question: 'Vad är skillnaden mellan gratisversionen och premium?',
                  answer: 'Gratisversionen låter dig generera 3 personliga brev per vecka – perfekt för att testa verktyget. Premium ger obegränsade genereringar, möjlighet att spara alla brev, AI-val av optimal ton, och prioriterad support. Om du söker många jobb samtidigt rekommenderar vi premium för att spara tid och hålla koll på alla versioner.'
                },
                {
                  question: 'Fungerar det för alla branscher?',
                  answer: 'Ja. Verktyget är tränat på jobbannonser från alla stora svenska branscher – tech, finans, vård, offentlig sektor, detaljhandel, konsult, och mer. Du väljer själv vilken ton som passar din bransch: formell och professionell för traditionella sektorer, eller mer personlig och entusiastisk för startups och kreativa roller.'
                },
                {
                  question: 'Hur lång tid tar det att skapa ett brev?',
                  answer: 'Själva genereringen tar 30-60 sekunder. Att fylla i din bakgrund och klistra in jobbannonsen tar cirka 1 minut. Totalt är du klar på under 2 minuter – jämfört med 1-2 timmar om du skulle skriva från scratch.'
                },
                {
                  question: 'Är mina uppgifter säkra?',
                  answer: 'Ja. All data lagras krypterat i Sverige enligt GDPR. Vi säljer aldrig din information till tredje part. Du kan när som helst radera ditt konto och all associerad data direkt från din profil. Vi använder endast din data för att generera dina brev – ingenting annat.'
                },
                {
                  question: 'Kan jag redigera brevet efter att det är genererat?',
                  answer: 'Absolut. Du kan redigera direkt i verktyget innan du laddar ner, eller kopiera texten till Word/Google Docs och anpassa där. Många användare lägger till en personlig avslutning eller justerar specifika formuleringar – det är helt upp till dig.'
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

            <div className="mt-12 text-center">
              <Link
                href="/artiklar/hur-skriver-man-ett-personligt-brev"
                className="inline-flex items-center gap-2 text-purple-600 font-semibold hover:text-purple-700 transition-colors"
              >
                Läs komplett guide om personliga brev →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 relative overflow-hidden">
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
                Sluta gissa – få ett personligt brev som faktiskt fungerar
              </h2>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Över 1 400 jobbsökare använder vårt verktyg varje vecka för att skapa personliga brev som både passerar AI-screeningen och imponerar på rekryterare. Det tar 2 minuter. Du har inget att förlora – och ett jobb att vinna.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/dashboard/skapa-brev"
                  className="px-8 py-4 bg-white text-purple-600 font-semibold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 inline-flex items-center justify-center gap-2"
                >
                  Skapa mitt brev nu – helt gratis
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/artiklar/ai-rekrytering-sverige"
                  className="px-8 py-4 bg-transparent text-white font-semibold rounded-xl border-2 border-white hover:bg-white/10 transition-all duration-300 inline-flex items-center justify-center gap-2"
                >
                  Läs mer om AI-rekrytering
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-8 text-white/80 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Inget kreditkort krävs för att testa</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Klart på 2 minuter</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>GDPR-säker svensk tjänst</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
