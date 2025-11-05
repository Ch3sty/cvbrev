'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import MascotNotification from '@/components/ui/mascot-notification'

export default function TestMascotNotifications() {
  const [showNotification, setShowNotification] = useState(false)
  const [currentMessage, setCurrentMessage] = useState('')
  const [currentMascot, setCurrentMascot] = useState('')
  const [currentType, setCurrentType] = useState<'success' | 'error' | 'info' | 'loading'>('success')

  const testCases = [
    {
      title: 'Brev Genererat',
      message: 'Ditt brev är klart!',
      mascot: '/images/maskot/success-letter-generated.svg',
      description: 'genererade ett personligt brev'
    },
    {
      title: 'CV Uppladdad',
      message: 'CV uppladdad framgångsrikt!',
      mascot: '/images/maskot/success-cv-uploaded.svg',
      description: 'laddade upp ett CV'
    },
    {
      title: 'CV-Analys Klar',
      message: 'CV-analysen är klar! Matchning: 87%',
      mascot: '/images/maskot/success-cv-analysis.svg',
      description: 'slutförde en CV-analys'
    },
    {
      title: 'Brev Sparat',
      message: 'Brevet har sparats! Du hittar det under "Mina brev".',
      mascot: '/images/maskot/success-letter-saved.svg',
      description: 'sparade ett brev'
    },
    {
      title: 'CV Skapat',
      message: 'CV skapat! Nedladdning startar automatiskt.',
      mascot: '/images/maskot/success-cv-created.svg',
      description: 'skapade ett CV'
    },
    {
      title: 'Jobb Hittade',
      message: 'Vi hittade 12 jobb som passar dig perfekt!',
      mascot: '/images/maskot/success-jobs-found.svg',
      description: 'slutförde jobbmatchning'
    },
    {
      title: 'Matchningspoäng',
      message: 'Matchning: 92%! Din kompetens passar perfekt.',
      mascot: '/images/maskot/success-match-score.svg',
      description: 'fick matchningspoäng'
    },
    {
      title: 'Onboarding Slutförd',
      message: 'Grattis! Du är redo att börja söka jobb!',
      mascot: '/images/maskot/success-onboarding-complete.svg',
      description: 'slutförde onboarding'
    },
    {
      title: 'Premium Aktiverat',
      message: 'Välkommen till Premium! Alla funktioner är nu upplåsta.',
      mascot: '/images/maskot/success-premium-activated.svg',
      description: 'aktiverade premium'
    },
    {
      title: 'Profil Uppdaterad',
      message: 'Profil uppdaterad',
      mascot: '/images/maskot/success-profile-updated.svg',
      description: 'uppdaterade profilen'
    },
    {
      title: 'Brev Raderat',
      message: 'Brevet har tagits bort',
      mascot: '/images/maskot/success-letter-deleted.svg',
      description: 'raderade ett brev'
    },
    {
      title: 'Konto Raderat',
      message: 'Ditt konto har raderats. Hejdå!',
      mascot: '/images/maskot/success-account-deleted.svg',
      description: 'raderade kontot'
    }
  ]

  const showTestNotification = (message: string, mascot: string, type: 'success' | 'error' | 'info' | 'loading' = 'success') => {
    setCurrentMessage(message)
    setCurrentMascot(mascot)
    setCurrentType(type)
    setShowNotification(true)
  }

  const renderNotification = () => {
    return (
      <MascotNotification
        isVisible={showNotification}
        message={currentMessage}
        type={currentType}
        mascotImage={currentMascot}
        onClose={() => setShowNotification(false)}
        duration={5000}
        showConfetti={currentType === 'success'}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Render active notification */}
        {renderNotification()}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            🎨 Maskot-Notifikationer Test
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Testa alla maskot-notifikationer med färgvarianter!
          </p>
        </motion.div>

        {/* Color Type Tester */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-2 border-slate-200">
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">
              Testa Färgvarianter
            </h2>
            <p className="text-center text-gray-600 mb-6">
              Klicka på en färgtyp för att se hur bakgrunden anpassar sig
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.button
                onClick={() => showTestNotification(
                  'Success! Detta är en framgångsnotifikation med grön bakgrund.',
                  '/images/maskot/success-cv-uploaded.svg',
                  'success'
                )}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all"
              >
                <div className="text-4xl mb-2">✅</div>
                <h3 className="font-bold text-lg mb-1">Success</h3>
                <p className="text-sm text-white/90">Grön bakgrund</p>
              </motion.button>

              <motion.button
                onClick={() => showTestNotification(
                  'Error! Detta är en felnotifikation med röd bakgrund.',
                  '/images/maskot/success-account-deleted.svg',
                  'error'
                )}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg hover:shadow-xl transition-all"
              >
                <div className="text-4xl mb-2">❌</div>
                <h3 className="font-bold text-lg mb-1">Error</h3>
                <p className="text-sm text-white/90">Röd bakgrund</p>
              </motion.button>

              <motion.button
                onClick={() => showTestNotification(
                  'Info! Detta är en informationsnotifikation med blå bakgrund.',
                  '/images/maskot/success-profile-updated.svg',
                  'info'
                )}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-600 text-white shadow-lg hover:shadow-xl transition-all"
              >
                <div className="text-4xl mb-2">ℹ️</div>
                <h3 className="font-bold text-lg mb-1">Info</h3>
                <p className="text-sm text-white/90">Blå bakgrund</p>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Test Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {testCases.map((test, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => showTestNotification(test.message, test.mascot)}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 border-2 border-transparent hover:border-purple-300 group"
            >
              {/* Mascot Image */}
              <div className="relative w-24 h-24 mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Image
                  src={test.mascot}
                  alt={test.title}
                  width={96}
                  height={96}
                  className="w-full h-full object-contain drop-shadow-lg"
                  unoptimized
                />
              </div>

              {/* Title */}
              <h3 className="font-bold text-gray-900 mb-2 text-lg">
                {test.title}
              </h3>

              {/* Message Preview */}
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {test.message}
              </p>

              {/* Button indicator */}
              <div className="inline-flex items-center gap-2 text-purple-600 text-sm font-medium">
                <span>Testa</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Features Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border-2 border-gray-200"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
            <span>✨</span> Premium Features
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Design-features:</h3>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <span className="font-semibold text-purple-900">🎨 Färgad bakgrund:</span>
                  <span className="text-gray-700"> Subtil gradient baserat på typ (success/error/info)</span>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <span className="font-semibold text-green-900">⏱️ Progress ring:</span>
                  <span className="text-gray-700"> Cirkulär countdown-ring runt maskoten</span>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <span className="font-semibold text-blue-900">💫 Drop-shadow:</span>
                  <span className="text-gray-700"> Multi-layer shadow för djup och premium-känsla</span>
                </div>
                <div className="p-3 bg-pink-50 rounded-lg">
                  <span className="font-semibold text-pink-900">🎊 Konfetti:</span>
                  <span className="text-gray-700"> Animerad konfetti på success-notifikationer</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Test-checklista:</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Testa alla färgvarianter (Success/Error/Info)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Är maskoten tillräckligt synlig och stor?</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Fungerar progress-ringen smooth?</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Konfetti endast på success?</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>ESC-tangent stänger notifikationen?</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Hur ser det ut på mobil?</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-900">
              <strong>🚀 Production Ready:</strong> Denna design är nu aktiv i hela applikationen!
              CV Uploader använder redan denna nya premium-design.
            </p>
          </div>
        </motion.div>

        {/* Back link */}
        <div className="mt-12 text-center">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium transition-colors"
          >
            ← Tillbaka till Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
