import { Metadata } from 'next'

export const metadata: Metadata = {
  title:
    'CV-mallar: professionella designs för svenska arbetsgivare | Jobbcoach.ai',
  description:
    'Professionella CV-mallar i modern, traditionell och kreativ stil. ATS-säkra, anpassade för svenska arbetsgivare och redo att fylla i. Bygg ditt CV på minuter och ladda ner som PDF eller Word.',
  keywords:
    'cv mall, cv mallar, cv mall gratis, professionell cv mall, ats cv mall, svensk cv mall, cv mall pdf, cv mall word, cv mall ungdom, modern cv mall',
  openGraph: {
    title: 'Professionella CV-mallar för svenska arbetsgivare | Jobbcoach.ai',
    description:
      'Modern, traditionell och kreativ stil. ATS-säkra mallar redo att fylla i. PDF och Word. Helt gratis att börja.',
    type: 'website',
    locale: 'sv_SE',
    url: 'https://www.jobbcoach.ai/verktyg/cv-mallar',
    siteName: 'Jobbcoach.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Professionella CV-mallar för svenska arbetsgivare | Jobbcoach.ai',
    description:
      'Modern, traditionell och kreativ stil. ATS-säkra. PDF och Word. Helt gratis att börja.',
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
