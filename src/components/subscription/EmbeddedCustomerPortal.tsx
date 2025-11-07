'use client'

// src/components/subscription/EmbeddedCustomerPortal.tsx
// Inbäddad Stripe Customer Portal för prenumerationshantering

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, ExternalLink, CreditCard, Receipt, XCircle, Settings } from 'lucide-react'

interface EmbeddedCustomerPortalProps {
  className?: string
}

export function EmbeddedCustomerPortal({ className = '' }: EmbeddedCustomerPortalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [portalUrl, setPortalUrl] = useState<string | null>(null)

  const handleOpenPortal = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stripe/create-customer-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok || !data.url) {
        throw new Error(data.error || 'Kunde inte öppna hanteringsportalen')
      }

      // Öppna i nytt fönster istället för redirect
      window.open(data.url, '_blank', 'noopener,noreferrer')
      setPortalUrl(data.url)

    } catch (err: any) {
      console.error('Customer portal error:', err)
      setError(err.message || 'Ett oväntat fel uppstod')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={className}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-slate-200 p-6 space-y-4"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-slate-500 to-slate-700 rounded-lg">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Hantera prenumeration</h3>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          Öppna Stripes säkra kundportal för att hantera din prenumeration, se fakturor, uppdatera betalningsmetod eller avsluta din prenumeration.
        </p>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-4">
          <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg">
            <CreditCard className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-slate-900">Betalningsmetod</p>
              <p className="text-xs text-slate-600">Uppdatera kort</p>
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg">
            <Receipt className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-slate-900">Fakturor</p>
              <p className="text-xs text-slate-600">Se & ladda ner</p>
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg">
            <XCircle className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-slate-900">Avsluta</p>
              <p className="text-xs text-slate-600">När du vill</p>
            </div>
          </div>
        </div>

        {/* Open portal button */}
        <button
          onClick={handleOpenPortal}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-900 text-white font-medium rounded-lg hover:from-slate-800 hover:to-slate-950 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Öppnar portal...</span>
            </>
          ) : (
            <>
              <span>Öppna hanteringsportal</span>
              <ExternalLink className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-sm text-red-600">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success message */}
        <AnimatePresence>
          {portalUrl && !error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 bg-green-50 border border-green-200 rounded-lg"
            >
              <p className="text-sm text-green-700">
                ✓ Portalen öppnades i ett nytt fönster. Om den inte öppnades,{' '}
                <a
                  href={portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium"
                >
                  klicka här
                </a>
                .
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info box */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700 leading-relaxed">
            <strong>💡 Tips:</strong> Alla ändringar du gör i portalen uppdateras automatiskt på ditt konto.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
