/**
 * Premium Demo-startsida för Jobbcoach.ai
 * Ljus, professionell design inspirerad av Seamless.ai, Databox och Loom
 */
'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  ChevronRight, Check, Star, Users, Shield, Award,
  FileText, FileSearch, Target, Lightbulb, BrainCircuit,
  Clock, TrendingUp, Sparkles, Upload, Mail, Phone,
  CheckCircle, Lock, Zap, ArrowRight, Play, X,
  ChevronDown, ChevronUp, BarChart, Globe, Briefcase,
  Rocket, Eye, Heart, MessageCircle, DollarSign,
  ChevronLeft, PenTool, Palette, Trophy, Gift,
  GraduationCap, User, Menu, Brain, Gauge, BookOpen
} from 'lucide-react'

// Swiper components
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'

// Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

export default function Demo1Page() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  const [swiperInstance, setSwiperInstance] = useState<any>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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

  // CV-mallar data - behåller befintliga
  const cvTemplates = [
    { id: 1, name: 'Modern Minimal', industry: 'Tech/Startup', svg: '/mallar/modern-minimal.svg', premium: false },
    { id: 2, name: 'Klassisk Professional', industry: 'Bank/Finans', svg: '/mallar/classic-professional.svg', premium: false },
    { id: 3, name: 'Clean Corporate', industry: 'Konsult/B2B', svg: '/mallar/clean-corporate.svg', premium: false },
    { id: 4, name: 'Executive Premium', industry: 'Ledning/Chef', svg: '/mallar/executive-premium.svg', premium: true },
    { id: 5, name: 'Nordic Professional', industry: 'Alla branscher', svg: '/mallar/nordic-professional.svg', premium: true },
    { id: 6, name: 'Creative Edge', industry: 'Media/Design', svg: '/mallar/creative-edge.svg', premium: false },
    { id: 7, name: 'Platinum Executive', industry: 'VD/Direktion', svg: '/mallar/platinum-executive.svg', premium: true },
    { id: 8, name: 'Creative Minimal', industry: 'Kreativa yrken', svg: '/mallar/creative-minimal.svg', premium: true }
  ]

  return (
    <div className="min-h-screen bg-white">

      {/* Professional Navigation Header */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="font-black text-xl text-slate-900">
                Jobbcoach.ai
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link href="#features" className="text-slate-600 hover:text-slate-900 transition-colors">
                  Funktioner
                </Link>
                <Link href="#pricing" className="text-slate-600 hover:text-slate-900 transition-colors">
                  Priser
                </Link>
                <Link href="#testimonials" className="text-slate-600 hover:text-slate-900 transition-colors">
                  Recensioner
                </Link>
                <Link href="#faq" className="text-slate-600 hover:text-slate-900 transition-colors">
                  FAQ
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="hidden sm:block text-slate-600 hover:text-slate-900 transition-colors">
                Logga in
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Testa gratis
              </Link>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-slate-600 hover:text-slate-900"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Premium Hero Section - Förbättrad */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Enklare gradient-bakgrund */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50" />

        {/* Subtilare animerade orber */}
        <div className="absolute top-20 -left-20 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-40 -right-20 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-20 left-40 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Förbättrad Trust Badge */}
          <div className="flex justify-center mb-8 animate-fade-in-down">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-full shadow-lg">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-slate-700">
                Över 2,000 svenskar har redan fått drömjobbet
              </span>
            </div>
          </div>

          {/* Optimerad headline med bättre copy */}
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-8 leading-tight tracking-[-0.02em] animate-fade-in">
              <span className="block text-slate-900">Från CV till intervju</span>
              <span className="block mt-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                på 60 sekunder
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 mb-10 leading-relaxed max-w-3xl mx-auto font-light animate-fade-in-up">
              Svenska recruiters väljer våra kandidater 3x oftare. Vår AI analyserar din CV mot jobbannonser och skapar
              <span className="font-semibold text-slate-900"> perfekt matchade ansökningar som faktiskt fungerar.</span>
            </p>

            {/* Förbättrad email capture med tydligare CTA */}
            <form onSubmit={handleEmailSubmit} className="max-w-xl mx-auto mb-10 animate-fade-in-up animation-delay-200">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-300" />
                <div className="relative flex flex-col sm:flex-row gap-3 p-2 bg-white rounded-xl shadow-xl border border-slate-200">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="din@email.se"
                    className="flex-1 px-6 py-4 text-base bg-transparent outline-none placeholder:text-slate-400"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 whitespace-nowrap"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Startar...
                      </span>
                    ) : (
                      <>
                        Skapa mitt första personliga brev - Gratis
                        <ArrowRight className="inline-block ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-4 flex items-center justify-center gap-4">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  7 dagar gratis
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Ingen bindningstid
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Avsluta när som helst
                </span>
              </p>
            </form>

            {/* Förbättrade trust signals med faktiska resultat */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in-up animation-delay-400">
              <div className="text-center">
                <div className="text-3xl font-black text-slate-900">89%</div>
                <div className="text-sm text-slate-600">klarar ATS-screening</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-slate-900">3x</div>
                <div className="text-sm text-slate-600">fler intervjuer</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-slate-900">4.8/5</div>
                <div className="text-sm text-slate-600">snittbetyg</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar - Förbättrad */}
      <section className="relative py-12 bg-slate-50 border-y border-slate-100">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm font-medium text-slate-600 mb-6 uppercase tracking-wide">
            Våra användare har fått jobb hos
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16">
            {['Spotify', 'Volvo', 'Ericsson', 'H&M', 'ICA', 'SEB', 'IKEA'].map((company) => (
              <div key={company} className="group">
                <span className="text-2xl font-bold text-slate-400 group-hover:text-slate-600 transition-colors duration-300">
                  {company}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ny sektion: Så här förvandlar vi din jobbsökning */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-4">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">AI-driven excellens</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
                Så här förvandlar vi din jobbsökning
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Sluta gissa vad rekryterare vill ha. Vår AI vet exakt vad som funkar.
              </p>
            </div>

            {/* Fokuserade funktioner med verkliga fördelar */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl blur opacity-0 group-hover:opacity-10 transition duration-300" />
                <div className="relative h-full p-6 bg-white rounded-xl border border-slate-200 group-hover:border-blue-200 transition-all duration-300">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                    <Brain className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Smart CV-matchning</h3>
                  <p className="text-slate-600 mb-4">
                    Vår AI scannar din CV mot jobbannonser och identifierar exakt vilka kompetenser du behöver framhålla.
                  </p>
                  <div className="pt-4 border-t border-slate-100">
                    <span className="text-2xl font-black text-blue-600">89%</span>
                    <span className="text-sm text-slate-600 ml-2">klarar ATS vs 25% branschsnitt</span>
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl blur opacity-0 group-hover:opacity-10 transition duration-300" />
                <div className="relative h-full p-6 bg-white rounded-xl border border-slate-200 group-hover:border-emerald-200 transition-all duration-300">
                  <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Batch-ansökningar</h3>
                  <p className="text-slate-600 mb-4">
                    Skapa 10 personaliserade ansökningar på tiden det tar att skriva en. Varje brev unikt anpassat.
                  </p>
                  <div className="pt-4 border-t border-slate-100">
                    <span className="text-2xl font-black text-emerald-600">60 sek</span>
                    <span className="text-sm text-slate-600 ml-2">per ansökan vs 2 timmar</span>
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl blur opacity-0 group-hover:opacity-10 transition duration-300" />
                <div className="relative h-full p-6 bg-white rounded-xl border border-slate-200 group-hover:border-purple-200 transition-all duration-300">
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Kulturell optimering</h3>
                  <p className="text-slate-600 mb-4">
                    Svenska företag har sina egna koder. Vår AI justerar ton och språk för perfekt kulturell matchning.
                  </p>
                  <div className="pt-4 border-t border-slate-100">
                    <span className="text-2xl font-black text-purple-600">10,000+</span>
                    <span className="text-sm text-slate-600 ml-2">svenska ansökningar analyserade</span>
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-600 to-amber-700 rounded-xl blur opacity-0 group-hover:opacity-10 transition duration-300" />
                <div className="relative h-full p-6 bg-white rounded-xl border border-slate-200 group-hover:border-amber-200 transition-all duration-300">
                  <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">AI Karriärcoach</h3>
                  <p className="text-slate-600 mb-4">
                    Få feedback som svenska HR-chefer faktiskt ger. Konkreta förbättringar, ingen generisk rådgivning.
                  </p>
                  <div className="pt-4 border-t border-slate-100">
                    <span className="text-2xl font-black text-amber-600">24/7</span>
                    <span className="text-sm text-slate-600 ml-2">tillgänglig karriärrådgivning</span>
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-600 to-rose-700 rounded-xl blur opacity-0 group-hover:opacity-10 transition duration-300" />
                <div className="relative h-full p-6 bg-white rounded-xl border border-slate-200 group-hover:border-rose-200 transition-all duration-300">
                  <div className="w-12 h-12 bg-rose-50 rounded-lg flex items-center justify-center mb-4">
                    <Trophy className="w-6 h-6 text-rose-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Gamifierat lärande</h3>
                  <p className="text-slate-600 mb-4">
                    Gör jobbsökandet roligt med XP, levels och belöningar. Motivation som faktiskt fungerar.
                  </p>
                  <div className="pt-4 border-t border-slate-100">
                    <span className="text-2xl font-black text-rose-600">67%</span>
                    <span className="text-sm text-slate-600 ml-2">får jobb inom 60 dagar</span>
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl blur opacity-0 group-hover:opacity-10 transition duration-300" />
                <div className="relative h-full p-6 bg-white rounded-xl border border-slate-200 group-hover:border-indigo-200 transition-all duration-300">
                  <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">ATS-optimering</h3>
                  <p className="text-slate-600 mb-4">
                    Säkerställ att ditt CV passerar alla automatiska filter. Vi känner alla tricks som fungerar.
                  </p>
                  <div className="pt-4 border-t border-slate-100">
                    <span className="text-2xl font-black text-indigo-600">100%</span>
                    <span className="text-sm text-slate-600 ml-2">GDPR-säkert</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Varför generisk AI misslyckas */}
      <section className="py-24 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
                Varför generisk AI misslyckas i Sverige
              </h2>
              <p className="text-xl text-slate-600">
                Detta är inte en vanlig AI-tjänst. Vi är karriärspecialister som råkar använda AI.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-red-50 rounded-xl p-6 border border-red-100">
                <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
                  <X className="w-5 h-5" />
                  Andra AI-verktyg
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">Generiska amerikanska mallar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">Förstår inte svenska arbetskulturen</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">Samma text till alla jobb</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">Ingen förståelse för ATS-system</span>
                  </li>
                </ul>
              </div>

              <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
                <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  Jobbcoach.ai
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">Tränad på svenska ansökningar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">Kulturell anpassning för svensk marknad</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">Unikt personaliserat för varje roll</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">89% ATS-genomsläpp</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center mt-12">
              <p className="text-lg text-slate-600 italic">
                "Oavsett om du är nyexaminerad eller erfaren ledare -<br />
                svensk arbetsmarknad har sina regler. Vi känner dem alla."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Premium CV Templates - Behåller med små justeringar */}
      <section className="py-24 bg-white" id="templates">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full mb-4">
              <Upload className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-900">Ett-klicks optimering</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
              Från gammalt CV till proffsig mall på sekunder
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-4">
              Ladda bara upp ditt befintliga CV och få ett ATS-optimerat CV i snygg design automatiskt.
            </p>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Designade av svenska HR-professionals, inte generiska mallar
            </p>
          </div>

          {/* CV Templates Slider - Behåller befintlig */}
          <div className="relative max-w-7xl mx-auto">
            <button
              onClick={() => swiperInstance?.slidePrev()}
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-full shadow-lg flex items-center justify-center text-slate-600 hover:text-purple-600 hover:bg-white transition-all duration-300 hover:scale-110"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => swiperInstance?.slideNext()}
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-full shadow-lg flex items-center justify-center text-slate-600 hover:text-purple-600 hover:bg-white transition-all duration-300 hover:scale-110"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <Swiper
              onSwiper={setSwiperInstance}
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={24}
              slidesPerView={1.2}
              centeredSlides={false}
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
              }}
              pagination={{
                clickable: true,
                bulletClass: 'swiper-pagination-bullet !bg-purple-300 !opacity-40',
                bulletActiveClass: 'swiper-pagination-bullet-active !bg-purple-600 !opacity-100'
              }}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                  spaceBetween: 20
                },
                768: {
                  slidesPerView: 3,
                  spaceBetween: 24
                },
                1024: {
                  slidesPerView: 4,
                  spaceBetween: 24
                }
              }}
              className="cv-templates-swiper !pb-12"
            >
              {cvTemplates.map((template) => (
                <SwiperSlide key={template.id}>
                  <div className="group relative h-full">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-0 group-hover:opacity-10 transition duration-300" />
                    <div className="relative bg-white rounded-xl overflow-hidden border border-slate-200 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 cursor-pointer h-full flex flex-col">
                      <div className="aspect-[3/4] bg-gradient-to-br from-slate-50 to-slate-100 p-4 relative flex-shrink-0">
                        <div className="w-full h-full bg-white rounded-lg shadow-inner overflow-hidden">
                          <img
                            src={template.svg}
                            alt={`${template.name} CV-mall`}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                        {template.premium && (
                          <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-lg">
                            Premium
                          </div>
                        )}
                        <div
                          className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-6"
                          onClick={() => window.location.href = '/register'}
                        >
                          <button className="px-4 py-2 bg-white text-slate-900 font-bold rounded-lg shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 text-sm">
                            Använd mall
                          </button>
                        </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-bold text-slate-900 mb-1 group-hover:text-purple-600 transition-colors text-sm">
                          {template.name}
                        </h3>
                        <p className="text-xs text-slate-600 mb-3 flex-1">{template.industry}</p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-slate-200'}`} />
                          ))}
                          <span className="text-xs text-slate-500 ml-1">4.8</span>
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

      {/* Testimonials Section */}
      <section className="py-24 bg-slate-50" id="testimonials">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
              Verkliga resultat från riktiga användare
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Se vad våra användare säger om sin transformation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-100">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-slate-700 mb-4">
                "Jobbcoach.ai hjälpte mig få 3 intervjuer första veckan. Som 47-årig projektledare trodde jag det var kört."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  M
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Marcus</p>
                  <p className="text-sm text-slate-600">Projektledare, Stockholm</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-100">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-slate-700 mb-4">
                "Gick från 0 svar till drömjobbet på Spotify på 2 månader. AI:n förstod exakt vad tech-recruiters letar efter."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                  S
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Sarah</p>
                  <p className="text-sm text-slate-600">Utvecklare, Göteborg</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-100">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-slate-700 mb-4">
                "Som nyexaminerad var det omöjligt att sticka ut. Nu får jag faktiskt svar och har precis tackat ja till mitt första jobb!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                  E
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Emma</p>
                  <p className="text-sm text-slate-600">Ekonom, Malmö</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-8 px-8 py-4 bg-white rounded-xl shadow-lg border border-slate-200">
              <div className="text-center">
                <div className="text-2xl font-black text-slate-900">89%</div>
                <div className="text-sm text-slate-600">klarar automatiserad screening</div>
              </div>
              <div className="w-px h-12 bg-slate-200" />
              <div className="text-center">
                <div className="text-2xl font-black text-slate-900">3x</div>
                <div className="text-sm text-slate-600">fler intervjuer inom 30 dagar</div>
              </div>
              <div className="w-px h-12 bg-slate-200" />
              <div className="text-center">
                <div className="text-2xl font-black text-slate-900">67%</div>
                <div className="text-sm text-slate-600">får jobberbjudande inom 60 dagar</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white" id="pricing">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
              Investera i din karriär
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Börja gratis och uppgradera när du ser resultaten
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="relative bg-white rounded-xl p-6 border border-slate-200 shadow-lg">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Gratis</h3>
              <p className="text-slate-600 mb-6">Testa våra grundfunktioner</p>
              <div className="text-3xl font-black text-slate-900 mb-6">
                0 kr
                <span className="text-base font-normal text-slate-600">/månad</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-500 mt-0.5" />
                  <span className="text-slate-700">1 personligt brev per vecka</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-500 mt-0.5" />
                  <span className="text-slate-700">CV-analys</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-500 mt-0.5" />
                  <span className="text-slate-700">3 CV-mallar</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-slate-400 mt-0.5" />
                  <span className="text-slate-400">Premium-mallar</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-slate-400 mt-0.5" />
                  <span className="text-slate-400">Obegränsade ansökningar</span>
                </li>
              </ul>
              <button
                onClick={() => window.location.href = '/register'}
                className="w-full py-3 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
              >
                Kom igång gratis
              </button>
            </div>

            {/* Premium Plan - Highlighted */}
            <div className="relative bg-gradient-to-b from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-xl transform scale-105">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-500 text-white text-sm font-bold rounded-full">
                MEST POPULÄR
              </div>
              <h3 className="text-xl font-bold mb-2">Premium</h3>
              <p className="text-blue-100 mb-6">För seriösa jobbsökare</p>
              <div className="text-3xl font-black mb-6">
                149 kr
                <span className="text-base font-normal text-blue-100">/månad</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-white mt-0.5" />
                  <span>Obegränsade personliga brev</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-white mt-0.5" />
                  <span>Alla premium CV-mallar</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-white mt-0.5" />
                  <span>AI tonalitetsanpassning</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-white mt-0.5" />
                  <span>ATS-optimering</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-white mt-0.5" />
                  <span>Prioriterad support</span>
                </li>
              </ul>
              <button
                onClick={() => window.location.href = '/register'}
                className="w-full py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
              >
                Starta 7 dagars gratis test
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="relative bg-white rounded-xl p-6 border border-slate-200 shadow-lg">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Enterprise</h3>
              <p className="text-slate-600 mb-6">För team och organisationer</p>
              <div className="text-3xl font-black text-slate-900 mb-6">
                Anpassad
                <span className="text-base font-normal text-slate-600 block">Kontakta oss för pris</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-500 mt-0.5" />
                  <span className="text-slate-700">Alla Premium-funktioner</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-500 mt-0.5" />
                  <span className="text-slate-700">Team-hantering</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-500 mt-0.5" />
                  <span className="text-slate-700">API-åtkomst</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-500 mt-0.5" />
                  <span className="text-slate-700">Anpassad träning</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-500 mt-0.5" />
                  <span className="text-slate-700">Dedikerad account manager</span>
                </li>
              </ul>
              <button
                onClick={() => window.location.href = '/kontakt'}
                className="w-full py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
              >
                Kontakta sälj
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-slate-50" id="faq">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
                Vanliga frågor
              </h2>
              <p className="text-xl text-slate-600">
                Allt du behöver veta för att komma igång
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "Hur snabbt får jag resultat?",
                  a: "De flesta användare får sin första intervju inom 14 dagar. 89% av våra användare klarar ATS-screeningen direkt, vilket betyder att din ansökan faktiskt når rekryteraren."
                },
                {
                  q: "Fungerar det för alla branscher?",
                  a: "Ja! Vår AI är tränad på över 10,000 svenska ansökningar från alla branscher. Vi har specifika optimeringar för tech, finans, vård, industri och många fler."
                },
                {
                  q: "Kan jag avsluta när som helst?",
                  a: "Absolut. Ingen bindningstid, inga dolda avgifter. Du kan pausa eller avsluta din prenumeration när som helst från din profilsida."
                },
                {
                  q: "Är mina uppgifter säkra?",
                  a: "Vi är 100% GDPR-kompatibla och all data lagras säkert inom EU. Vi delar aldrig din information med tredje part utan ditt explicita godkännande."
                },
                {
                  q: "Vad skiljer er från ChatGPT?",
                  a: "ChatGPT är generisk - vi är specialiserade. Vår AI förstår svenska företagskulturer, känner till ATS-system som används i Sverige, och är tränad specifikt på framgångsrika svenska ansökningar."
                }
              ].map((item, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-slate-200">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-semibold text-slate-900">{item.q}</span>
                    {expandedFaq === idx ? (
                      <ChevronUp className="w-5 h-5 text-slate-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-600" />
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

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Sluta slösa tid på dåliga ansökningar
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Börja idag - du har inget att förlora utom tiden du redan förlorar på ansökningar som inte fungerar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.href = '/register'}
                className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl shadow-2xl hover:shadow-3xl hover:-translate-y-0.5 transition-all duration-300"
              >
                Skapa mitt första personliga brev
                <ArrowRight className="inline-block ml-2 w-5 h-5" />
              </button>
              <button
                onClick={() => window.location.href = '/demo'}
                className="px-8 py-4 bg-white/10 backdrop-blur-xl text-white font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                Se hur det fungerar
                <Play className="inline-block ml-2 w-5 h-5" />
              </button>
            </div>
            <div className="mt-8 flex items-center justify-center gap-8 text-white/80">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                7 dagar gratis
              </span>
              <span className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                GDPR-säker
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Resultat på minuter
              </span>
            </div>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-blob {
          animation: blob 10s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.8s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
          animation-fill-mode: backwards;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
          animation-fill-mode: backwards;
        }
        /* Custom Swiper styles */
        .cv-templates-swiper .swiper-pagination {
          bottom: 0 !important;
        }
        .cv-templates-swiper .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          margin: 0 4px !important;
          transition: all 0.3s ease;
        }
        .cv-templates-swiper .swiper-pagination-bullet-active {
          transform: scale(1.2);
        }
      `}} />
    </div>
  )
}