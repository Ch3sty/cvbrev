/**
 * /for-rekryterare, publikt v2 (docs/design/spec-publikt-v2-del-b-2026-10-12.md
 * avsnitt 3.7, skissen flik #foretag). Ton: kollega till kollega, och
 * kunskapsdelen heter Insikter.
 *
 * Sektioner: hjälten på vägg neu med träffkortet och den verifierade
 * badgen, insidan med portalen och fem steg, därför funkar det, de
 * verifierade resultaten på vägg tran, så funkar det steg för steg, två
 * träffkort, hela profilen, integriteten på bläck, Insikter, frågorna och
 * slutbandet. Serverrenderad rakt igenom: inga klientöar och ingen
 * rörelse som skjuter innehållet (CLS 0).
 *
 * SEO: title, description och canonical i layout.tsx. Service (med Offer)
 * och FAQPage byggs här, oförändrade utom de svenska facktermerna i två
 * FAQ-svar (ägarbeslut 2026-10-12). Kandidaterna visas med percentil, nivå
 * och villkor, aldrig råpoäng eller lönespann.
 */
import Link from 'next/link'
import PubliktSida from '@/components/publikt/PubliktSida'
import '@/components/publikt/innehall/foretag.css'
import Rum from '@/components/publikt/Rum'
import Faq from '@/components/publikt/Faq'
import LankLista from '@/components/publikt/LankLista'
import { MatrisBricka } from '@/components/publikt/MatrisExpert'
import Smula from '@/components/publikt/innehall/Smula'
import Traffkort from '@/components/publikt/innehall/Traffkort'
import { getAllInsikterMeta } from '@/lib/blog'
import Profilkort from './components/Profilkort'
import { EXEMPEL, PORTAL, REDOVISNINGSEKONOM } from './components/kandidater'
import { REKRYTERARE_FAQ_ITEMS } from './components/rekryterare-faq-data'

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

