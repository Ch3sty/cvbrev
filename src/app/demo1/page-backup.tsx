/**
 * Demo-startsida för Jobbcoach.ai
 * Professionell, ljus design baserad på SaaS best practices
 * Skapad för att testa konverteringsförbättringar
 */
'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ChevronRight, Check, Star, Users, Shield, Award,
  FileText, FileSearch, Target, Lightbulb, BrainCircuit,
  Clock, TrendingUp, Sparkles, Upload, Mail, Phone,
  CheckCircle, Lock, Zap, ArrowRight, Play, X,
  ChevronDown, ChevronUp, BarChart, Globe, Briefcase
} from 'lucide-react'

export default function Demo1Page() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)

  // Hantera email-formulär
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setIsLoading(true)
      // Simulera loading
      setTimeout(() => {
        window.location.href = `/register?email=${encodeURIComponent(email)}`
      }, 500)
    }
  }

  // CV-mallar data med faktiska SVG-filer
  const cvTemplates = [
    { id: 1, name: 'Modern Minimal', industry: 'Tech/Startup', popularity: 89, svg: '/mallar/modern-minimal.svg', premium: false },
    { id: 2, name: 'Klassisk Professional', industry: 'Bank/Finans', popularity: 92, svg: '/mallar/classic-professional.svg', premium: false },
    { id: 3, name: 'Clean Corporate', industry: 'Konsult/B2B', popularity: 94, svg: '/mallar/clean-corporate.svg', premium: false },
    { id: 4, name: 'Executive Premium', industry: 'Ledning/Chef', popularity: 85, svg: '/mallar/executive-premium.svg', premium: true },
    { id: 5, name: 'Nordic Professional', industry: 'Alla branscher', popularity: 88, svg: '/mallar/nordic-professional.svg', premium: false },
    { id: 6, name: 'Creative Edge', industry: 'Media/Design', popularity: 76, svg: '/mallar/creative-edge.svg', premium: false },
    { id: 7, name: 'Platinum Executive', industry: 'VD/Direktion', popularity: 82, svg: '/mallar/platinum-executive.svg', premium: true },
    { id: 8, name: 'Creative Minimal', industry: 'Kreativa yrken', popularity: 79, svg: '/mallar/creative-minimal.svg', premium: false }
  ]

  // FAQ data
  const faqItems = [
    {
      question: "Hur lång tid tar det att skapa ett personligt brev?",
      answer: "Med vår AI tar det vanligtvis mindre än 60 sekunder att generera ett unikt, anpassat personligt brev. Du kan sedan finjustera det efter behov."
    },
    {
      question: "Fungerar det för alla branscher och roller?",
      answer: "Ja! Vår AI är tränad på tusentals svenska jobbannonser från alla branscher. Den anpassar automatiskt ton och innehåll efter rollen du söker."
    },
    {
      question: "Är mina uppgifter säkra?",
      answer: "Absolut. Vi är GDPR-certifierade och använder bankliknande kryptering. Du kan när som helst radera all din data med ett klick."
    },
    {
      question: "Kan jag avsluta när som helst?",
      answer: "Ja, det finns ingen bindningstid. Du kan pausa eller avsluta din prenumeration när som helst direkt från ditt konto."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(59, 130, 246) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Trust badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">GDPR-säker & Svenskutvecklad</span>
            </div>
          </div>

          {/* Main headline */}
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 tracking-tight">
              Få fler intervjuer med{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                AI-hjälp
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 mb-8 leading-relaxed">
              Professionell jobbcoach-hjälp som förstår svenska arbetsmarknaden.
              Skapa vinnande CV och personliga brev på minuter, inte timmar.
            </p>

            {/* Email capture form */}
            <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto mb-8">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="din@email.se"
                  className="flex-1 px-5 py-4 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 whitespace-nowrap"
                >
                  {isLoading ? 'Startar...' : 'Analysera mitt CV gratis'}
                </button>
              </div>
              <p className="text-sm text-slate-500 mt-3">
                ✓ Ingen bindningstid ✓ Gratis att testa ✓ Avsluta när som helst
              </p>
            </form>

            {/* Trust signals */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-12">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                <span className="text-slate-700 font-medium">2000+ nöjda användare</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-slate-700 font-medium">4.8/5 snittbetyg</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-slate-700 font-medium">89% får intervju inom 2 veckor</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="py-8 bg-white border-y border-slate-200">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-slate-600 mb-4">Vi matchar dagligen CV:n mot attraktiva tjänster hos företag som</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60">
            <span className="text-xl font-semibold text-slate-700">Volvo</span>
            <span className="text-xl font-semibold text-slate-700">Ericsson</span>
            <span className="text-xl font-semibold text-slate-700">H&M</span>
            <span className="text-xl font-semibold text-slate-700">Spotify</span>
            <span className="text-xl font-semibold text-slate-700">SEB</span>
          </div>
        </div>
      </section>

      {/* Value Proposition Section - Mer professionell approach */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Varför välja Jobbcoach.ai?
              </h2>
              <p className="text-xl text-slate-600">
                Vi förvandlar din jobbsökning från tidskrävande gissningsarbete till en datadriven process
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Spara tid</h3>
                <p className="text-slate-600">
                  Från timmar till minuter - skapa anpassade ansökningar 10x snabbare
                </p>
                <div className="mt-4 text-2xl font-bold text-blue-600">90%</div>
                <p className="text-sm text-slate-500">tidsbesparing per ansökan</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Öka precision</h3>
                <p className="text-slate-600">
                  AI matchar dina styrkor mot arbetsgivarens krav för perfekt passform
                </p>
                <div className="mt-4 text-2xl font-bold text-green-600">3x</div>
                <p className="text-sm text-slate-500">högre svarsfrekvens</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BrainCircuit className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Få insikter</h3>
                <p className="text-slate-600">
                  Förstå vad som saknas och få konkreta förbättringsförslag
                </p>
                <div className="mt-4 text-2xl font-bold text-purple-600">89%</div>
                <p className="text-sm text-slate-500">får intervju inom 2 veckor</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Alla våra kraftfulla funktioner
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Från AI-drivna personliga brev till djupgående kompetensanalys - allt för din framgång
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Kärnfunktioner */}
            <div className="bg-slate-50 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">AI-personliga brev</h3>
              <p className="text-slate-600 text-sm mb-3">
                Unika brev anpassade för varje tjänst på 60 sekunder
              </p>
              <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                <TrendingUp className="w-4 h-4" />
                <span>3x högre svarsfrekvens</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <FileSearch className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">CV-analys & optimering</h3>
              <p className="text-slate-600 text-sm mb-3">
                ATS-optimering och konkreta förbättringsförslag
              </p>
              <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>Godkänd av rekryterare</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <BrainCircuit className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Kompetensanalys</h3>
              <p className="text-slate-600 text-sm mb-3">
                Identifiera styrkor och utvecklingsområden
              </p>
              <div className="flex items-center gap-2 text-sm text-purple-600 font-medium">
                <Target className="w-4 h-4" />
                <span>Strategisk karriärplan</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Lightbulb className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Tonalitetsanpassning</h3>
              <p className="text-slate-600 text-sm mb-3">
                Matcha företagskulturen perfekt med rätt ton
              </p>
              <div className="flex items-center gap-2 text-sm text-orange-600 font-medium">
                <Award className="w-4 h-4" />
                <span>Premium-funktion</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">ATS-kompatibilitet</h3>
              <p className="text-slate-600 text-sm mb-3">
                Säkerställ att ditt CV går igenom alla filter
              </p>
              <div className="flex items-center gap-2 text-sm text-indigo-600 font-medium">
                <Shield className="w-4 h-4" />
                <span>100% genomslag</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Nyckelordsoptimering</h3>
              <p className="text-slate-600 text-sm mb-3">
                Matcha jobbannonens viktiga nyckelord automatiskt
              </p>
              <div className="flex items-center gap-2 text-sm text-pink-600 font-medium">
                <Target className="w-4 h-4" />
                <span>Perfekt matchning</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Branschspecifika tips</h3>
              <p className="text-slate-600 text-sm mb-3">
                Anpassade råd för din specifika bransch
              </p>
              <div className="flex items-center gap-2 text-sm text-teal-600 font-medium">
                <Briefcase className="w-4 h-4" />
                <span>Expertinsikter</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">PDF-export</h3>
              <p className="text-slate-600 text-sm mb-3">
                Professionell formatering redo att skickas
              </p>
              <div className="flex items-center gap-2 text-sm text-red-600 font-medium">
                <FileText className="w-4 h-4" />
                <span>Perfekt layout</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Sparade ansökningar</h3>
              <p className="text-slate-600 text-sm mb-3">
                Organisera och återanvänd dina bästa ansökningar
              </p>
              <div className="flex items-center gap-2 text-sm text-yellow-600 font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>Smart bibliotek</span>
              </div>
            </div>
          </div>

          {/* Ta bort länken - vi visar alla funktioner längre ner */}
        </div>
      </section>

      {/* CV Templates Gallery */}
      <section className="py-16 lg:py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Professionella CV-mallar som imponerar
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Välj bland våra branschanpassade mallar - alla ATS-optimerade
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {cvTemplates.slice(0, 8).map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1"
                onClick={() => setSelectedTemplate(template.id)}
              >
                <div className="aspect-[3/4] bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden p-4">
                  {/* Visa faktisk SVG med bättre styling */}
                  <div className="w-full h-full bg-white rounded-lg shadow-inner overflow-hidden">
                    <img
                      src={template.svg}
                      alt={`${template.name} CV-mall`}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  {/* Popularity badge */}
                  <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2.5 py-1 rounded-full font-medium shadow-sm">
                    {template.popularity}% väljer
                  </div>
                  {/* Premium badge om premium */}
                  {template.premium && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-xs px-2.5 py-1 rounded-full font-medium shadow-sm">
                      Premium
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-blue-600 bg-opacity-0 group-hover:bg-opacity-90 transition-all duration-300 flex items-center justify-center">
                    <button className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 px-6 py-2 bg-white text-blue-600 font-semibold rounded-lg shadow-lg">
                      Använd denna mall
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{template.name}</h3>
                  <p className="text-sm text-slate-600">{template.industry}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex -space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-slate-500">4.8</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Visa alla CV-mallar
            </button>
          </div>
        </div>
      </section>

      {/* All Features Grid */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Komplett funktionsöversikt
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Från grundläggande till avancerade verktyg för din jobbsökning
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            {/* Core Features */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Zap className="w-6 h-6 text-yellow-500" />
                Kärnfunktioner
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { name: 'AI-genererade personliga brev', desc: 'Unika brev på 60 sekunder', free: true },
                  { name: 'Grundläggande CV-analys', desc: 'Snabb feedback på ditt CV', free: true },
                  { name: 'ATS-kompatibilitetskontroll', desc: 'Säkerställ att ditt CV går igenom filter', free: false },
                  { name: 'Nyckelordsoptimering', desc: 'Matcha jobbannonens krav', free: false }
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 rounded-lg hover:bg-slate-50 transition-colors">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">{feature.name}</h4>
                      <p className="text-sm text-slate-600">{feature.desc}</p>
                    </div>
                    {feature.free && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Gratis</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Premium Features */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Award className="w-6 h-6 text-purple-500" />
                Premium-funktioner
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { name: 'Djupgående CV-analys', desc: 'Detaljerad feedback med åtgärdsplan' },
                  { name: 'Tonalitetsanpassning', desc: 'Matcha företagskulturen perfekt' },
                  { name: 'Obegränsade ansökningar', desc: 'Skapa hur många brev som helst' },
                  { name: 'Branschspecifika tips', desc: 'Anpassat för din bransch' },
                  { name: 'Export till PDF', desc: 'Professionell formatering' },
                  { name: 'Prioriterad support', desc: 'Svar inom 24 timmar' }
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 rounded-lg hover:bg-slate-50 transition-colors">
                    <Lock className="w-5 h-5 text-purple-500 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">{feature.name}</h4>
                      <p className="text-sm text-slate-600">{feature.desc}</p>
                    </div>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Premium</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Coming Soon */}
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-blue-500" />
                Kommer snart
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { name: 'Intervjuförberedelse', desc: 'AI-driven träning för intervjuer' },
                  { name: 'Löneförhandlingstips', desc: 'Datadriven lönerådgivning' },
                  { name: 'Nätverksstrategier', desc: 'Bygg professionella kontakter' },
                  { name: 'LinkedIn-optimering', desc: 'Förbättra din profil' }
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 opacity-75">
                    <Clock className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">{feature.name}</h4>
                      <p className="text-sm text-slate-600">{feature.desc}</p>
                    </div>
                    <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full">Q1 2025</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 lg:py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Så enkelt kommer du igång
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Från registrering till första intervjun på 3 enkla steg
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Skapa ditt konto</h3>
                <p className="text-slate-600">
                  Registrera dig gratis på 30 sekunder. Ingen kreditkort krävs.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-blue-600">2</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Ladda upp ditt CV</h3>
                <p className="text-slate-600">
                  Importera ditt CV (PDF/Word) eller klistra in texten direkt.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Skapa första ansökan</h3>
                <p className="text-slate-600">
                  Generera ditt första personliga brev och skicka iväg det!
                </p>
              </div>
            </div>

            <div className="text-center mt-12">
              <button className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl">
                Kom igång gratis nu
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Våra användare får resultat
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Se vad svenska jobbsökare säger om Jobbcoach.ai
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-slate-50 rounded-xl p-6">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-slate-700 mb-4">
                "Fick 3 intervjuer på 2 veckor efter att ha använt Jobbcoach.ai. CV-analysen visade exakt vad som saknades!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-300 rounded-full" />
                <div>
                  <p className="font-semibold text-slate-900">Maria Andersson</p>
                  <p className="text-sm text-slate-600">Projektledare, Stockholm</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-sm text-green-600 font-medium">
                  Resultat: 40% fler intervjuer
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-6">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-slate-700 mb-4">
                "Som nyexaminerad hade jag ingen aning om hur man skriver personligt brev. Nu får jag svar på nästan alla ansökningar!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-300 rounded-full" />
                <div>
                  <p className="font-semibold text-slate-900">Erik Johansson</p>
                  <p className="text-sm text-slate-600">Civilekonom, Göteborg</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-sm text-green-600 font-medium">
                  Resultat: Första jobbet på 4 veckor
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-6">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-slate-700 mb-4">
                "Sparar minst 2 timmar per ansökan. Tonalitetsanpassningen gör att breven verkligen matchar företagskulturen."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-300 rounded-full" />
                <div>
                  <p className="font-semibold text-slate-900">Lisa Bergström</p>
                  <p className="text-sm text-slate-600">UX Designer, Malmö</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-sm text-green-600 font-medium">
                  Resultat: 5x snabbare ansökningar
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 lg:py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Enkel prissättning som passar alla
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Börja gratis, uppgradera när du vill
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Gratis</h3>
              <p className="text-slate-600 mb-6">Perfekt för att testa tjänsten</p>

              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">0 kr</span>
                <span className="text-slate-600"> / för alltid</span>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-slate-700">2 AI-genererade personliga brev</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-slate-700">2 grundläggande CV-analyser</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-slate-700">Tillgång till CV-mallar</span>
                </li>
                <li className="flex items-start gap-3 opacity-50">
                  <X className="w-5 h-5 text-slate-400 mt-0.5" />
                  <span className="text-slate-500">Djupgående analys</span>
                </li>
                <li className="flex items-start gap-3 opacity-50">
                  <X className="w-5 h-5 text-slate-400 mt-0.5" />
                  <span className="text-slate-500">Obegränsad användning</span>
                </li>
              </ul>

              <button className="w-full px-6 py-3 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors">
                Kom igång gratis
              </button>
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-b from-blue-50 to-white rounded-2xl p-8 border-2 border-blue-500 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold px-4 py-1 rounded-full">
                  MEST POPULÄR
                </span>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-2">Premium</h3>
              <p className="text-slate-600 mb-6">För seriösa jobbsökare</p>

              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">149 kr</span>
                <span className="text-slate-600"> / månad</span>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-slate-700 font-medium">Obegränsade AI-brev</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-slate-700 font-medium">Djupgående CV-analys</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-slate-700 font-medium">Tonalitetsanpassning</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-slate-700 font-medium">Branschspecifika tips</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-slate-700 font-medium">Prioriterad support</span>
                </li>
              </ul>

              <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl">
                Uppgradera till Premium
              </button>

              <p className="text-center text-sm text-slate-600 mt-4">
                Ingen bindningstid • Avsluta när som helst
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Vanliga frågor
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Få svar på dina frågor om Jobbcoach.ai
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-slate-50 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-100 transition-colors"
                >
                  <span className="font-medium text-slate-900">{item.question}</span>
                  {expandedFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-slate-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-600" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-slate-600">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 lg:py-32 bg-gradient-to-r from-blue-600 to-blue-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Redo att ta nästa steg i din karriär?
          </h2>
          <p className="text-xl text-blue-50 mb-8 max-w-2xl mx-auto">
            Över 500 jobbsökare landade sitt drömjobb denna månad.
            Bli nästa framgångshistoria.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg">
              Kom igång gratis nu
            </button>
            <button className="px-8 py-4 bg-transparent text-white font-semibold rounded-lg border-2 border-white hover:bg-white hover:text-blue-600 transition-all">
              Se demo (3 min)
            </button>
          </div>
          <p className="text-sm text-blue-100 mt-6">
            ✓ Ingen kreditkort krävs ✓ Gratis att testa ✓ Avsluta när som helst
          </p>
        </div>
      </section>

    </div>
  )
}