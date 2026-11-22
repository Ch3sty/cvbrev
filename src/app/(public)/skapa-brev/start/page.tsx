/**
 * /skapa-brev/start (docs/plan-konvertering.md, C6), i publikt omgång 3
 * (skissen skapa-brev-start, SEO:s besked 16).
 *
 * Publik ingång till brevflödet: besökaren skriver ett brev utan att ha konto
 * och registrerar sig först när det är klart. Sidan är noindex och pekar
 * canonical till exempelsidan, som är den vi faktiskt vill ranka på.
 *
 * Omgång 3: hela flödet står på plommonväggen, panelen till vänster och
 * arket till höger, i den valda mallen.
 *
 * Mallen (byggbriefens beslut 6): visarens "Använd som mall" skickar
 * ?mall=<id>. Den kontrolleras här mot brevets katalog (alla 40), kan bytas
 * i väljaren och följer med in i kontot: claim skriver brevet i mallen, och
 * en Premiummall öppnas provad i Mallar (src/lib/letters/claim-brev.ts).
 * Katalogen, filtren och miniatyrerna räknas här, så att klientön bara får
 * en liten lista.
 */

import type { Metadata } from 'next'
import { exampleData } from '../../personligt-brev-exempel/[yrke]/exempel-data'
import { mallBild } from '@/lib/cv/mallar/katalog'
import { BREV_FORVALD_MALL } from '@/lib/letters/brevRegler'
import { mallarKatalog } from '@/components/brev3/mallar/filter'
import { BREV_GRATIS_NAMN, BREV_MALL_ANTAL, BREV_PREMIUM_ANTAL, brevMiniatyrSrc } from '@/components/publikt/brevmallar'
import { paketKort } from '@/lib/plans/plans'
import { Sida, Ikon } from '@/components/publikt/v3'
import StartFlow, { type StartMall, type StartTexter } from './StartFlow'
import { startMallRad, startValjareRad } from './mallrader'
import './skapa-brev-start.css'

const BASE_URL = 'https://www.jobbcoach.ai'

/**
 * Brevmallarna som har en egen brevminiatyr i public/mallar/brev, ritad av
 * scripts/brevmallar-miniatyrer.ts. De övriga 32 visas med mallens
 * CV-miniatyr, och väljaren säger det (logg-p3b, beslut 2).
 */
// Alla 40 mallar har en brevbild sedan 2026-11-22 (public/mallar/brev/<id>.webp, ritade av brevmotorn med
// npx tsx scripts/brevmallar-miniatyrer.ts --prov <id,...> --ut public/mallar/brev). En ny mall utan bild faller tillbaka på CV-miniatyren.
const BREV_MINIATYRER = new Set<string>(['affisch', 'alm', 'antikva', 'arsring', 'betong', 'bjork', 'ek', 'fasad', 'folio', 'furu', 'granit', 'horisont', 'index', 'kakel', 'kalksten', 'kant', 'kolumn', 'koppar', 'kvadrat', 'lind', 'linne', 'loft', 'morkrum', 'not', 'panorama', 'pergament', 'ramverk', 'raster', 'ritning', 'sand', 'sigill', 'siluett', 'skylt', 'sockel', 'spar', 'stal', 'terrakotta', 'tidning', 'tusch', 'valv'])

interface PageProps {
  searchParams: Promise<{ yrke?: string; mall?: string }>
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { yrke } = await searchParams
  const entry = yrke ? exampleData[yrke] : undefined

  const canonical = entry
    ? `${BASE_URL}/personligt-brev-exempel/${yrke}`
    : `${BASE_URL}/personligt-brev-exempel`

  return {
    title: entry
      ? `Skriv ditt personliga brev som ${entry.yrke} | jobbcoach.ai`
      : 'Skriv ditt personliga brev | jobbcoach.ai',
    description:
      'Fyll i tjänsten du söker, så skriver vi ett utkast du kan redigera. Inget konto behövs för att komma igång.',
    robots: { index: false, follow: true },
    alternates: { canonical },
  }
}

/** Alla 40 mallarna i katalogens ordning, med filtrens egenskaper och miniatyren. */
function startMallar(): StartMall[] {
  return mallarKatalog().map((k) => {
    const brevbild = BREV_MINIATYRER.has(k.id)
    return {
      id: k.id,
      namn: k.namn,
      gratis: k.niva === 'gratis',
      word: k.word,
      rad: startMallRad(k.niva === 'gratis', k.word, paketKort()),
      bild: brevbild ? brevMiniatyrSrc(k.id) : mallBild(k.id).liten,
      brevbild,
      farg: k.farg,
      sidospalt: k.sidospalt,
      enkel: k.enkel,
    }
  })
}

/** Texterna med tal och namn ur katalogen och plans.ts. */
function startTexter(): StartTexter {
  const premium = paketKort()
  return {
    premium,
    gratisNamn: BREV_GRATIS_NAMN,
    allaAntal: BREV_MALL_ANTAL,
    valjareRad: startValjareRad(BREV_GRATIS_NAMN, BREV_PREMIUM_ANTAL, premium),
  }
}

export default async function SkapaBrevStartPage({ searchParams }: PageProps) {
  const { yrke, mall } = await searchParams
  const entry = yrke ? exampleData[yrke] : undefined
  const yrkeLabel: string | undefined = entry?.yrke
  const mallar = startMallar()
  const franAdress = typeof mall === 'string' && mallar.some((m) => m.id === mall) ? mall : null
  // Platshållaren i Arbetsgivare: exempelbrevets arbetsgivare när yrket har ett (SEO:s besked 16), annars dagens.
  const exempelArbetsgivare = (entry as { exempelBrev?: { arbetsgivare?: string | null } } | undefined)?.exempelBrev?.arbetsgivare?.trim()
  const arbetsgivarePlats = `Till exempel ${exempelArbetsgivare || 'ICA Maxi Haninge'}`

  return (
    <Sida farg="brev" className="sb">
      <section className="p3-vagg sb-vagg">
        <div className="p3-bredd">
          {entry ? (
            <a className="sb-tillbaka" href={`/personligt-brev-exempel/${yrke}`}>
              <Ikon namn="tillbaka" />
              {`Tillbaka till exemplet för ${yrkeLabel!.toLowerCase()}`}
            </a>
          ) : null}
          <header className="sb-huvud">
            <h1 className="p3-h1 p3-h1-mindre">
              {yrkeLabel ? `Skriv ditt personliga brev som ${yrkeLabel.toLowerCase()}` : 'Skriv ditt personliga brev'}
            </h1>
            <p className="p3-varde">
              Tre fält, sedan skriver vi utkastet. Du behöver inget konto för att komma igång, och du ser resultatet innan du bestämmer dig.
            </p>
          </header>

          <StartFlow
            initialRole={yrkeLabel ?? ''}
            yrkeSlug={entry ? yrke : undefined}
            yrkeLabel={yrkeLabel}
            mallar={mallar}
            initialMall={franAdress ?? BREV_FORVALD_MALL}
            mallFranAdress={franAdress !== null}
            arbetsgivarePlats={arbetsgivarePlats}
            texter={startTexter()}
          />
        </div>
      </section>
    </Sida>
  )
}
