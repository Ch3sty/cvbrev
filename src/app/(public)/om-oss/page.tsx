/**
 * /om-oss, publikt v2 (spec-publikt-v2-del-b avsnitt 3.6). Sektionerna i OmOssSida.
 * SEO: Organization och AboutPage med brödsmulor som JSON-LD, oförändrade.
 */
import OmOssSida from './OmOssSida'
import PubliktSida from '@/components/publikt/PubliktSida'
import '@/components/publikt/innehall/foretag.css'
import { antalBrev, antalKonton } from '@/lib/publikt/antal'

export const revalidate = 86400

export default async function OmOssPage() {
  // Samma källa som startsidans talrad (src/lib/publikt/antal.ts).
  const [konton, brev] = await Promise.all([antalKonton(), antalBrev()])
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

      <PubliktSida>
        <OmOssSida konton={konton} brev={brev} />
      </PubliktSida>
    </>
  )
}
