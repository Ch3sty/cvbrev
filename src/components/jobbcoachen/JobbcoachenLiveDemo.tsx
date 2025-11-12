'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, MessageSquare, TrendingUp, Scale, Send } from 'lucide-react'
import DemoQuestionCard from './DemoQuestionCard'
import MessageCounter from './MessageCounter'
import UpgradeModal from './UpgradeModal'
import SourcesDisplay from './SourcesDisplay'
import TypingIndicator from './TypingIndicator'
import {
  getDemoMessagesRemaining,
  incrementDemoMessageCount,
  isDemoLimitReached
} from '@/utils/demoMessageTracking'

interface DemoMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: { title: string; url: string; domain: string }[]
}

interface DemoQuestion {
  icon: React.ReactNode
  category: string
  question: string
  answer: string
  sources: { title: string; url: string; domain: string }[]
}

const DEMO_QUESTIONS: DemoQuestion[] = [
  {
    icon: <FileText className="w-5 h-5 text-blue-600" />,
    category: 'CV-tips',
    question: 'Hur skriver jag ett ATS-optimerat CV?',
    answer: `För att skriva ett ATS-optimerat CV behöver du tänka på:

**Struktur och formatering:**
- Använd standardrubriker (Arbetslivserfarenhet, Utbildning, Kompetenser)
- Undvik tabeller, textrutor och kolumner
- Välj en enkel, läsbar font som Arial eller Calibri

**Nyckelord:**
- Läs jobbannonsen noggrant och identifiera viktiga kompetenser
- Inkludera samma termer som arbetsgivaren använder
- Placera nyckelord i både rubriker och löpande text

**Tips:** 75% av CV:n som filtreras bort av ATS har fel struktur eller saknar relevanta nyckelord.`,
    sources: [
      { title: 'ATS-system och hur de fungerar', url: 'https://arbetsformedlingen.se/for-arbetssokande/tips-och-rad', domain: 'arbetsformedlingen.se' },
      { title: 'CV-tips för svenska arbetsgivare', url: 'https://karriar.se/cv-tips', domain: 'karriar.se' }
    ]
  },
  {
    icon: <MessageSquare className="w-5 h-5 text-purple-600" />,
    category: 'Intervju',
    question: 'Vilka frågor bör jag ställa på en intervju?',
    answer: `Att ställa smarta frågor visar engagemang och att du förberett dig. Här är frågor som imponerar:

**Om rollen:**
- Hur ser en typisk arbetsdag ut för den här rollen?
- Vilka är de största utmaningarna jag kommer möta första året?
- Hur definierar ni framgång för den här positionen?

**Om företaget:**
- Hur skulle ni beskriva företagskulturen här?
- Vilka utvecklingsmöjligheter finns för anställda?

**Om teamet:**
- Hur ser teamstrukturen ut?
- Hur arbetar ni med samarbete och kommunikation?

**Undvik:** Fråga INTE om lön första intervjun (vänta till de nämner det), och undvik ja/nej-frågor.`,
    sources: [
      { title: 'Förbered dig inför intervjun', url: 'https://arbetsformedlingen.se/for-arbetssokande/tips-och-rad/intervjutips', domain: 'arbetsformedlingen.se' },
      { title: 'Frågor att ställa på intervjun', url: 'https://unionen.se/rad-och-stod/intervju', domain: 'unionen.se' }
    ]
  },
  {
    icon: <TrendingUp className="w-5 h-5 text-green-600" />,
    category: 'Lön',
    question: 'Hur förhandlar jag om högre lön?',
    answer: `Löneförhandling kräver förberedelse och tajming. Så här gör du:

**Innan förhandlingen:**
- Researcha medellönen för din roll via fackförbund eller lönestatistik
- Lista dina konkreta prestationer (siffror, projekt, ansvar)
- Förbered en realistisk siffra (inte för låg, inte orimlig)

**Under förhandlingen:**
- Låt arbetsgivaren nämna lön först om möjligt
- Motivera med värde du bidrar med, inte personliga behov
- Var beredd att förhandla om andra förmåner (semester, pension, flex)

**Efter förhandlingen:**
- Få allt skriftligt
- Sätt upp ett uppföljningsmöte för löneutveckling

**Tips:** I Sverige är kollektivavtal vanliga - kolla vad som gäller för din bransch.`,
    sources: [
      { title: 'Lönestatistik per yrkesgrupp', url: 'https://scb.se/lonestatistik', domain: 'scb.se' },
      { title: 'Förhandla om lön - guide', url: 'https://unionen.se/rad-och-stod/lon-och-formaner', domain: 'unionen.se' }
    ]
  },
  {
    icon: <Scale className="w-5 h-5 text-orange-600" />,
    category: 'Arbetsrätt',
    question: 'Vad gäller vid uppsägning i Sverige?',
    answer: `Uppsägning i Sverige regleras av LAS (Lagen om anställningsskydd). Här är grunderna:

**Uppsägningstid:**
- 1 månad vid anställning < 2 år
- 2 månader vid 2-4 år
- 3 månader vid 4-6 år
- Upp till 6 månader vid längre anställning

**Saklig grund krävs:**
- Arbetsbrist (ekonomiska skäl, omorganisation)
- Personliga skäl (brist i arbetsprestation, samarbetssvårigheter)

**Turordning vid arbetsbrist:**
- Sist in, först ut-principen
- Baserat på anställningstid och ålder

**Omställningsstöd:**
- Många företag erbjuder omställningsstöd via TSL eller liknande
- Rätt till a-kassa om du varit medlem i minst 12 månader

**Tips:** Kontakta ditt fackförbund DIREKT om du får en uppsägning.`,
    sources: [
      { title: 'LAS - Lagen om anställningsskydd', url: 'https://arbetsformedlingen.se/other-languages/english-engelska/extra-stod/las', domain: 'arbetsformedlingen.se' },
      { title: 'Uppsägning och turordning', url: 'https://unionen.se/rad-och-stod/uppsagning', domain: 'unionen.se' }
    ]
  }
]

