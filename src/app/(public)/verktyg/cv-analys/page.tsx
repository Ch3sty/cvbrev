/**
 * /verktyg/cv-analys i publikt omgång 3 (skissen cv-analys,
 * docs/design/publikt-omgang3/sidor/cv-analys.html). Byggd med grundens
 * komponenter (src/components/publikt/v3). Texterna enligt textbeslutet
 * (docs/publikt-omgang3/textbeslut.md): läsbarhetspoängen i sju delar,
 * delarnas namn och maxpoäng ur poängmodellen. SEO:s besked avsnitt 6.
 */
import { Sida, Hjalte, Lyft, Sektion, SektionHuvud, Kort, Rutnat, Chip, Nr, VagSteg, Faq, PremiumO, Bocklista, Knapp, Knapprad, TextLank, CvArk, Ikon } from '@/components/publikt/v3'
import CVAnalysMini from './components/CVAnalysMini'
import { CV_ANALYS_FAQ_ITEMS } from './components/cv-analys-faq-data'
import RedirectLoggedIn from '@/components/auth/RedirectLoggedIn'
import { SALD_PLAN, paketKort, prisPeriod } from '@/lib/plans/plans'
import { KATEGORIER as POANG_DELAR, ROLLER_SOM_RAKNAS } from '@/lib/cv/poang/modell'
import { TEMPLATE_COUNT, WORD_TEMPLATE_COUNT } from '@/lib/cv/template-antal'
import { talOrd } from '@/components/publikt/talord'
import './cv-analys.css'

type DelId = (typeof POANG_DELAR)[number]['id']

/** Delarnas texter (textbeslut CVA-1). Namn och maxpoäng läses ur poängmodellen. */
const DELTEXT: Record<DelId, string> = {
  kontakt: 'Namn, e-postadress, telefonnummer och ort. Det låter självklart, men saknas en av dem vet rekryteraren inte hur du nås eller var du finns.',
  profil: 'Din öppning. Den ska vara lagom lång, säga vilken roll du har och innehålla något man kan räkna: år, antal eller resultat.',
  erfarenhet: `Den tyngsta delen. Varje roll behöver titel, arbetsgivare och period, två till åtta punkter som börjar med vad du gjorde och minst en siffra. "Ansvarig för försäljning" blir "Ökade försäljningen 40 procent på 8 månader". De ${talOrd(ROLLER_SOM_RAKNAS)} första rollerna i CV:t räknas.`,
  kompetenser: 'Ett eget avsnitt med lagom många kompetenser, skrivna som korta, sökbara termer. "Budgetansvar" går att söka på. En hel mening gör det inte.',
  utbildning: 'Minst en utbildning, med namn, skola och år eller period. Rekryteraren vill se vad du läste, var och när. Mer än så behövs sällan.',
  sprak: 'Språken står med, och varje språk har en nivå. "Engelska, flytande" säger mer än bara "Engelska", och nivån är det rekryteraren letar efter.',
  format: 'Perioder som går att läsa, samma datumformat genom hela CV:t, senaste rollen först, korta punkter och ett CV som är lagom långt.',
}

/**
 * Exemplet Sara (statiskt, märkt Exempel): hon tappar i Erfarenhet på
 * punkter som inte börjar med vad hon gjorde (Jobbcoachens förslag tar
 * tillbaka dem) och i Språk på en nivå som saknas (det fyller hon i själv).
 * Textbeslutet Del 4 punkt 2. Maxpoängen läses ur modellen.
 */
const EXEMPEL_TAPP: Partial<Record<DelId, { tapp: number; text: string }>> = {
  erfarenhet: { tapp: 5, text: 'flera punkter börjar inte med vad hon gjorde.' },
  sprak: { tapp: 2, text: 'nivån saknas.' },
}
const ERF = POANG_DELAR.find((d) => d.id === 'erfarenhet')?.max ?? 0
const JC_TAPP = EXEMPEL_TAPP.erfarenhet?.tapp ?? 0
const SJALV_TAPP = EXEMPEL_TAPP.sprak?.tapp ?? 0
const EXEMPEL_POANG = 100 - JC_TAPP - SJALV_TAPP

