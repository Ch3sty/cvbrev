/**
 * /verktyg/jobbcoachen, publikt omgång 3 (skissen jobbcoachen,
 * docs/design/publikt-omgang3/sidor/jobbcoachen.html). Skog, under Jobbsöket.
 *
 * Hjälten är samtalet i stor skala med förslagen utifrån läget, lyftet ett
 * svar som står stilla (LAS-svaret, textbeslut B-31), stegen som väg, det
 * nya blocket om förslagen (h3), de sex områdena med frågan som bubbla,
 * källorna på en ö, gratiskvoten och frågorna.
 *
 * SEO (seo-besked-skisser.md avsnitt 18): h1, title, description, de fem H2
 * och alla sexton H3 ordagrant; åtta FAQ-frågor (den nionde i skissen står
 * inte). Schemat (WebApplication, HowTo, FAQPage) byggs ur samma listor.
 * Hjältens exempel har inga namngivna källor och inga belopp.
 */
import Link from 'next/link'
import JobbcoachenLiveDemo from './components/JobbcoachenLiveDemo'
import CoachFraga from './components/CoachFraga'
import { coachHref } from './components/coach-href'
import { JOBBCOACHEN_FAQ_ITEMS } from './components/jobbcoachen-faq-data'
import RedirectLoggedIn from '@/components/auth/RedirectLoggedIn'
import { SALD_PLAN, paketKort, paketMedPris } from '@/lib/plans/plans'
import { FREE_CHAT_MESSAGES_PER_ACCOUNT } from '@/lib/quota/quotaService'
import { MedKampanjPris } from '@/components/kampanj/Kampanj'
import FastKnapprad from '@/components/publikt/FastKnapprad'
import { storForst, talOrd } from '@/components/publikt/talord'
import {
  Sida,
  Hjalte,
  Lyft,
  Sektion,
  SektionHuvud,
  Kort,
  Rutnat,
  Nr,
  VagSteg,
  Faq,
  O,
  Knapp,
  Knapprad,
  TextLank,
  Dorr,
  Samtal,
} from '@/components/publikt/v3'
// Den fasta knappraden (pub-botten) är stylad i publikt.css.
import '@/components/publikt/publikt.css'
import './jobbcoachen.css'

const SOKTA_TJANSTER = '/verktyg/sokta-tjanster'
const MEDDELANDEN = talOrd(FREE_CHAT_MESSAGES_PER_ACCOUNT, true)

/** Områdena: texten ordagrant, exempelfrågan (förr "Till exempel: ...") som bubbla. */
const AMNEN = [
  { rubrik: 'CV och personligt brev', fraga: 'Hur skriver jag min sammanfattning?', text: 'Få feedback på en formulering, hjälp att skriva om en mening så att den landar, eller förslag på vad som saknas. Dela ditt sparade CV direkt i samtalet.' },
  { rubrik: 'Marknadslön och löneförhandling', fraga: 'Vad tjänar en projektledare i Göteborg?', text: 'Svaren bygger på SCB:s lönestatistik och fackförbundens underlag i vår kunskapsbas, med källan angiven. Du får en siffra att utgå från och argument att luta dig mot i samtalet.' },
  { rubrik: 'Intervjuförberedelse', fraga: 'Hur svarar jag på frågan om svagheter?', text: 'Öva svar på vanliga intervjufrågor, packa din erfarenhet i en berättelse och få tips på vad du själv ska fråga.' },
  { rubrik: 'Arbetsrätt och LAS', fraga: 'Hur lång uppsägningstid har jag?', text: 'Vi förklarar uppsägningstider, anställningsformer, semester, övertid och vad LAS säger om saklig grund, med källa så att du ser vad lagen säger.' },
  { rubrik: 'Karriärbyte och utveckling', fraga: 'Vilka roller passar min bakgrund?', text: 'Byta bransch, ta nästa kliv eller plugga vidare? Vi visar vilka roller som ligger nära din erfarenhet och vilka kompetenser du behöver bygga.' },
  { rubrik: 'A-kassa, sjukdom och CSN', fraga: 'Får jag CSN som vuxen?', text: 'Ersättningsregler, väntedagar, vad som gäller vid sjukskrivning och hur CSN fungerar om du vill plugga om. Vi hänvisar till rätt myndighet när det behövs.' },
]

