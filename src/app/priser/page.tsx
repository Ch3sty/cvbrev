/**
 * Premium prissida för Jobbcoach.ai med WOW-faktor
 * Ljus, professionell design med skandinavisk minimalism
 * Fokus på att göra Premium till en "no-brainer" för 149 kr/månad
 */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

// Custom components
import PremiumNavbar from '@/components/PremiumNavbar'
import FloatingAIAssistant from '@/components/FloatingAIAssistant'
import DynamicTrustIndicator from '@/components/DynamicTrustIndicator'
import StatCard from '@/components/StatCard'
import { SubscribeButton } from '@/components/subscription/SubscribeButton'

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

// FAQ data - fokuserad på värde och ROI
const pricingFaqItems: FaqItem[] = [
  {
    question: "Vad ingår i Gratis-planen?",
    answer: "Gratis-planen är din perfekta startpunkt: 2 AI-genererade personliga brev (värde 800 kr), 2 professionella CV-analyser (värde 1200 kr), och 2 kompetensanalyser (värde 1800 kr). Totalt värde: 3800 kr - helt gratis för att du ska kunna testa vår AI-kraft."
  },
  {
    question: "Betalar sig verkligen Premium för 149 kr/månad?",
    answer: "Absolut! Genomsnittsanvändaren får 15-20% lönökning efter nytt jobb. På en 35,000 kr/mån lön betyder det +63,000 kr/år. Premium kostar 1,788 kr/år = ROI på 3,422%. Investeringen betalar sig själv på mindre än 10 dagar."
  },
  {
    question: "Hur snabbt får jag resultat?",
    answer: "89% av våra Premium-användare får minst en intervju inom 3 veckor (jämfört med 6-8 veckor normalt). Genomsnittstid till jobberbjudande är 4-6 veckor. Du ser resultatet redan första ansökningen med våra AI-optimerade personliga brev."
  },
  {
    question: "Vad händer när jag avslutar min Premium-prenumeration?",
    answer: "Du behåller all tillgång under din betalda period, sedan återgår kontot till Gratis-planen. Alla dina sparade dokument, mallar och tidigare analyser finns kvar - du förlorar aldrig ditt arbete."
  },
  {
    question: "Är det säkert att betala och hur fungerar det?",
    answer: "100% säkert! Vi använder Stripe (samma som Spotify, Shopify) för alla betalningar. Bank-nivå kryptering, PCI-kompatibelt. Du kan betala med kort, Apple Pay, Google Pay. Alla transaktioner är säkrade och GDPR-kompatibla."
  },
  {
    question: "Kan jag verkligen avbryta när som helst?",
    answer: "Ja, helt utan krångel! Ingen bindningstid, inga dolda avgifter, inga frågor. Avbryt direkt i dina inställningar eller kontakta oss. Vi tror på att tjäna din affär varje månad, inte låsa in dig."
  }
]

// Trust indicators data
const trustStats = [
  { number: "15,000+", label: "Nöjda användare", icon: Users },
  { number: "50,000+", label: "Personliga brev skapade", icon: PenTool },
  { number: "4.8/5", label: "Användarbetyg", icon: Star },
  { number: "94%", label: "Får jobbet de söker", icon: Trophy }
]