export default function JobbcoachenLiveDemo() {
  const [messages, setMessages] = useState<DemoMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [messagesRemaining, setMessagesRemaining] = useState(5)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMessagesRemaining(getDemoMessagesRemaining())

    // Mobile detection
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleDemoQuestion = (question: DemoQuestion) => {
    if (isDemoLimitReached()) {
      setShowUpgradeModal(true)
      return
    }

    // Add user message
    const userMessage: DemoMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question.question
    }
    setMessages(prev => [...prev, userMessage])
    setIsTyping(true)

    // Increment counter
    incrementDemoMessageCount()
    setMessagesRemaining(getDemoMessagesRemaining())

    // Simulate typing delay and add assistant response
    setTimeout(() => {
      setIsTyping(false)
      const assistantMessage: DemoMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: question.answer,
        sources: question.sources
      }
      setMessages(prev => [...prev, assistantMessage])

      // Check if limit reached after this message
      if (getDemoMessagesRemaining() === 0) {
        setTimeout(() => setShowUpgradeModal(true), 1000)
      }
    }, 1500)
  }

  const handleCustomQuestion = async () => {
    if (!inputValue.trim() || isDemoLimitReached()) {
      if (isDemoLimitReached()) {
        setShowUpgradeModal(true)
      }
      return
    }

    const questionText = inputValue

    // Add user message
    const userMessage: DemoMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: questionText
    }
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Increment counter
    incrementDemoMessageCount()
    setMessagesRemaining(getDemoMessagesRemaining())

    try {
      // Call demo API for real AI response
      const response = await fetch('/api/jobbcoachen/demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: questionText,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''
      let sources: { title: string; url: string; domain: string }[] = []

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.substring(6))

                if (data.type === 'text') {
                  assistantContent += data.content
                  // Update message in real-time
                  setMessages(prev => {
                    const lastMessage = prev[prev.length - 1]
                    if (lastMessage && lastMessage.role === 'assistant') {
                      return [
                        ...prev.slice(0, -1),
                        { ...lastMessage, content: assistantContent }
                      ]
                    } else {
                      return [
                        ...prev,
                        {
                          id: `assistant-${Date.now()}`,
                          role: 'assistant',
                          content: assistantContent,
                          sources: []
                        }
                      ]
                    }
                  })
                } else if (data.type === 'sources') {
                  sources = data.sources
                } else if (data.type === 'done') {
                  // Update final message with sources
                  setMessages(prev => {
                    const lastMessage = prev[prev.length - 1]
                    if (lastMessage && lastMessage.role === 'assistant') {
                      return [
                        ...prev.slice(0, -1),
                        { ...lastMessage, sources }
                      ]
                    }
                    return prev
                  })
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      }

      setIsTyping(false)

      // Check if limit reached
      if (getDemoMessagesRemaining() === 0) {
        setTimeout(() => setShowUpgradeModal(true), 1000)
      }
    } catch (error) {
      console.error('Error fetching response:', error)
      setIsTyping(false)

      // Fallback error message
      const errorMessage: DemoMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: 'Ett fel uppstod när jag försökte svara på din fråga. Försök igen eller testa en av de föreslagna frågorna.',
        sources: []
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  const handleInputFocus = () => {
    if (isMobile && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 300)
    }
  }

  const isLocked = isDemoLimitReached()

  const containerHeight = isMobile
    ? 'h-[calc(100vh-200px)] min-h-[400px] max-h-[600px]'
    : 'h-[600px]'

  return (
    <div
      className={`bg-white rounded-2xl border-2 border-slate-200 shadow-xl overflow-hidden flex flex-col ${containerHeight} max-w-2xl mx-auto`}
      style={{
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain'
      }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
        <div>
          <h3 className="text-white font-bold text-lg">Jobbcoachen</h3>
          <p className="text-blue-100 text-xs">Testa med 5 gratis meddelanden</p>
        </div>
        <MessageCounter messagesRemaining={messagesRemaining} />
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.length === 0 ? (
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-4 border border-slate-200"
            >
              <p className="text-sm text-slate-700 mb-3">
                👋 Välkommen! Prova Jobbcoachen genom att klicka på en av frågorna nedan:
              </p>
            </motion.div>

            <div className="grid grid-cols-1 min-[500px]:grid-cols-2 gap-3">
              {DEMO_QUESTIONS.map((q, idx) => (
                <DemoQuestionCard
                  key={idx}
                  icon={q.icon}
                  category={q.category}
                  question={q.question}
                  onClick={() => handleDemoQuestion(q)}
                  delay={0.1 + idx * 0.1}
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl p-4 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-900'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {msg.content}
                  </div>
                  {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                    <SourcesDisplay sources={msg.sources} />
                  )}
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <TypingIndicator />
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-200 p-4 bg-white">
        {isLocked ? (
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            Skapa konto för att fortsätta
          </button>
        ) : (
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCustomQuestion()}
              onFocus={handleInputFocus}
              placeholder="Skriv din egen fråga..."
              className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              disabled={isTyping}
              aria-label="Skriv din karriärfråga"
              aria-describedby="demo-question-hint"
              autoComplete="off"
            />
            <button
              onClick={handleCustomQuestion}
              disabled={isTyping || !inputValue.trim()}
              className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Skicka fråga"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <UpgradeModal onClose={() => setShowUpgradeModal(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
