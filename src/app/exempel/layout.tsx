import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Personligt Brev & CV Exempel 2025 - Gratis Mallar | Jobbcoach.ai',
  description: 'Se professionella exempel på personliga brev och CV för alla branscher. ATS-optimerade mallar, yrkespecifika guider och kostnadsfria tips för svenska jobbsökare.',
  keywords: [
    'personligt brev exempel',
    'cv exempel',
    'cv mall',
    'personligt brev mall',
    'jobbansökan exempel',
    'ATS-optimerad',
    'professionellt cv',
    'svenska cv-mallar'
  ],
  openGraph: {
    title: 'Personligt Brev & CV Exempel 2025 - Gratis Mallar',
    description: 'Se professionella exempel på personliga brev och CV för alla branscher. ATS-optimerade mallar och yrkespecifika guider.',
    url: 'https://jobbcoach.ai/exempel',
    type: 'website',
  },
  alternates: {
    canonical: 'https://jobbcoach.ai/exempel',
  },
}

export default function ExempelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
