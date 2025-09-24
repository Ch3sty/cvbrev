'use client'

import { useState, useEffect } from 'react'
import { TypeAnimation } from 'react-type-animation'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, BrainCircuit, FileText, Target } from 'lucide-react'

const scenarios = [
  {
    from: 'Projektledare',
    to: 'DevOps Engineer',
    company: 'Spotify',
    keywords: ['CI/CD', 'Kubernetes', 'Agile', 'Cloud', 'Automation'],
    letter: `Hej Spotify!

Som projektledare har jag lett team genom komplexa tekniska implementationer och nu är jag redo att ta steget till DevOps. Min erfarenhet av agila metoder och min passion för automation gör mig till en perfekt kandidat.

Under mina år som projektledare har jag arbetat nära utvecklingsteam och fått djup förståelse för CI/CD-processer. Jag har självstuderat Kubernetes och cloud-teknologier...`
  },
  {
    from: 'Marknadsförare',
    to: 'UX Designer',
    company: 'Klarna',
    keywords: ['Användarinsikter', 'Figma', 'Prototyping', 'A/B-testning', 'Design System'],
    letter: `Hej Klarna!

Min bakgrund inom marknadsföring har gett mig djup förståelse för användarbeteende och kundbehov. Nu vill jag kanalisera dessa insikter till att skapa fantastiska användarupplevelser som UX Designer.

Jag har arbetat med A/B-testning och datadriven optimering i flera år. På fritiden har jag lärt mig Figma och skapat prototyper för egna projekt...`
  },
  {
    from: 'Controller',
    to: 'Business Analyst',
    company: 'H&M',
    keywords: ['Dataanalys', 'SQL', 'Process', 'KPIs', 'Strategisk planering'],
    letter: `Hej H&M!

Som controller har jag utvecklat starka analytiska färdigheter och en djup förståelse för affärsprocesser. Nu söker jag rollen som Business Analyst för att bidra till er digitala transformation.

Min erfarenhet av KPI-uppföljning och strategisk planering, kombinerat med mina SQL-kunskaper, gör mig redo att ta nästa steg...`
  }
]

export default function AILiveWriting() {
  const [currentScenario, setCurrentScenario] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [highlightedKeywords, setHighlightedKeywords] = useState<string[]>([])
  const [showMetrics, setShowMetrics] = useState(false)

  const scenario = scenarios[currentScenario]

  useEffect(() => {
    // Rotera scenarios var 15:e sekund
    const interval = setInterval(() => {
      setCurrentScenario((prev) => (prev + 1) % scenarios.length)
      setIsAnalyzing(false)
      setHighlightedKeywords([])
      setShowMetrics(false)
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Simulera AI-analys
    const analyzeTimeout = setTimeout(() => {
      setIsAnalyzing(true)
    }, 1000)

    // Highlighta keywords progressivt
    const keywordTimeouts = scenario.keywords.map((keyword, index) =>
      setTimeout(() => {
        setHighlightedKeywords(prev => [...prev, keyword])
      }, 2000 + (index * 300))
    )

    // Visa metrics
    const metricsTimeout = setTimeout(() => {
      setShowMetrics(true)
    }, 4000)

    return () => {
      clearTimeout(analyzeTimeout)
      clearTimeout(metricsTimeout)
      keywordTimeouts.forEach(clearTimeout)
    }
  }, [currentScenario, scenario.keywords])

  const highlightText = (text: string) => {
    let highlightedText = text
    highlightedKeywords.forEach(keyword => {
      const regex = new RegExp(`(${keyword})`, 'gi')
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>')
    })
    return highlightedText
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Vänster sida - Input/Analys */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-slate-900">AI Analyserar</h3>
          </div>

          {/* Karriärbyte info */}
          <div className="mb-4 p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Från:</span>
              <span className="font-semibold text-slate-900">{scenario.from}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Till:</span>
              <span className="font-semibold text-green-600">{scenario.to}</span>
            </div>
          </div>

          {/* Företag */}
          <div className="mb-4">
            <p className="text-sm text-slate-600 mb-1">Söker hos:</p>
            <p className="text-lg font-bold text-slate-900">{scenario.company}</p>
          </div>

          {/* Nyckelord som identifieras */}
          <div className="mb-4">
            <p className="text-sm text-slate-600 mb-2">Identifierade nyckelord:</p>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {scenario.keywords.map((keyword, idx) => (
                  <motion.span
                    key={keyword}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: highlightedKeywords.includes(keyword) ? 1 : 0.3,
                      scale: highlightedKeywords.includes(keyword) ? 1 : 0.9,
                      backgroundColor: highlightedKeywords.includes(keyword) ? 'rgb(239 246 255)' : 'rgb(248 250 252)'
                    }}
                    transition={{ delay: idx * 0.1 }}
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${
                      highlightedKeywords.includes(keyword)
                        ? 'border-blue-300 text-blue-700'
                        : 'border-slate-200 text-slate-400'
                    }`}
                  >
                    {keyword}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* AI Status */}
          <AnimatePresence>
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-sm text-blue-600"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4" />
                </motion.div>
                <span>AI matchar dina kompetenser...</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Höger sida - Genererat brev */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-slate-900">Personligt brev</h3>
            {showMetrics && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="ml-auto px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full"
              >
                Klart på 60 sek!
              </motion.span>
            )}
          </div>

          {/* Typewriter effect för brevet */}
          <div className="prose prose-sm max-w-none">
            {isAnalyzing ? (
              <TypeAnimation
                sequence={[
                  500,
                  scenario.letter,
                ]}
                wrapper="div"
                speed={75}
                style={{
                  fontSize: '0.875rem',
                  lineHeight: '1.5',
                  color: 'rgb(51 65 85)',
                  whiteSpace: 'pre-line'
                }}
                cursor={true}
              />
            ) : (
              <div className="h-32 flex items-center justify-center">
                <p className="text-slate-400 text-center">
                  <BrainCircuit className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  Väntar på analys...
                </p>
              </div>
            )}
          </div>

          {/* Metrics */}
          <AnimatePresence>
            {showMetrics && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-4"
              >
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900">92%</p>
                  <p className="text-xs text-slate-600">ATS-match</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900">15</p>
                  <p className="text-xs text-slate-600">Nyckelord</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">A+</p>
                  <p className="text-xs text-slate-600">Betyg</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Scenario selector dots */}
      <div className="flex justify-center gap-2 mt-6">
        {scenarios.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrentScenario(idx)
              setIsAnalyzing(false)
              setHighlightedKeywords([])
              setShowMetrics(false)
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              idx === currentScenario
                ? 'w-8 bg-gradient-to-r from-blue-600 to-indigo-600'
                : 'bg-slate-300 hover:bg-slate-400'
            }`}
          />
        ))}
      </div>
    </div>
  )
}