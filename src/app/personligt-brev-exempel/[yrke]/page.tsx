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

    // SEO-rik introduktion
    seoIntro: 'Söker du jobb som undersköterska och behöver skriva ett personligt brev som sticker ut? Det här exemplet visar hur du skriver ett ATS-optimerat personligt brev som passar svenska vårdmiljöer. Du får se exakt hur du balanserar teknisk kompetens (ADL-stöd, medicindelegering, dokumentationssystem) med de mjuka färdigheter som rekryterare söker (empati, kommunikation, samarbete). Brevet är anpassat efter Karolinska Universitetssjukhusets värderingar och visar konkreta exempel från geriatrisk vård. Använd det som inspiration för din egen jobbansökan undersköterska och anpassa det efter den tjänst du söker. Läs också våra tips om hur du optimerar ditt CV undersköterska för att öka dina chanser till intervju.',

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

Jag söker tjänsten som undersköterska inom geriatrik på Karolinska Universitetssjukhuset. Med fem års erfarenhet av personcentrerad vård och ett genuint engagemang för äldres välmående är jag övertygad om att min kompetens skulle passa väl i ert team. Era värderingar om evidensbaserad vård och patientens rätt till trygghet stämmer helt överens med hur jag arbetar.

Under mina år på Stockholms äldreboende har jag utvecklat gedigen erfarenhet av ADL-stöd, demensvård och palliativ omvårdnad. Jag har regelbundet arbetat med 30-40 patienter per arbetspass och har medicinsk delegering för insulin, subkutana injektioner och PEG-sondmatning. Ett konkret exempel är när jag uppmärksammade tidiga tecken på urinvägsinfektion hos en patient med demens, kontaktade läkare och startade behandling innan tillståndet förvärrades. Jag arbetar nära sjuksköterskor och läkare i tvärprofessionella team där snabb kommunikation och noggrann dokumentation i Cosmic varit avgörande.

Det jag uppskattar mest med vårdyrket är relationerna med patienterna. Att få tid att sitta ner med en orolig patient, lyssna på deras berättelser och skapa trygghet i vardagen är det som driver mig. Jag tror starkt på personcentrerad vård och arbetar aktivt för att varje patient ska känna sig sedd och respekterad. När situationen kräver det är jag lugn och beslutsam – jag har hanterat akuta fall, konfusion och plötsliga försämringar och vet hur viktigt det är att agera snabbt samtidigt som jag bevarar lugnet för patienten.

Vad som verkligen tilltalar mig med Karolinska Universitetssjukhuset är er satsning på kontinuerlig kompetensutveckling och evidensbaserad omvårdnad. Jag har under det senaste året genomgått utbildning i basala hygienrutiner och nutritionsbedömning, och jag ser fram emot att fortsätta utvecklas tillsammans med er kompetenta personalgrupp. Er forskning inom geriatrik och fokus på värdighetsbevarande vård ligger helt i linje med min egen yrkesstolthet.

Jag ser fram emot att diskutera hur jag kan bidra till er verksamhet och till patienternas vardag. Tveka inte att kontakta mig på 070-123 45 67 eller lisa.andersson@email.se.

