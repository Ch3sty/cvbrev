/**
 * Premium Om Oss-sida för Jobbcoach.ai
 * Ljus, professionell design med integrerade komponenter
 * Skandinavisk minimalism möter AI-innovation
 */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import {
  ChevronRight, Users, Target, BrainCircuit, Heart, Lightbulb, Rocket,
  Sparkles, Trophy, Star, ArrowRight, Clock, TrendingUp, CheckCircle
} from 'lucide-react'

// Import premium components
import StatsSection from '@/components/om-oss/StatsSection'
import VisionSection from '@/components/om-oss/VisionSection'
import TeamMemberCard from '@/components/om-oss/TeamMemberCard'

export default function OmOssPage() {
  const [session, setSession] = useState<any>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const heroRef = useRef(null)
  const isHeroInView = useInView(heroRef, { once: true })

  useEffect(() => {
    async function getSession() {
      try {
        setIsLoading(true)
        const { getSupabaseClient } = await import('@/lib/supabase/client-manager')
        const supabase = getSupabaseClient()
        const { data } = await supabase.auth.getSession()
        setSession(data.session)
      } catch (error) {
        console.error('Kunde inte hämta session:', error)
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" aria-label="Laddar innehåll"></div>
        <p className="mt-4 text-gray-600">Laddar om oss...</p>
      </div>
    )
  }

  // Team data
  const teamMembers = [
    {
      name: 'Helena Andersson',
      title: 'Grundare & CEO',
      image: '/images/jobbcoach/Helena.webp',
      bio: 'Med över 10 års erfarenhet inom HR och rekrytering, driver Helena visionen om att demokratisera karriärmöjligheter för alla svenskar.',
      expertise: ['Karriärstrategi', 'HR-ledarskap', 'AI-utveckling', 'Användareupplevelse'],
      linkedinUrl: 'https://linkedin.com/in/helena-andersson',
      email: 'helena@jobbcoach.ai'
    },
    {
      name: 'Johan Eriksson',
      title: 'Tech Lead & AI-Specialist',
      image: '/images/jobbcoach/Johan.webp',
      bio: 'Johan leder utvecklingen av vår AI-teknologi och säkerställer att den alltid levererar värdefulla insikter för våra användare.',
      expertise: ['AI & Machine Learning', 'Backend-utveckling', 'Data Science', 'Systemarkitektur'],
      linkedinUrl: 'https://linkedin.com/in/johan-eriksson',
      email: 'johan@jobbcoach.ai'
    },
    {
      name: 'Linda Svensson',
      title: 'UX Designer & Produktstrateg',
      image: '/images/jobbcoach/Linda.webp',
      bio: 'Linda ansvarar för att göra komplexa AI-funktioner intuitive och tillgängliga, med fokus på svensk användarupplevelse.',
      expertise: ['UX/UI Design', 'Produktstrategi', 'Användarforskning', 'Design System'],
      linkedinUrl: 'https://linkedin.com/in/linda-svensson',
      email: 'linda@jobbcoach.ai'
    }
  ]

  return (
    <>
      {/* SEO och Metadata */}
      <Head>
        <title>Om Oss | Jobbcoach.ai - Din partner i karriären</title>
        <meta name="description" content="Lär känna teamet och visionen bakom Jobbcoach.ai. Vi brinner för att hjälpa dig nå dina karriärmål med smarta, AI-drivna verktyg för jobbsökning." />
        <meta name="keywords" content="om jobbcoach.ai, om oss, digital jobbcoach, AI jobbsökning, karriärutveckling, cvbrev.se" />
        <meta property="og:title" content="Om Oss | Jobbcoach.ai - Din partner i karriären" />
        <meta property="og:description" content="Upptäck missionen och människorna bakom Jobbcoach.ai. Läs om hur vi använder AI för att förenkla och förbättra din jobbsökning." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://jobbcoach.ai/om-oss" />
        <meta property="og:image" content="https://jobbcoach.ai/images/jobbcoach-og-about.png" />
        <link rel="canonical" href="https://jobbcoach.ai/om-oss" />
      </Head>

      {/* Light theme main container */}
      <div className="flex flex-col min-h-screen bg-white">

        {/* === Hero Section === */}
        <section
          ref={heroRef}
          className="relative pt-24 pb-16 text-center lg:pt-32 lg:pb-20 overflow-hidden bg-gradient-to-b from-white to-slate-50/50"
        >
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
          </div>

          <div className="container relative px-4 mx-auto z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-600 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Heart className="w-4 h-4" />
                Vår berättelse
              </div>

              <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-gray-900">
                Vi hjälper dig att nå dina{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                  karriärmål
                </span>
              </h1>

              <p className="max-w-3xl mx-auto text-xl text-gray-600 leading-relaxed">
                Jobbcoach.ai är mer än bara ett verktyg – vi är din digitala partner,
                dedikerade till att förenkla och förbättra din resa mot drömjobbet med hjälp av smart AI.
              </p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-8 flex justify-center"
              >
                <Link
                  href="/funktioner"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Sparkles className="w-5 h-5" />
                  Upptäck våra funktioner
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* === Vår Resa Section === */}
        <section className="py-16 lg:py-24 bg-gradient-to-b from-slate-50/50 to-white">
          <div className="container px-4 mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Visual Element */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative flex justify-center items-center order-last lg:order-first"
              >
                <div className="absolute w-64 h-64 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
                <div className="relative bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                  <Rocket className="w-32 h-32 lg:w-40 lg:h-40 text-pink-500 mx-auto transform rotate-12" strokeWidth={1.5} />
                  <div className="mt-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">2023-2024</div>
                    <div className="text-sm text-gray-600">Från cvbrev.se till Jobbcoach.ai</div>
                  </div>
                </div>
              </motion.div>

              {/* Text Content */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="max-w-xl lg:max-w-none"
              >
                <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-600 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                  <Trophy className="w-4 h-4" />
                  Vår utveckling
                </div>

                <h2 className="mb-6 text-3xl font-bold text-gray-900 sm:text-4xl">
                  Från <span className="text-gray-400 line-through">cvbrev.se</span> till{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                    Jobbcoach.ai
                  </span>
                </h2>

                <div className="space-y-4 text-lg text-gray-600">
                  <p>
                    Vår resa började med en enkel idé: att göra det lättare att skriva personliga brev.
                    Med cvbrev.se hjälpte vi tusentals användare att skapa ansökningar snabbare.
                  </p>
                  <p>
                    Men vi insåg att jobbsökning är mer än bara ett personligt brev. Vi såg potentialen
                    i AI att erbjuda djupare insikter och stöd genom hela processen.
                  </p>
                  <p>
                    Därför utvecklades vi till <strong className="text-pink-600">Jobbcoach.ai</strong> –
                    en mer komplett digital jobbcoach som inkluderar CV-analys, insikter och fler
                    kommande funktioner, allt drivet av specialiserad AI designad för att maximera
                    dina chanser på arbetsmarknaden.
                  </p>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">500+ användare</div>
                      <div className="text-sm text-gray-600">Sedan lansering</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">2 min/brev</div>
                      <div className="text-sm text-gray-600">Genomsnittstid</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* === Vision Section Component === */}
        <VisionSection />

        {/* === Stats Section Component === */}
        <StatsSection />

        {/* === Team Section === */}
        <section className="py-20 bg-gradient-to-b from-white to-slate-50/50">
          <div className="container px-4 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <Users className="w-4 h-4" />
                Vårt team
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Människorna bakom{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                  Jobbcoach.ai
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Ett passionerat team av experter inom AI, design och karriärutveckling,
                dedikerade till att hjälpa dig lyckas på den svenska arbetsmarknaden.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {teamMembers.map((member, index) => (
                <TeamMemberCard key={member.name} member={member} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* === Final CTA Section === */}
        <section className="py-20 bg-gradient-to-br from-pink-50 to-purple-50 relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
          </div>

          <div className="container px-4 mx-auto text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Lightbulb className="w-8 h-8 text-white" />
              </div>

              <h2 className="mb-6 text-4xl font-bold text-gray-900 sm:text-5xl">
                Redo att ta nästa steg i din{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                  karriär?
                </span>
              </h2>

              <p className="mb-8 text-xl text-gray-600 leading-relaxed">
                Utforska hur Jobbcoach.ai kan hjälpa dig. Skapa ett gratiskonto
                eller upptäck våra kraftfulla funktioner.
              </p>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href={session ? "/dashboard" : "/register"}
                    className="inline-flex items-center justify-center w-full px-8 py-4 text-lg font-medium text-white transition-all duration-300 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl shadow-lg hover:shadow-xl group sm:w-auto"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    {session ? "Gå till dashboard" : "Kom igång gratis"}
                    <ChevronRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/funktioner"
                    className="inline-flex items-center justify-center w-full px-8 py-4 text-lg font-medium text-gray-700 transition-all duration-300 bg-white border-2 border-gray-200 rounded-xl hover:border-pink-300 hover:text-pink-600 sm:w-auto shadow-sm hover:shadow-md"
                  >
                    Se alla funktioner
                  </Link>
                </motion.div>
              </div>

              {/* Trust indicators */}
              <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Gratis att testa</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>Inget kreditkort krävs</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span>500+ nöjda användare</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

      </div>
    </>
  )
}