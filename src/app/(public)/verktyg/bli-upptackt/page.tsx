/**
 * /verktyg/bli-upptackt på verktygsmallen (docs/design/analys-visuell-linje-2026-09-22.html,
 * avsnitt 5). Kandidatens perspektiv: profilen är anonym tills kandidaten
 * tackar ja, lönespannet visas aldrig utåt och styrkor visas i ord, aldrig
 * som råpoäng. h1, metadata och schemat (Service, FAQPage) är oförändrade.
 */
import VerktygsSida from '@/components/verktyg/VerktygsSida'
import BliUpptacktMatchning from './components/BliUpptacktMatchning'
import BliUpptacktExempel from './components/BliUpptacktExempel'
import { BLI_UPPTACKT_FAQ_ITEMS } from './components/bli-upptackt-faq-data'
import { IlluScenUpptackt } from '@/components/illustrations/PriserScener'
import { PLAN_BY_KEY } from '@/lib/plans/plans'

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
  {
    rubrik: 'Bevisa vad du kan med kunskapstester',
    text: 'Gör korta tester i logiskt, verbalt och numeriskt tänkande. Resultatet visar var du ligger jämfört med andra som gjort samma test, till exempel bland de 10 procent som presterade bäst. Det blir ett bevis på din förmåga i stället för ett påstående. Också helt frivilligt.',
  },
]

const TRYGGHET = [
  { rubrik: 'Du är anonym tills du säger ja', text: 'Rekryteraren ser din roll, region, kompetenser och testresultat, men inte ditt namn eller dina kontaktuppgifter förrän du tackat ja till en förfrågan.' },
  { rubrik: 'Din nuvarande chef kan inte hitta dig', text: 'Vi döljer vilket företag du jobbar på i dag, så din arbetsgivare kan inte känna igen dig i kandidatpoolen.' },
  { rubrik: 'Bara riktiga företag får söka', text: 'Vi kontrollerar att varje rekryterare hör till ett verkligt företag innan de släpps in, så du slipper oseriösa förfrågningar.' },
  { rubrik: 'Ditt lönespann stannar hos dig', text: 'Rekryteraren ser aldrig ditt löneanspråk. Lön pratar ni om själva, om och när ni börjar chatta.' },
]

export default function BliUpptacktSida() {
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Bli upptäckt av rekryterare på Jobbcoach.ai',
    url: 'https://www.jobbcoach.ai/verktyg/bli-upptackt',
    description:
      `Skapa en anonym kandidatprofil så kan verifierade rekryterare som söker din kompetens hitta dig. Verifierade testresultat och arbetsstil matchar dig mot rätt jobb. Anonym tills du säger ja. Synligheten ingår i ${PLAN_BY_KEY.all_week.name}, ${PLAN_BY_KEY.all_week.amount} kr i veckan eller ${PLAN_BY_KEY.all_month.amount} kr i månaden.`,
    serviceType: 'Karriärtjänst',
    areaServed: { '@type': 'Country', name: 'Sverige' },
    provider: {
      '@type': 'Organization',
      name: 'Jobbcoach.ai',
      url: 'https://www.jobbcoach.ai',
    },
    offers: {
      '@type': 'Offer',
      price: String(PLAN_BY_KEY.all_week.amount),
      priceCurrency: 'SEK',
      description: `Ingår i ${PLAN_BY_KEY.all_week.name}, ${PLAN_BY_KEY.all_week.amount} kr i veckan eller ${PLAN_BY_KEY.all_month.amount} kr i månaden. Profil och tester utan kostnad, synligheten kräver ${PLAN_BY_KEY.all_week.name}.`,
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <VerktygsSida
        brodsmulor={[
          { name: 'Hem', href: '/' },
          { name: 'Bli upptäckt', href: '/verktyg/bli-upptackt' },
        ]}
        eyebrow="Bli upptäckt · tidig åtkomst"
        h1="Bli hittad av rekryterare, utan att jaga jobb själv."
        ingress="Skapa en profil på jobbcoach.ai så kan rekryterare som söker efter någon med din bakgrund hitta dig."
        fet="Du bestämmer själv om du vill synas, och du väljer alltid om du vill svara när någon hör av sig."
        primar={{ text: 'Skapa min profil', href: '/register' }}
        sekundar={{ text: 'Se hur det fungerar, fyra steg', href: '#sa-funkar-det' }}
        loften={[
          { tal: 'Anonym', text: 'tills du tackar ja' },
          { tal: '4 steg', text: 'och du styr i varje' },
          { tal: '1 klick', text: 'för att sluta synas' },
        ]}
        scen={<IlluScenUpptackt className="h-auto w-full" />}
        steg={{
          id: 'sa-funkar-det',
          rubrik: 'Så fungerar det',
          ingress:
            'Du lägger in ditt CV, gör testerna om du vill och slår sedan på synligheten. Då kan rekryterare hitta din profil när de letar efter någon med just din kompetens, utan att du skickar en enda ansökan. Fyra steg, och du styr i varje.',
          rader: STEG,
          lank: { text: 'Skapa min profil', href: '/register' },
        }}
        kontroll={{
          eyebrow: 'Därför fungerar det',
          rubrik: 'Rätt synlighet, inte mer synlighet',
          rader: VARDE,
        }}
        extra={[
          {
            eyebrow: 'Frivilligt personlighetstest',
            rubrik: 'Visa hur du jobbar, inte bara vad du kan',
            ingress:
              'Rekrytering handlar också om hur du samarbetar, fattar beslut och driver dig själv framåt. Personlighetstestet ger dig en rapport i ord, aldrig i poäng, så rekryteraren ser om du skulle trivas i just deras team. Du ser samma rapport som rekryteraren och väljer själv om den ska visas.',
            rader: ARBETSSTIL,
          },
          {
            eyebrow: 'Din trygghet',
            rubrik: 'Du har full kontroll hela vägen',
            ingress:
              'Du bestämmer vem som får se vem du är, och när. Ditt namn, dina kontaktuppgifter, ditt CV-dokument och din arbetsgivare visas aldrig förrän du själv tackat ja.',
            rader: TRYGGHET,
          },
        ]}
        fritt={
          <div className="space-y-16 lg:space-y-[88px]">
            <BliUpptacktMatchning />
            <BliUpptacktExempel />
          </div>
        }
        slut={{
          eyebrow: `${PLAN_BY_KEY.all_week.name}, ${PLAN_BY_KEY.all_week.amount} kr i veckan`,
          rubrik: 'Redo att bli hittad i stället för att leta?',
          text: `Profilen och testerna gör du utan att betala. Synligheten för rekryterare ingår i ${PLAN_BY_KEY.all_week.name}, ${PLAN_BY_KEY.all_week.amount} kr i veckan eller ${PLAN_BY_KEY.all_month.amount} kr i månaden, säg upp när du vill. Utan ${PLAN_BY_KEY.all_week.name} visas profilen inte i rekryterarnas sökningar. Du är anonym tills du tackar ja och stänger av synligheten med ett klick.`,
          knapp: { text: 'Skapa min profil', href: '/register' },
          sekundar: { text: 'Se hur det fungerar', href: '#sa-funkar-det' },
        }}
        faq={{
          rubrik: 'Frågor om Bli upptäckt',
          fragor: BLI_UPPTACKT_FAQ_ITEMS,
        }}
      />
    </>
  )
}
