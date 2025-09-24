'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import {
  GraduationCap, RefreshCw, Briefcase, Search,
  TrendingUp, Target, Sparkles, ChevronRight,
  BookOpen, Trophy, Rocket, Brain, Zap,
  CheckCircle, ArrowRight, Star
} from 'lucide-react'

interface Persona {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  gradient: string
  skills: string[]
  challenges: string[]
  solutions: string[]
  careerPath: string[]
  avgSalaryIncrease: string
  timeToJob: string
  matchRate: number
}

const personas: Persona[] = [
  {
    id: 'graduate',
    title: 'Nyutexaminerad',
    description: 'Få ditt första jobb snabbare',
    icon: <GraduationCap className="w-6 h-6" />,
    color: 'blue',
    gradient: 'from-blue-400 via-cyan-500 to-teal-600',
    skills: ['Teoretisk kunskap', 'Digital vana', 'Flexibilitet', 'Ny energi'],
    challenges: ['Ingen arbetslivserfarenhet', 'Osäker på marknadsvärde', 'Brett sökande'],
    solutions: [
      'Framhäv akademiska projekt som arbetslivserfarenhet',
      'AI matchar din utbildning mot 500+ juniora roller',
      'Personliga brev som kompenserar för erfarenhet'
    ],
    careerPath: ['Trainee/Junior', 'Specialist', 'Senior', 'Lead/Manager'],
    avgSalaryIncrease: '+15%',
    timeToJob: '3-4 veckor',
    matchRate: 87
  },
  {
    id: 'switcher',
    title: 'Karriärbytare',
    description: 'Visa hur dina färdigheter överförs',
    icon: <RefreshCw className="w-6 h-6" />,
    color: 'purple',
    gradient: 'from-purple-400 via-pink-500 to-red-500',
    skills: ['Branschkunskap', 'Nätverk', 'Bevisad prestation', 'Mognad'],
    challenges: ['Övertyga om relevans', 'Kompetensglapp', 'Löneförhandling'],
    solutions: [
      'AI identifierar överförbara kompetenser',
      'Skräddarsydda övergångsberättelser',
      'Gap-analys med utvecklingsförslag'
    ],
    careerPath: ['Lateral move', 'Byggkompetens', 'Specialisering', 'Expertroll'],
    avgSalaryIncrease: '+25%',
    timeToJob: '5-6 veckor',
    matchRate: 92
  },
  {
    id: 'senior',
    title: 'Senior specialist',
    description: 'Positionera dig för ledarroller',
    icon: <Briefcase className="w-6 h-6" />,
    color: 'indigo',
    gradient: 'from-indigo-400 via-blue-500 to-purple-600',
    skills: ['Djup expertis', 'Ledarerfarenhet', 'Strategisk förståelse', 'Resultat'],
    challenges: ['Överqualificerad-stämpel', 'Ålderdiskriminering', 'För specifik'],
    solutions: [
      'Executive-anpassade CV-mallar',
      'Framhäv ROI och affärsresultat',
      'Moderna nyckelord för ATS-system'
    ],
    careerPath: ['Senior Expert', 'Tech Lead', 'Director', 'C-Level'],
    avgSalaryIncrease: '+35%',
    timeToJob: '6-8 veckor',
    matchRate: 94
  },
  {
    id: 'jobseeker',
    title: 'Arbetssökande',
    description: 'Maximera dina chanser',
    icon: <Search className="w-6 h-6" />,
    color: 'green',
    gradient: 'from-green-400 via-emerald-500 to-teal-500',
    skills: ['Tillgänglighet', 'Motivation', 'Anpassningsbar', 'Hungrig'],
    challenges: ['Förklara gap i CV', 'Tappa självförtroende', 'Många sökande'],
    solutions: [
      'Positiv framing av karriärpauser',
      'Snabboptimering för aktuella roller',
      '10x fler ansökningar med AI-automation'
    ],
    careerPath: ['Omstart', 'Stabilisering', 'Utveckling', 'Avancemang'],
    avgSalaryIncrease: '+20%',
    timeToJob: '2-3 veckor',
    matchRate: 89
  }
]

