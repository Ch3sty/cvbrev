/**
 * /verktyg/linkedin-optimering i publikt omgång 3 (skissen linkedin,
 * docs/design/publikt-omgang3/sidor/linkedin.html), byggd med grundens
 * komponenter (src/components/publikt/v3). h1, title och description är
 * oförändrade. SEO:s besked på skisserna avsnitt 9: steg 2 säger att Om mig
 * och Erfarenhet behövs, "De flesta använder färre än 30" är ersatt, och
 * HowTo-stegen i schemat är nu ordagrant de synliga.
 *
 * Verktyget är bara Premium (src/lib/access/features.ts, FEATURES.linkedin);
 * exemplet här visas utan konto.
 */
import {
  Sida,
  Hjalte,
  Lyft,
  Sektion,
  SektionHuvud,
  Rutnat,
  Kort,
  Chip,
  Nr,
  Faq,
  PremiumO,
  Knapp,
  Knapprad,
  TextLank,
  Svav,
  Ikon,
  LankBricka,
} from '@/components/publikt/v3'
import LinkedinOptimeringLiveDemo, { POANG_RUBRIK, Profil, RubrikEfter, SARA_RUBRIK_FORE } from './components/LinkedinOptimeringLiveDemo'
import { LINKEDIN_OPTIMERING_FAQ_ITEMS } from './components/linkedin-optimering-faq-data'
import RedirectLoggedIn from '@/components/auth/RedirectLoggedIn'
import { PLAN_BY_KEY, SALD_PLAN, paketMedPris, paketNamn } from '@/lib/plans/plans'
import { TEMPLATE_COUNT } from '@/lib/cv/template-antal'
import { MALL_KATALOG } from '@/lib/cv/mallar/katalog'
import { lista } from '@/components/cv/Dokument/texter'
import './linkedin.css'

/** Gratismallarnas namn ur katalogen (Linne och Björk i dag). */
const GRATIS_MALLAR = lista(MALL_KATALOG.filter((m) => m.niva === 'gratis').map((m) => m.namn))

/** Stegen: rubrik i schemat och på sidan, texten ordagrant samma i båda (SEO avsnitt 9). */
const STEG = [
  {
    name: 'Hämta din profiltext från LinkedIn',
    text: 'Kopiera din nuvarande rubrik, om mig-text och erfarenhet från LinkedIn. Har du sparat ett CV hos oss fyller vi i fälten åt dig i stället.',
  },
  {
    name: 'Klistra in i fem fält',
    text: 'Klistra in texten i fälten Rubrik, Om mig, Erfarenhet, Utbildning och Kompetenser, eller välj ditt sparade CV som källa. Om mig och Erfarenhet behövs, resten är valfritt. Profilen skrivs på svenska eller engelska, det väljer du själv.',
  },
  {
    name: 'Vi optimerar fem sektioner samtidigt',
    text: 'Vi bearbetar alla fem sektioner parallellt med svensk arbetsmarknad som ram, branschens sökord och anpassning för rekryteringssystem. Det tar 30 till 60 sekunder.',
  },
  {
    name: 'Jämför före och efter',
    text: 'Din nuvarande text står bredvid den optimerade. För varje sektion ser du poängen före och efter och exakt vad som ändrats. Inget händer som du inte godkänt.',
  },
  {
    name: 'Kopiera tillbaka till LinkedIn',
    text: 'En knapp kopierar alla sektioner eller en i taget. Du klistrar in på LinkedIn själv och sparar. Vi rör aldrig din profil.',
  },
]

