import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CV-mallar Gratis – Ladda Ner Professionella CV-mallar 2025',
  description: '8 professionella CV-mallar – 2 helt gratis, 6 premium. ATS-optimerade mallar i Word & PDF. Från modern minimal till executive premium. Ladda ner direkt.',
  keywords: 'cv mall, cv mall gratis, gratis cv mall, cv mall word, mall cv, bästa cv mall gratis, cv mall gratis ladda ner, cv mall gratis pdf, professionell cv mall, moderna cv mallar, cv mall svenska, cv mall ungdom, ats cv mall, executive cv mall, kreativ cv mall',
  openGraph: {
    title: 'CV-mallar Gratis – Ladda Ner Professionella CV-mallar',
    description: '8 professionella CV-mallar (2 gratis, 6 premium). ATS-optimerade och perfekta för svenska arbetsmarknaden. Ladda ner som Word eller PDF direkt.',
    type: 'website',
    locale: 'sv_SE',
    url: 'https://jobbcoach.ai/verktyg/cv-mallar',
  },
  alternates: {
    canonical: 'https://jobbcoach.ai/verktyg/cv-mallar'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CV-mallar Gratis – 8 Professionella Mallar',
    description: '2 gratis CV-mallar + 6 premium. ATS-optimerade, exportera till Word/PDF. Perfekta för svenska arbetsmarknaden.',
  }
}

export default function CVMallarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
