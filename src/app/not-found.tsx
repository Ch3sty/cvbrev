/**
 * Adresser som inte finns någonstans i appen. Den här sidan ligger utanför
 * (public), så den ritar menyn själv. Foten kommer från client-layout.
 */
import type { Metadata } from 'next'
import LandingNavbar from '@/components/landing/LandingNavbar'
import { MegaMeny, MobilMenyKropp } from '@/components/landing/LandingNavbarMega'
import SidanFinnsInte from '@/components/publikt/SidanFinnsInte'

export const metadata: Metadata = { title: 'Sidan finns inte | Jobbcoach.ai' }

export default function NotFound() {
  return (
    <>
      <LandingNavbar mega={<MegaMeny />} mobil={<MobilMenyKropp />} />
      <SidanFinnsInte />
    </>
  )
}
