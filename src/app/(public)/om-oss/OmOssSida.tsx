/**
 * Om oss, publikt v2 (docs/design/spec-publikt-v2-del-b-2026-10-12.md
 * avsnitt 3.6, skissen flik #foretag). Hjälten på ljus mark med banan och
 * de svävande objekten (samma bild som startsidan: banan är det som knyter
 * ihop vad vi gör), historien som tidslinje med ett objekt per steg, löftena
 * på ton jobb och till sist bläck med talen och kontaktrutan.
 *
 * h1, rubrikerna och JSON-LD är oförändrade (JSON-LD i page.tsx). Talen
 * kommer från page.tsx, samma källa som startsidans talrad.
 * Serverkomponent.
 */

import Link from 'next/link'
import Rum from '@/components/publikt/Rum'
import Objekt from '@/components/publikt/Objekt'
import SvavandeObjekt from '@/components/publikt/SvavandeObjekt'
import SkarmBana from '@/components/publikt/telefon/skarmar/SkarmBana'
import Smula from '@/components/publikt/innehall/Smula'
import type { RumNamn } from '@/components/publikt/telefon/Telefon'
import { paketKort } from '@/lib/plans/plans'

type Steg = {
  period: string
  rubrik: string
  text: string
  bild: { rum: RumNamn; objekt: 'brev' | 'cv' | 'matris' } | 'logo'
  nu?: boolean
}

const MILSTOLPAR: Steg[] = [
  {
    period: '2023',
    rubrik: 'Det började som cvbrev.se',
    text: 'En enkel idé: göra det lättare att skriva personliga brev som fungerar för svenska arbetsgivare. Tusentals användare kom snabbare till sitt första utkast.',
    bild: { rum: 'brev', objekt: 'brev' },
  },
  {
    period: 'Hösten 2024',
    rubrik: 'Användarna ville ha mer',
    text: 'Det personliga brevet var bara ena halvan. Användarna bad om hjälp med CV, jobbsökning, intervjuförberedelse och lön. Problemet var större än vi först trott.',
    bild: { rum: 'cv', objekt: 'cv' },
  },
  {
    period: 'Vintern 2024',
    rubrik: 'cvbrev.se blev Jobbcoach.ai',
    text: 'Det nya namnet speglar det större uppdraget: en partner genom hela jobbsöket, från första utkastet till första anställningsdagen.',
    bild: 'logo',
  },
  {
    period: '2025 och framåt',
    rubrik: 'En plattform med fler verktyg',
    text: 'Vi lanserar verktyg löpande, alla med svenska källor och svensk arbetsmarknad som utgångspunkt: jobbmatchning, rekryteringstester, LinkedIn-profilen och Jobbcoachen.',
    bild: { rum: 'tran', objekt: 'matris' },
    nu: true,
  },
]

const LOFTEN = [
  {
    rubrik: 'Du behåller kontrollen',
    text: 'Vi loggar aldrig in på dina konton, varken LinkedIn, Arbetsförmedlingen eller någon annanstans. Du klistrar in det som behövs och kopierar tillbaka resultatet. Inget delat lösenord, ingen automatik bakom ryggen.',
  },
  {
    rubrik: 'Svenska källor i botten',
    text: 'Svaren bygger på Arbetsförmedlingen, SCB, fackförbunden, Försäkringskassan, CSN och Skatteverket. Vi gissar inte, vi hänvisar, och varje siffra går att följa till källan.',
  },
  {
    rubrik: 'Du betalar bara när du behöver mer',
    text: `Du provar varje verktyg utan kortuppgifter. Behöver du mer finns allt i ${paketKort()}, en månad i taget, och du säger upp i ditt konto utan att uppge skäl.`,
  },
]

const tal = (n: number) => `${n.toLocaleString('sv-SE')}+`

