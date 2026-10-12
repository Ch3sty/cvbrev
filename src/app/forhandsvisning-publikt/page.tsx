/**
 * Intern förhandsvisning av publikt v2:s delade komponenter (spec-publikt-v2
 * del A avsnitt 9, våg 1): alla telefonskärmar, objekten, de svävande
 * objekten, stegen, talraden, länklistan, prova-kortet, FAQ, tabellen och
 * Premiumblocket, i ljust och mörkt läge.
 *
 * Inte publik: sidan svarar 404 i produktion om inte
 * PUBLIKT_FORHANDSVISNING=1 är satt för processen (lokal next start inför
 * klicktestet), och den indexeras aldrig.
 */

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import PubliktSida from '@/components/publikt/PubliktSida'
import Rum from '@/components/publikt/Rum'
import Objekt, { type ObjektTyp } from '@/components/publikt/Objekt'
import SvavandeObjekt from '@/components/publikt/SvavandeObjekt'
import Steg from '@/components/publikt/Steg'
import TalRad from '@/components/publikt/TalRad'
import LankLista from '@/components/publikt/LankLista'
import ProvaKort from '@/components/publikt/ProvaKort'
import Faq from '@/components/publikt/Faq'
import PrisTabell from '@/components/publikt/PrisTabell'
import PremiumBlock, { PremiumOrd } from '@/components/publikt/PremiumBlock'
import Station from '@/components/publikt/Station'
import FastKnapprad from '@/components/publikt/FastKnapprad'
import Hjalte from '@/components/publikt/Hjalte'
import { MatrisBricka } from '@/components/publikt/MatrisExpert'
import SkarmBana from '@/components/publikt/telefon/skarmar/SkarmBana'
import SkarmMatris from '@/components/publikt/telefon/skarmar/SkarmMatris'
import SkarmPersonlighet from '@/components/publikt/telefon/skarmar/SkarmPersonlighet'
import SkarmIntervjufragor from '@/components/publikt/telefon/skarmar/SkarmIntervjufragor'
import SkarmCvAnalys from '@/components/publikt/telefon/skarmar/SkarmCvAnalys'
import SkarmBrev from '@/components/publikt/telefon/skarmar/SkarmBrev'
import SkarmAnnons from '@/components/publikt/telefon/skarmar/SkarmAnnons'
import SkarmMatchning from '@/components/publikt/telefon/skarmar/SkarmMatchning'
import SkarmAktivera from '@/components/publikt/telefon/skarmar/SkarmAktivera'
import SkarmCoach from '@/components/publikt/telefon/skarmar/SkarmCoach'
import SkarmNivakoll from '@/components/publikt/telefon/skarmar/SkarmNivakoll'
import { COMPARISON, JAMFORELSE_KOLUMNER } from '@/app/(public)/priser/components/priser-data'
import { HELA_PAKETET_RADER, kopKnapp } from '@/lib/plans/plans'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Förhandsvisning, publikt v2',
  robots: { index: false, follow: false },
}

const OBJEKT: ObjektTyp[] = [
  'matris', 'cv', 'match', 'brev', 'chat', 'mallar', 'linkedin', 'upptackt', 'exempel', 'sokta', 'person', 'klocka',
  'yrke', 'kompetens', 'utbildning', 'plats', 'sprak', 'erfarenhet', 'monster', 'logik', 'lasning', 'kritiskt',
  'rakna', 'tabell', 'prova', 'rapport', 'uppat', 'ladda',
]

