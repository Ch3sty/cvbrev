'use client'

import { useNotification } from '@/context/notificationcontext'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function TestMascotNotifications() {
  const { successWithMascot, successWithMascotAndActivity } = useNotification()

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
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
            Klicka på en maskot för att se notifikationen med konfetti och animationer!
          </p>

          {/* Info boxes */}
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <div className="bg-blue-100 border border-blue-300 rounded-lg px-4 py-2">
              <span className="text-blue-800 text-sm font-medium">✨ Konfetti-animation</span>
            </div>
            <div className="bg-purple-100 border border-purple-300 rounded-lg px-4 py-2">
              <span className="text-purple-800 text-sm font-medium">🎭 Smooth transitions</span>
            </div>
            <div className="bg-pink-100 border border-pink-300 rounded-lg px-4 py-2">
              <span className="text-pink-800 text-sm font-medium">💫 Glow effects</span>
            </div>
            <div className="bg-green-100 border border-green-300 rounded-lg px-4 py-2">
              <span className="text-green-800 text-sm font-medium">⌨️ ESC to close</span>
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
              onClick={() => successWithMascot(test.message, test.mascot, 5000, true)}
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

        {/* Test Checklist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border-2 border-gray-200"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
            <span>📋</span> Test Checklist
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700 mb-2">Visuella Element:</h3>
              <label className="flex items-center gap-3 text-gray-600 cursor-pointer hover:text-gray-900">
                <input type="checkbox" className="w-5 h-5 rounded border-gray-300" />
                <span>Maskot visas korrekt</span>
              </label>
              <label className="flex items-center gap-3 text-gray-600 cursor-pointer hover:text-gray-900">
                <input type="checkbox" className="w-5 h-5 rounded border-gray-300" />
                <span>Konfetti-animation fungerar</span>
              </label>
              <label className="flex items-center gap-3 text-gray-600 cursor-pointer hover:text-gray-900">
                <input type="checkbox" className="w-5 h-5 rounded border-gray-300" />
                <span>Glow-effekt runt maskot</span>
              </label>
              <label className="flex items-center gap-3 text-gray-600 cursor-pointer hover:text-gray-900">
                <input type="checkbox" className="w-5 h-5 rounded border-gray-300" />
                <span>Smooth fade-in/fade-out</span>
              </label>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700 mb-2">Funktionalitet:</h3>
              <label className="flex items-center gap-3 text-gray-600 cursor-pointer hover:text-gray-900">
                <input type="checkbox" className="w-5 h-5 rounded border-gray-300" />
                <span>Auto-stängning efter 5 sekunder</span>
              </label>
              <label className="flex items-center gap-3 text-gray-600 cursor-pointer hover:text-gray-900">
                <input type="checkbox" className="w-5 h-5 rounded border-gray-300" />
                <span>Manuell stängning med X-knapp</span>
              </label>
              <label className="flex items-center gap-3 text-gray-600 cursor-pointer hover:text-gray-900">
                <input type="checkbox" className="w-5 h-5 rounded border-gray-300" />
                <span>ESC-tangent stänger notifikation</span>
              </label>
              <label className="flex items-center gap-3 text-gray-600 cursor-pointer hover:text-gray-900">
                <input type="checkbox" className="w-5 h-5 rounded border-gray-300" />
                <span>Fungerar på mobil</span>
              </label>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>💡 Tips:</strong> Testa flera notifikationer efter varandra för att se hur de köas.
              Prova också att reducera motion i dina systeminställningar för att verifiera accessibility-stöd.
            </p>
          </div>
        </motion.div>

        {/* Test with Activity Logging */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl shadow-xl p-8 border-2 border-purple-200"
        >
          <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center gap-2">
            <span>🔬</span> Test Med Aktivitetsloggning
          </h2>
          <p className="text-gray-700 mb-6">
            Dessa knappar testar maskot-notifikationer <strong>med</strong> aktivitetsloggning till databasen.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() =>
                successWithMascotAndActivity(
                  'Testat med aktivitetsloggning!',
                  '/images/maskot/success-letter-generated.svg',
                  'letter_created',
                  'testade maskot-notifikation med aktivitetsloggning',
                  { test: true, timestamp: new Date().toISOString() },
                  5000,
                  true
                )
              }
              className="bg-white hover:bg-purple-50 border-2 border-purple-300 rounded-xl px-6 py-4 font-semibold text-purple-700 hover:text-purple-900 transition-all hover:shadow-lg"
            >
              Test med Activity
            </button>

            <button
              onClick={() => successWithMascot('Test utan konfetti', '/images/maskot/success-profile-updated.svg', 5000, false)}
              className="bg-white hover:bg-blue-50 border-2 border-blue-300 rounded-xl px-6 py-4 font-semibold text-blue-700 hover:text-blue-900 transition-all hover:shadow-lg"
            >
              Utan Konfetti
            </button>

            <button
              onClick={() => successWithMascot('Kort duration (2s)', '/images/maskot/success-match-score.svg', 2000, true)}
              className="bg-white hover:bg-green-50 border-2 border-green-300 rounded-xl px-6 py-4 font-semibold text-green-700 hover:text-green-900 transition-all hover:shadow-lg"
            >
              2s Duration
            </button>

            <button
              onClick={() => successWithMascot('Lång duration (10s)', '/images/maskot/success-premium-activated.svg', 10000, true)}
              className="bg-white hover:bg-orange-50 border-2 border-orange-300 rounded-xl px-6 py-4 font-semibold text-orange-700 hover:text-orange-900 transition-all hover:shadow-lg"
            >
              10s Duration
            </button>
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
