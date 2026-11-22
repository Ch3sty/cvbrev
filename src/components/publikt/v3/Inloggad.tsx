'use client'

/**
 * Inloggad på en publik sida (klicktestet på live 2026-11-22, punkt 3): menyn
 * och flödesskalen visade "Logga in" och "Skapa konto" också för den som var
 * inloggad, eftersom ingen av dem frågade.
 *
 * Publika sidor är statiska och CDN-cachade: serverns HTML är densamma för
 * alla och visar alltid läget utloggad. Klienten läser användaren ur
 * AuthProvider, som bara laddar Supabase när det finns en sessionscookie, så
 * den som inte är inloggad ser aldrig något byte.
 *
 * KontoVaxel ritar båda lägena i samma rutnätsruta, ovanpå varandra, och
 * döljer det ena med visibility. Rutan är lika bred som det bredaste läget i
 * båda lägena, så att bytet aldrig flyttar något (CLS 0). Länken till kontot
 * finns inte i serverns HTML: i stället står en likadan ruta utan adress, så
 * att sökmotorerna inte ser en länk till /dashboard på varje sida.
 */

import Link from 'next/link'
import type { ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import './inloggad.css'

/** Dit en inloggad besökare går från en publik sida. */
export const KONTO_HREF = '/dashboard'
export const KONTO_TEXT = 'Till kontot'

/** Sant när en användare är inloggad. Falskt på servern och vid första ritningen. */
export function useInloggad(): boolean {
  const { user } = useAuth()
  return Boolean(user)
}

/**
 * Kontolänken, eller i utloggat läge en ruta i samma form utan adress (den
 * syns inte, men tar samma plats).
 */
export function KontoLank({ inloggad, className, onClick }: { inloggad: boolean; className?: string; onClick?: () => void }) {
  if (!inloggad) {
    return (
      <span className={className} aria-hidden="true">
        {KONTO_TEXT}
      </span>
    )
  }
  return (
    <Link href={KONTO_HREF} className={className} onClick={onClick} data-cta="konto-fran-publikt">
      {KONTO_TEXT}
    </Link>
  )
}

/**
 * KontoVaxel som läser inloggningen själv, för toppraderna i flödesskalen
 * (PubliktFlodesskal, auth-sidornas kort, provets start). Inloggad ser
 * "Till kontot" med samma klass som den länk den ersätter.
 */
export function InloggadVaxel({ ut, kontoKlass, className }: { ut: ReactNode; kontoKlass: string; className?: string }) {
  const inloggad = useInloggad()
  return <KontoVaxel inloggad={inloggad} ut={ut} inne={<KontoLank inloggad={inloggad} className={kontoKlass} />} className={className} />
}

export function KontoVaxel({
  inloggad,
  ut,
  inne,
  className = '',
}: {
  inloggad: boolean
  /** Det som står för den som inte är inloggad (serverns HTML). */
  ut: ReactNode
  /** Det som står för den som är inloggad. */
  inne: ReactNode
  className?: string
}) {
  return (
    <span className={`p3-vaxel ${className}`.trim()} data-inloggad={inloggad ? '' : undefined}>
      <span className="p3-vaxel-ut" aria-hidden={inloggad || undefined}>
        {ut}
      </span>
      <span className="p3-vaxel-in" aria-hidden={!inloggad || undefined}>
        {inne}
      </span>
    </span>
  )
}