// Premium features data
const premiumFeatures = [
  {
    icon: Zap,
    title: "Obegränsad AI-generering",
    description: "Skapa så många personliga brev som du behöver - ingen begränsning",
    gradient: "from-blue-500/20 to-indigo-500/20"
  },
  {
    icon: FileSearch,
    title: "Djupgående analyser",
    description: "Få detaljerad feedback och konkreta förbättringsförslag",
    gradient: "from-indigo-500/20 to-purple-500/20"
  },
  {
    icon: Target,
    title: "Smart matchning",
    description: "AI matchar dina kompetenser perfekt mot varje jobbannons",
    gradient: "from-purple-500/20 to-pink-500/20"
  },
  {
    icon: Lightbulb,
    title: "Anpassningsbar tonalitet",
    description: "Justera stil och ton för att passa olika företagskulturer",
    gradient: "from-pink-500/20 to-red-500/20"
  },
  {
    icon: Save,
    title: "Obegränsade sparade ansökningar",
    description: "Spara och organisera alla dina ansökningar på ett ställe",
    gradient: "from-green-500/20 to-teal-500/20"
  },
  {
    icon: Sparkles,
    title: "Prioriterad support",
    description: "Få hjälp inom 24 timmar från vårt expertteam",
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
            className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
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

  // Scroll animations
  const { scrollY } = useScroll()
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150])
  const backgroundOpacity = useTransform(scrollY, [0, 300], [1, 0.8])

  // Stripe Price ID - endast månadsplan
  const premiumMonthlyPriceId = "price_1R7eyuAB6xHzwmWvtzFJdaOU"
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

  // Loading state with light theme
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-slate-50">
        <motion.div
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
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
        <title>Priser | Jobbcoach.ai - Premium AI-karriärcoach för 149 kr/månad</title>
        <meta name="description" content="Endast 149 kr/månad för obegränsad tillgång till AI-genererade personliga brev, djupgående CV-analyser och karriärcoaching. Gratis plan tillgänglig. Ingen bindningstid." />
        <meta name="keywords" content="priser jobbcoach.ai, premium AI karriärcoach, personligt brev AI pris, CV-analys kostnad, 149 kr månad jobbcoach" />
        <meta property="og:title" content="Priser | Jobbcoach.ai - Premium AI för 149 kr/månad" />
        <meta property="og:description" content="Transparent prissättning: Premium för 149 kr/månad eller starta gratis. Obegränsad AI-kraft för din karriär. Ingen bindningstid." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://jobbcoach.ai/priser" />
        <meta property="og:image" content="https://jobbcoach.ai/images/jobbcoach-og-pricing.png" />
        <link rel="canonical" href="https://jobbcoach.ai/priser" />
      </Head>

      {/* Light theme main container */}
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50/50 relative overflow-hidden">
        {/* Mouse-following gradient background */}
        <motion.div
          className="fixed inset-0 opacity-30 pointer-events-none z-0"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px,
            rgba(59, 130, 246, 0.15),
            rgba(99, 102, 241, 0.1),
            transparent 50%)`
          }}
          animate={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px,
            rgba(59, 130, 246, 0.15),
            rgba(99, 102, 241, 0.1),
            transparent 50%)`
          }}
          transition={{ type: "tween", ease: "easeOut", duration: 0.1 }}
        />

        {/* Premium Navigation */}
        <PremiumNavbar />

        {/* Floating AI Assistant */}
        <FloatingAIAssistant />

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
                Enkel prissättning för
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  maximal karriärtillväxt
                </span>
              </h1>

              <p className="max-w-2xl mx-auto mb-8 text-xl text-slate-600 leading-relaxed">
                Samma AI som rekryterare använder. 89% får intervju inom 3 veckor. Genomsnittlig lönökning: 15-20%.
                <strong className="text-slate-900"> Starta gratis eller lås upp allt för 149 kr/mån.</strong>
              </p>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
              >
                {trustStats.map((stat, index) => {
                  const IconComponent = stat.icon
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                      className="text-center"
                    >
                      <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl">
                        <IconComponent className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-slate-900">{stat.number}</div>
                      <div className="text-sm text-slate-600">{stat.label}</div>
                    </motion.div>
                  )
                })}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Pricing Plans Section */}
        <section id="pricing-plans" className="py-20 relative">
          <div className="container px-4 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Enkla priser - <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">maximal effekt</span>
              </h2>
              <p className="text-xl text-slate-600 mb-4">
                Börja gratis och upplev AI:ns kraft. Uppgradera när du vill ha obegränsad tillgång.
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                <Sparkles className="w-4 h-4 mr-2" />
                Ingen bindningstid • Avbryt när som helst • 149 kr betalar sig själv första dagen
              </div>
            </motion.div>

            <div className="grid max-w-6xl gap-8 mx-auto lg:grid-cols-2 items-stretch">
              {/* Free Plan */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                whileHover={{
                  y: -8,
                  transition: { type: "spring", stiffness: 300, damping: 20 }
                }}
                className="relative group"
              >
                <div className="flex flex-col h-full bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="p-8 flex-grow">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-slate-900">Gratis</h3>
                      <div className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                        För att testa
                      </div>
                    </div>

                    <p className="text-slate-600 mb-6">
                      Perfekt för att uppleva AI-kraften och testa grundfunktionerna
                    </p>

                    <div className="mb-8">
                      <span className="text-5xl font-bold text-slate-900">0 kr</span>
                      <span className="text-slate-600 ml-2">/ för alltid</span>
                    </div>

                    <div className="space-y-4">
                      <p className="font-semibold text-slate-900 mb-4">Detta ingår:</p>

                      <div className="space-y-3">
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-slate-700">2 AI-genererade personliga brev</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-slate-700">2 grundläggande CV-analyser</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-slate-700">2 kompetensanalyser</span>
                        </div>

                        {/* Locked features */}
                        <div className="pt-4 border-t border-gray-100">
                          <div className="flex items-center opacity-60">
                            <Lock className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                            <span className="text-slate-500">Obegränsad användning (Premium)</span>
                          </div>
                          <div className="flex items-center opacity-60 mt-2">
                            <Lock className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                            <span className="text-slate-500">Djupgående analyser (Premium)</span>
                          </div>
                          <div className="flex items-center opacity-60 mt-2">
                            <Lock className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                            <span className="text-slate-500">Prioriterad support (Premium)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 pt-0">
                    <Link
                      href="/register"
                      className="flex items-center justify-center w-full px-6 py-4 font-semibold text-slate-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-300 group border-2 border-transparent hover:border-gray-300"
                    >
                      Starta gratis
                      <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* Premium Plan */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{
                  y: -8,
                  transition: { type: "spring", stiffness: 300, damping: 20 }
                }}
                className="relative group"
              >
                {/* Popular badge */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-full shadow-lg">
                    ⭐ Mest populär
                  </div>
                </div>

                <div className="flex flex-col h-full bg-white/90 backdrop-blur-sm border-2 border-blue-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden relative">
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-indigo-50/50 pointer-events-none" />

                  <div className="p-8 flex-grow relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                        Premium
                      </h3>
                      <div className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                        Obegränsat
                      </div>
                    </div>

                    <p className="text-slate-600 mb-6">
                      Lås upp obegränsad AI-kraft för 149 kr/mån - mindre än vad en kaffe kostar per dag. Betalar sig själv första intervjun.
                    </p>

                    <div className="mb-8">
                      <span className="text-5xl font-bold text-slate-900">{premiumMonthlyPrice} kr</span>
                      <span className="text-slate-600 ml-2">/ månad</span>
                      <p className="text-sm text-slate-500 mt-2">Ingen bindningstid • Avsluta när som helst</p>
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
                              transition={{ delay: 0.3 + index * 0.1 }}
                              className="flex items-center"
                            >
                              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mr-3 flex-shrink-0`}>
                                <IconComponent className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium text-slate-900">{feature.title}</div>
                                <div className="text-sm text-slate-600">{feature.description}</div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="p-8 pt-0 relative z-10">
                    {session ? (
                      <SubscribeButton
                        priceId={premiumMonthlyPriceId}
                        planName="Premium"
                        className="flex items-center justify-center w-full px-6 py-4 font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl group"
                      />
                    ) : (
                      <Link
                        href="/register?plan=premium"
                        className="flex items-center justify-center w-full px-6 py-4 font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl group"
                      >
                        Uppgradera till Premium
                        <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                      </Link>
                    )}
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
        <section className="py-20 bg-gradient-to-b from-slate-50/50 to-white">
          <div className="container px-4 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Varför investerar smarta jobbsökare i <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Premium?</span>
              </h2>
              <p className="text-xl text-slate-600">
                För att 149 kr/månad är världens bästa investering i din karriär. Mindre än en restaurangmiddag - större påverkan än en MBA.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  icon: Zap,
                  title: "Obegränsad AI-kraft",
                  description: "Skapa så många personliga brev och gör så många analyser du behöver – utan begränsningar",
                  gradient: "from-yellow-400/20 to-orange-400/20",
                  iconColor: "text-yellow-600"
                },
                {
                  icon: FileSearch,
                  title: "Djupgående analyser",
                  description: "Få detaljerad feedback på allt från nyckelord till prestationer i både CV och kompetensanalys",
                  gradient: "from-purple-400/20 to-pink-400/20",
                  iconColor: "text-purple-600"
                },
                {
                  icon: Target,
                  title: "Smart anpassning",
                  description: "AI-optimerad tonalitet och avancerade insikter för att skräddarsy varje ansökan perfekt",
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
        <section className="py-20 bg-white">
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
        <section id="faq-pricing" className="py-20 bg-gradient-to-b from-slate-50/50 to-white">
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

        {/* Value Stack Section */}
        <section className="py-20 bg-gradient-to-b from-white to-blue-50/30">
          <div className="container px-4 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Vad får du för <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">149 kr/månad?</span>
              </h2>
              <p className="text-xl text-slate-600">
                En komplett karriärcoach-suite värd över 5,000 kr om du köpte tjänsterna separat
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-xl p-8 mb-8"
              >
                <div className="grid gap-4">
                  {[
                    { feature: "Obegränsade AI-personliga brev", value: "2,400 kr", description: "(Jämfört med CV-skrivare: 400 kr/brev × 6 st/år)" },
                    { feature: "Djupgående CV-analyser", value: "1,200 kr", description: "(Karriärcoach-konsultation: 600 kr/tim × 2 sessioner)" },
                    { feature: "8 professionella CV-mallar", value: "800 kr", description: "(Designer-mallar: 100 kr/st × 8 st)" },
                    { feature: "Kompetensanalys & utvecklingsplaner", value: "1,800 kr", description: "(Karriärvägledare: 900 kr/session × 2 st)" },
                    { feature: "ATS-optimering & nyckelordsanalys", value: "600 kr", description: "(Specialistconsulting: 600 kr/analys)" },
                    { feature: "Export till Word/PDF + prioriterad support", value: "300 kr", description: "(Tech-support & formatering)" },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex justify-between items-center py-4 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900">{item.feature}</div>
                        <div className="text-sm text-slate-600">{item.description}</div>
                      </div>
                      <div className="font-bold text-lg text-slate-900 ml-4">{item.value}</div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t-2 border-blue-200">
                  <div className="flex justify-between items-center">
                    <div className="text-lg font-semibold text-slate-700">Totalt värde per år:</div>
                    <div className="text-2xl font-bold text-slate-500 line-through">7,100 kr</div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-xl font-bold text-blue-600">Du betalar endast:</div>
                    <div className="text-3xl font-bold text-green-600">1,788 kr/år</div>
                  </div>
                  <div className="text-center mt-4 p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-700">75% RABATT!</div>
                    <div className="text-sm text-green-600 mt-1">Du sparar 5,312 kr per år</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ROI Calculator Section */}
        <section className="py-20 bg-gradient-to-b from-blue-50/30 to-white">
          <div className="container px-4 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Investeringen som <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">betalar sig själv</span>
              </h2>
            </motion.div>

            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-xl p-8"
              >
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl flex items-center justify-center">
                      <TrendingUp className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Genomsnittlig lönökning</h3>
                    <div className="text-4xl font-bold text-green-600 mb-2">15-20%</div>
                    <p className="text-slate-600 text-sm">När du får ett nytt jobb med AI-optimerade ansökningar</p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl flex items-center justify-center">
                      <Clock className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Tid till första intervjun</h3>
                    <div className="text-4xl font-bold text-blue-600 mb-2">2-3 veckor</div>
                    <p className="text-slate-600 text-sm">Jämfört med 6-8 veckor utan AI-hjälp</p>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                  <h4 className="font-bold text-slate-900 text-center mb-4">Exempel på ROI (Return on Investment)</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Nuvarande lön (35,000 kr/mån):</span>
                      <span className="font-semibold">420,000 kr/år</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Efter 15% lönökning:</span>
                      <span className="font-semibold text-green-600">483,000 kr/år</span>
                    </div>
                    <div className="flex justify-between border-t pt-3">
                      <span className="text-slate-600">Kostnad för Jobbcoach Premium:</span>
                      <span className="font-semibold">1,788 kr/år</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Din nettovinst:</span>
                      <span className="font-bold text-2xl text-green-600">+61,212 kr/år</span>
                    </div>
                    <div className="text-center mt-4 p-3 bg-green-100 rounded-lg">
                      <span className="font-bold text-green-700">ROI: 3,422% - Investeringen betalar sig själv på 10 dagar!</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-20 bg-gradient-to-b from-white to-slate-50/50">
          <div className="container px-4 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Riktiga resultat från riktiga användare
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  name: "Anna S., Projektledare",
                  result: "Fick 3 intervjuer första veckan",
                  quote: "AI:n fångade precis rätt ton för min bransch. Personliga breven kändes autentiska men professionella.",
                  impact: "Lönökning: 18%",
                  time: "2 veckor till nytt jobb"
                },
                {
                  name: "Marcus L., Utvecklare",
                  result: "Första jobbet som senior efter 6 månader",
                  quote: "Kompetensanalysen visade exakt vilka färdigheter jag behövde utveckla. Fick seniorroll direkt!",
                  impact: "Lönökning: 22%",
                  time: "3 veckor till intervju"
                },
                {
                  name: "Sara K., Marknadsförare",
                  result: "Bytte bransch framgångsrikt",
                  quote: "Trodde aldrig att AI kunde hjälpa mig byta från retail till tech. CV-mallarna var perfekta.",
                  impact: "Lönökning: 15%",
                  time: "4 veckor till erbjudande"
                }
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg p-6"
                >
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <h4 className="font-bold text-slate-900">{testimonial.name}</h4>
                    <div className="text-sm font-semibold text-green-600">{testimonial.result}</div>
                  </div>
                  <p className="text-slate-600 italic mb-4">"{testimonial.quote}"</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Resultat:</span>
                      <span className="font-semibold text-green-600">{testimonial.impact}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tid:</span>
                      <span className="font-semibold text-blue-600">{testimonial.time}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison vs Alternatives Section */}
        <section className="py-20 bg-gradient-to-b from-slate-50/50 to-white">
          <div className="container px-4 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Jämförelse: <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Jobbcoach vs Alternativen</span>
              </h2>
              <p className="text-xl text-slate-600">
                Se varför 15,000+ svenskar valt Jobbcoach över dyrare alternativ
              </p>
            </motion.div>

            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-xl overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                      <tr>
                        <th className="px-6 py-4 text-left font-bold text-slate-900"></th>
                        <th className="px-6 py-4 text-center font-bold text-blue-600">
                          <div className="flex flex-col items-center">
                            <span className="text-lg">Jobbcoach Premium</span>
                            <span className="text-2xl font-bold">149 kr/mån</span>
                          </div>
                        </th>
                        <th className="px-6 py-4 text-center font-semibold text-slate-600">
                          <div className="flex flex-col items-center">
                            <span>CV-skrivare</span>
                            <span className="text-lg font-bold">2,000-5,000 kr</span>
                          </div>
                        </th>
                        <th className="px-6 py-4 text-center font-semibold text-slate-600">
                          <div className="flex flex-col items-center">
                            <span>Karriärcoach</span>
                            <span className="text-lg font-bold">800-1,200 kr/tim</span>
                          </div>
                        </th>
                        <th className="px-6 py-4 text-center font-semibold text-slate-600">
                          <div className="flex flex-col items-center">
                            <span>Gör det själv</span>
                            <span className="text-lg font-bold">0 kr (men...)</span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {[
                        {
                          feature: "Obegränsade personliga brev",
                          jobbcoach: "✓ Ja, med AI-optimering",
                          writer: "✗ 1-2 brev max",
                          coach: "✗ Inte inkluderat",
                          diy: "✓ Men tar 3-4 tim/brev"
                        },
                        {
                          feature: "CV-analys & feedback",
                          jobbcoach: "✓ Obegränsat med AI",
                          writer: "✓ 1 gång",
                          coach: "✓ 800 kr/session",
                          diy: "✗ Ingen expertfeedback"
                        },
                        {
                          feature: "8 professionella mallar",
                          jobbcoach: "✓ Alla inkluderade",
                          writer: "✓ 1-2 mallar",
                          coach: "✗ Inte inkluderat",
                          diy: "✗ Grundläggande bara"
                        },
                        {
                          feature: "ATS-optimering",
                          jobbcoach: "✓ Automatisk AI-optimering",
                          writer: "✓ Grundläggande",
                          coach: "✗ Inte inkluderat",
                          diy: "✗ Svårt utan expertis"
                        },
                        {
                          feature: "Tid till resultat",
                          jobbcoach: "60 sekunder/brev",
                          writer: "2-4 veckor leverans",
                          coach: "Bokar 2-3 veckor fram",
                          diy: "3-4 timmar/brev"
                        },
                        {
                          feature: "Kostnad per år (6 ansökningar)",
                          jobbcoach: "1,788 kr",
                          writer: "12,000-30,000 kr",
                          coach: "4,800-7,200 kr",
                          diy: "0 kr (18-24 tim av din tid)"
                        }
                      ].map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-900">{row.feature}</td>
                          <td className="px-6 py-4 text-center text-blue-600 font-semibold">{row.jobbcoach}</td>
                          <td className="px-6 py-4 text-center text-slate-600">{row.writer}</td>
                          <td className="px-6 py-4 text-center text-slate-600">{row.coach}</td>
                          <td className="px-6 py-4 text-center text-slate-600">{row.diy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-6 bg-green-50 border-t">
                  <div className="text-center">
                    <h4 className="text-xl font-bold text-green-700 mb-2">Vinnaren är uppenbar!</h4>
                    <p className="text-green-600">
                      Jobbcoach Premium ger dig mer värde för 149 kr/mån än vad konkurrenterna tar för en enda tjänst.
                      <br />
                      <strong>Spara 10,000+ kr/år och få bättre resultat!</strong>
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Final CTA Section - Improved with better contrast */}
        <section className="relative py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden">
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
                  Premium AI-karriärcoach för svenska yrkesverksamma
                </motion.div>
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Redo att investera i din
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300 drop-shadow-sm">
                  framtid?
                </span>
              </h2>

              <p className="max-w-2xl mx-auto text-xl md:text-2xl text-white mb-12 leading-relaxed drop-shadow-sm">
                Välj mellan vår generösa gratisplan eller Premium för obegränsad AI-kraft. Din karriär väntar.
              </p>

              {/* Enhanced Trust Indicators with better contrast */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="mb-12"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { number: "15,000+", label: "personliga brev idag", icon: PenTool },
                    { number: "8,200+", label: "aktiva användare", icon: Users },
                    { number: "89%", label: "får intervju inom 3 veckor", icon: Trophy },
                    { number: "2.6x", label: "högre svarsfrekvens", icon: TrendingUp }
                  ].map((stat, index) => {
                    const IconComponent = stat.icon
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                        className="text-center bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg"
                      >
                        <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-lg">
                          <IconComponent className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="text-2xl font-bold text-slate-900">{stat.number}</div>
                        <div className="text-xs text-slate-600 font-medium leading-tight">{stat.label}</div>
                      </motion.div>
                    )
                  })}
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
                      href="/register?plan=premium"
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
                  15,000+ nöjda användare
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

      </div>
    </>
  )
}