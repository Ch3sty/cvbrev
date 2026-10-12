/**
 * Intern förhandsvisning av del B:s komponenter för innehållssidorna
 * (spec-publikt-v2 del B avsnitt 6, våg B1): artikelns hjälte, innehållet,
 * provkortets matris, signaturen, Läs vidare, artikelkorten, slutbandet,
 * huvudtalet och källkortet, i ljust och mörkt läge.
 *
 * Inte publik: 404 i produktion om inte PUBLIKT_FORHANDSVISNING=1 är satt
 * för processen, och sidan indexeras aldrig.
 */

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import PubliktSida from '@/components/publikt/PubliktSida'
import Rum from '@/components/publikt/Rum'
import ArtikelHjalte from '@/components/publikt/innehall/ArtikelHjalte'
import Innehall from '@/components/publikt/innehall/Innehall'
import Signatur from '@/components/publikt/innehall/Signatur'
import LasVidare from '@/components/publikt/innehall/LasVidare'
import ArtikelKort from '@/components/publikt/innehall/ArtikelKort'
import SlutBand from '@/components/publikt/innehall/SlutBand'
import Huvudtal from '@/components/publikt/innehall/Huvudtal'
import Kallkort from '@/components/publikt/innehall/Kallkort'
import ProvMatris from '@/components/publikt/innehall/ProvMatris'
import { AUTHORS } from '@/lib/authors'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Förhandsvisning, publikt v2 innehåll',
  robots: { index: false, follow: false },
}

const RUBRIKER = [
  { id: 'vad-matrislogik-egentligen-mater', text: 'Vad matrislogik egentligen mäter', level: 2 },
  { id: 'sa-ar-en-matris-uppbyggd', text: 'Så är en matris uppbyggd', level: 2 },
  { id: 'vanliga-misstag', text: 'Vanliga misstag', level: 2 },
]

const KORT = [
  { slug: 'alva-labs-logiktest', titel: 'Alva Labs logiktest: så fungerar testet, så läser du resultatet och så övar du', kategori: 'Rekryteringstester', lasminuter: 12, bild: '/images/artiklar/alva-labs-logiktest.webp' },
  { slug: 'deduktivt-induktivt-test', titel: 'Deduktivt och induktivt test: skillnaden, exempel med lösning och hur du övar', kategori: 'Rekryteringstester', lasminuter: 12, bild: '/images/artiklar/deduktivt-induktivt-test.webp' },
  { slug: 'bakgrundskontroll-vid-anstallning', titel: 'Bakgrundskontroll vid anställning: vad arbetsgivaren får kolla och vad du kan göra', kategori: 'Jobbsökning', lasminuter: 17, bild: '/images/artiklar/bakgrundskontroll-vid-anstallning.webp' },
]

export default function ForhandsvisningInnehall() {
  if (process.env.NODE_ENV === 'production' && process.env.PUBLIKT_FORHANDSVISNING !== '1') notFound()
  const linda = AUTHORS.find((a) => a.id === 'linda') ?? AUTHORS[0]
  return (
    <PubliktSida>
      <ArtikelHjalte
        rum="tran"
        kategori="Rekryteringstester"
        titel="Matrislogik och abstrakt resonemang: så klarar du testet"
        ingress="Matrislogik är det vanligaste logiska testet vid rekrytering. Lär dig regeltyperna, se exempel lösta steg för steg och öva gratis inför ditt skarpa test."
        primar={{ text: 'Prova fem frågor gratis', href: '/verktyg/rekryteringstester/prova' }}
        lasGuiden="vad-matrislogik-egentligen-mater"
        forfattare={linda}
        datum="2026-06-17"
        datumText="17 juni 2026"
        lasminuter={15}
        bild={{ src: '/images/artiklar/matrislogik-test-guide.webp', alt: 'Matrislogik-test med rutnät av figurer' }}
      />
      <Rum yta="mark" className="ib-lasning pub-rum-tran">
        <div className="pub-wrap ib-ram">
          <div className="ib-brod-kol">
            <Innehall headings={RUBRIKER} variant="mobil" />
            <aside className="ib-prova pub-rum-tran" aria-label="Provkortet">
              <div>
                <p className="pub-kick">Prova på riktigt</p>
                <p className="ib-rub">Vilken figur hör hemma i den tomma rutan?</p>
                <p className="ib-prova-text">
                  Det här är en av våra expertfrågor: tre regler samtidigt, form, tecken och fyllning.
                </p>
                <div className="pub-handling">
                  <a className="pub-knapp" href="/verktyg/rekryteringstester/prova">
                    Prova fem frågor
                  </a>
                </div>
              </div>
              <div className="ib-prova-sida">
                <ProvMatris />
              </div>
            </aside>
            <Signatur forfattare={linda} publicerad="2026-06-17" publiceradText="17 juni 2026" />
          </div>
          <aside className="ib-sido">
            <Innehall headings={RUBRIKER} variant="sido" />
          </aside>
        </div>
      </Rum>
      <Rum yta="mark">
        <div className="pub-wrap">
          <ul className="ib-rel">
            <ArtikelKort artikel={{ ...KORT[0], ingress: 'Ingressen visas bara på det stora kortet.', datum: '2026-09-23', datumText: '23 september 2026' }} rubrik="h2" stor />
            <ArtikelKort artikel={KORT[1]} rubrik="h2" />
            <ArtikelKort artikel={KORT[2]} rubrik="h2" />
          </ul>
        </div>
      </Rum>
      <Rum yta="premium">
        <div className="pub-wrap pub-tva">
          <Huvudtal tal="28 291 kr" text="kvar i månaden" stapel={{ andel: 0.81, etiketter: ['Netto 28 291 kr', 'Skatt 6 709 kr'] }} />
          <Kallkort kallor={[{ text: 'Skatteverket: skattetabeller 2026', href: 'https://www.skatteverket.se' }]} not="Tabell 31, kolumn 1." />
        </div>
      </Rum>
      <SlutBand rum="cv" rubrik="Imponerad? Skapa ditt nu" rubrikNiva="p" text="En mening om vad som händer." knapp={{ text: 'Använd som mall', href: '/cv-mallar' }} />
      <LasVidare relaterade={KORT} verktyg={[{ label: 'Rekryteringstester', href: '/verktyg/rekryteringstester' }]} mestLasta={[{ title: 'Styrkor och svagheter på intervjun', href: '/artiklar/styrkor-svagheter-intervju' }]} />
    </PubliktSida>
  )
}
