import type { Metadata } from 'next';
import { siteMetadata } from '../metadata';

export const metadata: Metadata = {
  title: 'CV-mallar - 50+ professionella mallar | Jobbcoach.ai',
  description: 'Välj bland 50+ professionella CV-mallar. ATS-optimerade, branschspecifika och enkla att anpassa. Ändra design med några få knapptryck.',

  openGraph: {
    title: 'CV-mallar - 50+ professionella mallar | Jobbcoach.ai',
    description: 'Välj bland 50+ professionella CV-mallar. ATS-optimerade, branschspecifika och enkla att anpassa.',
    url: `${siteMetadata.siteUrl}/cv-mallar`,
    siteName: siteMetadata.siteName,
    locale: siteMetadata.locale,
    type: 'website',
    images: [
      {
        url: '/cv-mallar/opengraph-image',
        width: siteMetadata.ogImage.width,
        height: siteMetadata.ogImage.height,
        alt: '50+ professionella CV-mallar - ATS-optimerade och branschspecifika',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    site: siteMetadata.twitterHandle,
    title: 'CV-mallar - 50+ professionella mallar | Jobbcoach.ai',
    description: 'Välj bland 50+ professionella CV-mallar. ATS-optimerade, branschspecifika och enkla att anpassa.',
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
