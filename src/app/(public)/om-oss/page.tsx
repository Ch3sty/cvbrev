/**
 * /om-oss - landningssida i orange/rod-DNA.
 * Sektioner: Hero -> Berattelse (tidslinje) -> Principer -> Team
 * -> Sa hjalper plattformen dig -> Byggt for Sverige -> Kontakt + CTA.
 * SEO: Organization + WebPage med breadcrumb JSON-LD.
 */
import Breadcrumb from '@/components/Breadcrumb'
import OmOssHero from './components/OmOssHero'
import OmOssBerattelse from './components/OmOssBerattelse'
import OmOssPrinciper from './components/OmOssPrinciper'
import OmOssTeam from './components/OmOssTeam'
import OmOssSaHjalper from './components/OmOssSaHjalper'
import OmOssForSverige from './components/OmOssForSverige'
import OmOssKontakt from './components/OmOssKontakt'

export default function OmOssSida() {
  // === Schema.org markup ===

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Jobbcoach.ai',
    url: 'https://www.jobbcoach.ai',
    logo: 'https://www.jobbcoach.ai/logo.png',
    description:
      'Svenska jobbverktyg byggda för svensk arbetsmarknad. CV-byggare, jobbmatchning, karriärrådgivning, rekryteringstester och LinkedIn-optimering, allt med svenska källor.',
    foundingDate: '2023',
    email: 'info@jobbcoach.ai',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'support@jobbcoach.ai',
      contactType: 'customer support',
      availableLanguage: ['Swedish', 'English'],
      areaServed: 'SE',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Sweden',
    },
    knowsAbout: [
      'CV-skrivning',
      'Personliga brev',
      'Jobbsökning',
      'Karriärrådgivning',
      'Rekryteringstester',
      'LinkedIn-optimering',
      'Svensk arbetsmarknad',
    ],
  }

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'Om Jobbcoach.ai',
    url: 'https://www.jobbcoach.ai/om-oss',
    description:
      'Lär känna teamet och plattformen bakom Jobbcoach.ai. Vi bygger svenska jobbverktyg sedan 2023, från cvbrev.se till en komplett karriärplattform.',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Hem',
          item: 'https://www.jobbcoach.ai',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Om oss',
          item: 'https://www.jobbcoach.ai/om-oss',
        },
      ],
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />

      <main className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Breadcrumb
            items={[
              { name: 'Hem', href: '/' },
              { name: 'Om oss', href: '/om-oss' },
            ]}
          />
        </div>

        <OmOssHero />
        <OmOssBerattelse />
        <OmOssPrinciper />
        <OmOssTeam />
        <OmOssSaHjalper />
        <OmOssForSverige />
        <OmOssKontakt />
      </main>
    </>
  )
}
