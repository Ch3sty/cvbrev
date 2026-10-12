/**
 * /priser, publikt v2 (docs/design/spec-publikt-v2-del-a-2026-10-12.md
 * avsnitt 5.2, skissen v4 flik #priser).
 *
 * Bara Jobbcoach Premium, 149 kr i månaden, säljs. Hjälten är Premium på
 * bläck med namnet och priset ur plans.ts, gratisnivån som dämpad jämförelse,
 * funktionerna en och en på väggar (rekryteringstesterna först och störst),
 * hjälpredan Kom igång, tabellen rad för rad och frågorna.
 *
 * Serverrenderad rakt igenom. Köpknappen är det enda som behöver
 * JavaScript; den ser likadan ut för in- och utloggade (CLS 0). Alla
 * FAQ-svar och hela tabellen står i HTML.
 *
 * SEO: h1, title, description och canonical oförändrade. Product och
 * FAQPage ur priser-schema.ts, oförändrade. Baslinjens h2 och h3 står kvar.
 */

import Link from 'next/link'
import PubliktSida from '@/components/publikt/PubliktSida'
import Rum from '@/components/publikt/Rum'
import Station from '@/components/publikt/Station'
import Objekt, { type ObjektTyp } from '@/components/publikt/Objekt'
import PrisTabell from '@/components/publikt/PrisTabell'
import Faq from '@/components/publikt/Faq'
import FastKnapprad from '@/components/publikt/FastKnapprad'
import { PremiumOrd, PrisRad } from '@/components/publikt/PremiumBlock'
import { TESTTAL, PROV_MINUTER } from '@/components/publikt/testtal'
import { talOrd } from '@/components/publikt/talord'
import SkarmPersonlighet from '@/components/publikt/telefon/skarmar/SkarmPersonlighet'
import SkarmMatris from '@/components/publikt/telefon/skarmar/SkarmMatris'
import SkarmCvAnalys from '@/components/publikt/telefon/skarmar/SkarmCvAnalys'
import SkarmIntervjufragor from '@/components/publikt/telefon/skarmar/SkarmIntervjufragor'
import SkarmBrev from '@/components/publikt/telefon/skarmar/SkarmBrev'
import SkarmMatchning from '@/components/publikt/telefon/skarmar/SkarmMatchning'
import SkarmCoach from '@/components/publikt/telefon/skarmar/SkarmCoach'
import PriserKopKnapp from './components/PriserKopKnapp'
import PriserMatning from './components/PriserMatning'
import {
  COMPARISON,
  JAMFORELSE_KOLUMNER,
  JAMFORELSE_RUBRIK,
  PRISER_FAQ_ITEMS,
  PRISER_FAQ_RUBRIK,
} from './components/priser-data'
import { faqSchema, prisSchema } from './components/priser-schema'
import { FORTROENDE, FUNKTIONER, GUIDE, PAKET_KORT } from '@/components/pricing/paket-copy'
import { SALD_PLAN, paketNamn, prisPeriod } from '@/lib/plans/plans'
import { FREE_CV_EXPORTS, FREE_TEMPLATE_COUNT } from '@/lib/cv/template-antal'
import { FREE_TIER_JOB_LIMIT } from '@/lib/jobmatching/freeLimit'
import { CV_ANALYSIS_LIMIT, FREE_CHAT_MESSAGES_PER_ACCOUNT, FREE_LETTERS_PER_ACCOUNT } from '@/lib/quota/quotaService'

// Samma 24 timmar som resten av (public). Sidan har ingen besökarspecifik data:
// inloggningen läses i klienten, så CDN:et får behålla svaret.
export const revalidate = 86400

const T = TESTTAL
/** "Jobbcoach" ur "Jobbcoach Premium", så att Premium får gradienten i h1. */
const NAMN_FORE = paketNamn(SALD_PLAN).replace(/\s*Premium$/, '')