const SKRIVTIPS: { rubrik: string; text: string; fore?: [string, string] }[] = [
  {
    rubrik: 'Kvantifiera dina resultat',
    text: 'Siffror övertygar mer än adjektiv. "Ökade omsättningen 40 procent på 8 månader" säger mer än "duktig på försäljning".',
    fore: ['Duktig på försäljning', 'Ökade omsättningen 40 procent på 8 månader'],
  },
  {
    rubrik: 'Börja varje punkt med ett verb',
    text: 'Drev, byggde, ledde, införde. Aktiva verb visar handlingskraft; passiva formuleringar gör att du försvinner i mängden.',
    fore: ['Ansvarig för införandet', 'Ledde införandet för 40 handläggare'],
  },
  { rubrik: 'Använd annonsens egna ord', text: 'Står en term i annonsen, skriv den exakt så i CV:t. Rekryteringssystemen letar efter exakta termer, inte synonymer.' },
  { rubrik: 'En sida räcker ofta', text: 'Under fem års erfarenhet: en A4. Mer erfarenhet: högst två. Akademiska CV med publikationer kan vara längre, men då av en anledning.' },
  { rubrik: 'Hoppa över bilden', text: 'I Sverige är standard ett CV utan bild, och innehållet väger tyngre än utseendet. Lägg platsen på det som säljer dig. Vill du ändå ha foto finns det mallar med plats för det.' },
]

