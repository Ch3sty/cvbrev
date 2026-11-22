/**
 * /verktyg/bli-upptackt, publikt omgång 3 (skissen bli-upptackt,
 * docs/design/publikt-omgang3/sidor/bli-upptackt.html). Kandidatens
 * perspektiv: profilen är anonym tills kandidaten tackar ja, lönespannet
 * visas aldrig utåt och styrkor visas i ord, aldrig som råpoäng.
 *
 * Hjälten visar reglaget, kandidatkortet och en kontaktförfrågan. Stegen som
 * väg, värdet som kort med föremål, arbetsstilen på en ö i testernas färg,
 * tryggheten som väg och låskort, matchningen som möte, exempelprofilen och
 * slutet på ett papper.
 *
 * SEO (seo-besked-skisser.md avsnitt 19): h1, åtta H2, sexton H3 och all
 * löptext ordagrant. Texterna om arbetsgivaren och "percentiler" i samtycket
 * rörs inte. Schemat (Service, FAQPage) oförändrat.
 */
import type { CSSProperties } from 'react'
import BliUpptacktMatchning from './components/BliUpptacktMatchning'
import BliUpptacktExempel, { KandidatKort } from './components/BliUpptacktExempel'
import { BLI_UPPTACKT_FAQ_ITEMS } from './components/bli-upptackt-faq-data'
import FastKnapprad from '@/components/publikt/FastKnapprad'
import { Sida, Hjalte, Sektion, SektionHuvud, Kort, Rutnat, VagSteg, Faq, O, Knapp, Knapprad, TextLank, Ikon, Chip } from '@/components/publikt/v3'
// Den fasta knappraden (pub-botten) är stylad i publikt.css.
import '@/components/publikt/publikt.css'
import './bli-upptackt.css'

const STEG = [
  { rubrik: 'Skapa din profil', text: 'Lägg in ditt CV, så fyller vi i yrkesroll, kompetenser och erfarenhet åt dig. Du kan ändra allt själv.' },
  { rubrik: 'Gör testerna, om du vill', text: 'Personlighetstestet och kunskapstesterna är frivilliga. Gör du dem får profilen starkare bevis för vad du kan och hur du jobbar.' },
  { rubrik: 'Slå på synlighet', text: 'Aktivera synligheten när du är redo. Profilen blir sökbar för verifierade rekryterare, men helt anonymt. De ser inte vem du är.' },
  { rubrik: 'En rekryterare hör av sig, du väljer', text: 'Gillar en rekryterare det de ser skickar de en kontaktförfrågan. Tackar du ja delas ditt namn och dina kontaktuppgifter, och ni chattar i appen.' },
]

const VARDE = [
  { rubrik: 'Rätt rekryterare, inte alla', text: 'Bara rekryterare som söker just din typ av kompetens hör av sig. Du slipper drunkna i förfrågningar som inte passar.' },
  { rubrik: 'Du bestämmer när du syns', text: 'Slå på och av synligheten när du vill. Namn och kontaktuppgifter delas först när du själv tackar ja.' },
  { rubrik: 'Bevis, inte påståenden', text: 'Testresultaten visar vad du kan, i stället för att du bara skriver det i ett brev.' },
  { rubrik: 'Så du passar teamet', text: 'Din arbetsstil visar hur du samarbetar och jobbar, så rekryteraren ser om du skulle trivas hos dem.' },
]

const ARBETSSTIL = [
  { rubrik: 'Så arbetar du', text: 'Till exempel: du bygger struktur där den saknas och håller tidsplanen utan påminnelser.' },
  { rubrik: 'Så samarbetar du', text: 'Till exempel: du ställer upp utan att bli tillfrågad, och kollegors framgång väger tungt i din motivation.' },
  { rubrik: 'Så drivs du', text: 'Till exempel: du har stark tilltro till din egen förmåga utan behov av rampljus och leder genom expertis.' },
]

const KUNSKAPSTESTER = {
  rubrik: 'Bevisa vad du kan med kunskapstester',
  text: 'Gör korta tester i logiskt, verbalt och numeriskt tänkande. Resultatet visar var du ligger jämfört med andra som gjort samma test, till exempel bland de 10 procent som presterade bäst. Det blir ett bevis på din förmåga i stället för ett påstående. Också helt frivilligt.',
}

