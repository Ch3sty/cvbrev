/**
 * Intern förhandsvisning av grunden i publikt omgång 3
 * (docs/publikt-omgang3/bygg/grunden.md): varje komponent i varje färg,
 * menyn, telefonmenyn och bilderna ur produkten. För de agenter som bygger
 * sidorna och för slutgranskningen.
 *
 * Inte publik: svarar 404 i produktion om inte PUBLIKT_FORHANDSVISNING=1 är
 * satt för processen, och indexeras aldrig. Texten här är provtext.
 */

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import LandingNavbar from '@/components/landing/LandingNavbar'
import { MegaMeny, MobilMenyKropp } from '@/components/landing/LandingNavbarMega'
import {
  Bocklista,
  Brevpar,
  Chip,
  CvArk,
  FARGER,
  FARG_NAMN,
  Faq,
  GratisRad,
  Hjalte,
  Ikon,
  Knapp,
  Kort,
  KortBild,
  LankBricka,
  Lyft,
  MallMiniatyr,
  MatchadeJobb,
  Nr,
  O,
  PremiumO,
  PrisRad,
  Rutnat,
  Samtal,
  Sektion,
  SektionHuvud,
  Sida,
  Stig,
  Talbrickor,
  TextLank,
  Testram,
  Traff,
  VagSteg,
  type Farg,
} from '@/components/publikt/v3'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Förhandsvisning, publikt omgång 3',
  robots: { index: false, follow: false },
}

function Rubrik({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="p3-h2" style={{ marginBottom: 24 }}>
      {children}
    </h2>
  )
}

/** Menyraden som den ser ut i en färg (statisk kopia, för jämförelsen). */
function MenyRemsa({ farg }: { farg: Farg }) {
  return (
    <div data-p3-farg={farg} style={{ borderRadius: 22, overflow: 'hidden', border: '2px solid var(--kant-stark)' }}>
      <div className="p3-nav" style={{ position: 'relative' }}>
        <div className="p3-nav-bredd p3-nav-rad">
          <span className="p3-logga">
            <i aria-hidden="true">J</i>
            <b>
              Jobbcoach<span>.ai</span>
            </b>
          </span>
          <span className="p3-nav-val" aria-hidden="true">
            <a>Funktioner</a>
            <a>Priser</a>
            <a>
              Vad vi erbjuder <Ikon namn="ner" />
            </a>
            <a>Artiklar</a>
            <a>Om oss</a>
          </span>
          <span className="p3-nav-in">Logga in</span>
          <span className="p3-knapp p3-knapp-liten">Skapa konto</span>
        </div>
      </div>
      <div className="p3-vagg" style={{ padding: '16px 20px 20px' }}>
        <b className="p3-h3">{FARG_NAMN[farg]}</b>
      </div>
    </div>
  )
}

