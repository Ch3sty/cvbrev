/**
 * Premium prissida för Jobbcoach.ai med WOW-faktor
 * Ljus, professionell design med skandinavisk minimalism
 * Fokus på att göra Premium till en "no-brainer" för 149 kr/månad
 */
'use client'

import { useState, useEffect, lazy, Suspense } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

// Custom components
import PremiumNavbar from '@/components/PremiumNavbar'
import DynamicTrustIndicator from '@/components/DynamicTrustIndicator'
import StatCard from '@/components/StatCard'
import { SubscribeButton } from '@/components/subscription/SubscribeButton'
import DualPricingCards from '@/components/pricing/DualPricingCards'

// Lazy load heavy components for performance
const AILiveWriting = lazy(() => import('@/components/AILiveWriting'))
const CompetenceAnalysisDemo = lazy(() => import('@/components/CompetenceAnalysisDemo'))

// Icons
import {
  CheckCircle, Lock, Zap, Save, Lightbulb, Gift, Repeat, Shield,
  Target, BrainCircuit, FileSearch, ChevronDown, ChevronUp, ArrowRight,
  Sparkles, Star, Users, Trophy, Clock, TrendingUp, Heart, Award,
  PenTool, Palette, BarChart, Mail, Phone, Globe, Code
} from 'lucide-react'

// Data Definitions
interface FaqItem {
  question: string
  answer: string
}

// FAQ data - fokuserad på verkligt värde och ärlig information
const pricingFaqItems: FaqItem[] = [
  {
    question: "Vad ingår i Gratis-planen?",
    answer: "Med Gratis-planen får du tillgång till grundfunktionerna: 5 personliga brev per vecka, 2 CV-analyser per vecka, 2 kompetensanalyser per vecka, 2 grundläggande CV-mallar, och lagring för upp till 2 brev. Det räcker för att komma igång och testa våra verktyg."
  },
  {
    question: "Vad får jag för 149 kr/månad?",
    answer: "Premium ger dig obegränsad tillgång till alla funktioner: skapa så många personliga brev som du behöver, obegränsade CV- och kompetensanalyser, alla 8 CV-mallar, smart tonalitetsanpassning, obegränsad lagring och export till Word/PDF. Ingen bindningstid."
  },
  {
    question: "Hur fungerar verktygen?",
    answer: "Du laddar upp ditt CV och klistrar in jobbannonsen. Våra verktyg analyserar båda och skapar ett skräddarsytt personligt brev på svenska på cirka 60 sekunder. Du kan välja mellan 5 olika tonaliteter eller låta systemet välja automatiskt baserat på jobbannonsen."
  },
  {
    question: "Vad händer om jag avbryter Premium?",
    answer: "Du behåller full tillgång under din betalda period. Efter det återgår ditt konto till Gratis-planen med begränsade funktioner, men alla dina sparade dokument och tidigare analyser försvinner inte."
  },
  {
    question: "Hur säkra är mina uppgifter?",
    answer: "Vi tar datasäkerhet på allvar. All data lagras säkert och krypterat, vi följer GDPR-reglerna, och använder Stripe för säkra betalningar. Din CV och personliga information delas aldrig med tredje part."
  },
  {
    question: "Kan jag verkligen avbryta när som helst?",
    answer: "Ja, helt utan krångel. Ingen bindningstid, inga avbokningsavgifter, inga frågor. Du kan avbryta direkt i dina kontoinställningar eller kontakta vår support. Vi tjänar din fortsatta användning genom att leverera värde, inte genom att låsa in dig."
  }
]

// Trust indicators data - faktiska funktioner
const trustStats = [
  { number: "60", label: "Sekunder per brev", icon: Clock },
  { number: "8", label: "Professionella CV-mallar", icon: PenTool },
  { number: "5+1", label: "Tonaliteter (inkl. Auto)", icon: Palette },
  { number: "Svenskt", label: "Språk och marknadsfokus", icon: BrainCircuit }
]

// Premium features data - verkliga funktioner med nytta-fokus
const premiumFeatures = [
  {
    icon: Zap,
    title: "Obegränsade personliga brev",
    description: "Ansök till alla jobb du vill utan att vänta - ingen vecko-begränsning",
    gradient: "from-blue-500/20 to-indigo-500/20"
  },
  {
    icon: FileSearch,
    title: "Djupgående analyser när du behöver",
    description: "Få detaljerad feedback på ditt CV och kompetenser utan begränsningar",
    gradient: "from-indigo-500/20 to-purple-500/20"
  },
  {
    icon: Palette,
    title: "Alla 8 professionella mallar",
    description: "Från minimalistisk till executive-nivå - välj den som passar din bransch",
    gradient: "from-purple-500/20 to-pink-500/20"
  },
  {
    icon: BrainCircuit,
    title: "Automatisk tonalitetsoptimering",
    description: "Systemet anpassar automatiskt din brevstil till företaget och rollen",
    gradient: "from-pink-500/20 to-red-500/20"
  },
  {
    icon: Save,
    title: "Spara allt du skapar",
    description: "Bygg upp ditt bibliotek av anpassade brev och analyser",
    gradient: "from-green-500/20 to-teal-500/20"
  },
  {
    icon: Code,
    title: "Professionell export",
    description: "Ladda ner färdiga dokument i Word eller PDF - redo att skicka",
    gradient: "from-teal-500/20 to-cyan-500/20"
  }
]