const TRYGGHET = [
  { rubrik: 'Du är anonym tills du säger ja', text: 'Rekryteraren ser din roll, dina kompetenser, dina villkor (tillträde, arbetsplats, omfattning och län), dina verifierade testresultat med nivå och placering, och om du valt det dina två främsta styrkor i ord. Aldrig ditt CV som fil, och aldrig dina kontaktuppgifter förrän du tackat ja till en förfrågan. I läget Anonym först, som är förvalt, gäller samma sak för ditt namn.' },
  { rubrik: 'Din nuvarande chef kan inte hitta dig', text: 'I läget Anonym först döljer vi vilka företag du har jobbat på, också det du jobbar på i dag, så din arbetsgivare kan inte känna igen dig i kandidatpoolen.' },
  { rubrik: 'Bara riktiga företag får söka', text: 'Vi kontrollerar att varje rekryterare hör till ett verkligt företag innan de släpps in, så du slipper oseriösa förfrågningar.' },
  { rubrik: 'Ditt lönespann stannar hos dig', text: 'Rekryteraren ser aldrig ditt löneanspråk. Lön pratar ni om själva, om och när ni börjar chatta.' },
]

function Reglage({ av, paPapper, children }: { av?: boolean; paPapper?: boolean; children: string }) {
  return (
    <span className={['bu-reglage', paPapper ? 'bu-pa-papper' : '', av ? 'bu-av' : ''].filter(Boolean).join(' ')}>
      <i />
      {children}
    </span>
  )
}

/** Värdekortens föremål, aria-hidden. Exempel. */
const VARDE_BILDER = [
  <span key="1" className="bu-sokfalt">
    projektledare, Västra Götaland
  </span>,
  <Reglage key="2" paPapper>
    Synlig för rekryterare
  </Reglage>,
  <div key="3" className="bu-kk-chips" style={{ margin: 0 }}>
    <span className="bu-test">Matrislogik, topp 15 %</span>
    <span className="bu-test">Numeriskt, topp 30 %</span>
  </div>,
  <div key="4" className="bu-spektrum" style={{ width: '100%', maxWidth: 340 }}>
    <div>
      <span>Improviserar</span>
      <span className="bu-pa">Planerar</span>
    </div>
    <i style={{ ['--lage' as string]: '86%' } as CSSProperties} />
  </div>,
]

