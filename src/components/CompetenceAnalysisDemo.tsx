'use client'

import { useState, useEffect } from 'react'
import { TypeAnimation } from 'react-type-animation'
import { motion, AnimatePresence } from 'framer-motion'
import { BrainCircuit, Target, TrendingUp, CheckCircle, AlertCircle, Award, Users, Clock } from 'lucide-react'

const scenarios = [
  {
    from: 'Project Manager',
    to: 'DevOps Engineer',
    company: 'Spotify',
    requiredSkills: ['CI/CD', 'Kubernetes', 'Docker', 'AWS', 'Terraform', 'Git', 'Linux', 'Python'],
    matchingSkills: [
      { skill: 'Project Management', match: 85, source: 'Agile/Scrum Master certification' },
      { skill: 'Team Leadership', match: 90, source: '5 years leading development teams' },
      { skill: 'Git Version Control', match: 70, source: 'Experience with development workflows' },
      { skill: 'Process Optimization', match: 80, source: 'Lean Six Sigma certification' }
    ],
    transferableSkills: [
      'Risk Assessment → Infrastructure Monitoring',
      'Stakeholder Management → DevOps Collaboration',
      'Process Improvement → CI/CD Pipeline Optimization',
      'Budget Planning → Cloud Cost Management'
    ],
    skillsGap: [
      { skill: 'Kubernetes Container Orchestration', importance: 'essential', reasoning: 'Core requirement for modern DevOps' },
      { skill: 'Docker Containerization', importance: 'essential', reasoning: 'Foundation for microservices architecture' },
      { skill: 'AWS Cloud Services', importance: 'essential', reasoning: 'Primary cloud platform at Spotify' },
      { skill: 'Python/Bash Scripting', importance: 'desirable', reasoning: 'Automation and tooling development' }
    ],
    developmentPlan: [
      '1. Kubernetes certification (CKA) - 8 weeks',
      '2. Docker hands-on bootcamp - 4 weeks',
      '3. AWS Solutions Architect - 6 weeks',
      '4. Python for DevOps course - 4 weeks'
    ],
    matchScore: 72
  },
  {
    from: 'Marketing Manager',
    to: 'Product Owner',
    company: 'Klarna',
    requiredSkills: ['Product Strategy', 'User Stories', 'Agile', 'Analytics', 'Roadmapping', 'Stakeholder Management'],
    matchingSkills: [
      { skill: 'Customer Analytics', match: 90, source: 'Google Analytics & customer segmentation' },
      { skill: 'Stakeholder Management', match: 95, source: 'Cross-functional campaign leadership' },
      { skill: 'Market Research', match: 85, source: '3 years consumer behavior analysis' },
      { skill: 'Strategic Planning', match: 80, source: 'Annual marketing strategy development' }
    ],
    transferableSkills: [
      'Customer Journey Mapping → User Story Creation',
      'Campaign Planning → Sprint Planning',
      'Market Analysis → Competitive Product Analysis',
      'Brand Positioning → Product Positioning'
    ],
    skillsGap: [
      { skill: 'Agile/Scrum Methodology', importance: 'essential', reasoning: 'Core framework for product development' },
      { skill: 'Technical Product Knowledge', importance: 'desirable', reasoning: 'Understanding of development constraints' },
      { skill: 'Roadmapping Tools (Jira)', importance: 'desirable', reasoning: 'Standard tool for backlog management' }
    ],
    developmentPlan: [
      '1. Certified Scrum Product Owner - 3 weeks',
      '2. Technical basics for PMs - 4 weeks',
      '3. Jira/Confluence mastery - 2 weeks',
      '4. Fintech product strategy course - 6 weeks'
    ],
    matchScore: 68
  },
  {
    from: 'Sales Representative',
    to: 'Customer Success Manager',
    company: 'HubSpot',
    requiredSkills: ['Customer Retention', 'SaaS Metrics', 'Account Management', 'CRM', 'Onboarding', 'Data Analysis'],
    matchingSkills: [
      { skill: 'Relationship Building', match: 95, source: '4 years B2B sales experience' },
      { skill: 'CRM Management', match: 85, source: 'Salesforce power user' },
      { skill: 'Account Management', match: 80, source: 'Key account responsibility €2M+' },
      { skill: 'Problem Solving', match: 90, source: 'Complex deal negotiations' }
    ],
    transferableSkills: [
      'Lead Qualification → Customer Health Scoring',
      'Sales Pipeline → Customer Journey Mapping',
      'Objection Handling → Churn Prevention',
      'Revenue Targeting → Expansion Planning'
    ],
    skillsGap: [
      { skill: 'SaaS Metrics & KPIs', importance: 'essential', reasoning: 'Core measurement framework for CS' },
      { skill: 'Customer Onboarding Process', importance: 'essential', reasoning: 'Critical for customer adoption' },
      { skill: 'Data Analysis & Reporting', importance: 'desirable', reasoning: 'Identifying usage patterns and risks' }
    ],
    developmentPlan: [
      '1. Customer Success fundamentals - 4 weeks',
      '2. SaaS metrics certification - 3 weeks',
      '3. Customer onboarding best practices - 3 weeks',
      '4. Advanced Excel/Google Sheets - 2 weeks'
    ],
    matchScore: 79
  }
]

