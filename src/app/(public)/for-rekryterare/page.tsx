/**
 * /for-rekryterare, publikt omgång 3 (P5a): grundens skal och komponenter
 * (BYGGBRIEF beslut 10, ingen egen skiss). Texten, rubrikerna (h1, nio h2,
 * alla h3 i samma ordning), frågorna, länkarna och schemablocken är samma
 * som i publikt v2. Ton: kollega till kollega, och kunskapsdelen heter
 * Insikter.
 *
 * Sektioner: hjälten på väggen med träffkortet och den verifierade
 * badgen, insidan med portalen och fem steg, därför funkar det, de
 * verifierade resultaten på en indigo vägg, så funkar det steg för steg,
 * två träffkort, hela profilen, integriteten på sidans mörkaste ton,
 * Insikter, frågorna och slutbandet. Serverrenderad rakt igenom.
 *
 * SEO: title, description och canonical i layout.tsx. Service (med Offer)
 * och FAQPage byggs här, oförändrade. Brödsmulan skriver inget schema
 * (som förut). Kandidaterna visas med percentil, nivå och villkor, aldrig
 * råpoäng eller lönespann.
 *
 * Träffkortet och profilen (Traffkort, Profilkort) är bilder av portalen
 * och har kvar sina egna klasser ur foretag.css; for-rekryterare.css ger
 * dem grundens kanter och toner.
 */
import Link from 'next/link'
import '@/components/publikt/innehall/foretag.css'
import { MatrisBricka } from '@/components/publikt/MatrisExpert'
import Traffkort from '@/components/publikt/innehall/Traffkort'
import { Sida, Hjalte, Sektion, SektionHuvud, Kort, Rutnat, VagSteg, Faq, PremiumO, Knapp, Knapprad, TextLank, LankBricka } from '@/components/publikt/v3'
import { getAllInsikterMeta } from '@/lib/blog'
import Profilkort from './components/Profilkort'
import { EXEMPEL, PORTAL, REDOVISNINGSEKONOM } from './components/kandidater'
import { REKRYTERARE_FAQ_ITEMS } from './components/rekryterare-faq-data'
import './for-rekryterare.css'

const REGISTRERA = '/rekryterare/registrera'

const INSIDAN = [
  {
    rubrik: 'Sök på kravprofilen',
    text: 'Varje ord måste träffa. Titelmatch väger tyngre än kompetens, och du ser alltid varför en kandidat rankas högst.',
  },
  {
    rubrik: 'Förhandsgranska utan att öppna',
    text: 'Peka på en rad så glider en sammanfattning in. Du bestämmer innan du lägger tid på hela profilen.',
  },
  {
    rubrik: 'Profilen som beslutsunderlag',
    text: 'Verifierade resultat med nivå och normgrupp, plus en arbetsstilsrapport som beskriver hur personen jobbar.',
  },
  {
    rubrik: 'Kandidaten tackade ja',
    text: 'Namn, kontaktväg, introduktionstips och en intervjuguide byggd på kandidatens styrkor låses upp.',
  },
  {
    rubrik: 'Ett arbetsflöde, inte en sökning',
    text: 'Jämför kandidater, bevaka kravprofilen och dela en maskerad profil med din rekryterande chef.',
  },
]

const VARDE = [
  {
    rubrik: 'Svarsvilliga kandidater',
    text: 'Alla i poolen har själva valt att synas och sagt ja till att bli kontaktade. När du visar intresse landar det hos någon som väntar på det, inte i en full inkorg.',
  },
  {
    rubrik: 'Verifierat före första kontakt',
    text: 'Percentiler på kognitiva tester per nivå, inte formuleringskonst i ett CV. Du ser vad kandidaten bevisat redan i sökögonblicket, innan ni ens hälsat.',
  },
  {
    rubrik: 'Bevakning på kravprofilen',
    text: 'Spara din sökning så mailar vi när nya kandidater matchar. Poolen växer varje vecka, och du behöver aldrig komma ihåg att söka igen.',
  },
  {
    rubrik: 'Budgetfilter utan löneexponering',
    text: 'Sålla bort omöjliga löneanspråk innan du tar kontakt. Kandidatens spann visas aldrig för dig, vi filtrerar bara på det, så ni båda slipper dödsdömda processer.',
  },
]

