/**
 * Startsidan, publikt omgång 3 (skissen docs/design/publikt-omgang3/sidor/start.html,
 * noten noter/start.md, SEO:s besked avsnitt 1). Formen är ny, texten är
 * sidans egen: h1, alla h2 och h3, styckena, FAQ och schemat står ordagrant
 * som före ombyggnaden (texträttningarna STA-1 till STA-8 och B3 var redan
 * införda).
 *
 * Ordning: hjälten på väggen med de fyra korten (beslut 3, i stället för
 * telefonen Mitt jobbsök), mediebevisen, tre verktyg som öar (tester först),
 * brevet, Jobbcoachen, medierna på mörk yta, resten av jobbsöket med Sökta
 * tjänster som eget block, Premium och frågorna. Alla tal ur koden.
 *
 * Serverkomponent; klient-JS bara för FastKnapprad och mätningen av
 * Jobbkartans rad (TeaserMatare, ritar inget).
 */

import Link from 'next/link'
import FastKnapprad from '../FastKnapprad'
import { faqSchema } from '../Faq'
import TeaserMatare from '@/components/jobbkartan/TeaserMatare'
import { storForst, talOrd } from '../talord'
import {
  Sida,
  Hjalte,
  Sektion,
  SektionHuvud,
  O,
  Rutnat,
  LankBricka,
  Dorr,
  Chip,
  Knapp,
  TextLank,
  GratisRad,
  PremiumO,
  Faq,
  Testram,
  CvArk,
  MatchadeJobb,
  SARA_FLER_TRAFFAR,
  Brevpar,
  Samtal,
  Stig,
  MATRIS_BRADE,
  type Farg,
} from '../v3'
import { HELA_PAKETET_RADER, SALD_PLAN, kopKnapp, paketKort, paketMedPris } from '@/lib/plans/plans'
import { FREE_TEMPLATE_COUNT, TEMPLATE_COUNT } from '@/lib/cv/template-antal'
import { FREE_TIER_JOB_LIMIT, JOB_MATCHES_PER_RUN } from '@/lib/jobmatching/freeLimit'
import { FREE_CHAT_MESSAGES_PER_ACCOUNT, FREE_LETTERS_PER_ACCOUNT } from '@/lib/quota/quotaService'
import { ANTAL_TESTTYPER, GRATIS_FAQ, GRUNDNIVAN_ALLA, TESTTYPER_ORD } from '@/lib/plans/gratis-copy'
import { KATEGORIER } from '@/lib/cv/poang/modell'
import { NO_RESPONSE_NUDGE_DAYS } from '@/lib/applications/status'
import { BREV_GRATIS_NAMN, BREV_MALL_ANTAL } from '../brevmallar'
import { FACEBOOK_URL } from '@/lib/sociala-konton'
// Den fasta knappraden (pub-botten) är stylad i publikt.css.
import '../publikt.css'
import './start.css'

/** "tolv" ur NO_RESPONSE_NUDGE_DAYS (talOrd går bara till tio). */
const TYSTA_DAGAR = NO_RESPONSE_NUDGE_DAYS === 12 ? 'tolv' : String(NO_RESPONSE_NUDGE_DAYS)

/** Jobbcoachens exempel (nytt-innehall.md, start): vyns egen föreslagna fråga, inget källmärke, inget belopp. */
const COACH_SAMTAL = [
  { fran: 'du', text: 'Vad skriver jag i ett uppföljningsmejl?' },
  {
    fran: 'coach',
    text: 'Håll det kort. Säg vilken tjänst det gäller, att du fortfarande är intresserad och fråga när de räknar med att ge besked. Tre till fyra meningar räcker.',
  },
] as const
const COACH_FORSLAG = ['Vad frågar jag arbetsgivaren på intervjun?', 'Hur länge är det rimligt att vänta på besked?'] as const

/** Gratisbrevet enligt koden (spec avsnitt 7, ägarens beslut 2). */
const GRATISBREV = 'Första personliga brevet gratis, sedan ett var sjunde dag'

