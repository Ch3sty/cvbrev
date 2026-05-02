'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import AuthLeftPanel from './AuthLeftPanel'

interface StatPill {
  value: string
  label: string
}

interface AuthShellProps {
  children: ReactNode
  illustration?: ReactNode
  quotes: string[]
  stats?: StatPill[]
  desktopSideSlot?: ReactNode
}

export default function AuthShell({
  children,
  illustration,
  quotes,
  stats,
  desktopSideSlot,
}: AuthShellProps) {
  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, #FFFFFF 0%, rgba(255, 237, 213, 0.35) 50%, #FFFFFF 100%)',
      }}
    >
      {/* Subtil orange radial-glow uppe */}
      <div
        className="absolute inset-x-0 top-0 h-[60vh] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(249, 115, 22, 0.10) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Mobile hero-banner — bara <lg */}
      <div className="lg:hidden relative px-4 pt-6 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <AuthLeftPanel
            variant="mobile"
            illustration={illustration}
            quotes={quotes}
          />
        </motion.div>
      </div>

      {/* Innehål-container */}
      <div className="relative px-4 sm:px-6 lg:px-8 pb-12 lg:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-10 xl:gap-14 items-stretch">
            {/* Desktop vänsterpanel — bara lg+ */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="hidden lg:block"
            >
              <AuthLeftPanel
                variant="desktop"
                illustration={illustration}
                quotes={quotes}
                stats={stats}
                customSlot={desktopSideSlot}
              />
            </motion.div>

            {/* Form-papper */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex items-center"
            >
              <div className="w-full">{children}</div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
