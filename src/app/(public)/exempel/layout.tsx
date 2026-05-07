import { Metadata } from 'next'

export const metadata: Metadata = {
  title:
    'CV-exempel och personliga brev: 151 yrkes-mallar | Jobbcoach.ai',
  description:
    'BlÃ¤ddra bland 75 CV-exempel och 75 personliga brev fÃ¶rdelade Ã¶ver sex stora branscher. ATS-optimerade, gratis och anpassade fÃ¶r svenska arbetsgivare.',
  keywords:
    'cv exempel, personligt brev exempel, cv mall, personligt brev mall, jobbansÃ¶kan exempel, yrkesspecifikt cv, ats-optimerat cv, cv exempel vÃ¥rd, cv exempel tech, cv exempel ekonomi',
  openGraph: {
    title:
      '151 yrkes-exempel pÃ¥ CV och personliga brev | Jobbcoach.ai',
    description:
      'Sex branscher, 151 mallar. Vi visar exakt hur en stark ansÃ¶kan ser ut fÃ¶r ditt yrke. Helt gratis.',
    type: 'website',
    locale: 'sv_SE',
    url: 'https://www.jobbcoach.ai/exempel',
    siteName: 'Jobbcoach.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: '151 yrkes-exempel pÃ¥ CV och personliga brev | Jobbcoach.ai',
    description:
      'Sex branscher, 151 mallar. Anpassade fÃ¶r svenska arbetsgivare. Helt gratis.',
  },
  alternates: {
    canonical: 'https://www.jobbcoach.ai/exempel',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function ExempelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