const MEDIER = [
  {
    kalla: 'Kollega',
    rubrik: 'AI-rekrytering klassad som högriskverksamhet',
    text: '40 procent av Teamtailors över 10 000 arbetsgivare har slagit på AI i rekryteringen. EU klassar AI-rekrytering som högriskverksamhet.',
    url: 'https://kollega.se/soka-jobb/ai-rekrytering-ats-cv-soka-jobb-intervju',
    domän: 'kollega.se',
  },
  {
    kalla: 'SVT Nyheter',
    rubrik: 'Knepen som gör att du inte sorteras bort',
    text: 'Hur sticker du ut när perfekta AI-skrivna CV:n blivit norm?',
    url: 'https://www.svt.se/nyheter/inrikes/ai-och-jobbsokande-har-ar-knepen-som-gor-att-du-inte-sorteras-bort',
    domän: 'svt.se',
  },
  {
    kalla: 'Sveriges Radio P1',
    rubrik: 'Så tar du dig förbi robotarna',
    text: 'Jesper Olsson på Trygghetsrådet TRR förklarar hur du undviker att bli bortsållad.',
    url: 'https://www.sverigesradio.se/artikel/ai-sallar-bort-ditt-cv-sa-har-tar-du-dig-forbi-robotarna',
    domän: 'sverigesradio.se',
  },
  {
    kalla: 'Dagens Nyheter',
    rubrik: 'Intervjuad av en robot',
    text: 'AI tar över allt fler steg i rekryteringen hos svenska företag.',
    url: 'https://www.dn.se/sverige/intervjuad-av-en-robot-sa-tar-ai-over-inom-rekrytering/',
    domän: 'dn.se',
  },
] as const

/** De åtta länkarna under Sökta tjänster, i skissens ordning, texterna som före ombyggnaden. */
const RESTEN: { href: string; rubrik: string; text: string; farg: Farg; matning?: string }[] = [
  { href: '/verktyg/personligt-brev', rubrik: 'Personligt brev', text: 'Skrivet på annonsen, utifrån ditt CV, i den ton du väljer.', farg: 'brev' },
  {
    href: '/cv-mallar',
    rubrik: 'CV-mallar',
    text: `${TEMPLATE_COUNT} mallar som rekryteringssystemen läser, ${FREE_TEMPLATE_COUNT} gratis.`,
    farg: 'cv',
  },
  { href: '/verktyg/jobbcoachen', rubrik: 'Jobbcoachen', text: 'Lön, intervjufrågor, avtal och avslag, utifrån svensk arbetsmarknad och med källor du kan kolla själv.', farg: 'jobb' },
  { href: '/verktyg/linkedin-optimering', rubrik: 'LinkedIn-profilen', text: 'Rubrik och sammanfattning som rekryterare hittar när de söker.', farg: 'cv' },
  { href: '/verktyg/bli-upptackt', rubrik: 'Bli upptäckt', text: 'Rekryterare hittar dig, anonymt tills du själv svarar.', farg: 'jobb' },
  {
    href: '/jobbkartan',
    rubrik: 'Jobbkartan',
    text: 'Hur många som konkurrerar om varje jobb, län för län. SCB:s siffror på en karta.',
    farg: 'jobb',
    matning: 'jobbkartan-teaser',
  },
  { href: '/cv-exempel', rubrik: 'CV-exempel', text: 'Färdiga CV:n yrke för yrke, att utgå ifrån.', farg: 'cv' },
  { href: '/personligt-brev-exempel', rubrik: 'Personligt brev-exempel', text: 'Brev att utgå från, yrke för yrke.', farg: 'brev' },
]