const SIFFROR = [
  {
    rubrik: 'Första försöket räknas',
    text: 'Verifierat resultat är kandidatens första slutförda försök på varje nivå. Aldrig det bästa av tjugo, för då mäter man tur, inte förmåga.',
  },
  {
    rubrik: 'Nivån syns alltid',
    text: 'Topp 10 % på expertnivån och topp 10 % på grundnivån är olika saker. Badgen säger alltid vilken nivå siffran gäller.',
  },
  {
    rubrik: 'Öppen normgrupp',
    text: '"Topp 8 % av 340 testade" betyder exakt det: jämfört med alla som gjort samma test hos oss, och du ser hur många de är.',
  },
  {
    rubrik: 'Färskhet framgår',
    text: 'Vi visar när testet gjordes. Resultat äldre än två år flaggas, så du vet om det är dags att be kandidaten testa igen.',
  },
]

const SA_FUNKAR = [
  {
    rubrik: 'Sök på kravprofilen',
    text: 'Skriv roll och nyckelkompetens, så rankar vi poolen efter relevans och visar varför varje kandidat matchar. Filtrera på senioritet, testresultat, budget och villkor.',
  },
  {
    rubrik: 'Samla i projekt och jämför',
    text: 'Spara de intressanta till ett projekt, sätt status och lägg egna anteckningar. Ställ två till fyra kandidater sida vid sida när du ska välja vilka du kontaktar först.',
  },
  {
    rubrik: 'Visa intresse, kandidaten svarar',
    text: 'Skicka en intresseförfrågan direkt från kortet. Tackar kandidaten ja låses namn, kontaktväg, introduktionstips och en skräddarsydd intervjuguide upp. Tackar hen nej förblir profilen anonym.',
  },
  {
    rubrik: 'Dela med din rekryterande chef',
    text: 'Skicka en maskerad, läsbar profil via en länk som håller i fjorton dagar. Din chef ser samma underlag som du, utan skärmdumpar i en chattråd.',
  },
]

const INTEGRITET = [
  {
    rubrik: 'Uttryckligt samtycke',
    text: 'Varje kandidat har aktivt valt att synas i poolen och kan dra tillbaka samtycket när som helst. Ingen skrapad data, inga överraskade kandidater.',
  },
  {
    rubrik: 'Anonym tills kandidaten säger ja',
    text: 'Namn, foto och kontaktuppgifter är dolda tills kandidaten accepterat er kontakt. Det skyddar kandidaten och ger dig svar från folk som faktiskt är intresserade.',
  },
  {
    rubrik: 'Kandidaten ser samma som du',
    text: 'Arbetsstilsrapporten kandidaten delar är exakt den du läser, inga dolda poäng. Den symmetrin gör att fler vågar visa upp sig, och att det du ser är något de själva står bakom.',
  },
  {
    rubrik: 'Visning, aldrig filtrering',
    text: 'Personlighetsdata visas för att du ska ställa bättre frågor, aldrig för att sortera eller sätta matchprocent. Vi bygger medvetet inom ramarna för GDPR och EU:s AI-förordning.',
  },
  {
    rubrik: 'Verifierade rekryterare',
    text: 'Vi godkänner varje rekryterarkonto manuellt mot organisationsnummer innan det får tillgång till poolen. Kandidaterna vet att bara riktiga företag ser dem.',
  },
  {
    rubrik: 'Inga rå-CV:n eller löneanspråk',
    text: 'Vi delar aldrig råa dokument, och kandidatens lönespann lämnar aldrig servern. Du ser strukturerade uppgifter som kandidaten godkänt för visning, varken mer eller mindre.',
  },
  {
    rubrik: 'Tydlig datahantering',
    text: 'En kandidat som stänger av sin synlighet försvinner direkt ur poolen, och drar hen tillbaka sitt konto raderas profilen. Som verifierat företag tecknar ni ett personuppgiftsbiträdesavtal med oss innan ni får tillgång.',
  },
]

