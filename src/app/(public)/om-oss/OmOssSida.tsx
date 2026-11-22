/**
 * Om oss, publikt omgång 3 (skissen docs/design/publikt-omgang3/sidor/om-oss.html,
 * noten noter/om-oss.md, SEO:s besked avsnitt 5, nytt-innehall.md avsnitt om-oss).
 *
 * Hjälten på indigoväggen med de fyra delarna som växer uppåt (i stället för
 * telefonen Mitt jobbsök), historien som en väg med en bild per steg, löftena
 * som tre kort med bild och sist talen och kontaktrutan på en indigoyta.
 *
 * h1, de tre h2, de sju h3, brödsmulorna, länkarna och JSON-LD (i page.tsx)
 * är oförändrade. Talen kommer från page.tsx, samma källa som startsidan.
 * Hjältens block är vanlig text, inte role="img" (nytt-innehall.md: sidan
 * har ont om ord och blocken är sanna). Serverkomponent.
 */

import type { ReactNode } from 'react'
import { Sida, Hjalte, Sektion, SektionHuvud, O, Nr, Dorr, Ikon, Knapp, TextLank, type Farg } from '@/components/publikt/v3'
import { PLAN_BY_KEY, SALD_PLAN, paketKort } from '@/lib/plans/plans'
import { TESTTYPER_ORD } from '@/lib/plans/gratis-copy'
import { storForst } from '@/components/publikt/talord'
import './om-oss.css'

type Steg = {
  period: string
  rubrik: string
  text: string
  farg: Farg
  bild: ReactNode
  nu?: boolean
}

/** Ett litet ark med linjer (m = koppar, k = kort, h = halv). */
function Blad({ rader }: { rader: readonly ('' | 'm' | 'k' | 'h')[] }) {
  return (
    <span className="oo-blad">
      {rader.map((r, i) => (
        <i key={i} className={r ? `oo-${r}` : undefined} />
      ))}
    </span>
  )
}

const MILSTOLPAR: Steg[] = [
  {
    period: '2023',
    rubrik: 'Det började som cvbrev.se',
    text: 'En enkel idé: göra det lättare att skriva personliga brev som fungerar för svenska arbetsgivare. De som använde den kom snabbare till sitt första utkast.',
    farg: 'brev',
    bild: <Blad rader={['', '', 'm', '', 'k', 'h']} />,
  },
  {
    period: 'Hösten 2024',
    rubrik: 'Användarna ville ha mer',
    text: 'Det personliga brevet var bara ena halvan. Användarna bad om hjälp med CV, jobbsökning, intervjuförberedelse och lön. Problemet var större än vi först trott.',
    farg: 'cv',
    bild: (
      <span className="oo-par">
        <Blad rader={['', '', '', 'k']} />
        <Blad rader={['', 'm', '', '', 'h', '']} />
      </span>
    ),
  },
  {
    period: 'Vintern 2024',
    rubrik: 'cvbrev.se blev Jobbcoach.ai',
    text: 'Det nya namnet speglar det större uppdraget: en partner genom hela jobbsöket, från första utkastet till första anställningsdagen.',
    farg: 'tran',
    bild: (
      <span className="oo-namn">
        <s>cvbrev.se</s>
        <Ikon namn="pil" />
        <span className="oo-logga">
          <i>J</i>Jobbcoach<span>.ai</span>
        </span>
      </span>
    ),
  },
  {
    period: '2025 och framåt',
    rubrik: 'En plattform med fler verktyg',
    // Textbeslut INF-2: rekryteringstester först (SEO).
    text: 'Vi lanserar verktyg löpande, alla med svenska källor och svensk arbetsmarknad som utgångspunkt: rekryteringstester, CV-analys, jobbmatchning, sökta tjänster, LinkedIn-profilen och Jobbcoachen.',
    farg: 'tran',
    bild: (
      <span className="oo-fyra">
        {(['tran', 'cv', 'brev', 'jobb'] as const).map((f) => (
          <span key={f} data-p3-farg={f}>
            <Dorr ikon={f} />
          </span>
        ))}
      </span>
    ),
    nu: true,
  },
]