const KALLOR = [
  { mono: 'AF', rubrik: 'Arbetsförmedlingen', text: 'Regler för arbetslöshet, etableringsstöd, jobbsökarverksamhet och stödformer. Hit hänvisar Jobbcoachen när frågan rör myndighetsregler eller stöd.' },
  { mono: 'SCB', rubrik: 'SCB', text: 'Lönestatistik per yrke, region och erfarenhet samt arbetsmarknadsdata. Frågar du om marknadslön är det SCB:s lönestrukturstatistik som ligger till grund.' },
  { mono: 'Fack', rubrik: 'Fackförbund', text: 'Kollektivavtal och stöd från Unionen, Kommunal, IF Metall, Vision och fler. Används när frågan rör avtalsenliga villkor eller regler i en viss bransch.' },
  { mono: 'FK', rubrik: 'Försäkringskassan', text: 'Sjukpenning, föräldraledighet, regler vid sjukskrivning och ersättningar. Hit hänvisar vi när frågan rör socialförsäkringen och vad du har rätt till.' },
  { mono: 'CSN', rubrik: 'CSN', text: 'Studielån, omställningsstudiestöd och regler för att plugga om som vuxen. Användbart när du överväger vidareutbildning eller karriärbyte.' },
  { mono: 'SKV', rubrik: 'Skatteverket', text: 'Skatteregler för anställning, eget företag, traktamente och förmåner. Används när lönen räknas i nettotermer eller när du jämför anställningsformer.' },
]

/**
 * Produktens riktiga förslag ur src/lib/jobbsok/coach.ts. Arbetsgivarnas
 * bokstäver och namn är exempel. Varje förslag leder in i ett riktigt
 * första meddelande: genom kontot till Jobbcoachen med frågan i fältet.
 */
const LAGET = [
  { bokstaver: 'PO', ton: 'jc-int', fraga: 'Hur svarar jag på lönefrågan hos Polhem Ombyggnad?' },
  { bokstaver: 'DA', ton: 'jc-tyst', fraga: 'Vad skriver jag i ett uppföljningsmejl?' },
  { bokstaver: 'PO', ton: 'jc-int', fraga: 'Vad frågar jag arbetsgivaren på intervjun?' },
  { bokstaver: 'VK', ton: '', fraga: 'Hur länge är det rimligt att vänta på besked?' },
]

function Laget() {
  return (
    <div className="jc-laget" role="group" aria-label="Frågor som Jobbcoachen föreslår utifrån läget i de sökta tjänsterna, med exempel på arbetsgivare">
      <b>Frågor utifrån ditt läge</b>
      <small>Hämtade ur dina sökta tjänster. Tryck på en, så står den i fältet.</small>
      {LAGET.map((f) => (
        <Link key={f.fraga} className="jc-forslagrad" href={coachHref(f.fraga)}>
          <span className={`jc-br ${f.ton}`.trim()} aria-hidden="true">
            {f.bokstaver}
          </span>
          {f.fraga}
        </Link>
      ))}
    </div>
  )
}

