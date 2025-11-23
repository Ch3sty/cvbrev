'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import {
  Search, Filter, ChevronDown, ChevronUp, ArrowRight, CheckCircle,
  Sparkles, FileText, Target, Clock, TrendingUp, Award, Users,
  Star, Shield, Zap, Eye, Heart, MessageCircle, Briefcase,
  GraduationCap, Stethoscope, Building2, ShoppingCart, Code,
  Palette, Wrench, Coffee, Calculator, Phone, Mail,
  Play, X, BookOpen, AlertCircle, Download, Copy, Cog, Package
} from 'lucide-react'

import PremiumNavbar from '@/components/PremiumNavbar'

// Type definitions
interface CoverLetterExample {
  id: string
  yrke: string
  slug: string
  kategori: 'vard' | 'tech' | 'service' | 'utbildning' | 'ekonomi' | 'kreativ' | 'övrigt' | 'offentlig-sektor' | 'teknik'
  niva: 'nybörjare' | 'erfaren' | 'chef' | 'specialist'
  sokvolym: number
  icon: any
  gradient: string
  preview: {
    intro: string
    highlight: string[]
  }
  featured?: boolean
}

// Gallery data - TOP 20 yrken från SEO-planen
const coverLetterExamples: CoverLetterExample[] = [
  {
    id: 'underskoterska',
    yrke: 'Undersköterska',
    slug: 'underskoterska',
    kategori: 'vard',
    niva: 'erfaren',
    sokvolym: 750,
    icon: Stethoscope,
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
    preview: {
      intro: 'Ett personligt brev som visar din omvårdnadskompetens och passion för patientnära arbete inom vård och omsorg.',
      highlight: ['ADL-stöd och personcentrerad vård', 'Medicin hantering och dokumentation', 'Teamarbete i stressiga situationer']
    },
    featured: true
  },
  {
    id: 'student',
    yrke: 'Student/Första jobbet',
    slug: 'student',
    kategori: 'övrigt',
    niva: 'nybörjare',
    sokvolym: 590,
    icon: GraduationCap,
    gradient: 'from-purple-500 via-pink-500 to-rose-500',
    preview: {
      intro: 'Perfekt för dig som söker ditt första jobb eller extrajobb vid sidan av studierna. Framhäv din potential och lärvilja.',
      highlight: ['Teoretisk kunskap från utbildning', 'Projektarbeten och grupparbeten', 'Stark inlärningsförmåga']
    },
    featured: true
  },
  {
    id: 'larare',
    yrke: 'Lärare',
    slug: 'larare',
    kategori: 'utbildning',
    niva: 'erfaren',
    sokvolym: 360,
    icon: BookOpen,
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    preview: {
      intro: 'Visa din pedagogiska kompetens och förmåga att inspirera elever. Belyser klassrumsledning och ämneskunnande.',
      highlight: ['Didaktik och pedagogiska metoder', 'Individualisering och inkludering', 'Digital kompetens i undervisning']
    },
    featured: true
  },
  {
    id: 'sjukskoterska',
    yrke: 'Sjuksköterska',
    slug: 'sjukskoterska',
    kategori: 'vard',
    niva: 'erfaren',
    sokvolym: 180,
    icon: Stethoscope,
    gradient: 'from-blue-600 via-indigo-600 to-purple-600',
    preview: {
      intro: 'Ett professionellt brev som lyfter din kliniska kompetens, medicinska kunskap och förmåga att arbeta under press.',
      highlight: ['Klinisk bedömning och omvårdnad', 'Medicinteknisk utrustning', 'Evidensbaserad vård']
    }
  },
  {
    id: 'butikssaljare',
    yrke: 'Butikssäljare',
    slug: 'butikssaljare',
    kategori: 'service',
    niva: 'nybörjare',
    sokvolym: 160,
    icon: ShoppingCart,
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
    preview: {
      intro: 'Framhäv din service känsla och försäljningstalang. Perfekt för retail och butiksjobb.',
      highlight: ['Kundservice och merförsäljning', 'Kassahantering och lagerarbete', 'Visuell merchandising']
    }
  },
  {
    id: 'saljare',
    yrke: 'Säljare',
    slug: 'saljare',
    kategori: 'service',
    niva: 'erfaren',
    sokvolym: 220,
    icon: Target,
    gradient: 'from-pink-500 via-rose-500 to-red-500',
    preview: {
      intro: 'Ett övertygande brev för B2B eller B2C-försäljning. Visa dina resultat och relationsbyggande förmåga.',
      highlight: ['Affärsutveckling och prospektering', 'Nettoomsättning och KPI:er', 'CRM-system och säljprocesser']
    }
  },
  {
    id: 'sommarjobb',
    yrke: 'Sommarjobb',
    slug: 'sommarjobb',
    kategori: 'övrigt',
    niva: 'nybörjare',
    sokvolym: 230,
    icon: Coffee,
    gradient: 'from-yellow-400 via-orange-400 to-red-400',
    preview: {
      intro: 'Ett entusiastiskt brev för sommarjobb. Visa din energi, flexibilitet och vilja att bidra under sommaren.',
      highlight: ['Tillgänglig hela sommaren', 'Snabbinlärning och flexibilitet', 'Positiv attityd och lagspelare']
    }
  },
  {
    id: 'ekonomiassistent',
    yrke: 'Ekonomiassistent',
    slug: 'ekonomiassistent',
    kategori: 'ekonomi',
    niva: 'erfaren',
    sokvolym: 450,
    icon: Calculator,
    gradient: 'from-slate-500 via-gray-500 to-zinc-500',
    preview: {
      intro: 'Professionellt brev för ekonomiroller. Framhäv noggrannhet, systemkunskap och bokföringskompetens.',
      highlight: ['Bokföring och fakturering', 'Ekonomisystem (Fortnox, Visma)', 'Månadsavslut och avstämningar']
    }
  },
  {
    id: 'barnskotare',
    yrke: 'Barnskötare',
    slug: 'barnskotare',
    kategori: 'utbildning',
    niva: 'erfaren',
    sokvolym: 210,
    icon: Heart,
    gradient: 'from-pink-400 via-rose-400 to-red-400',
    preview: {
      intro: 'Ett varmt och engagerat brev för arbete med barn. Visa din omsorg, kreativitet och pedagogiska kompetens.',
      highlight: ['Barns utveckling och behov', 'Pedagogiska aktiviteter', 'Trygghet och relationsskapande']
    }
  },
  {
    id: 'personlig-assistent',
    yrke: 'Personlig assistent',
    slug: 'personlig-assistent',
    kategori: 'vard',
    niva: 'erfaren',
    sokvolym: 180,
    icon: Users,
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    preview: {
      intro: 'Ett empatiskt brev för assistentyrket. Belyser flexibilitet, empati och förmågan att stötta individer.',
      highlight: ['LSS och personlig assistans', 'Flexibilitet och anpassningsförmåga', 'Respekt och integritet']
    }
  },
  {
    id: 'administrator',
    yrke: 'Administrator',
    slug: 'administrator',
    kategori: 'offentlig-sektor',
    niva: 'erfaren',
    sokvolym: 880,
    icon: Briefcase,
    gradient: 'from-slate-500 via-gray-600 to-slate-700',
    preview: {
      intro: 'Lyfter organisatorisk kompetens, systemkunskap och administrativ precision som arbetsgivare söker.',
      highlight: ['Processtyrning & koordination', 'Digital systemvana (Office, affärssystem)', 'Kommunikation över avdelningar']
    }
  },
  {
    id: 'forskollarare',
    yrke: 'Förskollärare',
    slug: 'forskollarare',
    kategori: 'utbildning',
    niva: 'erfaren',
    sokvolym: 1200,
    icon: GraduationCap,
    gradient: 'from-amber-400 via-orange-500 to-amber-600',
    preview: {
      intro: 'Betonar pedagogisk kompetens, läroplanstolkning och barncentrerat förhållningssätt.',
      highlight: ['Lpfö 18 & pedagogisk dokumentation', 'Barns lärande & utveckling', 'Samarbete vårdnadshavare & kollegor']
    }
  },
  {
    id: 'handlaggare',
    yrke: 'Handläggare',
    slug: 'handlaggare',
    kategori: 'offentlig-sektor',
    niva: 'erfaren',
    sokvolym: 760,
    icon: FileText,
    gradient: 'from-indigo-500 via-blue-600 to-indigo-700',
    preview: {
      intro: 'Framhäver juridisk förståelse, utredningsförmåga och korrekt beslutsfattande enligt regelverk.',
      highlight: ['Utredning & beslutsunderlag', 'Regelverkstolkning & lagstiftning', 'Kvalitetssäkring & dokumentation']
    }
  },
  {
    id: 'ingenjor',
    yrke: 'Ingenjör',
    slug: 'ingenjor',
    kategori: 'teknik',
    niva: 'specialist',
    sokvolym: 1400,
    icon: Cog,
    gradient: 'from-cyan-500 via-teal-600 to-cyan-700',
    preview: {
      intro: 'Demonstrerar teknisk expertis, projektledningsförmåga och problemlösning i komplexa system.',
      highlight: ['Teknisk problemlösning & innovation', 'CAD/simulering & systemdesign', 'Tvärfunktionellt projektsamarbete']
    }
  },
  {
    id: 'it-konsult',
    yrke: 'IT-konsult',
    slug: 'it-konsult',
    kategori: 'teknik',
    niva: 'specialist',
    sokvolym: 620,
    icon: Code,
    gradient: 'from-violet-500 via-purple-600 to-violet-700',
    preview: {
      intro: 'Lyfter systemintegration, kundanpassning och teknisk rådgivning i komplexa IT-miljöer.',
      highlight: ['Systemintegration & API-utveckling', 'Kundanalys & kravspecifikation', 'Agila metoder & leveransförmåga']
    }
  },
  {
    id: 'kurator',
    yrke: 'Kurator',
    slug: 'kurator',
    kategori: 'vard',
    niva: 'specialist',
    sokvolym: 540,
    icon: Heart,
    gradient: 'from-rose-400 via-pink-500 to-rose-600',
    preview: {
      intro: 'Betonar evidensbaserade samtalsmetoder, psykosocial bedömning och empatisk klienthantering.',
      highlight: ['Motiverande samtal (MI) & KBT', 'Kris- & traumastöd', 'Tvärdisciplinärt samarbete']
    }
  },
  {
    id: 'lagerarbetare',
    yrke: 'Lagerarbetare',
    slug: 'lagerarbetare',
    kategori: 'service',
    niva: 'nybörjare',
    sokvolym: 980,
    icon: Package,
    gradient: 'from-orange-500 via-red-600 to-orange-700',
    preview: {
      intro: 'Framhäver logistisk noggrannhet, truckvana och säkerhetsmedvetenhet i lageromgivning.',
      highlight: ['Truckkort & lagerhantering', 'Orderplockning & packning', 'Säkerhet & arbetsplatskultur']
    }
  },
  {
    id: 'lakare',
    yrke: 'Läkare',
    slug: 'lakare',
    kategori: 'vard',
    niva: 'specialist',
    sokvolym: 720,
    icon: Stethoscope,
    gradient: 'from-emerald-500 via-green-600 to-emerald-700',
    preview: {
      intro: 'Demonstrerar klinisk excellens, diagnostisk skärpa och patientcentrerad vård enligt evidens.',
      highlight: ['Evidensbaserad diagnostik & behandling', 'Patientkommunikation & etik', 'MDT-samarbete & verksamhetsutveckling']
    }
  },
  {
    id: 'receptionist',
    yrke: 'Receptionist',
    slug: 'receptionist',
    kategori: 'service',
    niva: 'nybörjare',
    sokvolym: 1100,
    icon: Phone,
    gradient: 'from-sky-400 via-blue-500 to-sky-600',
    preview: {
      intro: 'Lyfter servicekänsla, multitasking-förmåga och professionell kommunikation i första linjens möte.',
      highlight: ['Kundservice & telefonhantering', 'Administrativ koordination', 'Stresshantering & problemlösning']
    }
  },
  {
    id: 'lokalvardare',
    yrke: 'Lokalvårdare',
    slug: 'lokalvardare',
    kategori: 'service',
    niva: 'nybörjare',
    sokvolym: 850,
    icon: Sparkles,
    gradient: 'from-teal-400 via-cyan-500 to-teal-600',
    preview: {
      intro: 'Betonar kvalitetsmedvetenhet, hygienkunskap och pålitlighet i professionell städmiljö.',
      highlight: ['Yrkesmässiga städmetoder', 'Kemikaliehantering & HACCP', 'Självständighet & tidsplanering']
    }
  }
]