const funktion = (id: string) => {
  const f = FUNKTIONER.kort.find((k) => k.id === id)
  if (!f) throw new Error(`FUNKTIONER saknar ${id}`)
  return f
}

const GRATIS_RAD: { objekt: ObjektTyp; rum: 'tran' | 'cv' | 'brev' | 'jobb'; tal: number; text: string }[] = [
  { objekt: 'matris', rum: 'tran', tal: 1, text: 'nivåkoll' },
  { objekt: 'person', rum: 'tran', tal: T.personlighetGrund.fragor, text: 'påståenden' },
  { objekt: 'mallar', rum: 'cv', tal: FREE_TEMPLATE_COUNT, text: 'CV-mallar' },
  { objekt: 'cv', rum: 'cv', tal: CV_ANALYSIS_LIMIT, text: 'CV-analys' },
  { objekt: 'brev', rum: 'brev', tal: FREE_LETTERS_PER_ACCOUNT, text: 'brev, sedan ett i veckan' },
  { objekt: 'match', rum: 'jobb', tal: FREE_TIER_JOB_LIMIT, text: 'matchade jobb' },
]

export default function PriserSida() {
  const tester = funktion('rekryteringstester')
  const analys = funktion('cv-analys')
  const brev = funktion('personliga-brev')
  const jobb = funktion('matchade-jobb')
  const coach = funktion('jobbcoachen')

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(prisSchema()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema()) }} />

      <PubliktSida>
        <main>
          {/* 1. Premium-hjälten på bläck */}
          <Rum yta="premium" id="hjalte" style={{ paddingTop: 'clamp(32px, 5vw, 72px)' }}>
            <div className="pub-wrap pub-tva">
              <div className="pub-tva-text">
                <p className="pub-kick">Priser</p>
                <h1 className="pub-h1">
                  {NAMN_FORE} <PremiumOrd />, {prisPeriod(SALD_PLAN)}
                </h1>
                <p className="pub-ingress" style={{ marginTop: 20 }}>
                  <b>Rekryteringstester, CV, personliga brev, jobbmatchning och Jobbcoachen</b>
                </p>
                <p className="pub-brod" style={{ marginTop: 10 }}>
                  Allt är öppet från första minuten. Ingen bindningstid, du säger upp med ett klick. Mindre än en lunch i
                  månaden.
                </p>
                <PrisRad style={{ marginTop: 28 }} />
                <div className="pub-handling" style={{ marginTop: 20 }}>
                  <PriserKopKnapp primar />
                  <span className="pub-liten">{PAKET_KORT.allt.fotnot}</span>
                </div>
                <h2 className="pub-h3" style={{ marginTop: 40 }}>
                  {PAKET_KORT.allt.listEtikett}
                </h2>
                <ul className="pub-bock" style={{ marginTop: 18 }}>
                  {PAKET_KORT.allt.ingar.map((rad) => (
                    <li key={rad}>{rad}</li>
                  ))}
                </ul>
                <ul className="pub-ankare">
                  <li>
                    <a className="pub-lank" href="#gratis">
                      Gratisnivån
                    </a>
                  </li>
                  <li>
                    <a className="pub-lank" href="#funktioner">
                      Så fungerar det
                    </a>
                  </li>
                  <li>
                    <a className="pub-lank" href="#guide">
                      Så guidar vi dig
                    </a>
                  </li>
                </ul>
              </div>
              <div className="pub-solfjader">
                <SkarmPersonlighet />
                <SkarmMatris />
                <SkarmCvAnalys />
              </div>
            </div>
          </Rum>

          {/* 2. Gratis som jämförelse, dämpad */}
          <Rum yta="mark" id="gratis">
            <div className="pub-wrap">
              <div className="pub-kort pub-gratis-kort">
                <div>
                  <h2 className="pub-h3">Vill du se först?</h2>
                  <p className="pub-brod" style={{ marginTop: 12 }}>
                    Utan att betala får du <b>en nivåkoll i testerna</b> med full genomgång och ett första träningspass samma
                    dag, <b>personlighetstestet</b> med {T.personlighetGrund.fragor} påståenden, <b>{FREE_TEMPLATE_COUNT} CV-mallar</b>{' '}
                    och {talOrd(FREE_CV_EXPORTS)} nedladdning, <b>en CV-analys</b> som visar din poäng och det tyngsta fyndet,{' '}
                    <b>ett personligt brev</b> skrivet på en annons och sedan ett i veckan (att läsa, inte ladda ner),{' '}
                    <b>{talOrd(FREE_TIER_JOB_LIMIT)} matchade jobb</b> och <b>{talOrd(FREE_CHAT_MESSAGES_PER_ACCOUNT)} frågor</b>{' '}
                    till Jobbcoachen.
                  </p>
                  <div className="pub-handling">
                    <Link className="pub-knapp" href="/register">
                      Skapa konto gratis
                    </Link>
                    <span className="pub-liten">Inget kort. Ligger kvar så länge du vill.</span>
                  </div>
                </div>
                <ul className="pub-gratis-rad" aria-label="Gratisnivån i siffror">
                  {GRATIS_RAD.map((g) => (
                    <li key={g.text} className={`pub-rum-${g.rum}`}>
                      <Objekt typ={g.objekt} storlek={40} />
                      <b>{g.tal}</b>
                      <span>{g.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Rum>

          {/* 3. Funktion för funktion */}
          <Rum yta="panel" storlek="tat" id="funktioner">
            <div className="pub-wrap" style={{ textAlign: 'center' }}>
              <h2 className="pub-h2">{FUNKTIONER.h2}</h2>
              <p className="pub-ingress" style={{ margin: '14px auto 0' }}>
                {FUNKTIONER.ingress}
              </p>
            </div>
          </Rum>

          {/* 4. Rekryteringstester, störst */}
          <Station
            rum="tran"
            stor
            objekt="matris"
            rubrik={tester.rubrik}
            rubrikNiva="h3"
            gratisRad={`Ingår i Premium. Gratis: en nivåkoll med genomgång, ett första träningspass och personlighetstestet med ${T.personlighetGrund.fragor} påståenden.`}
            text={
              <>
                {tester.text.replace(/\d+ till \d+ minuter/, `${PROV_MINUTER.min} till ${PROV_MINUTER.max} minuter`)}{' '}
                Personlighetstestet ger profilen rekryteraren jämför med, hur den läses mot vanliga kravprofiler och frågorna du
                lär få på intervjun.
              </>
            }
            steg={[
              { rubrik: 'Nivåkollen på grundnivå', text: 'Visar var du står per typ.' },
              { rubrik: 'Träna på avancerad och expertnivå', text: 'I din svagaste typ, med förklaring på varje fråga.' },
              { rubrik: 'Kör övningsprovet när du är redo', text: 'Automatisk inlämning, resultat direkt.' },
              {
                rubrik: 'Personlighetstestet',
                text: 'Profilen, kravprofilerna och frågorna rekryteraren lär ställa. Det fördjupade testet ger 30 delfaktorer och din arbetsstil.',
              },
              { rubrik: 'Följ kurvan', text: 'Session för session.' },
            ]}
            lank={{
              text: `Gör personlighetsprovet, ${T.personlighetProv} påståenden utan konto`,
              href: '/verktyg/personlighetstest',
            }}
            telefon={
              <div className="pub-duo">
                <SkarmMatris />
                <SkarmIntervjufragor />
              </div>
            }
          />

          {/* 5. CV-analysen */}
          <Station
            rum="cv"
            omvand
            objekt="cv"
            rubrik={analys.rubrik}
            rubrikNiva="h3"
            gratisRad={analys.sub}
            text={analys.text}
            steg={[
              { rubrik: 'Ladda upp', text: 'Vi läser som en rekryterare gör på sex sekunder.' },
              { rubrik: 'Poäng per område', text: 'Och de fynd som drar ned mest.' },
              { rubrik: 'Nyckelorden', text: 'De rekryteringssystem (ATS) letar efter i din bransch.' },
              { rubrik: 'Rätta, kör om', text: 'Se poängen röra sig.' },
            ]}
            telefon={<SkarmCvAnalys />}
          />

          {/* 6. Personliga brev */}
          <Station
            rum="brev"
            objekt="brev"
            rubrik={brev.rubrik}
            rubrikNiva="h3"
            gratisRad={brev.sub}
            text={brev.text}
            steg={[
              { rubrik: 'Klistra in annonsen', text: 'Eller välj ett matchat jobb.' },
              { rubrik: 'Välj ton', text: 'Saklig, personlig eller vi väljer åt dig.' },
              { rubrik: 'Brevet svarar på kraven', text: 'Det personliga brevet svarar på annonsens krav med exempel ur ditt CV.' },
              { rubrik: 'Redigera, ladda ner som PDF, skicka', text: 'Det som står i CV:t vinner.' },
            ]}
            telefon={<SkarmBrev />}
          />

          {/* 7. Matchade jobb */}
          <Station
            rum="jobb"
            omvand
            objekt="match"
            rubrik={jobb.rubrik}
            rubrikNiva="h3"
            gratisRad={jobb.sub}
            text={jobb.text}
            telefon={<SkarmMatchning />}
          />

          {/* 8. Jobbcoachen, med köpknappen */}
          <Station
            rum="neu"
            objekt="chat"
            rubrik={coach.rubrik}
            rubrikNiva="h3"
            gratisRad={coach.sub}
            text={coach.text}
            knapp={<PriserKopKnapp cta="secondary" />}
            knappNot="Säg upp när du vill"
            telefon={<SkarmCoach />}
          />

          {/* 9. Hjälpredan Kom igång och villkoren */}
          <Rum yta="ton" rum="tran" id="guide">
            <div className="pub-wrap pub-tva pub-tva-topp">
              <div className="pub-tva-text">
                <p className="pub-kick">Första kvällen</p>
                <h2 className="pub-h2">{GUIDE.h2}</h2>
                <p className="pub-brod" style={{ marginTop: 18 }}>
                  {GUIDE.ingress}
                </p>
                <ul className="pub-bock" style={{ marginTop: 28, gap: 16 }} aria-label="Villkor">
                  {FORTROENDE.map((f) => (
                    <li key={f.key}>
                      <div>
                        <b>{f.rubrik}</b>
                        <br />
                        <span className="pub-liten">{f.text}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pub-kort">
                <p className="pub-kick" style={{ marginBottom: 10 }}>
                  {GUIDE.listor.allt.etikett}
                </p>
                <ol className="pub-ki">
                  {GUIDE.listor.allt.steg.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
              </div>
            </div>
          </Rum>

          {/* 10. Rad för rad */}
          <Rum yta="panel" id="tabell">
            <div className="pub-wrap">
              <h2 className="pub-h2">{JAMFORELSE_RUBRIK}</h2>
              <PrisTabell grupper={COMPARISON} kolumner={JAMFORELSE_KOLUMNER} />
            </div>
          </Rum>

          {/* 11. Frågorna */}
          <Rum yta="mark" id="fragor">
            <div className="pub-wrap" style={{ maxWidth: 820 }}>
              <Faq
                rubrik={PRISER_FAQ_RUBRIK}
                fragor={PRISER_FAQ_ITEMS}
                efter={
                  <div className="pub-handling" style={{ marginTop: 36 }}>
                    <PriserKopKnapp cta="secondary" />
                    <Link className="pub-lank" href="/register">
                      Eller börja gratis
                    </Link>
                  </div>
                }
              />
            </div>
          </Rum>
        </main>
        <FastKnapprad text={PAKET_KORT.allt.knapp} href="/register" observera="hjalte">
          <PriserKopKnapp cta="secondary" />
        </FastKnapprad>
      </PubliktSida>

      <PriserMatning />
    </>
  )
}