/** Sektionerna, med Saras exempelpoäng före och efter (aria-hidden). */
const SEKTIONER = [
  { rubrik: 'Rubrik, högst 220 tecken', text: 'Vi bygger en rubrik med yrkesroll, specialområden och målgrupp. Är fältet tomt skriver vi en från grunden utifrån din erfarenhet.', fore: POANG_RUBRIK.fore, efter: POANG_RUBRIK.efter },
  { rubrik: 'Om mig, 250 till 350 ord', text: 'Visar den röda tråden i din karriär: varifrån du kommer, vad du gör nu och vart du är på väg. Tonen anpassas efter om du är junior, erfaren eller senior.', fore: 41, efter: 89 },
  { rubrik: 'Erfarenhet i STAR-format', text: 'Skriver om varje roll som situation, uppgift, handling och resultat. Vi börjar med handlingsverb och sätter siffror där det går. Ingenting hittas på.', fore: 38, efter: 84 },
  { rubrik: 'Utbildning, valfritt', text: 'Ger den som är junior en utbyggd version med examensarbete och relevanta kurser. Den som är senior får en kort lista som inte tar fokus från yrkeserfarenheten.', fore: 55, efter: 80 },
  { rubrik: 'Kompetenser i 3 till 4 grupper', text: 'Samlar dina kompetenser i tematiska grupper och lyfter dem som matchar målrollen. Tomma modeord som "lagspelare" rensas bort.', fore: 46, efter: 88 },
]

const VARFOR = [
  { rubrik: 'Rekryterare söker på sökord', text: 'Rekryterare hittar inte kandidater genom att bläddra bland miljontals profiler. De söker. Saknar profilen de branschord rekryteraren skriver i sökrutan dyker du aldrig upp i resultatet.' },
  // SEO avsnitt 9: "De flesta använder färre än 30" har inget belägg.
  { rubrik: 'Rubriken avgör om du visas', text: 'Du har 220 tecken till rubriken på LinkedIn. Många använder bara en bråkdel av dem. En rubrik som bara säger "Marknadsförare" rankar lågt mot mer specifika sökningar som "B2B-marknadsförare SaaS Stockholm".' },
  { rubrik: 'Algoritmen belönar fullständighet', text: 'LinkedIns algoritm prioriterar profiler som är kompletta: rubrik, om mig, erfarenhet, utbildning och kompetenser. En halvfärdig profil hamnar längre ner i sökresultatet, oavsett hur duktig du är.' },
]

const LAGEN = [
  {
    rubrik: 'Stå ut i mängden',
    chip: 'Bred',
    text: 'Välj det när du är öppen för flera typer av roller i din bransch. Vi bygger en bred profil som syns i många olika rekryterarsökningar. Ingen enskild roll låser profilen, men sökorden håller dig synlig för flera arbetsgivare och nischer.',
  },
  {
    rubrik: 'Sikta på en specifik roll',
    chip: 'Skarp',
    text: 'Välj det när du vet exakt vilken titel du går efter. Du skriver in målrollen, till exempel "Senior backendutvecklare" eller "Marknadschef B2B SaaS", och vi anpassar rubrik, om mig och erfarenhet till det språk rekryterare använder för just den tjänsten och dess senioritet. Du kan göra om optimeringen mot en annan roll senare.',
  },
]

function Sokfalt({ children }: { children: string }) {
  return (
    <div className="lnk-sokfalt">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="6.5" />
        <path d="M16 16l4.5 4.5" />
      </svg>
      {children}
    </div>
  )
}

/** Stegens små bilder (aria-hidden). */
function StegBild({ nr }: { nr: number }) {
  if (nr === 0) {
    return (
      <div className="lnk-b-kopiera">
        <i className="lnk-v" style={{ width: '70%' }} />
        <i className="lnk-v" />
        <i className="lnk-v" style={{ width: '88%' }} />
        <i style={{ width: '60%' }} />
        <i style={{ width: '82%' }} />
      </div>
    )
  }
  if (nr === 1) {
    return (
      <div className="lnk-b-falt">
        <span>
          Rubrik <em>valfritt</em>
        </span>
        <span className="lnk-kr">Om mig</span>
        <span className="lnk-kr">Erfarenhet</span>
        <span>
          Utbildning <em>valfritt</em>
        </span>
        <span>
          Kompetenser <em>valfritt</em>
        </span>
      </div>
    )
  }
  if (nr === 2) {
    return (
      <div className="lnk-b-pass">
        {[
          ['Rubrik', 100],
          ['Om mig', 82],
          ['Erfarenhet', 64],
          ['Utbildning', 90],
          ['Kompetenser', 74],
        ].map(([namn, bredd]) => (
          <div key={namn}>
            {namn}
            <span className="p3-stapel p3-koppar">
              <i style={{ width: `${bredd}%` }} />
            </span>
          </div>
        ))}
      </div>
    )
  }
  if (nr === 3) {
    return (
      <div className="lnk-b-jamfor">
        <div>
          <b>{POANG_RUBRIK.fore}</b>Före
          <i />
          <i style={{ width: '60%' }} />
        </div>
        <div>
          <b>{POANG_RUBRIK.efter}</b>Efter
          <i />
          <i />
          <i style={{ width: '70%' }} />
        </div>
      </div>
    )
  }
  return (
    <div className="lnk-b-tillbaka">
      <span>
        <Ikon namn="bock" />
        Alla sektioner kopierade
      </span>
      <small>Du klistrar in och sparar själv</small>
    </div>
  )
}

