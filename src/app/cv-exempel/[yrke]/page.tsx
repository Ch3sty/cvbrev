import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CVExempelPage from './CVExempelPage'

// Example data for all professions
const exampleData: Record<string, any> = {
  'underskoterska': {
    yrke: 'Undersköterska',
    sokvolym: 750,
    metaTitle: 'CV Exempel Undersköterska 2025 - Professionell Mall | Jobbcoach.ai',
    metaDescription: 'Se ett komplett CV-exempel för undersköterska. ATS-optimerat, strukturerat för svensk vård och visar teknisk + empatisk kompetens. Inkluderar tips och branschspecifika nyckelord.',

    // SEO-rik introduktion
    seoIntro: `Söker du jobb som undersköterska och behöver ett CV som sticker ut? Det här exemplet visar hur du strukturerar ett ATS-optimerat CV som passar svenska vårdmiljöer.

Du får se exakt hur du balanserar teknisk kompetens (ADL-stöd, medicindelegering, Cosmic/Procapita) med de mjuka färdigheter som rekryterare söker (empati, kommunikation, samarbete). CV:t visar konkreta resultat från geriatrisk vård och hemtjänst med kvantifierbara exempel.

Använd det som inspiration för ditt eget CV undersköterska och anpassa det efter den tjänst du söker. Läs också våra tips om hur du optimerar ditt personliga brev undersköterska för att öka dina chanser till intervju.`,

    intro: 'Ett professionellt CV-exempel för undersköterska som visar din omvårdnadskompetens, tekniska färdigheter och passion för patientnära arbete. Detta exempel är optimerat för svenska vårdgivare och ATS-system.',

    exempelCV: {
      namn: 'Lisa Andersson',
      titel: 'Undersköterska med specialisering i geriatrisk vård',
      kontakt: {
        telefon: '070-123 45 67',
        epost: 'lisa.andersson@email.se',
        plats: 'Stockholm',
        linkedin: 'linkedin.com/in/lisaandersson'
      },

      profil: 'Erfaren undersköterska med 5+ års erfarenhet av personcentrerad vård inom geriatrik och hemtjänst. Gedigen kompetens i ADL-stöd, demensvård och medicinsk delegering (insulin, PEG, subkutana injektioner). Stresstålig lagspelare som skapar trygghet för patienter genom empati, kommunikation och evidensbaserad omvårdnad. Certifierad i Akta Ryggen och basala hygienrutiner.',

      erfarenhet: [
        {
          titel: 'Undersköterska',
          arbetsgivare: 'Stockholms Äldreboende',
          period: '2019 – Pågående',
          beskrivning: [
            'Ansvarig för personcentrerad omvårdnad av 25-30 patienter dagligen inom geriatrisk avdelning med fokus på demens och palliativ vård',
            'Medicinsk delegering för 20+ patienter: insulin, subkutana injektioner, PEG-sondmatning och inhalation',
            'Uppmärksammade tidiga sjukdomstecken (UVI, dehydrering) vilket minskade akuta inläggningar med 15% på avdelningen',
            'Dokumenterar vårdåtgärder i Cosmic och deltar aktivt i tvärprofessionella vårdplaneringsmöten med sjuksköterskor och läkare',
            'Mentor för 6 nya undersköterskor under introduktionsperiod'
          ]
        },
        {
          titel: 'Undersköterska, Hemtjänst',
          arbetsgivare: 'Stockholms Stad, Hemtjänsten Södermalm',
          period: '2017 – 2019',
          beskrivning: [
            'Självständigt hembesök hos 12-15 brukare dagligen med ADL-stöd, matlagning och medicinhantering',
            'Flexibel schemaläggning inkl. jourer, helger och kvällar för att säkerställa kontinuitet i omsorgen',
            'Implementerade fallpreventionsåtgärder som reducerade antalet fall med 20% i mitt distrikt',
            'Byggde förtroendefulla relationer med brukare och anhöriga genom lyhördhet och respektfull kommunikation'
          ]
        }
      ],

      utbildning: [
        {
          titel: 'Vård- och omsorgsprogrammet, Undersköterska',
          skola: 'Norra Real Gymnasium',
          period: '2014 – 2017',
          beskrivning: 'VFU på Karolinska Universitetssjukhuset (geriatrik) och Sabbatsbergs sjukhus (akutvård)'
        }
      ],

      kompetenser: {
        tekniska: [
          'ADL-stöd och personcentrerad vård',
          'Medicinsk delegering (insulin, PEG, subkutana injektioner)',
          'Demensvård och BPSD-hantering',
          'Palliativ omvårdnad och smärtlindring',
          'Såromläggning och PVK-skötsel',
          'Dokumentationssystem: Cosmic, Procapita',
          'Akta Ryggen-certifierad förflyttningsteknik'
        ],
        personliga: [
          'Empati och relationsskapande',
          'Stresstålig i akuta situationer',
          'Tvärprofessionellt samarbete',
          'Lyhördhet och kommunikation',
          'Problemlösning och initiativförmåga'
        ]
      },

      certifieringar: [
        'Medicinsk delegering – Insulin, PEG, subkutana injektioner (2023)',
        'Akta Ryggen – Ergonomiska lyft- och förflyttningstekniker (2022)',
        'Basala hygienrutiner (2023)',
        'Nutritionsbedömning för äldre (2024)',
        'HLR-certifiering (förnyad 2024)'
      ],

      sprak: [
        { sprak: 'Svenska', niva: 'Modersmål' },
        { sprak: 'Engelska', niva: 'Flytande i tal och skrift' }
      ]
    },

    varforDetFungerar: [
      {
        rubrik: 'ATS-optimerad struktur med branschspecifika nyckelord',
        text: `CV:t innehåller kritiska sökord som ATS-system letar efter: ADL-stöd, personcentrerad vård, demensvård, palliativ omvårdnad, medicinsk delegering, tvärprofessionellt team, Cosmic och Procapita. Dessa termer matchas direkt mot jobbannonser och ger dig högre poäng i automatiska screeningsystem.

Rubriker som "Erfarenhet", "Kompetenser" och "Certifieringar" är standardiserade, vilket gör dem läsbara för både ATS och rekryterare. Detta innebär att systemet kan kategorisera din information korrekt utan att viktig kompetens hamnar i fel sektion.

Genom att använda branschspecifik terminologi visar du att du förstår vårdmiljön och kan börja arbeta direkt utan omfattande introduktion. Rekryterare ser omedelbart att du talar samma språk som deras organisation.`
      },
      {
        rubrik: 'Kvantifierbara resultat istället för ansvarsområden',
        text: `Istället för vaga beskrivningar som "ansvarig för patientvård" visar CV:t konkreta resultat som kan mätas: "minskade akuta inläggningar med 15%", "reducerade fall med 20%", "omvårdnad av 25-30 patienter dagligen", "medicinsk delegering för 20+ patienter".

Siffror gör din kompetens trovärdigt och jämförbar. Rekryterare kan direkt se omfattningen av ditt ansvar och vilken effekt du haft på vårdkvalitet. Detta skiljer dig från kandidater som bara listar arbetsuppgifter utan kontext.

Kvantifierbara resultat visar också initiativförmåga och klinisk blick. Att du uppmärksammat tidiga sjukdomstecken och faktiskt mätt effekten demonstrerar att du tänker bortom rutinuppgifter och bidrar aktivt till patientsäkerhet.`
      },
      {
        rubrik: 'Balans mellan tekniska och mjuka färdigheter',
        text: `CV:t kombinerar teknisk kompetens (medicinsk delegering, förflyttningsteknik, Cosmic/Procapita) med empatiska egenskaper (relationsskapande, lyhördhet, kommunikation). Denna balans är avgörande eftersom vårdyrket kräver både praktiska färdigheter och förmågan att skapa trygghet.

Båda delarna backas upp med konkreta exempel från arbetserfarenheten. Du säger inte bara "empatisk" utan visar det genom "byggde förtroendefulla relationer med brukare och anhöriga genom lyhördhet och respektfull kommunikation". Detta gör egenskaperna trovärdiga.

Rekryterare söker undersköterskor som både kan utföra medicinska arbetsuppgifter OCH hantera den relationella dimensionen av vård. Genom att visa båda aspekterna med tydliga exempel positionerar du dig som en komplett vårdprofessionell.`
      },
      {
        rubrik: 'Certifieringar som trovärdighetsmarkör',
        text: `Dedikerad sektion för certifieringar visar kontinuerlig kompetensutveckling och professionellt engagemang. Att lista Akta Ryggen, basala hygienrutiner, nutritionsbedömning och HLR med förnyelsedatum demonstrerar att du håller dig uppdaterad inom yrket.

Certifieringar fungerar som objektiva bevis på kompetens. Medicinsk delegering med specificerade områden (insulin, PEG, subkutana injektioner) är särskilt viktigt eftersom det direkt påverkar vilka arbetsuppgifter du kan ta ansvar för. Detta kan avgöra om du når intervju eller inte.

Vårdgivare värderar högt medarbetare som tar ansvar för sin egen utveckling. Genom att inkludera både obligatoriska (HLR, basala hygienrutiner) och frivilliga vidareutbildningar (nutritionsbedömning) signalerar du professionalism och lärvilja, två egenskaper som är avgörande för långsiktig anställning inom vård.`
      },
      {
        rubrik: 'Profiltext som säljande sammanfattning',
        text: `Den inledande profiltexten sammanfattar din erfarenhet (5+ år), specialisering (geriatrik och hemtjänst) och unika styrkor på 3-4 meningar. Detta gör att rekryteraren direkt ser om du matchar tjänsten – även om de bara läser de första raderna av ditt CV.

Profiltexten innehåller både tekniska nyckelord (ADL-stöd, demensvård, medicinsk delegering) och personliga egenskaper (stresstålig, empati, lagspelare), vilket ger en helhetsbild av dig som kandidat. Detta är särskilt effektivt när rekryterare screener många CV:n snabbt.

Genom att nämna specifika certifieringar (Akta Ryggen, basala hygienrutiner) redan i profiltexten visar du omedelbart att du uppfyller grundläggande krav. Rekryteraren behöver inte scrolla ner för att verifiera detta, vilket ökar chansen att de läser vidare.`
      },
      {
        rubrik: 'Tydlig progression och ansvar',
        text: `Från hemtjänst (självständigt arbete med 12-15 brukare) till äldreboende (teamarbete med 25-30 patienter och mentorskap) visar CV:t en naturlig karriärprogression. Detta indikerar att du utvecklats från självständig yrkesutövare till senior medarbetare som kan vägleda andra.

Att nämna mentorskap för 6 nya undersköterskor visar att arbetsgivaren litar på dig tillräckligt för att anförtro introduktion av nyanställda. Detta är ett tydligt tecken på att du vuxit in i en seniorroll och kan ta pedagogiskt ansvar, vilket är attraktivt för arbetsgivare.

Progressionen visar också bredd i erfarenhet. Du har arbetat både i hemtjänst (flexibilitet, självständighet) och institutionsvård (teamarbete, akuta situationer), vilket gör dig anpassningsbar och kvalificerad för olika vårdmiljöer.`
      }
    ],

    tips: [
      {
        rubrik: 'Inkludera rätt nyckelord för din vårdspecialisering',
        text: `ATS-system söker efter specifika termer beroende på vårdmiljö. För geriatrik använd nyckelord som demensvård, BPSD-hantering, palliativ omvårdnad, kroniska sjukdomar och nutritionsbedömning. För akutvård fokusera på triage, vitalparametrar, akuta tillstånd, snabba beslut och prioriteringsförmåga. För hemtjänst betona ADL-stöd, självständigt arbete, hembesök, social omsorg och flexibilitet.

Läs jobbannonsen noga och identifiera vilka termer som återkommer. Om arbetsgivaren söker "erfarenhet av palliativ vård", använd exakt den formuleringen i ditt CV – inte synonymer som "erfarenhet av vård i livets slutskede". ATS-system matchar ofta ordagrant, vilket innebär att felaktig terminologi kan göra att ditt CV sorteras bort trots relevant kompetens.

Placera nyckelorden strategiskt i profiltext, erfarenhetssektion och kompetenslista. Detta säkerställer att de identifieras oavsett vilken del av CV:t som ATS-systemet prioriterar vid screening.`
      },
      {
        rubrik: 'Kvantifiera din erfarenhet för ökad trovärdighet',
        text: `Konkreta siffror gör ditt CV mer trovärdigt och jämförbart. Transformera vaga påståenden till mätbara fakta genom att alltid fråga dig: hur många, hur länge, hur ofta?

**UNDVIK:** "Ansvarig för patientvård"
**BRA:** "Omvårdnad av 25-30 patienter dagligen inom geriatrisk avdelning"

Nämn specifika detaljer som stärker din erfarenhet: antal års erfarenhet (både totalt och inom specialisering), antal VFU-perioder under utbildning, antal patienter med medicinsk delegering, eller specifika förbättringar du bidragit till ("minskade akuta inläggningar med 15%").

Om du arbetat deltid, räkna om till heltidsekvivalent för att ge rätt bild av din erfarenhet: "3 år deltid (60%), motsvarande 5 års heltidserfarenhet". Var också konkret med schema-flexibilitet om du kan arbeta jour, natt eller helger – detta är ofta avgörande vid rekrytering.`
      },
      {
        rubrik: 'Visa konkreta resultat från din omvårdnad',
        text: `Rekryterare vill se vad du åstadkommit, inte bara vad du varit ansvarig för. Fokusera på resultat och effekter av ditt arbete istället för att lista rutinuppgifter.

**UNDVIK:** "Ansvarig för medicindelegering"
**BRA:** "Medicinsk delegering för 20+ patienter dagligen (insulin, PEG, subkutana injektioner) vilket säkerställde korrekt medicinering utan avvikelser under 18 månader"

Om du inte har exakta siffror på förbättringar kan du beskriva situationer som visar din kompetens: "Identifierade tidiga tecken på urinvägsinfektion hos patient med demens, kontaktade läkare och initierade behandling innan tillståndet förvärrades, vilket undvek akut inläggning". Detta demonstrerar klinisk blick, initiativförmåga och förmåga att agera proaktivt.

Andra resultat att lyfta fram: fallprevention, nutrition (viktökning hos undernärda patienter), minskad oro hos dementa patienter genom strukturerade aktiviteter, eller förbättrad kommunikation med anhöriga.`
      },
      {
        rubrik: 'Anpassa profiltext efter jobbannonsen',
        text: `Din profiltext (den inledande sammanfattningen högst upp i CV:t) bör skräddarsys för varje jobb du söker. Om jobbannonsen söker "undersköterska till demensboende", börja med "Erfaren undersköterska med specialisering i demensvård och BPSD-hantering". För palliativ vård skriv "Undersköterska med gedigen erfarenhet av palliativ omvårdnad och smärtlindring".

Inkludera alltid dessa element i profiltexten: antal års erfarenhet (totalt och inom specialisering), typ av vårdmiljö du arbetat i, tekniska nyckelkompetenser som är relevanta för tjänsten (medicindelegering, Cosmic/Procapita, specifika vårdformer), och 1-2 personliga egenskaper som matchar jobbannonsen (empatisk, stresstålig, initiativrik).

Håll profiltexten till max 4 meningar och skriv den sist – när du vet exakt vad arbetsgivaren söker efter. Detta gör den fokuserad och relevant istället för generisk. Tänk på profiltexten som din 30-sekunders elevator pitch: vad är det viktigaste rekryteraren behöver veta om dig?`
      },
      {
        rubrik: 'Lyft fram certifieringar och kompetensutveckling',
        text: `Skapa en dedikerad sektion för certifieringar och utbildningar. Detta visar att du är uppdaterad, tar ditt yrke på allvar och investerar i din egen utveckling – egenskaper som vårdgivare värderar högt.

Viktiga certifieringar för undersköterskor inkluderar: Medicinsk delegering (specificera exakt vilka områden: insulin, PEG, subkutana injektioner, inhalation), Akta Ryggen (ergonomiska förflyttningstekniker), Basala hygienrutiner, HLR (med förnyelsedatum), och Nutritionsbedömning. Om du har specialiserade utbildningar som palliativ vård nivå 1-2, demensvård eller diabetesvård, ta definitivt med dessa.

Glöm inte att inkludera förnyelsedatum för tidsbegränsade certifieringar som HLR och basala hygienrutiner. Detta visar att du är aktiv och uppdaterad. Om du genomgått intern utbildning på arbetsplatsen (exempelvis "Palliativ vård nivå 1 via Stockholms stad" eller "Diabetesvård", ta med även dessa – de visar arbetsgivarens förtroende och din vilja att utvecklas.`
      },
      {
        rubrik: 'Balansera tekniska och mjuka färdigheter med bevis',
        text: `Lista både tekniska färdigheter (medicindelegering, förflyttningsteknik, såromläggning, Cosmic/Procapita) och personliga egenskaper (empati, kommunikation, stresstålig, lagspelare). Men här är nyckeln: backa alltid upp de personliga egenskaperna med konkreta exempel i erfarenhetssektionen.

**UNDVIK:** Bara lista "Empatisk" under personliga egenskaper
**BRA:** Skriv i arbetsbeskrivning: "Byggde förtroendefulla relationer med brukare och anhöriga genom lyhördhet och respektfull kommunikation"

**UNDVIK:** Bara lista "Stresstålig"
**BRA:** Skriv i arbetsbeskrivning: "Hanterade 25-30 patienter dagligen i högt tempo med samtidiga medicineringar, måltider och akuta försämringar"

Tekniska färdigheter kan du lista direkt (de är verifierbara), men mjuka egenskaper behöver bevis för att bli trovärdiga. Koppla varje personlig egenskap till en specifik situation eller uppgift i din arbetserfarenhet. Detta gör skillnaden mellan ett CV som påstår och ett CV som bevisar.`
      }
    ],

    faq: [
      {
        fraga: 'Hur långt ska mitt CV som undersköterska vara?',
        svar: 'För undersköterskor med 0-5 års erfarenhet: 1 sida. Med 5-10 års erfarenhet: 1-2 sidor. Med 10+ år och specialisering: Max 2 sidor. Fokusera på relevant erfarenhet – du behöver inte inkludera varje vikariat eller timanställning. Prioritera djup över bredd.'
      },
      {
        fraga: 'Ska jag inkludera VFU-perioder om jag är nyutexaminerad?',
        svar: 'Ja, definitivt! Om du är nyutexaminerad eller har begränsad erfarenhet, lista dina VFU-perioder under "Erfarenhet" eller "Praktik". Nämn vårdmiljö (geriatrik, akutvård, hemtjänst), arbetsgivare och vad du gjorde. Exempel: "VFU Karolinska Universitetssjukhuset, Geriatrisk avdelning – ADL-stöd, medicindelning, dokumentation i Cosmic".'
      },
      {
        fraga: 'Hur visar jag medicinsk delegering i mitt CV?',
        svar: 'Skapa en "Certifieringar"-sektion och lista specifikt vad du har delegering för: "Medicinsk delegering – Insulin, PEG-sondmatning, subkutana injektioner (2023)". I erfarenhetssektionen kan du också nämna antal patienter: "Medicinsk delegering för 20+ patienter dagligen". Om du inte har delegering men är villig att ta det, skriv under kompetenser: "Motiverad att genomgå medicindelegering".'
      },
      {
        fraga: 'Ska jag ha med profilbild på mitt CV?',
        svar: 'I Sverige är det vanligt men inte krav. För vårdyrken kan en professionell, vänlig bild vara positivt eftersom det signalerar tillgänglighet och empati. Viktigt: Använd en professionell bild med neutral bakgrund, inte ett party-foto. Om du är osäker, använd en CV-mall utan bild – det är aldrig fel.'
      },
      {
        fraga: 'Hur anpassar jag mitt CV för olika vårdmiljöer?',
        svar: 'Anpassa profiltext och prioritera relevant erfarenhet. För geriatrik: betona demensvård, palliativ omvårdnad, tålamod. För akutvård: lyft fram stresshantering, snabba beslut, prioriteringsförmåga. För hemtjänst: fokusera på självständighet, flexibilitet, problemlösning. Behåll samma CV-struktur men justera vilken erfarenhet du expanderar mest på.'
      },
      {
        fraga: 'Vad gör jag om jag har luckor i mitt CV?',
        svar: 'Var ärlig men strategisk. Om luckan beror på föräldraledighet, studier eller vård av anhörig, nämn det kortfattat: "Föräldraledighet 2020-2021". Om luckan är längre, fokusera på vad du gjorde under tiden som är relevant: "Vidareutbildning inom palliativ vård" eller "Ideellt arbete inom elder care". Rekryterare förstår att livet händer – det viktiga är att du kan förklara det om de frågar.'
      },
      {
        fraga: 'Hur visar jag att jag är stresstålig utan att bara säga det?',
        svar: 'Beskriv konkreta situationer istället. Exempel: "Hanterade akuta försämringar och konfusionstillstånd genom att bevara lugnet, kontakta ansvarig sjuksköterska och övervaka vitalparametrar". Eller: "Arbetat med 25-30 patienter dagligen i högt tempo med samtidiga medicineringar, måltider och vårdåtgärder". Detta visar att du faktiskt arbetat i stressiga miljöer.'
      },
      {
        fraga: 'Ska jag lista alla arbetsgivare eller bara de viktigaste?',
        svar: 'Fokusera på relevant och nyare erfarenhet. Om du jobbat som undersköterska på 5 olika äldreboenden, lista de 2-3 senaste och mest relevanta. Du kan sammanfatta äldre erfarenhet: "Tidigare erfarenhet från äldreboenden i Stockholms stad (2015-2017)". Prioritera djup över bredd – bättre att detaljerat beskriva 2 roller än att ytligt lista 6.'
      },
      {
        fraga: 'Hur mycket personlig information ska jag inkludera?',
        svar: 'Minimalt. Du behöver inte ange ålder, personnummer, civilstånd eller barn. Inkludera: namn, telefon, e-post, stad (inte fullständig adress), och eventuellt LinkedIn. Om du har körkort och det är relevant för hemtjänst, nämn det under kompetenser. Mindre är mer – fokusera på yrkesrelaterad information.'
      },
      {
        fraga: 'Hur lyfter jag fram teamarbete och samarbete?',
        svar: 'Beskriv konkret hur du samarbetar. Exempel: "Deltar aktivt i tvärprofessionella vårdplaneringsmöten med sjuksköterskor, läkare och arbetsterapeuter", "Mentor för 6 nya undersköterskor under introduktionsperiod", "Samarbetar dagligen med sjuksköterskor kring medicinering och vårdplanering". Detta visar att du kan kommunicera över professioner och ta ansvar.'
      }
    ],

    kategori: 'vard',
    relaterade: [
      { yrke: 'Sjuksköterska', slug: 'sjukskoterska' },
      { yrke: 'Vårdbiträde', slug: 'vardbitrade' },
      { yrke: 'Personlig assistent', slug: 'personlig-assistent' }
    ]
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ yrke: string }> }): Promise<Metadata> {
  const { yrke } = await params
  const data = exampleData[yrke]

  if (!data) {
    return {
      title: 'CV-exempel hittas inte',
    }
  }

  return {
    title: data.metaTitle,
    description: data.metaDescription,
    openGraph: {
      title: data.metaTitle,
      description: data.metaDescription,
      type: 'article',
    },
  }
}

// Generera statiska paths för alla yrken vid build-time (SSG)
export async function generateStaticParams() {
  const yrken = Object.keys(exampleData)
  return yrken.map((yrke) => ({
    yrke,
  }))
}

export default async function Page({ params }: { params: Promise<{ yrke: string }> }) {
  const { yrke } = await params
  const data = exampleData[yrke]

  if (!data) {
    notFound()
  }

  return <CVExempelPage data={data} />
}
