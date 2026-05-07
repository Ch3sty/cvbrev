import { Metadata } from 'next'

export const metadata: Metadata = {
  title:
    'CV-mallar: professionella designs fÃ¶r svenska arbetsgivare | Jobbcoach.ai',
  description:
    'Professionella CV-mallar i modern, traditionell och kreativ stil. ATS-sÃ¤kra, anpassade fÃ¶r svenska arbetsgivare och redo att fylla i. Bygg ditt CV pÃ¥ minuter och ladda ner som PDF eller Word.',
  keywords:
    'cv mall, cv mallar, cv mall gratis, professionell cv mall, ats cv mall, svensk cv mall, cv mall pdf, cv mall word, cv mall ungdom, modern cv mall',
  openGraph: {
    title: 'Professionella CV-mallar fÃ¶r svenska arbetsgivare | Jobbcoach.ai',
    description:
      'Modern, traditionell och kreativ stil. ATS-sÃ¤kra mallar redo att fylla i. PDF och Word. Helt gratis att bÃ¶rja.',
    type: 'website',
    locale: 'sv_SE',
    url: 'https://www.jobbcoach.ai/verktyg/cv-mallar',
    siteName: 'Jobbcoach.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Professionella CV-mallar fÃ¶r svenska arbetsgivare | Jobbcoach.ai',
    description:
      'Modern, traditionell och kreativ stil. ATS-sÃ¤kra. PDF och Word. Helt gratis att bÃ¶rja.',
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
