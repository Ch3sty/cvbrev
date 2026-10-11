'use client'

/**
 * Rummet och den inloggade användaren, delat från DashboardShell till
 * toppraden och dörrarna. Rummet kommer ur serverns rumForPath vid första
 * renderingen och följer usePathname därefter (spec-rummen 4.1), så ingen
 * vy blinkar i fel rum vid en hård omladdning.
 */

import { createContext, useContext, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Rum } from '@/lib/rum/rum'

interface RumKontextVarde {
  rum: Rum
  user: User | null
}

const Kontext = createContext<RumKontextVarde>({ rum: 'jobb', user: null })

export function RumKontextProvider({ rum, user, children }: RumKontextVarde & { children: ReactNode }) {
  return <Kontext.Provider value={{ rum, user }}>{children}</Kontext.Provider>
}

export function useRum(): RumKontextVarde {
  return useContext(Kontext)
}