/** Bilderna på skälen (aria-hidden). */
function VarforBild({ nr }: { nr: number }) {
  if (nr === 0) {
    return (
      <div className="lnk-vbild" aria-hidden="true">
        <Sokfalt>projektledare LOU</Sokfalt>
        <div className="lnk-vtraff">Projektledare bygg | LOU, budget</div>
        <div className="lnk-vtraff">Projektledare | Upphandling enligt LOU</div>
        <div className="lnk-mellan">⋮</div>
        <div className="lnk-vtraff lnk-ej">{SARA_RUBRIK_FORE}</div>
      </div>
    )
  }
  if (nr === 1) {
    return (
      <div className="lnk-vbild" aria-hidden="true">
        <div className="lnk-tk">
          &quot;Marknadsförare&quot; <span>14 av 220</span>
        </div>
        <div className="p3-stapel lnk-gra-stapel">
          <i style={{ width: '6.4%' }} />
        </div>
        <div className="lnk-tk" style={{ marginTop: 10 }}>
          Yrkesroll, specialområden, målgrupp <span>144 av 220</span>
        </div>
        <div className="p3-stapel p3-koppar">
          <i style={{ width: '65.5%' }} />
        </div>
      </div>
    )
  }
  return (
    <div className="lnk-vbild" aria-hidden="true">
      <div className="lnk-fem">
        <span className="lnk-pa">1</span>
        <span className="lnk-pa">2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
      </div>
      <small>Två av fem sektioner ifyllda</small>
    </div>
  )
}

