'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  SearchCheck, Upload, Target, TrendingUp, CheckCircle,
  AlertTriangle, Award, Clock, Sparkles, FileText, ArrowRight,
  Users, Shield, Zap, Eye, ChevronDown, ChevronUp, Download,
  Star, TrendingDown, BarChart3, BookOpen, Lightbulb
} from 'lucide-react'

// Components
import PremiumNavbar from '@/components/PremiumNavbar'
import CVAnalysisDemo from '@/components/CVAnalysisDemo'
import Breadcrumb from '@/components/Breadcrumb'

export default function CVAnalysisLandingPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  // Schema.org markup
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Jobbcoach.ai CV-Analys",
    "url": "https://jobbcoach.ai/verktyg/cv-analys",
    "description": "Gratis CV-analys som ger detaljerad feedback på svenska CV:n på 60 sekunder",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "SEK",
      "description": "2 gratis analyser per vecka"
    },
    "featureList": "ATS-analys, Strukturbedömning, Språkoptimering, Roll-baserade förslag, Kvantifieringstips",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "1400",
      "bestRating": "5",
      "worstRating": "1"
    }
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Vad betyder ATS-poängen i analysen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "ATS-poängen visar hur väl ditt CV fungerar med Applicant Tracking Systems som rekryterare använder. 70+ betyder goda chanser att passera, 80+ är utmärkt, 90+ är toppnivå. Vi testar struktur, nyckelord, formatering och läsbarhet mot vanliga svenska ATS-system."
        }
      },
      {
        "@type": "Question",
        "name": "Hur lång tid tar det att få analysresultat?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Analysen tar 50-70 sekunder från att du laddat upp ditt CV. Du får direkt poäng på struktur, språk, nyckelord och ATS-kompatibilitet, plus konkreta förbättringsförslag du kan implementera direkt."
        }
      },
      {
        "@type": "Question",
        "name": "Vilka förbättringsförslag får jag i analysen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Du får kategoriserade förslag inom Struktur (rubrikordning, avsnittslängd), Språk (aktiva verb, svammelord), Nyckelord (branschtermer som saknas), Kvantifiering (var du kan lägga till siffror) och Design (typsnitt, marginaler, vita ytor)."
        }
      },
      {
        "@type": "Question",
        "name": "Kan jag jämföra olika versioner av mitt CV?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ja! Premium-användare kan spara upp till 10 CV-versioner och jämföra poäng sida vid sida. Du ser exakt vilka ändringar som förbättrade eller försämrade din ATS-poäng. Perfekt när du testar olika versioner inför ansökningar."
        }
      },
      {
        "@type": "Question",
        "name": "Varför fick mitt CV låg poäng på nyckelord?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Låg nyckelordspoäng betyder att ditt CV saknar branschspecifika termer som rekryterare söker efter. Vi visar vilka nyckelord som saknas för din roll (t.ex. 'projektledning', 'Scrum', 'budget'). Lägg till dessa i relevanta avsnitt för högre poäng."
        }
      },
      {
        "@type": "Question",
        "name": "Vad innebär låg kvantifieringspoäng?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Kvantifieringspoäng mäter hur många mätbara resultat du visar. Låg poäng betyder för få siffror och konkreta achievements. Istället för 'ansvarig för försäljning' ska du skriva 'ökade försäljningen med 40% på 8 månader'. Siffror gör CV:t 3x mer övertygande."
        }
      },
      {
        "@type": "Question",
        "name": "Hur kan jag förbättra min strukturpoäng?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Strukturpoäng baseras på rubrikordning, konsekvent datumformat, tydliga avsnitt och läsbar längd. Vi förbättrar genom att flagga: saknade rubriker, inkonsekventa datum, för långa stycken (över 4 rader) och onödiga avsnitt som 'Fritidsintressen'."
        }
      },
      {
        "@type": "Question",
        "name": "Kan analysen hjälpa mig anpassa CV:t för specifika jobb?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ja! Premium-analysen kan analysera både ditt CV och en jobbannons samtidigt. Du får exakt matchningspoäng och ser vilka nyckelord från annonsen som saknas i ditt CV. Lägg till dessa termer för att öka chansen att bli kallad till intervju."
        }
      },
      {
        "@type": "Question",
        "name": "Vad är skillnaden mellan gratis och premium-analys?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Gratis-analys ger övergripande poäng och grundläggande förslag (2 analyser/vecka). Premium ger obegränsade analyser, detaljerade förbättringsförslag per avsnitt, före/efter-jämförelser, jobbannons-matchning och möjlighet att spara alla versioner."
        }
      },
      {
        "@type": "Question",
        "name": "Varför visar analysen att mitt CV är för långt?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "ATS-system och rekryterare föredrar 1-2 sidor (max 3 för seniora roller). För långt CV ökar risken att viktiga achievements missas. Vi föreslår vilket innehåll du kan korta ner eller ta bort för att hålla CV:t koncist och relevant."
        }
      }
    ]
  }

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Så analyserar du ditt CV",
    "description": "Steg-för-steg guide för att få feedback på ditt CV",
    "totalTime": "PT60S",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Välj ditt CV",
        "text": "Välj ett av dina redan uppladdade CV:n från din lista, eller ladda upp ett nytt CV i PDF, DOCX eller TXT-format.",
        "position": 1
      },
      {
        "@type": "HowToStep",
        "name": "Vi analyserar",
        "text": "Vi analyserar ditt CV på 50-60 sekunder. Vi kontrollerar ATS-vänlighet, struktur, språk, kvantifiering och ger roll-baserade förbättringsförslag.",
        "position": 2
      },
      {
        "@type": "HowToStep",
        "name": "Få detaljerad feedback",
        "text": "Se din CV-poäng (0-100), kategori-scores (struktur, språk, kvantifiering) och konkreta förbättringsförslag för varje arbetsroll och avsnitt.",
        "position": 3
      },
      {
        "@type": "HowToStep",
        "name": "Välj förbättringar",
        "text": "Granska våra förslag och välj vilka förbättringar du vill implementera. Du har full kontroll över vilka ändringar som appliceras på ditt CV.",
        "position": 4
      },
      {
        "@type": "HowToStep",
        "name": "Spara och välj mall",
        "text": "Spara din förbättrade CV-version och välj en professionell ATS-optimerad mall. Ladda ner som PDF eller Word-dokument.",
        "position": 5
      }
    ]
  }

  const breadcrumbItems = [
    { name: 'Hem', href: '/' },
    { name: 'Verktyg', href: '/verktyg' },
    { name: 'CV-Analys', href: '/verktyg/cv-analys' }
  ]

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

      <PremiumNavbar />

      <div className="container mx-auto px-4 pt-24">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Hero Section */}
      <section className="pt-32 pb-24 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-transparent to-red-50 pointer-events-none" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-6 md:gap-12 items-center">
              {/* Left: Content */}
              <div>
                <motion.h1
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  Sluta gissa varför ditt CV sorteras bort
                </motion.h1>

                <motion.p
                  className="text-lg sm:text-xl text-slate-600 mb-8 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  Vi analyserar ditt CV på 60 sekunder och ger konkreta förbättringar. Du ser exakt vad du ska ändra och varför.
                </motion.p>

                <motion.div
                  className="flex flex-col sm:flex-row gap-4 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <Link
                    href="/dashboard/cv-analys"
                    className="px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 inline-flex items-center justify-center gap-2"
                  >
                    Analysera Mitt CV Gratis
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href="#example"
                    className="px-8 py-4 bg-white text-slate-900 font-semibold rounded-xl border-2 border-slate-200 hover:border-orange-600 transition-all duration-300 inline-flex items-center justify-center gap-2"
                  >
                    Se Exempel på Feedback
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
                    <span>Du ser hur du slutar bli bortsorterad av ATS-system</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Du får en poäng 0-100 så du vet om ditt CV är konkurrenskraftigt</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Vi pekar ut var du skrev vaga påståenden istället för konkreta resultat</span>
                  </div>
                </motion.div>
              </div>

              {/* Right: Animated demo */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                <CVAnalysisDemo />
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
                Känner du igen dig?
              </h2>
              <p className="text-lg text-slate-600">
                De vanligaste problemen som gör att ditt CV inte får respons
              </p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
              {[
                {
                  icon: TrendingDown,
                  title: '75% filtreras bort av ATS',
                  description: '97% av Sveriges 500 största företag använder ATS (Applicant Tracking System) som automatiskt sorterar CV:n. Om ditt CV saknar rätt nyckelord och struktur, når det aldrig en mänsklig rekryterare – oavsett hur kompetent du är.',
                  stat: '75% av CV:n når aldrig en människa'
                },
                {
                  icon: AlertTriangle,
                  title: 'Svaga formuleringar och passiva verb',
                  description: '"Arbetade med projekt" istället för "Ledde 12 projekt med 4,2 MSEK budget". Passiva beskrivningar och generiska meningar gör att ditt CV inte sticker ut – även när du läser det själv känns det tråkigt.',
                  stat: 'Rekryterare lägger 7 sekunder per CV'
                },
                {
                  icon: BarChart3,
                  title: 'Saknar mätbara resultat och siffror',
                  description: 'Du har levererat fantastiska resultat, men de syns inte. "Förbättrade försäljningen" säger inget – men "Ökade försäljningen med 142% från 2,1 MSEK till 5,1 MSEK" visar din verkliga impact.',
                  stat: 'CV med siffror får 40% fler intervjuer'
                }
              ].map((problem, idx) => (
                <motion.div
                  key={idx}
                  className="bg-slate-50 rounded-xl p-4 sm:p-6 border border-slate-200 hover:border-orange-300 hover:shadow-lg transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                >
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                    <problem.icon className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{problem.title}</h3>
                  <p className="text-slate-600 text-sm mb-4 leading-relaxed">{problem.description}</p>
                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-xs font-medium text-red-600">{problem.stat}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* "Så fungerar det" Timeline Section */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-transparent to-red-50/50 pointer-events-none" />

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
                  Så fungerar CV-analysen
                </h2>
                <p className="text-lg text-slate-600">
                  Från uppladdning till förbättrat CV på 5 enkla steg
                </p>
              </motion.div>
            </div>

            {/* Vertical Timeline */}
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-200 via-red-200 to-orange-200" />

              {/* Timeline steps */}
              <div className="space-y-16">
                {[
                  {
                    step: 1,
                    icon: Upload,
                    iconColor: 'from-orange-600 to-orange-500',
                    title: 'Välj Ditt CV',
                    subtitle: 'Från sparade CV:n eller ladda upp nytt',
                    description: 'Välj ett av dina redan uppladdade CV:n från din lista. Vår plattform sparar dina CV:n säkert så du kan analysera dem när som helst. Stöder PDF, DOCX och TXT-format.',
                    badge: '10 sekunder'
                  },
                  {
                    step: 2,
                    icon: Sparkles,
                    iconColor: 'from-red-600 to-red-500',
                    title: 'Vi analyserar automatiskt',
                    subtitle: 'Djupanalys mot 50+ kvalitetskriterier',
                    description: 'Vi läser och analyserar ditt CV på 50-60 sekunder. Vi kontrollerar ATS-kompatibilitet, strukturell tydlighet, språklig styrka, kvantifiering av resultat, och ger roll-specifika förbättringsförslag baserat på din erfarenhet.',
                    badge: '50-60 sekunder',
                    highlight: true
                  },
                  {
                    step: 3,
                    icon: Target,
                    iconColor: 'from-purple-600 to-purple-500',
                    title: 'Få Detaljerad Feedback',
                    subtitle: 'Poäng, scores och konkreta förbättringar',
                    description: 'Se din ATS-poäng (0-100), kategori-scores för struktur, språk och kvantifiering (1-5), samt detaljerade förbättringsförslag för varje arbetsroll, färdighetsavsnitt och profilsammanfattning. Varje förslag är konkret och actionable.',
                    badge: 'Omedelbart'
                  },
                  {
                    step: 4,
                    icon: CheckCircle,
                    iconColor: 'from-blue-600 to-blue-500',
                    title: 'Välj vilka förbättringar som implementeras',
                    subtitle: 'Du har full kontroll över ditt CV',
                    description: 'Granska våra förslag och välj exakt vilka förbättringar du vill applicera. Se före/efter-jämförelse för varje ändring. Du kan redigera texten direkt om du vill justera något innan det sparas.',
                    badge: '2-5 minuter'
                  },
                  {
                    step: 5,
                    icon: Download,
                    iconColor: 'from-green-600 to-green-500',
                    title: 'Spara och välj professionell mall',
                    subtitle: 'Färdigt CV klart att skickas',
                    description: 'Spara din förbättrade CV-version på plattformen för framtida referens. Välj en av våra professionella ATS-optimerade mallar, eller behåll din nuvarande design. Ladda ner som PDF eller Word-dokument.',
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
                            ? 'border-red-200 shadow-xl shadow-red-100/50 bg-gradient-to-br from-white to-red-50/30'
                            : 'border-slate-200 hover:border-orange-200 hover:shadow-lg'
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
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-orange-100 text-orange-700'
                                  }`}>
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-orange-600 font-medium mb-3">
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
                href="/dashboard/cv-analys"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 text-lg"
              >
                Analysera Mitt CV Nu – Helt Gratis
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-sm text-slate-500 mt-4">
                Inget kreditkort krävs • Klart på 60 sekunder • GDPR-säker
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vad Analysen Kontrollerar - Features */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Vad vår CV-analys kontrollerar
              </h2>
              <p className="text-lg text-slate-600">
                Djupanalys mot över 50 kvalitetskriterier som rekryterare och ATS-system värderar
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  icon: Shield,
                  title: 'ATS-Kompatibilitet',
                  description: '97% av Sveriges 500 största företag använder ATS-system. Vi säkerställer att ditt CV passerar dessa automatiska filter genom att kontrollera format, nyckelord och struktur.',
                  gradient: 'from-blue-600 to-indigo-600',
                  stat: '97% använder ATS'
                },
                {
                  icon: Target,
                  title: 'Struktur och Tydlighet',
                  description: 'Analys av layout, sektionsindelning, övergripande läsbarhet och logiskt flöde. Ett välstrukturerat CV gör det enkelt för rekryterare att hitta relevant information snabbt.',
                  gradient: 'from-purple-600 to-pink-600',
                  stat: '7 sekunder per CV'
                },
                {
                  icon: Zap,
                  title: 'Starka Verb och Språk',
                  description: 'Identifierar passiva formuleringar och föreslår kraftfulla aktiva alternativ. "Arbetade med" blir "Ledde", "Hjälpte till" blir "Drev". Språket ska visa din faktiska impact.',
                  gradient: 'from-orange-600 to-red-600',
                  stat: '40% starkare intryck'
                },
                {
                  icon: Users,
                  title: 'Roll-Baserade Förbättringar',
                  description: 'Skräddarsydda tips baserat på varje specifik arbetsroll i ditt CV. Vi analyserar vad som är relevant för just den positionen och branschen, inte generiska råd.',
                  gradient: 'from-green-600 to-emerald-600',
                  stat: 'Unika per roll'
                },
                {
                  icon: TrendingUp,
                  title: 'Kvantifiering och Resultat',
                  description: 'Upptäcker var du kan lägga till siffror, procent, belopp och mätbara resultat. CV med kvantifierade prestationer har 40% högre chans att leda till intervju.',
                  gradient: 'from-cyan-600 to-blue-600',
                  stat: '+40% intervjuchans'
                },
                {
                  icon: Award,
                  title: 'Profil, Färdigheter och Certifieringar',
                  description: 'Optimering av nyckelområden som rekryterare aktivt söker efter. Vi hjälper dig att framhäva rätt kompetenser och visa din utvecklingsbana tydligt.',
                  gradient: 'from-yellow-600 to-orange-600',
                  stat: 'Komplett översikt'
                }
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  className="relative group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                >
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-orange-300 hover:shadow-xl transition-all duration-300 h-full">
                    <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                    <p className="text-slate-600 mb-4 leading-relaxed">{feature.description}</p>
                    <div className="pt-4 border-t border-slate-200">
                      <p className="text-xs font-semibold text-orange-600">{feature.stat}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CV-Poäng System */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Förstå din CV-poäng
              </h2>
              <p className="text-lg text-slate-600">
                Vi ger ditt CV en poäng mellan 0-100 baserat på ATS-vänlighet och kvalitetskriterier
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              {[
                { range: '90-100', label: 'Utmärkt', color: 'from-green-500 to-emerald-600', description: 'Toppnivå – väldigt hög chans att passera ATS och imponera', icon: Award },
                { range: '70-89', label: 'Bra', color: 'from-blue-500 to-cyan-600', description: 'Bra kvalitet – goda chanser att nå rekryterare', icon: TrendingUp },
                { range: '50-69', label: 'OK', color: 'from-yellow-500 to-orange-500', description: 'Fungerande men behöver förbättringar för att sticka ut', icon: AlertTriangle },
                { range: '<50', label: 'Svagt', color: 'from-red-500 to-pink-600', description: 'Kräver större omarbetning för att vara konkurrenskraftigt', icon: TrendingDown }
              ].map((score, idx) => (
                <motion.div
                  key={idx}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                >
                  <div className={`w-16 h-16 mx-auto mb-3 bg-gradient-to-br ${score.color} rounded-full flex items-center justify-center`}>
                    <score.icon className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900 mb-1">{score.range}</p>
                  <p className="text-sm font-semibold text-slate-700 mb-2">{score.label}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{score.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-white rounded-xl border border-slate-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">Rekommendation</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Sikta på minst <strong>70/100</strong> för att ha goda chanser i moderna rekryteringsprocesser.
                    Vår analys visar exakt var du kan förbättra din poäng, steg för steg.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Före/Efter Exempel */}
      <section id="example" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Före och efter: Se skillnaden
              </h2>
              <p className="text-lg text-slate-600">
                Konkreta exempel på hur feedbacken transformerar ditt CV
              </p>
            </div>

            <div className="space-y-12">
              {[
                {
                  role: 'Projektledare IT',
                  before: 'Arbetade med projekt inom IT-sektorn. Ansvarade för team och budget. Samarbetade med olika avdelningar för att leverera projekt i tid.',
                  after: 'Ledde 12 IT-projekt med sammanlagd budget på 4,2 MSEK och team på 8 utvecklare. Levererade 11 av 12 projekt i tid med 95% kundnöjdhet. Koordinerade arbete mellan utveckling, UX och affärssidan vilket resulterade i 30% kortare time-to-market.',
                  improvements: ['Kvantifierade resultat (+siffror)', 'Starkare verb (Ledde istället för Arbetade)', 'Konkreta prestationer (95% kundnöjdhet, 30% förbättring)']
                },
                {
                  role: 'Säljare B2B',
                  before: 'Sålde produkter till företagskunder. Ansvarig för kundrelationer och hjälpte till att öka försäljningen. Arbetade mot olika branscher.',
                  after: 'Ökade B2B-försäljningen med 142% från 2,1 MSEK till 5,1 MSEK på 18 månader genom prospektering av 200+ leads inom fintech och e-handel. Byggde långsiktiga partnerskap med 45 nyckelkunder (retention 92%) och ledde säljteam från 0 till 4 medarbetare.',
                  improvements: ['Specifika siffror (142%, 2,1 MSEK → 5,1 MSEK)', 'Tidsram (18 månader)', 'Branschspecifik (fintech, e-handel)', 'Ledarskap (byggde team från 0 till 4)']
                },
                {
                  role: 'Kundtjänstmedarbetare',
                  before: 'Hanterade kundfrågor via telefon och mail. Löste problem och hjälpte kunder med deras ärenden. Fick bra feedback från chefen.',
                  after: 'Hanterade 40+ kundärenden dagligen via telefon, mail och chatt med 96% lösningsgrad i första kontakt (CSAT 4,7/5). Identifierade återkommande problem och föreslog processförbättringar som minskade inkommande supportärenden med 22%. Utsedd till Månadens Medarbetare 3 gånger.',
                  improvements: ['Volym (40+ dagligen)', 'Kvalitetsmått (96% lösningsgrad, CSAT 4,7/5)', 'Proaktivt problemlösande (22% minskning)', 'Erkännande (3x Månadens Medarbetare)']
                }
              ].map((example, idx) => (
                <motion.div
                  key={idx}
                  className="bg-slate-50 rounded-2xl p-8 border border-slate-200"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                >
                  <div className="mb-6">
                    <span className="px-4 py-2 bg-orange-100 text-orange-700 text-sm font-semibold rounded-full">
                      {example.role}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* Före */}
                    <div className="p-6 bg-red-50 rounded-xl border border-red-200">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingDown className="w-5 h-5 text-red-600" />
                        <span className="font-bold text-red-900">Före</span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed italic">
                        {example.before}
                      </p>
                    </div>

                    {/* Efter */}
                    <div className="p-6 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <span className="font-bold text-green-900">Efter</span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed font-medium">
                        {example.after}
                      </p>
                    </div>
                  </div>

                  {/* Förbättringar */}
                  <div className="pt-6 border-t border-slate-200">
                    <p className="text-sm font-semibold text-slate-700 mb-3">Vad förbättrades:</p>
                    <div className="grid md:grid-cols-2 gap-2">
                      {example.improvements.map((improvement, impIdx) => (
                        <div key={impIdx} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-slate-600">{improvement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="mt-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Link
                href="/dashboard/cv-analys"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-orange-500/25 transition-all duration-300"
              >
                Testa Ditt Eget CV Nu
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 7 Praktiska Tips */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                7 praktiska CV-tips du kan använda direkt
              </h2>
              <p className="text-lg text-slate-600">
                Actionable råd som förbättrar ditt CV – även innan du använder vårt verktyg
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  number: 1,
                  title: 'Börja varje mening med ett starkt verb',
                  description: 'Ledde, Drev, Ökade, Implementerade, Utvecklade – inte "Var ansvarig för" eller "Hjälpte till med".',
                  icon: Zap
                },
                {
                  number: 2,
                  title: 'Lägg till siffror och resultat överallt',
                  description: 'Inte "förbättrade försäljningen" – säg "Ökade försäljningen med 35% på 6 månader". Siffror gör dina påståenden trovärdiga.',
                  icon: TrendingUp
                },
                {
                  number: 3,
                  title: 'Anpassa CV:t för varje jobb',
                  description: 'Använd nyckelord från jobbannonsen. ATS-system letar efter exakt matchning mellan ditt CV och jobbeskrivningen.',
                  icon: Target
                },
                {
                  number: 4,
                  title: 'Håll det kort och relevant',
                  description: 'Max 2 sidor för 10+ års erfarenhet, 1 sida för juniora roller. Fokusera på de senaste 10 åren – äldre är sällan relevant.',
                  icon: Clock
                },
                {
                  number: 5,
                  title: 'Beskriv IMPACT, inte bara arbetsuppgifter',
                  description: 'Inte "Utvecklade webbapplikationer" – säg "Utvecklade e-handelsplattform som hanterar 10 000 transaktioner/dag".',
                  icon: Award
                },
                {
                  number: 6,
                  title: 'Använd rätt filformat',
                  description: 'PDF för bästa resultat – det bevarar formatering och fungerar bra med ATS-system. Word (.docx) fungerar också.',
                  icon: FileText
                },
                {
                  number: 7,
                  title: 'Lägg färdigheter i en egen sektion',
                  description: 'ATS-system letar efter färdigheter i dedikerade sektioner. Lista tekniska verktyg, programmeringsspråk, certifieringar tydligt.',
                  icon: BookOpen
                }
              ].map((tip, idx) => (
                <motion.div
                  key={idx}
                  className="p-6 bg-white rounded-xl border border-slate-200 hover:border-orange-300 hover:shadow-lg transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <tip.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-6 h-6 bg-orange-100 text-orange-700 text-xs font-bold rounded-full flex items-center justify-center">
                          {tip.number}
                        </span>
                        <h3 className="font-bold text-slate-900">{tip.title}</h3>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {tip.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Vad användare säger
              </h2>
              <p className="text-lg text-slate-600">
                Verkliga resultat från jobbsökare som använt vår CV-analys
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Marcus L.',
                  role: 'Projektledare',
                  avatar: 'M',
                  quote: 'Efter 30 ansökningar utan svar insåg jag att mitt CV var problemet. Analysen visade att jag hade 0 kvantifierade resultat. Jag fixade det på en timme och fick 2 intervjuer på mina nästa 5 ansökningar.',
                  result: '30 ansökningar utan svar → 2 intervjuer på 5 ansökningar',
                  rating: 5
                },
                {
                  name: 'Sofia K.',
                  role: 'UX Designer',
                  avatar: 'S',
                  quote: 'Min ATS-poäng var 58/100 vilket förklarade varför jag inte fick respons. Efter att ha implementerat förslagen (tog 2 timmar) var jag uppe i 87. Fick jobbet på Klarna 3 veckor senare!',
                  result: 'ATS-poäng 58 → 87, jobbat på Klarna',
                  rating: 5
                },
                {
                  name: 'Ahmed R.',
                  role: 'Försäljare',
                  avatar: 'A',
                  quote: 'Jag trodde mitt CV var bra men analysen hittade 14 ställen där jag kunde lägga till konkreta siffror. Nu visar jag 142% försäljningsökning istället för att bara säga "ökade försäljningen". Jag får faktiskt svar nu.',
                  result: 'Från generiska beskrivningar till 14 kvantifierade resultat',
                  rating: 5
                }
              ].map((testimonial, idx) => (
                <motion.div
                  key={idx}
                  className="p-6 bg-slate-50 rounded-2xl border border-slate-200"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{testimonial.name}</p>
                      <p className="text-sm text-slate-600">{testimonial.role}</p>
                    </div>
                  </div>

                  <div className="flex gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  <p className="text-slate-700 text-sm mb-4 leading-relaxed italic">
                    "{testimonial.quote}"
                  </p>

                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-xs font-semibold text-green-600">{testimonial.result}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gratis vs Premium Comparison */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Välj din plan
              </h2>
              <p className="text-lg text-slate-600">
                Börja gratis eller få obegränsad tillgång med Premium
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Free Plan */}
              <motion.div
                className="p-8 bg-white rounded-2xl border-2 border-slate-200"
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
                  <p className="text-sm text-slate-600">Perfekt för att komma igång</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {[
                    '2 CV-analyser per vecka',
                    'ATS-kompatibilitetscheck',
                    'Grundläggande feedback',
                    'Kategori-scores (struktur, språk, kvantifiering)',
                    'Roll-baserade förbättringsförslag',
                    'Tillgång till 3 grundläggande CV-mallar'
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className="w-full block text-center px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all duration-300"
                >
                  Kom Igång Gratis
                </Link>
              </motion.div>

              {/* Premium Plan */}
              <motion.div
                className="p-8 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border-2 border-orange-300 relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-orange-600 to-red-600 text-white text-sm font-bold rounded-full">
                  Mest Populär
                </div>

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Premium</h3>
                  <p className="text-4xl font-bold text-slate-900 mb-1">
                    149 kr
                    <span className="text-lg font-normal text-slate-600">/månad</span>
                  </p>
                  <p className="text-sm text-slate-600">För seriösa jobbsökare</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {[
                    'Obegränsade CV-analyser',
                    'Avancerade roll-baserade förslag',
                    'Djupgående kvantifieringstips',
                    'Prioriterad AI-analys',
                    'Tillgång till ALLA professionella CV-mallar',
                    'Spara och jämför CV-versioner',
                    'Exportera till PDF och Word',
                    'Email-support med prioritet'
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-900 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/priser"
                  className="w-full block text-center px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-orange-500/25 transition-all duration-300"
                >
                  Uppgradera till Premium
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Vanliga Frågor
              </h2>
              <p className="text-lg text-slate-600">
                Svar på de vanligaste frågorna om CV-analys
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  question: 'Hur fungerar CV-analysen?',
                  answer: 'Ladda upp ditt CV i PDF, DOCX eller TXT-format. Vi analyserar ditt CV mot över 50 kvalitetskriterier inklusive ATS-kompatibilitet, struktur, språk och roll-baserad relevans. Du får din feedback på 60 sekunder.'
                },
                {
                  question: 'Är CV-analysen verkligen gratis?',
                  answer: 'Ja! Du kan analysera ditt CV gratis 2 gånger per vecka. Premium-användare får obegränsade analyser samt tillgång till avancerade funktioner som djupgående roll-baserade förslag och alla professionella CV-mallar.'
                },
                {
                  question: 'Vad är ATS och varför är det viktigt för mitt CV?',
                  answer: 'ATS (Applicant Tracking System) är rekryteringssystem som 97% av Sveriges 500 största företag använder. Enligt Forbes sorteras 75% av alla CV:n bort av ATS innan en rekryterare läser dem. Vår analys säkerställer att ditt CV är optimerat för att passera dessa system.'
                },
                {
                  question: 'Vilken CV-poäng bör jag sikta på?',
                  answer: 'Vi rekommenderar minst 70/100 för att ha goda chanser att passera ATS-system. 80+ är utmärkt och 90+ är toppnivå. Vår analys visar exakt var du kan förbättra din poäng.'
                },
                {
                  question: 'Hur skiljer sig jobbcoach.ai från andra CV-granskare?',
                  answer: 'Vi är den enda tjänsten som kombinerar ATS-analys, roll-baserade förslag, kvantifieringstips OCH direktintegration med professionella CV-mallar. Dessutom är det gratis (ingen medlemskap krävs) och du får feedback på 60 sekunder.'
                },
                {
                  question: 'Kan jag analysera mitt CV flera gånger?',
                  answer: 'Ja! Gratis-användare får 2 analyser per vecka. Vi rekommenderar att du analyserar ditt CV varje gång du uppdaterar det eller söker en ny typ av roll. Premium-användare får obegränsade analyser.'
                },
                {
                  question: 'Vilka filformat stöds?',
                  answer: 'Vi accepterar PDF, DOCX och TXT-filer. Vi rekommenderar PDF för bästa resultat då det är det vanligaste formatet som rekryterare och ATS-system förväntar sig.'
                },
                {
                  question: 'Sparas mitt CV efter analysen?',
                  answer: 'Din integritet är viktig för oss. Vi analyserar ditt CV och ger feedback, men sparar inte innehållet permanent på våra servrar. Premium-användare kan välja att spara sina CV-versioner i sitt konto för jämförelse.'
                },
                {
                  question: 'Vad är kvantifieringsförslag?',
                  answer: 'Vi identifierar platser i ditt CV där du kan lägga till mätbara resultat och siffror. Till exempel: istället för "förbättrade försäljningen" föreslår vi "ökade försäljningen med 35% på 6 månader". Detta gör ditt CV mycket mer övertygande.'
                },
                {
                  question: 'Fungerar analysen för alla typer av jobb?',
                  answer: 'Ja! Vi har analyserat hundratusentals CV:n och jobbannonser inom alla branscher. Du får både generella förbättringsförslag OCH roll-specifika tips baserat på din önskade position.'
                }
              ].map((faq, idx) => (
                <motion.div
                  key={idx}
                  className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05, duration: 0.4 }}
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-100 transition-colors"
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
                Få Jobbet Du Förtjänar
              </h2>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Sluta skicka ansökningar som sorteras bort av ATS-system innan någon läser dem.
                Få professionell feedback på ditt CV på 60 sekunder – helt gratis.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link
                  href="/dashboard/cv-analys"
                  className="px-8 py-4 bg-white text-orange-600 font-semibold rounded-xl hover:bg-slate-50 hover:shadow-2xl transition-all duration-300 inline-flex items-center justify-center gap-2 text-lg"
                >
                  Analysera Mitt CV Nu
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/priser"
                  className="px-8 py-4 bg-orange-700 text-white font-semibold rounded-xl hover:bg-orange-800 transition-all duration-300 inline-flex items-center justify-center gap-2"
                >
                  Se Priser
                </Link>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-6 text-white/80 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span>2 gratis analyser/vecka</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span>Inget kreditkort krävs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span>Klart på 60 sekunder</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