// Sub-Components

// Premium FAQ Accordion with light theme and smooth animations
const FaqAccordion = ({ items }: { items: FaqItem[] }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const handleClick = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const isOpen = openIndex === index
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
          >
            <motion.button
              onClick={() => handleClick(index)}
              className="flex justify-between items-center w-full px-6 py-4 text-left hover:bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 transition-all duration-200 rounded-xl"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${index}`}
            >
              <span className="font-semibold text-slate-900 text-lg pr-4">
                {item.question}
              </span>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <ChevronDown className="w-5 h-5 text-blue-600 flex-shrink-0" />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div id={`faq-answer-${index}`} className="px-6 pb-6 pt-2 border-t border-gray-100">
                    <p className="text-slate-700 leading-relaxed text-base">
                      {item.answer}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}
    </div>
  )
}


// Main Page Component

export default function PriserPage() {
  const [session, setSession] = useState<any>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [applicationsPerMonth, setApplicationsPerMonth] = useState(10)
  const [timePerLetter, setTimePerLetter] = useState(2.5)

  // Scroll animations
  const { scrollY } = useScroll()
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150])
  const backgroundOpacity = useTransform(scrollY, [0, 300], [1, 0.8])

  // Stripe Price ID - endast månadsplan
  const premiumMonthlyPriceId = "price_1SQSVlPWMWdjmTDjx1yo9m00"
  const premiumMonthlyPrice = 149

  // Track mouse for gradient effect
  useEffect(() => {
    let animationFrameId: number

    const handleMouseMove = (e: MouseEvent) => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }

      animationFrameId = requestAnimationFrame(() => {
        setMousePosition({ x: e.clientX, y: e.clientY })
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [])

  // Get session on page load
  useEffect(() => {
    async function getSession() {
      try {
        setIsLoading(true)
        const { getSupabaseClient } = await import('@/lib/supabase/client-manager')
        const supabase = getSupabaseClient()
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Fel vid hämtning av session:', error.message)
          setSession(null)
        } else {
          setSession(data.session)
        }
      } catch (error) {
        console.error('Oväntat fel i getSession:', error)
        setSession(null)
      } finally {
        setIsLoading(false)
      }
    }
    getSession()
  }, [])

  // Loading state with enhanced bright theme
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white via-white to-slate-50/20">
        <motion.div
          className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full shadow-lg"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          role="status"
          aria-label="Laddar innehåll"
        >
          <span className="sr-only">Laddar...</span>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-slate-600 font-medium"
        >
          Laddar priser...
        </motion.p>
      </div>
    )
  }

  // Main page content
  return (
    <>
      {/* SEO Metadata */}
      <Head>
        <title>Priser | Jobbcoach.ai - Premium karriärcoach för 149 kr/månad</title>
        <meta name="description" content="Endast 149 kr/månad för obegränsad tillgång till professionella personliga brev, djupgående CV-analyser och karriärcoaching. Gratis plan tillgänglig. Ingen bindningstid." />
        <meta name="keywords" content="priser jobbcoach.ai, premium karriärcoach, personligt brev pris, CV-analys kostnad, 149 kr månad jobbcoach" />
        <meta property="og:title" content="Priser | Jobbcoach.ai - Premium verktyg för 149 kr/månad" />
        <meta property="og:description" content="Transparent prissättning: Premium för 149 kr/månad eller starta gratis. Obegränsade möjligheter för din karriär. Ingen bindningstid." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://jobbcoach.ai/priser" />
        <meta property="og:image" content="https://jobbcoach.ai/images/jobbcoach-og-pricing.png" />
        <link rel="canonical" href="https://jobbcoach.ai/priser" />
      </Head>

      {/* Light theme main container with enhanced brightness */}
      <div className="min-h-screen bg-gradient-to-b from-white via-white to-slate-50/30 relative overflow-hidden">
        {/* Enhanced animated background effects with brighter colors */}
        <div className="absolute inset-0 -z-10">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/15 to-purple-400/15 rounded-full mix-blend-normal filter blur-3xl opacity-60"
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
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-pink-400/15 to-orange-400/15 rounded-full mix-blend-normal filter blur-3xl opacity-60"
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
          <motion.div
            className="absolute top-1/2 left-1/2 w-80 h-80 bg-gradient-to-br from-green-400/8 to-teal-400/8 rounded-full mix-blend-normal filter blur-3xl opacity-50"
            animate={{
              x: ['-50%', '-45%', '-55%', '-50%'],
              y: ['-50%', '-45%', '-55%', '-50%'],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        </div>

        {/* Mouse-following gradient background - lighter */}
        <motion.div
          className="fixed inset-0 opacity-20 pointer-events-none z-0"
          style={{
            background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px,
            rgba(59, 130, 246, 0.08),
            rgba(99, 102, 241, 0.05),
            transparent 60%)`
          }}
          animate={{
            background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px,
            rgba(59, 130, 246, 0.08),
            rgba(99, 102, 241, 0.05),
            transparent 60%)`
          }}
          transition={{ type: "tween", ease: "easeOut", duration: 0.1 }}
        />

        {/* Premium Navigation */}
        <PremiumNavbar />

        {/* Hero Section */}
        <section className="relative pt-32 pb-16 overflow-hidden">
          <div className="container relative px-4 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-4xl mx-auto text-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="mb-6"
              >
                <span className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full border border-blue-200">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Transparent prissättning - inga dolda kostnader
                </span>
              </motion.div>

              <h1 className="mb-6 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900">
                Professionella verktyg för
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  din nästa karriärsteg
                </span>
              </h1>

              <p className="max-w-2xl mx-auto mb-8 text-xl text-slate-600 leading-relaxed">
                Skapa skräddarsydda personliga brev och få djupgående CV-analyser på svenska - på 60 sekunder.
                <strong className="text-slate-900"> Börja gratis eller få obegränsad tillgång för 149 kr/mån.</strong>
              </p>

              {/* Dynamic Trust Indicators with Live Updates */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="mb-12"
              >
                <DynamicTrustIndicator />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Pricing Cards Section */}
        <section className="py-12 bg-gradient-to-b from-white to-slate-50/30">
          <DualPricingCards showPricing={true} />
        </section>

        {/* Interactive Demo Section - Show Premium Features in Action */}
        <section className="py-20 bg-white overflow-hidden">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Se vad du får med <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Premium</span>
              </h2>
              <p className="text-xl text-slate-600">
                Upplev kraften i våra verktyg - se personliga brev och kompetensanalyser skapas i realtid
              </p>
            </motion.div>

            {/* Live AI Writing Demo */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-3xl mx-auto mb-16"
            >
              <Suspense fallback={
                <div className="flex items-center justify-center h-96">
                  <motion.div
                    className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              }>
                <AILiveWriting />
              </Suspense>
            </motion.div>

            {/* Competence Analysis Demo */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="max-w-6xl mx-auto mb-12"
            >
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-slate-900 mb-4">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">Kompetensanalys</span> - Hitta din väg framåt
                </h3>
                <p className="text-lg text-slate-600">
                  Se hur våra verktyg analyserar dina färdigheter och skapar en personlig utvecklingsplan
                </p>
              </div>
              <Suspense fallback={
                <div className="flex items-center justify-center h-96">
                  <motion.div
                    className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              }>
                <CompetenceAnalysisDemo />
              </Suspense>
            </motion.div>

            {/* Feature highlights with animations */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12"
            >
              {[
                { number: "60", label: "sekunder", desc: "från start till färdigt brev" },
                { number: "5+1", label: "tonaliteter", desc: "inklusive smart auto-val" },
                { number: "100%", label: "anpassat", desc: "för varje specifik roll" }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  className="text-center p-4"
                >
                  <div className="text-3xl font-bold text-blue-600 mb-1">{item.number}</div>
                  <div className="text-lg font-semibold text-slate-900">{item.label}</div>
                  <div className="text-sm text-slate-600">{item.desc}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Pricing Plans Section */}
        <section id="pricing-plans" className="py-20 relative bg-gradient-to-b from-white via-slate-50/30 to-white overflow-hidden">
          {/* Floating background elements */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-pink-400/10 to-purple-400/10 rounded-full filter blur-3xl"
              animate={{
                x: [0, 50, 0],
                y: [0, -30, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                repeatType: 'reverse'
              }}
            />
            <motion.div
              className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full filter blur-3xl"
              animate={{
                x: [0, -40, 0],
                y: [0, 40, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                repeatType: 'reverse'
              }}
            />
          </div>

          <div className="container px-4 mx-auto relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Transparent prissättning - <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">äkta värde</span>
              </h2>
              <p className="text-xl text-slate-600 mb-4">
                Testa gratis först, sedan bestäm om du vill ha obegränsad tillgång till alla verktyg.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-sm font-semibold rounded-full border border-green-200 shadow-sm"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Ingen bindningstid • Transparenta priser • Spara 15-20 timmar per månad
              </motion.div>
            </motion.div>

            <div className="grid max-w-7xl gap-8 mx-auto lg:grid-cols-2 items-stretch">
              {/* Free Plan with enhanced 3D design */}
              <motion.div
                initial={{ opacity: 0, x: -40, rotateY: -5 }}
                whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1 }}
                whileHover={{
                  y: -12,
                  rotateY: 2,
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 300, damping: 20 }
                }}
                className="relative group perspective-1000"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Floating particles for free plan */}
                <motion.div
                  className="absolute -top-2 -left-2 w-4 h-4 bg-green-400 rounded-full opacity-60"
                  animate={{
                    y: [-5, -15, -5],
                    opacity: [0.3, 0.7, 0.3]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.div
                  className="absolute -top-1 -right-3 w-2 h-2 bg-blue-400 rounded-full opacity-50"
                  animate={{
                    y: [-3, -10, -3],
                    x: [0, 5, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                />

                <div className="flex flex-col h-full bg-white/90 backdrop-blur-lg border border-gray-200/60 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden relative">
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white via-green-50/20 to-blue-50/20 pointer-events-none" />

                  {/* Animated border glow */}
                  <motion.div
                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: 'linear-gradient(45deg, #10B981, #3B82F6, #10B981)',
                      backgroundSize: '200% 200%',
                      padding: '2px',
                      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      WebkitMaskComposite: 'exclude'
                    }}
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />

                  <div className="p-8 flex-grow relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-slate-900">Gratis</h3>
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-sm font-bold rounded-full border border-green-200 shadow-sm"
                      >
                        För att testa
                      </motion.div>
                    </div>

                    <p className="text-slate-600 mb-6 leading-relaxed">
                      Perfekt för att uppleva våra smarta verktyg och testa grundfunktionerna
                    </p>

                    <div className="mb-8">
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        className="text-5xl font-bold text-slate-900 inline-block"
                      >
                        0 kr
                      </motion.span>
                      <span className="text-slate-600 ml-2">/ för alltid</span>
                    </div>

                    <div className="space-y-4">
                      <p className="font-semibold text-slate-900 mb-4">Detta ingår:</p>

                      <div className="space-y-3">
                        {[
                          '5 personliga brev per vecka',
                          '2 CV-analyser per vecka',
                          '2 kompetensanalyser per vecka',
                          '2 grundläggande CV-mallar',
                          'Spara upp till 2 brev'
                        ].map((feature, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 + idx * 0.1 }}
                            whileHover={{ x: 5 }}
                            className="flex items-center group/item"
                          >
                            <motion.div
                              whileHover={{ scale: 1.2, rotate: 360 }}
                              transition={{ duration: 0.3 }}
                            >
                              <CheckCircle className="w-6 h-6 sm:w-5 sm:h-5 text-green-500 mr-3 flex-shrink-0" />
                            </motion.div>
                            <span className="text-sm sm:text-base text-slate-700 group-hover/item:text-slate-900 transition-colors">{feature}</span>
                          </motion.div>
                        ))}

                        {/* Locked features with animated locks */}
                        <div className="pt-4 border-t border-gray-100">
                          {[
                            'Obegränsade brev (Premium)',
                            '6 extra CV-mallar (Premium)',
                            'Auto-tonalitet (Premium)',
                            'Export till Word/PDF (Premium)'
                          ].map((feature, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0 }}
                              whileInView={{ opacity: 1 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.6 + idx * 0.1 }}
                              className="flex items-center opacity-60 mt-2 group/locked"
                            >
                              <motion.div
                                whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                                transition={{ duration: 0.5 }}
                              >
                                <Lock className="w-6 h-6 sm:w-5 sm:h-5 text-gray-400 mr-3 flex-shrink-0" />
                              </motion.div>
                              <span className="text-sm sm:text-base text-slate-500 group-hover/locked:text-slate-600 transition-colors">{feature}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 pt-0 relative z-10">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        href="/register"
                        className="flex items-center justify-center w-full min-h-[44px] touch-manipulation px-6 py-4 font-semibold text-slate-700 bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 rounded-2xl transition-all duration-300 group border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md relative overflow-hidden"
                      >
                        {/* Button shine effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
                          whileHover={{ x: ['100%', '200%'] }}
                          transition={{ duration: 0.6, ease: "easeInOut" }}
                        />
                        Starta gratis
                        <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Premium Plan with spectacular 3D design */}
              <motion.div
                initial={{ opacity: 0, x: 40, rotateY: 5 }}
                whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                whileHover={{
                  y: -16,
                  rotateY: -3,
                  scale: 1.03,
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }
                }}
                className="relative group perspective-1000 transform-gpu"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Floating particles for premium plan */}
                <motion.div
                  className="absolute -top-3 -left-3 w-6 h-6 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full"
                  animate={{
                    y: [-8, -20, -8],
                    rotate: [0, 360, 720],
                    scale: [0.8, 1.2, 0.8],
                    opacity: [0.4, 0.8, 0.4]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.div
                  className="absolute -top-2 -right-4 w-3 h-3 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full"
                  animate={{
                    y: [-5, -15, -5],
                    x: [0, -8, 0],
                    scale: [0.6, 1, 0.6]
                  }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1.5
                  }}
                />
                <motion.div
                  className="absolute top-10 -right-2 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                  animate={{
                    y: [-3, -12, -3],
                    x: [0, 6, 0],
                    opacity: [0.3, 0.9, 0.3]
                  }}
                  transition={{
                    duration: 2.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.8
                  }}
                />

                {/* Spectacular Popular Badge */}
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.8 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-30"
                >
                  <div className="relative">
                    <div className="px-6 py-3 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white text-sm font-bold rounded-2xl shadow-2xl border border-white/20 backdrop-blur-sm">
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="inline-block mr-2"
                      >
                        ⭐
                      </motion.div>
                      Mest populär
                    </div>
                    {/* Badge glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-indigo-600 rounded-2xl opacity-30 blur-md -z-10" />
                  </div>
                </motion.div>

                {/* Premium card with enhanced effects */}
                <div className="flex flex-col h-full bg-white/95 backdrop-blur-xl border-2 border-pink-200/60 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden relative transform-gpu">
                  {/* Dynamic animated background */}
                  <motion.div
                    className="absolute inset-0 opacity-60 pointer-events-none"
                    animate={{
                      background: [
                        'linear-gradient(45deg, rgba(219,39,119,0.1) 0%, rgba(147,51,234,0.1) 100%)',
                        'linear-gradient(90deg, rgba(147,51,234,0.1) 0%, rgba(59,130,246,0.1) 100%)',
                        'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(219,39,119,0.1) 100%)',
                        'linear-gradient(45deg, rgba(219,39,119,0.1) 0%, rgba(147,51,234,0.1) 100%)'
                      ]
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />

                  {/* Premium border animation */}
                  <motion.div
                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: 'linear-gradient(45deg, #EC4899, #8B5CF6, #3B82F6, #EC4899)',
                      backgroundSize: '300% 300%',
                      padding: '2px',
                      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      WebkitMaskComposite: 'exclude'
                    }}
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />

                  {/* Magical shine effect on hover */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full z-20 pointer-events-none"
                    whileHover={{
                      x: ['100%', '200%'],
                      transition: { duration: 1.2, ease: "easeInOut" }
                    }}
                  />

                  {/* Pulsing glow background */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-pink-50/50 via-purple-50/30 to-blue-50/50 pointer-events-none"
                    animate={{
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />

                  <div className="p-8 flex-grow relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <motion.h3
                        whileHover={{ scale: 1.05 }}
                        className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600"
                      >
                        Premium
                      </motion.h3>
                      <motion.div
                        whileHover={{ scale: 1.15, rotate: 10 }}
                        className="px-4 py-2 bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 text-purple-700 text-sm font-bold rounded-full border border-purple-200 shadow-sm"
                      >
                        Obegränsat
                      </motion.div>
                    </div>

                    <p className="text-slate-600 mb-6 leading-relaxed">
                      Få tillgång till alla funktioner för 149 kr/mån - mindre än en arbetslunch kostar. Perfekt för seriös jobbsökning.
                    </p>

                    <div className="mb-8">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="inline-block"
                      >
                        <span className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900">
                          {premiumMonthlyPrice} kr
                        </span>
                      </motion.div>
                      <span className="text-slate-600 ml-3 text-lg">/ månad</span>
                      <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-sm text-slate-500 mt-2 flex items-center gap-1"
                      >
                        <Heart className="w-3 h-3 text-pink-500" />
                        Ingen bindningstid • Avsluta när som helst
                      </motion.p>
                    </div>

                    <div className="space-y-4">
                      <p className="font-semibold text-slate-900 mb-4">Allt i Gratis, plus:</p>

                      <div className="space-y-3">
                        {premiumFeatures.map((feature, index) => {
                          const IconComponent = feature.icon
                          return (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.4 + index * 0.1 }}
                              whileHover={{
                                x: 8,
                                scale: 1.02,
                                transition: { duration: 0.2 }
                              }}
                              className="flex items-start group/feature cursor-pointer"
                            >
                              <motion.div
                                whileHover={{
                                  scale: 1.2,
                                  rotate: 360,
                                  transition: { duration: 0.5 }
                                }}
                                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mr-4 flex-shrink-0 shadow-sm group-hover/feature:shadow-md transition-shadow`}
                              >
                                <IconComponent className="w-5 h-5 text-purple-600 group-hover/feature:text-purple-700" />
                              </motion.div>
                              <div className="flex-grow">
                                <div className="font-semibold text-slate-900 group-hover/feature:text-purple-900 transition-colors">{feature.title}</div>
                                <div className="text-sm text-slate-600 group-hover/feature:text-slate-700 transition-colors">{feature.description}</div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="p-8 pt-0 relative z-10">
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative"
                    >
                      {session ? (
                        <SubscribeButton
                          priceId={premiumMonthlyPriceId}
                          planName="Premium"
                          className="flex items-center justify-center w-full min-h-[44px] touch-manipulation px-8 py-5 font-bold text-white bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-700 hover:via-purple-700 hover:to-indigo-700 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl group relative overflow-hidden border border-white/20"
                        />
                      ) : (
                        <Link
                          href="/trial-signup"
                          className="flex items-center justify-center w-full min-h-[44px] touch-manipulation px-6 sm:px-8 py-5 font-bold text-sm sm:text-base text-white bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-700 hover:via-purple-700 hover:to-indigo-700 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl group relative overflow-hidden border border-white/20"
                        >
                          {/* Button magical effect */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full"
                            whileHover={{
                              x: ['100%', '200%'],
                              transition: { duration: 0.8, ease: "easeInOut" }
                            }}
                          />
                          <Sparkles className="w-5 h-5 mr-2 sm:mr-3" />
                          <span className="hidden sm:inline">Uppgradera till Premium</span>
                          <span className="sm:hidden">Till Premium</span>
                          <ArrowRight className="w-5 h-5 ml-2 sm:ml-3 transition-transform group-hover:translate-x-2" />
                        </Link>
                      )}

                      {/* Button glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 rounded-2xl opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-300 -z-10" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="mt-12 text-center text-slate-500"
            >
              Alla priser inkluderar moms. Säkra betalningar via Stripe. Ingen bindningstid.
            </motion.p>
          </div>
        </section>

        {/* Why Premium Section */}
        <section className="py-20 bg-gradient-to-b from-white via-slate-50/20 to-white">
          <div className="container px-4 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Varför väljer erfarna yrkespersoner <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Premium?</span>
              </h2>
              <p className="text-xl text-slate-600">
                För att tid är dyrare än 149 kr/månad. Spara 15-20 timmar månadsvis och fokusera på att få jobbet, inte skriva ansökningar.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  icon: Zap,
                  title: "Ansök till alla jobb",
                  description: "Skapa personliga brev och analyser för varje intressant position utan att oroa dig för begränsningar",
                  gradient: "from-yellow-400/20 to-orange-400/20",
                  iconColor: "text-yellow-600"
                },
                {
                  icon: FileSearch,
                  title: "Förbättra ditt CV kontinuerligt",
                  description: "Få konkret feedback med ATS-poäng, saknade nyckelord och förslag på förbättringar",
                  gradient: "from-purple-400/20 to-pink-400/20",
                  iconColor: "text-purple-600"
                },
                {
                  icon: Target,
                  title: "Perfekt tonalitet varje gång",
                  description: "Automatisk anpassning av brevets stil till företagets kultur och rollens krav",
                  gradient: "from-green-400/20 to-teal-400/20",
                  iconColor: "text-green-600"
                }
              ].map((benefit, index) => {
                const IconComponent = benefit.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2, duration: 0.6 }}
                    whileHover={{
                      y: -8,
                      transition: { type: "spring", stiffness: 300, damping: 20 }
                    }}
                    className="group"
                  >
                    <div className={`p-8 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center h-full bg-gradient-to-br ${benefit.gradient}`}>
                      <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm">
                        <IconComponent className={`w-8 h-8 ${benefit.iconColor}`} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">
                        {benefit.title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Always Included Section */}
        <section className="py-20 bg-gradient-to-b from-white to-slate-50/20">
          <div className="container px-4 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Trygghet & flexibilitet ingår alltid
              </h2>
              <p className="text-xl text-slate-600">
                Oavsett vilken plan du väljer får du dessa förmåner från dag ett
              </p>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
              {[
                {
                  icon: Gift,
                  title: "Ingen bindningstid",
                  description: "Avsluta när som helst utan avgifter eller krångel",
                  color: "text-pink-600",
                  gradient: "from-pink-400/10 to-rose-400/10"
                },
                {
                  icon: Repeat,
                  title: "Obegränsade revisioner",
                  description: "Justera och förbättra AI-utkast tills du är nöjd",
                  color: "text-blue-600",
                  gradient: "from-blue-400/10 to-indigo-400/10"
                },
                {
                  icon: Shield,
                  title: "Datasäkerhet",
                  description: "GDPR-kompatibel och krypterad lagring av alla dina uppgifter",
                  color: "text-green-600",
                  gradient: "from-green-400/10 to-teal-400/10"
                }
              ].map((benefit, index) => {
                const IconComponent = benefit.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15, duration: 0.6 }}
                    className="group"
                  >
                    <div className={`flex flex-col md:flex-row items-start md:items-center p-6 bg-gradient-to-br ${benefit.gradient} border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 h-full`}>
                      <div className="flex items-center justify-center w-12 h-12 mb-4 md:mb-0 md:mr-4 bg-white rounded-xl shadow-sm flex-shrink-0">
                        <IconComponent className={`w-6 h-6 ${benefit.color}`} />
                      </div>
                      <div className="flex-grow text-center md:text-left">
                        <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {benefit.title}
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq-pricing" className="py-20 bg-gradient-to-b from-white via-slate-50/20 to-white">
          <div className="container px-4 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Vanliga frågor
              </h2>
              <p className="text-xl text-slate-600">
                Svar på de vanligaste frågorna om priser och funktioner
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              <FaqAccordion items={pricingFaqItems} />
            </div>
          </div>
        </section>

        {/* Real Value Section */}
        <section className="py-20 bg-gradient-to-b from-white via-blue-50/20 to-slate-50/30">
          <div className="container px-4 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Vad får du med <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Premium?</span>
              </h2>
              <p className="text-xl text-slate-600">
                Konkreta verktyg som sparar tid och förbättrar dina chanser
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-xl p-8 mb-8"
              >
                <div className="grid gap-6 md:grid-cols-2">
                  {[
                    {
                      icon: Clock,
                      title: "Tidsbesparing",
                      value: "60 sekunder per brev",
                      description: "Istället för 2-3 timmar manuellt skrivande"
                    },
                    {
                      icon: Target,
                      title: "Skräddarsydda brev",
                      value: "Anpassade för varje roll",
                      description: "Analyserar både CV och jobbannons"
                    },
                    {
                      icon: FileSearch,
                      title: "ATS-optimering",
                      value: "Höjd genomslagskraft",
                      description: "CV-analys med ATS-poäng och nyckelord"
                    },
                    {
                      icon: Zap,
                      title: "Professionell kvalitet",
                      value: "8 CV-mallar",
                      description: "Designade för svenska arbetsmarknaden"
                    }
                  ].map((item, index) => {
                    const IconComponent = item.icon
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="text-center p-6 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-xl"
                      >
                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl">
                          <IconComponent className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                        <div className="text-lg font-semibold text-blue-600 mb-2">{item.value}</div>
                        <p className="text-sm text-slate-600">{item.description}</p>
                      </motion.div>
                    )
                  })}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                  <div className="text-2xl font-bold text-slate-900 mb-2">149 kr/månad</div>
                  <p className="text-slate-600">Investering som sparar dig 15-20 timmar månadsvis</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Interactive ROI Calculator Section */}
        <section className="py-20 bg-gradient-to-b from-slate-50/30 via-blue-50/15 to-white">
          <div className="container px-4 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                En investering som <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">sparar dig tid</span>
              </h2>
            </motion.div>

            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-xl p-8"
              >
                {/* Interactive Calculator Controls */}
                <div className="mb-8 p-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl">
                  <h3 className="font-bold text-slate-900 mb-6 text-center">Anpassa efter din situation</h3>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                        Hur många jobb söker du per månad?
                      </label>
                      <div className="flex items-center gap-4">
                        <motion.input
                          type="range"
                          min="5"
                          max="30"
                          value={applicationsPerMonth}
                          onChange={(e) => setApplicationsPerMonth(Number(e.target.value))}
                          className="flex-1 accent-blue-600 touch-manipulation min-h-[44px]"
                          whileFocus={{ scale: 1.02 }}
                        />
                        <div className="w-12 sm:w-16 text-center font-bold text-slate-900 text-sm sm:text-base">
                          {applicationsPerMonth}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                        Timmar per personligt brev (manuellt)
                      </label>
                      <div className="flex items-center gap-4">
                        <motion.input
                          type="range"
                          min="1"
                          max="4"
                          step="0.5"
                          value={timePerLetter}
                          onChange={(e) => setTimePerLetter(Number(e.target.value))}
                          className="flex-1 accent-blue-600 touch-manipulation min-h-[44px]"
                          whileFocus={{ scale: 1.02 }}
                        />
                        <div className="w-12 sm:w-16 text-center font-bold text-slate-900 text-sm sm:text-base">
                          {timePerLetter}h
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calculated Results */}
                <div className="grid md:grid-cols-2 gap-8">
                  <motion.div
                    className="text-center"
                    key={`time-${applicationsPerMonth}-${timePerLetter}`}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl flex items-center justify-center">
                      <TrendingUp className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Tid du sparar</h3>
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {Math.round(applicationsPerMonth * timePerLetter)} tim
                    </div>
                    <p className="text-slate-700 text-sm">Per månad med våra verktyg</p>
                  </motion.div>

                  <motion.div
                    className="text-center"
                    key={`value-${applicationsPerMonth}-${timePerLetter}`}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl flex items-center justify-center">
                      <Clock className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Värde av tiden</h3>
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {Math.round(applicationsPerMonth * timePerLetter * 100)} kr
                    </div>
                    <p className="text-slate-700 text-sm">Vid 100 kr/timme</p>
                  </motion.div>
                </div>

                <motion.div
                  className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <h4 className="font-bold text-slate-900 text-center mb-4">Din personliga kalkyl</h4>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-white/80 rounded-lg">
                      <div className="text-lg font-semibold text-slate-800 mb-2">Premium kostnad</div>
                      <div className="text-3xl font-bold text-blue-600">149 kr/mån</div>
                      <div className="text-sm text-slate-600 mt-1">Ingen bindningstid</div>
                    </div>

                    <motion.div
                      className="text-center p-4 bg-white/80 rounded-lg"
                      key={`saved-${applicationsPerMonth}-${timePerLetter}`}
                      animate={{ scale: [1, 1.02, 1] }}
                    >
                      <div className="text-lg font-semibold text-slate-800 mb-2">Du sparar</div>
                      <div className="text-2xl font-bold text-slate-800">
                        {Math.round(applicationsPerMonth * timePerLetter)} timmar/mån
                      </div>
                      <div className="text-sm text-slate-600 mt-1">
                        = {Math.round(applicationsPerMonth * timePerLetter * 100)} kr i tidsvärde
                      </div>
                    </motion.div>

                    <motion.div
                      className="text-center mt-6 p-4 rounded-lg"
                      style={{
                        backgroundColor: (applicationsPerMonth * timePerLetter * 100) > 149 ? '#dcfce7' : '#fef3c7'
                      }}
                      key={`result-${applicationsPerMonth}-${timePerLetter}`}
                      animate={{ scale: [1, 1.03, 1] }}
                    >
                      <div className="text-lg font-bold" style={{
                        color: (applicationsPerMonth * timePerLetter * 100) > 149 ? '#166534' : '#92400e'
                      }}>
                        {(applicationsPerMonth * timePerLetter * 100) > 149
                          ? `Du sparar ${Math.round((applicationsPerMonth * timePerLetter * 100) - 149)} kr netto per månad!`
                          : 'Öka antalet ansökningar för att maximera värdet'
                        }
                      </div>
                      <div className="text-sm mt-2" style={{
                        color: (applicationsPerMonth * timePerLetter * 100) > 149 ? '#15803d' : '#b45309'
                      }}>
                        Plus professionell kvalitet på alla ansökningar
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>


        {/* Why Choose Jobbcoach Section */}
        <section className="py-20 bg-gradient-to-b from-white via-slate-50/20 to-white">
          <div className="container px-4 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Varför välja <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Jobbcoach.ai?</span>
              </h2>
              <p className="text-xl text-slate-600">
                Verktyg byggda specifikt för svenska arbetsmarknaden - inte översatta från engelska
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
              {[
                {
                  title: "Byggd för Sverige",
                  description: "Svenska språket, svenska företagskultur, svenska CV-standarder. Inte bara översatt från engelska.",
                  icon: Award,
                  color: "from-blue-500/20 to-indigo-500/20"
                },
                {
                  title: "Konkreta resultat",
                  description: "60 sekunder från jobbannons till färdigt personligt brev. Spara 2-3 timmar per ansökan.",
                  icon: Clock,
                  color: "from-green-500/20 to-teal-500/20"
                },
                {
                  title: "Komplett lösning",
                  description: "Personliga brev, CV-analys med ATS-poäng, kompetensanalys och professionella mallar på samma plats.",
                  icon: Zap,
                  color: "from-purple-500/20 to-pink-500/20"
                },
                {
                  title: "Ingen risk",
                  description: "Börja gratis, testa allt. Uppgradera när du ser värdet. Ingen bindningstid, avbryt när som helst.",
                  icon: Shield,
                  color: "from-yellow-500/20 to-orange-500/20"
                }
              ].map((benefit, index) => {
                const IconComponent = benefit.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2, duration: 0.6 }}
                    className="group"
                  >
                    <div className={`p-8 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 h-full bg-gradient-to-br ${benefit.color}`}>
                      <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm">
                        <IconComponent className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors text-center">
                        {benefit.title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed text-center">
                        {benefit.description}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Final CTA Section - Improved with better contrast */}
        <section className="relative py-24 bg-gradient-to-br from-slate-800 via-blue-800 to-indigo-800 overflow-hidden">
          {/* Background Pattern with better contrast */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '2s' }} />
          </div>

          <div className="container relative px-4 mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto"
            >
              <div className="mb-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="inline-flex items-center px-6 py-3 bg-white/90 backdrop-blur-sm text-slate-900 text-sm font-bold rounded-full border border-white/30 mb-6 shadow-lg"
                >
                  <Award className="w-5 h-5 mr-2 text-blue-600" />
                  Premium karriärcoach för svenska yrkesverksamma
                </motion.div>
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Redo för ditt nästa
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300 drop-shadow-sm">
                  karriärsteg?
                </span>
              </h2>

              <p className="max-w-2xl mx-auto text-xl md:text-2xl text-white mb-12 leading-relaxed drop-shadow-sm">
                Börja gratis idag. Uppgradera till Premium när du vill ha obegränsad tillgång. Ingen bindningstid.
              </p>

              {/* Enhanced Trust Indicators with better contrast */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="mb-12"
              >
                <div className="text-center p-6 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg max-w-2xl mx-auto">
                  <div className="text-lg font-semibold text-slate-800 mb-2">
                    Spara 15-20 timmar per månad
                  </div>
                  <div className="text-slate-600">
                    Med verktyg som skapar professionella ansökningar på 60 sekunder - specialbyggda för Sverige
                  </div>
                </div>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              >
                {!session ? (
                  <>
                    {/* Premium CTA */}
                    <Link
                      href="/trial-signup"
                      className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 min-w-[280px] overflow-hidden"
                    >
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                      <Sparkles className="w-5 h-5 mr-3 text-blue-600" />
                      Uppgradera till Premium
                      <ArrowRight className="w-5 h-5 ml-3 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>

                    {/* Free CTA */}
                    <Link
                      href="/register"
                      className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white/50 hover:border-white rounded-2xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 min-w-[280px]"
                    >
                      Starta gratis
                      <ArrowRight className="w-5 h-5 ml-3 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </>
                ) : (
                  <SubscribeButton
                    priceId={premiumMonthlyPriceId}
                    planName="Premium"
                    className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 min-w-[280px] overflow-hidden"
                  />
                )}
              </motion.div>

              {/* Security Badge */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-white/70 text-sm"
              >
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Säkra betalningar via Stripe
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Ingen bindningstid
                </div>
                <div className="flex items-center">
                  <Heart className="w-4 h-4 mr-2" />
                  GDPR-kompatibel
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

      </div>
    </>
  )
}