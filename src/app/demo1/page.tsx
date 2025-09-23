/**
 * Premium Demo-startsida för Jobbcoach.ai
 * Ljus, modern design med premium-känsla som matchar toppklassiga SaaS-sidor
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
  Rocket, Eye, Heart, MessageCircle, DollarSign
} from 'lucide-react'

export default function Demo1Page() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Följ musposition för gradient-effekt
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

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

  // CV-mallar data - uppdaterad baserat på faktiska premium-mallar
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

      {/* Premium Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animerad gradient-bakgrund */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.15), transparent 80%)`,
            }}
          />
        </div>

        {/* Flytande orber för djup */}
        <div className="absolute top-20 -left-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-40 -right-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-20 left-40 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

        {/* Rutnätsmönster */}
        <div className="absolute inset-0 opacity-50 grid-pattern" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Trust badge med animation */}
          <div className="flex justify-center mb-8 animate-fade-in-down">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-xl border border-white/60 rounded-full shadow-2xl shadow-blue-500/10">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                GDPR-säker & Svenskutvecklad plattform
              </span>
            </div>
          </div>

          {/* Premium headline */}
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-8 leading-[0.9] tracking-[-0.02em] animate-fade-in">
              <span className="block text-slate-900">Få fler intervjuer</span>
              <span className="block mt-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient-x">
                med AI-superkrafter
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 mb-10 leading-relaxed max-w-3xl mx-auto font-light animate-fade-in-up">
              Professionell jobbcoach-hjälp som förstår svenska arbetsmarknaden.
              <span className="font-semibold text-slate-900"> Skapa vinnande CV och personliga brev på sekunder.</span>
            </p>

            {/* Premium email capture */}
            <form onSubmit={handleEmailSubmit} className="max-w-xl mx-auto mb-10 animate-fade-in-up animation-delay-200">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200" />
                <div className="relative flex flex-col sm:flex-row gap-3 p-2 bg-white rounded-2xl shadow-2xl shadow-slate-900/10">
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
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 whitespace-nowrap"
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
                        Analysera mitt CV gratis
                        <ArrowRight className="inline-block ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-4 flex items-center justify-center gap-4">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Ingen bindningstid
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Gratis att testa
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Avsluta när som helst
                </span>
              </p>
            </form>

            {/* Animated trust signals */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 animate-fade-in-up animation-delay-400">
              <div className="flex items-center gap-3 group">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-slate-900">2,000+</div>
                  <div className="text-sm text-slate-600">nöjda användare</div>
                </div>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/25 group-hover:scale-110 transition-transform">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-slate-900">4.8/5</div>
                  <div className="text-sm text-slate-600">snittbetyg</div>
                </div>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-slate-900">89%</div>
                  <div className="text-sm text-slate-600">får intervju inom 2v</div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-8 h-8 text-slate-400" />
          </div>
        </div>
      </section>

      {/* Premium Social Proof Bar */}
      <section className="relative py-12 bg-gradient-to-r from-slate-50 to-white border-y border-slate-100">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm font-medium text-slate-600 mb-6 uppercase tracking-wide">
            Vi matchar dagligen CV:n mot attraktiva tjänster hos
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16">
            {['Volvo', 'Ericsson', 'H&M', 'ICA', 'SEB', 'IKEA', 'Friskis & Svettis'].map((company) => (
              <div key={company} className="group">
                <span className="text-2xl font-bold text-slate-300 group-hover:text-slate-600 transition-colors duration-300 cursor-default">
                  {company}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Value Props */}
      <section className="py-24 bg-white relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50/30 to-white" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-4">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">Varför välja oss?</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6">
                Transformera din jobbsökning
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Vi kombinerar kraftfull AI med svensk arbetsmarknadsexpertis för att maximera dina chanser
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Clock,
                  title: 'Spara 90% tid',
                  description: 'Från timmar till minuter per ansökan',
                  stat: '10x',
                  statLabel: 'snabbare',
                  gradient: 'from-blue-500 to-cyan-500',
                  shadow: 'blue'
                },
                {
                  icon: Target,
                  title: 'Träffsäker matchning',
                  description: 'AI matchar dina styrkor mot kraven',
                  stat: '3x',
                  statLabel: 'fler svar',
                  gradient: 'from-green-500 to-emerald-500',
                  shadow: 'green'
                },
                {
                  icon: BrainCircuit,
                  title: 'Datadriven framgång',
                  description: 'Optimerad för svenska arbetsmarknaden',
                  stat: '89%',
                  statLabel: 'får intervju',
                  gradient: 'from-purple-500 to-pink-500',
                  shadow: 'purple'
                }
              ].map((item, idx) => (
                <div key={idx} className="group relative">
                  <div className={`absolute -inset-1 bg-gradient-to-r ${item.gradient} rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500`} />
                  <div className="relative h-full p-8 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-900/5 group-hover:shadow-2xl group-hover:shadow-${item.shadow}-500/10 transition-all duration-300 group-hover:-translate-y-1">
                    <div className={`w-14 h-14 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center shadow-lg shadow-${item.shadow}-500/30 mb-6`}>
                      <item.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-slate-600 mb-6">{item.description}</p>
                    <div className="pt-6 border-t border-slate-100">
                      <div className="text-3xl font-black bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent">
                        {item.stat}
                      </div>
                      <div className="text-sm font-medium text-slate-600">{item.statLabel}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Premium Features Grid */}
      <section className="py-24 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full mb-4">
              <Zap className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-900">Kraftfulla funktioner</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6">
              Allt du behöver för att lyckas
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Från AI-drivna personliga brev till djupgående kompetensanalys
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {[
              { icon: FileText, title: 'AI-personliga brev', desc: 'Unika brev anpassade för varje tjänst', badge: 'Mest populär', color: 'blue' },
              { icon: FileSearch, title: 'CV-analys & optimering', desc: 'ATS-scanning och konkreta tips', badge: 'Gratis', color: 'green' },
              { icon: BrainCircuit, title: 'Kompetensanalys', desc: 'Identifiera styrkor och utvecklingsområden', badge: 'Premium', color: 'purple' },
              { icon: Lightbulb, title: 'Tonalitetsanpassning', desc: 'Matcha företagskulturen perfekt', badge: 'AI-driven', color: 'orange' },
              { icon: Upload, title: 'Ett-klicks CV-optimering', desc: 'Ladda upp ditt CV och få en snygg mall direkt', badge: 'Automatisk', color: 'teal' },
              { icon: Sparkles, title: 'Nyckelordsoptimering', desc: 'Matcha jobbannonsen automatiskt', badge: 'Smart', color: 'pink' },
              { icon: Target, title: 'LinkedIn-integrering', desc: 'Importera din profil direkt', badge: 'Ny', color: 'indigo' },
              { icon: Users, title: 'Anpassningsbara CV:n', desc: 'Välj foto och LinkedIn-länk', badge: 'Flexibel', color: 'yellow' },
              { icon: Globe, title: 'Branschspecifika tips', desc: 'Anpassat för din bransch', badge: 'Expert', color: 'red' },
              { icon: Clock, title: 'Sparade ansökningar', desc: 'Organisera alla dina ansökningar', badge: 'Praktisk', color: 'gray' },
              { icon: Award, title: 'Intervjuförberedelse', desc: 'AI-genererade intervjufrågor', badge: 'Premium', color: 'emerald' },
              { icon: TrendingUp, title: 'Ansökningsstatistik', desc: 'Följ dina framsteg över tid', badge: 'Insikter', color: 'cyan' }
            ].map((feature, idx) => (
              <div key={idx} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-${feature.color}-500 to-${feature.color}-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-10 transition duration-500" />
                <div className="relative h-full p-6 bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-900/5 group-hover:shadow-2xl group-hover:border-${feature.color}-100 transition-all duration-300 group-hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 bg-${feature.color}-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
                    </div>
                    <span className={`px-3 py-1 bg-${feature.color}-50 text-${feature.color}-700 text-xs font-semibold rounded-full`}>
                      {feature.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-${feature.color}-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium CV Templates */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full mb-4">
              <Upload className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-900">Ett-klicks optimering</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6">
              Från gammalt CV till proffsig mall på sekunder
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-4">
              Ladda bara upp ditt befintliga CV och få ett ATS-optimerat CV i snygg design automatiskt.
            </p>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Du väljer själv om du vill inkludera foto och LinkedIn-profil
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {cvTemplates.map((template) => (
              <div key={template.id} className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500" />
                <div className="relative bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-xl shadow-slate-900/5 group-hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2 cursor-pointer">
                  <div className="aspect-[3/4] bg-gradient-to-br from-slate-50 to-slate-100 p-4 relative">
                    <div className="w-full h-full bg-white rounded-lg shadow-inner overflow-hidden">
                      <img
                        src={template.svg}
                        alt={`${template.name} CV-mall`}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    {/* Premium badge only */}
                    {template.premium && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-lg">
                        Premium
                      </div>
                    )}
                    {/* Hover overlay med registreringslänk */}
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-6"
                      onClick={() => window.location.href = '/register'}
                    >
                      <button className="px-6 py-2.5 bg-white text-slate-900 font-bold rounded-xl shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        Registrera dig för att använda
                      </button>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-slate-900 mb-1 group-hover:text-purple-600 transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-sm text-slate-600 mb-3">{template.industry}</p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-slate-200'}`} />
                      ))}
                      <span className="text-xs text-slate-500 ml-1">4.8</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern-white" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
              Redo att få ditt drömjobb?
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Gå med tusentals svenskar som redan transformerat sin jobbsökning med AI-kraft
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl shadow-2xl hover:shadow-3xl hover:-translate-y-0.5 transition-all duration-300">
                Börja gratis idag
                <ArrowRight className="inline-block ml-2 w-5 h-5" />
              </button>
              <button className="px-8 py-4 bg-white/10 backdrop-blur-xl text-white font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300">
                Se demo
                <Play className="inline-block ml-2 w-5 h-5" />
              </button>
            </div>
            <div className="mt-8 flex items-center justify-center gap-8 text-white/80">
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
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
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
        .grid-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        .grid-pattern-white {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
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
        .animate-gradient-x {
          animation: gradient-x 4s ease infinite;
          background-size: 200% 200%;
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
      `}} />
    </div>
  )
}