export default function JobbcoachenSida() {
  // Inloggade hör hemma i verktyget, inte på säljsidan (C2).

  // === Schema.org markup ===

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Jobbcoachen från Jobbcoach.ai',
    url: 'https://www.jobbcoach.ai/verktyg/jobbcoachen',
    description:
      'Karriärrådgivning baserad på Arbetsförmedlingen, SCB, fackförbund, Försäkringskassan, CSN och Skatteverket. Få svar på frågor om lön, intervju, arbetsrätt och karriärbyte med klickbara källhänvisningar.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'SEK',
      description: '10 meddelanden gratis per konto, utan kortuppgift',
    },
    featureList:
      'Karriärrådgivning från svenska källor, klickbara källhänvisningar i varje svar, marknadslön per yrke, arbetsrätt och LAS, intervjuförberedelse, karriärbyte, A-kassa och CSN, dokumentdelning av CV och brev, frågeförslag utifrån dina sökta tjänster',
  }

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Så får du karriärråd med Jobbcoachen på Jobbcoach.ai',
    description:
      'Fyra steg från fråga till svar med källhänvisning: ställ frågan, vi söker bland verifierade källor, du får svaret med citat, du följer upp.',
    totalTime: 'PT2M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'SEK',
      value: '0',
    },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Ställ frågan',
        text:
          'Skriv en fråga om lön, intervju, arbetsrätt, karriärbyte eller annat som rör jobblivet i Sverige. Har du loggat sökta tjänster föreslår Jobbcoachen frågor utifrån ditt läge, till exempel vad du skriver i ett uppföljningsmejl.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Vi söker bland verifierade källor',
        text:
          'Jobbcoachen söker i en kunskapsbas av Arbetsförmedlingen, SCB, fackförbund, Försäkringskassan, CSN och Skatteverket.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Du får svar med källhänvisning',
        text:
          'Svaret är kort och konkret med klickbara källor markerade direkt i texten.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Följ upp tills det är klart',
        text:
          'Jobbcoachen minns samtalet och du kan följa upp utan att börja om.',
      },
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: JOBBCOACHEN_FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }

  // Stegens bilder, aria-hidden i VagSteg. Exempel.
  const stegBilder = [
    <span key="1" className="jc-mini-falt">
      Hur svarar jag på frågan om svagheter?
    </span>,
    <div key="2" className="jc-mini-kallor">
      {KALLOR.map((k) => (
        <span key={k.mono}>{k.mono}</span>
      ))}
    </div>,
    <div key="3" className="jc-mini-stapel">
      <span className="jc-mini-bubbla">
        Uppsägningstiden är minst 1 månad om du jobbat under 2 år <span className="jc-kref">(Källa 2)</span>.
      </span>
      <span className="jc-kalla">
        <i>2</i>Unionen Uppsägning
      </span>
    </div>,
    <div key="4" className="jc-mini-stapel">
      <span className="jc-mini-bubbla jc-du">Jag har varit där i sex år.</span>
      <span className="jc-mini-bubbla">Då gäller längre tid. Så här räknar du.</span>
    </div>,
  ]

  return (
    <>
      <RedirectLoggedIn to="/dashboard/jobbcoachen" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <Sida farg="jobb" id="innehall">
        {/* 1. Hjälten: samtalet i stor skala */}
        <Hjalte
          id="hjalte"
          brodsmulor={[
            { name: 'Hem', href: '/' },
            { name: 'Verktyg', href: '/funktioner' },
            { name: 'Jobbcoachen', href: '/verktyg/jobbcoachen' },
          ]}
          etikett="Jobbcoachen, för svensk arbetsmarknad"
          h1="Karriärrådgivning från någon som faktiskt kan svensk arbetsmarknad"
          h1Mindre
          varde={
            <>
              Fråga om lön, intervju, uppsägning eller karriärbyte och få ett kort svar med klickbara källhänvisningar till Arbetsförmedlingen, SCB och
              fackförbund. <b>Vi gör researchen, så slipper du googla på 20 olika sajter.</b>
            </>
          }
          knappar={
            <>
              <Knapp href={coachHref()} pil>
                Fråga gratis
              </Knapp>
              <TextLank href="#sa-funkar-det">Så fungerar det</TextLank>
            </>
          }
          brickor={[
            { tal: `${FREE_CHAT_MESSAGES_PER_ACCOUNT} meddelanden`, text: 'gratis per konto' },
            { tal: 'Källor', text: 'du kan kolla själv', ord: true },
            { tal: String(KALLOR.length), text: 'källor i kunskapsbasen' },
          ]}
          bild={
            <div className="jc-samtal">
              <div className="jc-samtal-ram">
                <div className="jc-samtal-topp" aria-hidden="true">
                  <Dorr ikon="jobb" />
                  <b>
                    Jobbcoachen<span>Svarar med svenska källor</span>
                  </b>
                </div>
                <Samtal
                  ariaLabel="Exempel: ett samtal med Jobbcoachen om att följa upp en ansökan"
                  forslag={[]}
                  meddelanden={[
                    { fran: 'du', text: 'Vad skriver jag i ett uppföljningsmejl?' },
                    {
                      fran: 'coach',
                      text: 'Håll det kort. Säg vilken tjänst det gäller, att du fortfarande är intresserad och fråga när de räknar med att ge besked. Tre till fyra meningar räcker. Vill du att vi skriver ett utkast tillsammans?',
                    },
                  ]}
                />
                <CoachFraga />
              </div>
            </div>
          }
          lyft
        />

        {/* 2. Lyftet: ett svar som står stilla */}
        <Lyft id="demo">
          <div className="jc-tva">
            <JobbcoachenLiveDemo />
            <div>
              <p className="p3-ey">Prova själv</p>
              <p className="jc-stor">Här ser du var svaret kommer ifrån</p>
              <ol className="jc-delar3">
                <li>
                  <Nr>1</Nr>
                  <div>
                    <b>Ett kort svar i klartext</b>
                    <span>Några meningar, inte en rapport. Jobbcoachen frågar tillbaka när svaret beror på din situation.</span>
                  </div>
                </li>
                <li>
                  <Nr>2</Nr>
                  <div>
                    <b>Källan står i texten</b>
                    <span>Påståenden som bygger på kunskapsbasen är märkta, så du ser vad som är lag, statistik eller avtal.</span>
                  </div>
                </li>
                <li>
                  <Nr>3</Nr>
                  <div>
                    <b>Källorna går att öppna</b>
                    <span>Under svaret ligger källorna som länkar. Du kan alltid läsa själv innan du lutar dig mot svaret.</span>
                  </div>
                </li>
              </ol>
              <Knapprad className="jc-mt">
                <Knapp href={coachHref()}>Skapa konto och fråga själv</Knapp>
                <span className="p3-liten">{storForst(MEDDELANDEN)} meddelanden gratis, utan kortuppgift</span>
              </Knapprad>
            </div>
          </div>
        </Lyft>

        {/* 3. Så fungerar det, och förslagen utifrån läget */}
        <Sektion id="sa-funkar-det">
          <SektionHuvud
            rubrik="Så fungerar det"
            varde="Ställ frågan, få svaret med källa och gå vidare. Inga flikar fulla av lönerapporter och forumtrådar."
          />
          <VagSteg steg={howToSchema.step.map((s, i) => ({ rubrik: s.name, text: s.text, bild: stegBilder[i], koppar: i === 3 }))} />
          <Knapprad className="jc-mt-stor">
            <Knapp href={coachHref()} variant="vit">
              Fråga Jobbcoachen gratis
            </Knapp>
          </Knapprad>

          <O
            className="jc-laget-o"
            farg="jobb"
            ikon="jobb"
            etikett="När du inte vet vad du ska fråga"
            rubrik="Jobbcoachen föreslår frågor utifrån ditt läge"
            varde="Har du loggat dina sökta tjänster ligger frågorna redan framme: en ansökan som har varit tyst, en intervju som närmar sig, ett avslag du vill ha återkoppling på."
            bild={<Laget />}
          >
            <p>Du trycker på en fråga, så står den i fältet. Den skickas först när du själv vill.</p>
            <div className="jc-vet">
              <div>
                <b>Det här utgår svaren från</b>
                <ul>
                  <li>Din målroll, ort och bransch ur profilen</li>
                  <li>CV och personliga brev som du själv delar i samtalet</li>
                  <li>Det ni redan har sagt i samtalet</li>
                </ul>
              </div>
              <div className="jc-inte">
                <b>Det här läser Jobbcoachen inte</b>
                <ul>
                  <li>Dina matchade jobb</li>
                  <li>Dina testresultat</li>
                  <li>Dokument du inte har delat</li>
                </ul>
              </div>
            </div>
            <p>
              <TextLank href={SOKTA_TJANSTER}>Sökta tjänster</TextLank>
            </p>
          </O>
        </Sektion>

        {/* 4. Sex områden */}
        <Sektion botten="ton">
          <SektionHuvud
            etikett="Vad du kan fråga om"
            rubrik="Sex områden vi hjälper dig med"
            varde="Jobbcoachen kan svensk arbetsmarknad, från lönesamtalet till arbetsrätten."
          />
          <Rutnat kolumner={3}>
            {AMNEN.map((a) => (
              <Kort key={a.rubrik} className="jc-amne">
                <Link className="jc-fraga" href={coachHref(a.fraga)}>{a.fraga}</Link>
                <h3 className="p3-h3">{a.rubrik}</h3>
                <p>{a.text}</p>
              </Kort>
            ))}
          </Rutnat>
        </Sektion>

        {/* 5. Källorna på en ö */}
        <Sektion>
          <O
            farg="jobb"
            ikon="jobb"
            etikett="Källorna bakom svaren"
            rubrik="Verifierad svensk arbetsmarknadsdata"
            rubrikNiva="h2"
            varde="Inga blogginlägg och inga forumtrådar. Jobbcoachen hämtar svaren ur sex pålitliga källor och visar exakt var informationen kommer ifrån."
          >
            <div className="jc-kallhylla">
              {KALLOR.map((k) => (
                <Kort key={k.rubrik} className="jc-kallkort">
                  <span className="jc-mono" aria-hidden="true">
                    {k.mono}
                  </span>
                  <h3 className="p3-h3">{k.rubrik}</h3>
                  <p>{k.text}</p>
                </Kort>
              ))}
            </div>
            <p className="p3-liten jc-kallnot">
              Kunskapsbasen är ett femtiotal dokument och uppdateras när vi gör en ny genomgång, inte av sig själv när en källa ändras.
            </p>
          </O>
        </Sektion>

        {/* 6. Slutet: gratiskvoten och Premium */}
        <Sektion luft="utan-topp">
          <div className="p3-premium">
            <div className="p3-premium-rad p3-med-lista">
              <div className="p3-premium-text">
                <p className="p3-ey">
                  <MedKampanjPris text={paketMedPris(SALD_PLAN)} />
                </p>
                <h2 className="p3-h2">Sluta googla. Fråga någon som vet.</h2>
                <p style={{ fontSize: 17 }}>
                  {`${FREE_CHAT_MESSAGES_PER_ACCOUNT} meddelanden ingår gratis på ditt konto, utan kortuppgift, och du kan dela ditt CV i samtalet från första frågan. Jobbcoachen så mycket du vill ingår i ${paketKort()}.`}
                </p>
                <div className="p3-knapprad">
                  <Knapp href={coachHref()}>Fråga Jobbcoachen gratis</Knapp>
                  <TextLank href="#sa-funkar-det">Se hur det fungerar</TextLank>
                </div>
              </div>
              <div>
                <div className="jc-kvot">
                  <b>{`Gratis: ${MEDDELANDEN} meddelanden per konto`}</b>
                  <div className="jc-tio" role="img" aria-label={`${storForst(MEDDELANDEN)} meddelanden`}>
                    {Array.from({ length: FREE_CHAT_MESSAGES_PER_ACCOUNT }, (_, i) => (
                      <i key={i} />
                    ))}
                  </div>
                  <p>Samtalet ligger kvar att läsa när de är slut.</p>
                </div>
                <div className="jc-kvot">
                  <b>{`${paketKort()}: fråga så mycket du vill`}</b>
                  <div className="jc-utantak" role="img" aria-label="Utan tak">
                    <i />
                  </div>
                  <p>Du fortsätter i samma samtal, där du slutade.</p>
                </div>
              </div>
            </div>
          </div>
        </Sektion>

        {/* 7. Frågorna */}
        <Sektion id="fragor" luft="utan-topp">
          <Faq
            rubrik="Vanliga frågor om karriärrådgivning"
            ingress={
              <>
                Hittar du inte svaret?{' '}
                <a className="p3-lank" href="mailto:support@jobbcoach.ai">
                  Hör av dig
                </a>
                .
              </>
            }
            fragor={JOBBCOACHEN_FAQ_ITEMS}
            efter={
              <Knapp href="/register" pil>
                Fråga gratis
              </Knapp>
            }
          />
        </Sektion>
      </Sida>
      <FastKnapprad text="Fråga gratis" href={coachHref()} observera="hjalte" />
    </>
  )
}
