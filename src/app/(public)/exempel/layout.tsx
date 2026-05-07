import { Metadata } from 'next'

export const metadata: Metadata = {
  title:
    'CV-mallar och personligt brev-mallar: 151 färdiga exempel (gratis) | Jobbcoach.ai',
  description:
    '75 CV-mallar och 75 mallar för personligt brev fördelade över sex branscher. ATS-optimerade och gratis att använda för svenska arbetsgivare.',
  keywords:
    'cv mall, cv mallar, cv mall gratis, gratis cv mall, personligt brev mall, personligt brev mall gratis, mall personligt brev, cv mall ladda ner, cv mall word, cv exempel, personligt brev exempel, jobbansökan',
  openGraph: {
    title:
      '151 CV-mallar och mallar för personligt brev | Jobbcoach.ai',
    description:
      'Sex branscher, 151 färdiga mallar. Vi visar exakt hur en stark ansökan ser ut för ditt yrke. Helt gratis.',
    type: 'website',
    locale: 'sv_SE',
    url: 'https://www.jobbcoach.ai/exempel',
    siteName: 'Jobbcoach.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: '151 CV-mallar och mallar för personligt brev | Jobbcoach.ai',
    description:
      'Sex branscher, 151 färdiga mallar. Anpassade för svenska arbetsgivare. Helt gratis.',
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
