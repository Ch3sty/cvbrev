'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight, CheckCircle, Search, AlertTriangle, Clock,
  Target, Shield, Zap, Database, Users, TrendingUp,
  ChevronDown, X, MessageSquare, FileText, Scale, Lightbulb,
  BookOpen, Brain, Award, Sparkles
} from 'lucide-react'
import PremiumNavbar from '@/components/PremiumNavbar'
import JobbcoachenLiveDemo from '@/components/jobbcoachen/JobbcoachenLiveDemo'
import Breadcrumb from '@/components/Breadcrumb'

export default function JobbcoachenPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  // Schema.org markups
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Är svaren verkligen anpassade för svensk arbetsmarknad?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ja. Jobbcoachen är specifikt tränad på svenska källor – Arbetsförmedlingen, kollektivavtal, LAS, svenska karriärguider och fackförbund. Vi citerar inte amerikanska tips som inte fungerar här. Allt är anpassat efter svensk företagskultur och arbetsrätt."
        }
      },
      {
        "@type": "Question",
        "name": "Vad skiljer Jobbcoachen från ChatGPT?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "ChatGPT är generell och ger ofta internationella tips som inte stämmer i Sverige (t.ex. tips om 'resume' istället för CV). Jobbcoachen är specialiserad på svenska arbetsmarknaden – med aktuella regler om LAS, kollektivavtal, ATS-system, och intervjukultur. Vi citerar alltid källor så du kan verifiera informationen."
        }
      },
      {
        "@type": "Question",
        "name": "Är Jobbcoachen gratis?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Jobbcoachen ingår i vårt kostnadsfria baspaket. Du kan ställa upp till 25 frågor per månad helt gratis. Premium-medlemmar får obegränsade frågor, längre och mer detaljerade svar, samt prioriterad support."
        }
      },
      {
        "@type": "Question",
        "name": "Vilka frågor kan jag ställa?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Allt från CV-tips, intervjuförberedelse, löneförhandling, arbetsrätt (LAS, uppsägning, semester), omställning, LinkedIn-strategi, nätverkande, kompetensväxling, till branschspecifika karriärråd. Om det gäller din jobbsökning eller karriär i Sverige – fråga!"
        }
      },
      {
        "@type": "Question",
        "name": "Hur snabbt får jag svar?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Omedelbart. Svaret genereras på 5-15 sekunder beroende på hur komplex din fråga är. Inget väntetid, inga bokade möten. Ställ frågan när du behöver svaret – mitt i natten eller på lunchen."
        }
      },
      {
        "@type": "Question",
        "name": "Kan jag lita på svaren juridiskt?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Jobbcoachen ger generell vägledning baserad på svenska lagar och kollektivavtal. För specifika juridiska frågor eller tvister rekommenderar vi alltid att du kontaktar ditt fackförbund eller juridisk rådgivare. Vi citerar källor så du kan dubbelkolla informationen själv."
        }
      },
      {
        "@type": "Question",
        "name": "Sparas mina frågor?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ja, om du har ett konto sparas dina konversationer så du kan gå tillbaka och läsa gamla svar. All data lagras säkert i Sverige enligt GDPR. Du kan radera din historik när som helst. Vi använder aldrig dina frågor för att träna AI-modeller utan ditt samtycke."
        }
      },
      {
        "@type": "Question",
        "name": "Fungerar det för alla branscher?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ja. Jobbcoachen har kunskap om alla stora svenska branscher – tech, finans, vård, offentlig sektor, industri, detaljhandel, bygg, utbildning, och mer. Specificera din bransch i frågan så får du branschanpassade svar."
        }
      },
      {
        "@type": "Question",
        "name": "Kan jag få hjälp med en specifik jobbannons?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolut. Klistra in hela jobbannonsen i din fråga och be om tips – t.ex. 'Hur anpassar jag mitt CV för denna roll?' eller 'Vilka frågor bör jag förbereda för intervjun?'. Jobbcoachen analyserar annonsen och ger skräddarsydda råd."
        }
      },
      {
        "@type": "Question",
        "name": "Vad händer om jag inte är nöjd med svaret?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ställ en uppföljningsfråga eller formulera om din fråga mer specifikt. Jobbcoachen lär sig från konversationen. Om du fortfarande inte får ett bra svar kontaktar du vår support – vi hjälper dig hitta rätt information eller förbättrar verktyget baserat på din feedback."
        }
      }
    ]
  }

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Så använder du Jobbcoachen för att få karriärråd",
    "description": "Steg-för-steg guide för att få svar på dina karriärfrågor med AI-coach specialiserad på svensk arbetsmarknad",
    "totalTime": "PT2M",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Skapa ett gratis konto",
        "text": "Registrera dig på Jobbcoach.ai. Det tar 30 sekunder. Inga kortuppgifter krävs för att komma igång.",
        "position": 1
      },
      {
        "@type": "HowToStep",
        "name": "Öppna Jobbcoachen",
        "text": "Gå till Karriärguiden i din dashboard. Du ser en chattgränssnitt där du kan skriva dina frågor.",
        "position": 2
      },
      {
        "@type": "HowToStep",
        "name": "Ställ din fråga",
        "text": "Skriv din fråga i chattfältet. Var så specifik som möjligt – ju mer kontext du ger, desto bättre svar får du. Du kan klistra in jobbannonser, beskriva din situation, eller fråga om svenska arbetsrättsliga regler.",
        "position": 3
      },
      {
        "@type": "HowToStep",
        "name": "Få svar på sekunder",
        "text": "Jobbcoachen analyserar din fråga mot svenska källor och ger dig ett detaljerat svar på 5-15 sekunder. Varje svar innehåller källhänvisningar så du kan verifiera informationen.",
        "position": 4
      },
      {
        "@type": "HowToStep",
        "name": "Följ upp eller ställ nästa fråga",
        "text": "Om du behöver förtydligande, ställ en uppföljningsfråga. Jobbcoachen kommer ihåg kontexten från tidigare meddelanden i samma konversation. Du kan också starta en ny konversation för ett helt annat ämne.",
        "position": 5
      }
    ]
  }

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Jobbcoachen - AI-karriärguide för svensk arbetsmarknad",
    "url": "https://jobbcoach.ai/verktyg/jobbcoachen",
    "description": "AI-driven karriärcoach specialiserad på svenska arbetsmarknaden. Få svar på frågor om CV, intervjuer, lön, arbetsrätt och karriärutveckling – baserat på svenska källor.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "SEK",
      "description": "Gratis basversion med 25 frågor/månad, Premium från 149 kr/mån för obegränsade frågor"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.7",
      "reviewCount": "890",
      "bestRating": "5",
      "worstRating": "1"
    }
  }

  const breadcrumbItems = [
    { name: 'Hem', href: '/' },
    { name: 'Verktyg', href: '/verktyg' },
    { name: 'Jobbcoachen', href: '/verktyg/jobbcoachen' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Schema markups */}
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

      {/* HERO SECTION */}
      <section className="pt-32 pb-24 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-purple-50 pointer-events-none" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-7xl mx-auto">
            {/* IMPROVED: Flexbox instead of grid for better mobile control */}
            <div className="flex flex-col xl:flex-row xl:items-center gap-8 lg:gap-12">
              {/* Left: Text - ALWAYS FIRST on mobile/tablet */}
              <div className="flex-1 xl:max-w-xl">
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Brain className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-900">AI-Karriärguide</span>
                </motion.div>

                <motion.h1
                  className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-slate-900 mb-4 sm:mb-6 leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                >
                  Få svar på dina karriärfrågor – från någon som faktiskt kan svensk arbetsmarknad
                </motion.h1>

                <motion.p
                  className="text-base sm:text-lg lg:text-xl text-slate-600 mb-6 sm:mb-8 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  Sluta googla och få motsägelsefulla svar. Jobbcoachen är tränad på svenska källor – Arbetsförmedlingen, LAS, kollektivavtal och karriärexperter. Svar på sekunder, inte timmar av research.
                </motion.p>

                <motion.div
                  className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <Link
                    href="/register"
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 inline-flex items-center justify-center gap-2 text-base sm:text-lg min-h-[48px]"
                  >
                    Ställ din första fråga gratis
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href="#exempel"
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-slate-900 font-semibold rounded-xl border-2 border-slate-200 hover:border-blue-600 transition-all duration-300 inline-flex items-center justify-center gap-2 text-base sm:text-lg min-h-[48px]"
                  >
                    Se exempel på frågor
                  </Link>
                </motion.div>

                <motion.div
                  className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>Byggd på svenska källor</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>Svar på sekunder</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>Allt från CV till arbetsrätt</span>
                  </div>
                </motion.div>
              </div>

              {/* Right: Demo - Shows AFTER text on mobile/tablet */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="flex-1 xl:max-w-2xl"
              >
                <JobbcoachenLiveDemo />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Känner du igen dig?
              </h2>
              <p className="text-lg text-slate-600">
                Därför tar det evigheter att hitta rätt svar på dina karriärfrågor
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Search,
                  title: 'Alla säger olika saker om hur man ska söka jobb',
                  description: 'Google ger 50 olika svar. LinkedIn-influencers pratar om amerikanska metoder. Dina föräldrar säger en sak, din kompis en annan. Du vet inte vem du ska lita på – och slösar timmar på att sålla bland motstridiga råd som kanske inte ens gäller i Sverige.',
                },
                {
                  icon: AlertTriangle,
                  title: 'Karriärcoacher kostar 1500-3000 kr per timme',
                  description: 'En professionell karriärcoach är för dyr för de flesta. Du har frågor varje vecka – om CV, intervjuer, löneförhandling, omställning – men har inte råd med 20 000 kr i rådgivning. Samtidigt finns ingen gratis hjälp som faktiskt är pålitlig och anpassad för Sverige.',
                },
                {
                  icon: Clock,
                  title: 'Utländska tips funkar inte här',
                  description: 'ChatGPT och amerikanska artiklar ger dig råd om "resume", "cover letters" och löneförhandlingar i dollar. Men i Sverige har vi CV, personliga brev, kollektivavtal och LAS. Hälften av tipsen är direkt felaktiga – och du märker det först när du redan gjort bort dig på intervjun.',
                }
              ].map((problem, idx) => (
                <motion.div
                  key={idx}
                  className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:border-red-300 hover:shadow-lg transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                >
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                    <problem.icon className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{problem.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{problem.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SOLUTION SECTION - Timeline */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  Så fungerar Jobbcoachen – enkelt och direkt
                </h2>
                <p className="text-lg text-slate-600">
                  Från fråga till svar på sekunder. Ingen research, inget gissande.
                </p>
              </motion.div>
            </div>

            {/* Vertical Timeline */}
            <div className="relative">
              {/* Timeline line - only visible on desktop */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-blue-200" />

              {/* Timeline steps */}
              <div className="space-y-8 md:space-y-16">
                {[
                  {
                    step: 1,
                    icon: MessageSquare,
                    iconColor: 'from-blue-600 to-blue-500',
                    title: 'Ställ din fråga',
                    subtitle: 'Precis som att chatta med en expert',
                    description: 'Skriv din fråga i vanlig text – om CV, intervjuer, arbetsrätt, löneförhandling, eller karriärutveckling. Inget formulär att fylla i. Bara ställ frågan som du skulle gjort till en vän.',
                    badge: '10 sekunder'
                  },
                  {
                    step: 2,
                    icon: Database,
                    iconColor: 'from-purple-600 to-purple-500',
                    title: 'AI:n söker i svenska källor',
                    subtitle: 'Arbetsförmedlingen, fackförbund, LAS och karriärexperter',
                    description: 'Jobbcoachen analyserar din fråga och letar upp relevant information från Arbetsförmedlingen, Unionen, LAS-regler, kollektivavtal och svenska karriärguider. Allt är anpassat för svensk arbetsmarknad – inga generiska internationella tips.',
                    badge: 'Automatiskt',
                    highlight: true
                  },
                  {
                    step: 3,
                    icon: Sparkles,
                    iconColor: 'from-indigo-600 to-indigo-500',
                    title: 'Få ett konkret, verifierat svar',
                    subtitle: 'Med källhänvisningar så du kan dubbelkolla',
                    description: 'Du får ett tydligt svar på 5-15 sekunder. Varje svar innehåller källor – länkar till Arbetsförmedlingen, fackförbund eller officiella guider – så du kan verifiera informationen själv. Inget gissande, bara fakta.',
                    badge: '5-15 sekunder'
                  },
                  {
                    step: 4,
                    icon: TrendingUp,
                    iconColor: 'from-green-600 to-green-500',
                    title: 'Följ upp eller ställ nästa fråga',
                    subtitle: 'Obegränsade uppföljningar i samma konversation',
                    description: 'Om du behöver förtydligande, ställ en ny fråga direkt. Jobbcoachen kommer ihåg kontexten. Du kan också spara konversationen och komma tillbaka senare – perfekt när du förbereder dig inför en intervju eller löneförhandling.',
                    badge: 'Obegränsat'
                  },
                  {
                    step: 5,
                    icon: Award,
                    iconColor: 'from-blue-600 to-cyan-600',
                    title: 'Använd svaret i din jobbsökning',
                    subtitle: 'Konkreta tips du kan applicera direkt',
                    description: 'Alla svar är utformade för att vara handlingsbara. Inget vagt "var dig själv"-prat. Du får konkreta steg, mallar, formuleringar och strategier som funkar på svenska arbetsmarknaden. Använd det samma dag.',
                    badge: 'Klart!'
                  }
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    className="relative"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                  >
                    {/* Mobile: Simple vertical cards */}
                    <div className="md:hidden">
                      <div className={`bg-white rounded-2xl p-6 border-2 ${
                        item.highlight
                          ? 'border-purple-200 shadow-xl shadow-purple-100/50 bg-gradient-to-br from-white to-purple-50/30'
                          : 'border-slate-200'
                      }`}>
                        {/* Mobile header with icon and step */}
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.iconColor} shadow-lg flex items-center justify-center flex-shrink-0`}>
                            <item.icon className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-bold text-slate-500">Steg {item.step}</span>
                              {item.badge && (
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  item.highlight
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">
                              {item.title}
                            </h3>
                          </div>
                        </div>
                        <p className="text-sm text-blue-600 font-medium mb-3">
                          {item.subtitle}
                        </p>
                        <p className="text-slate-600 leading-relaxed text-sm">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Desktop: Traditional timeline layout */}
                    <div className={`hidden md:flex items-center gap-8 ${
                      idx % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                    }`}>
                      {/* Content card */}
                      <div className="flex-1">
                        <div className={`bg-white rounded-2xl p-8 border-2 ${
                          item.highlight
                            ? 'border-purple-200 shadow-xl shadow-purple-100/50 bg-gradient-to-br from-white to-purple-50/30'
                            : 'border-slate-200 hover:border-blue-200 hover:shadow-lg'
                        } transition-all duration-300`}>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold text-slate-900">
                              {item.title}
                            </h3>
                            {item.badge && (
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                item.highlight
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-blue-600 font-medium mb-3">
                            {item.subtitle}
                          </p>
                          <p className="text-slate-600 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Timeline node */}
                      <div className="flex-shrink-0">
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

                      {/* Spacer for alignment */}
                      <div className="flex-1" />
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
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 text-lg"
              >
                Prova Jobbcoachen gratis
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-sm text-slate-500 mt-4">
                25 frågor/månad gratis • Inga kortuppgifter • Svar på sekunder
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="exempel" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Allt du behöver veta om svensk jobbsökning – på ett ställe
              </h2>
              <p className="text-lg text-slate-600">
                Från CV-tips till arbetsrätt. Allt baserat på svenska källor och regler.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  icon: FileText,
                  title: 'CV och personliga brev',
                  description: 'Hur skriver man ett ATS-optimerat CV? Vilka avsnitt ska finnas? Hur lång ska texten vara? Ska jag ha foto? Hur anpassar jag för olika branscher? Få konkreta mallar och exempel – anpassade för svensk arbetsmarknad.',
                  examples: ['ATS-optimering', 'Personligt brev', 'LinkedIn-profil'],
                  color: 'from-blue-600 to-blue-500'
                },
                {
                  icon: MessageSquare,
                  title: 'Intervjuförberedelse',
                  description: 'Vilka frågor ställs på svenska intervjuer? Hur svarar jag på "Berätta om dig själv"? Vad ska jag fråga arbetsgivaren? Hur klär jag mig? Hur följer jag upp efter intervjun? Få branschspecifika tips som faktiskt funkar i Sverige.',
                  examples: ['Vanliga frågor', 'Klädkod', 'Uppföljning'],
                  color: 'from-purple-600 to-purple-500'
                },
                {
                  icon: TrendingUp,
                  title: 'Löneförhandling',
                  description: 'Vad är rimlig lön för min roll? Hur förhandlar jag utan att verka girig? När ska jag ta upp lönefrågan? Vad gör jag om de erbjuder för lite? Baserat på svenska kollektivavtal, SCB-statistik och förhandlingsexperter.',
                  examples: ['Lönestatistik', 'Förhandlingstaktik', 'Kollektivavtal'],
                  color: 'from-green-600 to-green-500'
                },
                {
                  icon: Scale,
                  title: 'Arbetsrätt och LAS',
                  description: 'Vad gäller vid uppsägning? Hur lång är min uppsägningstid? Har jag rätt till semester? Vad är turordningsregler? Kan jag säga upp mig under sjukskrivning? Få klara svar baserade på LAS och svenska lagar – inga gissningar.',
                  examples: ['Uppsägning', 'LAS-regler', 'Kollektivavtal'],
                  color: 'from-orange-600 to-red-600'
                }
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  className="bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed mb-4">{feature.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {feature.examples.map((example, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-700"
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL / CASE STUDY */}
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
                  Så fick Emma rätt lön – efter att ha varit underbetalad i 2 år
                </h2>
              </div>

              <div className="prose prose-slate max-w-none mb-8">
                <p className="text-slate-600 leading-relaxed">
                  Emma, 31, var produktägare på ett techföretag i Stockholm. Hon gillade jobbet – men misstänkte att hon tjänade mindre än sina manliga kollegor med samma ansvar.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  "Jag ville förhandla om högre lön, men var livrädd för att verka girig eller att det skulle påverka min relation med chefen. Jag hade ingen aning om vad som var rimlig lön, eller hur jag skulle lägga upp argumentationen."
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Emma frågade Jobbcoachen: <em>"Hur förhandlar jag om högre lön som produktägare med 5 års erfarenhet i Stockholm?"</em>
                </p>
                <p className="text-slate-600 leading-relaxed">
                  På 10 sekunder fick hon: aktuell lönestatistik från SCB för hennes roll, en steg-för-steg guide för lönesamtalet, och konkreta formuleringar hon kunde använda. Jobbcoachen förklarade också att hon hade rätt att be om lönerevision enligt kollektivavtalet – något hon inte visste.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Emma bokade möte med sin chef, använde argumentationen från Jobbcoachen, och visade SCB-statistiken. Resultatet? 8 000 kr mer i månaden.
                </p>
                <p className="text-slate-600 leading-relaxed font-medium">
                  "Jag hade inte vågat fråga utan Jobbcoachen. Att ha konkreta siffror och veta exakt vad jag kunde begära gjorde att jag gick in självsäker istället för nervös. Det var värt varenda krona."
                </p>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-xl">
                <p className="text-lg text-slate-700 italic mb-3">
                  "Jag fick 8 000 kr mer i månaden tack vare Jobbcoachen. Det är 96 000 kr om året – för 10 minuters research."
                </p>
                <p className="text-sm text-slate-600 font-medium">
                  — Emma Bergström, Produktägare
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* TRUST SIGNALS */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                Varför du kan lita på Jobbcoachen
              </h2>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  icon: Shield,
                  title: 'Byggd på svenska källor',
                  description: 'Alla svar baseras på Arbetsförmedlingen, fackförbund, LAS, SCB och svenska karriärexperter. Inga amerikanska tips som inte funkar här.'
                },
                {
                  icon: Database,
                  title: 'Alltid uppdaterad information',
                  description: 'Vi uppdaterar kontinuerligt med nya lagar, kollektivavtal och arbetsmarknadsdata. Du får aldrig utdaterade råd.'
                },
                {
                  icon: Users,
                  title: '890+ användare varje vecka',
                  description: 'Hundratals jobbsökare och karriärbytare använder Jobbcoachen för att få hjälp med sina frågor. Proven concept.'
                },
                {
                  icon: Lightbulb,
                  title: 'Källhänvisningar på varje svar',
                  description: 'Vi citerar alltid våra källor. Du kan dubbelkolla all information själv – inget gissande eller vaga råd.'
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
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <signal.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{signal.title}</h3>
                  <p className="text-sm text-slate-600">{signal.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Vanliga frågor om Karriärguiden
              </h2>
              <p className="text-lg text-slate-600">
                Allt du behöver veta innan du börjar använda Jobbcoachen
              </p>
            </div>

            <div className="space-y-4">
              {faqSchema.mainEntity.map((faq: any, idx: number) => (
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
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors min-h-[64px]"
                    aria-expanded={expandedFaq === idx}
                    aria-label={`Fråga: ${faq.name}`}
                  >
                    <span className="font-semibold text-slate-900 pr-4">{faq.name}</span>
                    <div className="p-2 -mr-2">
                      <ChevronDown
                        className={`w-6 h-6 text-slate-600 flex-shrink-0 transition-transform duration-300 ${
                          expandedFaq === idx ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>
                  {expandedFaq === idx && (
                    <div className="px-6 pb-4">
                      <p className="text-slate-600 leading-relaxed">{faq.acceptedAnswer.text}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
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
                Sluta googla – få svar från någon som faktiskt kan svensk arbetsmarknad
              </h2>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Över 890 jobbsökare använder Jobbcoachen varje vecka för att få hjälp med CV, intervjuer, löneförhandling och arbetsrätt. Allt baserat på svenska källor. Svar på sekunder, inte timmar av research.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link
                  href="/register"
                  className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-slate-50 hover:shadow-2xl transition-all duration-300 inline-flex items-center justify-center gap-2 text-lg"
                >
                  Ställ din första fråga – helt gratis
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-6 text-white/80 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span>25 gratis frågor per månad</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span>Svar på 5-15 sekunder</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span>Baserat på svenska källor</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