Varma hälsningar,
Lisa Andersson`
    },

    varforDetFungerar: [
      {
        titel: 'Specifika yrkesnyckelord för ATS',
        beskrivning: 'Brevet innehåller viktiga sökord som ATS-system letar efter: ADL-stöd, personcentrerad vård, demensvård, palliativ omvårdnad, medicinsk delegering, tvärprofessionellt team, och Cosmic (dokumentationssystem). Detta ökar chansen att brevet rankas högt i automatiska system.'
      },
      {
        titel: 'Konkreta exempel istället för vaga påståenden',
        beskrivning: 'Istället för "jag är stresstålig" beskrivs konkreta situationer: uppmärksammade tidiga tecken på urinvägsinfektion, hanterat akuta fall och konfusion, arbetat med 30-40 patienter per pass. Detta visar kompetens genom handling, inte tomma ord.'
      },
      {
        titel: 'Mjuka färdigheter med bevis',
        beskrivning: 'Empatiska egenskaper backas upp med exempel: "sitta ner med en orolig patient, lyssna på deras berättelser". Detta är starkare än att bara skriva "jag är empatisk" och visar förståelse för personcentrerad vård som är central inom geriatrik.'
      },
      {
        titel: 'Kompetensutveckling som styrka',
        beskrivning: 'Nämner specifika utbildningar (basala hygienrutiner, nutritionsbedömning) och medicinsk delegering för insulin, PEG och subkutana injektioner. Detta visar lärvilja och professionalism – egenskaper som vårdgivare högt värderar.'
      },
      {
        titel: 'Företagsspecifik anpassning',
        beskrivning: 'Brevet refererar till Karolinskas värderingar om evidensbaserad vård och kontinuerlig kompetensutveckling. Detta visar att kandidaten gjort research och inte skickat ett generiskt brev, vilket ökar chansen att rekryteraren läser hela texten.'
      }
    ],

    tips: [
      {
        rubrik: 'Använd rätt branschterminologi för att passera ATS',
        text: 'ATS-system söker efter specifika nyckelord inom vården. Inkludera termer som ADL-stöd, personcentrerad vård, tvärprofessionellt team, basala hygienrutiner, medicindelegering, demensvård och palliativ vård. Om jobbannonsen nämner specifika dokumentationssystem som Cosmic, Procapita eller PMO, ta med dem om du har erfarenhet. Nämn också vårdplanering, riskbedömning och fallprevention om det är relevant för tjänsten. Dessa nyckelord signalerar både till ATS-systemet och till rekryteraren att du förstår yrkets krav.'
      },
      {
        rubrik: 'Balansera tekniska och mjuka färdigheter med konkreta exempel',
        text: 'Vårdgivare söker undersköterskor som behärskar både praktiska arbetsuppgifter och relationsskapande. Visa teknisk kompetens genom att nämna lyft- och förflytningsteknik enligt Akta Ryggen, PVK-skötsel, katetervård, såromläggning eller andra specifika arbetsuppgifter. Kombinera detta med mjuka färdigheter som empati och kommunikation, men backa alltid upp med exempel. Istället för "jag är bra på att lyssna" skriv "jag tar mig tid att sitta ner med oroliga patienter och lyssna på deras oro, vilket skapar trygghet i vardagen".'
      },
      {
        rubrik: 'Anpassa efter vårdmiljö och patientgrupp',
        text: 'Olika vårdmiljöer kräver olika kompetenser. För geriatrik: betona demensvård, kroniska sjukdomar, palliativ omvårdnad och tålamod. För akutvård: lyft fram stresshantering, snabba beslut, prioriteringsförmåga och teamarbete under press. För hemtjänst: fokusera på självständighet, flexibilitet, problemlösning och förmåga att arbeta ensam. Läs jobbannonsen noga och anpassa ditt brev så att det matchar den specifika arbetsplatsen och patientgruppen.'
      },
      {
        rubrik: 'Kvantifiera din erfarenhet för att öka trovärdigheten',
        text: 'Konkreta siffror gör ditt brev mer trovärdigt. Istället för "jag har erfarenhet av vård" skriv "5 års erfarenhet av geriatrisk vård med 30-40 patienter per arbetspass". Nämn antal års erfarenhet, antal VFU-perioder om du är nyutbildad, eller specifika arbetsuppgifter som "medicinsk delegering för 15-20 patienter dagligen". Om du jobbat deltid eller timanställd, räkna om till heltidsekvivalent: "2 år, motsvarande 3 års heltid". Siffror hjälper rekryteraren att snabbt bedöma din erfarenhetsnivå.'
      },
      {
        rubrik: 'Visa ditt arbetssätt i stressiga situationer',
        text: 'Vårdyrket innebär ofta akuta situationer och högt arbetstempo. Beskriv hur du hanterar stress genom konkreta exempel: "När en patient plötsligt försämrades kontaktade jag omedelbart ansvarig sjuksköterska, övervakade vitalparametrar och dokumenterade förändringen i Cosmic". Detta visar att du inte bara klarar av stress, utan också har strukturerade rutiner för att hantera akuta situationer. Nämn gärna erfarenhet av jour, natt eller helgarbete om du är flexibel gällande schemaläggning.'
      }
    ],

    faq: [
      {
        q: 'Hur lång erfarenhet behöver jag nämna som undersköterska?',
        a: 'Nämn alltid antal års erfarenhet om du har det (t.ex. "3 års erfarenhet inom geriatrik"). Om du är nyutbildad, fokusera på VFU-perioder och var du gjorde dem: "Jag har genomfört VFU inom geriatrik på Stockholms äldreboende och akutvård på Södersjukhuset". Betona vad du lärt dig och vilka arbetsuppgifter du hanterat. Vårdgivare vet att nyutexaminerade behöver introduktion, så var ärlig men positiv.'
      },
      {
        q: 'Ska jag nämna medicindelegering i mitt personliga brev?',
        a: 'Ja, definitivt om du har delegering. Detta är högt värderat och kan vara avgörande för vissa tjänster. Var specifik: "Jag har medicinsk delegering för insulin, subkutana injektioner, PEG-sondmatning och inhalation". Om du inte har delegering men är villig att ta det, skriv "Jag är motiverad att genomgå medicindelegering för de arbetsuppgifter som tjänsten kräver". Nämn också om du har erfarenhet av läkemedelshantering eller kan dospåsar.'
      },
      {
        q: 'Hur visar jag att jag klarar av fysiskt krävande arbete?',
        a: 'Undvik att säga "jag är fysiskt stark" eftersom det låter vagt. Skriv istället "Jag har gedigen erfarenhet av ergonomiska lyft- och förflyttningstekniker enligt Akta Ryggen-principer och använder hjälpmedel som lyftar, glidlakan och rullstolar säkert". Detta visar att du förstår vikten av arbetsmiljö och patientsäkerhet. Om du har utbildning i förflyttningsteknik eller arbetat med tyngre patienter, nämn det konkret.'
      },
      {
        q: 'Ska jag nämna schemaflexibilitet i det personliga brevet?',
        a: 'Ja, detta är ofta avgörande för vårdgivare. Om du är flexibel gällande arbetstider, var tydlig: "Jag är fullt flexibel gällande arbetstider inklusive natt, helger och jourpass". Om du har begränsningar (t.ex. kan inte jobba natt pga. familjesituation), nämn det inte i brevet utan ta upp det vid intervju. Betona istället vad du KAN: "Jag är van vid skiftarbete och har arbetat både dag-, kväll- och helgpass".'
      },
      {
        q: 'Hur hanterar jag ansökan om jag saknar formell erfarenhet?',
        a: 'Fokusera på VFU-perioder, relevanta kurser och personliga egenskaper. Skriv: "Under min VFU inom geriatrik på X fick jag arbeta självständigt med ADL-stöd, dokumentation och kommunikation med anhöriga". Nämn också omsorgserfarenhet från andra sammanhang: anhörigvård, volontärarbete eller extrajobb inom vården. Betona din lärvilja: "Som nyutexaminerad är jag van vid att lära snabbt och tar gärna emot feedback för att utvecklas i rollen".'
      },
      {
        q: 'Vilka certifieringar och utbildningar är värda att nämna?',
        a: 'Nämn alltid basala hygienrutiner (BHR), första hjälpen/HLR, Akta Ryggen, nutritionsbedömning, palliativ vård och demensutbildningar. Även kortare kurser som diabetes, sårbehandling eller smärtlindring är relevanta. Skriv konkret: "Jag har genomgått utbildning i basala hygienrutiner och förnyar min HLR-certifiering årligen". Om du har specialistkompetens som Silviasystern eller motsvarande, lyft fram det tydligt.'
      },
      {
        q: 'Hur skriver jag om jobbyte mellan olika vårdmiljöer?',
        a: 'Beskriv övergången som kompetensutveckling: "Efter tre år inom äldreboende söker jag nu en roll inom akutgeriatrik för att bredda min erfarenhet och arbeta i en mer medicinskt komplex miljö". Förklara vad du tar med dig från tidigare miljöer och vad du vill lära dig i den nya. Betona överförbara färdigheter: "Min erfarenhet av palliativ vård och demensomsorg på äldreboende ger mig en god grund för geriatrisk akutvård".'
      },
      {
        q: 'Ska jag nämna löneförväntningar i brevet?',
        a: 'Nej, nämn inte lön i det personliga brevet om det inte uttryckligen efterfrågas i annonsen. Fokusera på din kompetens och motivation. Löneförhandling sker vanligtvis vid anställningserbjudande. Om annonsen ber om löneönskemål, nämn en realistisk siffra baserad på kollektivavtal och din erfarenhet: "Enligt kollektivavtal med X års erfarenhet". Researcha lön via Unionen eller Kommunal innan du anger siffror.'
      },
      {
        q: 'Hur långt bör brevet vara för undersköterskor?',
        a: 'Sikta på 300-400 ord fördelat på 4-5 stycken, vilket motsvarar cirka 3/4 av en A4-sida. Vårdgivare har ont om tid, så håll brevet koncist och fokuserat. Varje stycke ska ha ett tydligt syfte: inledning med motivation, erfarenhet med konkreta exempel, kompetenser och arbetssätt, koppling till arbetsgivaren, och avslutning med uppmaning till kontakt. Om brevet blir längre än en A4-sida, korta ner genom att ta bort generella fraser.'
      }
    ],

    // Relaterade artiklar
    relateradeArtiklar: [
      {
        titel: 'Hur du skriver ett ATS-optimerat CV som undersköterska',
        slug: 'ats-optimerat-cv-underskoterska'
      },
      {
        titel: 'De vanligaste intervjufrågorna för undersköterskor med svar',
        slug: 'intervjufragor-underskoterska'
      },
      {
        titel: 'Karriärvägar inom vården: från undersköterska till specialist',
        slug: 'karriarvagar-underskoterska'
      },
      {
        titel: 'Medicindelegering för undersköterskor: så tar du nästa steg',
        slug: 'medicindelegering-underskoterska'
      }
    ],

    // Relaterade verktyg
    relateradeVerktyg: [
      {
        namn: 'CV-Mallar för Undersköterska',
        slug: '/verktyg/cv-mallar',
        beskrivning: 'Professionella CV-mallar anpassade för vårdyrken med rätt struktur för ATS-system'
      },
      {
        namn: 'Jobbcoachen - Karriärråd',
        slug: '/verktyg/jobbcoachen',
        beskrivning: 'Få personliga råd om din karriär inom vården från vår AI-coach'
      },
      {
        namn: 'Personligt Brev-verktyget',
        slug: '/verktyg/personligt-brev',
        beskrivning: 'Skapa ett skräddarsytt personligt brev för undersköterskor på 5 minuter'
      }
    ],

    relaterade: [
      { yrke: 'Sjuksköterska', slug: 'sjukskoterska' },
      { yrke: 'Personlig assistent', slug: 'personlig-assistent' },
      { yrke: 'Barnskötare', slug: 'barnskotare' }
    ]
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ yrke: string }>
}): Promise<Metadata> {
  const { yrke } = await params
  const data = exampleData[yrke]

  if (!data) {
    return {
      title: 'Exempel inte funnet - Jobbcoach.ai',
    }
  }

  const canonicalUrl = `https://jobbcoach.ai/personligt-brev-exempel/${yrke}`

  return {
    title: data.metaTitle,
    description: data.metaDescription,

    // Canonical URL
    alternates: {
      canonical: canonicalUrl,
    },

    // Open Graph metadata
    openGraph: {
      type: 'article',
      url: canonicalUrl,
      title: data.metaTitle,
      description: data.metaDescription,
      siteName: 'Jobbcoach.ai',
      locale: 'sv_SE',
      images: [
        {
          url: 'https://jobbcoach.ai/og-image.png',
          width: 1200,
          height: 630,
          alt: `Personligt brev exempel för ${data.yrke}`,
        },
      ],
    },

    // Twitter Card metadata
    twitter: {
      card: 'summary_large_image',
      title: data.metaTitle,
      description: data.metaDescription,
      images: ['https://jobbcoach.ai/og-image.png'],
    },

    // Additional metadata
    keywords: `personligt brev, ${data.yrke.toLowerCase()}, jobbansökan, CV, ATS-optimering, ${data.yrke.toLowerCase()} jobb, svenska vårdmiljöer`,

    // Author and publisher
    authors: [{ name: 'Jobbcoach.ai' }],
    creator: 'Jobbcoach.ai',
    publisher: 'Jobbcoach.ai',
  }
}

