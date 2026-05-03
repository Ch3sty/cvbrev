import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Skapa CV på 60 sekunder | Jobbcoach.ai',
  description:
    'Bygg ett professionellt CV gratis. Ladda upp eller börja från noll — vi hjälper dig hela vägen. ATS-optimerat och anpassat efter svensk arbetsmarknad.',
  keywords: [
    'skapa cv',
    'cv-skapare',
    'gratis cv',
    'cv-byggare',
    'professionellt cv',
    'ats-optimerat cv',
    'cv-mall',
    'cv-skapande',
  ],
  openGraph: {
    title: 'Skapa CV på 60 sekunder',
    description:
      'Bygg ett professionellt CV gratis. Ladda upp eller börja från noll.',
    url: 'https://www.jobbcoach.ai/verktyg/skapa-cv',
    siteName: 'Jobbcoach.ai',
    type: 'website',
    locale: 'sv_SE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Skapa CV på 60 sekunder',
    description:
      'Bygg ett professionellt CV gratis. Ladda upp eller börja från noll.',
  },
  alternates: {
    canonical: 'https://www.jobbcoach.ai/verktyg/skapa-cv',
  },
};

export default function SkapaCvLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