export default function CompetenceAnalysisDemo() {
  const [currentScenario, setCurrentScenario] = useState(0)
  const [analysisPhase, setAnalysisPhase] = useState<'idle' | 'analyzing' | 'matching' | 'identifying' | 'complete'>('idle')
  const [visibleSkills, setVisibleSkills] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const scenario = scenarios[currentScenario]

  useEffect(() => {
    if (!isHovered) {
      // Auto-rotate scenarios every 20 seconds when not hovered
      const interval = setInterval(() => {
        setCurrentScenario((prev) => (prev + 1) % scenarios.length)
        resetAnimation()
      }, 20000)
      return () => clearInterval(interval)
    }
  }, [isHovered])

  const resetAnimation = () => {
    setAnalysisPhase('idle')
    setVisibleSkills([])
    setShowResults(false)
  }

  useEffect(() => {
    resetAnimation()

    // Start analysis sequence
    const timeouts: NodeJS.Timeout[] = []

    timeouts.push(setTimeout(() => setAnalysisPhase('analyzing'), 500))
    timeouts.push(setTimeout(() => setAnalysisPhase('matching'), 2000))

    // Show required skills progressively
    scenario.requiredSkills.forEach((skill, index) => {
      timeouts.push(setTimeout(() => {
        setVisibleSkills(prev => [...prev, skill])
      }, 2500 + (index * 200)))
    })

    timeouts.push(setTimeout(() => setAnalysisPhase('identifying'), 4000))
    timeouts.push(setTimeout(() => setAnalysisPhase('complete'), 5500))
    timeouts.push(setTimeout(() => setShowResults(true), 6000))

    return () => timeouts.forEach(clearTimeout)
  }, [currentScenario, scenario.requiredSkills])

  const getMatchColor = (match: number) => {
    if (match >= 80) return 'text-green-600'
    if (match >= 60) return 'text-yellow-600'
    return 'text-red-500'
  }

  const getImportanceColor = (importance: string) => {
    return importance === 'essential' ? 'text-red-500' : 'text-orange-500'
  }

  return (
    <div
      className="relative w-full max-w-6xl mx-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Analysis Input */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-slate-900">Kompetensanalys</h3>
          </div>

          {/* Career transition */}
          <div className="mb-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Från:</span>
              <span className="font-semibold text-slate-900">{scenario.from}</span>
            </div>
            <motion.div
              className="my-2 flex justify-center"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            >
              <Target className="w-4 h-4 text-pink-600" />
            </motion.div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Till:</span>
              <span className="font-semibold text-pink-600">{scenario.to}</span>
            </div>
          </div>

          {/* Company */}
          <div className="mb-4">
            <p className="text-sm text-slate-600 mb-1">Söker hos:</p>
            <p className="text-lg font-bold text-slate-900">{scenario.company}</p>
          </div>

          {/* Required skills detection */}
          <div className="mb-4">
            <p className="text-sm text-slate-600 mb-2">Identifierar krav:</p>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {scenario.requiredSkills.map((skill, idx) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: visibleSkills.includes(skill) ? 1 : 0.3,
                      scale: visibleSkills.includes(skill) ? 1 : 0.9
                    }}
                    transition={{ delay: idx * 0.1 }}
                    className={`px-2 py-1 rounded-full text-xs font-medium border transition-all ${
                      visibleSkills.includes(skill)
                        ? 'border-pink-300 bg-pink-50 text-pink-700'
                        : 'border-slate-200 bg-slate-50 text-slate-400'
                    }`}
                  >
                    {skill}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Analysis status */}
          <AnimatePresence>
            {analysisPhase !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                {analysisPhase === 'analyzing' && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                      <BrainCircuit className="w-4 h-4" />
                    </motion.div>
                    <span>Analyserar ditt CV...</span>
                  </div>
                )}
                {analysisPhase === 'matching' && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                      <CheckCircle className="w-4 h-4" />
                    </motion.div>
                    <span>Matchar befintliga kompetenser...</span>
                  </div>
                )}
                {analysisPhase === 'identifying' && (
                  <div className="flex items-center gap-2 text-sm text-orange-600">
                    <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 1, repeat: Infinity }}>
                      <AlertCircle className="w-4 h-4" />
                    </motion.div>
                    <span>Identifierar kompetensgap...</span>
                  </div>
                )}
                {analysisPhase === 'complete' && (
                  <div className="flex items-center gap-2 text-sm text-purple-600">
                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.5 }}>
                      <Award className="w-4 h-4" />
                    </motion.div>
                    <span>Analys komplett!</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Middle Column - Results */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-slate-900">Matchningsresultat</h3>
          </div>

          <AnimatePresence>
            {showResults && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {/* Match score */}
                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    className="text-3xl font-bold text-slate-900 mb-1"
                  >
                    {scenario.matchScore}%
                  </motion.div>
                  <p className="text-sm text-slate-600">Övergripande matchning</p>
                </div>

                {/* Matching skills */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2 text-sm">Befintliga styrkor:</h4>
                  <div className="space-y-1">
                    {scenario.matchingSkills.slice(0, 3).map((skill, idx) => (
                      <motion.div
                        key={skill.skill}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                        className="flex items-center justify-between text-xs bg-green-50 p-2 rounded-lg"
                      >
                        <span className="font-medium text-slate-900">{skill.skill}</span>
                        <span className={`font-bold ${getMatchColor(skill.match)}`}>{skill.match}%</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Skills gap */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2 text-sm">Kompetensgap:</h4>
                  <div className="space-y-1">
                    {scenario.skillsGap.slice(0, 3).map((gap, idx) => (
                      <motion.div
                        key={gap.skill}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + idx * 0.1 }}
                        className="flex items-start gap-2 text-xs bg-orange-50 p-2 rounded-lg"
                      >
                        <AlertCircle className={`w-3 h-3 mt-0.5 flex-shrink-0 ${getImportanceColor(gap.importance)}`} />
                        <span className="text-slate-900 font-medium">{gap.skill}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Right Column - Action Plan */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-slate-900">Utvecklingsplan</h3>
          </div>

          <AnimatePresence>
            {showResults && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="space-y-4"
              >
                {/* Transferable skills */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2 text-sm">Överförbara färdigheter:</h4>
                  <div className="space-y-1">
                    {scenario.transferableSkills.slice(0, 2).map((transfer, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 + idx * 0.1 }}
                        className="text-xs bg-blue-50 p-2 rounded-lg text-slate-700"
                      >
                        {transfer}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Development plan */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2 text-sm">Rekommenderad väg:</h4>
                  <div className="space-y-1">
                    {scenario.developmentPlan.slice(0, 3).map((step, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.1 + idx * 0.1 }}
                        className="flex items-start gap-2 text-xs bg-purple-50 p-2 rounded-lg"
                      >
                        <div className="w-4 h-4 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <span className="text-slate-900">{step}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Key metrics */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.5 }}
                  className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200"
                >
                  <div className="text-center">
                    <p className="text-lg font-bold text-pink-600">{scenario.matchScore}%</p>
                    <p className="text-xs text-slate-600">Match</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600">{scenario.transferableSkills.length}</p>
                    <p className="text-xs text-slate-600">Överförbar</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-purple-600">{scenario.developmentPlan.length}</p>
                    <p className="text-xs text-slate-600">Steg</p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Scenario navigation */}
      <div className="flex justify-center gap-2 mt-6">
        {scenarios.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrentScenario(idx)
            }}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentScenario
                ? 'w-8 bg-gradient-to-r from-pink-600 to-purple-600'
                : 'w-2 bg-slate-300 hover:bg-slate-400'
            }`}
          />
        ))}
      </div>

      {/* Floating stats badges */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 2 }}
            className="absolute -top-4 right-4 flex gap-2"
          >
            <div className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full shadow-lg">
              {scenario.matchScore}% Match
            </div>
            <div className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold rounded-full shadow-lg">
              {scenario.transferableSkills.length} Överförbara
            </div>
            <div className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg">
              Tydlig väg
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}