/**
 * Premium startsida för Jobbcoach.ai med WOW-faktor
 * Ljus, professionell design med unika interaktiva element
 * Skandinavisk minimalism möter AI-innovation
 */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import {
  ChevronRight, Check, Star, Users, Shield, Award,
  FileText, FileSearch, Target, Lightbulb, BrainCircuit,
  Clock, TrendingUp, Sparkles, Upload, Mail, Phone,
  CheckCircle, Lock, Zap, ArrowRight, Play, X,
  ChevronDown, ChevronUp, BarChart, Globe, Briefcase,
  Rocket, Eye, Heart, MessageCircle, DollarSign,
  ChevronLeft, PenTool, Palette, Trophy, Gift,
  GraduationCap, User, Building2, Layers, Settings,
  Timer, RefreshCw, Gauge, BookOpen, Code, Database,
  Linkedin, AlertCircle, ExternalLink, Newspaper
} from 'lucide-react'

// Custom components
import AILiveWriting from '@/components/AILiveWriting'
import DynamicTrustIndicator from '@/components/DynamicTrustIndicator'
import InteractiveSteps from '@/components/InteractiveSteps'
import PersonalizedUserJourney from '@/components/PersonalizedUserJourney'
import EnhancedFinalCTA from '@/components/EnhancedFinalCTA'
import PremiumNavbar from '@/components/PremiumNavbar'
import PremiumPricingSection from '@/components/pricing/PremiumPricingSection'
import { getSupabaseClient } from '@/lib/supabase/client-manager'

// Swiper components
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules'

// Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