export const START_FAQ = [
  {
    q: 'Vad är ATS, och varför ska mitt CV vara anpassat?',
    a: 'ATS (Applicant Tracking System) är de rekryteringssystem de flesta större svenska arbetsgivare använder för att sortera ansökningar automatiskt. Är ditt CV inte läsbart för systemet kan du sorteras bort innan en människa ens öppnar det. Alla våra CV-mallar är byggda för att systemen ska kunna läsa dem.',
  },
  {
    q: 'Hur mycket av jobbet gör ni åt mig?',
    a: 'Vi skriver utkastet utifrån ditt CV och jobbannonsen. Du läser igenom, justerar tonen där det behövs och skickar. Resultatet låter som du, bara mer genomarbetat än om du skrivit varje brev från noll.',
  },
  {
    q: 'Hur snabbt kan jag skapa ett personligt brev?',
    a: 'Runt 60 sekunder från att du klistrar in annonsen till ett färdigt utkast. Du sparar en kvart eller mer per ansökan jämfört med att skriva från grunden.',
  },
  {
    q: 'Är mina uppgifter säkra?',
    a: 'Ja. Vi säljer inte dina uppgifter och tränar inga egna AI-modeller på ditt CV. Ditt konto, dina CV, brev och testresultat lagras i EU, i Irland, och text ur ditt CV går till Googles AI-tjänst utan namn, e-postadress och telefonnummer. Raderar du kontot under Inställningar tar vi bort det du har sparat hos oss. Kvitton finns kvar hos Stripe i sju år, som bokföringslagen kräver.',
  },
  {
    q: 'Vad kostar det, och vad får jag utan att betala?',
    a: `${GRATIS_FAQ} Söker du på allvar ingår allt i ${paketMedPris(SALD_PLAN)}. Ingen bindningstid, och du säger upp i ditt konto.`,
  },
] as const

function startSchema() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'Jobbcoach.ai',
        url: 'https://www.jobbcoach.ai',
        logo: 'https://www.jobbcoach.ai/icon.png',
        email: 'info@jobbcoach.ai',
        sameAs: [FACEBOOK_URL,'https://www.instagram.com/jobbcoach.ai'],
      },
      { '@type': 'WebSite', name: 'Jobbcoach.ai', url: 'https://www.jobbcoach.ai', inLanguage: 'sv-SE' },
      (() => {
        const { '@context': _c, ...faq } = faqSchema(START_FAQ)
        return faq
      })(),
    ],
  }
}

/* ------------------------------------------------------------------ */
/* Hjältens fyra kort (beslut 3). Exempel, ingen rubrik i korten.      */
/* ------------------------------------------------------------------ */

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 3, strokeLinejoin: 'round' } as const

/** Matrisens figurer i samma ordning som Testrams kontrollräknade uppgift (MATRIS_BRADE). */
function MiniFigur({ f }: { f: (typeof MATRIS_BRADE)[number] }) {
  if (!f) return <>?</>
  const bas = f[0]
  const tecken = f[1]
  const form =
    bas === 't' ? <path d="M20 6l15 27H5z" /> : bas === 'c' ? <circle cx="20" cy="20" r="14" /> : <rect x="6" y="6" width="28" height="28" rx="3" />
  const cy = bas === 't' ? 24 : 20
  const extra =
    tecken === 'p' ? (
      <circle cx="20" cy={cy} r="3" fill="currentColor" />
    ) : tecken === 'x' ? (
      <path d={bas === 't' ? 'M14 25h12M20 19v12' : 'M13 20h14M20 13v14'} />
    ) : null
  return (
    <svg viewBox="0 0 40 40" {...S}>
      {form}
      {extra}
    </svg>
  )
}

/** Exempel: två delar tappar, resten är fulla. 100 - 5 - 2 = 93. */
const EXEMPEL_TAPP: Partial<Record<(typeof KATEGORIER)[number]['id'], number>> = { erfarenhet: 30, sprak: 3 }
const EXEMPEL_POANG = KATEGORIER.reduce((s, k) => s + (EXEMPEL_TAPP[k.id] ?? k.max), 0)