const SKARMAR = [
  ['SkarmBana', <SkarmBana key="a" glid={false} />],
  ['SkarmMatris', <SkarmMatris key="b" glid={false} />],
  ['SkarmPersonlighet', <SkarmPersonlighet key="c" glid={false} />],
  ['SkarmIntervjufragor', <SkarmIntervjufragor key="d" glid={false} />],
  ['SkarmCvAnalys', <SkarmCvAnalys key="e" glid={false} />],
  ['SkarmBrev', <SkarmBrev key="f" glid={false} />],
  ['SkarmAnnons', <SkarmAnnons key="g" glid={false} />],
  ['SkarmMatchning', <SkarmMatchning key="h" glid={false} />],
  ['SkarmAktivera', <SkarmAktivera key="i" glid={false} />],
  ['SkarmCoach', <SkarmCoach key="j" glid={false} />],
  ['SkarmNivakoll', <SkarmNivakoll key="k" glid={false} />],
] as const

export default function Forhandsvisning() {
  if (process.env.NODE_ENV === 'production' && process.env.PUBLIKT_FORHANDSVISNING !== '1') notFound()
  return (
    <PubliktSida>
      <main>
        <Hjalte
          id="hjalte"
          yta="mark"
          kick="Förhandsvisning"
          h1="Publikt v2, delade komponenter"
          ingress="Alla telefonskärmar och byggstenar för de publika sidorna."
          fet="Ingen sida byter utseende i våg 1."
          primar={{ text: 'Skapa konto gratis', href: '/register' }}
          sekundar={{ text: 'Se skärmarna', href: '#skarmar' }}
          tal={[
            { tal: '11', text: 'skärmar' },
            { tal: '28', text: 'objekt' },
            { tal: '5', text: 'rum' },
          ]}
          bild={
            <>
              <SvavandeObjekt objekt="cv" rot={-8} plats={{ left: 0, top: 70 }} bredd={112} mobil={{ left: -8, top: 40, bredd: 96 }} />
              <SvavandeObjekt objekt="match" rot={6} plats={{ right: -6, top: 120 }} bredd={150} mobil={{ right: -14, top: 150, bredd: 132 }} />
              <SvavandeObjekt objekt="matris" rot={10} plats={{ left: 4, bottom: 118 }} bredd={116} mobil={{ left: -4, bottom: 90, bredd: 84 }} />
              <SvavandeObjekt objekt="brev" rot={-5} plats={{ right: 12, bottom: 70 }} bredd={92} doljPaMobil />
              <SvavandeObjekt objekt="chat" rot={4} plats={{ right: 40, top: -6 }} bredd={104} doljPaMobil />
              <SvavandeObjekt objekt="bock" plats={{ left: 70, top: -10 }} bredd={46} doljPaMobil />
              <SkarmBana />
            </>
          }
        />

        <Rum yta="panel" id="skarmar">
          <div className="pub-wrap">
            <h2 className="pub-h2">Skärmarna</h2>
            <div className="pub-galleri" style={{ marginTop: 32 }}>
              {SKARMAR.map(([namn, el]) => (
                <figure key={namn}>
                  {el}
                  <figcaption>{namn}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </Rum>

        <Rum yta="ton" rum="tran">
          <div className="pub-wrap">
            <h2 className="pub-h2">Objekten</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginTop: 24 }}>
              {OBJEKT.map((o) => (
                <figure key={o} style={{ margin: 0, display: 'grid', justifyItems: 'center', gap: 6, fontSize: 12 }}>
                  <Objekt typ={o} />
                  <figcaption>{o}</figcaption>
                </figure>
              ))}
              <figure style={{ margin: 0, display: 'grid', justifyItems: 'center', gap: 6, fontSize: 12 }}>
                <MatrisBricka bredd={96} />
                <figcaption>matrisbrickan</figcaption>
              </figure>
            </div>
          </div>
        </Rum>

        <Station
          rum="tran"
          stor
          objekt="matris"
          kick="Inför urvalstestet"
          rubrik="Station med två telefoner"
          rubrikNiva="h2"
          ingress={
            <>
              <b>Känn igen uppgiften innan provdagen.</b> Brödtext i ingressen.
            </>
          }
          text="Brödtexten under ingressen."
          knapp={{ text: 'Så fungerar det', href: '/verktyg/rekryteringstester' }}
          knappNot="Raden bredvid knappen"
          telefon={
            <div className="pub-duo">
              <SkarmMatris />
              <SkarmPersonlighet />
            </div>
          }
        />
        <Station
          rum="cv"
          omvand
          objekt="cv"
          rubrik="Station omvänd med steg"
          rubrikNiva="h2"
          gratisRad="Ingår i Premium. Gratis: poängen och det tyngsta fyndet."
          text="Brödtexten."
          steg={[
            { rubrik: 'Ladda upp', text: 'Vi läser som en rekryterare.' },
            { rubrik: 'Poäng per område', text: 'Och de fynd som drar ned mest.' },
          ]}
          telefon={<SkarmCvAnalys />}
        />

        <Rum yta="mark">
          <div className="pub-wrap">
            <ProvaKort
              rum="tran"
              rubrik="Prova-kortet"
              text="Du behöver inte registrera dig för att se var du står."
              punkter={['Fem matrislogikfrågor', 'Resultat direkt']}
              knapp={{ text: 'Prova fem frågor', href: '/verktyg/rekryteringstester/prova' }}
              not="Ingen inloggning, inget kort"
            />
            <div style={{ marginTop: 48 }}>
              <h2 className="pub-h2">Steg, två kolumner</h2>
              <div style={{ marginTop: 24 }}>
                <Steg
                  kolumner={2}
                  rader={[
                    { rubrik: 'Öva på rätt testtyp', text: 'Text.' },
                    { rubrik: 'Träna under tidspress', text: 'Text.' },
                    { rubrik: 'Välj tillfälle och miljö', text: 'Text.' },
                    { rubrik: 'Räkna med att det känns svårt', text: 'Text.' },
                  ]}
                />
              </div>
            </div>
            <div style={{ marginTop: 48 }}>
              <h2 className="pub-h2">Länklistan</h2>
              <div style={{ marginTop: 24 }}>
                <LankLista
                  lankar={[
                    { href: '/verktyg/personligt-brev', rubrik: 'Personligt brev', text: 'Skrivet på annonsen.', objekt: 'brev', rum: 'brev' },
                    { href: '/verktyg/cv-mallar', rubrik: 'CV-mallar', text: 'Mallar som systemen läser.', objekt: 'mallar', rum: 'cv' },
                  ]}
                />
              </div>
            </div>
            <TalRad tal={[{ tal: '1 nivåkoll', text: 'gratis med konto' }, { tal: '20 min', text: 'per pass' }, { tal: '5 frågor', text: 'utan konto' }]} />
          </div>
        </Rum>

        <Rum yta="panel">
          <div className="pub-wrap">
            <h2 className="pub-h2">Tabellen</h2>
            <PrisTabell grupper={COMPARISON} kolumner={JAMFORELSE_KOLUMNER} />
          </div>
        </Rum>

        <PremiumBlock
          kick="Jobbcoach Premium"
          rubrik={
            <>
              Allt i <PremiumOrd />
            </>
          }
          text="Alla verktyg utan tak."
          punkter={HELA_PAKETET_RADER}
          pris
          knapp={{ text: kopKnapp(), href: '/priser' }}
          not="Kortbetalning via Stripe. Kvitto på mejl."
          bild={
            <>
              <SkarmIntervjufragor />
              <SkarmMatris />
              <SkarmCvAnalys />
            </>
          }
          vag="mark"
        />

        <Rum yta="mark">
          <div className="pub-wrap" style={{ maxWidth: 820 }}>
            <Faq
              rubrik="Frågorna"
              fragor={[
                { q: 'Första frågan?', a: 'Svaret står i HTML.' },
                { q: 'Andra frågan?', a: 'Också i HTML.' },
              ]}
            />
          </div>
        </Rum>
      </main>
      <FastKnapprad text="Skapa konto gratis" href="/register" observera="hjalte" />
    </PubliktSida>
  )
}
