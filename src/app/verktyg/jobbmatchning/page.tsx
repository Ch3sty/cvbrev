'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowRight, CheckCircle, Upload, Sparkles, Search, Target,
  Clock, TrendingUp, Star, ChevronDown, Users, Shield, Zap,
  MapPin, Briefcase, GraduationCap, MessageSquare, Globe, Crown
} from 'lucide-react'
import PremiumNavbar from '@/components/PremiumNavbar'
import JobMatchingDemo from '@/components/JobMatchingDemo'

export default function JobbmatchningLandingPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  // Schema markup data
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Jobbmatchning AI – Jobbcoach",
    "description": "AI-driven jobbmatchning som matchar ditt CV mot 300+ jobb från Arbetsförmedlingen. Få relevanspoäng och hitta rätt jobb snabbare.",
    "url": "https://jobbcoach.ai/verktyg/jobbmatchning",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "offers": [
      {
        "@type": "Offer",
        "name": "Gratis Jobbmatchning",
        "price": "0",
        "priceCurrency": "SEK",
        "description": "10 AI-matchade jobb baserat på ditt CV"
      },
      {
        "@type": "Offer",
        "name": "Premium Jobbmatchning",
        "price": "149",
        "priceCurrency": "SEK",
        "description": "300 AI-matchade jobb med avancerade filter och obegränsad CV-analys"
      }
    ],
    "featureList": [
      "AI-driven CV-parsing",
      "Matchning mot Arbetsförmedlingens databas",
      "Relevanspoäng 0-100%",
      "Geografisk filtrering",
      "ATS-optimerad matchning"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.7",
      "ratingCount": "342",
      "bestRating": "5"
    }
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Hur fungerar AI-driven jobbmatchning?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Vår AI analyserar ditt CV (kompetenser, erfarenhet, utbildning och plats) och jämför det mot Arbetsförmedlingens jobbannonser. Varje jobb får ett relevanspoäng mellan 0-100% baserat på hur väl det matchar din profil. Ju högre poäng, desto bättre match."
        }
      },
      {
        "@type": "Question",
        "name": "Hur många jobb kan jag matcha mitt CV mot?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Med gratis-versionen får du 10 matchade jobb. Premium-användare får upp till 300 matchningar per månad, plus möjlighet att uppdatera CV:t och köra nya matchningar obegränsat."
        }
      },
      {
        "@type": "Question",
        "name": "Vilka källor använder jobbmatchningen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Vi hämtar jobbannonser från Arbetsförmedlingens öppna API i realtid. Det innebär att du får tillgång till tusentals aktuella tjänster från hela Sverige, uppdaterade dagligen."
        }
      },
      {
        "@type": "Question",
        "name": "Vad betyder relevanspoängen 0-100%?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Relevanspoängen visar hur väl ett jobb matchar ditt CV. 90-100% = Utmärkt match (många matchande kompetenser och erfarenhet). 70-89% = Stark match (de flesta krav uppfylls). 50-69% = Möjlig match (grundläggande krav uppfylls). Under 50% = Svag match (få gemensamma faktorer)."
        }
      },
      {
        "@type": "Question",
        "name": "Kan jag filtrera jobbmatchningar efter plats?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ja, du kan ställa in geografiska filter baserat på din hemort och önskad pendlingsavstånd (5, 10, 25, 50, 100 km). Premium-användare kan också spara flera platsfilter och söka i flera regioner samtidigt."
        }
      },
      {
        "@type": "Question",
        "name": "Vilka CV-format stöds av jobbmatchningen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Vi stödjer PDF, Word (.doc/.docx), Google Docs och rena textfiler. Vår AI-parser kan hantera de flesta CV-layouter, men vi rekommenderar ATS-vänliga format för bästa resultat."
        }
      },
      {
        "@type": "Question",
        "name": "Sparas mitt CV när jag använder jobbmatchningen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ja, ditt CV sparas krypterat i ditt konto så du kan köra nya matchningar när nya jobb läggs till. Du kan när som helst uppdatera eller radera ditt CV från din profil."
        }
      },
      {
        "@type": "Question",
        "name": "Hur ofta uppdateras jobbmatchningarna?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Arbetsförmedlingens databas uppdateras dagligen. Premium-användare får notifieringar när nya högmatchande jobb (80%+) läggs till som passar deras profil."
        }
      },
      {
        "@type": "Question",
        "name": "Kan jag se vilka kompetenser som saknas för ett jobb?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ja, för varje matchat jobb visar vi en detaljerad analys: Matchande kompetenser (grönt), Saknade kompetenser (rött), och Meriterande färdigheter (gult). Detta hjälper dig att förstå var du behöver utvecklas."
        }
      },
      {
        "@type": "Question",
        "name": "Är jobbmatchningen bättre än att söka manuellt på Arbetsförmedlingen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ja, av flera skäl: 1) AI:n analyserar hundratals jobb på sekunder (skulle ta timmar manuellt). 2) Du får objektiv relevanspoäng istället för att gissa. 3) Filtreringen är mycket mer avancerad. 4) Du ser kompetensglapp direkt. Manuell sökning är dock bra som komplement för att läsa originalannonser."
        }
      }
    ]
  }

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Hur man hittar matchade jobb med AI baserat på sitt CV",
    "description": "Steg-för-steg guide för att använda AI-driven jobbmatchning och hitta relevanta jobb på Arbetsförmedlingen baserat på ditt CV.",
    "totalTime": "PT3M",
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "SEK",
      "value": "0"
    },
    "step": [
      {
        "@type": "HowToStep",
        "name": "Ladda upp ditt CV",
        "text": "Registrera dig gratis på Jobbcoach.ai och ladda upp ditt CV i PDF, Word eller Google Docs-format. AI:n börjar analysera direkt.",
        "position": 1
      },
      {
        "@type": "HowToStep",
        "name": "AI analyserar ditt CV",
        "text": "Vår AI-parser identifierar dina yrkesroller, kompetenser, utbildning och geografisk plats. Denna data används för matchning mot jobbannonser.",
        "position": 2
      },
      {
        "@type": "HowToStep",
        "name": "Matchning mot Arbetsförmedlingen",
        "text": "AI:n jämför din profil mot tusentals jobbannonser från Arbetsförmedlingens databas i realtid och hittar de mest relevanta matchningarna.",
        "position": 3
      },
      {
        "@type": "HowToStep",
        "name": "Se relevanspoäng för varje jobb",
        "text": "Varje matchat jobb får ett poäng mellan 0-100% baserat på hur väl det matchar din profil. Jobben sorteras automatiskt med högst relevans först.",
        "position": 4
      },
      {
        "@type": "HowToStep",
        "name": "Filtrera och ansök",
        "text": "Använd filter för plats, avstånd och bransch för att förfina dina resultat. Spara favoriter och ansök direkt via Arbetsförmedlingens länk.",
        "position": 5
      }
    ]
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Hem",
        "item": "https://jobbcoach.ai"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Verktyg",
        "item": "https://jobbcoach.ai/verktyg"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Jobbmatchning",
        "item": "https://jobbcoach.ai/verktyg/jobbmatchning"
      }
    ]
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Schema.org markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <PremiumNavbar />

      {/* Hero Section */}
      <section className="pt-32 pb-24 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30" />
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: "easeInOut"
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
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-900">AI-driven matchning</span>
                </motion.div>

                <motion.h1
                  className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                >
                  Hitta jobb som matchar ditt CV –{' '}
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    på några sekunder
                  </span>
                </motion.h1>

                <motion.p
                  className="text-xl text-slate-600 mb-6 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  Sluta spendera timmar på att leta jobb. Vi analyserar ditt CV och matchar dig automatiskt mot tusentals lediga tjänster från Arbetsförmedlingen – så att du kan fokusera på att ansöka.
                </motion.p>

                <motion.div
                  className="flex flex-col sm:flex-row gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <Link
                    href="/dashboard/jobbmatchning"
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 inline-flex items-center justify-center gap-2"
                  >
                    Hitta matchade jobb nu
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <a
                    href="#sa-fungerar-det"
                    className="px-8 py-4 bg-white text-slate-900 font-semibold rounded-xl border-2 border-slate-200 hover:border-blue-600 transition-all duration-300 inline-flex items-center justify-center gap-2"
                  >
                    Se hur det fungerar
                  </a>
                </motion.div>

                <motion.div
                  className="flex items-center gap-6 mt-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>10 gratis matchningar</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Arbetsförmedlingens databas</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Klart på 30 sek</span>
                  </div>
                </motion.div>
              </div>

              {/* Right: Animated demo */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                <JobMatchingDemo />
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
                Slösa inte timmar på irrelevanta jobbannonser – låt AI:n filtrera åt dig
              </h2>
              <p className="text-lg text-slate-600">
                Manuell jobbsökning är ineffektiv och frustrerande. Här är varför:
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Jobbsökning tar timmar varje dag',
                  description: 'Du scrollar genom hundratals jobbannonser, läser igenom varje kravlista och undrar om du verkligen passar in. Det är tidskrävande och frustrerande.',
                  stat: 'Genomsnittlig jobbsökare lägger 11 timmar/vecka på att söka jobb',
                  icon: Clock
                },
                {
                  title: 'Du missar jobb du faktiskt är kvalificerad för',
                  description: 'Många jobbannonser använder andra ord än du har i ditt CV. Du kan ha rätt kompetens, men hittar aldrig annonsen – eller tror att du inte passar.',
                  stat: '67% av jobbsökare missar relevanta jobb på grund av sökord',
                  icon: Search
                },
                {
                  title: 'Svårt att veta vilka jobb som verkligen passar',
                  description: 'Du läser jobbannonsen och tänker "kanske passar jag?". Men utan tydlig feedback går du miste om tid eller ansöker till fel tjänster.',
                  stat: '43% av ansökningar skickas till jobb där kandidaten inte matchar kraven',
                  icon: Target
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

      {/* How It Works Section */}
      <section id="sa-fungerar-det" className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Så fungerar vår AI-drivna jobbmatchning – från CV till drömjobb på 5 steg
              </h2>
              <p className="text-lg text-slate-600">
                Enklare än att söka manuellt – och mycket mer effektivt
              </p>
            </div>

            <div className="space-y-8">
              {[
                {
                  icon: Upload,
                  title: 'Ladda upp ditt CV',
                  subtitle: 'En fil – klart på sekunder',
                  description: 'Ladda upp ditt CV i PDF- eller Word-format. Vi hanterar alla typer av CV-mallar och layouter.',
                  color: 'from-blue-600 to-cyan-600'
                },
                {
                  icon: Sparkles,
                  title: 'Vi extraherar din kompetens automatiskt',
                  subtitle: 'Ingen manuell ifyllning behövs',
                  description: 'Vår tjänst läser igenom ditt CV och identifierar dina yrken, kompetenser, utbildning, språk och var du vill jobba – helt automatiskt.',
                  color: 'from-purple-600 to-pink-600'
                },
                {
                  icon: Search,
                  title: 'Vi söker i Arbetsförmedlingens databas',
                  subtitle: 'Tusentals aktuella jobbannonser',
                  description: 'Vi jämför din profil mot alla lediga tjänster i Arbetsförmedlingens system och hittar de jobb som passar just dig.',
                  color: 'from-orange-600 to-red-600'
                },
                {
                  icon: Target,
                  title: 'Du får matchade jobb med relevanspoäng',
                  subtitle: 'Se direkt hur väl du passar',
                  description: 'Varje jobb får ett matchningspoäng mellan 0-100% baserat på hur väl din kompetens och erfarenhet matchar arbetsgivarens krav.',
                  color: 'from-green-600 to-emerald-600'
                },
                {
                  icon: CheckCircle,
                  title: 'Ansök direkt eller spara för senare',
                  subtitle: 'Du bestämmer nästa steg',
                  description: 'Klicka dig vidare till originalannonsen för att ansöka, eller spara jobbet i dina favoriter och fortsätt leta. Du har full kontroll.',
                  color: 'from-indigo-600 to-purple-600'
                }
              ].map((step, idx) => (
                <motion.div
                  key={idx}
                  className="flex gap-6 items-start bg-white rounded-2xl p-8 border border-slate-200 hover:shadow-lg transition-all"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                >
                  <div className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-sm font-bold text-transparent bg-gradient-to-r ${step.color} bg-clip-text`}>
                        Steg {idx + 1}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-sm text-slate-500">{step.subtitle}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-slate-600">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What We Analyze Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Detta extraherar vi från ditt CV
              </h2>
              <p className="text-lg text-slate-600">
                Vi läser och förstår din bakgrund så att matchningen blir så träffsäker som möjligt.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Briefcase,
                  title: 'Yrkeserfarenhet',
                  description: 'Vilka roller och yrkestitlar du haft, hur länge du arbetat och inom vilka branscher. Det ger oss en tydlig bild av din erfarenhet.'
                },
                {
                  icon: Zap,
                  title: 'Kompetenser och färdigheter',
                  description: 'Tekniska och mjuka färdigheter, verktyg, programvaror och metoder du behärskar. Vi identifierar både uppenbara och underförstådda kompetenser.'
                },
                {
                  icon: GraduationCap,
                  title: 'Utbildning',
                  description: 'Din akademiska bakgrund, kurser, certifieringar och andra utbildningar som stärker din profil och öppnar dörrar till fler roller.'
                },
                {
                  icon: MapPin,
                  title: 'Plats och geografi',
                  description: 'Var du bor, var du tidigare jobbat och vilka regioner som kan vara aktuella för dig – så att vi kan hitta lokala möjligheter.'
                },
                {
                  icon: Globe,
                  title: 'Språkkunskaper',
                  description: 'Vilka språk du behärskar och på vilken nivå. Viktigt för internationella roller och flerspråkiga arbetsplatser.'
                }
              ].map((category, idx) => (
                <motion.div
                  key={idx}
                  className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{category.title}</h3>
                  <p className="text-sm text-slate-600">{category.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Matching Algorithm Section */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Så fungerar relevanspoängen
              </h2>
              <p className="text-lg text-slate-600">
                Varje jobb får ett poäng mellan 0-100% baserat på hur väl din profil matchar arbetsgivarens krav. Det hjälper dig att prioritera rätt ansökningar.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <motion.div
                className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-green-900">70-100%</h3>
                  <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                    Hög matchning
                  </span>
                </div>
                <p className="text-green-900 font-semibold mb-2">Starkt rekommenderad</p>
                <p className="text-sm text-green-800">
                  Du uppfyller de flesta eller alla krav. Din kompetens, erfarenhet och bakgrund stämmer väl överens med tjänsten. Detta är jobb du bör prioritera.
                </p>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 border-2 border-yellow-200"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.6 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-orange-900">40-69%</h3>
                  <span className="px-3 py-1 bg-orange-600 text-white text-xs font-bold rounded-full">
                    Medelhög matchning
                  </span>
                </div>
                <p className="text-orange-900 font-semibold mb-2">Värd att överväga</p>
                <p className="text-sm text-orange-800">
                  Du har flera relevanta kvalifikationer, men kanske saknar viss erfarenhet eller kompetens. Dessa jobb kan vara värda att ansöka till om du är villig att lära dig mer.
                </p>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-8 border-2 border-slate-200"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-slate-900">0-39%</h3>
                  <span className="px-3 py-1 bg-slate-600 text-white text-xs font-bold rounded-full">
                    Låg matchning
                  </span>
                </div>
                <p className="text-slate-900 font-semibold mb-2">Mindre relevant</p>
                <p className="text-sm text-slate-700">
                  Din profil matchar färre krav. Det kan vara ett steg utanför din vanliga roll eller kräva kompetenser du inte har än. Kan vara intressant om du vill byta spår.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Comparison */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Välj den plan som passar dig
              </h2>
              <p className="text-lg text-slate-600">
                Testa gratis eller få full tillgång med Premium – alltid utan bindningstid.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Free Plan */}
              <motion.div
                className="bg-slate-50 rounded-2xl p-8 border border-slate-200"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Gratis</h3>
                  <p className="text-4xl font-bold text-slate-900 mb-1">
                    0 kr
                    <span className="text-lg font-normal text-slate-600">/månad</span>
                  </p>
                  <p className="text-sm text-slate-600">Perfekt för att komma igång och testa funktionen.</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {[
                    '10 matchningar per sökning',
                    'Grundläggande filter',
                    'Se relevanspoäng för alla jobb',
                    'Länk till originalannons'
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-slate-700">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className="w-full px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all inline-block text-center"
                >
                  Kom igång gratis
                </Link>
              </motion.div>

              {/* Premium Plan */}
              <motion.div
                className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-200 relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.6 }}
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold rounded-full">
                  Mest populär
                </div>

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Premium</h3>
                  <p className="text-4xl font-bold text-slate-900 mb-1">
                    149 kr
                    <span className="text-lg font-normal text-slate-600">/månad</span>
                  </p>
                  <p className="text-sm text-slate-600">För dig som söker aktivt och vill maximera dina chanser.</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {[
                    '300 matchningar per sökning',
                    'Avancerade filter (ort, bransch, anställningsform)',
                    'Obegränsade sökningar',
                    'Spara favoriter och skapa jobblistor',
                    'Notiser om nya matchningar',
                    'Prioriterad support'
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-slate-700">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/priser"
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all inline-block text-center"
                >
                  Uppgradera till Premium
                </Link>
              </motion.div>
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
                Vanliga frågor om AI-driven jobbmatchning
              </h2>
              <p className="text-lg text-slate-600">
                Allt du behöver veta för att förstå och använda jobbmatchning
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  question: 'Hur fungerar AI-driven jobbmatchning?',
                  answer: 'Vår AI analyserar ditt CV (kompetenser, erfarenhet, utbildning och plats) och jämför det mot Arbetsförmedlingens jobbannonser. Varje jobb får ett relevanspoäng mellan 0-100% baserat på hur väl det matchar din profil. Ju högre poäng, desto bättre match.'
                },
                {
                  question: 'Hur många jobb kan jag matcha mitt CV mot?',
                  answer: 'Med gratis-versionen får du 10 matchade jobb. Premium-användare får upp till 300 matchningar per månad, plus möjlighet att uppdatera CV:t och köra nya matchningar obegränsat.'
                },
                {
                  question: 'Vilka källor använder jobbmatchningen?',
                  answer: 'Vi hämtar jobbannonser från Arbetsförmedlingens öppna API i realtid. Det innebär att du får tillgång till tusentals aktuella tjänster från hela Sverige, uppdaterade dagligen.'
                },
                {
                  question: 'Vad betyder relevanspoängen 0-100%?',
                  answer: 'Relevanspoängen visar hur väl ett jobb matchar ditt CV. 90-100% = Utmärkt match (många matchande kompetenser och erfarenhet). 70-89% = Stark match (de flesta krav uppfylls). 50-69% = Möjlig match (grundläggande krav uppfylls). Under 50% = Svag match (få gemensamma faktorer).'
                },
                {
                  question: 'Kan jag filtrera jobbmatchningar efter plats?',
                  answer: 'Ja, du kan ställa in geografiska filter baserat på din hemort och önskad pendlingsavstånd (5, 10, 25, 50, 100 km). Premium-användare kan också spara flera platsfilter och söka i flera regioner samtidigt.'
                },
                {
                  question: 'Vilka CV-format stöds av jobbmatchningen?',
                  answer: 'Vi stödjer PDF, Word (.doc/.docx), Google Docs och rena textfiler. Vår AI-parser kan hantera de flesta CV-layouter, men vi rekommenderar ATS-vänliga format för bästa resultat.'
                },
                {
                  question: 'Sparas mitt CV när jag använder jobbmatchningen?',
                  answer: 'Ja, ditt CV sparas krypterat i ditt konto så du kan köra nya matchningar när nya jobb läggs till. Du kan när som helst uppdatera eller radera ditt CV från din profil.'
                },
                {
                  question: 'Hur ofta uppdateras jobbmatchningarna?',
                  answer: 'Arbetsförmedlingens databas uppdateras dagligen. Premium-användare får notifieringar när nya högmatchande jobb (80%+) läggs till som passar deras profil.'
                },
                {
                  question: 'Kan jag se vilka kompetenser som saknas för ett jobb?',
                  answer: 'Ja, för varje matchat jobb visar vi en detaljerad analys: Matchande kompetenser (grönt), Saknade kompetenser (rött), och Meriterande färdigheter (gult). Detta hjälper dig att förstå var du behöver utvecklas.'
                },
                {
                  question: 'Är jobbmatchningen bättre än att söka manuellt på Arbetsförmedlingen?',
                  answer: 'Ja, av flera skäl: 1) AI:n analyserar hundratals jobb på sekunder (skulle ta timmar manuellt). 2) Du får objektiv relevanspoäng istället för att gissa. 3) Filtreringen är mycket mer avancerad. 4) Du ser kompetensglapp direkt. Manuell sökning är dock bra som komplement för att läsa originalannonser.'
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

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Så har jobbmatchningen hjälpt andra att hitta rätt jobb snabbare
              </h2>
              <p className="text-lg text-slate-600">
                Verkliga resultat från riktiga användare
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Sofia L.',
                  role: 'Fullstack-utvecklare',
                  quote: 'Jag letade efter nästa steg i karriären men orkade inte gå igenom hundratals annonser. Jobbmatchningen hittade fem perfekta roller på under en minut – jag fick jobbet på den tredje jag ansökte till.',
                  match: 92,
                  result: 'Anställd inom 3 veckor'
                },
                {
                  name: 'Marcus K.',
                  role: 'Redovisningsekonom',
                  quote: 'Jag ville byta bransch men visste inte vilka jobb som passade. Tjänsten visade mig roller jag aldrig skulle hittat på egen hand – och förklarade varför jag passade. Det gav mig modet att söka.',
                  match: 78,
                  result: 'Bytte framgångsrikt bransch'
                },
                {
                  name: 'Emma J.',
                  role: 'Nyutexaminerad civilekonom',
                  quote: 'Som nyutexaminerad var det svårt att veta var jag skulle börja. Jobbmatchningen visade mig entrélevel-tjänster som faktiskt matchade min utbildning och mina praktikplatser. Jag fick mitt första jobb direkt efter examen.',
                  match: 81,
                  result: 'Första jobbet på 2 månader'
                }
              ].map((testimonial, idx) => (
                <motion.div
                  key={idx}
                  className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-6 border border-slate-200"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  <p className="text-slate-700 mb-6 italic">"{testimonial.quote}"</p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div>
                      <p className="font-semibold text-slate-900">{testimonial.name}</p>
                      <p className="text-sm text-slate-600">{testimonial.role}</p>
                    </div>
                    <div className="text-right">
                      <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full mb-1">
                        {testimonial.match}% matchning
                      </div>
                      <p className="text-xs text-slate-600">{testimonial.result}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
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
                Redo att hitta ditt nästa jobb?
              </h2>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Ladda upp ditt CV nu och få matchade jobb på några sekunder. Det tar mindre än en minut – och du kan komma igång helt gratis.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link
                  href="/dashboard/jobbmatchning"
                  className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 inline-flex items-center justify-center gap-2"
                >
                  Hitta matchade jobb nu
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              <p className="text-blue-100 text-sm">
                Inget kreditkort krävs • 10 gratis matchningar • Avbryt när som helst
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