function Kollage() {
  const tappade = KATEGORIER.filter((k) => EXEMPEL_TAPP[k.id] !== undefined)
  return (
    <div
      className="st-kollage"
      role="img"
      aria-label="De fyra delarna i Jobbcoach: rekryteringstester, CV, personliga brev och Jobbsöket"
    >
      <div className="st-rk p3-gungar" data-p3-farg="tran">
        <p className="st-rk-namn">
          <Dorr ikon="tran" />
          Rekryteringstester
        </p>
        <div className="st-matris">
          {MATRIS_BRADE.map((f, i) => (
            <span key={i} className={f ? undefined : 'st-tom'}>
              <MiniFigur f={f} />
            </span>
          ))}
        </div>
      </div>

      <div className="st-rk p3-gungar p3-sen" data-p3-farg="cv">
        <p className="st-rk-namn">
          <Dorr ikon="cv" />
          CV-analys
        </p>
        <p className="st-rk-tal">
          {EXEMPEL_POANG}
          <small>av 100</small>
        </p>
        <div className="st-sju">
          {KATEGORIER.map((k) => (
            <i key={k.id} className={EXEMPEL_TAPP[k.id] !== undefined ? 'st-t' : undefined} style={{ flex: k.max }} />
          ))}
        </div>
        <p className="st-rk-rad">
          {100 - EXEMPEL_POANG} poäng kvar till 100. De sitter i {talOrd(tappade.length, true)} delar.
        </p>
        {tappade.map((k) => (
          <div key={k.id} className="st-tapp">
            <span>{k.namn}</span>
            <span>
              {EXEMPEL_TAPP[k.id]} av {k.max}
            </span>
            <div className="p3-stapel p3-koppar">
              <i style={{ width: `${Math.round(((EXEMPEL_TAPP[k.id] ?? 0) / k.max) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="st-rk p3-gungar p3-sen" data-p3-farg="brev">
        <p className="st-rk-namn">
          <Dorr ikon="brev" />
          Personliga brev
        </p>
        <div className="st-blad">
          <i />
          <i />
          <i className="st-m" />
          <i />
          <i className="st-m" style={{ width: '52%' }} />
          <i style={{ width: '80%' }} />
        </div>
        <p className="st-rk-rad">Svarar på 3 av 4 krav i annonsen.</p>
      </div>

      <div className="st-rk p3-gungar" data-p3-farg="jobb">
        <p className="st-rk-namn">
          <Dorr ikon="jobb" />
          Jobbsöket
        </p>
        <svg className="st-ministig" viewBox="0 0 220 96" fill="none" aria-hidden="true">
          <path
            d="M12 84C50 84 54 60 88 56s42-12 64-24 36-16 50-22"
            stroke="currentColor"
            strokeOpacity=".55"
            strokeWidth="3"
            strokeDasharray="1 8"
            strokeLinecap="round"
          />
          <circle cx="12" cy="84" r="6" fill="var(--vagg-2)" stroke="currentColor" strokeWidth="3" />
          <circle cx="88" cy="56" r="8" fill="var(--koppar)" stroke="currentColor" strokeWidth="3" />
          <circle cx="152" cy="32" r="6" fill="var(--vagg-2)" stroke="currentColor" strokeWidth="3" />
          <path d="M202 10V-14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M202-14l18 6-18 7z" fill="var(--koppar)" />
          <circle cx="202" cy="10" r="5" fill="currentColor" />
        </svg>
        <p className="st-rk-rad">2 sökta väntar svar. Intervju på tisdag.</p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */

export default function Startsidan({ konton }: { konton: number | null }) {
  const brickor = [
    ...(konton ? [{ tal: `${konton}+`, text: 'har skapat konto' }] : []),
    { tal: String(ANTAL_TESTTYPER), text: 'testtyper, grundnivån gratis' },
    { tal: `${FREE_LETTERS_PER_ACCOUNT} brev`, text: 'gratis, sedan ett i veckan' },
  ]
  return (
    <Sida farg="tran" id="innehall">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(startSchema()) }} />

      {/* 1. Hjälten på väggen med de fyra korten */}
      <Hjalte
        id="hjalte"
        etikett="Bekräftat av SVT, SR, DN och Kollega"
        h1="Därför får du inte svar på dina ansökningar"
        varde={
          <>
            Allt fler rekryterare låter rekryteringssystem sålla kandidater automatiskt, ofta utan att du vet om det.{' '}
            <b>Är ditt CV inte optimerat når det aldrig en människa.</b> Vi ser till att du tar dig förbi: träning inför
            urvalstestet, ett CV som rekryteringssystemen (ATS) läser och ett personligt brev som svarar på annonsen.
          </>
        }
        knappar={
          <>
            <Knapp href="/register" pil data-cta="hero-primary">
              Skapa konto gratis
            </Knapp>
            <TextLank href="#tre-verktyg">Se hur det fungerar</TextLank>
          </>
        }
        brickor={brickor}
        bild={<Kollage />}
      />

      {/* 2. Mediebevisen, tyst */}
      <Sektion botten="papper" luft="tat" aria-label="Medier som skrivit om rekryteringssystemen">
        <div className="st-media">
          <small>Rekryteringssystemen beskrivna av</small>
          {MEDIER.map((m) => (
            <b key={m.kalla}>{m.kalla}</b>
          ))}
        </div>
      </Sektion>

      {/* 3. Tre verktyg som öar, rekryteringstesterna först */}
      <Sektion id="tre-verktyg">
        <SektionHuvud
          etikett="Vägen till intervjun"
          rubrik="Tre verktyg som gör ansökan starkare"
          varde="Först urvalstestet som avgör vem som får intervjun. Sedan ett CV som kommer igenom, och jobben du annars hade missat. Allt i samma konto."
        />
        <div className="st-oar">
          <O
            id="tester"
            farg="tran"
            etikett="Inför urvalstestet"
            rubrik="Rekryteringstester"
            varde={
              <>
                <b>Känn igen uppgiften innan provdagen.</b> Logik, verbalt och numeriskt i tre nivåer med förklaring efter
                varje uppgift, och personlighetstestet som visar vad rekryteraren läser ut av dig.
              </>
            }
            knappar={
              <>
                <Knapp href="/verktyg/rekryteringstester" variant="vit">
                  Så fungerar det
                </Knapp>
                <GratisRad chip={<Chip typ="vagg">Gratis</Chip>}>{storForst(GRUNDNIVAN_ALLA)} och personlighetstestet</GratisRad>
              </>
            }
            bild={
              <div className="st-testram">
                <Testram />
              </div>
            }
          >
            <p>
              {`${storForst(TESTTYPER_ORD)} testtyper i tre nivåer, från matrislogik till talserier, i samma format som de stora testleverantörerna använder. Grundnivån visar var du står i varje typ, träningen följer din nivå och lägger tiden där du tappar, och övningsprovet går mot klockan som det skarpa testet. Personlighetstestet ger din profil, hur den läses mot vanliga kravprofiler och frågorna du lär få på intervjun, med förslag på svar. Fem frågor provar du utan konto.`}
            </p>
          </O>

          <O
            farg="cv"
            vand
            etikett="Inför ansökan"
            rubrik="CV-analys"
            varde={
              <>
                <b>Vet exakt varför CV:t inte får svar.</b> En läsbarhetspoäng av 100 och vad som saknas, del för del,
                utmärkt direkt på ditt CV.
              </>
            }
            knappar={
              <>
                <Knapp href="/verktyg/cv-analys" variant="vit">
                  Så fungerar det
                </Knapp>
                <GratisRad chip={<Chip typ="vagg">Gratis</Chip>}>Poängen och genomgången, för varje CV</GratisRad>
              </>
            }
            bild={<CvArk poang={{ tal: EXEMPEL_POANG, text: 'av 100 i dag' }} ariaLabel="Exempel: Sara Lindströms CV med analysens sju delar utmärkta" />}
          >
            <p>
              Ladda upp som PDF eller Word. Vi går igenom CV:t i sju delar, från kontaktuppgifter till datum, ordning och
              längd, och räknar en läsbarhetspoäng av 100. Du ser var varje tappad poäng sitter och vad som saknas.
              Jobbcoachen föreslår nya formuleringar, och poängen räknas om när du sparar.
            </p>
          </O>

          <O
            farg="jobb"
            etikett="Jobben du annars missar"
            rubrik="Jobbmatchning"
            varde={
              <>
                <b>Jobben du annars hade missat.</b> Din kompetens matchad mot annonserna i Platsbanken, med skälen utskrivna.
              </>
            }
            knappar={
              <>
                <Knapp href="/verktyg/jobbmatchning" variant="vit">
                  Så fungerar det
                </Knapp>
                <GratisRad chip={<Chip typ="vagg">Gratis</Chip>}>{`${storForst(talOrd(FREE_TIER_JOB_LIMIT))} träffar, med skälen utskrivna`}</GratisRad>
              </>
            }
            bild={<MatchadeJobb topp={false} fler={SARA_FLER_TRAFFAR.slice(0, 1)} ariaLabel="Exempel: två träffar i Matchade jobb" />}
          >
            <p>
              {`Den som söker på sin vanliga yrkestitel missar jobben som efterfrågar samma kompetens under ett annat namn. Vi utgår från det du kan och visar de ${JOB_MATCHES_PER_RUN} bästa träffarna med skälen utskrivna. Annonserna hämtas tre gånger per dygn, och du söker om med ett tryck när du vill se de senaste. Från en träff skriver du brevet, sparar annonsen till Ska sökas eller markerar den som sökt.`}
            </p>
          </O>
        </div>
      </Sektion>

      {/* 4. Brevet */}
      <Sektion luft="utan-topp">
        <O
          id="sa-jobbar-vi"
          farg="brev"
          vand
          etikett="Så jobbar vi"
          rubrik="Vi matchar din erfarenhet mot tjänstens krav"
          rubrikNiva="h2"
          varde="Klistra in en jobbannons, eller välj en träff. Vi läser ditt CV, identifierar vad tjänsten kräver och väver in din egen erfarenhet i ett personligt brev som faktiskt bevisar att du passar."
          knappar={
            <>
              <Knapp href="/skapa-brev/start">Skriv ett brev gratis</Knapp>
              <GratisRad>{GRATISBREV}</GratisRad>
            </>
          }
          bild={<Brevpar ariaLabel="Exempel: en annons och det personliga brevet som svarar på dess krav" />}
        >
          {/* K4 med SEO:s lydelse (slutbeskedet, avsnitt 2): namnen och talet ur brevets katalog. */}
          <p>{`Brevet får samma mall som ditt CV, så att ansökan hänger ihop. Du väljer bland ${BREV_MALL_ANTAL} mallar, där ${BREV_GRATIS_NAMN} är gratis, och fem toner.`}</p>
        </O>
      </Sektion>

      {/* 5. Jobbcoachen */}
      <Sektion botten="papper" farg="jobb">
        <div className="st-tva">
          <SektionHuvud
            etikett="Hela vägen"
            rubrik="Jobbcoachen svarar hela vägen"
            varde="Lön, intervjufrågor, avtal och avslag, utifrån svensk arbetsmarknad och med källor du kan kolla själv. Inte från en amerikansk mall."
          >
            <p className="p3-text">
              Fråga vad du vill om lön, intervju, uppsägningstid eller hur du svarar på ett avslag. Jobbcoachen känner till
              din målroll, ort och bransch och de dokument du själv delar i samtalet, och föreslår frågor utifrån läget i
              dina sökta tjänster.
            </p>
            <div className="p3-knapprad">
              <Knapp href="/verktyg/jobbcoachen">Ställ första frågan</Knapp>
              <span className="p3-liten">{`${storForst(talOrd(FREE_CHAT_MESSAGES_PER_ACCOUNT))} meddelanden gratis`}</span>
            </div>
          </SektionHuvud>
          <div className="st-samtal">
            <Samtal meddelanden={COACH_SAMTAL} forslag={COACH_FORSLAG} />
          </div>
        </div>
      </Sektion>

      {/* 6. Medierna på mörk yta: indigo, sidans färg (grafiten finns inte publikt längre). */}
      <Sektion>
        <O farg="tran" rubrikNiva="h2" etikett="Bekräftat av medierna" ikon={false} rubrik="Robotarna har redan läst ditt CV.">
          <p className="p3-varde">
            Sveriges största redaktioner har samma slutsats: rekryteringen har förändrats i grunden. Den första som läser din
            ansökan är inte en människa.
          </p>
          <ul className="st-press">
            {MEDIER.map((m) => (
              <li key={m.kalla}>
                <b>{m.kalla}</b>
                <strong>{m.rubrik}</strong>
                <span>{m.text}</span>
                <a href={m.url} target="_blank" rel="noopener noreferrer">
                  {m.domän}, öppnas i ny flik
                </a>
              </li>
            ))}
          </ul>
          <p className="st-press-efter">
            <Link className="p3-lank" href="/priser">
              Så hjälper vi dig komma förbi
            </Link>
          </p>
        </O>
      </Sektion>

      {/* 7. Resten av jobbsöket: Sökta tjänster som eget block, sedan länkbrickorna */}
      <Sektion luft="utan-topp">
        <SektionHuvud rubrik="Och resten av jobbsöket" />
        <div className="st-resten">
          <O
            farg="jobb"
            etikett="Sökta tjänster"
            rubrik="Håll koll på var varje ansökan står"
            varde={`Spara annonsen du ska söka, logga jobbet du har sökt och se när det är dags att höra av sig. Veckans mål håller farten uppe, och efter ${TYSTA_DAGAR} tysta dagar skriver vi utkastet till det första uppföljningsmejlet.`}
            knappar={
              <>
                <Knapp href="/verktyg/sokta-tjanster" variant="vit">
                  Så fungerar Sökta tjänster
                </Knapp>
                <GratisRad chip={<Chip typ="vagg">Gratis för alla med konto</Chip>} />
              </>
            }
            bild={
              <Stig
                sokt={{ namn: 'Sökt', under: '2 väntar svar' }}
                tyst={`tyst i ${NO_RESPONSE_NUDGE_DAYS} dagar`}
                ariaLabel={`Exempel: sökta tjänster på väg från Ska sökas till Erbjudande. Två väntar svar, och en av dem har varit tyst i ${TYSTA_DAGAR} dagar.`}
              />
            }
          >
            <p aria-hidden="true">
              <span className="st-veckomal">
                <i className="st-k" />
                <i className="st-k" />
                <i />
                Veckans mål: 2 av 3 sökta
              </span>
            </p>
          </O>
          <Rutnat kolumner={4} className="st-brickor">
            {RESTEN.map((l) =>
              l.matning ? (
                <Link key={l.href} href={l.href} className="p3-lankbricka" data-p3-farg={l.farg} data-matning={l.matning}>
                  <Dorr ikon={l.farg} />
                  <b>{l.rubrik}</b>
                  <span>{l.text}</span>
                </Link>
              ) : (
                <LankBricka key={l.href} href={l.href} rubrik={l.rubrik} text={l.text} farg={l.farg} />
              ),
            )}
          </Rutnat>
        </div>
      </Sektion>

      {/* 8. Premium */}
      <Sektion luft="utan-topp">
        <PremiumO
          id="premium"
          rubrik={`Allt i ${paketKort()}`}
          text="Alla verktyg, alla nivåer, alla mallar. Mindre än en lunch i månaden, säg upp när du vill."
          punkter={HELA_PAKETET_RADER}
          knapp={{ text: kopKnapp(), href: '/priser' }}
          not="Kortbetalning via Stripe. Kvitto på mejl."
        />
      </Sektion>

      {/* 9. Frågorna */}
      <Sektion luft="utan-topp">
        <div className="st-faq">
          <Faq
            rubrik="Svaren på det du undrar"
            fragor={START_FAQ}
            efter={
              <div className="p3-knapprad">
                <Knapp href="/register">Skapa konto gratis</Knapp>
                <span className="p3-liten">
                  Fler frågor om priset? <TextLank href="/priser">Se priserna</TextLank>
                </span>
              </div>
            }
          />
        </div>
      </Sektion>

      <FastKnapprad text="Skapa konto gratis" href="/register" observera="hjalte" />
      <TeaserMatare page="/" />
    </Sida>
  )
}
