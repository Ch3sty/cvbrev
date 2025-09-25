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

// FAQ data - uppdaterad för endast månadspris
const pricingFaqItems: FaqItem[] = [
  {
    question: "Vad ingår i Gratis-planen?",
    answer: "Med vår Gratis-plan får du testa kärnfunktionerna: 2 AI-genererade personliga brev, 2 grundläggande CV-analyser, och 2 kompetensanalyser. Perfekt för att uppleva AI-kraften innan du uppgraderar."
  },
  {
    question: "Vad händer när jag avslutar min Premium-prenumeration?",
    answer: "Du behåller tillgång till alla Premium-funktioner under den månad du redan betalat för. Därefter återgår ditt konto automatiskt till Gratis-planen, och dina sparade dokument finns kvar."
  },
  {
    question: "Kan jag uppgradera från Gratis till Premium när som helst?",
    answer: "Absolut! Du kan uppgradera till Premium när som helst direkt från dina kontoinställningar. Du får omedelbar tillgång till alla Premium-funktioner."
  },
  {
    question: "Vilka betalningsmetoder accepteras?",
    answer: "Vi accepterar säkra kortbetalningar (Visa, Mastercard, American Express m.fl.) via vår betalpartner Stripe. Alla betalningar är krypterade och säkra."
  },
  {
    question: "Varför endast månadspris?",
    answer: "Vi tror på flexibilitet. Med månadspris kan du enkelt anpassa din prenumeration efter dina behov utan långsiktiga åtaganden. Du kan avsluta när som helst."
  },
  {
    question: "Får jag support som Premium-kund?",
    answer: "Ja! Premium-kunder får prioriterad support via email och chat. Vi svarar inom 24 timmar på vardagar och hjälper dig maximera värdet av plattformen."
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
                Välj mellan vår generösa gratisplan för att komma igång, eller Premium för obegränsad AI-kraft och avancerad karriärcoaching.
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
                Två alternativ - en lösning
              </h2>
              <p className="text-xl text-slate-600">
                Starta gratis eller gå direkt till Premium för full AI-kraft
              </p>
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
                      Lås upp full AI-potential och maximera dina karriärmöjligheter
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
                Varför välja <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Premium?</span>
              </h2>
              <p className="text-xl text-slate-600">
                Lås upp den fulla potentialen och få verktygen som verkligen accelererar din jobbsökning
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

        {/* Final CTA Section - Nordic Elegant Design */}
        <section className="relative py-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
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
                  className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white/90 text-sm font-medium rounded-full border border-white/30 mb-6"
                >
                  <Award className="w-4 h-4 mr-2" />
                  Premium AI-karriärcoach för svenska yrkesverksamma
                </motion.div>
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Redo att investera i din
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                  framtid?
                </span>
              </h2>

              <p className="max-w-2xl mx-auto text-xl md:text-2xl text-white/90 mb-12 leading-relaxed">
                Välj mellan vår generösa gratisplan eller Premium för obegränsad AI-kraft. Din karriär väntar.
              </p>

              {/* Live Trust Indicator */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="mb-12"
              >
                <DynamicTrustIndicator
                  className="text-white/80"
                  highlightClassName="text-yellow-300"
                />
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