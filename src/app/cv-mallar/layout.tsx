import type { Metadata } from 'next';
import { siteMetadata } from '../metadata';

export const metadata: Metadata = {
  title: 'CV-mallar - 50+ professionella mallar | Jobbcoach.ai',
  description: 'Välj bland 50+ professionella CV-mallar. Alla optimerade för svenska rekryterare och ATS-system. Hitta den perfekta mallen för din bransch.',

  openGraph: {
    title: 'CV-mallar - 50+ professionella mallar | Jobbcoach.ai',
    description: 'Välj bland 50+ professionella CV-mallar. Alla optimerade för svenska rekryterare och ATS-system.',
    url: `${siteMetadata.siteUrl}/cv-mallar`,
    siteName: siteMetadata.siteName,
    locale: siteMetadata.locale,
    type: 'website',
    images: [
      {
        url: '/cv-mallar/opengraph-image',
        width: siteMetadata.ogImage.width,
        height: siteMetadata.ogImage.height,
        alt: '50+ professionella CV-mallar från Jobbcoach.ai',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    site: siteMetadata.twitterHandle,
    title: 'CV-mallar - 50+ professionella mallar | Jobbcoach.ai',
    description: 'Välj bland 50+ professionella CV-mallar. Alla optimerade för svenska rekryterare och ATS-system.',
    images: ['/cv-mallar/opengraph-image'],
  },

  alternates: {
    canonical: `${siteMetadata.siteUrl}/cv-mallar`,
  },
};

export default function CVMallarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