function FargProv({ farg }: { farg: Farg }) {
  return (
    <div data-p3-farg={farg} style={{ background: 'var(--golv)' }}>
      <Hjalte
        id={`hjalte-${farg}`}
        brodsmulor={[
          { name: 'Hem', href: '/' },
          { name: 'Förhandsvisning', href: '/forhandsvisning-publikt/v3' },
        ]}
        brodsmulorSchema={false}
        chip={<Chip typ="vagg">Gratis för varje CV</Chip>}
        h1Etikett={FARG_NAMN[farg]}
        h1="Hjälten med etikett inuti rubriken"
        varde={
          <>
            Värdemeningen står under rubriken. <b>Den feta meningen bär löftet.</b>
          </>
        }
        knappar={
          <>
            <Knapp href="#" pil>
              Kopparknappen
            </Knapp>
            <TextLank href="#">Textlänken bredvid</TextLank>
          </>
        }
        brickor={[
          { tal: '7', text: 'delar i genomgången' },
          { tal: '100', text: 'poäng att nå' },
          { tal: '0 kr', text: 'för poängen, varje CV' },
        ]}
        bild={<CvArk poang={{ tal: 93, text: 'av 100 i dag' }} kvar="7 poäng kvar till 100" fynd={{ rubrik: 'Erfarenhet', poang: '30 av 35', andel: 86, text: 'Flera punkter börjar inte med vad du gjorde. Jobbcoachen föreslår nya.' }} />}
        lyft
      />
      <Lyft>
        <p className="p3-ey">Det lyfta kortet</p>
        <h3 className="p3-h2" style={{ marginTop: 10 }}>
          Vyns första handling
        </h3>
        <p className="p3-varde" style={{ marginTop: 12 }}>
          Går in över hjältens nederkant. Här ligger provet eller uppladdningen.
        </p>
      </Lyft>
      <Sektion>
        <SektionHuvud etikett="Sektionshuvud" rubrik="Kort, rutnät, chip och numrerad bricka" varde="Golvet är sidans ljusa ton. Kort är papper med klack." />
        <Rutnat kolumner={4}>
          <Kort>
            <Nr>1</Nr>
            <h3 className="p3-h3">Kortet</h3>
            <p>Papper med tjock kant och klack.</p>
          </Kort>
          <Kort ton>
            <Nr typ="koppar">2</Nr>
            <h3 className="p3-h3">Kortet i ton</h3>
            <p>
              <Chip>Ton</Chip> <Chip typ="gratis">Gratis</Chip> <Chip typ="premium">Premium</Chip>
            </p>
          </Kort>
          <Kort>
            <KortBild>
              <MallMiniatyr id="linne" />
            </KortBild>
            <h3 className="p3-h3">Med bildyta</h3>
          </Kort>
          <LankBricka href="#" farg={farg} rubrik="Länkbrickan" text="Dörr i delens färg och en rad om vad man får." />
        </Rutnat>
        <div style={{ marginTop: 40 }}>
          <VagSteg
            steg={[
              { rubrik: 'Ladda upp ditt CV', text: 'Stegen är en väg, inte en lista.' },
              { rubrik: 'Vi går igenom sju delar', text: 'Prickad linje mellan korten på dator.' },
              { rubrik: 'Se poängen', text: 'Tre eller fyra på en rad.', koppar: true },
              { rubrik: 'Ta tillbaka poängen', text: 'Fem blir tre plus två.' },
            ]}
          />
        </div>
      </Sektion>
      <Sektion botten="ton" luft="tat">
        <O
          farg={farg}
          etikett="Ön i sidans färg"
          rubrik="Ett stort färgblock"
          varde={
            <>
              <b>Text på ena sidan, bild på den andra.</b> vand byter sida på dator.
            </>
          }
          knappar={
            <>
              <Knapp href="#" variant="vit">
                Så fungerar det
              </Knapp>
              <GratisRad chip={<Chip typ="vagg">Gratis</Chip>}>Grundnivån i alla testtyper</GratisRad>
            </>
          }
          bild={farg === 'jobb' ? <Stig /> : farg === 'brev' ? <Brevpar /> : farg === 'cv' ? <CvArk poang={{ tal: 93, text: 'av 100 i dag' }} /> : <Testram />}
        />
      </Sektion>
      <Sektion luft="utan-topp">
        <PremiumO
          rubrik="Allt i Premium"
          text="Premium är sidans mörkaste ton med kopparklack."
          knapp={{ text: 'Köp Premium', href: '#' }}
          not="Kortbetalning via Stripe. Kvitto på mejl."
          punkter={['Bocklistan står till höger på dator', 'Kopparbockar på mörk botten', 'Talen läses ur plans.ts']}
        />
      </Sektion>
    </div>
  )
}