export default function CVAnalysSida() {
  // Inloggade hör hemma i verktyget, inte på säljsidan (C2).

  // === Schema.org markup ===

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Jobbcoach.ai CV-analys',
    url: 'https://www.jobbcoach.ai/verktyg/cv-analys',
    description:
      'CV-analys som ger en läsbarhetspoäng från 0 till 100, en genomgång i sju delar och Jobbcoachens förslag på nya formuleringar. Anpassad för svenska arbetsgivare.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'SEK',
      description: 'Läsbarhetspoängen och genomgången i sju delar gratis för varje CV, ingen kortuppgift',
    },
    featureList:
      'Läsbarhetspoäng 0-100, genomgång i sju delar (kontaktuppgifter, personbeskrivning, erfarenhet, kompetenser, utbildning, språk, datum, ordning och längd), Jobbcoachens förslag med nuvarande text och förslag bredvid varandra, byggd för svenska CV',
  }

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Så analyserar du ditt CV med Jobbcoach.ai',
    description:
      'Fyra steg från uppladdat CV till starkare ansökan: ladda upp, vi går igenom sju delar, se läsbarhetspoängen, hämta Jobbcoachens förslag.',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'SEK',
      value: '0',
    },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Ladda upp ditt CV',
        text:
          'Ladda upp ditt CV som PDF eller Word, eller välj ett du redan har sparat. Är din PDF inskannad läser vi av bilden när du är inloggad, och bildläsningen läser svenska. Analysen är byggd för svenska CV.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Vi går igenom sju delar',
        text:
          'Kontaktuppgifter, personbeskrivning, erfarenhet, kompetenser, utbildning, språk och till sist datum, ordning och längd. Varje del har sina poäng, och tillsammans blir de 100.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Se läsbarhetspoängen och vad som saknas',
        text:
          'Du får en läsbarhetspoäng från 0 till 100 och ser vad som saknas i varje del, utmärkt direkt på ditt CV. Du ser också hur många poäng som återstår till 100 och i vilka delar de sitter.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Hämta Jobbcoachens förslag',
        text: `Jobbcoachen skriver förslag på nya formuleringar där du tappar poäng. Du väljer vilka som följer med, sparar och ser poängen räknas om. Sedan väljer du en av ${TEMPLATE_COUNT} mallar och laddar ner CV:t som PDF, eller som Word i ${WORD_TEMPLATE_COUNT} av mallarna.`,
      },
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: CV_ANALYS_FAQ_ITEMS.map((item) => ({
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
      <RedirectLoggedIn to="/dashboard/cv-analys" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div id="innehall">
        {/* 1. Hjälten: arket med analysens delar. h1-elementets text är
            "CV-analys med läsbarhetspoäng: se var ditt CV tappar, del för del"
            (SEO avsnitt 6), första ledet formas som etikett. */}
        <Hjalte
          id="hjalte"
          brodsmulor={[
            { name: 'Hem', href: '/' },
            { name: 'Verktyg', href: '/funktioner' },
            { name: 'CV-analys', href: '/verktyg/cv-analys' },
          ]}
          chip={<Chip typ="vagg">Gratis för varje CV</Chip>}
          h1Etikett="CV-analys med läsbarhetspoäng:"
          h1="se var ditt CV tappar, del för del"
          varde={
            <>
              Vi går igenom ditt CV i sju delar, från kontaktuppgifter till datum, ordning och längd, och räknar en läsbarhetspoäng av 100.{' '}
              <b>Du ser var varje tappad poäng sitter och hur du tar tillbaka den.</b>
            </>
          }
          knappar={
            <>
              <Knapp href="#mini-analys" pil>
                Analysera mitt CV
              </Knapp>
              <TextLank href="#sa-funkar-det">Så fungerar det</TextLank>
            </>
          }
          brickor={[
            { tal: String(POANG_DELAR.length), text: 'delar i genomgången' },
            { tal: '100', text: 'poäng att nå' },
            { tal: '0 kr', text: 'för poängen, varje CV' },
          ]}
          bild={
            <CvArk
              poang={{ tal: EXEMPEL_POANG, text: 'av 100 i dag' }}
              kvar={`${100 - EXEMPEL_POANG} poäng kvar till 100`}
              fynd={{
                rubrik: 'Erfarenhet',
                poang: `${ERF - JC_TAPP} av ${ERF}`,
                andel: Math.round(((ERF - JC_TAPP) / ERF) * 100),
                text: 'Flera punkter börjar inte med vad du gjorde. Jobbcoachen föreslår nya.',
              }}
            />
          }
          lyft
        />

        {/* 2. Prova utan konto: uppladdningen i lyftkortet */}
        <Lyft etikett="Prova utan konto">
          <div className="cva-slapp">
            <CVAnalysMini />
            <div>
              <p className="p3-ey">Det här får du se</p>
              <ul className="cva-far">
                <li>
                  <i>
                    <Ikon namn="bock" />
                  </i>
                  <div>
                    Din läsbarhetspoäng av 100<span>Varje poäng går att peka på i ditt CV.</span>
                  </div>
                </li>
                <li>
                  <i>
                    <Ikon namn="bock" />
                  </i>
                  <div>
                    Det viktigaste att ändra först<span>I klartext, direkt under poängen.</span>
                  </div>
                </li>
                <li>
                  <i>
                    <Ikon namn="bock" />
                  </i>
                  <div>
                    Hela genomgången i ett gratiskonto<span>Alla sju delar, för varje CV du sparar.</span>
                  </div>
                </li>
              </ul>
              <p className="p3-liten" style={{ marginTop: 16 }}>
                Är din PDF inskannad? <TextLank href="/register?borja=cv">Skapa ett gratiskonto</TextLank>, så läser vi av bilden. Bildläsningen läser svenska.
              </p>
            </div>
          </div>
        </Lyft>

        {/* 3. Så fungerar det, stegen som väg (HowTo ur samma lista) */}
        <Sektion id="sa-funkar-det">
          <SektionHuvud etikett="Fyra steg" rubrik="Så fungerar det" varde="Fyra steg från uppladdat CV till en starkare ansökan." />
          <VagSteg steg={howToSchema.step.map((s, i) => ({ rubrik: s.name, text: s.text, koppar: i === howToSchema.step.length - 1 }))} />
          <Knapprad className="cva-efter">
            <Knapp href="#mini-analys">Analysera mitt CV</Knapp>
          </Knapprad>
        </Sektion>

        {/* 4. Vad vi kontrollerar: sju delar, stapeln är bilden */}
        <Sektion botten="ton" id="vad-vi-kontrollerar">
          <SektionHuvud
            etikett="Vad vi kontrollerar"
            rubrik="Sju delar som ger din läsbarhetspoäng"
            varde="Varje poäng går att peka på i ditt CV. Fler ord ger aldrig fler poäng. Så här fördelas de hundra."
          />
          <div className="cva-hundra" aria-hidden="true">
            {POANG_DELAR.map((d) => {
              const t = EXEMPEL_TAPP[d.id]
              const andel = t ? Math.round(((d.max - t.tapp) / d.max) * 100) : 100
              return (
                <div key={d.id} style={{ flex: d.max }} className={t ? 'cva-tapp' : undefined}>
                  <i style={{ width: `${andel}%` }} />
                  <b>{d.max}</b>
                </div>
              )
            })}
          </div>
          <div className="cva-delar">
            {POANG_DELAR.map((d, i) => {
              const t = EXEMPEL_TAPP[d.id]
              return (
                <div key={d.id} className={['cva-delrad', t ? 'cva-tapp' : '', d.id === 'erfarenhet' ? 'cva-bred' : ''].filter(Boolean).join(' ')}>
                  <Nr typ={t ? 'koppar' : 'ton'}>{i + 1}</Nr>
                  <h3 className="p3-h3">{d.namn}</h3>
                  <span className="cva-max">
                    {d.max} <small>poäng</small>
                  </span>
                  <p>
                    {DELTEXT[d.id]}
                    {t ? (
                      <>
                        {' '}
                        <span className="cva-exempel">
                          Exempel: Sara har {d.max - t.tapp} av {d.max}, {t.text}
                        </span>
                      </>
                    ) : null}
                  </p>
                </div>
              )
            })}
          </div>
          <p className="p3-liten cva-not">
            Läsbarhetspoängen visar hur lätt ditt CV är att läsa för en rekryterare och för rekryteringssystemen. Vi räknar den själva, ur det som står i ditt CV.
          </p>
        </Sektion>

        {/* 5. Vägen till 100 poäng (ny H2, SEO ja) */}
        <Sektion id="vagen-till-100">
          <div className="p3-vagg cva-vagen">
            <SektionHuvud
              etikett="Gratis och Premium"
              rubrik="Vägen till 100 poäng"
              varde={
                <>
                  <b>Poängen är gratis.</b> Förslagen gör jobbet åt dig.
                </>
              }
            />
            <div className="cva-vagen-rad">
              <div>
                <div className="cva-tillhundra" aria-hidden="true">
                  <i className="cva-idag">{EXEMPEL_POANG}</i>
                  <i className="cva-jc">+{JC_TAPP}</i>
                  <i className="cva-sjalv">+{SJALV_TAPP}</i>
                </div>
                <ul className="cva-forklaring">
                  <li>
                    Exempel, i dag <b>{EXEMPEL_POANG}</b>
                  </li>
                  <li>
                    Jobbcoachens förslag <b>+{JC_TAPP}</b>
                  </li>
                  <li>
                    Du själv <b>+{SJALV_TAPP}</b>
                  </li>
                </ul>
                <p className="p3-liten" style={{ marginTop: 18 }}>
                  Varje CV får sin egen väg till 100. Du ser alltid hur många poäng som återstår och i vilken del de sitter.
                </p>
              </div>
              <div className="cva-niva">
                <Kort>
                  <p className="p3-h3">
                    Gratis <Chip typ="gratis">för varje CV</Chip>
                  </p>
                  <Bocklista
                    paPapper
                    punkter={['Läsbarhetspoängen', 'Vad som saknas i alla sju delar', 'Jobbcoachens förslag en gång, med det tyngsta förslaget öppet']}
                  />
                </Kort>
                <Kort>
                  <p className="p3-h3">
                    Premium <Chip typ="premium">{prisPeriod(SALD_PLAN)}</Chip>
                  </p>
                  <Bocklista punkter={['Alla förslag från Jobbcoachen', 'Nya förslag efter varje ändring', 'Alla mallar och personliga brev utan tak']} />
                </Kort>
              </div>
            </div>
          </div>
        </Sektion>

        {/* 6. Skrivtips med före och efter */}
        <Sektion botten="papper" id="skrivtips">
          <SektionHuvud etikett="Skrivtips" rubrik="Fem saker som lyfter vilket CV som helst" />
          <Rutnat kolumner={3}>
            {SKRIVTIPS.map((t, i) => (
              <Kort key={t.rubrik}>
                <Nr>{i + 1}</Nr>
                <h3 className="p3-h3">{t.rubrik}</h3>
                <p>{t.text}</p>
                {t.fore ? (
                  <div className="cva-fore">
                    <s>{t.fore[0]}</s>
                    <b>{t.fore[1]}</b>
                  </div>
                ) : null}
              </Kort>
            ))}
            <Kort ton>
              <p className="p3-h3">Se hur andra har gjort</p>
              <p>CV-exempel för vanliga yrken, skrivna för svenska rekryterare.</p>
              <TextLank href="/exempel">Se CV-exempel</TextLank>
            </Kort>
          </Rutnat>
        </Sektion>

        {/* 7. Premium */}
        <Sektion id="premium">
          <PremiumO
            rubrik="Alla förslag, och nya när du har ändrat."
            text={`Läsbarhetspoängen och genomgången i sju delar är gratis för varje CV. Alla förslag från Jobbcoachen, nya förslag efter varje ändring, alla mallar och personliga brev utan tak ingår i ${paketKort()}.`}
            uppsagning
            knapp={
              <>
                <Knapp href="#mini-analys">Analysera mitt CV gratis</Knapp>
                <TextLank href="/exempel">Se CV-exempel först</TextLank>
              </>
            }
            punkter={[
              'Alla förslag, och nya efter varje ändring',
              `${TEMPLATE_COUNT} CV-mallar, ${WORD_TEMPLATE_COUNT} av dem också som Word`,
              'Rekryteringstester, personliga brev och jobbmatchning',
            ]}
          />
        </Sektion>

        {/* 8. Frågorna */}
        <Sektion luft="utan-topp" id="fragor">
          <Faq
            rubrik="Frågor om CV-analysen"
            ingress={
              <>
                Hittar du inte svaret? Mejla{' '}
                <a href="mailto:support@jobbcoach.ai" className="p3-lank">
                  support@jobbcoach.ai
                </a>
                .
              </>
            }
            fragor={CV_ANALYS_FAQ_ITEMS}
            efter={
              <Knapprad>
                <Knapp href="#mini-analys" pil>
                  Analysera mitt CV
                </Knapp>
              </Knapprad>
            }
          />
        </Sektion>
      </div>
    </Sida>
  )
}