/** Korten med h3 och stycke, på golv, papper eller vägg (Kort är alltid papper). */
function Punkter({ rader, kolumner = 2 }: { rader: readonly { rubrik: string; text: string }[]; kolumner?: 2 | 4 }) {
  return (
    <Rutnat kolumner={kolumner} som="ul" className="fr-punkter">
      {rader.map((r) => (
        <Kort key={r.rubrik} som="li">
          <h3 className="p3-h3">{r.rubrik}</h3>
          <p>{r.text}</p>
        </Kort>
      ))}
    </Rutnat>
  )
}

export default function ForRekryterareSida() {
  // === Schema.org markup ===
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Jobbcoach.ai kandidatpool för rekryterare',
    url: 'https://www.jobbcoach.ai/for-rekryterare',
    description:
      'Kandidatpool där varje profil har verifierade testresultat med percentiler. Anonymt tills kandidaten accepterar kontakt. Kostnadsfritt för verifierade rekryterare under lanseringsperioden.',
    serviceType: 'Rekryteringstjänst',
    areaServed: {
      '@type': 'Country',
      name: 'Sverige',
    },
    provider: {
      '@type': 'Organization',
      name: 'Jobbcoach.ai',
      url: 'https://www.jobbcoach.ai',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'SEK',
      description: 'Kostnadsfritt under lanseringsperioden för verifierade rekryterare',
    },
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: REKRYTERARE_FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }

  const insikter = getAllInsikterMeta()
    .slice(0, 6)
    .map((i) => ({ href: `/for-rekryterare/insikter/${i.slug}`, rubrik: i.title, text: i.description }))

  return (
    <Sida farg="neutral" className="fr-sida">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <main>
        {/* 1. Hjälten på väggen */}
        <Hjalte
          id="hjalte"
          brodsmulor={[
            { name: 'Hem', href: '/' },
            { name: 'För rekryterare', href: '/for-rekryterare' },
          ]}
          brodsmulorSchema={false}
          etikett="För rekryterare, tidig åtkomst"
          h1="Kandidater med bevisade färdigheter"
          varde="Sök på kravprofilen och få relevansrankade träffar med verifierade testresultat per nivå och en arbetsstilsrapport ur 120 frågor. Varje kandidat har själv valt att synas, så de som svarar är faktiskt intresserade."
          knappar={
            <>
              <Knapp href={REGISTRERA} pil data-primar="" data-cta="rekryterare-hero">
                Skapa rekryterarkonto
              </Knapp>
              <TextLank href="#sa-funkar-det">Så funkar det</TextLank>
            </>
          }
          bild={
            <div className="fr-hjaltebild">
              <p className="p3-ey">Exempel ur poolen</p>
              <Traffkort k={REDOVISNINGSEKONOM} />
              <div className="fr-verifierad" data-p3-farg="tran" aria-hidden="true">
                <span>Verifierat av oss</span>
                <b>Topp 10 %</b>
                <small>Matrislogik, expertnivå, första försöket</small>
              </div>
              <p className="p3-liten fr-hjaltenot">
                Avidentifierad tills kandidaten tackar ja till kontakt. Testresultaten är verifierade av oss.
              </p>
            </div>
          }
        >
          <ul className="fr-bevis">
            <li>Kostnadsfritt under lanseringen</li>
            <li>GDPR-först</li>
            <li>Ingen bindningstid</li>
          </ul>
        </Hjalte>

        {/* 2. Insidan: portalen och fem steg */}
        <Sektion id="insidan">
          <SektionHuvud
            etikett="Så här ser det ut på insidan"
            rubrik="Från sökning till anställning"
            varde="Det här är inte skärmdumpar. Det är portalen, byggd steg för steg så att du ser exakt hur en rekrytering går till hos oss."
          />
          <div className="fr-portal">
            <div className="if-webb fr-webb" aria-label="Exempel ur rekryterarportalen">
              <div className="if-webb-topp" aria-hidden="true">
                <i />
                <i />
                <i />
                <span>jobbcoach.ai/rekryterare</span>
              </div>
              <div className="if-webb-i">
                <div className="if-sok">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M20 20l-4-4" />
                  </svg>
                  {PORTAL.sokning}
                  <i aria-hidden="true" />
                </div>
                {PORTAL.rader.map((r) => (
                  <div key={r.rubrik} className={`if-rad-k ${r.vald ? 'if-vald' : ''}`.trim()}>
                    <i aria-hidden="true">{r.initial}</i>
                    <div>
                      <b>{r.rubrik}</b>
                      <span>{r.text}</span>
                    </div>
                    <em>{r.bricka}</em>
                  </div>
                ))}
              </div>
            </div>
            <ol className="fr-steg5">
              {INSIDAN.map((s, i) => (
                <li key={s.rubrik}>
                  <span className="p3-nr" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="p3-h3">{s.rubrik}</h3>
                    <p>{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Sektion>

        {/* 3. Därför funkar det */}
        <Sektion botten="papper">
          <SektionHuvud
            etikett="Därför funkar det"
            rubrik="Mindre gissning, mer träff"
            varde="Ett CV berättar vad någon säger sig kunna. Vi visar vad kandidaten har bevisat, och att hen faktiskt vill bli kontaktad."
          />
          <Punkter rader={VARDE} kolumner={4} />
        </Sektion>

        {/* 4. Verifierade resultat på en indigo vägg */}
        <Sektion botten="vagg" farg="tran">
          <div className="fr-tva">
            <div>
              <SektionHuvud
                etikett="Verifierade resultat"
                rubrik="Siffror som tål följdfrågor"
                varde="Ett testresultat är bara värt något om det håller för granskning. Så här räknar vi, öppet och utan genvägar."
              />
              <Punkter rader={SIFFROR} />
              <p className="fr-citat">Vi visar hellre en ärlig siffra än en imponerande.</p>
            </div>
            <div className="fr-badgar" aria-hidden="true">
              <div className="fr-badge">
                <span className="fr-badge-k">Matrislogik, expertnivå</span>
                <b>Topp 10 %</b>
                <span className="fr-badge-n">av 340 testade, första försöket</span>
                <div className="fr-badge-skala">
                  <i style={{ ['--p' as string]: '90%' }} />
                </div>
                <span className="fr-badge-d">Gjort i september 2026</span>
              </div>
              <div className="fr-badge fr-badge-2">
                <span className="fr-badge-k">Numeriskt, standardnivå</span>
                <b>Topp 15 %</b>
                <span className="fr-badge-n">av 890 testade, första försöket</span>
                <div className="fr-badge-skala">
                  <i style={{ ['--p' as string]: '85%' }} />
                </div>
              </div>
              <div className="fr-matris">
                <MatrisBricka className="" bredd={110} />
              </div>
            </div>
          </div>
        </Sektion>

        {/* 5. Så funkar det, steg för steg */}
        <Sektion id="sa-funkar-det">
          <SektionHuvud
            etikett="Så funkar det"
            rubrik="Så funkar det, steg för steg"
            varde="Inga mellanhänder och inga köpta kontaktlistor. Kandidaten bestämmer, du får svar som betyder något."
          />
          <VagSteg steg={SA_FUNKAR.map((s) => ({ rubrik: s.rubrik, text: s.text }))} />
          <Knapprad className="fr-efter">
            <Knapp href={REGISTRERA}>Ansök om tidig åtkomst</Knapp>
          </Knapprad>
        </Sektion>

        {/* 6. Träffkorten */}
        <Sektion botten="ton">
          <SektionHuvud
            etikett="Träffkorten"
            rubrik="Så ser en träff ut"
            varde="Allt du behöver för ett första beslut på ett kort: verifierade testresultat, styrkor, kompetenser och villkor. Identiteten skyddas tills kandidaten tackar ja."
          />
          <div className="if-kand-par">
            {EXEMPEL.map((k) => (
              <Traffkort key={k.roll} k={k} />
            ))}
          </div>
          <p className="p3-liten fr-not">
            Exempelprofiler. Kandidaterna i poolen är verkliga arbetssökande som själva valt att synas.
          </p>
        </Sektion>

        {/* 7. Hela profilen */}
        <Sektion>
          <SektionHuvud
            etikett="Hela profilen"
            rubrik="Så ser hela profilen ut"
            varde="Träffkortet är den första sorteringen. Ett klick öppnar hela profilen: kandidatens egen pitch, arbetshistorik, utbildning och verifierade testresultat. Namn och arbetsgivare låses upp först när kandidaten tackar ja, och just därför är de som svarar faktiskt intresserade."
          />
          <Profilkort />
          <p className="p3-liten fr-not">
            Exempelprofil med fiktiva uppgifter. Profilerna i poolen är verkliga arbetssökande som själva valt att synas.
          </p>
        </Sektion>

        {/* 8. Integriteten på sidans mörkaste ton */}
        <Sektion luft="utan-topp">
          <PremiumO
            className="fr-integritet"
            etikett="Byggt GDPR-först"
            rubrik="Integriteten är inte ett hinder. Den är produkten."
            text="Kandidater som känner sig trygga vågar synas, och svarar när du hör av dig. Därför är hela flödet designat runt samtycke."
            pris={false}
          >
            <ul className="fr-mork">
              {INTEGRITET.map((r) => (
                <li key={r.rubrik}>
                  <h3 className="p3-h3">{r.rubrik}</h3>
                  <p>{r.text}</p>
                </li>
              ))}
            </ul>
          </PremiumO>
        </Sektion>

        {/* 9. Insikter */}
        {insikter.length ? (
          <Sektion botten="papper">
            <div className="fr-rubrikrad">
              <SektionHuvud etikett="Insikter" rubrik="Kunskap som förbättrar nästa rekrytering" />
              <TextLank href="/for-rekryterare/insikter">Alla insikter för rekryterare</TextLank>
            </div>
            <p className="p3-varde fr-ingress">
              Forskningsläget, regelverken och hantverket. Skrivet för dig som rekryterar, med källorna synliga.
            </p>
            <Rutnat kolumner={2} className="fr-insikter">
              {/* Grundens länkbricka med rubriken som h3, som i baslinjen (P5a). */}
              {insikter.map((l) => (
                <LankBricka key={l.href} href={l.href} rubrik={l.rubrik} text={l.text} rubrikNiva="h3" ikon="pil" />
              ))}
            </Rutnat>
          </Sektion>
        ) : null}

        {/* 10. Frågorna */}
        <Sektion botten="ton">
          <Faq
            etikett="Vanliga frågor"
            rubrik="Det rekryterare undrar"
            ingress={
              <>
                Hittar du inte svaret?{' '}
                <Link className="p3-lank" href="/kontakt">
                  Hör av dig.
                </Link>
              </>
            }
            fragor={REKRYTERARE_FAQ_ITEMS}
          />
        </Sektion>

        {/* 11. Slutbandet */}
        <Sektion botten="vagg" luft="tat">
          <div className="fr-band">
            <div>
              <h2 className="p3-h3 fr-band-rubrik">Var med från början. Poolen växer varje dag.</h2>
              <p className="p3-text">
                Skapa ett rekryterarkonto, så verifierar vi ert företag och öppnar kandidatpoolen. Kostnadsfritt under
                lanseringsperioden, utan bindningstid. Bevakning ingår.
              </p>
            </div>
            <Knapp href={REGISTRERA}>Skapa rekryterarkonto</Knapp>
          </div>
        </Sektion>
      </main>
    </Sida>
  )
}