export default function HomePage() {
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [swiperInstance, setSwiperInstance] = useState<any>(null)
  const [playVideo, setPlayVideo] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Scroll animations
  const { scrollY } = useScroll()
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150])
  const backgroundOpacity = useTransform(scrollY, [0, 300], [1, 0.3])

  // Redirect logged-in users to dashboard
  useEffect(() => {
    let isMounted = true

    const checkAuth = async () => {
      try {
        const supabase = getSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user && isMounted) {
          router.push('/dashboard')
        } else if (isMounted) {
          // Only show content when we know user is not logged in
          setIsCheckingAuth(false)
        }
      } catch (error) {
        console.error('Auth check error:', error)
        if (isMounted) {
          setIsCheckingAuth(false)
        }
      }
    }

    checkAuth()

    return () => {
      isMounted = false
    }
  }, [router])

  // Track mouse for gradient effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // CV-mallar data
  const cvTemplates = [
    { id: 1, name: 'Modern Minimal', industry: 'Tech/Startup', svg: '/mallar/modern-minimal.svg', premium: false, users: '2.1K' },
    { id: 2, name: 'Klassisk Professional', industry: 'Bank/Finans', svg: '/mallar/classic-professional.svg', premium: false, users: '1.8K' },
    { id: 3, name: 'Clean Corporate', industry: 'Konsult/B2B', svg: '/mallar/clean-corporate.svg', premium: false, users: '1.5K' },
    { id: 4, name: 'Executive Premium', industry: 'Ledning/Chef', svg: '/mallar/executive-premium.svg', premium: true, users: '920' },
    { id: 5, name: 'Nordic Professional', industry: 'Alla branscher', svg: '/mallar/nordic-professional.svg', premium: true, users: '1.3K' },
    { id: 6, name: 'Creative Edge', industry: 'Media/Design', svg: '/mallar/creative-edge.svg', premium: false, users: '780' },
    { id: 7, name: 'Platinum Executive', industry: 'VD/Direktion', svg: '/mallar/platinum-executive.svg', premium: true, users: '450' },
    { id: 8, name: 'Creative Minimal', industry: 'Kreativa yrken', svg: '/mallar/creative-minimal.svg', premium: true, users: '680' }
  ]

  // Show minimal loading state while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Laddar...</p>
        </div>
      </div>
    )
  }

  // Use cases för olika målgrupper
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50/50">

      {/* Premium Navigation Bar */}
      <PremiumNavbar />

      {/* Premium Hero Section with WOW factor */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Morphing gradient background that follows mouse */}
        <motion.div
          className="absolute inset-0"
          style={{ opacity: backgroundOpacity }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white to-indigo-50/30" />

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
            className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl"
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
            className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full mix-blend-multiply filter blur-3xl"
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

          {/* Pattern overlay */}
          <div
            className="absolute inset-0 opacity-30 pattern-overlay"
          />
        </motion.div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-center">
              {/* Vänster kolumn - Text */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                {/* Dynamic trust indicator instead of static badge */}
                <div className="mb-8">
                  <DynamicTrustIndicator />
                </div>

                {/* Huvudrubrik with animation */}
                <motion.h1
                  className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-[1.1]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                >
                  Därför får du{' '}
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
                    inte svar på dina ansökningar
                  </motion.span>
                </motion.h1>

                {/* Underrubrik */}
                <p className="text-lg sm:text-xl text-slate-600 mb-8 leading-relaxed">
                  Allt fler rekryterare låter AI-system sålla kandidater automatiskt — ofta utan att du vet om det. Om ditt CV inte är optimerat når det aldrig en mänsklig rekryterare.
                  <span className="font-semibold text-slate-900"> 89% av våra användare får intervju inom 2 veckor.</span>
                </p>

                {/* CTA-knapp with magnetic effect */}
                <motion.div
                  className="mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  <div className="relative inline-block w-full sm:w-auto">
                    <motion.div
                      className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl blur opacity-30"
                      animate={{
                        opacity: [0.3, 0.5, 0.3],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                      }}
                    />
                    <Link href="/trial-signup">
                      <motion.button
                        className="relative w-full sm:w-auto min-h-[56px] touch-manipulation px-10 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-lg rounded-2xl hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300"
                        whileHover={{ scale: 1.05, y: -3 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="flex items-center justify-center gap-3">
                          <span>Prova Premium gratis i 7 dagar</span>
                          <ArrowRight className="w-5 h-5" />
                        </span>
                      </motion.button>
                    </Link>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-5 text-xs sm:text-sm text-slate-600">
                    <span className="flex items-center gap-1.5 touch-manipulation">
                      <CheckCircle className="w-5 h-5 sm:w-4 sm:h-4 text-green-500" />
                      Ingen bindningstid
                    </span>
                    <span className="flex items-center gap-1.5 touch-manipulation">
                      <CheckCircle className="w-5 h-5 sm:w-4 sm:h-4 text-green-500" />
                      0 kr de första 7 dagarna
                    </span>
                    <span className="flex items-center gap-1.5 touch-manipulation">
                      <CheckCircle className="w-5 h-5 sm:w-4 sm:h-4 text-green-500" />
                      Avsluta när du vill
                    </span>
                  </div>

                  <p className="text-center mt-4">
                    <Link href="/register" className="text-sm text-slate-500 hover:text-blue-600 underline underline-offset-4 transition-colors">
                      Eller starta med ett gratis konto
                    </Link>
                  </p>
                </motion.div>

                {/* Animated social proof */}
                <motion.div
                  className="flex items-center gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                >
                  <div className="flex -space-x-2">
                    {[1,2,3,4,5].map(i => (
                      <motion.div
                        key={i}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 border-2 border-white"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.8 + i * 0.1, type: "spring", stiffness: 260, damping: 20 }}
                      />
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(i => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1.2 + i * 0.05 }}
                        >
                          <Star className={`w-4 h-4 ${i < 5 ? 'text-yellow-400 fill-current' : 'text-slate-300'}`} />
                        </motion.div>
                      ))}
                    </div>
                    <p className="text-sm text-slate-600">4.9/5 från 200+ recensioner</p>
                  </div>
                </motion.div>
              </motion.div>

              {/* Höger kolumn - AI Live Writing Demo */}
              <motion.div
                className="relative lg:absolute lg:right-0 lg:top-1/2 lg:-translate-y-1/2 w-full lg:w-1/2"
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

      {/* Medierna bekräftar — AI sållar bort din ansökan */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-slate-50 to-white border-y border-slate-200">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              className="text-center mb-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-full mb-4">
                <Newspaper className="w-4 h-4 text-red-600" />
                <span className="text-sm font-semibold text-red-900">Bekräftat av SVT, SR, DN och Kollega</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Medierna bekräftar: AI sållar bort din ansökan
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Sveriges största nyhetsredaktioner varnar — allt fler rekryterare låter AI sålla bort kandidater automatiskt. Är ditt CV optimerat?
              </p>
            </motion.div>

            {/* Media cards */}
            <div className="grid sm:grid-cols-2 gap-4 md:gap-6 mb-8">
              {[
                {
                  source: 'Kollega',
                  color: 'border-l-orange-500',
                  bgHover: 'hover:bg-orange-50/50',
                  quote: '40% av Teamtailors 10 000+ arbetsgivare har aktiverat AI-funktioner för rekrytering. EU klassificerar AI-rekrytering som "högriskverksamhet".',
                  url: 'https://kollega.se/soka-jobb/ai-rekrytering-ats-cv-soka-jobb-intervju',
                  delay: 0
                },
                {
                  source: 'SVT Nyheter',
                  color: 'border-l-red-500',
                  bgHover: 'hover:bg-red-50/50',
                  quote: 'Hur sticker du ut när "perfekta" AI-skrivna CV:n blivit norm? SVT undersöker knepen som gör att du inte sorteras bort.',
                  url: 'https://www.svt.se/nyheter/inrikes/ai-och-jobbsokande-har-ar-knepen-som-gor-att-du-inte-sorteras-bort',
                  delay: 0.1
                },
                {
                  source: 'Sveriges Radio P1',
                  color: 'border-l-blue-500',
                  bgHover: 'hover:bg-blue-50/50',
                  quote: 'Allt fler företag använder AI för att sålla bland CV:n. Jesper Olsson på Trygghetsrådet TRR förklarar hur du undviker att bli bortsållad.',
                  url: 'https://www.sverigesradio.se/artikel/ai-sallar-bort-ditt-cv-sa-har-tar-du-dig-forbi-robotarna',
                  delay: 0.2
                },
                {
                  source: 'Dagens Nyheter',
                  color: 'border-l-slate-900',
                  bgHover: 'hover:bg-slate-50',
                  quote: '"Intervjuad av en robot" — DN rapporterar om hur AI tar över allt fler steg i rekryteringsprocessen hos svenska företag.',
                  url: 'https://www.dn.se/sverige/intervjuad-av-en-robot-sa-tar-ai-over-inom-rekrytering/',
                  delay: 0.3
                }
              ].map((item, idx) => (
                <motion.a
                  key={idx}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block bg-white rounded-xl border border-slate-200 border-l-4 ${item.color} p-5 shadow-sm hover:shadow-md ${item.bgHover} transition-all duration-300 group`}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: item.delay, duration: 0.5 }}
                  whileHover={{ y: -3 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{item.source}</span>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{item.quote}</p>
                </motion.a>
              ))}
            </div>

            {/* CTA under mediakorten */}
            <motion.div
              className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 md:p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 text-lg mb-2">
                    Vi hjälper dig passera AI-systemen
                  </h3>
                  <p className="text-slate-600 text-sm">
                    Våra verktyg är byggda för att optimera ditt CV och personliga brev för ATS-screening — så att dina kvalifikationer faktiskt når en mänsklig rekryterare.
                  </p>
                </div>
                <Link href="/trial-signup" className="flex-shrink-0">
                  <motion.button
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 whitespace-nowrap"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="flex items-center gap-2">
                      Prova Premium gratis i 7 dagar
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Logo Bar - Som Databox */}
      <section className="py-12 bg-white border-y border-slate-100">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm font-medium text-slate-500 mb-8">
            Våra användare har använt vår tjänst för att söka roller hos:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-4 md:gap-8 items-center justify-items-center opacity-60 hover:opacity-100 transition-opacity">
            {['Spotify', 'Friskis & Svettis', 'H&M', 'Anticimex', 'IKEA', 'SEB', 'Klarna'].map((company) => (
              <div key={company} className="text-base sm:text-lg md:text-xl font-bold text-slate-400 hover:text-slate-600 transition-colors">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hur det fungerar - Interactive 3-step process with wow factor */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Så enkelt är det
              </h2>
              <p className="text-xl text-slate-600">
                Från jobbannons till färdig ansökan på tre enkla steg
              </p>
            </motion.div>

            <InteractiveSteps />

            <motion.div
              className="text-center mt-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <Link href="/trial-signup">
                <motion.button
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Prova Premium gratis i 7 dagar
                  <ArrowRight className="inline-block ml-2 w-5 h-5" />
                </motion.button>
              </Link>
              <motion.p
                className="mt-4 text-sm text-slate-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                0 kr de första 7 dagarna • Ingen bindningstid
              </motion.p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Värdeproposition - Ny version baserad på rekommendationer */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Vad gör oss unika?
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Vi är den enda tjänsten som verkligen förstår svenska arbetsmarknaden och ger dig konkreta resultat
              </p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
              <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-xl shadow-slate-900/5 border border-slate-100">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  3x högre träffsäkerhet
                </h3>
                <p className="text-slate-600 mb-4">
                  Våra smarta algoritmer är tränade på över 50,000 svenska jobbannonser och CV:n för maximal träffsäkerhet
                </p>
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-sm font-medium text-slate-500">Jämfört med generiska verktyg</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" />
                    <span className="text-lg font-bold text-slate-900">+300%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-xl shadow-slate-900/5 border border-slate-100">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Spara 2 timmar per ansökan
                </h3>
                <p className="text-slate-600 mb-4">
                  Från research till färdigt brev på 60 sekunder istället för timmar
                </p>
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-sm font-medium text-slate-500">Tid per ansökan</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Förr:</span>
                      <span className="font-bold text-slate-400 line-through">2.5h</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Nu:</span>
                      <span className="font-bold text-green-600">60s</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-xl shadow-slate-900/5 border border-slate-100">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  89% får intervju
                </h3>
                <p className="text-slate-600 mb-4">
                  Bevisad framgång baserad på data från 2,000+ svenska jobbsökare
                </p>
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-sm font-medium text-slate-500">Inom första 2 veckorna</p>
                  <div className="grid grid-cols-5 gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-8 rounded ${i < 4 ? 'bg-gradient-to-t from-purple-500 to-pink-500' : 'bg-slate-200'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Funktioner - Användarfokuserad design med micro-interactions */}
      <section id="funktioner" className="py-24 bg-white relative overflow-hidden">
        {/* Animated background pattern */}
        <motion.div
          className="absolute inset-0 opacity-5"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full mb-6"
                whileHover={{ scale: 1.05 }}
              >
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">Kraftfulla verktyg</span>
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Allt du behöver för att lyckas
              </h2>
              <p className="text-xl text-slate-600">
                Komplett verktygslåda för modern jobbsökning
              </p>
            </motion.div>

            {/* Feature grid with advanced micro-interactions */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: PenTool,
                  title: 'Skapa perfekta personliga brev',
                  description: 'Generera unika brev för varje ansökan på 60 sekunder. Anpassade efter företagskultur och jobbkrav.',
                  badge: 'Mest använd',
                  badgeColor: 'from-blue-500 to-blue-600',
                  stats: '10,000+ brev skapade',
                  delay: 0,
                  link: '/dashboard/skapa-brev'
                },
                {
                  icon: FileSearch,
                  title: 'CV-analys med expertfeedback',
                  description: 'Få konkreta förbättringsförslag baserat på vad svenska rekryterare letar efter.',
                  badge: 'Gratis',
                  badgeColor: 'from-green-500 to-green-600',
                  stats: '4.9/5 användarbetyg',
                  delay: 0.1,
                  link: '/dashboard/cv-analys'
                },
                {
                  icon: Palette,
                  title: 'Professionella CV-mallar',
                  description: '8+ branschoptimerade mallar som passerar alla ATS-filter. Välj design som matchar din roll.',
                  badge: 'Premium',
                  badgeColor: 'from-purple-500 to-purple-600',
                  stats: 'ATS-optimerade',
                  delay: 0.2,
                  link: '/cv-mallar'
                },
                {
                  icon: Linkedin,
                  title: 'LinkedIn-profiloptimering',
                  description: '80% av rekryterare söker kandidater via LinkedIn. Optimera din profil för både AI-sökning och mänskliga rekryterare.',
                  badge: 'Nytt',
                  badgeColor: 'from-pink-500 to-pink-600',
                  stats: 'AI-optimerad',
                  delay: 0.3,
                  link: '/dashboard/linkedin-optimizer'
                },
                {
                  icon: Target,
                  title: 'Smart nyckelordsmatchning',
                  description: 'Våra verktyg identifierar och inkluderar rätt nyckelord från jobbannonsen för maximal träffsäkerhet.',
                  badge: 'Smart',
                  badgeColor: 'from-indigo-500 to-indigo-600',
                  stats: '3x bättre matchning',
                  delay: 0.4,
                  link: '/dashboard'
                },
                {
                  icon: Shield,
                  title: 'Säker datahantering',
                  description: 'GDPR-säker svensk plattform. Din data raderas automatiskt efter 30 dagar.',
                  badge: 'Trygg',
                  badgeColor: 'from-slate-500 to-slate-600',
                  stats: '100% GDPR-säker',
                  delay: 0.5,
                  link: '/integritetspolicy'
                }
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  className="group relative"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: feature.delay, duration: 0.5 }}
                >
                  <motion.div
                    className="relative h-full bg-white rounded-xl border border-slate-200 p-4 sm:p-6 cursor-pointer overflow-hidden"
                    whileHover={{
                      y: -8,
                      transition: { duration: 0.3, ease: "easeOut" }
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Gradient overlay on hover */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0"
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />

                    {/* Content */}
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <motion.div
                          className="w-12 h-12 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl flex items-center justify-center"
                          whileHover={{
                            scale: 1.15,
                            rotate: 5,
                            background: 'linear-gradient(135deg, rgb(239 246 255) 0%, rgb(219 234 254) 100%)',
                          }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <feature.icon className="w-6 h-6 text-slate-700" />
                        </motion.div>
                        <motion.span
                          className={`px-3 py-1 bg-gradient-to-r ${feature.badgeColor} text-white text-xs font-bold rounded-full`}
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          {feature.badge}
                        </motion.span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-slate-600 mb-4">{feature.description}</p>

                      {/* Animated stats bar */}
                      <div className="pt-4 border-t border-slate-100">
                        <motion.p
                          className="text-xs font-medium text-slate-500 flex items-center gap-2"
                          initial={{ width: 0 }}
                          whileInView={{ width: 'auto' }}
                          viewport={{ once: true }}
                          transition={{ delay: feature.delay + 0.5, duration: 0.5 }}
                        >
                          <motion.span
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-1.5 h-1.5 bg-green-500 rounded-full"
                          />
                          {feature.stats}
                        </motion.p>
                      </div>
                    </div>

                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <PremiumPricingSection />

      {/* Personalized User Journey - Interactive personas with wow factor */}
      <section className="py-24 bg-gradient-to-b from-white to-slate-50 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Anpassad för din situation
              </h2>
              <p className="text-xl text-slate-600">
                Oavsett var du är i karriären har vi rätt verktyg för dig
              </p>
            </motion.div>

            <PersonalizedUserJourney />
          </div>
        </div>
      </section>

      {/* CV Templates Showcase */}
      <section id="mallar" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Professionella CV-mallar för alla branscher
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Välj bland våra branschoptimerade mallar. Alla är ATS-säkra och godkända av svenska rekryterare.
            </p>
          </div>

          {/* Templates slider */}
          <div className="relative max-w-7xl mx-auto">
            <button
              onClick={() => swiperInstance?.slidePrev()}
              className="flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 min-w-[44px] min-h-[44px] w-12 h-12 bg-white border border-slate-200 rounded-full shadow-lg items-center justify-center hover:shadow-xl transition-all duration-300 hover:scale-110 touch-manipulation"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <button
              onClick={() => swiperInstance?.slideNext()}
              className="flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 min-w-[44px] min-h-[44px] w-12 h-12 bg-white border border-slate-200 rounded-full shadow-lg items-center justify-center hover:shadow-xl transition-all duration-300 hover:scale-110 touch-manipulation"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>

            <Swiper
              onSwiper={setSwiperInstance}
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={24}
              slidesPerView={1.2}
              centeredSlides={false}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
              }}
              pagination={{
                clickable: true,
                bulletClass: 'swiper-pagination-bullet !bg-slate-300',
                bulletActiveClass: 'swiper-pagination-bullet-active !bg-blue-600'
              }}
              breakpoints={{
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 }
              }}
              className="!pb-12"
            >
              {cvTemplates.map((template) => (
                <SwiperSlide key={template.id}>
                  <div className="group cursor-pointer">
                    <div className="relative bg-white rounded-xl overflow-hidden border border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                      <div className="aspect-[3/4] bg-gradient-to-br from-slate-50 to-slate-100 p-4">
                        <div className="w-full h-full bg-white rounded-lg shadow-inner overflow-hidden">
                          <img
                            src={template.svg}
                            alt={template.name}
                            className="w-full h-full object-contain"
                            loading="lazy"
                          />
                        </div>
                        {template.premium && (
                          <div className="absolute top-3 right-3 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full">
                            Premium
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-slate-900 mb-1">{template.name}</h3>
                        <p className="text-sm text-slate-600 mb-2">{template.industry}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < 5 ? 'text-yellow-400 fill-current' : 'text-slate-300'}`} />
                            ))}
                          </div>
                          <span className="text-xs text-slate-500">{template.users} använder</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Vad våra användare säger
              </h2>
              <p className="text-xl text-slate-600">
                Över 2,000 svenskar har redan transformerat sin jobbsökning
              </p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
              {[
                {
                  name: 'Anna Lindberg',
                  role: 'Marknadsförare → Senior Marketing Manager',
                  quote: 'Fick drömjobbet på Spotify efter bara 3 veckors sökande. Verktyget förstod exakt vad de letade efter.',
                  rating: 5,
                  increase: '+45% lön'
                },
                {
                  name: 'Marcus Svensson',
                  role: 'Nyexaminerad → Junior Developer',
                  quote: 'Som nyexad var det svårt att sticka ut. Jobbcoach.ai hjälpte mig framhäva mina projekt på ett kraftfullt sätt.',
                  rating: 5,
                  increase: 'Första jobbet på 2 veckor'
                },
                {
                  name: 'Sofia Andersson',
                  role: 'Konsult → Product Manager',
                  quote: 'Bytte karriär från konsult till tech. Fick 5 intervjuer första veckan med de anpassade breven.',
                  rating: 5,
                  increase: '5 intervjuer första veckan'
                }
              ].map((testimonial, idx) => (
                <div key={idx} className="bg-white rounded-xl p-4 sm:p-6 shadow-lg shadow-slate-900/5 border border-slate-100">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-600 mb-4 italic">"{testimonial.quote}"</p>
                  <div className="pt-4 border-t border-slate-100">
                    <p className="font-semibold text-slate-900">{testimonial.name}</p>
                    <p className="text-sm text-slate-600">{testimonial.role}</p>
                    <p className="text-sm font-bold text-green-600 mt-2">{testimonial.increase}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Vanliga frågor
              </h2>
              <p className="text-xl text-slate-600">
                Allt du behöver veta för att komma igång
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: 'Vad är ATS och varför är det viktigt för mitt CV?',
                  a: 'ATS (Applicant Tracking System) är AI-program som över 70% av svenska rekryterare använder för att automatiskt sålla kandidater. Om ditt CV inte är ATS-optimerat kan det sorteras bort innan någon människa ser det – även om du är perfekt för jobbet.'
                },
                {
                  q: 'Hur hjälper jobbcoach.ai mig ta mig förbi AI-screeningen?',
                  a: 'Våra verktyg är tränade på 50,000+ svenska jobbannonser och identifierar automatiskt vilka nyckelord och struktur som krävs för att passera ATS-system. Vi optimerar både ditt CV och personliga brev för maximal träffsäkerhet.'
                },
                {
                  q: 'Hur snabbt kan jag skapa ett personligt brev?',
                  a: 'Med våra smarta verktyg tar det bara 60 sekunder att skapa ett unikt, ATS-optimerat personligt brev för varje jobbansökan.'
                },
                {
                  q: 'Fungerar det för alla branscher?',
                  a: 'Ja! Våra verktyg är tränade på data från alla stora svenska branscher och anpassar språk och ton efter branschstandard.'
                },
                {
                  q: 'Är mina uppgifter säkra?',
                  a: 'Absolut. Vi är GDPR-certifierade och all data lagras säkert i Sverige. Din data raderas automatiskt efter 30 dagar.'
                },
                {
                  q: 'Vad ingår i gratisversionen?',
                  a: 'Du får en gratis ATS-optimerad CV-analys och kan skapa personliga brev. Perfekt för att testa tjänsten innan du uppgraderar.'
                }
              ].map((item, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full min-h-[44px] touch-manipulation px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-medium text-slate-900 text-left text-sm sm:text-base">{item.q}</span>
                    {expandedFaq === idx ? (
                      <ChevronUp className="w-5 h-5 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-500" />
                    )}
                  </button>
                  {expandedFaq === idx && (
                    <div className="px-6 pb-4">
                      <p className="text-slate-600">{item.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Final CTA - Nordic Elegance */}
      <EnhancedFinalCTA />

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 6s ease-in-out infinite;
          animation-delay: 2s;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .pattern-overlay {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
      `}} />
    </div>
  )
}