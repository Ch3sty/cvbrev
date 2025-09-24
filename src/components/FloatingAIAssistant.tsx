'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Sparkles, Send, Bot } from 'lucide-react'

const contextualTips = {
  hero: [
    'Hej! Vill du se hur jag kan hjälpa dig? 👋',
    'Ladda upp ditt CV för gratis analys!',
    'Visste du att 89% får intervju inom 2 veckor?'
  ],
  features: [
    'Våra AI-verktyg sparar dig 2 timmar per ansökan! ⚡',
    'Klicka på en funktion för att se hur den fungerar',
    'Premium ger dig obegränsade personliga brev'
  ],
  templates: [
    'Alla våra mallar är ATS-optimerade! 🎯',
    'Välj en mall som matchar din bransch',
    'Premium-mallar har 30% högre svarsfrekvens'
  ],
  testimonials: [
    'Se hur andra lyckats med sin jobbsökning!',
    'Genomsnittlig löneökning: +25% 📈',
    'Läs om Annas resa från konsult till Product Manager'
  ],
  pricing: [
    'Premium kostar bara 149 kr/månad',
    'Prova gratis i 7 dagar - ingen bindning!',
    'ROI på första jobbet: 1000x 💰'
  ],
  default: [
    'Har du några frågor? Jag hjälper gärna till!',
    'Klicka på mig för att chatta! 💬',
    'Visste du att jag kan anpassa brev för svenska företag?'
  ]
}

export default function FloatingAIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentTip, setCurrentTip] = useState('')
  const [currentSection, setCurrentSection] = useState('hero')
  const [isTyping, setIsTyping] = useState(false)
  const [showPulse, setShowPulse] = useState(true)
  const [messages, setMessages] = useState<Array<{text: string, isUser: boolean}>>([])
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    // Detect current section based on scroll
    const handleScroll = () => {
      const scrollY = window.scrollY
      const windowHeight = window.innerHeight

      if (scrollY < windowHeight) {
        setCurrentSection('hero')
      } else if (scrollY < windowHeight * 2) {
        setCurrentSection('features')
      } else if (scrollY < windowHeight * 3) {
        setCurrentSection('templates')
      } else if (scrollY < windowHeight * 4) {
        setCurrentSection('testimonials')
      } else {
        setCurrentSection('pricing')
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Update tip based on section
    const sectionTips = contextualTips[currentSection as keyof typeof contextualTips] || contextualTips.default
    const randomTip = sectionTips[Math.floor(Math.random() * sectionTips.length)]
    setCurrentTip(randomTip)

    // Show pulse animation periodically
    const pulseInterval = setInterval(() => {
      setShowPulse(true)
      setTimeout(() => setShowPulse(false), 3000)
    }, 10000)

    return () => clearInterval(pulseInterval)
  }, [currentSection])

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      setMessages(prev => [...prev, { text: inputValue, isUser: true }])
      setInputValue('')
      setIsTyping(true)

      // Simulate AI response
      setTimeout(() => {
        const responses = [
          'Det är en utmärkt fråga! Låt mig hjälpa dig med det.',
          'Baserat på din profil skulle jag rekommendera vårt Premium-paket.',
          'Många användare har samma funderingar. Här är mitt tips...',
          'Självklart! Jag kan guida dig genom processen steg för steg.'
        ]
        const randomResponse = responses[Math.floor(Math.random() * responses.length)]
        setMessages(prev => [...prev, { text: randomResponse, isUser: false }])
        setIsTyping(false)
      }, 1500)
    }
  }

  return (
    <>
      {/* Main floating button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* Contextual tooltip */}
        <AnimatePresence>
          {!isOpen && currentTip && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className="absolute bottom-2 right-20 w-64"
            >
              <div className="bg-white shadow-xl rounded-xl px-4 py-3 relative border border-slate-100">
                <p className="text-sm text-slate-700">{currentTip}</p>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2">
                  <div className="w-0 h-0 border-l-8 border-l-white border-t-8 border-t-transparent border-b-8 border-b-transparent" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Assistant button */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full shadow-xl flex items-center justify-center text-white hover:shadow-2xl transition-shadow"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="bot"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Bot className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pulse animation */}
          {showPulse && !isOpen && (
            <>
              <span className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20" />
              <span className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-10 animation-delay-200" />
            </>
          )}

          {/* Sparkle decoration */}
          <motion.div
            className="absolute -top-1 -right-1"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </motion.div>
        </motion.button>
      </motion.div>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-slate-100"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold">Din AI Jobbcoach</h3>
                  <p className="text-xs opacity-90">Alltid redo att hjälpa</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <Bot className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-2">Hej! Jag är din personliga AI-coach 👋</p>
                  <p className="text-sm text-slate-500">Fråga mig vad som helst om jobbsökning!</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] rounded-xl px-4 py-2 ${
                      msg.isUser
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  </motion.div>
                ))
              )}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-slate-100 rounded-xl px-4 py-2">
                    <div className="flex gap-1">
                      <motion.span
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                        className="w-2 h-2 bg-slate-400 rounded-full"
                      />
                      <motion.span
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 bg-slate-400 rounded-full"
                      />
                      <motion.span
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 bg-slate-400 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Skriv din fråga här..."
                  className="flex-1 px-4 py-2 bg-slate-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <motion.button
                  onClick={handleSendMessage}
                  className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}