export default async function Page({ params }: { params: Promise<{ yrke: string }> }) {
  const { yrke } = await params
  const data = exampleData[yrke]

  if (!data) {
    notFound()
  }

  // SEO: Schema markup för att garantera att brevinnehållet indexeras

  // 1. Article Schema - för brevinnehållet
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": `Personligt brev exempel för ${data.yrke}`,
    "description": data.intro,
    "articleBody": data.exempelBrev.brevText,
    "author": {
      "@type": "Organization",
      "name": "Jobbcoach.ai",
      "url": "https://jobbcoach.ai"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Jobbcoach.ai",
      "logo": {
        "@type": "ImageObject",
        "url": "https://jobbcoach.ai/logo.png"
      }
    },
    "datePublished": new Date().toISOString(),
    "dateModified": new Date().toISOString(),
    "about": {
      "@type": "JobPosting",
      "title": data.yrke
    },
    "keywords": `personligt brev, ${data.yrke.toLowerCase()}, jobbansökan, CV, ATS-optimering`
  }

  // 2. FAQPage Schema - för featured snippets
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": data.faq.map((item: any) => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a
      }
    }))
  }

  // 3. HowTo Schema - för tips-sektionen
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `Hur du skriver ett personligt brev som ${data.yrke}`,
    "description": `Steg-för-steg guide för att skriva ett ATS-optimerat personligt brev för ${data.yrke}`,
    "step": data.tips.map((tip: any, index: number) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": tip.rubrik,
      "text": tip.text
    }))
  }

  // 4. BreadcrumbList Schema - för navigation
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Hem",
        "item": "https://jobbcoach.ai"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Personligt Brev Exempel",
        "item": "https://jobbcoach.ai/personligt-brev-exempel"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": data.yrke,
        "item": `https://jobbcoach.ai/personligt-brev-exempel/${yrke}`
      }
    ]
  }

  return (
    <>
      {/* Schema markup för SEO - 4 typer för maximal synlighet */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PersonligtBrevExempelPage data={data} />
    </>
  )
}
