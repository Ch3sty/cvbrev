import { Metadata } from 'next'

export const metadata: Metadata = {
  title:
    'CV-exempel, brev-exempel och CV-mallar för svenska yrken | Jobbcoach.ai',
  description:
    'Vi har 89 CV-exempel, 89 exempel på personligt brev och 25 färdiga CV-mallar. Hitta ett exempel som passar ditt yrke eller välj en mall-design som matchar din bransch.',
  keywords:
    'cv exempel, exempel cv, bra cv exempel, personligt brev exempel, exempel på personligt brev, spontanansökan exempel, cv mall, cv mallar, jobbansökan',
  openGraph: {
    title: 'CV-exempel, brev-exempel och CV-mallar | Jobbcoach.ai',
    description:
      'Vi har 175 färdiga exempel och mallar för svenska yrken. Helt gratis att använda.',
    type: 'website',
    locale: 'sv_SE',
    url: 'https://www.jobbcoach.ai/exempel',
    siteName: 'Jobbcoach.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CV-exempel, brev-exempel och CV-mallar | Jobbcoach.ai',
    description:
      'CV-exempel, exempel på personligt brev och färdiga mall-designer. Helt gratis.',
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
