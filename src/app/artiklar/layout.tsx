import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Artiklar | jobbcoach.ai - Tips och Råd för Jobbsökande',
  description: 'Läs de senaste artiklarna om personliga brev, CV-skrivning, AI i jobbsökandet och karriärtips från jobbcoach.ai.',
  alternates: {
    canonical: '/artiklar',
  },
};

export default function ArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}