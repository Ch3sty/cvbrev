'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  ArrowRight, CheckCircle, Download, FileText,
  Shield, Zap, Target, Star, Clock, Bot,
  ChevronDown, ChevronUp, Sparkles, Users,
  Palette, Languages, Crown, AlertTriangle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import CVCreatorDemo from '@/components/CVCreatorDemo'
import Breadcrumb from '@/components/Breadcrumb'
import { SIMPLE_TEMPLATES } from '@/lib/cv/simple-templates'

export default function SkapaCVLandingPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Check auth status for CTA links
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }
    checkAuth()
  }, [])

  const ctaHref = isLoggedIn ? '/dashboard/skapa-cv' : '/login?redirect=/dashboard/skapa-cv'

  // Get 4 templates for preview (2 free, 2 premium)
  const previewTemplates = SIMPLE_TEMPLATES.slice(0, 4)

  // Schema.org markups
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Jobbcoach.ai CV-Skapare",
    "description": "Skapa ett professionellt CV gratis på 10 minuter med steg-för-steg vägledning och professionella mallar.",
    "url": "https://jobbcoach.ai/verktyg/skapa-cv",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "SEK"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1250"
    }
  }

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Skapa ett professionellt CV gratis på 10 minuter",
    "description": "Steg-för-steg guide för att skapa ditt CV med smart vägledning",
    "totalTime": "PT10M",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Välj din CV-mall",
        "text": "Bläddra igenom våra 8 professionella CV-mallar. Välj modern, traditionell eller kreativ stil beroende på din bransch. 2 mallar är helt gratis.",
        "position": 1
      },
      {
        "@type": "HowToStep",
        "name": "Svara på enkla frågor",
        "text": "Fyll i dina uppgifter genom att svara på enkla frågor om din erfarenhet, utbildning och kompetenser. Inga svåra formuleringar krävs.",
        "position": 2
      },
      {
        "@type": "HowToStep",
        "name": "Vi skriver professionella beskrivningar",
        "text": "Vårt verktyg omvandlar dina svar till professionella CV-formuleringar. Du godkänner eller redigerar varje förslag innan det läggs till.",
        "position": 3
      },
      {
        "@type": "HowToStep",
        "name": "Ladda ner som PDF",
        "text": "Ditt CV är klart att laddas ner som PDF. Formatet fungerar i alla rekryteringssystem (ATS) och ser professionellt ut överallt.",
        "position": 4
      }
    ]
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Behöver jag ett konto för att skapa mitt CV?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Du kan börja skapa ditt CV utan konto, men för att spara och ladda ner behöver du ett gratis konto. Registreringen tar 30 sekunder."
        }
      },
      {
        "@type": "Question",
        "name": "Hur fungerar vägledningen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Vi ställer enkla frågor om din erfarenhet och kompetenser. Du svarar med dina egna ord, och vårt verktyg omvandlar det till professionella CV-formuleringar. Du godkänner eller redigerar varje förslag."
        }
      },
      {
        "@type": "Question",
        "name": "Fungerar CV:t i rekryteringssystem (ATS)?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ja. Alla våra mallar är ATS-optimerade med rätt struktur, rubriker och formatering så att rekryteringssystem kan läsa ditt CV korrekt."
        }
      },
      {
        "@type": "Question",
        "name": "Hur lång tid tar det att skapa ett CV?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Om du skapar ditt första CV tar det 10-15 minuter. Du kan pausa och fortsätta senare – allt sparas automatiskt medan du arbetar."
        }
      },
      {
        "@type": "Question",
        "name": "Kan jag byta mall efter att jag valt en?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ja! Ditt innehåll sparas separat från designen. Du kan när som helst byta till en annan mall och ditt innehåll fylls automatiskt i den nya designen."
        }
      },
      {
        "@type": "Question",
        "name": "Vad är skillnaden mellan PDF och Word-format?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "PDF behåller exakt design och fungerar på alla enheter – perfekt för att skicka till arbetsgivare. Word-filer är redigerbara om du vill göra ändringar senare. Gratis-användare får PDF, Premium får båda."
        }
      },
      {
        "@type": "Question",
        "name": "Kan jag skapa CV på engelska?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ja! Verktyget fungerar på både svenska och engelska. Du väljer språk när du börjar och formuleringarna anpassas automatiskt."
        }
      },
      {
        "@type": "Question",
        "name": "Vad händer om jag aldrig skrivit ett CV förut?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Det är precis därför vi byggde verktyget! Du behöver ingen CV-erfarenhet. Vi guidar dig genom varje steg med konkreta exempel och hjälper dig formulera allt professionellt."
        }
      }
    ]
  }

  const breadcrumbItems = [
    { name: 'Hem', href: '/' },
    { name: 'Verktyg', href: '/verktyg' },
    { name: 'Skapa CV', href: '/verktyg/skapa-cv' }
  ]

  const problems = [
    {
      icon: FileText,
      title: 'Du vet inte var du ska börja',
      description: 'Du har öppnat Word. Skrivit "CV" högst upp. Sen sitter du där. Vilka rubriker ska du ha? I vilken ordning? Efter 30 minuter har du fortfarande bara namnet och telefonnumret.',
    },
    {
      icon: AlertTriangle,
      title: 'Du vet inte hur man beskriver sitt jobb',
      description: '"Arbetade med kundbemötande" låter tråkigt, men vad ska du skriva istället? Du har ingen aning om vad som låter professionellt, och du vågar inte gissa.',
    },
    {
      icon: Target,
      title: 'Du har ingen aning om det ser bra ut',
      description: 'Även om du får ihop text ser det kanske slarvigt ut. Fel typsnitt, konstiga marginaler. Och du vet inte om det funkar i de system företagen använder.',
    }
  ]

  const processSteps = [
    {
      icon: Palette,
      title: 'Välj din CV-mall',
      description: 'Bläddra bland 8 professionella mallar. Alla fungerar med ATS-system. Välj en som passar din bransch.',
      time: '1-2 min',
      color: 'from-blue-600 to-indigo-600'
    },
    {
      icon: FileText,
      title: 'Svara på enkla frågor',
      description: 'Vad heter din senaste arbetsplats? Vad gjorde du där? Du svarar precis som du skulle berätta för en kompis.',
      time: '3-5 min',
      color: 'from-purple-600 to-pink-600'
    },
    {
      icon: Sparkles,
      title: 'Vi formulerar professionellt',
      description: '"Jobbade på café" blir "Hanterade kundbemötande för 200+ kunder dagligen". Du godkänner eller redigerar.',
      time: '3-4 min',
      color: 'from-orange-600 to-red-600'
    },
    {
      icon: Download,
      title: 'Ladda ner som PDF',
      description: 'Ditt CV är klart. PDF-format fungerar i alla rekryteringssystem. Ladda ner direkt.',
      time: '1 min',
      color: 'from-emerald-600 to-teal-600'
    }
  ]

  const features = [
    {
      icon: Bot,
      title: 'Vägledning genom hela processen',
      description: 'Du behöver inte kunna skriva professionellt. Berätta vad du gjorde med egna ord – vi omvandlar det till CV-språk.',
      gradient: 'from-emerald-600 to-teal-600'
    },
    {
      icon: Palette,
      title: '8 professionella mallar',
      description: 'Alla mallar är designade för att fungera i ATS-system. Välj modern, traditionell eller kreativ stil.',
      gradient: 'from-blue-600 to-indigo-600'
    },
    {
      icon: Target,
      title: 'Intelligent strukturering',
      description: 'Vi föreslår rätt CV-struktur baserat på din erfarenhet. Nyexaminerad? Utbildning först. Erfaren? Karriär först.',
      gradient: 'from-purple-600 to-pink-600'
    },
    {
      icon: Shield,
      title: 'Automatisk ATS-optimering',
      description: 'Rubrikerna, datumformaten och nyckelordsplaceringen sätts upp så rekryteringssystem kan läsa ditt CV korrekt.',
      gradient: 'from-orange-600 to-red-600'
    },
    {
      icon: Sparkles,
      title: 'Konkreta formuleringsförslag',
      description: 'Istället för "ansvarig för" föreslår vi starkare alternativ: "Ledde", "Utvecklade", "Genomförde".',
      gradient: 'from-cyan-600 to-blue-600'
    },
    {
      icon: Download,
      title: 'Exportera direkt till PDF eller Word',
      description: 'PDF för att skicka till arbetsgivare. Word om du vill göra egna ändringar. Båda fungerar i alla system.',
      gradient: 'from-green-600 to-emerald-600'
    }
  ]

  const faqs = [
    {
      question: 'Behöver jag ett konto för att skapa mitt CV?',
      answer: 'Du kan börja skapa ditt CV utan konto, men för att spara och ladda ner behöver du ett gratis konto. Registreringen tar 30 sekunder och du kan fortsätta direkt där du var.'
    },
    {
      question: 'Hur fungerar vägledningen?',
      answer: 'Vi ställer enkla frågor om din erfarenhet, utbildning och kompetenser. Du svarar med dina egna ord – precis som du skulle berätta för en kompis. Vårt verktyg analyserar dina svar och föreslår professionella formuleringar. Du godkänner eller redigerar varje förslag innan det läggs till i ditt CV.'
    },
    {
      question: 'Vad händer om jag aldrig skrivit ett CV förut?',
      answer: 'Det är precis därför vi byggde verktyget! Du behöver ingen CV-erfarenhet alls. Vi guidar dig genom varje steg med konkreta exempel och hjälper dig formulera allt professionellt. Tusentals nyexaminerade har skapat sitt första CV hos oss.'
    },
    {
      question: 'Fungerar CV:t i rekryteringssystem (ATS)?',
      answer: 'Ja. Alla våra mallar är ATS-optimerade, vilket betyder att de fungerar med Applicant Tracking System som de flesta företag använder. Vi använder rätt struktur, rubriker och formatering så ditt CV läses korrekt av både system och människor.'
    },
    {
      question: 'Hur lång tid tar det att skapa ett CV?',
      answer: 'Om du skapar ditt första CV tar det 10-15 minuter. Om du uppdaterar ett befintligt CV tar det 5-10 minuter. Du kan pausa och fortsätta senare – allt sparas automatiskt medan du jobbar.'
    },
    {
      question: 'Kan jag byta mall efter att jag valt en?',
      answer: 'Ja! Ditt innehåll sparas separat från designen. Du kan när som helst byta till en annan mall och ditt innehåll fylls automatiskt i den nya designen. Premium-användare kan testa alla mallar och ladda ner flera versioner.'
    },
    {
      question: 'Vad är skillnaden mellan PDF och Word-format?',
      answer: 'PDF behåller exakt design och fungerar på alla enheter – perfekt för att skicka till arbetsgivare. Word-filer (.docx) är redigerbara i Microsoft Word, Google Docs eller Pages om du vill göra ändringar senare. Gratis-användare får PDF, Premium får båda formaten.'
    },
    {
      question: 'Kan jag skapa CV på engelska?',
      answer: 'Ja! Verktyget fungerar på både svenska och engelska. Du väljer språk när du börjar. Formuleringarna anpassas automatiskt till det språk du valt, så du får naturliga och korrekta formuleringar oavsett språk.'
    }
  ]

  const testimonials = [
    {
      name: 'Emma S.',
      role: 'Nyexaminerad',
      avatar: 'E',
      quote: 'Jag hade aldrig skrivit ett CV förut och var helt lost. Jobbcoach ställde enkla frågor och verktyget gjorde min praktikbeskrivning om från "gjorde lite av allt" till faktiska resultat med siffror.',
      result: 'Fick mitt första jobb på 3 veckor',
      rating: 5,
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      name: 'David L.',
      role: 'Karriärbytare',
      avatar: 'D',
      quote: 'Skulle byta från butik till kontor och visste inte hur jag skulle beskriva min erfarenhet. Verktyget hjälpte mig översätta "sålde kläder" till "uppnådde 120% av försäljningsmål".',
      result: 'Framgångsrik karriärbyte',
      rating: 5,
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Sara M.',
      role: 'Återvändare till arbetsmarknaden',
      avatar: 'S',
      quote: 'Varit hemma med barn i 5 år och hade glömt hur man skriver CV. Tog 15 minuter att fylla i allt och fick ett CV som såg ut som en designers hade gjort.',
      result: 'Professionellt CV på 15 minuter',
      rating: 5,
      gradient: 'from-emerald-500 to-teal-500'
    }
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />


      <div className="container mx-auto px-4 pt-24">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Hero Section */}
      <section className="pt-32 pb-24 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-transparent to-teal-50 pointer-events-none" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Content */}
              <div>
                <motion.h1
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  Sluta stirra på ett tomt dokument. Skapa ditt CV på 10 minuter med steg-för-steg vägledning
                </motion.h1>

                <motion.p
                  className="text-xl text-slate-600 mb-8 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  Du har aldrig skrivit ett CV förut. Du vet inte vilka rubriker du ska ha eller hur man beskriver sitt jobb. Vi ställer enkla frågor, du svarar, och vi hjälper dig formulera det professionellt. Du får ett färdigt CV som fungerar i rekryteringssystem.
                </motion.p>

                <motion.div
                  className="flex flex-col sm:flex-row gap-4 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <Link
                    href={ctaHref}
                    className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 inline-flex items-center justify-center gap-2 min-h-[48px]"
                  >
                    Skapa ditt CV gratis
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href="#hur-det-fungerar"
                    className="px-8 py-4 bg-white text-slate-900 font-semibold rounded-xl border-2 border-slate-200 hover:border-emerald-600 transition-all duration-300 inline-flex items-center justify-center gap-2 min-h-[48px]"
                  >
                    Se hur det fungerar
                  </Link>
                </motion.div>

                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Du slipper fundera på hur saker ska formuleras – vi skriver åt dig baserat på dina svar</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Du får välja mellan 8 professionella mallar som fungerar med ATS-system</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Du kan ladda ner direkt som PDF – inget konto krävs för att komma igång</span>
                  </div>
                </motion.div>
              </div>

              {/* Right: Animated demo */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                <CVCreatorDemo />
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
                De vanligaste problemen när du ska skapa ett CV från grunden
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {problems.map((problem, idx) => (
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

      {/* Process/Timeline Section */}
      <section id="hur-det-fungerar" className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Så skapar du ditt CV på 10 minuter
              </h2>
              <p className="text-lg text-slate-600">
                Från tomt dokument till färdigt CV i 4 enkla steg
              </p>
            </div>

            <div className="relative">
              {/* Timeline line */}
              <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-200 via-teal-200 to-cyan-200 -translate-x-1/2" />

              <div className="space-y-12 lg:space-y-0">
                {processSteps.map((step, idx) => (
                  <motion.div
                    key={idx}
                    className={`relative lg:grid lg:grid-cols-2 lg:gap-12 items-center ${
                      idx % 2 === 1 ? 'lg:flex-row-reverse' : ''
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1, duration: 0.6 }}
                  >
                    {/* Timeline node */}
                    <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 w-16 h-16 rounded-2xl bg-gradient-to-br shadow-lg items-center justify-center z-10"
                      style={{
                        backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
                      }}
                    >
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                        <step.icon className="w-7 h-7 text-white" />
                      </div>
                      {/* Step number badge */}
                      <span className="absolute -top-2 -right-2 w-7 h-7 bg-white rounded-full border-2 border-slate-200 flex items-center justify-center text-sm font-bold text-slate-700 shadow">
                        {idx + 1}
                      </span>
                    </div>

                    {/* Content */}
                    <div className={`${idx % 2 === 0 ? 'lg:pr-24 lg:text-right' : 'lg:pl-24 lg:col-start-2'}`}>
                      <div className={`bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 ${
                        idx % 2 === 0 ? 'lg:ml-auto' : ''
                      }`}>
                        {/* Mobile icon */}
                        <div className={`lg:hidden w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4`}>
                          <step.icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                        <p className="text-slate-600 mb-3">{step.description}</p>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                          <Clock className="w-4 h-4" />
                          {step.time}
                        </div>
                      </div>
                    </div>

                    {/* Empty space for alternating layout */}
                    {idx % 2 === 1 && <div className="hidden lg:block" />}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTA after process */}
            <motion.div
              className="text-center mt-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Link
                href={ctaHref}
                className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 inline-flex items-center justify-center gap-2 min-h-[48px]"
              >
                Börja skapa ditt CV nu
                <ArrowRight className="w-5 h-5" />
              </Link>
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
                Vad ingår när du skapar ditt CV hos oss
              </h2>
              <p className="text-lg text-slate-600">
                Allt du behöver för att skapa ett professionellt CV som fungerar
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:border-emerald-300 hover:shadow-xl transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Template Preview Section */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Välj bland professionella mallar
              </h2>
              <p className="text-lg text-slate-600">
                4 av våra 8 populäraste CV-mallar – 2 helt gratis
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {previewTemplates.map((template, idx) => (
                <motion.div
                  key={template.id}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-emerald-300 transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.4 }}
                >
                  {/* Template preview */}
                  <div className="aspect-[3/4] relative bg-slate-50 p-4">
                    <Image
                      src={template.imagePath}
                      alt={`${template.name} CV-mall`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                    {/* Tier badge */}
                    <div className="absolute top-2 left-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                        template.tier === 'free'
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : 'bg-amber-100 text-amber-700 border border-amber-300'
                      }`}>
                        {template.tier === 'free' ? 'Gratis' : 'Premium'}
                      </span>
                    </div>
                  </div>
                  {/* Template info */}
                  <div className="p-4 border-t border-slate-100">
                    <h3 className="font-semibold text-slate-900 text-sm mb-1">{template.name}</h3>
                    <p className="text-xs text-slate-500 capitalize">{template.category}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="text-center mt-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Link
                href="/verktyg/cv-mallar"
                className="text-emerald-600 font-semibold hover:text-emerald-700 inline-flex items-center gap-1"
              >
                Se alla 8 mallar
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Börja gratis eller få allt med Premium
              </h2>
              <p className="text-lg text-slate-600">
                Skapa ditt första CV helt gratis – uppgradera när du behöver mer
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Free Plan */}
              <motion.div
                className="bg-slate-50 rounded-2xl p-8 border border-slate-200"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Gratis</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-slate-900">0 kr</span>
                    <span className="text-slate-500">/för alltid</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {[
                    'Skapa 1 komplett CV',
                    'Smart formuleringshjälp',
                    '2 professionella mallar',
                    'PDF-nedladdning',
                    'ATS-optimerad struktur'
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={ctaHref}
                  className="block w-full px-6 py-4 bg-slate-900 text-white font-semibold rounded-xl text-center hover:bg-slate-800 transition-all duration-300 min-h-[48px]"
                >
                  Skapa ditt CV gratis
                </Link>
              </motion.div>

              {/* Premium Plan */}
              <motion.div
                className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 border-2 border-emerald-300 relative"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                {/* Popular badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold rounded-full shadow-lg">
                    Mest populär
                  </span>
                </div>

                <div className="mb-6 pt-2">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                    Premium
                    <Crown className="w-6 h-6 text-amber-500" />
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-slate-900">149 kr</span>
                    <span className="text-slate-500">/månad</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {[
                    'Obegränsat antal CV',
                    'Alla 8 exklusiva mallar',
                    'PDF + Word-nedladdning',
                    'Avancerad formuleringshjälp',
                    'Personligt brev-generator',
                    'CV-analys och feedback',
                    'LinkedIn-optimering'
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/priser"
                  className="block w-full px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl text-center hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 min-h-[48px]"
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
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Vanliga frågor
              </h2>
              <p className="text-lg text-slate-600">
                Allt du behöver veta om att skapa ditt CV
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <motion.div
                  key={idx}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05, duration: 0.4 }}
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    aria-expanded={expandedFaq === idx}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors min-h-[48px]"
                  >
                    <span className="font-semibold text-slate-900 pr-4">{faq.question}</span>
                    {expandedFaq === idx ? (
                      <ChevronUp className="w-5 h-5 text-slate-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-500 flex-shrink-0" />
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

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Vad användare säger
              </h2>
              <p className="text-lg text-slate-600">
                Tusentals har skapat sitt CV med Jobbcoach.ai
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, idx) => (
                <motion.div
                  key={idx}
                  className="bg-slate-50 rounded-xl p-6 border border-slate-200"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                >
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white font-bold text-lg`}>
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{testimonial.name}</p>
                      <p className="text-sm text-slate-500">{testimonial.role}</p>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-slate-600 text-sm italic mb-4 leading-relaxed">
                    &quot;{testimonial.quote}&quot;
                  </p>

                  {/* Result */}
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-700">{testimonial.result}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Skapa ditt professionella CV på 10 minuter
            </motion.h2>

            <motion.p
              className="text-xl text-white/90 mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Sluta sitta fast med ett tomt dokument. Vårt verktyg guidar dig genom varje steg, hjälper dig formulera professionellt och du får ett färdigt CV som fungerar i alla rekryteringssystem.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Link
                href={ctaHref}
                className="px-10 py-5 bg-white text-emerald-700 font-bold text-lg rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 inline-flex items-center justify-center gap-2 min-h-[56px]"
              >
                Skapa ditt CV nu – helt gratis
                <ArrowRight className="w-6 h-6" />
              </Link>
            </motion.div>

            <motion.div
              className="flex flex-wrap justify-center gap-6 mt-8 text-white/80 text-sm"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Tar 10 minuter</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Inget konto krävs för att börja</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Fungerar i alla system</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