export default function PersonalizedUserJourney() {
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)
  const [hoveredPersona, setHoveredPersona] = useState<string | null>(null)
  const [animatedSkills, setAnimatedSkills] = useState<string[]>([])
  const [revealedPath, setRevealedPath] = useState(0)
  const [showMetrics, setShowMetrics] = useState(false)
  const [showAutoDemo, setShowAutoDemo] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const controls = useAnimation()

  useEffect(() => {
    if (selectedPersona) {
      // Animera skills progressivt
      selectedPersona.skills.forEach((skill, index) => {
        setTimeout(() => {
          setAnimatedSkills(prev => [...prev, skill])
        }, index * 200)
      })

      // Visa karriärväg steg för steg
      selectedPersona.careerPath.forEach((_, index) => {
        setTimeout(() => {
          setRevealedPath(index + 1)
        }, 1000 + index * 300)
      })

      // Visa metrics efter animationer
      setTimeout(() => {
        setShowMetrics(true)
      }, 2500)
    } else {
      setAnimatedSkills([])
      setRevealedPath(0)
      setShowMetrics(false)
    }
  }, [selectedPersona])

  // Auto-demo effect - visa första personan efter 3 sekunder om ingen interaktion
  useEffect(() => {
    if (!hasInteracted) {
      const timer = setTimeout(() => {
        setShowAutoDemo(true)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [hasInteracted])

  const handlePersonaClick = (persona: Persona) => {
    setHasInteracted(true)
    setShowAutoDemo(false)
    if (selectedPersona?.id === persona.id) {
      setSelectedPersona(null)
    } else {
      setSelectedPersona(persona)
      setAnimatedSkills([])
      setRevealedPath(0)
      setShowMetrics(false)
    }
  }

  return (
    <div className="relative">
      {/* Persona cards grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {personas.map((persona, index) => (
          <motion.div
            key={persona.id}
            layoutId={`persona-${persona.id}`}
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onHoverStart={() => setHoveredPersona(persona.id)}
            onHoverEnd={() => setHoveredPersona(null)}
            onClick={() => handlePersonaClick(persona)}
          >
            <motion.div
              className={`relative h-full cursor-pointer rounded-2xl border-2 transition-all ${
                selectedPersona?.id === persona.id
                  ? 'border-blue-500 shadow-2xl shadow-blue-500/20'
                  : hoveredPersona === persona.id
                  ? 'border-blue-400 shadow-2xl shadow-blue-500/10'
                  : 'border-slate-200'
              }`}
              whileHover={{ scale: 1.08, rotateY: 5, z: 20 }}
              whileTap={{ scale: 0.98 }}
              style={{ transformStyle: 'preserve-3d' }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {/* Gradient glow effect */}
              <motion.div
                className={`absolute -inset-1 bg-gradient-to-r ${persona.gradient} rounded-2xl blur-lg`}
                animate={{
                  opacity: hoveredPersona === persona.id || selectedPersona?.id === persona.id ? 0.3 : 0
                }}
                transition={{ duration: 0.3 }}
              />

              {/* Auto-demo badge */}
              {!hasInteracted && index === 0 && (
                <motion.div
                  className="absolute -top-3 -right-3 z-20"
                  animate={{
                    y: showAutoDemo ? [0, -5, 0] : 0,
                    scale: showAutoDemo ? [1, 1.1, 1] : 1
                  }}
                  transition={{ duration: 1, repeat: showAutoDemo ? Infinity : 0 }}
                >
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Prova mig!
                  </div>
                </motion.div>
              )}

              {/* Card content */}
              <div className="relative h-full bg-white rounded-2xl p-6">
                {/* Icon with animated background */}
                <motion.div
                  className={`relative w-14 h-14 bg-gradient-to-br ${persona.gradient} rounded-xl flex items-center justify-center text-white mb-4`}
                  animate={hoveredPersona === persona.id ? { rotate: [0, 5, -5, 0] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {persona.icon}
                  {selectedPersona?.id === persona.id && (
                    <motion.div
                      className="absolute inset-0 bg-white rounded-xl"
                      initial={{ scale: 0, opacity: 0.5 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1 }}
                    />
                  )}
                </motion.div>

                <h3 className="font-bold text-lg text-slate-900 mb-2">{persona.title}</h3>
                <p className="text-sm text-slate-600 mb-4">{persona.description}</p>

                {/* Quick metrics preview */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Tid till jobb:</span>
                    <span className="font-bold text-slate-700">{persona.timeToJob}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Match-rate:</span>
                    <div className="flex items-center gap-1">
                      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full bg-gradient-to-r ${persona.gradient}`}
                          initial={{ width: 0 }}
                          animate={{ width: hoveredPersona === persona.id ? `${persona.matchRate}%` : '0%' }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                        />
                      </div>
                      <span className="font-bold text-slate-700">{persona.matchRate}%</span>
                    </div>
                  </div>
                </div>

                {/* Hover preview content */}
                <AnimatePresence>
                  {hoveredPersona === persona.id && !selectedPersona && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white to-transparent p-4 pt-8 -mb-4 rounded-b-2xl"
                    >
                      {/* Preview skills */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {persona.skills.slice(0, 2).map((skill, idx) => (
                          <motion.span
                            key={skill}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full"
                          >
                            {skill}
                          </motion.span>
                        ))}
                        {persona.skills.length > 2 && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full">
                            +{persona.skills.length - 2} mer
                          </span>
                        )}
                      </div>

                      {/* CTA with animated arrow */}
                      <motion.div
                        className="flex items-center justify-center gap-2 text-sm font-semibold text-blue-600"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <span>Klicka för personlig analys</span>
                        <ChevronRight className="w-4 h-4" />
                      </motion.div>

                      {/* Mini metrics preview */}
                      <div className="flex justify-center gap-4 mt-2">
                        <motion.div
                          className="text-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <p className="text-xs font-bold text-green-600">{persona.avgSalaryIncrease}</p>
                          <p className="text-xs text-slate-500">löneökning</p>
                        </motion.div>
                        <motion.div
                          className="text-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          <p className="text-xs font-bold text-purple-600">{persona.matchRate}%</p>
                          <p className="text-xs text-slate-500">match</p>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Selection indicator */}
                <motion.div
                  className="absolute bottom-4 right-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: selectedPersona?.id === persona.id ? 1 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  <CheckCircle className="w-6 h-6 text-blue-500" />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Detailed persona view */}
      <AnimatePresence>
        {selectedPersona && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-slate-50 to-white rounded-3xl p-8 border border-slate-200 overflow-hidden"
          >
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left column - Challenges & Solutions */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-red-500" />
                    Dina utmaningar
                  </h4>
                  <div className="space-y-3">
                    {selectedPersona.challenges.map((challenge, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-start gap-3 p-3 bg-red-50 rounded-xl"
                      >
                        <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                        <p className="text-sm text-slate-700">{challenge}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-green-500" />
                    Våra AI-lösningar
                  </h4>
                  <div className="space-y-3">
                    {selectedPersona.solutions.map((solution, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                        className="flex items-start gap-3 p-3 bg-green-50 rounded-xl"
                      >
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-slate-700">{solution}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right column - Skills & Career Path */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-blue-500" />
                    Dina styrkor
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPersona.skills.map((skill, idx) => (
                      <motion.span
                        key={skill}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                          opacity: animatedSkills.includes(skill) ? 1 : 0.3,
                          scale: animatedSkills.includes(skill) ? 1 : 0.9,
                          y: animatedSkills.includes(skill) ? 0 : 10
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className={`px-4 py-2 rounded-full text-sm font-medium border ${
                          animatedSkills.includes(skill)
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 text-blue-700'
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-purple-500" />
                    Din karriärväg
                  </h4>
                  <div className="relative">
                    {/* Progress line */}
                    <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-slate-200">
                      <motion.div
                        className="absolute top-0 left-0 w-full bg-gradient-to-b from-purple-500 to-pink-500"
                        initial={{ height: 0 }}
                        animate={{ height: `${(revealedPath / selectedPersona.careerPath.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>

                    {/* Career steps */}
                    <div className="space-y-6">
                      {selectedPersona.careerPath.map((step, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{
                            opacity: idx < revealedPath ? 1 : 0.3,
                            x: idx < revealedPath ? 0 : -20
                          }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-center gap-4"
                        >
                          <motion.div
                            className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${
                              idx < revealedPath
                                ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                            animate={idx === revealedPath - 1 ? { scale: [1, 1.2, 1] } : {}}
                            transition={{ duration: 0.5 }}
                          >
                            {idx + 1}
                            {idx === revealedPath - 1 && (
                              <motion.div
                                className="absolute inset-0 bg-purple-400 rounded-full"
                                initial={{ scale: 1, opacity: 0.5 }}
                                animate={{ scale: 1.5, opacity: 0 }}
                                transition={{ duration: 0.6 }}
                              />
                            )}
                          </motion.div>
                          <div className="flex-1">
                            <p className={`font-medium ${idx < revealedPath ? 'text-slate-900' : 'text-slate-400'}`}>
                              {step}
                            </p>
                            {idx === 0 && <p className="text-xs text-slate-500 mt-1">Nu</p>}
                            {idx === selectedPersona.careerPath.length - 1 && (
                              <p className="text-xs text-purple-600 mt-1 font-medium">Målposition</p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Success metrics */}
                <AnimatePresence>
                  {showMetrics && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-700">{selectedPersona.avgSalaryIncrease}</p>
                          <p className="text-xs text-slate-600">Löneökning</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-700">{selectedPersona.timeToJob}</p>
                          <p className="text-xs text-slate-600">Till nytt jobb</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* CTA Button */}
            <motion.div
              className="text-center mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <motion.button
                className={`px-6 py-3 bg-gradient-to-r ${selectedPersona.gradient} text-white font-semibold rounded-xl shadow-lg`}
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
                whileTap={{ scale: 0.98 }}
              >
                Starta din personliga resa
                <ArrowRight className="inline-block ml-2 w-5 h-5" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating particles animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-40"
            initial={{
              x: Math.random() * 100 + '%',
              y: Math.random() * 100 + '%'
            }}
            animate={{
              x: [null, Math.random() * 100 + '%', Math.random() * 100 + '%'],
              y: [null, Math.random() * 100 + '%', Math.random() * 100 + '%'],
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear"
            }}
          />
        ))}
      </div>
    </div>
  )
}