const KALLOR = ['Arbetsförmedlingen', 'SCB', 'Fackförbunden', 'Försäkringskassan', 'CSN', 'Skatteverket'] as const

const LOFTEN: { rubrik: string; text: string; bild: ReactNode }[] = [
  {
    rubrik: 'Du behåller kontrollen',
    text: 'Vi loggar aldrig in på dina konton, varken LinkedIn, Arbetsförmedlingen eller någon annanstans. Du klistrar in det som behövs och kopierar tillbaka resultatet. Inget delat lösenord, ingen automatik bakom ryggen.',
    bild: (
      <span className="oo-flode">
        <span>
          <i>1</i>Du klistrar in
        </span>
        <span>
          <i>2</i>Vi skriver
        </span>
        <span>
          <i>3</i>Du kopierar tillbaka och skickar
        </span>
        <span className="oo-aldrig">
          <i>
            <Ikon namn="las" />
          </i>
          Ditt lösenord stannar hos dig
        </span>
      </span>
    ),
  },
  {
    rubrik: 'Svenska källor i botten',
    // SEO:s besked avsnitt 5 (B-19): källorna står med när svaret bygger på dem.
    text: 'Svaren bygger på Arbetsförmedlingen, SCB, fackförbunden, Försäkringskassan, CSN och Skatteverket. Vi gissar inte, vi hänvisar, och när svaret bygger på källorna står de med.',
    bild: (
      <span className="oo-kallor">
        {KALLOR.map((k) => (
          <span key={k}>{k}</span>
        ))}
      </span>
    ),
  },
  {
    rubrik: 'Du betalar bara när du behöver mer',
    text: `Du provar det mesta utan kortuppgifter. Behöver du mer finns allt i ${paketKort()}, en månad i taget, och du säger upp i ditt konto utan att uppge skäl.`,
    bild: (
      <span className="oo-tvapris">
        <span className="oo-g">
          <b>0 kr</b>
          <span>Gratisnivån, inget kort</span>
        </span>
        <span className="oo-p">
          <b>{PLAN_BY_KEY[SALD_PLAN].amount} kr</b>
          <span>
            {paketKort()}, {PLAN_BY_KEY[SALD_PLAN].suffix}
          </span>
        </span>
      </span>
    ),
  },
]

const tal = (n: number) => `${n.toLocaleString('sv-SE')}+`

