import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CV-exempel och personliga brev | 30+ yrken | jobbcoach.ai',
  description: 'Hitta professionella exempel på CV och personliga brev för ditt yrke. 30+ yrkesspecifika mallar – gratis att använda som inspiration.',
  keywords: [
    'personligt brev exempel',
    'cv exempel',
    'cv mall',
    'personligt brev mall',
    'jobbansökan exempel',
    'yrkesspecifika cv',
    'professionellt cv',
    'svenska cv-mallar'
  ],
  openGraph: {
    title: 'CV-exempel och personliga brev | 30+ yrken',
    description: 'Hitta professionella exempel på CV och personliga brev för ditt yrke. 30+ yrkesspecifika mallar – gratis att använda som inspiration.',
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