export default function BliUpptacktSida() {
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Bli upptäckt av rekryterare på Jobbcoach.ai',
    url: 'https://www.jobbcoach.ai/verktyg/bli-upptackt',
    description:
      'Skapa en anonym kandidatprofil så kan verifierade rekryterare som söker din kompetens hitta dig. Verifierade testresultat och arbetsstil matchar dig mot rätt jobb. Anonym tills du säger ja. Kostar inget.',
    serviceType: 'Karriärtjänst',
    areaServed: { '@type': 'Country', name: 'Sverige' },
    provider: {
      '@type': 'Organization',
      name: 'Jobbcoach.ai',
      url: 'https://www.jobbcoach.ai',
    },
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: BLI_UPPTACKT_FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }

  // Stegens bilder, aria-hidden i VagSteg. Exempel.
  const stegBilder = [
    <div key="1" className="bu-mini-rad">
      <span className="bu-mini-chip">Projektledare</span>
      <span className="bu-mini-chip">8 år</span>
      <span className="bu-mini-chip">LOU</span>
      <span className="bu-mini-chip">budgetansvar</span>
    </div>,
    <div key="2" className="bu-mini-rad">
      <span className="bu-mini-chip bu-t">Matrislogik, topp 15 %</span>
      <span className="bu-mini-chip">Frivilligt</span>
    </div>,
    <Reglage key="3" paPapper>
      Synlig för rekryterare
    </Reglage>,
    <div key="4" className="bu-mini-rad">
      <span className="bu-mini-chip bu-k">Tacka ja</span>
      <span className="bu-mini-chip">Nej tack</span>
    </div>,
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <Sida farg="jobb" id="innehall">
        {/* 1. Hjälten: reglaget, kandidatkortet och förfrågan */}
        <Hjalte
          id="hjalte"
          // Baslinjen har ingen BreadcrumbList här; schemat ändras bara med SEO:s ja.
          brodsmulorSchema={false}
          brodsmulor={[
            { name: 'Hem', href: '/' },
            { name: 'Bli upptäckt', href: '/verktyg/bli-upptackt' },
          ]}
          etikett="Bli upptäckt, tidig åtkomst"
          h1="Bli hittad av rekryterare, utan att jaga jobb själv."
          varde={
            <>
              Skapa en profil på jobbcoach.ai så kan rekryterare som söker efter någon med din bakgrund hitta dig.{' '}
              <b>Du bestämmer själv om du vill synas, och du väljer alltid om du vill svara när någon hör av sig.</b>
            </>
          }
          knappar={
            <>
              <Knapp href="/register" pil>
                Skapa min profil
              </Knapp>
              <TextLank href="#sa-funkar-det">Se hur det fungerar, fyra steg</TextLank>
            </>
          }
          brickor={[
            { tal: 'Anonym', text: 'tills du tackar ja', ord: true },
            { tal: '4 steg', text: 'och du styr i varje' },
            { tal: '1 klick', text: 'för att sluta synas' },
          ]}
          bild={
            <div className="bu-hjbild">
              <span aria-hidden="true">
                <Reglage>Synlig för rekryterare</Reglage>
              </span>
              <KandidatKort kort />
              <div className="bu-forfragan" role="img" aria-label="Exempel: en kontaktförfrågan från en rekryterare">
                <span className="bu-etk">Kontaktförfrågan</span>
                <b>En rekryterare vill prata med dig</b>
                <p>Tackar du ja delas ditt namn och dina kontaktuppgifter. Annars händer ingenting.</p>
                <div aria-hidden="true">
                  <span>Tacka ja</span>
                  <span>Nej tack</span>
                </div>
              </div>
            </div>
          }
        />

        {/* 2. Så fungerar det */}
        <Sektion id="sa-funkar-det">
          <SektionHuvud
            rubrik="Så fungerar det"
            varde="Du lägger in ditt CV, gör testerna om du vill och slår sedan på synligheten. Då kan rekryterare hitta din profil när de letar efter någon med just din kompetens, utan att du skickar en enda ansökan. Fyra steg, och du styr i varje."
          />
          <VagSteg steg={STEG.map((s, i) => ({ ...s, bild: stegBilder[i], koppar: i === 3 }))} />
          <Knapprad className="bu-mt">
            <Knapp href="/register" variant="vit">
              Skapa min profil
            </Knapp>
          </Knapprad>
        </Sektion>

        {/* 3. Rätt synlighet */}
        <Sektion botten="ton">
          <SektionHuvud etikett="Därför fungerar det" rubrik="Rätt synlighet, inte mer synlighet" />
          <Rutnat kolumner={2}>
            {VARDE.map((v, i) => (
              <Kort key={v.rubrik}>
                <div className="bu-v-topp" aria-hidden="true">
                  {VARDE_BILDER[i]}
                </div>
                <h3 className="p3-h3">{v.rubrik}</h3>
                <p>{v.text}</p>
              </Kort>
            ))}
          </Rutnat>
        </Sektion>

        {/* 4. Arbetsstilen, i testernas färg */}
        <Sektion>
          <O
            farg="tran"
            ikon="tran"
            vand
            etikett="Frivilligt personlighetstest"
            rubrik="Visa hur du jobbar, inte bara vad du kan"
            rubrikNiva="h2"
            varde="Rekrytering handlar också om hur du samarbetar, fattar beslut och driver dig själv framåt. Personlighetstestet ger dig en rapport i ord, aldrig i poäng, så rekryteraren ser om du skulle trivas i just deras team."
            bild={
              <div className="bu-ordkort p3-papper" role="group" aria-label="Exempel: arbetsstilen i ord">
                {ARBETSSTIL.map((a) => (
                  <div key={a.rubrik} className="bu-rad">
                    <h3 className="p3-h3">{a.rubrik}</h3>
                    <p>{a.text}</p>
                  </div>
                ))}
              </div>
            }
            efter={
              <div className="bu-testband">
                <div>
                  <h3 className="p3-h3">{KUNSKAPSTESTER.rubrik}</h3>
                  <p>{KUNSKAPSTESTER.text}</p>
                </div>
                <div className="bu-kk-chips" aria-hidden="true">
                  <span className="bu-test">Matrislogik, topp 10 %</span>
                  <span className="bu-test">Verbalt, topp 25 %</span>
                  <span className="bu-test">Numeriskt, topp 30 %</span>
                </div>
              </div>
            }
          >
            <p>Du ser samma rapport som rekryteraren och väljer själv om den ska visas.</p>
          </O>
        </Sektion>

        {/* 5. Tryggheten */}
        <Sektion botten="papper">
          <SektionHuvud
            etikett="Din trygghet"
            rubrik="Du har full kontroll hela vägen"
            varde="Du bestämmer vem som får se vem du är, och när. Ditt CV som fil visas aldrig, och dina kontaktuppgifter först när du tackat ja. I läget Anonym först, som är förvalt, gäller det också ditt namn och dina arbetsgivare."
          />
          <div
            className="bu-vagen4"
            role="img"
            aria-label="Vägen från anonym profil till kontakt: anonym profil, kontaktförfrågan, du tackar ja, först då delas namn och kontaktuppgifter"
          >
            <div>
              <b>Anonym profil</b>Roll, kompetenser, villkor och testresultat. Inget namn.
            </div>
            <span>
              <Ikon namn="pil" />
            </span>
            <div>
              <b>Kontaktförfrågan</b>En rekryterare vars sökning matchar hör av sig.
            </div>
            <span>
              <Ikon namn="pil" />
            </span>
            <div>
              <b>Du väljer</b>Tacka ja eller nej. Säger du nej händer ingenting.
            </div>
            <span>
              <Ikon namn="pil" />
            </span>
            <div className="bu-ja">
              <b>Först efter ditt ja</b>Namn och kontaktuppgifter delas, och ni chattar i appen.
            </div>
          </div>
          <Rutnat kolumner={2}>
            {TRYGGHET.map((t) => (
              <Kort key={t.rubrik} className="bu-laskort">
                <span className="bu-las" aria-hidden="true">
                  <Ikon namn="las" />
                </span>
                <h3 className="p3-h3">{t.rubrik}</h3>
                <p>{t.text}</p>
              </Kort>
            ))}
          </Rutnat>
        </Sektion>

        {/* 6. Matchningen som möte */}
        <Sektion>
          <BliUpptacktMatchning />
        </Sektion>

        {/* 7. Exempelprofilen */}
        <Sektion luft="utan-topp">
          <BliUpptacktExempel />
        </Sektion>

        {/* 8. Slutet */}
        <Sektion luft="utan-topp">
          <div className="bu-slut p3-papper">
            <div className="bu-slut-text">
              <p className="p3-ey">Gratis, utan kortuppgift</p>
              <h2 className="p3-h2">Redo att bli hittad i stället för att leta?</h2>
              <p className="p3-varde">
                Profilen, synligheten och testerna kostar inget. Rekryteraren ser dina kompetenser, dina villkor och dina verifierade testresultat, men
                inte vem du är. Du är anonym tills du själv tackar ja till en förfrågan, och du stänger av synligheten när du vill med reglaget på sidan.
              </p>
              <Knapprad>
                <Knapp href="/register" pil>
                  Skapa min profil
                </Knapp>
                <TextLank href="#sa-funkar-det">Se hur det fungerar</TextLank>
              </Knapprad>
            </div>
            <div className="bu-slut-bild" aria-hidden="true">
              <Reglage paPapper>Synlig för rekryterare</Reglage>
              <Reglage paPapper av>
                Av, med ett klick
              </Reglage>
              <Chip typ="gratis">0 kr, ingen kortuppgift</Chip>
            </div>
          </div>
        </Sektion>

        {/* 9. Frågorna */}
        <Sektion id="fragor" luft="utan-topp">
          <Faq
            rubrik="Frågor om Bli upptäckt"
            fragor={BLI_UPPTACKT_FAQ_ITEMS}
            efter={
              <Knapp href="/register" pil>
                Skapa min profil
              </Knapp>
            }
          />
        </Sektion>
      </Sida>
      <FastKnapprad text="Skapa min profil" href="/register" observera="hjalte" />
    </>
  )
}
