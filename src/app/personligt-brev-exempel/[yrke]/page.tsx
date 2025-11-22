import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PersonligtBrevExempelPage from './PersonligtBrevExempelPage'

// Example data for all professions
const exampleData: Record<string, any> = {
  'underskoterska': {
    yrke: 'Undersköterska',
    sokvolym: 750,
    metaTitle: 'Personligt Brev Exempel Undersköterska - Jobbcoach.ai',
    metaDescription: 'Se ett komplett personligt brev-exempel för undersköterska. Skrivet av rekryteringsexperter, ATS-optimerat och anpassat efter svenska vårdmiljöer. Inkluderar tips och branschspecifika nyckelord.',
    intro: 'Ett professionellt personligt brev för undersköterska som visar din omvårdnadskompetens, empati och förmåga att arbeta i stressiga situationer. Detta exempel är optimerat för svenska vårdgivare och ATS-system.',
    exempelBrev: {
      namn: 'Lisa Andersson',
      adress: 'Storgatan 12, 123 45 Stockholm',
      telefon: '070-123 45 67',
      epost: 'lisa.andersson@email.se',
      arbetsgivare: 'Karolinska Universitetssjukhuset',
      roll: 'Undersköterska inom geriatrik',
      datum: new Date().toLocaleDateString('sv-SE'),
      brevText: `Hej,

Jag söker tjänsten som undersköterska inom geriatrik på Karolinska Universitetssjukhuset. Med fem års erfarenhet av personcentrerad vård och ett genuint engagemang för äldres välmående är jag övertygad om att jag kan bidra positivt till er verksamhet.

Under mina år på Stockholms äldreboende har jag utvecklat stark kompetens inom ADL-stöd, demensv&aring;rd och palliativ omvårdnad. Jag har arbetat nära läkare och sjuksköterskor i ett tvärprofessionellt team där snabb kommunikation och noggrann dokumentation varit avgörande. Min erfarenhet av att hantera akuta situationer – från fall och konfusion till akut försämring – har lärt mig att vara både lugn och beslutsam under press.

Det jag uppskattar mest med vårdyrket är relationerna med patienterna. Att få tid att sitta ner med en orolig patient, lyssna på deras berättelser och skapa trygghet i vardagen är det som driver mig. Jag tror starkt på värdegrund inom äldreomsorgen och arbetar aktivt för att varje patient ska känna sig sedd och respekterad, oavsett kognitiv eller fysisk funktionsnedsättning.

Era värderingar om evidensbaserad vård och kontinuerlig kompetensutveckling stämmer väl överens med mitt sätt att arbeta. Jag har under det senaste året genomgått utbildning i basala hygienrutiner och nutritionsbedömning, och jag ser fram emot att fortsätta utvecklas tillsammans med er kompetenta personalgrupp.

Jag ser fram emot att diskutera hur jag kan bidra till er verksamhet och till patienternas vardag. Tveka inte att kontakta mig på 070-123 45 67 eller lisa.andersson@email.se.

Varma hälsningar,
Lisa Andersson`
    },
    varforDetFungerar: [
      {
        titel: 'Specifik yrkeskompetens',
        beskrivning: 'Nämner ADL-stöd, demensvård, palliativ omvårdnad och dokumentation – nyckelord som ATS-system letar efter för undersköterskor.'
      },
      {
        titel: 'Konkreta exempel',
        beskrivning: 'Istället för "jag är stresstålig" beskrivs konkreta situationer som fall, konfusion och akut försämring.'
      },
      {
        titel: 'Personcentrerad vård',
        beskrivning: 'Visar empati och relationsskapande – avgörande mjuka färdigheter inom vård och omsorg.'
      },
      {
        titel: 'Kompetensutveckling',
        beskrivning: 'Nämner specifika utbildningar (basala hygienrutiner, nutritionsbedömning) vilket visar lärvilja och professionalism.'
      },
      {
        titel: 'Koppling till arbetsgivaren',
        beskrivning: 'Refererar till Karolinskas värderingar och visar att brevet är skräddarsytt, inte generiskt.'
      }
    ],
    tips: [
      {
        rubrik: 'Använd rätt branschterminologi',
        text: 'Nyckelord som ATS-system letar efter: ADL-stöd, personcentrerad vård, tvärprofessionellt team, basala hygienrutiner, medicindelegering, demensvård, palliativ vård, dokumentation (Cosmic, Procapita), vårdplanering.'
      },
      {
        rubrik: 'Visa både hårda och mjuka färdigheter',
        text: 'Balansera teknisk kompetens (lyft- och förflytningsteknik, PVK-sköstsel, katetervård) med empatiska egenskaper (lyssnande, relationsskapande, bemötande).'
      },
      {
        rubrik: 'Anpassa efter vårdmiljö',
        text: 'Geriatrik: fokusera på demens och kroniska sjukdomar. Akutvård: nämn stress hantering och snabba beslut. Hemtjänst: framhäv självständighet och flexibilitet.'
      },
      {
        rubrik: 'Kvantifiera när möjligt',
        text: 'Istället för "jag har erfarenhet av vård" skriv "5 års erfarenhet av geriatrisk vård med 30-40 patienter per arbetspass".'
      }
    ],
    relaterade: [
      { yrke: 'Sjuksköterska', slug: 'sjukskoterska' },
      { yrke: 'Personlig assistent', slug: 'personlig-assistent' },
      { yrke: 'Barnskötare', slug: 'barnskotare' }
    ],
    faq: [
      {
        q: 'Hur lång erfarenhet behöver jag nämna som undersköterska?',
        a: 'Nämn alltid antal års erfarenhet om du har det (t.ex. "3 års erfarenhet inom geriatrik"). Om du är ny, fokusera på VFU-perioder, relevanta utbildningar och vilja att lära.'
      },
      {
        q: 'Ska jag nämna medicindelegering i mitt personliga brev?',
        a: 'Ja, om du har delegering för t.ex. insulin, PEG eller inhalation – detta är högt värderat. Skriv "medicinsk delegering för insulin och subkutana injektioner" för att vara specifik.'
      },
      {
        q: 'Hur visar jag att jag klarar av tunga lyft?',
        a: 'Undvik att säga "jag är fysiskt stark". Skriv istället "erfarenhet av ergonomiska lyft- och förflyttningstekniker enligt Akta Ryggen-principer" eller nämn hjälpmedel som lyftar, glidlakan och transfereringsövningar.'
      },
      {
        q: 'Ska jag nämna schema i det personliga brevet?',
        a: 'Ja, om du kan jobba natt, helger eller är flexibel – detta är ofta avgörande för vårdgivare. Skriv t.ex. "jag är fullt flexibel gällande arbetstider inklusive natt, helger och jourpass".'
      }
    ]
  }
}

export async function generateMetadata({
  params,
}: {
  params: { yrke: string }
}): Promise<Metadata> {
  const data = exampleData[params.yrke]

  if (!data) {
    return {
      title: 'Exempel inte funnet - Jobbcoach.ai',
    }
  }

  return {
    title: data.metaTitle,
    description: data.metaDescription,
  }
}

export default function Page({ params }: { params: { yrke: string } }) {
  const data = exampleData[params.yrke]

  if (!data) {
    notFound()
  }

  return <PersonligtBrevExempelPage data={data} />
}
