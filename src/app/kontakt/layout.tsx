/**
 * Fil: src/app/kontakt/layout.tsx
 *
 * Beskrivning:
 * Layout för kontaktsidan som lägger till navbar.
 * Footer läggs till automatiskt via root layout.
 */
import PremiumNavbar from '@/components/PremiumNavbar'

export default function KontaktLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <PremiumNavbar />
      {children}
    </>
  )
}
