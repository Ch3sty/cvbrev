/**
 * Premium Demo-startsida för Jobbcoach.ai
 * Ljus, professionell design inspirerad av ledande SaaS-plattformar
 * Baserad på UX-analys av Seamless.ai, Databox och Loom
 */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ChevronRight, Check, Star, Users, Shield, Award,
  FileText, FileSearch, Target, Lightbulb, BrainCircuit,
  Clock, TrendingUp, Sparkles, Upload, Mail, Phone,
  CheckCircle, Lock, Zap, ArrowRight, Play, X,
  ChevronDown, ChevronUp, BarChart, Globe, Briefcase,
  Rocket, Eye, Heart, MessageCircle, DollarSign,
  ChevronLeft, PenTool, Palette, Trophy, Gift,
  GraduationCap, User, Building2, Layers, Settings,
  Timer, RefreshCw, Gauge, BookOpen, Code, Database
} from 'lucide-react'

// Swiper components
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules'

// Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

export default function Demo1Page() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState('nystartade')
  const [swiperInstance, setSwiperInstance] = useState<any>(null)
  const [playVideo, setPlayVideo] = useState(false)

  // Hantera email-formulär
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setIsLoading(true)
      setTimeout(() => {
        window.location.href = `/register?email=${encodeURIComponent(email)}`
      }, 500)
    }
  }

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

  // Use cases för olika målgrupper
  const useCases = {
    nystartade: {
      title: 'Nyexaminerade',
      icon: GraduationCap,
      description: 'Gör skillnad från dag ett',
      benefits: [
        'Framhäv akademiska meriter optimalt',
        'Översätt kurser till branschrelevanta kompetenser',
        'Få coaching kring praktikplatser och examensarbeten'
      ],
      stat: '73% får första jobbet inom 6 veckor'
    },
    karriärbytare: {
      title: 'Karriärbytare',
      icon: RefreshCw,
      description: 'Lyft överförbara kompetenser',
      benefits: [
        'Identifiera och framhäv överförbara färdigheter',
        'Anpassa erfarenheter till ny bransch',
        'Hantera kompetensluckor professionellt'
      ],
      stat: '68% lyckas byta karriär inom 3 månader'
    },
    specialister: {
      title: 'Erfarna specialister',
      icon: Award,
      description: 'Ta nästa steg i karriären',
      benefits: [
        'Positionera expertkunskaper strategiskt',
        'Kvantifiera resultat och impact',
        'Optimera för executive search och headhunters'
      ],
      stat: '85% får löneökning på 15%+'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50/50">

      {/* Top Navigation Bar - Mer professionell */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-slate-200/50 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Jobbcoach.ai
              </Link>
              <div className="hidden md:flex items-center gap-6">
                <Link href="#funktioner" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                  Funktioner
                </Link>
                <Link href="#mallar" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                  CV-mallar
                </Link>
                <Link href="#priser" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                  Priser
                </Link>
                <Link href="#företag" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                  För företag
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Logga in
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
              >
                Starta gratis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Premium Hero Section - Inspirerad av Loom & Seamless */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Subtil gradient bakgrund */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white to-indigo-50/30" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float-delayed" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Vänster kolumn - Text */}
              <div>
                {/* Trust badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full mb-6">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-green-800">Betrodd av 2,000+ svenska yrkesverksamma</span>
                </div>

                {/* Huvudrubrik */}
                <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-[1.1]">
                  Landa drömjobbet{' '}
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    snabbare med AI
                  </span>
                </h1>

                {/* Underrubrik */}
                <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                  Skapa vinnande personliga brev på 60 sekunder med AI som förstår svenska arbetsmarknaden.
                  <span className="font-semibold text-slate-900"> 89% av våra användare får intervju inom 2 veckor.</span>
                </p>

                {/* CTA-formulär */}
                <form onSubmit={handleEmailSubmit} className="mb-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="din@email.se"
                      className="flex-1 px-5 py-3.5 bg-white border border-slate-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 whitespace-nowrap"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Laddar...
                        </span>
                      ) : (
                        <>Starta gratis idag</>
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Gratis CV-analys
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Inga bindningar
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      GDPR-säker
                    </span>
                  </div>
                </form>

                {/* Social proof */}
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 border-2 border-white" />
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className={`w-4 h-4 ${i < 5 ? 'text-yellow-400 fill-current' : 'text-slate-300'}`} />
                      ))}
                    </div>
                    <p className="text-sm text-slate-600">4.9/5 från 200+ recensioner</p>
                  </div>
                </div>
              </div>

              {/* Höger kolumn - Visuell demo/preview */}
              <div className="relative">
                <div className="relative bg-white rounded-2xl shadow-2xl shadow-slate-900/10 overflow-hidden">
                  {/* Demo video/animation placeholder */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                    {!playVideo ? (
                      <button
                        onClick={() => setPlayVideo(true)}
                        className="group relative w-20 h-20 bg-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform"
                      >
                        <Play className="w-8 h-8 text-blue-600 ml-1" />
                        <div className="absolute inset-0 rounded-full bg-blue-600 opacity-0 group-hover:opacity-10 transition-opacity" />
                      </button>
                    ) : (
                      <div className="text-center p-8">
                        <BrainCircuit className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                        <p className="text-slate-600">AI-demo kommer här</p>
                      </div>
                    )}
                  </div>
                  {/* Stats overlay */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-slate-900">60 sek</p>
                      <p className="text-xs text-slate-600">till färdigt brev</p>
                    </div>
                    <div className="w-px h-10 bg-slate-200" />
                    <div>
                      <p className="text-2xl font-bold text-slate-900">3x</p>
                      <p className="text-xs text-slate-600">fler svar</p>
                    </div>
                    <div className="w-px h-10 bg-slate-200" />
                    <div>
                      <p className="text-2xl font-bold text-slate-900">89%</p>
                      <p className="text-xs text-slate-600">får intervju</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logo Bar - Som Databox */}
      <section className="py-12 bg-white border-y border-slate-100">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm font-medium text-slate-500 mb-8">
            VÅRA ANVÄNDARE HAR FÅTT JOBB HOS
          </p>
          <div className="grid grid-cols-3 md:grid-cols-7 gap-8 items-center justify-items-center opacity-60 hover:opacity-100 transition-opacity">
            {['Spotify', 'Klarna', 'Ericsson', 'H&M', 'Volvo', 'IKEA', 'SEB'].map((company) => (
              <div key={company} className="text-xl font-bold text-slate-400 hover:text-slate-600 transition-colors">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hur det fungerar - 3-stegs process */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Så enkelt är det
              </h2>
              <p className="text-xl text-slate-600">
                Från jobbannons till färdig ansökan på tre enkla steg
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: '1',
                  title: 'Ladda upp ditt CV',
                  description: 'Dra och släpp eller klicka för att ladda upp. Vi läser alla format.',
                  icon: Upload,
                  color: 'blue'
                },
                {
                  step: '2',
                  title: 'AI analyserar jobbet',
                  description: 'Vår AI matchar dina kompetenser mot jobbkraven på sekunder.',
                  icon: BrainCircuit,
                  color: 'indigo'
                },
                {
                  step: '3',
                  title: 'Få perfekt ansökan',
                  description: 'Ladda ner anpassat CV och personligt brev redo att skickas.',
                  icon: FileText,
                  color: 'purple'
                }
              ].map((item, idx) => (
                <div key={idx} className="relative">
                  {idx < 2 && (
                    <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-slate-200 to-transparent -translate-x-4 z-0" />
                  )}
                  <div className="relative z-10">
                    <div className={`w-24 h-24 mx-auto bg-gradient-to-br from-${item.color}-50 to-${item.color}-100 rounded-2xl flex items-center justify-center mb-6`}>
                      <div className={`w-12 h-12 bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 rounded-xl flex items-center justify-center text-white text-xl font-bold`}>
                        {item.step}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">{item.title}</h3>
                    <p className="text-slate-600 text-center">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5">
                Testa nu - helt gratis
                <ArrowRight className="inline-block ml-2 w-5 h-5" />
              </button>
            </div>
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
                Vi är den enda AI-tjänsten som verkligen förstår svenska arbetsmarknaden
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-900/5 border border-slate-100">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  3x högre träffsäkerhet
                </h3>
                <p className="text-slate-600 mb-4">
                  Våra algoritmer är tränade på över 50,000 svenska jobbannonser och CV:n
                </p>
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-sm font-medium text-slate-500">Jämfört med generiska AI-verktyg</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" />
                    <span className="text-lg font-bold text-slate-900">+300%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-900/5 border border-slate-100">
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

              <div className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-900/5 border border-slate-100">
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

      {/* Funktioner - Användarfokuserad design */}
      <section id="funktioner" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Allt du behöver för att lyckas
              </h2>
              <p className="text-xl text-slate-600">
                Komplett verktygslåda för modern jobbsökning
              </p>
            </div>

            {/* Feature grid - 2x3 layout */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: PenTool,
                  title: 'Skapa perfekta personliga brev',
                  description: 'Generera unika brev för varje ansökan på 60 sekunder. Anpassade efter företagskultur och jobbkrav.',
                  badge: 'Mest använd',
                  badgeColor: 'bg-blue-500',
                  stats: '10,000+ brev skapade'
                },
                {
                  icon: FileSearch,
                  title: 'CV-analys med AI-feedback',
                  description: 'Få konkreta förbättringsförslag baserat på vad svenska rekryterare letar efter.',
                  badge: 'Gratis',
                  badgeColor: 'bg-green-500',
                  stats: '4.9/5 användarbetyg'
                },
                {
                  icon: Palette,
                  title: 'Professionella CV-mallar',
                  description: '8+ branschoptimerade mallar som passerar alla ATS-filter. Välj design som matchar din roll.',
                  badge: 'Premium',
                  badgeColor: 'bg-purple-500',
                  stats: 'ATS-optimerade'
                },
                {
                  icon: Target,
                  title: 'Smart nyckelordsmatchning',
                  description: 'AI identifierar och inkluderar rätt nyckelord från jobbannonsen för maximal träffsäkerhet.',
                  badge: 'AI-driven',
                  badgeColor: 'bg-indigo-500',
                  stats: '3x bättre matchning'
                },
                {
                  icon: GraduationCap,
                  title: 'Personlig kompetensutveckling',
                  description: 'Få AI-genererade utvecklingsplaner baserat på dina karriärmål och marknadens krav.',
                  badge: 'Ny',
                  badgeColor: 'bg-pink-500',
                  stats: 'Skräddarsydd plan'
                },
                {
                  icon: Shield,
                  title: 'Säker datahantering',
                  description: 'GDPR-säker svensk plattform. Din data raderas automatiskt efter 30 dagar.',
                  badge: 'Trygg',
                  badgeColor: 'bg-slate-500',
                  stats: '100% GDPR-säker'
                }
              ].map((feature, idx) => (
                <div key={idx} className="group relative bg-white rounded-xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-slate-900/5 transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <feature.icon className="w-6 h-6 text-slate-700" />
                    </div>
                    <span className={`px-3 py-1 ${feature.badgeColor} text-white text-xs font-bold rounded-full`}>
                      {feature.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-600 mb-4">{feature.description}</p>
                  <p className="text-xs font-medium text-slate-500">{feature.stats}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases - Som Loom */}
      <section className="py-24 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Anpassad för din situation
              </h2>
              <p className="text-xl text-slate-600">
                Oavsett var du är i karriären har vi rätt verktyg för dig
              </p>
            </div>

            {/* Tabs */}
            <div className="flex justify-center mb-12">
              <div className="inline-flex bg-slate-100 rounded-xl p-1">
                {Object.keys(useCases).map((key) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                      activeTab === key
                        ? 'bg-white text-slate-900 shadow-lg'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {useCases[key as keyof typeof useCases].title}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-900/5 p-8 md:p-12">
              {Object.entries(useCases).map(([key, useCase]) => (
                <div
                  key={key}
                  className={`${activeTab === key ? 'block' : 'hidden'} animate-fadeIn`}
                >
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                        <useCase.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-3">{useCase.description}</h3>
                      <ul className="space-y-3 mb-6">
                        {useCase.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-600">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                        <p className="text-lg font-bold text-slate-900">{useCase.stat}</p>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl flex items-center justify-center">
                        <div className="text-center">
                          <useCase.icon className="w-24 h-24 text-slate-300 mx-auto mb-4" />
                          <p className="text-slate-500">Visualisering kommer här</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white border border-slate-200 rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-300 hover:scale-110"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <button
              onClick={() => swiperInstance?.slideNext()}
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white border border-slate-200 rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-300 hover:scale-110"
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

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Anna Lindberg',
                  role: 'Marknadsförare → Senior Marketing Manager',
                  quote: 'Fick drömjobbet på Spotify efter bara 3 veckors sökande. AI:n förstod exakt vad de letade efter.',
                  rating: 5,
                  increase: '+45% lön'
                },
                {
                  name: 'Marcus Svensson',
                  role: 'Nyexaminerad → Junior Developer',
                  quote: 'Som nyexad var det svårt att sticka ut. Jobbcoach.ai hjälpte mig framhäva mina projekt perfekt.',
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
                <div key={idx} className="bg-white rounded-xl p-6 shadow-lg shadow-slate-900/5 border border-slate-100">
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
                  q: 'Hur snabbt kan jag skapa ett personligt brev?',
                  a: 'Med vår AI tar det bara 60 sekunder att skapa ett unikt, anpassat personligt brev för varje jobbansökan.'
                },
                {
                  q: 'Fungerar det för alla branscher?',
                  a: 'Ja! Vår AI är tränad på data från alla stora svenska branscher och anpassar språk och ton efter branschstandard.'
                },
                {
                  q: 'Är mina uppgifter säkra?',
                  a: 'Absolut. Vi är GDPR-certifierade och all data lagras säkert i Sverige. Din data raderas automatiskt efter 30 dagar.'
                },
                {
                  q: 'Kan jag avsluta när som helst?',
                  a: 'Ja, du kan avsluta din prenumeration när som helst utan bindningstid eller dolda avgifter.'
                },
                {
                  q: 'Vad ingår i gratisversionen?',
                  a: 'Du får en gratis CV-analys och kan skapa 3 personliga brev. Perfekt för att testa tjänsten innan du uppgraderar.'
                }
              ].map((item, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-medium text-slate-900 text-left">{item.q}</span>
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

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Starta din framgångsresa idag
            </h2>
            <p className="text-xl text-white/90 mb-10">
              Gå med 2,000+ svenskar som redan landat drömjobbet med AI-hjälp
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.href = '/register'}
                className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl shadow-2xl hover:shadow-3xl hover:-translate-y-0.5 transition-all duration-300"
              >
                Starta gratis nu
                <ArrowRight className="inline-block ml-2 w-5 h-5" />
              </button>
              <button className="px-8 py-4 bg-white/10 backdrop-blur-xl text-white font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300">
                Boka demo
                <Phone className="inline-block ml-2 w-5 h-5" />
              </button>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-white/80 text-sm">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Ingen bindningstid
              </span>
              <span className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                GDPR-säker
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Setup på 2 minuter
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-white mb-4">Jobbcoach.ai</h3>
              <p className="text-sm">Din AI-drivna karriärpartner för svenska arbetsmarknaden.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Produkt</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Funktioner</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Priser</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">CV-mallar</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Integrationer</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Företag</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Om oss</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Karriär</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Press</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Kontakt</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Hjälpcenter</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">GDPR</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Villkor</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">API</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-center text-sm">
            <p>&copy; 2024 Jobbcoach.ai. Alla rättigheter förbehållna. Utvecklad med ❤️ i Sverige.</p>
          </div>
        </div>
      </footer>

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
      `}} />
    </div>
  )
}