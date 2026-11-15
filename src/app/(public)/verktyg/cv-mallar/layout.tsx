import { Metadata } from 'next'

export const metadata: Metadata = {
  title:
    'CV-mallar för svenska arbetsgivare | Jobbcoach.ai',
  description:
    'CV-mallar i modern, traditionell och kreativ stil som läses rätt av rekryteringssystem. Fyll i och ladda ner som PDF, eller Word i utvalda mallar.',
  keywords:
    'cv mall, cv mallar, cv mall gratis, professionell cv mall, ats cv mall, svensk cv mall, cv mall pdf, cv mall word, cv mall ungdom, modern cv mall',
  openGraph: {
    title: 'Professionella CV-mallar för svenska arbetsgivare | Jobbcoach.ai',
    description:
      'Modern, traditionell och kreativ stil. Helt gratis att börja. ATS-säkra mallar redo att fylla i och ladda ner som PDF, eller som Word i utvalda mallar.',
    type: 'website',
    locale: 'sv_SE',
    url: 'https://www.jobbcoach.ai/verktyg/cv-mallar',
    siteName: 'Jobbcoach.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Professionella CV-mallar för svenska arbetsgivare | Jobbcoach.ai',
    description:
      'Modern, traditionell och kreativ stil. Helt gratis att börja. ATS-säkra mallar som PDF, eller Word i utvalda mallar.',
  },
  alternates: {
    canonical: 'https://www.jobbcoach.ai/verktyg/cv-mallar',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function CVMallarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