export default function ForhandsvisningV3() {
  if (process.env.NODE_ENV === 'production' && process.env.PUBLIKT_FORHANDSVISNING !== '1') notFound()
  return (
    <>
      <LandingNavbar mega={<MegaMeny />} mobil={<MobilMenyKropp />} />
      <Sida farg="tran">
        <Hjalte
          id="topp"
          etikett="Förhandsvisning, inte publik"
          h1="Grunden för publikt omgång 3"
          varde="Varje komponent i varje färg, menyn, telefonmenyn och bilderna ur produkten. Bruksanvisningen står i docs/publikt-omgang3/bygg/grunden.md."
          knappar={
            <>
              <Knapp href="#farger">Färgerna</Knapp>
              <TextLank href="#bilder">Bilderna ur produkten</TextLank>
            </>
          }
          brickor={[
            { tal: String(FARGER.length), text: 'färger' },
            { tal: '7', text: 'bilder ur produkten' },
            { tal: 'Anonym', text: 'bricka med ord', ord: true },
          ]}
          bild={<Testram />}
        />

        <Sektion id="meny" botten="papper">
          <Rubrik id="meny-rubrik">Menyn i varje färg</Rubrik>
          <div style={{ display: 'grid', gap: 14 }}>
            {FARGER.map((f) => (
              <MenyRemsa key={f} farg={f} />
            ))}
          </div>
          <h3 className="p3-h3" style={{ margin: '40px 0 16px' }}>
            Vad vi erbjuder, öppen
          </h3>
          <MegaMeny />
          <h3 className="p3-h3" style={{ margin: '40px 0 16px' }}>
            Telefonmenyn, öppen
          </h3>
          <div style={{ position: 'relative', maxWidth: 412, height: 820, border: '3px solid var(--ink-1)', borderRadius: 30, overflow: 'hidden' }}>
            <nav className="p3-tm" aria-label="Telefonmenyn i förhandsvisningen" style={{ position: 'absolute' }}>
              <div className="p3-tm-topp">
                <span className="p3-logga">
                  <i aria-hidden="true">J</i>
                  <b>
                    Jobbcoach<span>.ai</span>
                  </b>
                </span>
                <span className="p3-tm-stang">
                  <Ikon namn="x" />
                  Stäng
                </span>
              </div>
              <div className="p3-tm-kropp">
                <MobilMenyKropp />
              </div>
              <div className="p3-tm-fot">
                <span className="p3-knapp">Skapa konto gratis</span>
                <span className="p3-knapp p3-knapp-vit">Logga in</span>
              </div>
            </nav>
          </div>
        </Sektion>

        <div id="farger">
          {FARGER.map((f) => (
            <FargProv key={f} farg={f} />
          ))}
        </div>

        <Sektion id="bilder" botten="papper">
          <SektionHuvud etikett="Bilderna ur produkten" rubrik="Instrumenten" varde="Komponenter med props och Sara Lindström som förval. Rita inga egna varianter." />
          <Rutnat kolumner={2}>
            <Kort>
              <h3 className="p3-h3">CvArk</h3>
              <CvArk poang={{ tal: 93, text: 'av 100 i dag' }} kvar="7 poäng kvar till 100" fynd={{ rubrik: 'Erfarenhet', poang: '30 av 35', andel: 86, text: 'Flera punkter börjar inte med vad du gjorde. Jobbcoachen föreslår nya.' }} />
            </Kort>
            <Kort>
              <h3 className="p3-h3">Testram</h3>
              <Testram />
            </Kort>
            <Kort>
              <h3 className="p3-h3">Testram med text och dom</h3>
              <Testram
                test="Verbalt resonemang"
                uppgift={4}
                av={10}
                tid="2:40"
                brade={null}
                stycke="Exempeltext: ett kort stycke som uppgiften bygger på. Byt mot en uppgift ur bankerna."
                fraga="Stämmer påståendet?"
                svar={[{ text: 'Sant', tillstand: 'fel' }, { text: 'Falskt', tillstand: 'ratt' }, { text: 'Kan inte avgöras' }]}
                knapp="Nästa"
                dom={{ ratt: false, rubrik: 'Inte rätt den här gången', etikett: 'Regeln', regel: 'Exempel på förklaringen efter facit.', text: 'Du valde A. Rätt svar är B.' }}
              />
            </Kort>
            <Kort>
              <h3 className="p3-h3">Brevpar</h3>
              <div data-p3-farg="brev" className="p3-o" style={{ padding: 24 }}>
                <Brevpar />
              </div>
            </Kort>
            <Kort>
              <h3 className="p3-h3">Stig</h3>
              <Stig paPapper />
            </Kort>
            <Kort>
              <h3 className="p3-h3">MatchadeJobb, Traff</h3>
              <div data-p3-farg="jobb" className="p3-o" style={{ padding: 24 }}>
                <MatchadeJobb />
              </div>
              <Traff matchgrad={null} sistaDag={null} skal={[]} kompetenser={['tidplan', 'entreprenadjuridik', 'BAS-P']} handlingar={[]} titel="Uppdragsledare, infrastruktur" arbetsgivare="Västlänken Konsult" ort="Mölndal" />
            </Kort>
            <Kort>
              <h3 className="p3-h3">Samtal</h3>
              <Samtal yta />
            </Kort>
            <Kort>
              <h3 className="p3-h3">MallMiniatyr</h3>
              <Rutnat kolumner={3}>
                <MallMiniatyr id="linne" format />
                <MallMiniatyr id="bjork" format />
                <MallMiniatyr id="koppar" format />
              </Rutnat>
              <div style={{ maxWidth: 180, marginTop: 14 }}>
                <MallMiniatyr id="linne" typ="brev" chip={false} />
              </div>
            </Kort>
          </Rutnat>
        </Sektion>

        <Sektion>
          <Faq
            rubrik="FAQ"
            fragor={[
              { q: 'Hur skriver jag FAQPage-schemat?', a: 'Sätt schema på Faq om sidan inte redan bygger FAQPage i page.tsx.' },
              { q: 'Kan svaret ha en länk?', a: 'Ja, med lank. Schemat läser bara texten.', lank: { text: 'Till bruksanvisningen', href: '#topp' } },
            ]}
            efter={
              <>
                <Bocklista paPapper punkter={['Bocklistan på papper', 'Tonade bockar']} />
                <div style={{ marginTop: 20 }}>
                  <PrisRad paPapper uppsagning />
                </div>
                <Talbrickor paPapper brickor={[{ tal: '3', text: 'träffar gratis' }, { tal: '25', text: 'bästa i Premium' }]} />
              </>
            }
          />
        </Sektion>
      </Sida>
    </>
  )
}