/** Valkortens bilder (aria-hidden). */
function LageBild({ nr }: { nr: number }) {
  if (nr === 0) {
    return (
      <div className="lnk-valbild" aria-hidden="true">
        <small>Rubriken blir</small>
        <div className="lnk-rub">Projektledare inom energi, bygg och infrastruktur | Upphandling, budget, tidplan</div>
        <small>Syns i sökningar på</small>
        <div className="lnk-ordrad">
          {['projektledare', 'byggprojektledare', 'uppdragsledare', 'projektchef'].map((o) => (
            <span key={o} className="lnk-pa">
              {o}
            </span>
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className="lnk-valbild" aria-hidden="true">
      <small>Du skriver in målrollen</small>
      <div className="lnk-malroll">
        Projektchef, energi <em>används för sökord och ton</em>
      </div>
      <small>Rubriken blir</small>
      <div className="lnk-rub">Projektchef energi | Offentlig upphandling enligt LOU | Leder ombyggnader upp till 42 miljoner</div>
      <div className="lnk-ordrad">
        <span className="lnk-pa">projektchef energi</span>
        <span>projektledare</span>
        <span>uppdragsledare</span>
      </div>
    </div>
  )
}

export default function LinkedinOptimeringSida() {
  // Inloggade hör hemma i verktyget, inte på säljsidan (C2).

  // === Schema.org markup ===

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Jobbcoach.ai LinkedIn-optimering',
    url: 'https://www.jobbcoach.ai/verktyg/linkedin-optimering',
    description:
      'Optimera din LinkedIn-profil för rekryterares sökningar. Vi förbättrar rubrik, om-mig, erfarenhet, utbildning och kompetenser samtidigt. Du klistrar in din text och får en optimerad version tillbaka, vi loggar aldrig in på din LinkedIn.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web browser',
    offers: {
      '@type': 'Offer',
      price: String(PLAN_BY_KEY[SALD_PLAN].amount),
      priceCurrency: 'SEK',
      description: `Ingår i ${paketMedPris(SALD_PLAN)}`,
    },
    featureList:
      'Optimering av rubrik, om-mig, erfarenhet, utbildning och kompetenser, poäng före och efter per sektion, två lägen (stå ut eller specifik roll), CV-autofyll från sparat CV, kopiera och klistra in utan LinkedIn-inloggning, STAR-format på erfarenhet, anpassning för rekryteringssystem (ATS) med branschens nyckelord',
  }

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Så optimerar du din LinkedIn-profil med Jobbcoach.ai',
    description:
      'Fem steg från din nuvarande profiltext till uppdaterad LinkedIn-profil: hämta din profiltext, klistra in eller välj sparat CV, vi optimerar fem sektioner, jämför före och efter, kopiera tillbaka till LinkedIn.',
    totalTime: 'PT5M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'SEK',
      value: String(PLAN_BY_KEY[SALD_PLAN].amount),
    },
    step: STEG.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.name, text: s.text })),
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: LINKEDIN_OPTIMERING_FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }

  return (
    <Sida farg="cv">
      <RedirectLoggedIn to="/dashboard/linkedin-optimizer" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div id="innehall">
        {/* 1. Hjälten: rekryterarens sökruta och Saras profil efter */}
        <Hjalte
          id="hjalte"
          brodsmulor={[
            { name: 'Hem', href: '/' },
            { name: 'Verktyg', href: '/funktioner' },
            { name: 'LinkedIn-optimering', href: '/verktyg/linkedin-optimering' },
          ]}
          etikett="LinkedIn-optimering, syns när rekryteraren söker"
          h1="Hamna i rekryterarnas sökresultat på LinkedIn"
          varde={
            <>
              Du klistrar in din profiltext, vi optimerar fem sektioner samtidigt och ger dig en bättre version att klistra tillbaka.{' '}
              <b>Vi loggar aldrig in på din LinkedIn, du behåller full kontroll.</b>
            </>
          }
          knappar={
            <>
              <Knapp href="/register" pil>
                Optimera min profil
              </Knapp>
              <TextLank href="#sa-funkar-det">Så fungerar det</TextLank>
            </>
          }
          brickor={[
            { tal: '0', text: 'inloggningar på din LinkedIn' },
            { tal: '5', text: 'sektioner samtidigt' },
            { tal: '5 min', text: 'tills profilen är uppdaterad' },
          ]}
          bild={
            <div className="lnk-instr" role="img" aria-label="Exempel: Sara Lindströms profil efter omskrivningen, med orden en rekryterare söker på utmärkta">
              <Svav className="lnk-sok" gungar>
                <small>Rekryteraren söker</small>
                <Sokfalt>projektledare LOU Göteborg</Sokfalt>
              </Svav>
              <Profil rubrik={<RubrikEfter />} om={<p>Jag leder ombyggnader och energiprojekt åt offentliga beställare.</p>} />
              <Svav className="lnk-poang" stor={POANG_RUBRIK.efter} under={`Exempel: i profilpoäng efter, ${POANG_RUBRIK.fore} före`} gungar sen />
            </div>
          }
          lyft
        >
          <p className="p3-liten">Ingår i {paketMedPris(SALD_PLAN)}. Exemplet här nedanför ser du utan konto.</p>
        </Hjalte>

        {/* 2. Före och efter i stor skala (ett stycke, ingen H2) */}
        <Lyft id="exempel" etikett="Exempel, före och efter">
          <LinkedinOptimeringLiveDemo />
        </Lyft>

        {/* 3. Så fungerar det: fem steg som kort, tre plus två */}
        <Sektion id="sa-funkar-det">
          <SektionHuvud
            etikett="Fem steg, fem minuter"
            rubrik="Så fungerar det"
            varde="Inga inloggningar på LinkedIn och ingen automatisk publicering. Du kopierar in, vi optimerar, du kopierar tillbaka. Klart på fem minuter."
          />
          <ol className="lnk-steg5">
            {STEG.map((s, i) => (
              <li key={s.name}>
                <div className="lnk-huvud">
                  <Nr typ={i === STEG.length - 1 ? 'koppar' : 'ton'}>{i + 1}</Nr>
                  <h3 className="p3-h3">{s.name}</h3>
                </div>
                <div className="lnk-b" aria-hidden="true">
                  <StegBild nr={i} />
                </div>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
          <Knapprad className="lnk-efter">
            <Knapp href="/register" variant="vit">
              Optimera min profil
            </Knapp>
          </Knapprad>
        </Sektion>

        {/* 4. Fem sektioner i ett pass */}
        <Sektion botten="ton" id="vad-vi-optimerar">
          <SektionHuvud
            etikett="Vad vi optimerar"
            rubrik="Fem sektioner i ett pass"
            varde="Vi optimerar alla fem sektioner samtidigt, med samma röda tråd genom hela profilen. För varje sektion ser du poängen före och efter, så du vet exakt vad som blev bättre."
          >
            <span className="lnk-passtid">
              <i aria-hidden="true" />
              Ett pass, 30 till 60 sekunder
            </span>
          </SektionHuvud>
          <div className="lnk-pass">
            <div className="lnk-passark" role="img" aria-label="Exempel: Saras profil med de fem sektionerna utmärkta, rubrik, om mig, erfarenhet, utbildning och kompetenser, sammanbundna av en tråd">
              <div className="lnk-del">
                <span className="lnk-pn">1</span>
                <small>Rubrik</small>
                <p className="lnk-t">Projektledare inom energi och bygg | Offentlig upphandling enligt LOU, budgetansvar, tidplan</p>
              </div>
              <div className="lnk-del">
                <span className="lnk-pn">2</span>
                <small>Om mig</small>
                <p className="lnk-t">Jag leder ombyggnads- och energiprojekt åt offentliga beställare.</p>
                <i className="lnk-l" />
                <i className="lnk-l lnk-m" />
                <i className="lnk-l lnk-k" />
              </div>
              <div className="lnk-del">
                <span className="lnk-pn">3</span>
                <small>Erfarenhet</small>
                <div className="lnk-rad">
                  Projektledare, Nordanvind Energi <span>2021 – nu</span>
                </div>
                <i className="lnk-l lnk-m" />
                <i className="lnk-l" />
                <div className="lnk-rad">
                  Biträdande projektledare, Halda Logistik <span>2018 – 2021</span>
                </div>
                <i className="lnk-l lnk-k" />
              </div>
              <div className="lnk-del">
                <span className="lnk-pn">4</span>
                <small>Utbildning</small>
                <div className="lnk-rad">
                  Civilingenjör, industriell ekonomi <span>2013 – 2018</span>
                </div>
              </div>
              <div className="lnk-del">
                <span className="lnk-pn">5</span>
                <small>Kompetenser</small>
                <div className="lnk-grupper">
                  {['Projektledning', 'Tidplan', 'Budgetansvar', 'LOU', 'Förfrågningsunderlag', 'AMA', 'Entreprenadjuridik', 'AB 04'].map((k) => (
                    <span key={k}>{k}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="lnk-sektrader">
              {SEKTIONER.map((s, i) => (
                <div key={s.rubrik} className="lnk-sektrad">
                  <Nr typ="koppar">{i + 1}</Nr>
                  <h3 className="p3-h3">{s.rubrik}</h3>
                  <p>{s.text}</p>
                  <div className="lnk-matt" aria-hidden="true">
                    <s>{s.fore}</s>
                    <span className="lnk-stapel">
                      <u style={{ width: `${s.fore}%` }} />
                      <i style={{ width: `${s.efter}%` }} />
                    </span>
                    <span>{s.efter}</span>
                  </div>
                </div>
              ))}
              <p className="p3-liten">Poängen är Saras, som exempel: mörkt före, ljust efter.</p>
            </div>
          </div>
        </Sektion>

        {/* 5. Varför du inte syns i dag: ön med tre kort */}
        <Sektion id="varfor">
          {/* Ön ritad som vägg: på .p3-o vinner öns ljusa rubrikfärg över
              kortets bläck (onskemal.md), på .p3-vagg gör den inte det. */}
          <div className="p3-vagg lnk-varfor">
            <SektionHuvud
              etikett="Bakgrunden"
              rubrik="Varför du inte syns i dag"
              varde={
                <>
                  Du är inte osynlig. <b>Din profil talar bara inte samma språk som rekryterarens sökruta.</b>
                </>
              }
            />
            <Rutnat kolumner={3}>
              {VARFOR.map((v, i) => (
                <Kort key={v.rubrik}>
                  <VarforBild nr={i} />
                  <h3 className="p3-h3">{v.rubrik}</h3>
                  <p>{v.text}</p>
                </Kort>
              ))}
            </Rutnat>
          </div>
        </Sektion>

        {/* 6. Bred eller skarp inriktning: två valkort */}
        <Sektion botten="papper" id="tva-lagen">
          <SektionHuvud
            etikett="Två lägen"
            rubrik="Bred eller skarp inriktning"
            varde="Du väljer läge i steg ett och kan göra om optimeringen i det andra läget när som helst om du byter strategi."
          />
          <div className="lnk-val2">
            {LAGEN.map((l, i) => (
              <div key={l.rubrik} className={`lnk-valkort ${i === 0 ? 'lnk-vald' : ''}`.trim()}>
                <div className="lnk-topp">
                  <span className="lnk-ring" aria-hidden="true" />
                  <h3 className="p3-h3">{l.rubrik}</h3>
                  <Chip>{l.chip}</Chip>
                </div>
                <LageBild nr={i} />
                <p>{l.text}</p>
              </div>
            ))}
          </div>
        </Sektion>

        {/* 7. Premium och länkbrickorna */}
        <Sektion id="premium">
          <PremiumO
            rubrik="Sluta vara osynlig. Börja synas i dag."
            text={`LinkedIn-optimeringen ingår i ${paketNamn(SALD_PLAN)}, tillsammans med alla CV-mallar, CV-analysens alla förslag, personliga brev utan tak och rekryteringstesterna. Säg upp när du vill. Vi loggar aldrig in på din LinkedIn, du klistrar in texten själv.`}
            uppsagning
            knapp={
              <>
                <Knapp href="/register">Optimera min profil</Knapp>
                <TextLank href="#sa-funkar-det">Se hur det fungerar</TextLank>
              </>
            }
            not="Utan Premium ser du exemplet här på sidan och kan skapa ett konto, men inte köra optimeringen på din egen profil."
            punkter={[
              'LinkedIn-profilen omskriven, i båda lägena och så ofta du vill',
              `${TEMPLATE_COUNT} CV-mallar och CV-analysens alla förslag`,
              'Rekryteringstester, personliga brev och jobbmatchning',
            ]}
          />
          <p className="p3-ey lnk-mer-ey">Mer för ditt CV</p>
          <div className="lnk-mer3">
            <LankBricka href="/verktyg/cv-analys" farg="cv" rubrik="CV-analys" text="Läsbarhetspoäng i sju delar, gratis för varje CV" />
            <LankBricka href="/verktyg/skapa-cv" farg="cv" rubrik="Skapa CV" text="Skriv direkt på arket" />
            <LankBricka href="/cv-mallar" farg="cv" rubrik="CV-mallar" text={`${TEMPLATE_COUNT} mallar, ${GRATIS_MALLAR} gratis`} />
          </div>
        </Sektion>

        {/* 8. Frågorna */}
        <Sektion luft="utan-topp" id="fragor">
          <Faq
            rubrik="Vanliga frågor om LinkedIn-optimering"
            ingress={
              <>
                Hittar du inte svaret? Mejla{' '}
                <a href="mailto:support@jobbcoach.ai" className="p3-lank">
                  support@jobbcoach.ai
                </a>
                .
              </>
            }
            fragor={LINKEDIN_OPTIMERING_FAQ_ITEMS}
            efter={
              <Knapprad>
                <Knapp href="/register" pil>
                  Optimera min profil
                </Knapp>
              </Knapprad>
            }
          />
        </Sektion>
      </div>
    </Sida>
  )
}
