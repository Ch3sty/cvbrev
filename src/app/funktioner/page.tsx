/**
 * Premium funktioner-sida för Jobbcoach.ai
 * Ljust tema med interaktiva komponenter och wow-faktor
 * Skandinavisk minimalism möter AI-innovation
 */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import {
  ChevronRight, ChevronDown, ChevronUp, CheckCircle,
  FileText, FileSearch, Target, Lightbulb, BrainCircuit,
  Clock, TrendingUp, Sparkles, Upload, ArrowRight,
  Shield, Award, Zap, PenTool, Palette, GraduationCap,
  BarChart, Users, Star, Play, X, MessageCircle
} from 'lucide-react'

// Custom components
import PremiumNavbar from '@/components/PremiumNavbar'
import FloatingAIAssistant from '@/components/FloatingAIAssistant'
import FeatureMorphingCard from '@/components/FeatureMorphingCard'
import LiveAIDemo from '@/components/LiveAIDemo'
import BeforeAfterSlider from '@/components/BeforeAfterSlider'
import InteractiveFunctionExplorer from '@/components/InteractiveFunctionExplorer'
import DynamicTrustIndicator from '@/components/DynamicTrustIndicator'

export default function FunktionerPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [showInteractiveDemo, setShowInteractiveDemo] = useState(false)

  // Scroll animations
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

  // Animated statistics component
  const AnimatedStatCard = ({ value, label, icon: Icon, delay = 0 }: any) => (
    <motion.div
      className="bg-white rounded-xl border border-slate-200 p-6 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      whileHover={{ scale: 1.05, y: -5 }}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <motion.div
            className="text-3xl font-bold text-slate-900"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: delay + 0.2, type: "spring", stiffness: 200 }}
          >
            {value}
          </motion.div>
          <p className="text-sm text-slate-600 mt-1">{label}</p>
        </div>
      </div>
    </motion.div>
  )

  // Features data with demo points
  const features = [
    {
      id: 'cover-letter',
      icon: PenTool,
      title: 'Skapa perfekta personliga brev',
      description: 'Generera unika brev för varje ansökan på 60 sekunder. Anpassade efter företagskultur och jobbkrav.',
      badge: 'Mest använd',
      badgeColor: 'from-blue-500 to-blue-600',
      stats: '10,000+ brev skapade',
      demoPoints: [
        'AI analyserar jobbannonsen',
        'Matchar dina kompetenser',
        'Skapar unikt innehåll',
        'ATS-optimerat format'
      ],
      gradient: 'from-blue-400/20 to-cyan-400/20'
    },
    {
      id: 'cv-analysis',
      icon: FileSearch,
      title: 'CV-analys med AI-feedback',
      description: 'Få konkreta förbättringsförslag baserat på vad svenska rekryterare letar efter.',
      badge: 'Gratis',
      badgeColor: 'from-green-500 to-green-600',
      stats: '4.9/5 användarbetyg',
      demoPoints: [
        'Identifierar svagheter',
        'Föreslår förbättringar',
        'Jämför med best practices',
        'Poängsätter ditt CV'
      ],
      gradient: 'from-green-400/20 to-emerald-400/20'
    },
    {
      id: 'cv-templates',
      icon: Palette,
      title: 'Professionella CV-mallar',
      description: '8+ branschoptimerade mallar som passerar alla ATS-filter. Välj design som matchar din roll.',
      badge: 'Premium',
      badgeColor: 'from-purple-500 to-purple-600',
      stats: 'ATS-optimerade',
      demoPoints: [
        'Moderna designer',
        'Branschanpassade',
        'Redigerbara mallar',
        'Export till Word/PDF'
      ],
      gradient: 'from-purple-400/20 to-pink-400/20'
    },
    {
      id: 'keyword-matching',
      icon: Target,
      title: 'Smart nyckelordsmatchning',
      description: 'AI identifierar och inkluderar rätt nyckelord från jobbannonsen för maximal träffsäkerhet.',
      badge: 'AI-driven',
      badgeColor: 'from-indigo-500 to-indigo-600',
      stats: '3x bättre matchning',
      demoPoints: [
        'Skannar jobbannonser',
        'Hittar viktiga nyckelord',
        'Optimerar ditt CV',
        'Ökar synligheten'
      ],
      gradient: 'from-indigo-400/20 to-blue-400/20'
    },
    {
      id: 'competence-development',
      icon: GraduationCap,
      title: 'Personlig kompetensutveckling',
      description: 'Få AI-genererade utvecklingsplaner baserat på dina karriärmål och marknadens krav.',
      badge: 'Ny',
      badgeColor: 'from-pink-500 to-pink-600',
      stats: 'Skräddarsydd plan',
      demoPoints: [
        'Analyserar kompetenser',
        'Identifierar luckor',
        'Skapar lärandeplan',
        'Spårar framsteg'
      ],
      gradient: 'from-pink-400/20 to-rose-400/20'
    },
    {
      id: 'data-security',
      icon: Shield,
      title: 'Säker datahantering',
      description: 'GDPR-säker svensk plattform. Din data raderas automatiskt efter 30 dagar.',
      badge: 'Trygg',
      badgeColor: 'from-slate-500 to-slate-600',
      stats: '100% GDPR-säker',
      demoPoints: [
        'End-to-end kryptering',
        'Svensk datalagring',
        'Automatisk radering',
        'Full kontroll'
      ],
      gradient: 'from-slate-400/20 to-gray-400/20'
    }
  ]

  // FAQ data
  const faqItems = [
    {
      question: "Hur skiljer sig gratis CV-analys från Premium?",
      answer: "Gratisversionen ger dig en grundläggande översikt och identifierar uppenbara förbättringspunkter (1 analys/vecka). Premium ger en djupgående analys med specifika förslag på nyckelord, kvantifiering av prestationer, strukturförbättringar och obegränsade analyser."
    },
    {
      question: "Är min uppladdade data säker?",
      answer: "Ja, säkerheten för din data är vår högsta prioritet. All dataöverföring är krypterad (SSL). Vi lagrar dina CV-texter och genererade brev säkert och delar dem aldrig med tredje part utan ditt uttryckliga medgivande. Du kan när som helst radera dina uppgifter från ditt konto."
    },
    {
      question: "Hur 'smart' är AI:n? Vad baseras den på?",
      answer: "Vår AI använder avancerade modeller (som GPT-4) men är finjusterad med expert-designade instruktioner specifikt framtagna för att skapa högkvalitativa, relevanta och anpassade jobbansökningar. Den är tränad att förstå sammanhanget i både ditt CV och jobbannonsen för att skapa bästa möjliga matchning."
    },
    {
      question: "Kan jag lita på att texten blir unik och inte plagiat?",
      answer: "Absolut. AI:n genererar text baserat på din unika input (CV och jobbannons). Varje genererat brev är unikt för den specifika kombinationen. Vi uppmuntrar dig dock alltid att granska och personifiera texten ytterligare för att säkerställa att den helt representerar dig."
    },
    {
      question: "Hur fungerar betalning och kan jag avsluta när som helst?",
      answer: "Premium kostar 149 kr per månad och betalas via säker kortbetalning (via Stripe). Det finns ingen bindningstid. Du kan enkelt avsluta din prenumeration när som helst direkt från dina kontoinställningar, och du behåller tillgången till Premium månaden ut."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50/50">

      {/* Premium Navigation Bar */}
      <PremiumNavbar />

      {/* Floating AI Assistant */}
      <FloatingAIAssistant />

      {/* Hero Section with Interactive Background */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Morphing background */}
        <motion.div
          className="absolute inset-0"
          style={{ opacity: backgroundOpacity }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white to-indigo-50/30" />

          {/* Mouse-following gradient */}
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
              left: mousePosition.x - 250,
              top: mousePosition.y - 250,
              filter: 'blur(60px)',
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
            className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl"
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
        </motion.div>

        {/* Hero content */}
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">AI-drivna verktyg</span>
            </motion.div>

            {/* Main heading */}
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6">
              Kraftfulla verktyg för{' '}
              <motion.span
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent"
                animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                transition={{ duration: 5, repeat: Infinity }}
                style={{ backgroundSize: '200% 100%' }}
              >
                modern jobbsökning
              </motion.span>
            </h1>

            <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto">
              Komplett verktygslåda som hjälper dig från CV till anställning.
              Våra AI-verktyg sparar tid och ökar dina chanser dramatiskt.
            </p>

            {/* Live animated statistics */}
            <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
              <AnimatedStatCard
                value="2.6x"
                label="Högre intervjufrekvens"
                icon={TrendingUp}
                delay={0.2}
              />
              <AnimatedStatCard
                value="60 sek"
                label="Till färdig ansökan"
                icon={Clock}
                delay={0.4}
              />
              <AnimatedStatCard
                value="89%"
                label="Får intervju inom 2 veckor"
                icon={Target}
                delay={0.6}
              />
            </div>

            {/* Interactive CTA */}
            <motion.button
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-xl"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowInteractiveDemo(true)}
            >
              <span className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Se alla funktioner i aktion
              </span>
            </motion.button>

            {/* Trust indicator */}
            <div className="mt-8">
              <DynamicTrustIndicator />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Function Explorer */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <InteractiveFunctionExplorer />
          </div>
        </div>
      </section>

      {/* Feature Grid with Morphing Cards */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Våra kraftfulla funktioner
              </h2>
              <p className="text-xl text-slate-600">
                Allt du behöver för att maximera dina chanser
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
              {features.map((feature, idx) => (
                <div key={feature.id} className="min-h-[400px]">
                  <FeatureMorphingCard
                    feature={feature}
                    delay={idx * 0.1}
                    onInteract={(id) => console.log(`Interacted with ${id}`)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live AI Demo Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Se AI:n jobba i realtid
              </h2>
              <p className="text-xl text-slate-600">
                Upplev kraften i vår AI-teknologi live
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12">
              <LiveAIDemo />
              <BeforeAfterSlider />
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Timeline */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
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
                Framgångshistorier från användare
              </h2>
              <p className="text-xl text-slate-600">
                Se hur andra har transformerat sin jobbsökning
              </p>
            </motion.div>

            {/* Timeline container with proper positioning */}
            <div className="relative">
              {/* Continuous timeline line */}
              <div className="hidden md:block absolute left-1/2 top-16 bottom-16 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-blue-200 -translate-x-1/2" />

              <div className="space-y-16">
                {[
                  {
                    name: 'Anna Lindberg',
                    role: 'Marknadsförare → Senior Marketing Manager',
                    company: 'Spotify',
                    time: '3 veckor',
                    increase: '+45% lön',
                    quote: 'AI:n förstod exakt vad Spotify letade efter och hjälpte mig framhäva rätt kompetenser.'
                  },
                  {
                    name: 'Marcus Svensson',
                    role: 'Nyexaminerad → Junior Developer',
                    company: 'Klarna',
                    time: '2 veckor',
                    increase: 'Första jobbet',
                    quote: 'Som nyexad var det svårt att sticka ut. Jobbcoach.ai hjälpte mig visa min potential.'
                  },
                  {
                    name: 'Sofia Andersson',
                    role: 'Konsult → Product Manager',
                    company: 'H&M',
                    time: '1 vecka',
                    increase: '5 intervjuer',
                    quote: 'Bytte karriär från konsult till tech. Fick 5 intervjuer första veckan!'
                  }
                ].map((story, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.2 }}
                    className="relative"
                  >
                    <div className={`grid md:grid-cols-2 gap-8 items-center ${idx % 2 === 1 ? 'md:grid-flow-col-dense' : ''}`}>
                      {/* Timeline dot */}
                      <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full ring-4 ring-white shadow-lg z-10" />

                      {/* Content card */}
                      <motion.div
                        className={`${idx % 2 === 1 ? 'md:col-start-2' : 'md:col-start-1'}`}
                        whileHover={{ scale: 1.02, y: -5 }}
                      >
                        <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 relative">
                          {/* Arrow pointing to timeline */}
                          <div className={`hidden md:block absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-slate-200 rotate-45 ${
                            idx % 2 === 1
                              ? '-left-2 border-l border-t'
                              : '-right-2 border-r border-b'
                          }`} />

                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-bold text-slate-900">{story.name}</h3>
                              <p className="text-sm text-slate-600">{story.role}</p>
                              <p className="text-sm font-semibold text-blue-600">{story.company}</p>
                            </div>
                            <div className="flex flex-col gap-1 items-end">
                              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                {story.time}
                              </span>
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                                {story.increase}
                              </span>
                            </div>
                          </div>
                          <p className="text-slate-700 italic mb-4">"{story.quote}"</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                            ))}
                          </div>
                        </div>
                      </motion.div>

                      {/* Empty space for alternating layout */}
                      <div className={`hidden md:block ${idx % 2 === 1 ? 'md:col-start-1' : 'md:col-start-2'}`}></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Matrix */}
      <section className="py-24 bg-white">
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
                Varför välja Jobbcoach.ai?
              </h2>
              <p className="text-xl text-slate-600">
                Se hur vi står oss mot alternativen
              </p>
            </motion.div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
              <div className="grid grid-cols-4 bg-gradient-to-r from-slate-50 to-white">
                <div className="p-6 font-semibold text-slate-900">Funktion</div>
                <div className="p-6 text-center">
                  <div className="font-bold text-blue-600">Jobbcoach.ai</div>
                  <div className="text-xs text-slate-600">Premium</div>
                </div>
                <div className="p-6 text-center">
                  <div className="font-medium text-slate-700">ChatGPT</div>
                  <div className="text-xs text-slate-600">Generell AI</div>
                </div>
                <div className="p-6 text-center">
                  <div className="font-medium text-slate-700">Traditionell</div>
                  <div className="text-xs text-slate-600">Manuell process</div>
                </div>
              </div>

              {[
                { feature: 'Svensk arbetsmarknad', us: true, chatgpt: false, traditional: false },
                { feature: 'ATS-optimerade mallar', us: true, chatgpt: false, traditional: false },
                { feature: 'Avancerade AI-prompts', us: true, chatgpt: 'partial', traditional: false },
                { feature: 'Djupgående CV-analys', us: true, chatgpt: false, traditional: false },
                { feature: 'Färdiga snygga dokument', us: true, chatgpt: false, traditional: 'partial' },
                { feature: 'Kompetensutvecklingsplan', us: true, chatgpt: false, traditional: false },
                { feature: 'GDPR-säker datahantering', us: true, chatgpt: 'partial', traditional: true },
                { feature: 'Obegränsad användning', us: '149 kr/månad', chatgpt: '200+ kr/månad', traditional: 'Gratis men tidskrävande' },
              ].map((row, idx) => (
                <div key={idx} className={`grid grid-cols-4 border-t border-slate-200 ${idx % 2 === 0 ? 'bg-slate-50/50' : ''}`}>
                  <div className="p-6 font-medium text-slate-700">{row.feature}</div>
                  <div className="p-6 text-center">
                    {typeof row.us === 'boolean' ? (
                      row.us ? (
                        <CheckCircle className="w-6 h-6 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-6 h-6 text-red-400 mx-auto" />
                      )
                    ) : row.us === 'partial' ? (
                      <div className="w-6 h-6 bg-yellow-400 rounded-full mx-auto" />
                    ) : (
                      <span className="font-semibold text-green-600">{row.us}</span>
                    )}
                  </div>
                  <div className="p-6 text-center">
                    {typeof row.chatgpt === 'boolean' ? (
                      row.chatgpt ? (
                        <CheckCircle className="w-6 h-6 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-6 h-6 text-red-400 mx-auto" />
                      )
                    ) : row.chatgpt === 'partial' ? (
                      <div className="w-6 h-6 bg-yellow-400 rounded-full mx-auto" />
                    ) : (
                      <span className="text-slate-600">{row.chatgpt}</span>
                    )}
                  </div>
                  <div className="p-6 text-center">
                    {typeof row.traditional === 'boolean' ? (
                      row.traditional ? (
                        <CheckCircle className="w-6 h-6 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-6 h-6 text-red-400 mx-auto" />
                      )
                    ) : row.traditional === 'partial' ? (
                      <div className="w-6 h-6 bg-yellow-400 rounded-full mx-auto" />
                    ) : (
                      <span className="text-slate-600">{row.traditional}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Vanliga frågor
              </h2>
              <p className="text-xl text-slate-600">
                Allt du behöver veta om våra funktioner
              </p>
            </motion.div>

            <div className="space-y-4">
              {faqItems.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-medium text-slate-900 text-left">{item.question}</span>
                    <motion.div
                      animate={{ rotate: expandedFaq === idx ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="w-5 h-5 text-slate-500" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {expandedFaq === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-slate-200"
                      >
                        <div className="px-6 py-5 bg-slate-50">
                          <p className="text-slate-700">{item.answer}</p>
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

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                Redo att revolutionera din jobbsökning?
              </h2>
              <p className="text-xl text-slate-600 mb-8">
                Gå med 2,000+ svenskar som redan landat drömjobbet med våra AI-verktyg
              </p>

              <motion.button
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.href = '/register'}
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Starta gratis idag
                  <ArrowRight className="w-5 h-5" />
                </span>
              </motion.button>

              <div className="mt-6 flex items-center justify-center gap-6 text-sm text-slate-600">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Ingen bindningstid
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Gratis CV-analys
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  GDPR-säker
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Modal */}
      <AnimatePresence>
        {showInteractiveDemo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowInteractiveDemo(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-slate-900">Interaktiv Demo</h3>
                <button
                  onClick={() => setShowInteractiveDemo(false)}
                  className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>
              <div className="p-6">
                <InteractiveFunctionExplorer />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}