function Punkter({ rader, className = '' }: { rader: readonly { rubrik: string; text: string }[]; className?: string }) {
  return (
    <ul className={`if-punkter ${className}`.trim()}>
      {rader.map((r) => (
        <li key={r.rubrik}>
          <h3>{r.rubrik}</h3>
          <p>{r.text}</p>
        </li>
      ))}
    </ul>
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
    <PubliktSida>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <main>
        {/* 1. Hjälten på vägg neu */}
        <Rum rum="neu" yta="vagg" id="hjalte" className="ib-hjalte">
          <div className="pub-wrap ib-hjalte-g">
            <div>
              <Smula steg={[{ namn: 'Hem', href: '/' }, { namn: 'För rekryterare' }]} />
              <p className="pub-kick">För rekryterare, tidig åtkomst</p>
              <h1 className="pub-h1 ib-h1-stor">Kandidater med bevisade färdigheter</h1>
              <p className="pub-ingress">
                Sök på kravprofilen och få relevansrankade träffar med verifierade testresultat per nivå och en
                arbetsstilsrapport ur 120 frågor. Varje kandidat har själv valt att synas, så de som svarar är faktiskt
                intresserade.
              </p>
              <div className="pub-handling">
                <Link className="pub-knapp" href={REGISTRERA} data-primar="" data-cta="rekryterare-hero">
                  Skapa rekryterarkonto
                </Link>
                <a className="pub-lank" href="#sa-funkar-det">
                  Så funkar det
                </a>
              </div>
              <ul className="ib-bevis">
                <li>Kostnadsfritt under lanseringen</li>
                <li>GDPR-först</li>
                <li>Ingen bindningstid</li>
              </ul>
            </div>
            <div className="if-rek-bild">
              <p className="if-rek-etikett">Exempel ur poolen</p>
              <Traffkort k={REDOVISNINGSEKONOM} />
              <div className="if-verifierad pub-rum-tran" aria-hidden="true">
                <span>Verifierat av oss</span>
                <b>Topp 10 %</b>
                <small>Matrislogik, expertnivå, första försöket</small>
              </div>
              <p className="if-rek-not">
                Avidentifierad tills kandidaten tackar ja till kontakt. Testresultaten är verifierade av oss.
              </p>
            </div>
          </div>
        </Rum>

        {/* 2. Insidan: portalen och fem steg */}
        <Rum yta="mark" id="insidan">
          <div className="pub-wrap">
            <p className="pub-kick">Så här ser det ut på insidan</p>
            <h2 className="pub-h2">Från sökning till anställning</h2>
            <p className="pub-ingress" style={{ marginTop: 14 }}>
              Det här är inte skärmdumpar. Det är portalen, byggd steg för steg så att du ser exakt hur en rekrytering går
              till hos oss.
            </p>
            <div className="if-portal-g">
              <div className="if-webb pub-rum-neu" aria-label="Exempel ur rekryterarportalen">
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
              <ol className="if-steg5 pub-rum-neu">
                {INSIDAN.map((s) => (
                  <li key={s.rubrik}>
                    <div>
                      <h3>{s.rubrik}</h3>
                      <p>{s.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Rum>

        {/* 3. Därför funkar det */}
        <Rum yta="panel">
          <div className="pub-wrap">
            <p className="pub-kick">Därför funkar det</p>
            <h2 className="pub-h2">Mindre gissning, mer träff</h2>
            <p className="pub-ingress" style={{ marginTop: 14 }}>
              Ett CV berättar vad någon säger sig kunna. Vi visar vad kandidaten har bevisat, och att hen faktiskt vill bli
              kontaktad.
            </p>
            <Punkter rader={VARDE} className="if-fyra" />
          </div>
        </Rum>

        {/* 4. Verifierade resultat på vägg tran */}
        <Rum rum="tran" yta="vagg">
          <div className="pub-wrap pub-tva">
            <div className="pub-tva-text">
              <p className="pub-kick">Verifierade resultat</p>
              <h2 className="pub-h2">Siffror som tål följdfrågor</h2>
              <p className="pub-ingress" style={{ marginTop: 14 }}>
                Ett testresultat är bara värt något om det håller för granskning. Så här räknar vi, öppet och utan
                genvägar.
              </p>
              <Punkter rader={SIFFROR} />
              <p className="if-citat-rad">Vi visar hellre en ärlig siffra än en imponerande.</p>
            </div>
            <div className="if-badgar" aria-hidden="true">
              <div className="if-badge">
                <span className="if-badge-k">Matrislogik, expertnivå</span>
                <b>Topp 10 %</b>
                <span className="if-badge-n">av 340 testade, första försöket</span>
                <div className="if-badge-skala">
                  <i style={{ ['--p' as string]: '90%' }} />
                </div>
                <span className="if-badge-d">Gjort i september 2026</span>
              </div>
              <div className="if-badge if-badge-2">
                <span className="if-badge-k">Numeriskt, standardnivå</span>
                <b>Topp 15 %</b>
                <span className="if-badge-n">av 890 testade, första försöket</span>
                <div className="if-badge-skala">
                  <i style={{ ['--p' as string]: '85%' }} />
                </div>
              </div>
              <div className="if-matrisbricka">
                <MatrisBricka className="" bredd={110} />
              </div>
            </div>
          </div>
        </Rum>

        {/* 5. Så funkar det, steg för steg */}
        <Rum yta="mark" id="sa-funkar-det">
          <div className="pub-wrap">
            <p className="pub-kick">Så funkar det</p>
            <h2 className="pub-h2">Så funkar det, steg för steg</h2>
            <p className="pub-ingress" style={{ marginTop: 14 }}>
              Inga mellanhänder och inga köpta kontaktlistor. Kandidaten bestämmer, du får svar som betyder något.
            </p>
            <ol className="if-fyra-steg">
              {SA_FUNKAR.map((s, i) => (
                <li key={s.rubrik}>
                  <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{s.rubrik}</h3>
                  <p>{s.text}</p>
                </li>
              ))}
            </ol>
            <div className="pub-handling">
              <Link className="pub-knapp" href={REGISTRERA}>
                Ansök om tidig åtkomst
              </Link>
            </div>
          </div>
        </Rum>

        {/* 6. Träffkorten */}
        <Rum yta="panel">
          <div className="pub-wrap">
            <p className="pub-kick">Träffkorten</p>
            <h2 className="pub-h2">Så ser en träff ut</h2>
            <p className="pub-ingress" style={{ marginTop: 14 }}>
              Allt du behöver för ett första beslut på ett kort: verifierade testresultat, styrkor, kompetenser och villkor.
              Identiteten skyddas tills kandidaten tackar ja.
            </p>
            <div className="if-kand-par">
              {EXEMPEL.map((k) => (
                <Traffkort key={k.roll} k={k} />
              ))}
            </div>
            <p className="pub-liten" style={{ marginTop: 40 }}>
              Exempelprofiler. Kandidaterna i poolen är verkliga arbetssökande som själva valt att synas.
            </p>
          </div>
        </Rum>

        {/* 7. Hela profilen */}
        <Rum rum="neu" yta="ton">
          <div className="pub-wrap">
            <p className="pub-kick">Hela profilen</p>
            <h2 className="pub-h2">Så ser hela profilen ut</h2>
            <p className="pub-ingress" style={{ marginTop: 14 }}>
              Träffkortet är den första sorteringen. Ett klick öppnar hela profilen: kandidatens egen pitch,
              arbetshistorik, utbildning och verifierade testresultat. Namn och arbetsgivare låses upp först när kandidaten
              tackar ja, och just därför är de som svarar faktiskt intresserade.
            </p>
            <Profilkort />
            <p className="pub-liten" style={{ marginTop: 16 }}>
              Exempelprofil med fiktiva uppgifter. Profilerna i poolen är verkliga arbetssökande som själva valt att
              synas.
            </p>
          </div>
        </Rum>

        {/* 8. Integriteten på bläck */}
        <Rum yta="premium">
          <div className="pub-wrap">
            <p className="pub-kick">Byggt GDPR-först</p>
            <h2 className="pub-h2">Integriteten är inte ett hinder. Den är produkten.</h2>
            <p className="pub-ingress" style={{ marginTop: 14 }}>
              Kandidater som känner sig trygga vågar synas, och svarar när du hör av dig. Därför är hela flödet designat
              runt samtycke.
            </p>
            <Punkter rader={INTEGRITET} className="if-mork" />
          </div>
        </Rum>

        {/* 9. Insikter */}
        {insikter.length ? (
          <Rum yta="mark">
            <div className="pub-wrap">
              <div className="ib-rubrikrad">
                <div>
                  <p className="pub-kick">Insikter</p>
                  <h2 className="pub-h2">Kunskap som förbättrar nästa rekrytering</h2>
                </div>
                <Link className="pub-lank" href="/for-rekryterare/insikter">
                  Alla insikter för rekryterare
                </Link>
              </div>
              <p className="pub-ingress">
                Forskningsläget, regelverken och hantverket. Skrivet för dig som rekryterar, med källorna synliga.
              </p>
              <LankLista lankar={insikter} rubrikNiva="h3" className="if-insikter" />
            </div>
          </Rum>
        ) : null}

        {/* 10. Frågorna */}
        <Rum yta="panel">
          <div className="pub-wrap" style={{ maxWidth: 820 }}>
            <p className="pub-kick">Vanliga frågor</p>
            <Faq
              rubrik="Det rekryterare undrar"
              ingress={
                <>
                  Hittar du inte svaret?{' '}
                  <Link className="pub-lank" href="/kontakt">
                    Hör av dig.
                  </Link>
                </>
              }
              fragor={REKRYTERARE_FAQ_ITEMS}
            />
          </div>
        </Rum>

        {/* 11. Slutbandet */}
        <Rum rum="neu" yta="vagg" storlek="tat">
          <div className="pub-wrap if-band">
            <div>
              <h2 className="pub-h3">Var med från början. Poolen växer varje dag.</h2>
              <p className="pub-brod" style={{ marginTop: 8 }}>
                Skapa ett rekryterarkonto, så verifierar vi ert företag och öppnar kandidatpoolen. Kostnadsfritt under
                lanseringsperioden, utan bindningstid. Bevakning ingår.
              </p>
            </div>
            <Link className="pub-knapp" href={REGISTRERA}>
              Skapa rekryterarkonto
            </Link>
          </div>
        </Rum>
      </main>
    </PubliktSida>
  )
}