export default function OmOssSida({ konton, brev }: { konton: number | null; brev: number | null }) {
  return (
    <main>
      {/* 1. Hjälten på ljus mark */}
      <Rum yta="mark" id="hjalte" className="if-ljus" style={{ paddingTop: 'clamp(24px, 4vw, 56px)' }}>
        <div className="pub-wrap pub-tva">
          <div className="pub-tva-text">
            <Smula steg={[{ namn: 'Hem', href: '/' }, { namn: 'Om oss' }]} />
            <p className="pub-kick">Om Jobbcoach.ai</p>
            <h1 className="pub-h1">Vi hjälper dig att nå dina karriärmål</h1>
            <p className="pub-ingress" style={{ marginTop: 20 }}>
              Vi har byggt jobbverktyg som förstår svensk arbetsmarknad. Ingen amerikansk import, ingen gissning.{' '}
              <b>Verktygen vi själva hade velat ha när vi sökte jobb.</b>
            </p>
            <div className="pub-handling">
              <Link className="pub-knapp" href="/funktioner" data-primar="">
                Se våra verktyg
              </Link>
              <a className="pub-lank" href="#vart-team">
                Så började det
              </a>
            </div>
          </div>
          <div className="pub-hero-bild">
            <SvavandeObjekt objekt="cv" rot={-8} plats={{ left: 0, top: 70 }} bredd={112} mobil={{ left: -8, top: 40, bredd: 96 }} />
            <SvavandeObjekt objekt="match" rot={6} plats={{ right: -6, top: 120 }} bredd={150} mobil={{ right: -14, top: 150, bredd: 132 }} />
            <SvavandeObjekt objekt="matris" rot={10} plats={{ left: 4, bottom: 118 }} bredd={116} mobil={{ left: -4, bottom: 90, bredd: 84 }} />
            <SvavandeObjekt objekt="brev" rot={-5} plats={{ right: 12, bottom: 70 }} bredd={92} doljPaMobil />
            <SvavandeObjekt objekt="chat" rot={4} plats={{ right: 40, top: -6 }} bredd={104} doljPaMobil />
            <SvavandeObjekt objekt="bock" plats={{ left: 70, top: -10 }} bredd={46} doljPaMobil />
            <SkarmBana />
          </div>
        </div>
      </Rum>

      {/* 2. Historien som tidslinje */}
      <Rum yta="panel" id="vart-team" aria-labelledby="om-berattelse">
        <div className="pub-wrap">
          <p className="pub-kick">Vår historia</p>
          <h2 id="om-berattelse" className="pub-h2">
            Från cvbrev.se till Jobbcoach.ai
          </h2>
          <ol className="if-hist">
            {MILSTOLPAR.map((m) => (
              <li key={m.rubrik} className={m.nu ? 'if-nu' : undefined}>
                {m.bild === 'logo' ? (
                  <span className="if-hist-obj if-hist-logo" aria-hidden="true">
                    <span>J</span>
                  </span>
                ) : (
                  <span className={`if-hist-obj pub-rum-${m.bild.rum}`} aria-hidden="true">
                    <Objekt typ={m.bild.objekt} storlek={34} />
                  </span>
                )}
                <small>{m.nu ? `${m.period}, nu` : m.period}</small>
                <h3>{m.rubrik}</h3>
                <p>{m.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </Rum>

      {/* 3. Tre löften på ton jobb */}
      <Rum rum="jobb" yta="ton" aria-labelledby="om-loften">
        <div className="pub-wrap">
          <h2 id="om-loften" className="pub-h2">
            Tre saker vi lovar
          </h2>
          <ol className="if-loften">
            {LOFTEN.map((l, i) => (
              <li key={l.rubrik} className="pub-kort">
                <i aria-hidden="true">{i + 1}</i>
                <h3>{l.rubrik}</h3>
                <p>{l.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </Rum>

      {/* 4. Bläck: talen och kontaktrutan */}
      <Rum yta="premium" aria-labelledby="om-kontakt">
        <div className="pub-wrap if-om-slut">
          {konton || brev ? (
            <div className="if-siffror" aria-label="Jobbcoach.ai i siffror">
              {konton ? (
                <div>
                  <b>{tal(konton)}</b>
                  <p className="pub-brod">har skapat konto för att söka jobb med svenska verktyg.</p>
                </div>
              ) : null}
              {brev ? (
                <div>
                  <b>{tal(brev)}</b>
                  <p className="pub-brod">personliga brev skrivna på riktiga annonser sedan starten.</p>
                </div>
              ) : null}
            </div>
          ) : (
            <div />
          )}
          <div className="if-om-kontakt">
            <p className="pub-kick">Kontakt</p>
            <h2 id="om-kontakt" className="pub-h3">
              Saknar du något, eller har du en fråga?
            </h2>
            <p className="pub-brod" style={{ marginTop: 12 }}>
              Vi läser varje mejl och svarar inom ett par vardagar. Mycket av det som finns i verktygen i dag kom från
              användare som skrev till oss.
            </p>
            <div className="pub-handling">
              <Link className="pub-knapp" href="/register">
                Skapa konto gratis
              </Link>
              <a className="pub-lank" href="mailto:info@jobbcoach.ai">
                info@jobbcoach.ai
              </a>
            </div>
          </div>
        </div>
      </Rum>
    </main>
  )
}
