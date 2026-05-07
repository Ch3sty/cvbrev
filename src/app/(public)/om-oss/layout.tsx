import type { Metadata } from 'next'

export const metadata: Metadata = {
  title:
    'Om Jobbcoach.ai: svenska jobbverktyg byggda fÃ¶r svensk arbetsmarknad | Jobbcoach.ai',
  description:
    'Vi har byggt jobbverktyg fÃ¶r svensk arbetsmarknad sedan 2023. KÃ¤llor frÃ¥n ArbetsfÃ¶rmedlingen, SCB och fackfÃ¶rbund. GDPR-sÃ¤ker, ingen LinkedIn-inloggning. MÃ¶t teamet bakom plattformen.',
  keywords: [
    'om jobbcoach.ai',
    'om oss jobbcoach',
    'svensk jobbportal',
    'jobbcoach grundare',
    'jobbcoach team',
    'cvbrev jobbcoach',
    'svenska karriÃ¤rverktyg',
    'jobbcoach historia',
  ],
  openGraph: {
    title: 'Om Jobbcoach.ai: svenska jobbverktyg byggda fÃ¶r svensk arbetsmarknad',
    description:
      'Vi har byggt jobbverktyg fÃ¶r svensk arbetsmarknad sedan 2023. MÃ¶t teamet och se vad plattformen gÃ¶r fÃ¶r dig.',
    url: 'https://www.jobbcoach.ai/om-oss',
    siteName: 'Jobbcoach.ai',
    type: 'website',
    locale: 'sv_SE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Om Jobbcoach.ai: svenska jobbverktyg byggda fÃ¶r svensk arbetsmarknad',
    description:
      'Vi har byggt jobbverktyg fÃ¶r svensk arbetsmarknad sedan 2023. MÃ¶t teamet bakom plattformen.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://www.jobbcoach.ai/om-oss',
  },
}

export default function OmOssLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
