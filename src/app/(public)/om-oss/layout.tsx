import type { Metadata } from 'next'

export const metadata: Metadata = {
  title:
    'Om Jobbcoach.ai: svenska jobbverktyg byggda för svensk arbetsmarknad | Jobbcoach.ai',
  description:
    'Vi har byggt jobbverktyg för svensk arbetsmarknad sedan 2023. Källor från Arbetsförmedlingen, SCB och fackförbund. GDPR-säker, ingen LinkedIn-inloggning. Möt teamet bakom plattformen.',
  keywords: [
    'om jobbcoach.ai',
    'om oss jobbcoach',
    'svensk jobbportal',
    'jobbcoach grundare',
    'jobbcoach team',
    'cvbrev jobbcoach',
    'svenska karriärverktyg',
    'jobbcoach historia',
  ],
  openGraph: {
    title: 'Om Jobbcoach.ai: svenska jobbverktyg byggda för svensk arbetsmarknad',
    description:
      'Vi har byggt jobbverktyg för svensk arbetsmarknad sedan 2023. Möt teamet och se vad plattformen gör för dig.',
    url: 'https://jobbcoach.ai/om-oss',
    siteName: 'Jobbcoach.ai',
    type: 'website',
    locale: 'sv_SE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Om Jobbcoach.ai: svenska jobbverktyg byggda för svensk arbetsmarknad',
    description:
      'Vi har byggt jobbverktyg för svensk arbetsmarknad sedan 2023. Möt teamet bakom plattformen.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://jobbcoach.ai/om-oss',
  },
}

export default function OmOssLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