export default function OmOssSida({ konton, brev }: { konton: number | null; brev: number | null }) {
  return (
    <Sida farg="tran">
      <main>
        {/* 1. Hjälten: från ett verktyg till fyra delar */}
        <Hjalte
          id="hjalte"
          brodsmulor={[
            { name: 'Hem', href: '/' },
            { name: 'Om oss', href: '/om-oss' },
          ]}
          brodsmulorSchema={false}
          etikett="Om Jobbcoach.ai"
          h1="Vi hjälper dig att nå dina karriärmål"
          varde={
            <>
              Vi har byggt jobbverktyg som förstår svensk arbetsmarknad. Ingen amerikansk import, ingen gissning.{' '}
              <b>Verktygen vi själva hade velat ha när vi sökte jobb.</b>
            </>
          }
          knappar={
            <>
              <Knapp href="/funktioner" pil data-primar="">
                Se våra verktyg
              </Knapp>
              <TextLank href="#vart-team">Så började det</TextLank>
            </>
          }
          bild={
            <div
              className="oo-vaxt"
              role="group"
              aria-label="Från ett verktyg 2023 till fyra delar i dag: personliga brev, CV, Jobbsöket och rekryteringstester"
            >
              <p className="oo-etk oo-etk-nu">I dag: fyra delar i samma konto</p>
              <p className="oo-v" data-p3-farg="tran">
                <Dorr ikon="tran" />
                <b>Rekryteringstester</b>
                <span>{storForst(TESTTYPER_ORD)} testtyper i tre nivåer</span>
              </p>
              <p className="oo-v" data-p3-farg="jobb">
                <Dorr ikon="jobb" />
                <b>Jobbsöket</b>
                <span>Matchade jobb, Sökta tjänster och Jobbcoachen</span>
              </p>
              <p className="oo-v" data-p3-farg="cv">
                <Dorr ikon="cv" />
                <b>CV</b>
                <span>Analys, mallar och LinkedIn</span>
              </p>
              <p className="oo-v" data-p3-farg="brev">
                <Dorr ikon="brev" />
                <b>Personliga brev</b>
                <span>Här började vi</span>
              </p>
              <p className="oo-etk">2023: ett verktyg, cvbrev.se</p>
            </div>
          }
        />

        {/* 2. Historien som en väg */}
        <Sektion id="vart-team" aria-labelledby="om-berattelse">
          <SektionHuvud etikett="Vår historia" rubrik="Från cvbrev.se till Jobbcoach.ai" rubrikId="om-berattelse" />
          <ol
            className="p3-vagsteg oo-hist"
            data-n={MILSTOLPAR.length}
            style={{ ['--n' as string]: Math.min(MILSTOLPAR.length, 4) }}
          >
            {MILSTOLPAR.map((m, i) => (
              <li key={m.rubrik} className={m.nu ? 'oo-nu' : undefined} data-p3-farg={m.farg}>
                <Nr typ={m.nu ? 'koppar' : 'ton'}>{i + 1}</Nr>
                <small>{m.nu ? `${m.period}, nu` : m.period}</small>
                <h3 className="p3-h3">{m.rubrik}</h3>
                <p>{m.text}</p>
                <div className="p3-steg-bild" aria-hidden="true">
                  {m.bild}
                </div>
              </li>
            ))}
          </ol>
        </Sektion>

        {/* 3. Tre löften */}
        <Sektion botten="ton" farg="jobb" aria-labelledby="om-loften">
          <SektionHuvud etikett="Så arbetar vi" rubrik="Tre saker vi lovar" rubrikId="om-loften" />
          <ol className="oo-loften">
            {LOFTEN.map((l, i) => (
              <li key={l.rubrik} className="oo-lofte">
                <div className="oo-lofte-text">
                  <Nr>{i + 1}</Nr>
                  <h3 className="p3-h3">{l.rubrik}</h3>
                  <p>{l.text}</p>
                </div>
                <div className="oo-lofte-bild" aria-hidden="true">
                  {l.bild}
                </div>
              </li>
            ))}
          </ol>
        </Sektion>

        {/* 4. Talen och kontakten */}
        <Sektion aria-labelledby="om-kontakt">
          <O farg="tran" som="div" className="oo-slut">
            <div className="oo-slut-rad">
              {konton || brev ? (
                <div className="oo-tal" role="group" aria-label="Jobbcoach.ai i siffror">
                  {konton ? (
                    <div>
                      <b>{tal(konton)}</b>
                      <span>har skapat konto för att söka jobb med svenska verktyg.</span>
                    </div>
                  ) : null}
                  {brev ? (
                    <div>
                      <b>{tal(brev)}</b>
                      <span>personliga brev skrivna på riktiga annonser sedan starten.</span>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div />
              )}
              <div className="oo-kontakt">
                <p className="p3-ey">Kontakt</p>
                <h2 id="om-kontakt" className="p3-h2">
                  Saknar du något, eller har du en fråga?
                </h2>
                <p>
                  Vi läser varje mejl och svarar inom ett par vardagar. Mycket av det som finns i verktygen i dag kom från
                  användare som skrev till oss.
                </p>
                <div className="p3-knapprad">
                  <Knapp href="/register">Skapa konto gratis</Knapp>
                  <TextLank href="mailto:info@jobbcoach.ai">info@jobbcoach.ai</TextLank>
                </div>
              </div>
            </div>
          </O>
        </Sektion>
      </main>
    </Sida>
  )
}