const categories = [
  { id: 'all', label: 'Alla yrken', icon: Briefcase, color: 'from-blue-600 to-indigo-600' },
  { id: 'vard', label: 'Vård & Omsorg', icon: Stethoscope, color: 'from-blue-500 to-cyan-500' },
  { id: 'teknik', label: 'Teknik & IT', icon: Code, color: 'from-purple-500 to-pink-500' },
  { id: 'service', label: 'Service & Försäljning', icon: ShoppingCart, color: 'from-green-500 to-emerald-500' },
  { id: 'utbildning', label: 'Utbildning', icon: BookOpen, color: 'from-amber-500 to-orange-500' },
  { id: 'ekonomi', label: 'Ekonomi', icon: Calculator, color: 'from-slate-500 to-gray-600' },
  { id: 'offentlig-sektor', label: 'Offentlig sektor', icon: Building2, color: 'from-indigo-500 to-blue-600' },
  { id: 'kreativ', label: 'Kreativa yrken', icon: Palette, color: 'from-pink-500 to-rose-500' },
]

export default function PersonligtBrevGalleri() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const { scrollY } = useScroll()
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150])
  const backgroundOpacity = useTransform(scrollY, [0, 300], [1, 0.3])

  // Track mouse for gradient effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Filter examples
  const filteredExamples = useMemo(() => {
    return coverLetterExamples.filter(example => {
      const matchesCategory = selectedCategory === 'all' || example.kategori === selectedCategory
      const matchesSearch = example.yrke.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [selectedCategory, searchQuery])

  // Featured examples
  const featuredExamples = coverLetterExamples.filter(ex => ex.featured)

  const faqItems = [
    {
      q: 'Hur använder jag dessa personliga brev-exempel?',
      a: 'Klicka på det yrke som stämmer överens med jobbet du söker. Du får se ett komplett, ifyllt exempel som du kan inspireras av. Använd sedan vårt verktyg för att skapa ditt eget personliga brev – ladda upp ditt CV, klistra in jobbannonsen, välj mall. Klart på 60 sekunder.'
    },
    {
      q: 'Är exemplen ATS-optimerade?',
      a: 'Ja! Alla våra exempel följer en struktur som passar både ATS-system (Applicant Tracking Systems) och mänskliga rekryterare. Vi inkluderar rätt nyckelord från branschen och använder tydlig formatering.'
    },
    {
      q: 'Kan jag kopiera och klistra in exemplet direkt?',
      a: 'Vi rekommenderar INTE att kopiera exempel rakt av. Rekryterare ser igenom generiska brev direkt. Använd istället vårt verktyg som skapar ett unikt, skräddarsytt brev baserat på DIN bakgrund och det SPECIFIKA jobbet – automatiskt och på 60 sekunder.'
    },
    {
      q: 'Vad är skillnaden mellan ett bra och dåligt personligt brev?',
      a: 'Ett bra personligt brev är specifikt (nämner företaget och rollen), konkret (ger exempel på din erfarenhet), och relevant (kopplar din bakgrund till jobbet). Ett dåligt brev är generiskt, fokuserar på vad DU vill istället för vad DU kan bidra med, och upprepar bara ditt CV.'
    },
    {
      q: 'Hur långt ska mitt personliga brev vara?',
      a: 'Ett modernt personligt brev ska vara 250-400 ord - kortare än traditionella brev. Rekryterare har begränsad tid, så varje mening måste tillföra värde. Våra exempel följer denna längd.'
    },
    {
      q: 'Hur anpassar jag brevet för olika jobb inom samma yrke?',
      a: 'Använd grundstrukturen från exemplet, men anpassa: 1) Inledningen - nämn specifikt företag och roll, 2) Mellansektionen - välj erfarenheter som matchar just denna jobbannonss krav, 3) Avslutningen - koppla till företagets värderingar eller mål.'
    },
    {
      q: 'Behöver jag skriva ett nytt personligt brev för varje ansökan?',
      a: 'Ja, definitivt. Generiska brev sorteras bort direkt. Vårt verktyg gör detta enkelt – ladda upp CV, klistra in annons, välj mall. 60 sekunder senare har du ett unikt brev för det specifika jobbet.'
    },
    {
      q: 'Vad händer om mitt yrke inte finns i galleriet?',
      a: 'Välj det yrke som liknar ditt mest (t.ex. om du är "Redovisningsekonom", kolla "Ekonomiassistent"). Grundprincipen för personliga brev är likadan oavsett yrke. Eller använd vårt verktyg som fungerar för ALLA yrken.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50/50">
      <PremiumNavbar />

      {/* Hero Section - Enhanced with WOW factor */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Morphing gradient background */}
        <motion.div
          className="absolute inset-0"
          style={{ opacity: backgroundOpacity }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30" />

          {/* Mouse-following gradient */}
          <motion.div
            className="absolute w-[600px] h-[600px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
              left: mousePosition.x - 300,
              top: mousePosition.y - 300,
              filter: 'blur(40px)',
            }}
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />

          {/* Animated gradient orbs */}
          <motion.div
            className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full mix-blend-multiply filter blur-3xl"
            animate={{
              x: [0, -100, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        </motion.div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Hero Content */}
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Premium Badge */}
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full mb-6 border border-blue-100"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Sveriges största galleri med personliga brev-exempel
                </span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-[1.1]">
                Personligt brev exempel för{' '}
                <motion.span
                  className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ['0%', '100%', '0%'],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    repeatType: 'loop',
                  }}
                  style={{
                    backgroundSize: '200% 200%',
                  }}
                >
                  20+ yrken
                </motion.span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Se hur ett professionellt personligt brev ser ut för just ditt yrke. Alla exempel är skrivna av rekryteringsexperter, ATS-optimerade och anpassade efter svenska arbetsmarknaden.
              </p>

              {/* Hero Stats */}
              <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
                <motion.div
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-slate-900">20+</div>
                    <div className="text-xs text-slate-600">Yrkeskategorier</div>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-slate-900">10K+</div>
                    <div className="text-xs text-slate-600">Skapade brev</div>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-slate-900">89%</div>
                    <div className="text-xs text-slate-600">Får intervju</div>
                  </div>
                </motion.div>
              </div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Link href="#galleri">
                  <motion.button
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-lg rounded-2xl hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300"
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="flex items-center gap-3">
                      <Eye className="w-6 h-6" />
                      <span>Bläddra bland exempel</span>
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Examples Carousel */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Mest populära exemplen
              </h2>
              <p className="text-lg text-slate-600">
                Dessa yrken söks mest – börja här
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {featuredExamples.map((example, idx) => (
                <motion.div
                  key={example.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link href={`/personligt-brev-exempel/${example.slug}`}>
                    <motion.div
                      className="group relative h-full bg-gradient-to-br from-slate-50 to-white rounded-2xl border-2 border-slate-200 p-6 overflow-hidden cursor-pointer"
                      whileHover={{ y: -8, scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Gradient overlay */}
                      <motion.div
                        className={`absolute inset-0 bg-gradient-to-br ${example.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                      />

                      {/* Popular badge */}
                      <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        Populär
                      </div>

                      <div className="relative">
                        {/* Icon */}
                        <div className={`w-14 h-14 bg-gradient-to-br ${example.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                          <example.icon className="w-7 h-7 text-white" />
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {example.yrke}
                        </h3>

                        {/* Preview intro */}
                        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                          {example.preview.intro}
                        </p>

                        {/* Highlights */}
                        <div className="space-y-2 mb-4">
                          {example.preview.highlight.slice(0, 2).map((highlight, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-xs text-slate-600">{highlight}</span>
                            </div>
                          ))}
                        </div>

                        {/* CTA */}
                        <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
                          <span className="text-sm">Visa komplett exempel</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Gallery Section */}
      <section id="galleri" className="py-24 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Search and Filter Bar */}
            <motion.div
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {/* Search */}
              <div className="relative max-w-md mx-auto mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Sök efter yrke..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap justify-center gap-3">
                {categories.map((category) => (
                  <motion.button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${
                      selectedCategory === category.id
                        ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                        : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-blue-300 hover:shadow-md'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <category.icon className="w-4 h-4" />
                    {category.label}
                  </motion.button>
                ))}
              </div>

              {/* Results count */}
              <div className="text-center mt-6">
                <p className="text-sm text-slate-600">
                  Visar <span className="font-bold text-slate-900">{filteredExamples.length}</span> exempel
                  {searchQuery && ` för "${searchQuery}"`}
                </p>
              </div>
            </motion.div>

            {/* Gallery Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredExamples.map((example, idx) => (
                  <motion.div
                    key={example.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                  >
                    <Link href={`/personligt-brev-exempel/${example.slug}`}>
                      <motion.div
                        className="group relative h-full bg-white rounded-xl border border-slate-200 p-6 overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-shadow duration-300"
                        whileHover={{ y: -6 }}
                        transition={{ duration: 0.2 }}
                      >
                        {/* Gradient hover effect */}
                        <motion.div
                          className={`absolute inset-0 bg-gradient-to-br ${example.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                        />

                        <div className="relative">
                          {/* Icon */}
                          <div className={`w-12 h-12 bg-gradient-to-br ${example.gradient} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                            <example.icon className="w-6 h-6 text-white" />
                          </div>

                          {/* Content */}
                          <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {example.yrke}
                          </h3>

                          <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                            {example.preview.intro}
                          </p>

                          {/* Highlights */}
                          <div className="space-y-1.5 mb-4">
                            {example.preview.highlight.slice(0, 2).map((highlight, i) => (
                              <div key={i} className="flex items-start gap-1.5">
                                <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-xs text-slate-600 line-clamp-1">{highlight}</span>
                              </div>
                            ))}
                          </div>

                          {/* Footer */}
                          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                            <motion.div
                              className="flex items-center gap-1 text-blue-600 font-semibold text-sm"
                              initial={{ x: 0 }}
                              whileHover={{ x: 4 }}
                            >
                              <span>Se exempel</span>
                              <ArrowRight className="w-4 h-4" />
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Empty state */}
            {filteredExamples.length === 0 && (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Inga exempel hittades
                </h3>
                <p className="text-slate-600 mb-6">
                  Prova att söka efter ett annat yrke eller ta bort filtret
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                  }}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Återställ sökning
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section - Create your own */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Redo att skapa ditt eget personliga brev?
              </h2>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Inspirerad av exemplen? Skapa ditt eget personliga brev – ladda upp CV, klistra in jobbannonsen, välj mall. Klart på 60 sekunder, skräddarsytt för jobbet.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard/skapa-brev">
                  <motion.button
                    className="px-8 py-4 bg-white text-blue-600 font-bold text-lg rounded-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Sparkles className="w-6 h-6" />
                    Skapa mitt personliga brev nu
                  </motion.button>
                </Link>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-6 text-white/80 text-sm mt-8">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span>Färdigt på 60 sekunder</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span>Unikt för varje jobb</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span>ATS-optimerat</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Vanliga frågor
              </h2>
              <p className="text-lg text-slate-600">
                Allt du behöver veta om personliga brev
              </p>
            </div>

            <div className="space-y-4">
              {faqItems.map((item, idx) => (
                <motion.div
                  key={idx}
                  className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
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
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
