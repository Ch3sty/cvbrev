import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CVExempelPage from './CVExempelPage'
import { convertToCVMetadata } from '@/lib/cv/cv-metadata-converter'
import { getTemplateGenerator } from '@/lib/cv/templates'

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
          'Dokumentationssystem: Cosmic och Procapita (Expert, 6+ år daglig användning)',
          'Medicinsk delegering – insulin, PEG, subkutana injektioner (Avancerad, 5+ år)',
          'Demensvård och BPSD-hantering (Expert, 5+ år inom geriatrik)',
          'ADL-stöd och personcentrerad vård',
          'Palliativ omvårdnad och smärtlindring',
          'Såromläggning och PVK-skötsel',
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
        text: `Istället för vaga beskrivningar som "ansvarig för patientvård" visar CV:t konkreta resultat:
- "Omvårdnad av 25-30 patienter dagligen"
- "Minskade akuta inläggningar med 15%"
- "Reducerade fall med 20%"
- "Medicinsk delegering för 20+ patienter"

Varför detta fungerar: Rekryterare inom vård ser hundratals CV:n där undersköterskor skriver "ansvarig för patientvård" eller "hanterade medicindelegering" utan kontext. Vad betyder "ansvarig för patientvård"? Tio patienter eller 40? En timme per dag eller hela skiftet?

Siffror ger omfattning och trovärdighet. Skillnaden mellan "omvårdnad av patienter" och "omvårdnad av 25-30 patienter dagligen" är enorm – det visar att du kan hantera hög arbetsbelastning i stressiga miljöer. Kvantifierbara resultat visar också initiativförmåga och klinisk blick. Att du uppmärksammade tidiga sjukdomstecken och faktiskt mätte effekten (15% minskade inläggningar) demonstrerar att du tänker bortom rutinuppgifter och bidrar aktivt till patientsäkerhet.`
      },
      {
        rubrik: 'Balans mellan tekniska och mjuka färdigheter',
        text: `CV:t kombinerar teknisk kompetens (medicinsk delegering, förflyttningsteknik, Cosmic/Procapita) med empatiska egenskaper (relationsskapande, lyhördhet, kommunikation). Denna balans är avgörande eftersom vårdyrket kräver både praktiska färdigheter och förmågan att skapa trygghet.

Båda delarna backas upp med konkreta exempel från arbetserfarenheten. Du säger inte bara "empatisk" utan visar det genom "byggde förtroendefulla relationer med brukare och anhöriga genom lyhördhet och respektfull kommunikation".

Varför inte bara buzzwords: Istället för att lista "empatisk, kommunikativ, flexibel, stresstålig" (klassisk buzzword bingo utan substans) visar CV:t dessa egenskaper genom konkreta exempel. Detta är avgörande – rekryterare läser "empatisk och kommunikativ" i nio av tio undersköterske-CV:n, men konkreta bevis sticker ut.

Att skriva "stresstålig" betyder inget. Att skriva "hanterade 25-30 patienter dagligen i högt tempo med samtidiga medicineringar, måltider och akuta försämringar" visar att du faktiskt arbetat i stressiga miljöer. Vårdgivare söker undersköterskor som både kan utföra medicinska arbetsuppgifter och hantera den relationella dimensionen av vård.`
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
  },

  'forskollarare': {
    yrke: 'Förskollärare',
    sokvolym: 880,
    metaTitle: 'CV Exempel Förskollärare 2025 - Professionell Mall | Jobbcoach.ai',
    metaDescription: 'Se ett komplett CV-exempel för förskollärare. ATS-optimerat, strukturerat för Lpfö 18 och visar pedagogisk kompetens. Inkluderar dokumentationssystem och certifieringar.',

    // SEO-rik introduktion
    seoIntro: `Söker du jobb som förskollärare och undrar hur ditt CV ska struktureras för att sticka ut? Det här cv-exemplet för förskollärare visar hur du kombinerar pedagogisk kompetens med konkreta resultat som fångar rekryterares uppmärksamhet.

Exemplet balanserar branschspecifika system (Unikum, Lpfö 18, Bornholmsmodellen) med kvantifierbara resultat som verkligen visar omfattning av din erfarenhet. Istället för vaga beskrivningar som "ansvarig för barngrupp" ser du konkreta exempel: "Pedagogisk ansvarig för barngrupp med 22 barn, 1-3 år" och "Minskade konflikter i barngruppen med 30% genom implementering av teckenspråk". CV:t är ATS-optimerat för svenska förskolemiljöer och inkluderar certifieringar med förnyelsedatum, dokumentationssystem som rekryterare letar efter, och en progression från barnskötare till avdelningsansvarig.

Använd exemplet som inspiration när du skriver ditt eget CV. Fokusera på barngruppsstorlek, pedagogiska metoder du använt, och resultat du uppnått. Detta ökar dina chanser till intervju rejält.`,

    intro: 'Ett professionellt CV-exempel för förskollärare som visar din pedagogiska kompetens, erfarenhet av dokumentationssystem och passion för barns utveckling. Detta exempel är optimerat för svenska kommunala förskolor och ATS-system.',

    exempelCV: {
      namn: 'Emma Lindström',
      titel: 'Legitimerad förskollärare med specialisering i språkutveckling och inkluderande pedagogik',
      kontakt: {
        telefon: '070-123 45 67',
        epost: 'emma.lindstrom@email.se',
        plats: 'Stockholm',
        linkedin: 'linkedin.com/in/emmalindstrom'
      },

      profil: 'Legitimerad förskollärare med 8+ års erfarenhet från språkutveckling och inkluderande pedagogik i kommunala förskolor. Specialist på Lpfö 18, Unikum, teckenspråk och konflikthantering med gedigen erfarenhet av att skapa trygg lärandemiljö där varje barns unika förmågor utvecklas. Empatisk och pedagogisk teamplayer som brinner för lekbaserat lärande och barns allsidiga utveckling.',

      erfarenhet: [
        {
          titel: 'Förskollärare, Avdelningsansvarig',
          arbetsgivare: 'Södermalms förskola, Stockholm Stad',
          period: '2020 – Pågående',
          beskrivning: [
            'Pedagogisk ansvarig för barngrupp med 22 barn, 1-3 år, tillsammans med 2 barnskötare',
            'Minskade konflikter i barngruppen med 30% genom implementering av teckenspråk och bildstöd',
            'Utvecklade 5 tematiska lärandeaktiviteter enligt Lpfö 18 med fokus på språkutveckling och naturvetenskap',
            'Använder Unikum dagligen för pedagogisk dokumentation, utvecklingssamtal och kommunikation med vårdnadshavare',
            'Mentorskap för 2 nyutexaminerade förskollärare under introduktionsperiod (6 månader vardera)'
          ]
        },
        {
          titel: 'Förskollärare',
          arbetsgivare: 'Vasastans förskola, Stockholm Stad',
          period: '2017 – 2020',
          beskrivning: [
            'Ansvarig för barngrupp med 18 barn, 3-5 år, med fokus på språkutveckling och förskoleförberedande aktiviteter',
            'Reducerade övergångsproblem till förskoleklass med 25% genom strukturerad samverkan med F-klass',
            'Implementerade Bornholmsmodellen för språkutveckling vilket förbättrade fonologisk medvetenhet hos 85% av barnen',
            'Samordnade 4 utvecklingssamtal per barn och år med strukturerad uppföljning i Pedagog Stockholm'
          ]
        },
        {
          titel: 'Barnskötare / Vikarie',
          arbetsgivare: 'Diverse förskolor, Stockholm Stad',
          period: '2015 – 2017',
          beskrivning: [
            'Vikarierande barnskötare på 8 olika förskolor vilket gav bred erfarenhet av olika pedagogiska inriktningar (Reggio Emilia, Montessori, traditionell)',
            'Stöttade förskollärare i daglig verksamhet för barngrupper om 15-25 barn, åldersblandade grupper 1-5 år',
            'Fick erfarenhet av olika dokumentationssystem (Unikum, Pedagog Stockholm, IST) och AV-media för dokumentation'
          ]
        }
      ],

      utbildning: [
        {
          titel: 'Förskollärarutbildning, 210 hp',
          skola: 'Stockholms universitet',
          period: '2012 – 2015',
          beskrivning: 'Specialisering inom språkutveckling och flerspråkighet. VFU-perioder på 4 olika förskolor med fokus på inkluderande pedagogik och barns delaktighet.'
        }
      ],

      kompetenser: {
        tekniska: [
          'Lpfö 18 (Expert, 8+ år)',
          'Unikum – dokumentationssystem (Avancerad, 5+ år)',
          'Teckenspråk grundkurs (Avancerad, 6+ år)',
          'Första hjälpen barn',
          'Bornholmsmodellen (språkutveckling)',
          'Konflikthantering och ICDP (International Child Development Programme)',
          'Pedagog Stockholm och IST (dokumentationssystem)'
        ],
        personliga: [
          'Empatisk och lyhörd (skapade trygg miljö för 22 barn med olika behov och kulturell bakgrund)',
          'Pedagogisk kommunikation (genomförde 80+ utvecklingssamtal med vårdnadshavare, 95% positiv feedback)',
          'Flexibel och lösningsorienterad (hanterade akuta sjukfrånvaron i teamet genom omorganisation av dagsprogram)',
          'Kreativ problemlösare (utvecklade 5 lekbaserade lärandeaktiviteter för barn med olika inlärningsstilar)',
          'Samarbetsvillig teamplayer (samordnade verksamhet med 2 barnskötare och 3 kollegor på förskolan)'
        ]
      },

      certifieringar: [
        'Första hjälpen barn och HLR (förnyad 2024)',
        'Teckenspråk grundkurs (2022)',
        'ICDP – Dialogpedagogik (2021)',
        'Bornholmsmodellen – språkutveckling (2019)',
        'Allergi- och astmautbildning för förskola (2023)'
      ],

      sprak: [
        { sprak: 'Svenska', niva: 'Modersmål' },
        { sprak: 'Engelska', niva: 'Flytande i tal och skrift' },
        { sprak: 'Teckenspråk', niva: 'Grundläggande' }
      ]
    },

    varforDetFungerar: [
      {
        rubrik: 'ATS-optimerad struktur med branschspecifika nyckelord',
        text: `CV:t innehåller nyckelord som rekryteringssystem och chefer söker efter: Lpfö 18, Unikum, språkutveckling, inkluderande pedagogik, Bornholmsmodellen, teckenspråk och utvecklingssamtal. Dessa termer visar att du behärskar både moderna läroplanen och de digitala verktyg som används i svenska kommunala förskolor. Detta gör att ditt CV passerar ATS-systemens första screening.`
      },
      {
        rubrik: 'Kvantifierbara resultat istället för vaga beskrivningar',
        text: `CV:t visar konkreta siffror: "22 barn, 1-3 år", "85% förbättrade fonologisk medvetenhet", "80+ utvecklingssamtal årligen", "minskade konflikter med 30%".

**Varför siffror är avgörande för rekryterare**: Rekryterare ser hundratals CV:n där förskollärare skriver "ansvarig för barngrupp" eller "arbetade med språkutveckling" utan någon kontext. Vad betyder "ansvarig för barngrupp"? Åtta barn eller 25? Ett-åringar eller femåringar? Tre månader eller tre år?

Siffror ger omfattning och trovärdighet. Skillnaden mellan "arbetade med språkutveckling" och "85% av barnen förbättrade fonologisk medvetenhet efter Bornholmsmodellen" är enorm – det visar att du faktiskt mäter effekten av ditt pedagogiska arbete.

Detta är ett anti-pattern i många förskollärare-CV:n: Vaga resultat som "bidrog till barnens utveckling". Kvantifierbara resultat gör att du sticker ut och ger rekryteraren något konkret att fråga om under intervjun.`
      },
      {
        rubrik: 'Balans mellan pedagogisk och relationell kompetens',
        text: `CV:t listar inte bara "empatisk, kommunikativ, flexibel, kreativ" – det klassiska buzzword bingo utan substans. Istället VISAR det dessa egenskaper genom konkreta exempel:

- "Empatisk och lyhörd" backas upp med "(skapade trygg miljö för 22 barn med olika behov och kulturell bakgrund)"
- "Pedagogisk kommunikation" visas genom "(genomförde 80+ utvecklingssamtal, 95% positiv feedback)"
- "Flexibel" exemplifieras med "(hanterade akuta sjukfrånvaron genom omorganisation av dagsprogram)"

**Varför detta är bättre än tomma påståenden**: Att skriva "empatisk och kommunikativ" betyder ingenting – varje kandidat påstår det. Rekryterare läser "flexibel och kreativ" i nio av tio förskollärare-CV:n, men konkreta bevis sticker ut.

Detta undviker anti-pattern "buzzword bingo" som CV_KVALITET_STANDARD.md varnar för. Moderna förskolor kräver både pedagogisk expertis OCH förmåga att samarbeta med barn, vårdnadshavare och kollegor – och du måste VISA det, inte bara påstå det.`
      },
      {
        rubrik: 'Certifieringar som trovärdighetsmarkör',
        text: `Alla certifieringar har årtal: "Första hjälpen barn och HLR (förnyad 2024)", "Teckenspråk grundkurs (2022)", "ICDP – Dialogpedagogik (2021)". Detta visar att du håller dig uppdaterad med säkerhetsrutiner och pedagogiska metoder. Förnyelsedatum är särskilt viktigt för första hjälpen och HLR som är tidsbegränsade och kräver regelbunden uppdatering.`
      },
      {
        rubrik: 'Profiltext som säljande sammanfattning',
        text: `Profiltexten följer tydlig struktur: "8+ års erfarenhet" (omfattning) → "Specialist på Lpfö 18, Unikum, teckenspråk" (konkreta system) → "Empatisk och pedagogisk teamplayer" (drivkrafter). De tre meningarna ger rekryteraren direkt överblick av kompetensområden, erfarenhetsnivå och vad som motiverar dig.`
      },
      {
        rubrik: 'Tydlig progression och ansvarsutveckling',
        text: `Karriärutvecklingen är synlig: Barnskötare/Vikarie (8 förskolor, bred erfarenhet) → Förskollärare (fokus på språkutveckling) → Avdelningsansvarig (mentorskap för 2 nyutexaminerade). Progressionen visar både bredd (olika pedagogiska inriktningar) och djup (specialisering inom språkutveckling och ledarskap). Detta signalerar ambition och kompetensutveckling.`
      }
    ],

    tips: [
      {
        rubrik: 'Kvantifiera din erfarenhet med barngruppsstorlek och ålder',
        text: `Istället för "Ansvarig för barngrupp" ska du specificera antal barn och åldersgrupp. Detta ger rekryterare konkret bild av din erfarenhet och arbetsbelastning.

**Exempel på före/efter**:

❌ "Ansvarig för barngrupp och pedagogisk dokumentation"

✅ "Pedagogisk ansvarig för barngrupp med 22 barn, ålder 1-3 år. Ansvarade för pedagogisk planering enligt Lpfö 18, dokumentation i Unikum och 80+ utvecklingssamtal årligen."

Detta visar omfattning, åldersspecialisering och konkreta arbetsuppgifter som ger rekryteraren kontext till din kompetens.`
      },
      {
        rubrik: 'Visa konkreta resultat från din pedagogiska verksamhet',
        text: `Kvantifierbara resultat sticker ut. Använd procent, antal barn, eller förbättrade utvecklingsområden för att visa effekten av ditt pedagogiska arbete.

**Exempel på före/efter**:

❌ "Arbetade med språkutveckling och konflikthantering i barngruppen"

✅ "Implementerade Bornholmsmodellen vilket förbättrade fonologisk medvetenhet hos 85% av barnen. Minskade konflikter i barngruppen med 30% genom teckenspråk och bildstöd."

Siffror ger trovärdighet och visar mätbar effekt av dina pedagogiska insatser.`
      },
      {
        rubrik: 'Inkludera Lpfö 18-koppling i dina erfarenhetsbeskrivningar',
        text: `Lpfö 18 är grunden för all förskolverksamhet i Sverige. Koppla dina arbetsuppgifter till läroplanens mål (normer och värden, utveckling och lärande, barns inflytande).

Exempel: "Utvecklade 5 tematiska lärandeaktiviteter enligt Lpfö 18 med fokus på språkutveckling och naturvetenskap" visar att du arbetar målinriktat enligt läroplanen. Detta är exakt vad kommunala förskolor och förskoleenheter letar efter hos sökande.`
      },
      {
        rubrik: 'Nämn dokumentationssystem du använt',
        text: `Dokumentationssystem visar teknisk kompetens och att du är bekant med digitala verktyg som används i svenska förskolor. Lista system du använt: Unikum, Pedagog Stockholm, IST, AV-media.

Förklara användningsområde: "Använder Unikum dagligen för pedagogisk dokumentation, utvecklingssamtal och kommunikation med vårdnadshavare". Detta ger konkret bild av hur du använder systemet i praktiken, inte bara att du känner till det.`
      },
      {
        rubrik: 'Balansera mjuka färdigheter med konkreta bevis',
        text: `Undvik "buzzword bingo" där du bara listar "empatisk, flexibel, kreativ" utan kontext. Visa istället dessa egenskaper genom konkreta exempel från din arbetserfarenhet.

**Exempel på före/efter**:

❌ "Empatisk, kommunikativ, flexibel och kreativ problemlösare"

✅ "Empatisk och lyhörd (skapade trygg miljö för 22 barn med olika behov och kulturell bakgrund). Flexibel (hanterade akuta sjukfrånvaron genom omorganisation av dagsprogram)."

Bevis sticker ut. Rekryterare ser tomma listor i varje tredje CV.`
      }
    ],

    faq: [
      {
        fraga: 'Hur långt ska mitt CV som förskollärare vara?',
        svar: 'Ett CV för nyutexaminerade förskollärare (0-3 år) ska vara 1 sida. För erfarna förskollärare (3-10+ år) kan CV:t vara 1-2 sidor, med fokus på de senaste 10 åren. Äldre erfarenheter kan summeras kortare eller utelämnas. Prioritera alltid kvalitet framför kvantitet – konkreta resultat är viktigare än att fylla sidor.'
      },
      {
        fraga: 'Ska jag ha med profilbild på mitt CV?',
        svar: 'Profilbild är frivilligt i Sverige och inget krav. Vissa arbetsgivare föredrar CV utan bild för att undvika omedvetna fördomar. Fokusera istället på innehållet – kvantifierbara resultat, branschspecifika system och certifieringar. Om du väljer att ha bild, använd professionellt foto med neutral bakgrund.'
      },
      {
        fraga: 'Vad gör jag om jag har luckor i mitt CV?',
        svar: 'Var ärlig och förklara kort: föräldraledighet, studier, vård av anhörig eller personlig utveckling. Exempel: "Föräldraledighet (2021-2022)" eller "Studier i specialpedagogik (2020-2021)". Fokusera sedan på din kompetens och erfarenhet. Rekryterare förstår att livet innebär pauser. Luckor är inget problem om du kan förklara dem och visa vad du lärt dig under perioden.'
      },
      {
        fraga: 'Ska jag nämna Lpfö 18 i mitt CV som förskollärare?',
        svar: 'JA, absolut! Lpfö 18 är grunden för all förskolverksamhet i Sverige. Nämn det i din profiltext OCH i erfarenhetsbeskrivningar där du kopplar arbetsuppgifter till läroplanens mål. Exempel: "Utvecklade tematiska lärandeaktiviteter enligt Lpfö 18 med fokus på språkutveckling och naturvetenskap". Detta visar att du arbetar målinriktat och förstår ramverket som styr svensk förskoleverksamhet.'
      },
      {
        fraga: 'Hur beskriver jag barngruppsstorlek och ansvarsområde?',
        svar: 'Var konkret med antal barn, åldersgrupp och antal kollegor i teamet. Exempel: "Pedagogisk ansvarig för barngrupp med 22 barn, 1-3 år, tillsammans med 2 barnskötare". Detta ger rekryterare kontext till din arbetsbelastning och erfarenhet av att arbeta med specifika åldersgrupper. Undvik vaga formuleringar som "ansvarig för barngrupp" eller "arbetade med barn" utan att specificera omfattning.'
      },
      {
        fraga: 'Ska jag inkludera VFU-perioder i mitt CV?',
        svar: 'JA, om du är nyutexaminerad (0-3 år erfarenhet). Nämn antal VFU-perioder, olika förskolemiljöer och pedagogiska inriktningar du fick erfarenhet av. Exempel: "VFU-perioder på 4 olika förskolor med fokus på inkluderande pedagogik och barns delaktighet". Efter 3-5 års arbetslivserfarenhet kan du sammanfatta VFU kortare under Utbildning istället för att lista varje period.'
      },
      {
        fraga: 'Vilka dokumentationssystem ska jag nämna?',
        svar: 'Nämn alla system du använt: Unikum, Pedagog Stockholm, IST, AV-media för dokumentation. Förklara användningsområde för att visa konkret kompetens: "Använder Unikum dagligen för pedagogisk dokumentation, utvecklingssamtal och kommunikation med vårdnadshavare". Detta visar teknisk kompetens och att du är bekant med digitala verktyg som används i svenska förskolor. Kommunala förskolor söker aktivt efter förskollärare som behärskar dessa system.'
      },
      {
        fraga: 'Hur lyfter jag fram specialisering inom språkutveckling?',
        svar: 'Nämn specialiseringen i din profiltext ("Specialist på språkutveckling och inkluderande pedagogik") och backa upp med konkreta metoder i erfarenhetsbeskrivningarna: Bornholmsmodellen, teckenspråk, flerspråkighet, TAKK (Tecken som AKK). Kvantifiera resultat om möjligt: "Implementerade Bornholmsmodellen vilket förbättrade fonologisk medvetenhet hos 85% av barnen". Detta visar både teoretisk kunskap och praktisk tillämpning med mätbara resultat.'
      },
      {
        fraga: 'Hur visar jag kompetens i teckenspråk?',
        svar: 'Lista teckenspråk under både Kompetenser ("Teckenspråk grundkurs (Avancerad, 6+ år)") och Certifieringar ("Teckenspråk grundkurs (2022)"). Beskriv konkret tillämpning i erfarenhetsbeskrivningar: "Minskade konflikter i barngruppen med 30% genom implementering av teckenspråk och bildstöd". Detta visar att du inte bara gått kursen, utan aktivt använder teckenspråk som pedagogiskt verktyg i vardagen.'
      },
      {
        fraga: 'Vilka certifieringar är viktigast att lyfta fram?',
        svar: 'Prioritera dessa certifieringar: Första hjälpen barn och HLR (med förnyelsedatum!), teckenspråk, ICDP/dialogpedagogik, allergi- och astmautbildning, Bornholmsmodellen. Ange alltid årtal och förnyelsedatum för tidsbegränsade certifieringar: "Första hjälpen barn och HLR (förnyad 2024)". Detta visar att du håller dig uppdaterad med aktuella säkerhetsrutiner och pedagogiska metoder. Förskolor kräver giltiga första hjälpen-certifikat, så förnyelsedatum är avgörande för att visa att din certifiering är aktuell.'
      }
    ],

    kategori: 'utbildning',
    relaterade: [
      { yrke: 'Grundskollärare', slug: 'grundskollarare' },
      { yrke: 'Specialpedagog', slug: 'specialpedagog' },
      { yrke: 'Barnskötare', slug: 'barnskotare' }
    ]
  },

  'receptionist': {
    yrke: 'Receptionist',
    sokvolym: 920,
    metaTitle: 'CV Exempel Receptionist 2025 - Professionell Mall | Jobbcoach.ai',
    metaDescription: 'Se ett komplett CV-exempel för receptionist. ATS-optimerat, strukturerat för svenska företag och visar service- och switchboard-kompetens. Inkluderar bokningssystem och flerspråkig kommunikation.',

    // SEO-rik introduktion
    seoIntro: `Söker du jobb som receptionist och behöver ett CV som sticker ut? Det här exemplet visar hur du balanserar servicekompetens med tekniska färdigheter som switchboard, bokningssystem och flerspråkig kommunikation.

CV:t kombinerar kvantifierbara resultat med branschspecifika nyckelord som svenska företag söker efter. Du ser hur switchboard-erfarenhet beskrivs konkret (200+ samtal dagligen), hur bokningssystem som Lime och Simployer lyfts fram, och hur förbättringar mäts i procent istället för vaga påståenden. Strukturen fungerar för både ATS-system och rekryterare eftersom den innehåller rätt termer från besökshantering, mötesbokning, och professionellt värdskap. Exempel på kvantifierbara resultat inkluderar "förbättrade besöksupplevelsen med 30%" och "reducerade check-in tid med 20%".

Använd detta CV som inspiration när du skriver ditt eget. Genom att visa konkreta siffror och branschspecifika system ökar du dina chanser att få intervju. Se även våra tips för personligt brev om du vill komplettera din ansökan.`,

    intro: 'Ett professionellt CV-exempel för receptionist som visar din servicekompetens, erfarenhet av switchboard och bokningssystem, samt förmåga att skapa positiv kundupplevelse. Detta exempel är optimerat för svenska företag, hotell och ATS-system.',

    exempelCV: {
      namn: 'Sofia Andersson',
      titel: 'Erfaren receptionist med specialisering inom företagsreception och kundservice',
      kontakt: {
        telefon: '070-234 56 78',
        epost: 'sofia.andersson@email.se',
        plats: 'Stockholm',
        linkedin: 'linkedin.com/in/sofiaandersson'
      },

      profil: 'Erfaren receptionist med 6+ års erfarenhet från företagsreception och hotellbranschen. Specialist på switchboard, bokningssystem (Lime, Simployer), kundservice och flerspråkig kommunikation (svenska, engelska, spanska). Professionell värdskap med fokus på positiv kundupplevelse och service där varje besökare känner sig välkommen från första mötet.',

      erfarenhet: [
        {
          titel: 'Receptionist, Ansvarig för besökshantering',
          arbetsgivare: 'Stora konsultbolaget AB, Stockholm',
          period: '2020 – Pågående',
          beskrivning: [
            'Ansvarig för företagsreception med 150+ besökare och 200+ samtal dagligen via switchboard',
            'Förbättrade besöksupplevelsen med 30% genom implementering av digitalt inchecksystem (Visitor Management System)',
            'Hanterar bokningssystem (Outlook Calendar, Lime) för 15 mötesrum och 50+ interna möten veckovis',
            'Flerspråkig kundservice (svenska, engelska, spanska) vilket ökat internationell kundnöjdhet med 25%',
            'Mentorskap för 2 nya receptionister under introduktionsperiod (3 månader vardera)'
          ]
        },
        {
          titel: 'Receptionist',
          arbetsgivare: 'Clarion Hotel, Stockholm',
          period: '2018 – 2020',
          beskrivning: [
            'Ansvarig för hotellreception med 100+ in-/utcheckningar dagligen och hantering av bokningssystem Opera PMS',
            'Reducerade check-in tid med 20% genom effektivisering av registreringsprocess',
            'Hanterade 120+ telefonsamtal per skift via switchboard med fokus på gästservice och problemlösning',
            'Samordnade frukostbokningar, rumservice och taxibeställningar för 80-100 gäster dagligen'
          ]
        },
        {
          titel: 'Kundtjänstmedarbetare',
          arbetsgivare: 'Telia Kundservice, Stockholm',
          period: '2016 – 2018',
          beskrivning: [
            'Hanterade 60-80 kundärenden dagligen via telefon och mejl med fokus på teknisk support och fakturafrågor',
            'Uppnådde 95% kundnöjdhet (mätt via NPS) genom strukturerad problemlösning och empatiskt bemötande',
            'Fick erfarenhet av CRM-system (Salesforce) och telefonisystem som förberedde för receptionistroll'
          ]
        }
      ],

      utbildning: [
        {
          titel: 'Administrativ utbildning med inriktning reception och service',
          skola: 'Hermods Yrkeshögskola, Stockholm',
          period: '2015 – 2016',
          beskrivning: 'Praktikperiod på 2 företagsreceptioner (IT-företag och advokatbyrå) där jag fick erfarenhet av switchboard, bokningssystem och professionellt värdskap.'
        }
      ],

      kompetenser: {
        tekniska: [
          'Switchboard/växelhantering (Expert, 6+ år)',
          'Bokningssystem – Lime, Simployer, Outlook (Avancerad, 5+ år)',
          'Opera PMS – hotellsystem (Avancerad, 2+ år)',
          'Microsoft Office (Word, Excel, PowerPoint, Teams)',
          'Flerspråkig kommunikation (svenska, engelska, spanska)',
          'CRM-system (Salesforce, erfarenhet 2 år)',
          'Visitor Management System (digitalt incheckning)'
        ],
        personliga: [
          'Serviceinriktad och välkomnande (hanterade 150+ besökare dagligen med 95% positiv feedback)',
          'Professionell kommunikation (hanterade 200+ samtal dagligen via switchboard med tydlighet och vänlighet)',
          'Multitaskingförmåga (samordnade besökshantering, telefonsamtal och mötesbokning simultant)',
          'Problemlösare (löste bokningskonflikter och gästklagomål med 90% lösningsgrad på första kontakt)',
          'Flexibel och stresstålig (hanterade högtrafik under konferenser med 300+ deltagare)'
        ]
      },

      certifieringar: [
        'Första hjälpen och HLR (förnyad 2024)',
        'Kundserviceutbildning – professionellt bemötande (2023)',
        'Switchboard och telefonisystem – certifiering (2020)',
        'GDPR-grundutbildning för reception (2022)',
        'Konflikthantering och serviceminded kommunikation (2021)'
      ],

      sprak: [
        { sprak: 'Svenska', niva: 'Modersmål' },
        { sprak: 'Engelska', niva: 'Flytande i tal och skrift' },
        { sprak: 'Spanska', niva: 'Goda kunskaper i tal och skrift' }
      ]
    },

    varforDetFungerar: [
      {
        rubrik: 'ATS-optimerad struktur med branschspecifika nyckelord',
        text: `CV:t innehåller nyckelord som svenska företag och hotell söker efter: switchboard, bokningssystem (Lime, Simployer, Opera PMS), besökshantering, flerspråkig kommunikation, och professionellt värdskap. ATS-system letar efter dessa specifika termer när de filtrerar ansökningar, särskilt switchboard-kompetens och erfarenhet av digitala bokningssystem som används i svenska receptionsmiljöer.`
      },
      {
        rubrik: 'Kvantifierbara resultat istället för vaga ansvarsområden',
        text: `CV:t använder konkreta siffror som "150+ besökare dagligen", "200+ samtal via switchboard", "förbättrade besöksupplevelsen med 30%", och "reducerade check-in tid med 20%". Detta är avgörande.

Rekryterare ser hundratals CV:n där kandidater bara skriver "ansvarig för reception", "svarade i telefon", eller "hanterade besökare". Sådana beskrivningar säger ingenting om omfattning eller komplexitet. Fungerade du med 20 eller 200 samtal per dag? Var det en liten mottagning eller ett stort konsultbolag med internationella gäster?

Siffror ger kontext och visar din faktiska arbetsbelastning. De gör att du sticker ut och ger rekryteraren något konkret att fråga om under intervjun. Istället för att gissa vad "mycket besökare" betyder, ser de exakt vad du hanterat tidigare.`
      },
      {
        rubrik: 'Balans mellan tekniska och mjuka färdigheter med bevis',
        text: `CV:t listar tekniska kompetenser som switchboard (Expert, 6+ år), bokningssystem (Lime, Simployer, Outlook), Opera PMS, och CRM-system (Salesforce). Parallellt finns mjuka färdigheter som serviceinriktad, professionell kommunikation, och multitasking.

Här är nyckeln: Varje mjuk färdighet backas upp med konkret bevis från erfarenhetsbeskrivningarna. "Serviceinriktad" visas genom "hanterade 150+ besökare dagligen med 95% positiv feedback". "Professionell kommunikation" kopplas till "200+ samtal dagligen via switchboard". "Multitaskingförmåga" exemplifieras med "samordnade besökshantering, telefonsamtal och mötesbokning simultant".

Detta undviker "buzzword bingo" där kandidater bara listar "kommunikativ, flexibel, driven" utan sammanhang. Rekryterare vill se hur du varit serviceinriktad, inte bara att du påstår det. Bevis sticker ut, tomma ord försvinner i mängden.`
      },
      {
        rubrik: 'Certifieringar som trovärdighetsmarkör',
        text: `Alla certifieringar har årtal: "Första hjälpen och HLR (förnyad 2024)", "Switchboard-certifiering (2020)", "GDPR-grundutbildning (2022)". Detta visar aktualitet och professionalism. GDPR-utbildning är särskilt relevant för receptionister som hanterar besöksinformation och personuppgifter dagligen.`
      },
      {
        rubrik: 'Profiltext som säljande sammanfattning',
        text: `Profiltexten följer strukturen: Erfarenhet (6+ år) → Specialisering (företagsreception och hotell) → Tekniska nyckelord (switchboard, Lime, Simployer, flerspråkig kommunikation) → Drivkraft (professionell värdskap, positiv kundupplevelse). Detta ger rekryterare en omedelbar bild av vem du är och vad du kan bidra med.`
      },
      {
        rubrik: 'Tydlig progression och ansvar',
        text: `Progression syns tydligt: Kundtjänst (60-80 samtal dagligen) → Hotellreceptionist (100+ in-/utcheckningar, 120+ samtal) → Företagsreceptionist ansvarig för besökshantering (150+ besökare, 200+ samtal). Mentorskap för 2 nya receptionister visar ledarskapserfarenhet och förmåga att utbilda kollegor.`
      }
    ],

    tips: [
      {
        rubrik: 'Inkludera branschspecifika system och verktyg',
        text: `Nämn alla system du behärskar eftersom det visar teknisk kompetens och att du kan börja arbeta direkt utan lång introduktion. Företag vill veta att du känner till verktyg de redan använder.

Lista switchboard-system, bokningssystem (Lime, Simployer, Outlook Calendar för företag), hotellsystem (Opera PMS eller Mews), Visitor Management System, och eventuella CRM-system. Skriv konkret: "Använder Lime dagligen för bokning av 15 mötesrum och koordinering av 50+ interna möten veckovis". Detta gör din erfarenhet tydlig och mätbar.`
      },
      {
        rubrik: 'Kvantifiera din erfarenhet med samtal och besökare',
        text: `Ange alltid antal besökare per dag, antal samtal via switchboard, och antal bokningar för att ge rekryterare kontext till din arbetsbelastning och stresstolerans. Vaga formuleringar som "hanterade reception" eller "mycket besökare" säger ingenting om omfattning.

**Exempel på före/efter:**

❌ "Ansvarig för reception och telefonväxel"

✅ "Hanterade företagsreception med 200+ samtal och 50+ besökare dagligen. Switchboard-ansvar för växel med 150 anknytningar."

Detta visar konkret omfattning och att du är van vid hög belastning.`
      },
      {
        rubrik: 'Visa konkreta resultat från din service',
        text: `Kvantifierbara förbättringar sticker ut och visar att du tar initiativ. Använd procent för förbättringar, kundnöjdhetsmätningar (NPS), eller tidsbesparingar när du beskriver vad du åstadkommit.

**Exempel:**

❌ "Förbättrade mottagningen genom bättre rutiner"

✅ "Förbättrade besöksupplevelsen med 30% genom implementering av digitalt inchecksystem"

✅ "Reducerade check-in tid med 20% genom effektivisering av registreringsprocess"

Detta visar resultatfokus och att du bidrar till verksamhetsutveckling, inte bara utför rutinuppgifter.`
      },
      {
        rubrik: 'Anpassa ditt CV för hotell vs företagsreception',
        text: `Hotell och företag söker olika kompetenser även om grunderna är desamma. Anpassa vad du lyfter fram beroende på målbransch.

För hotellreception: Betona in-/utcheckning, gästservice, Opera PMS eller Mews, taxibeställningar, rumservice. Exempel: "100+ in-/utcheckningar dagligen under högsäsong".

För företagsreception: Fokusera på besökshantering, mötesbokning, intern service, administrativa uppgifter, switchboard. Exempel: "Mötesadministration för 50+ möten veckovis" och "Ansvarig för företagsreception med säkerhetskontroll av besökare".

Båda miljöer värderar switchboard-kompetens och kundservice högt.`
      },
      {
        rubrik: 'Lyft fram flerspråkig kommunikation som konkurrensfördel',
        text: `Internationella företag och hotell värderar receptionister som kan kommunicera på flera språk eftersom de ofta har utländska besökare, kunder och kollegor.

Lista alla språk med nivå under en dedikerad Språk-sektion: "Svenska (Modersmål), Engelska (Flytande), Spanska (Goda kunskaper)". Nämn även i profiltexten och i erfarenhetsbeskrivningar där det tillfört värde. Exempel: "Flerspråkig kundservice (svenska, engelska, spanska) vilket ökat internationell kundnöjdhet med 25%". Detta kvantifierar värdet av din språkkompetens.`
      },
      {
        rubrik: 'Balansera tekniska och mjuka färdigheter med bevis',
        text: `Undvik att bara lista mjuka färdigheter som "serviceinriktad, kommunikativ, flexibel" utan sammanhang. Detta kallas "buzzword bingo" och säger ingenting konkret om din förmåga. Visa istället genom exempel från dina arbetsuppgifter.

**Exempel på före/efter:**

❌ "Serviceinriktad, kommunikativ, flexibel, stresstålig"

✅ "Serviceinriktad (150+ besökare dagligen med 95% positiv feedback enligt NPS-mätning)"

✅ "Professionell kommunikation (200+ samtal dagligen via switchboard med tydlighet och vänlighet)"

✅ "Multitasking (samordnade besökshantering, telefonsamtal och mötesbokning simultant)"

Bevis gör din kompetens trovärdig och konkret.`
      }
    ],

    faq: [
      {
        fraga: 'Hur långt ska mitt CV som receptionist vara?',
        svar: 'För receptionister med 0-3 års erfarenhet räcker vanligtvis 1 sida. Om du har 3-10+ års erfarenhet och arbetat i olika miljöer (hotell, företag, klinik) kan du använda 1-2 sidor. Fokusera på de senaste 10 åren och lyft fram progression samt branschspecifika system du behärskar.'
      },
      {
        fraga: 'Ska jag ha med profilbild på mitt CV?',
        svar: 'Det är vanligt men frivilligt i Sverige. För kundnära roller som receptionist kan en professionell bild vara en fördel eftersom den visar hur du presenterar dig. Välj en bild med affärsmässig klädsel, neutral bakgrund och ett välkomnande uttryck. Undvik semesterbilder eller selfies.'
      },
      {
        fraga: 'Vad gör jag om jag har luckor i mitt CV?',
        svar: 'Var ärlig och förklara kort. För kortare uppehåll (under 6 månader) behöver du inte ge detaljer. Vid längre perioder, nämn konstruktiva aktiviteter: vidareutbildning (t.ex. kundservicekurs, språkstudier), volontärarbete, föräldraledighet, eller vård av anhörig. Fokusera sedan på din erfarenhet och kompetens istället för att dröja vid luckan.'
      },
      {
        fraga: 'Hur visar jag switchboard-kompetens i mitt CV?',
        svar: 'Lista "Switchboard/växelhantering" under Kompetenser med erfarenhetsnivå, till exempel "Expert, 6+ år". I erfarenhetsbeskrivningar, kvantifiera: "Hanterade 200+ samtal dagligen via switchboard" eller "Ansvarig för 12-linjers växel med 150 interna anknytningar". Om du använt specifika switchboard-system som Ericsson, Panasonic eller Avaya, nämn dem. Detta visar konkret omfattning och att du behärskar tekniken, inte bara svarar i telefon.'
      },
      {
        fraga: 'Vilka bokningssystem ska jag nämna?',
        svar: 'Nämn alla system du använt: Lime, Simployer, Outlook Calendar (vanliga i företagsmiljöer), Opera PMS eller Mews (hotell), och Visitor Management System (digitala incheckningssystem för besökare). Förklara hur du använt dem: "Använder Lime dagligen för bokning av 15 mötesrum och koordinering av 50+ interna möten veckovis". Detta visar teknisk kompetens och att du är bekant med digitala verktyg som används i svenska receptionsmiljöer, vilket minskar introduktionstiden.'
      },
      {
        fraga: 'Hur anpassar jag mitt CV för hotell vs företagsreception?',
        svar: 'För hotellreception, lyft fram in-/utcheckning, gästservice, Opera PMS eller Mews, taxibeställningar, rumservice. Exempel: "100+ in-/utcheckningar dagligen under högsäsong" eller "Samordnade frukostbokningar för 80-100 gäster dagligen". För företagsreception, betona besökshantering, mötesbokning, intern service, administrativa uppgifter. Exempel: "Mötesadministration för 50+ möten veckovis" eller "Besökshantering med säkerhetskontroll och registrering i Visitor Management System". Anpassa profiltexten efter målbransch och lyft fram relevant erfarenhet först. Båda miljöer värderar switchboard och kundservice.'
      },
      {
        fraga: 'Hur lyfter jag fram flerspråkig kompetens?',
        svar: 'Skapa en dedikerad Språk-sektion och lista alla språk med nivå: "Svenska (Modersmål), Engelska (Flytande i tal och skrift), Spanska (Goda kunskaper)". Nämn flerspråkighet i profiltexten: "Flerspråkig kommunikation (svenska, engelska, spanska)". I erfarenhetsbeskrivningar, kvantifiera värdet: "Flerspråkig kundservice vilket ökat internationell kundnöjdhet med 25%". Detta är särskilt viktigt för internationella företag och hotell som har utländska besökare.'
      },
      {
        fraga: 'Hur visar jag kundserviceförmåga utan att bara säga det?',
        svar: 'Backa upp med konkreta exempel och siffror istället för att bara skriva "god kundservice". Visa genom resultat: "Serviceinriktad och välkomnande (hanterade 150+ besökare dagligen med 95% positiv feedback enligt NPS-mätning)", "Uppnådde 95% kundnöjdhet genom strukturerad problemlösning och empatiskt bemötande", "Reducerade väntetid med 20% genom effektivisering av incheckning", eller "Löste 90% av gästklagomål vid första kontakt". Mätbara resultat är mer trovärdiga än generella påståenden.'
      },
      {
        fraga: 'Hur kvantifierar jag besökshantering och arbetsmängd?',
        svar: 'Var konkret med antal besökare per dag, antal samtal via switchboard, antal bokningar per vecka. Undvik vaga formuleringar som "ansvarig för reception" eller "hanterade många besökare". Exempel: "Ansvarig för företagsreception med 150+ besökare och 200+ samtal dagligen" eller "Hanterade 100+ in-/utcheckningar dagligen under högsäsong". Detta ger rekryterare kontext till din arbetsbelastning, visar stresstolerans och multitaskingförmåga. Siffror gör din erfarenhet konkret och jämförbar, vilket sticker ut i mängden av vaga CV:n.'
      },
      {
        fraga: 'Vilka certifieringar är viktigast för receptionist?',
        svar: 'Prioritera dessa certifieringar: Första hjälpen och HLR (med förnyelsedatum!), kundserviceutbildning, switchboard-certifiering, GDPR-grundutbildning (viktigt för hantering av besöksinformation och personuppgifter). Konflikthantering och serviceminded kommunikation är också meriterande. Ange alltid årtal: "Första hjälpen och HLR (förnyad 2024)", "GDPR-grundutbildning (2022)", "Switchboard-certifiering (2020)". För hotell, lägg till specifika hotellcertifieringar om du har, till exempel Opera PMS-certifiering eller Wine & Spirit Education Trust (WSET) om receptionen även hanterar restaurangbokning.'
      }
    ],

    kategori: 'service',
    relaterade: [
      { yrke: 'Administratör', slug: 'administrator' },
      { yrke: 'Kundtjänstmedarbetare', slug: 'kundtjanstmedarbetare' },
      { yrke: 'Kontorsassistent', slug: 'kontorsassistent' }
    ]
  },

  'ingenjor': {
    yrke: 'Ingenjör',
    sokvolym: 880,
    metaTitle: 'CV Exempel Ingenjör 2025 - Professionell Mall | Jobbcoach.ai',
    metaDescription: 'Se ett komplett CV-exempel för ingenjör. ATS-optimerat, strukturerat för svenska teknikföretag och visar teknisk kompetens, projektledning och kvantifierbara resultat.',

    // SEO-rik introduktion
    seoIntro: `Söker du jobb som ingenjör och behöver ett CV som sticker ut? Det här exemplet visar hur du strukturerar ett ATS-optimerat CV som passar svenska teknikföretag – från startups till stora industrikoncerner.

Du får se exakt hur du balanserar teknisk kompetens (CAD-system som SolidWorks och AutoCAD, programmeringsspråk som Python och MATLAB, projektmetodik som Agile och Lean) med de mjuka färdigheter som rekryterare söker (problemlösning, tvärfunktionellt samarbete, teknisk dokumentation). CV:t visar konkreta resultat från produktutveckling och projektledning med kvantifierbara exempel.

Använd det som inspiration för ditt eget CV ingenjör och anpassa det efter den tjänst du söker. Läs också våra tips om hur du lyfter fram rätt tekniska nyckelord och certifieringar för att öka dina chanser till intervju.`,

    intro: 'Ett professionellt CV-exempel för ingenjör som visar din tekniska expertis, projektledningsförmåga och förmåga att leverera mätbara resultat. Detta exempel är optimerat för svenska teknikföretag och ATS-system.',

    exempelCV: {
      namn: 'Erik Johansson',
      titel: 'Civilingenjör Maskinteknik - Produktutveckling & Projektledning',
      kontakt: {
        telefon: '070-234 56 78',
        epost: 'erik.johansson@email.se',
        plats: 'Göteborg',
        linkedin: 'linkedin.com/in/erikjohansson',
        github: 'github.com/erikjdev'
      },

      profil: 'Civilingenjör Maskinteknik med 7+ års erfarenhet från produktutveckling och projektledning inom fordonsindustri och automation. Expert i CAD-system (SolidWorks, AutoCAD), FEM-analys och designoptimering med bevisad förmåga att leverera innovativa lösningar som reducerar kostnader och förbättrar produktkvalitet. Lean Six Sigma Green Belt certifierad med erfarenhet av Agile-projektledning och tvärfunktionellt samarbete. Kombinerar teknisk djupkunskap med affärsförståelse och kommunikationsförmåga.',

      erfarenhet: [
        {
          titel: 'Lead Engineer, Produktutveckling',
          arbetsgivare: 'Volvo Group',
          period: '2022 – Pågående',
          beskrivning: [
            'Projektledare för produktutvecklingsprojekt med €2M budget och 12 månaders tidslinje, levererat i tid och 10% under budget',
            'Ledde tvärfunktionellt team (5 ingenjörer från R&D, produktion, kvalitet och inköp) genom hela produktutvecklingscykeln från koncept till produktion',
            'Effektiviserade CAD-designprocess med 30% genom Python-automatisering av ritningsgenerering och standardkomponenter',
            'Reducerade produktionstid 25% genom DFM-optimering (Design for Manufacturing) och nära samarbete med produktionsteam',
            'Mentor för 3 nyutexaminerade civilingenjörer under introduktionsperiod (onboarding, teknisk vägledning, projektmetodik)'
          ]
        },
        {
          titel: 'Senior Mechanical Engineer',
          arbetsgivare: 'Ericsson AB',
          period: '2019 – 2022',
          beskrivning: [
            'Designade 50+ mekaniska komponenter i SolidWorks för telekomutrustning med 98% tillverkningsbarhet (first-time-right)',
            'FEM-analys och hållfasthetsberäkning för kritiska komponenter med ANSYS, vilket resulterade i 15% viktreducering utan kompromiss på styrka',
            'Implementerade Lean Six Sigma-projekt som reducerade produktionsspill med 35% genom DMAIC-metodik och värdeflödesanalys',
            'Teknisk dokumentation för patentansökan (1 patent beviljat) och kundspecifikationer, översatte tekniska krav till icke-teknisk publik',
            'Drev kontinuerlig förbättring genom Kaizen-initiativ som förbättrade OEE från 65% till 82%'
          ]
        },
        {
          titel: 'Mechanical Engineer',
          arbetsgivare: 'Atlas Copco',
          period: '2017 – 2019',
          beskrivning: [
            'CAD-modellering och produktdesign för industriella kompressorer med fokus på energieffektivitet och tillverkningsbarhet',
            'Prototypframtagning och produkttestning inkl. validering mot kundkrav och regulatoriska standarder (ISO 9001, CE-märkning)',
            'Samarbetade med leverantörer för materialval och tillverkningsmetoder, vilket reducerade komponentkostnader 12%',
            'Deltog i Agile-utveckling med 2-veckors sprintar, daily standups och sprint retrospectives för snabbare time-to-market'
          ]
        }
      ],

      utbildning: [
        {
          titel: 'Civilingenjör Maskinteknik',
          skola: 'Chalmers tekniska högskola',
          period: '2012 – 2017',
          beskrivning: 'Examensarbete i samarbete med Volvo Cars: FEM-analys av chassikomponent som resulterade i 15% viktreducering och prototypframtagning. Verktyg: ANSYS, MATLAB, Python.'
        }
      ],

      kompetenser: {
        tekniska: [
          'SolidWorks (Expert, 7+ år)',
          'MATLAB/Simulink (Expert, simulering)',
          'Python (Avancerad, automation)',
          'FEM-analys & ANSYS',
          'Lean Six Sigma Green Belt',
          'Agile/Scrum & Jira',
          'Git/GitHub (versionskontroll)'
        ],
        personliga: [
          'Analytisk problemlösning (identifierade rotorsak till kvalitetsproblem genom statistisk analys, reducerade defekter från 5% till 0.2%)',
          'Projektledning (ledde €2M projekt med 5 ingenjörer, levererat i tid och 10% under budget)',
          'Tvärfunktionellt samarbete (koordinerade R&D, produktion, kvalitet och inköp i produktutvecklingscykler)',
          'Teknisk kommunikation (patentansökningar, kundspecifikationer, presentationer för icke-teknisk publik)',
          'Mentorskap (handledde 3 nyutexaminerade civilingenjörer under introduktionsperiod)'
        ]
      },

      certifieringar: [
        'Lean Six Sigma Green Belt (2022)',
        'PMP – Project Management Professional (2023)',
        'Autodesk Certified Professional – SolidWorks (2021)',
        'Agile Scrum Master (CSM) (2020)',
        'ISO 9001 Internal Auditor (2019)'
      ],

      projekt: [
        {
          titel: 'Patenterad lösning för vibrationsreducering',
          beskrivning: 'Utvecklade och patenterade innovativ dämpningslösning som reducerade vibrationer med 40% i industriell utrustning. Patent beviljat 2021.'
        },
        {
          titel: 'Open source CAD automation',
          beskrivning: 'Skapade Python-bibliotek för SolidWorks API-automation. 500+ GitHub stars. Används av 50+ företag globalt.'
        }
      ],

      publikationer: [
        'Johansson, E. et al. (2021). "Vibration Reduction through Novel Damping Solutions". Journal of Mechanical Engineering, Vol. 45.',
        'Johansson, E. (2020). "Design for Manufacturing in Agile Product Development". Swedish Engineering Conference.'
      ],

      sprak: [
        { sprak: 'Svenska', niva: 'Modersmål' },
        { sprak: 'Engelska', niva: 'Flytande i tal och skrift (teknisk dokumentation, kundpresentationer)' }
      ]
    },

    varforDetFungerar: [
      {
        rubrik: 'ATS-optimerad struktur med branschspecifika nyckelord',
        text: `CV:t innehåller kritiska sökord som ATS-system letar efter: CAD-system, programmeringsspråk, projektmetodik och certifieringar. Konkreta exempel: SolidWorks, MATLAB, Python, Lean Six Sigma, Agile och FEM-analys används naturligt genom hela CV:t.

Rubriker som "Tekniska Kompetenser", "Projekt" och "Certifieringar" är standardiserade och läsbara för både ATS och rekryterare. Detta gör att systemet kan kategorisera information korrekt utan att viktig kompetens hamnar i fel sektion.

Att nämna specifika verktyg (SolidWorks, MATLAB, Git) och metoder (Agile, Lean) visar att du är uppdaterad och kan börja arbeta direkt utan omfattande introduktion. För ingenjörsroller väger tekniska nyckelord tungt i ATS-screening.`
      },
      {
        rubrik: 'Kvantifierbara resultat istället för ansvarsområden',
        text: `CV:t använder konkreta siffror: "€2M budget, levererat 10% under budget", "30% effektivisering genom Python-automatisering", "reducerade produktionstid 25%".

**Varför detta är avgörande**: Rekryterare ser hundratals CV:n där ingenjörer skriver "ansvarig för produktutveckling" eller "arbetade med CAD-modellering" utan kontext. Vad betyder "ansvarig för projekt"? Budget på 50 000 kr eller 5 miljoner? Tre månader eller tre år?

Siffror ger omfattning och trovärdighet. Skillnaden mellan "effektiviserade designprocess" och "effektiviserade designprocess med 30%" är enorm. Det visar att du faktiskt mäter ditt arbete och levererar affärsnytta – inte bara tekniskt arbete.

Detta är ett anti-pattern i många ingenjörs-CV:n: Vaga resultat som "bidrog till produktutveckling" eller "ansvarade för projekt". Kvantifierbara resultat (procent, budget, tid) gör att du sticker ut och ger rekryteraren något konkret att fråga om under intervjun.`
      },
      {
        rubrik: 'Balans mellan tekniska och mjuka färdigheter',
        text: `CV:t listar inte bara "kommunikativ, flexibel, driven" – det klassiska buzzword bingo som rekryterare ser i nio av tio CV:n. Istället VISAR det mjuka färdigheter genom konkreta exempel:

- "Analytisk problemlösning" backas upp med "reducerade defekter från 5% till 0.2%"
- "Projektledning" visas genom "€2M budget, 5 ingenjörer, levererat i tid"
- "Tvärfunktionellt samarbete" exemplifieras med "koordinerade R&D, produktion, kvalitet och inköp"

**Varför detta fungerar bättre**: Att skriva "god kommunikationsförmåga" betyder ingenting. Varje kandidat påstår det. Men att skriva "patentansökningar, kundspecifikationer, presentationer för icke-teknisk publik" BEVISAR kommunikationsförmåga.

Detta undviker anti-pattern "mjuka kompetenser utan bevis" som CV_KVALITET_STANDARD.md varnar för. Moderna ingenjörsroller kräver mer än teknisk kunskap – du måste visa att du kan kommunicera, samarbeta och leda, inte bara påstå det.`
      },
      {
        rubrik: 'Certifieringar och kontinuerlig kompetensutveckling som trovärdighetsmarkör',
        text: `Dedikerad sektion för certifieringar och vidareutbildning visar kontinuerlig kompetensutveckling: "Lean Six Sigma Green Belt (2022)", "PMP – Project Management Professional (2023)", "Autodesk Certified Professional SolidWorks (2021)".

Att inkludera både tekniska certifieringar (CAD, programmering) och metodcertifieringar (Lean, PMP, Scrum Master) visar bredd och ambition. Årtal visar att certifieringarna är aktuella och att du aktivt investerar i din utveckling.

Detta signalerar professionalism och lärvilja, två egenskaper som teknikföretag högt värderar. I snabbrörliga branscher där teknologier ständigt utvecklas är förmågan att lära sig nytt lika viktig som befintlig kunskap.`
      },
      {
        rubrik: 'Profiltext som säljande sammanfattning',
        text: `Den inledande profiltexten sammanfattar din erfarenhet, specialisering och unika styrkor på 3-4 meningar: "Civilingenjör Maskinteknik med 7+ års erfarenhet från produktutveckling och projektledning. Expert i CAD-system (SolidWorks, AutoCAD), FEM-analys och designoptimering..."

Detta gör att rekryteraren direkt ser om du matchar tjänsten, även om de bara läser de första raderna. Profiltexten inkluderar både tekniska nyckelord (SolidWorks, FEM, Python) och metodkunskap (Agile, Lean Six Sigma) samt affärsförståelse (reducerar kostnader, förbättrar produktkvalitet).

ATS-system indexerar profiltexten tungt vid automatisk screening. Genom att placera viktigaste nyckelorden här ökar du chansen att passera den första filtreringen och nå en mänsklig rekryterare.`
      },
      {
        rubrik: 'Tydlig karriärprogression och tekniskt ledarskap',
        text: `Från Mechanical Engineer (CAD-design och produkttestning) till Senior Engineer (FEM-analys och Lean Six Sigma) till Lead Engineer (projektledning och mentorskap) visar CV:t en naturlig utveckling mot mer avancerade och ledande roller.

Att nämna "Lead Engineer för produktutvecklingsteam (5 ingenjörer)" och "Mentor för 3 nyutexaminerade civilingenjörer" visar att du vuxit in i en seniorroll och kan ta ansvar för både projekt och människor. Detta är särskilt värdefullt för tjänster som kräver tekniskt ledarskap.

Patent, publikationer och GitHub-projekt med 500+ stars stärker expertis-profilen ytterligare. Detta visar inte bara teknisk kompetens utan också förmåga att dela kunskap, innovera och bidra till den tekniska communityn.`
      }
    ],

    tips: [
      {
        rubrik: 'Inkludera rätt nyckelord för din ingenjörsinriktning',
        text: `ATS-system söker efter specifika termer beroende på ingenjörsdisciplin. För maskinteknik: CAD (SolidWorks, CATIA), FEM-analys, tillverkningsmetoder, materialval. För elektroteknik: PLC-programmering, SCADA, embedded systems, reglerteknik. För mjukvaruutveckling inom engineering: MATLAB, Python, LabVIEW, Git. För processingenjörer: Lean, Six Sigma, OEE, kontinuerlig förbättring.

Läs jobbannonsen noga och matcha dina nyckelord mot deras krav. Om de söker "erfarenhet av SolidWorks" använd exakt den formuleringen i ditt CV, inte "CAD-kompetens". ATS-system matchar ofta ordagrant, vilket innebär att felaktig terminologi kan göra att ditt CV sorteras bort trots relevant kompetens.

Inkludera även projektmetodik (Agile, Scrum, Waterfall) och certifieringar (Lean Six Sigma, PMP). Detta visar att du kan integrera snabbt i deras arbetsprocesser utan omfattande introduktion.`
      },
      {
        rubrik: 'Kvantifiera din erfarenhet för ökad trovärdighet',
        text: `Konkreta siffror gör ditt CV mer trovärdigt och jämförbart. Istället för "ansvarig för produktutveckling" skriv "ledde produktutvecklingsprojekt med €2M budget, 12 månaders tidslinje, levererat i tid och 10% under budget". Nämn projektbudgetar, teamstorlek, tidsramar och kostnadsbesparingar.

Om du jobbat med flera projekt samtidigt, kvantifiera det: "hanterade 3 parallella produktutvecklingsprojekt värt totalt €5M". Var också specifik med tekniska prestationer: "reducerade simuleringstid från 8 till 2 timmar genom optimerad MATLAB-kod" eller "förbättrade produktkvalitet från 92% till 98% first-time-right".

För nyutexaminerade: kvantifiera examensarbete eller projekt. "Examensarbete i samarbete med Volvo: FEM-analys av chassikomponent som resulterade i 15% viktreducering". Detta kompenserar för brist på arbetslivserfarenhet och visar praktisk tillämpning.`
      },
      {
        rubrik: 'Visa konkreta resultat från dina ingenjörsprojekt',
        text: `Istället för att lista arbetsuppgifter, visa resultat och affärsnytta. Exempel: "Implementerade Python-automatisering för CAD-ritningsgenerering vilket minskade designtid med 30%", "Utvecklade FEM-modell som reducerade produktionstid 25% genom optimerad geometri".

Om du inte har exakta siffror, beskriv tekniska utmaningar du löst och deras påverkan: "Identifierade och eliminerade vibrationsproblem i prototyp genom modalanalys och designoptimering, vilket möjliggjorde produktlansering i tid och undvek 6 månaders försening".

Detta visar initiativförmåga, problemlösningsförmåga och affärsförståelse. Det skiljer också ditt CV från de som bara listar "designade komponenter, körde simuleringar". Rekryterare vill veta VAD du uppnådde, inte bara VAD du gjorde.`
      },
      {
        rubrik: 'Anpassa profiltext och framhäv relevant teknisk specialisering',
        text: `Din profiltext (den inledande sammanfattningen) bör vara skräddarsydd för varje jobb. Om jobbannonsen söker "Senior Mechanical Engineer med CAD-expertis", skriv: "Civilingenjör Maskinteknik med 7+ års erfarenhet från produktutveckling. Expert i SolidWorks och FEM-analys med bevisad förmåga att leverera innovativa lösningar."

Om de söker projektledare, anpassa: "Erfaren ingenjör med specialistkompetens inom projektledning, Lean Six Sigma och tvärfunktionellt samarbete. PMP-certifierad med track record av projekt levererade i tid och budget."

Inkludera alltid: examen (civil/högskoleingenjör), antal års erfarenhet, tekniska kärnkompetenser (top 3 verktyg/metoder) och 1-2 personliga egenskaper (analytisk, resultatdriven). Håll profiltexten till max 4 meningar. Skriv den sist när du vet exakt vad arbetsgivaren söker.`
      },
      {
        rubrik: 'Lyft fram tekniska färdigheter och uppdaterade certifieringar',
        text: `Skapa en dedikerad sektion för tekniska färdigheter och certifieringar. Detta är kritiskt för ATS-matchning i ingenjörsroller.

Viktiga att inkludera för ingenjörer:
- CAD/CAE: SolidWorks, AutoCAD, CATIA, ANSYS (specificera kompetensnivå: Expert, Avancerad, Grundläggande)
- Programmering: Python, MATLAB, C++, SQL (nämn konkreta användningsområden: automation, simulering, dataanalys)
- Projektmetodik: Agile, Scrum, Lean, Six Sigma
- Certifieringar: Lean Six Sigma (Green/Black Belt), PMP, ISO-revisor, Scrum Master
- Branschspecifika: Truckkort, Heta Arbeten, CAD-certifieringar

Gruppera efter kategori (CAD, Programmering, Projektledning, Certifieringar) för tydlighet. Inkludera kompetensnivå för viktigaste verktygen: "SolidWorks (Expert, 7+ års erfarenhet)", "Python (Avancerad, automation och dataanalys)".`
      },
      {
        rubrik: 'Balansera tekniska och mjuka färdigheter med konkreta exempel',
        text: `Lista både tekniska färdigheter (CAD, FEM, programmering, projektmetodik) och personliga egenskaper (problemlösning, kommunikation, samarbete). Men backa alltid upp de personliga egenskaperna med exempel i erfarenhetssektionen.

Istället för att bara lista "problemlösare" i kompetenssektionen, visa det genom att skriva: "Identifierade rotorsak till kvalitetsproblem genom statistisk analys och implementerade korrigerande åtgärd som eliminerade defekter (från 5% till 0.2% defektrate)".

Istället för bara "god kommunikation", skriv: "Teknisk dokumentation och kundpresentationer för produktspecifikationer. Översatte tekniska krav till icke-teknisk publik (försäljning, ledning)". Detta gör dina mjuka färdigheter konkreta och trovärdiga istället för abstrakta påståenden.`
      }
    ],

    faq: [
      {
        fraga: 'Hur långt ska mitt CV vara?',
        svar: 'I Sverige rekommenderas 1-2 sidor. För ingenjörer med 0-5 års erfarenhet räcker vanligtvis 1 sida, medan seniora ingenjörer med 5-10+ års erfarenhet kan behöva 2 sidor för att visa progression, projekt och publikationer. Fokusera på relevant erfarenhet – du behöver inte inkludera alla studenter-projekt.'
      },
      {
        fraga: 'Ska jag ha en profilbild på mitt CV?',
        svar: 'I Sverige är det vanligt men inte krav. För tekniska yrken är det mindre kritiskt än kompetensinnehållet. Viktigt: Använd en professionell bild med neutral bakgrund om du inkluderar en. Om du är osäker, använd en CV-mall utan bild – det är aldrig fel. Teknisk kompetens väger tyngre än bilden.'
      },
      {
        fraga: 'Hur hanterar jag luckor i mitt CV?',
        svar: 'Var ärlig och kort om luckor. Vid kortare uppehåll (mindre än 6 månader) behöver du inte förklara. För längre perioder, nämn konstruktiva aktiviteter: "Vidareutbildning – Lean Six Sigma Green Belt", "Sabbatsår med open source-projekt (GitHub: github.com/användarnamn)", eller "Konsultuppdrag inom produktutveckling". Rekryterare förstår att livet händer – det viktiga är att du kan förklara det om de frågar.'
      },
      {
        fraga: 'Hur visar jag min tekniska kompetens som ingenjör utan att överbelasta CV:t?',
        svar: 'Skapa en dedikerad sektion "Tekniska Färdigheter" och gruppera efter kategori: CAD/CAE (SolidWorks, ANSYS), Programmering (Python, MATLAB), Projektverktyg (Jira, Git). Inkludera kompetensnivå för viktigaste verktygen: "SolidWorks (Expert, 7+ år)". I profiltexten, nämn dina top 3 tekniska kompetenser: "Expert i SolidWorks, FEM-analys och produktoptimering". I erfarenhetssektionen, visa hur du använt verktygen med konkreta exempel: "Designade 50+ komponenter i SolidWorks".'
      },
      {
        fraga: 'Ska jag inkludera GitHub-länk eller teknisk portfolio i mitt CV som ingenjör?',
        svar: 'Ja, särskilt om du arbetar med programmering eller automation. Inkludera GitHub-länk i kontaktuppgifterna: "GitHub: github.com/användarnamn". För mekanik/produktutveckling kan du länka till portfolio med CAD-modeller (t.ex. GrabCAD) om tillåtet (kontrollera NDA). Var selektiv – visa bara professionella, väl-dokumenterade projekt. Ett aktivt GitHub med relevanta projekt (Python-scripts, MATLAB-kod) stärker din profil betydligt.'
      },
      {
        fraga: 'Hur visar jag examensarbete och studentprojekt i mitt CV som nyutexaminerad ingenjör?',
        svar: 'För nyutexaminerade är examensarbete och relevanta studentprojekt viktiga att inkludera. Skapa sektion "Projekt" eller inkludera under "Utbildning": "Examensarbete: FEM-analys av chassikomponent i samarbete med Volvo. Resulterade i 15% viktreducering och prototypframtagning. Verktyg: ANSYS, Python." Nämn: partnerskapsföretag (om relevant), teknisk utmaning löst, verktyg använda och konkret resultat. Detta kompenserar för brist på arbetslivserfarenhet och visar praktisk tillämpning av teknisk kunskap.'
      },
      {
        fraga: 'Hur ska jag presentera min examen: civilingenjör vs högskoleingenjör?',
        svar: 'Var tydlig med din examen i både profiltext och utbildningssektion. "Civilingenjör Maskinteknik (300 hp, Teknologie Master)" eller "Högskoleingenjör Elektroteknik (180 hp, Teknologie Bachelor)". I profiltexten: "Civilingenjör med 5+ års erfarenhet..." eller "Högskoleingenjör med specialisering inom automation...". Detta hjälper rekryterare förstå din utbildningsnivå direkt. Båda examina är meriterade – det viktiga är att vara tydlig.'
      },
      {
        fraga: 'Hur lyfter jag fram projektledning och teamarbete i mitt CV som ingenjör?',
        svar: 'Beskriv konkret hur du leder projekt och team. Exempel: "Projektledare för produktutvecklingsprojekt (€2M budget, 12 månader, tvärfunktionellt team med 8 personer från R&D, produktion, kvalitet)", "Samordnade Agile-utveckling med 2-veckors sprintar, daily standups och sprint retrospectives", "Stakeholder management: rapportering till ledning och kundpresentationer". Om du har PMP, Scrum Master eller Lean Six Sigma, lyft det i certifieringsektionen. Detta visar att du kan både tekniskt arbete OCH projektledning – mycket värdefullt för seniorroller.'
      },
      {
        fraga: 'Ska jag lista alla CAD-program och programmeringsspråk jag kan i mitt CV?',
        svar: 'Prioritera de mest relevanta och lägg till kompetensnivå. För CAD: "SolidWorks (Expert, 7+ år)", "AutoCAD (Avancerad)", "CATIA (Grundläggande)". För programmering: "Python (Avancerad, automation och dataanalys)", "MATLAB (Expert, simulering)", "C++ (Grundläggande)". Om du kan många verktyg, gruppera: "CAD: SolidWorks, AutoCAD, Revit" och "Programmering: Python, MATLAB, SQL". Fokusera på top 5-7 verktyg som matchar jobbannonsen. Kvalitet över kvantitet – expertis i 3 verktyg imponerar mer än grundläggande kunskap i 10.'
      },
      {
        fraga: 'Hur lyfter jag fram Lean och Six Sigma-erfarenhet i mitt CV som ingenjör?',
        svar: 'Inkludera både certifiering och tillämpning. Under "Certifieringar": "Lean Six Sigma Green Belt (2022)". I erfarenhetssektionen, visa konkret tillämpning: "Ledde Lean Six Sigma-projekt som reducerade produktionsspill med 35% genom DMAIC-metodik och värdeflödesanalys" eller "Implementerade 5S i produktionslinje vilket förbättrade OEE från 65% till 82%". Nämn specifika verktyg (DMAIC, FMEA, värdeflödesanalys, 5S, Kaizen) och kvantifierbara resultat. Detta visar att du inte bara har certifieringen utan kan tillämpa metodiken.'
      }
    ],

    kategori: 'teknik',
    relaterade: [
      { yrke: 'Projektledare', slug: 'projektledare' },
      { yrke: 'Automationsingenjör', slug: 'automationsingenior' },
      { yrke: 'Konstruktör', slug: 'konstruktor' }
    ]
  },
  'lagerarbetare': {
    yrke: 'Lagerarbetare',
    sokvolym: 720,
    metaTitle: 'CV Exempel Lagerarbetare 2025 - Professionell Mall | Jobbcoach.ai',
    metaDescription: 'Se ett komplett CV-exempel för lagerarbetare. ATS-optimerat med truckkort, WMS-system och kvantifierbara resultat. Inkluderar plockning, packning och lagerhantering.',

    seoIntro: `Söker du jobb som lagerarbetare och behöver ett CV som sticker ut? Det här exemplet visar hur du strukturerar ett ATS-optimerat CV som matchar vad rekryterare inom logistik faktiskt letar efter.

Du får se exakt hur du framhäver truckkort (A+B), WMS-system (SAP WM, Astro, M3) och kvantifierbara resultat som plocknoggrannhet och ordervolym per dag. CV:t visar konkreta exempel från högvolymlogistik och e-handel – inklusive hur du demonstrerar progression från operativ lagerarbetare till teamledare.

Använd det som inspiration för ditt eget CV som lagerarbetare och anpassa det efter den tjänst du söker. Med rätt nyckelord och struktur ökar du dina chanser att passera ATS-filtret och nå intervju.`,

    intro: 'Ett professionellt CV-exempel för lagerarbetare som visar truckkort, WMS-kompetens och kvantifierbara resultat från plockning, packning och lagerhantering. Optimerat för svenska logistikföretag och ATS-system.',

    exempelCV: {
      namn: 'Marcus Pettersson',
      titel: 'Erfaren lagerarbetare med truckkort A+B och WMS-expertis',
      kontakt: {
        telefon: '070-234 56 78',
        epost: 'marcus.pettersson@email.se',
        plats: 'Göteborg',
        linkedin: 'linkedin.com/in/marcuspettersson'
      },

      profil: 'Resultatinriktad lagerarbetare med 7+ års erfarenhet från högvolymlogistik och e-handel. Specialist på plockning, truckkörning och WMS-system (SAP WM, Astro) med gedigen kunskap i Lean 5S och plocknoggrannhet på 99.8%. Noggrann teamplayer som brinner för effektiv lagerhantering och säker arbetsmiljö.',

      erfarenhet: [
        {
          titel: 'Lagerarbetare, Teamledare',
          arbetsgivare: 'PostNord Logistics AB, Göteborg',
          period: '2020 – Pågående',
          beskrivning: [
            'Teamledare för 6 lagerarbetare med ansvar för daglig planering och kvalitetsuppföljning i högvolymlager',
            'Ökade plocknoggrannheten från 98.5% till 99.8% genom implementering av dubbelkontrollsystem för högvärdiga produkter',
            'Hanterar 180-220 plockorder per dag med motviktstruck och ledstaplare (genomsnitt 210 order/dag)',
            'Använder SAP WM dagligen för orderplockning, godsmottagning, inventering och lageroptimering',
            'Reducerade skador vid hantering med 35% genom utbildning i ergonomi och riskanalys för teamet'
          ]
        },
        {
          titel: 'Lagerarbetare',
          arbetsgivare: 'CEVA Logistics AB, Göteborg',
          period: '2018 – 2020',
          beskrivning: [
            'Ansvarig för godsmottagning, plockning och packning för 3PL-lager med 500+ artiklar (e-handel och detaljhandel)',
            'Genomförde 150-180 plockorder per dag med 99.5% noggrannhet i Astro WMS-system',
            'Minskade ledtid för uttag från lager med 20% (från 25 till 20 min/order) genom omstrukturering av lagerlayout enligt Lean 5S',
            'Truckkörning dagligen (motviktstruck A+B) för plock och godsmottagning av containrar och pallgods'
          ]
        },
        {
          titel: 'Lagerarbetare / Truckförare',
          arbetsgivare: 'Ahlsell AB, Borås',
          period: '2016 – 2018',
          beskrivning: [
            'Lagerarbete inom VVS-grossist med ansvar för plockning, packning och uttag av byggmaterial och VVS-produkter',
            'Hanterade 80-100 plockorder per dag (manuell plockning och truckplock) i M3-system',
            'Genomförde kvartalsinventering för 2 500 artiklar med 98% inventeringsnoggrannhet',
            'Utbildade 2 nya kollegor i truckkörning och lagerrutiner under introduktionsperiod (3 månader vardera)'
          ]
        }
      ],

      utbildning: [
        {
          titel: 'Gymnasieutbildning Handel och Administration',
          skola: 'Hvitfeldtska gymnasiet, Göteborg',
          period: '2013 – 2016',
          beskrivning: 'Inriktning logistik och lagerhantering. Praktik på DHL Freight under termin 5 (8 veckor).'
        }
      ],

      kompetenser: {
        tekniska: [
          'Truckkort A+B – Motviktstruck och skjutstativtruck (Expert, 7+ år)',
          'SAP WM – Warehouse Management (Avancerad, 4+ år)',
          'Astro WMS-system (Avancerad, 2+ år)',
          'Lean 5S och kontinuerlig förbättring',
          'Handdator för plockning (RF-scanner, Zebra)',
          'M3-system (grundläggande)',
          'Godsmottagning och kvalitetskontroll',
          'Inventering och lageroptimering'
        ],
        personliga: [
          'Noggrann och kvalitetsmedveten (99.8% plocknoggrannhet över 12 månader)',
          'Fysiskt uthållig (hanterar 180-220 order/dag, tunga lyft upp till 25 kg)',
          'Ansvarstagande teamledare (ledde 6 medarbetare, minskade skador med 35%)',
          'Säkerhetsfokuserad (genomförde 2 riskanalyser/år, 0 arbetsolyckor sedan 2020)',
          'Flexibel och lösningsorienterad (hanterade högsäsonger med 40% ökad volym, jul/Black Friday)'
        ]
      },

      certifieringar: [
        'Truckkort A – Motviktstruck (2017, förlängt 2024)',
        'Truckkort B – Skjutstativtruck (2017, förlängt 2024)',
        'Heta Arbeten (2021)',
        'Första hjälpen och HLR (förnyad 2024)',
        'Arbetsmiljöutbildning – Säkerhet på lager (2022)',
        'ADR Grundkurs – Farligt gods (2023)'
      ],

      sprak: [
        { sprak: 'Svenska', niva: 'Modersmål' },
        { sprak: 'Engelska', niva: 'God i tal och skrift' }
      ]
    },

    varforDetFungerar: [
      {
        rubrik: 'Professionell profiltext med rätt nyckelord',
        text: `Marcus' profiltext följer en beprövad struktur: erfarenhet (7+ år), specialisering (plockning, truckkörning, WMS-system), tekniska nyckelord (SAP WM, Astro, Lean 5S) och personlighetsdrag (noggrann, säkerhetsfokuserad).

Det som gör profilen extra stark är att den redan innehåller ett kvantifierbart resultat – 99.8% plocknoggrannhet. Detta fångar rekryterarens uppmärksamhet direkt och visar att Marcus inte bara beskriver sina arbetsuppgifter, utan faktiskt mäter sin prestation.

ATS-system söker efter specifika termer som "SAP WM", "truckkort" och "plockning". Genom att inkludera dessa i profiltexten ökar sannolikheten att CV:t passerar den automatiska screeningen. Samtidigt signalerar "Lean 5S" att Marcus förstår processförbättring – något som är värdefullt för arbetsgivare som vill effektivisera sin lagerverksamhet.`
      },
      {
        rubrik: 'Kvantifierbara resultat som sticker ut',
        text: `Marcus' CV använder konkreta siffror som "99.8% plocknoggrannhet" och "180-220 order per dag". Detta är avgörande – många lagerarbetare skriver bara "ansvarade för plockning och packning" utan att visa omfattning eller kvalitet.

Genom att kvantifiera sina resultat visar Marcus både kvalitet (99.8% noggrannhet) och volym (220 order/dag i högvolymlogistik). Han visar också förbättringsinitiativ: "Minskade ledtid för uttag från lager med 20% (från 25 till 20 min/order)" – vilket bevisar att han inte bara utför arbetet, utan aktivt effektiviserar processer.

Rekryterare ser detta och tänker: "Här är en lagerarbetare som kan hantera högt tempo, behålla kvalitet OCH förbättra arbetssätt." Siffror ger kontext och visar värde på ett sätt som vaga beskrivningar aldrig kan.`
      },
      {
        rubrik: 'Truckkort och certifieringar med årtal',
        text: `Marcus visar tydligt att hans truckkort är giltiga: "Truckkort A – Motviktstruck (2017, förlängt 2024)". Detta är kritiskt eftersom truckkort gäller i 5 år – ett truckkort utan årtal kan vara ogiltigt, vilket gör kandidaten icke-anställningsbar för de flesta lagertjänster.

Utöver grundläggande truckkort har Marcus specialcertifieringar som ADR Grundkurs (farligt gods) och Heta Arbeten. Dessa öppnar dörrar till specialiserade lager inom kemi, läkemedel och industri – områden där konkurrensen är lägre och lönerna ofta högre.

Dedikerade sektionen för certifieringar visar också kontinuerlig kompetensutveckling. Att HLR är "förnyad 2024" och arbetsmiljöutbildning togs 2022 signalerar att Marcus håller sina kunskaper aktuella – något arbetsgivare värderar högt för en säker arbetsplats.`
      }
    ],

    tips: [
      {
        rubrik: 'Specificera dina WMS-system istället för "datorvana"',
        text: `ATS-system söker efter specifika WMS-system, inte generiska termer. "Datorvana" säger ingenting – "SAP WM med 4+ års erfarenhet" visar konkret kompetens som matchar jobbannonsens krav.

**UNDVIK:** "God datorvana och erfarenhet av lagerhanteringssystem"
**BRA:** "SAP WM – Warehouse Management (Avancerad, 4+ år), Astro WMS-system (Avancerad, 2+ år), M3-system (grundläggande)"

Lista de system du faktiskt behärskar med kompetensnivå för dina starkaste. Vanliga WMS-system att nämna inkluderar SAP WM, Astro, M3, Pyramid, JDA och Manhattan. Om du använt handdatorer och RF-scanners (Zebra, Honeywell), nämn det specifikt – det är standardverktyg i moderna lager.`
      },
      {
        rubrik: 'Kvantifiera din plockning och effektivitet',
        text: `Rekryterare vill veta hur mycket du kan hantera och hur bra du är på det. Kvantifiera alltid med siffror: antal order per dag, plocknoggrannhet i procent, och eventuella förbättringar du bidragit till.

**UNDVIK:** "Ansvarade för plockning och packning av order"
**BRA:** "Genomförde 150-180 plockorder per dag med 99.5% noggrannhet i Astro WMS-system"

Om du inte vet exakta siffror, uppskatta konservativt. Fråga dig själv: Hur många order hanterade jag per skift? Hur ofta gjorde jag fel? Jobbade jag med 100, 500 eller 5000 olika artiklar? Dessa detaljer visar omfattning och ger rekryteraren något konkret att relatera till.`
      },
      {
        rubrik: 'Visa truckkort med årtal och förnyelsedatum',
        text: `Truckkort är ofta ett absolut krav för lagertjänster. Men truckkort utan årtal kan betyda att certifikatet är ogiltigt – truckkort gäller normalt i 5 år och måste förnyas.

**UNDVIK:** "Truckkort A och B"
**BRA:** "Truckkort A – Motviktstruck (2017, förlängt 2024), Truckkort B – Skjutstativtruck (2017, förlängt 2024)"

Lista vilken typ av truck (motviktstruck, skjutstativtruck, ledstaplare, reach truck) och visa tydligt att certifikatet är aktuellt. Om du har extra certifieringar som ADR (farligt gods) eller Heta Arbeten, inkludera dem – de öppnar dörrar till specialiserade tjänster med mindre konkurrens.`
      },
      {
        rubrik: 'Demonstrera progression i din karriär',
        text: `Visa att du utvecklats över tid – från operativ lagerarbetare till mer ansvarsfulla roller. Detta signalerar att du har potential att växa inom organisationen.

**UNDVIK:** Tre nästan identiska tjänstebeskrivningar utan synlig utveckling
**BRA:** Visa progression i volym (80 → 150 → 220 order/dag), ansvar (från plock till teamledare för 6 personer), och kompetens (från grundläggande till Lean-implementering)

Marcus CV visar tydlig progression: han började med 80-100 order/dag på Ahlsell, ökade till 150-180 på CEVA där han implementerade Lean 5S, och hanterar nu 180-220 order/dag som teamledare på PostNord. Rekryterare ser detta och förstår att Marcus är redo för nästa steg.`
      },
      {
        rubrik: 'Framhäv säkerhet och kvalitetsarbete',
        text: `Arbetsmiljö och säkerhet är prioriterat inom lager och logistik. Visa att du tar säkerhet på allvar genom konkreta exempel och resultat.

**UNDVIK:** "Följde säkerhetsrutiner"
**BRA:** "Reducerade skador vid hantering med 35% genom utbildning i ergonomi och riskanalys för teamet – 0 arbetsolyckor sedan 2020"

Nämn arbetsmiljöutbildningar, riskanalyser du deltagit i, eller förbättringar du bidragit till. Om du utbildat kollegor i säkerhet eller ergonomi, lyft fram det. Arbetsgivare vill ha medarbetare som aktivt bidrar till en säker arbetsplats – det minskar kostnader för sjukfrånvaro och olyckor.`
      }
    ],

    faq: [
      {
        fraga: 'Vad ska jag skriva i profiltexten som lagerarbetare?',
        svar: 'Följ strukturen: Erfarenhet (antal år) + Specialisering (truckkort, typ av lager) + Tekniska nyckelord (SAP WM, Astro, Lean 5S) + Personlighetsdrag (noggrann, säkerhetsfokuserad). Exempel: "Resultatinriktad lagerarbetare med 5+ års erfarenhet från e-handelslager. Truckkort A+B och gedigen kunskap i SAP WM med 99% plocknoggrannhet. Noggrann teamplayer med fokus på säker och effektiv lagerhantering." Inkludera gärna ett kvantifierbart resultat redan i profilen för att fånga uppmärksamhet direkt.'
      },
      {
        fraga: 'Vilka WMS-system ska jag nämna i mitt CV som lagerarbetare?',
        svar: 'Nämn de system du faktiskt har erfarenhet av – SAP WM, Astro, M3, Pyramid, JDA eller Manhattan är vanliga. Undvik generiska termer som "datorvana" eller "lagerhanteringssystem" – var specifik. Lägg till kompetensnivå för dina starkaste system: "SAP WM (Avancerad, 4+ år)", "M3-system (Grundläggande)". Glöm inte handdatorer och RF-scanners (Zebra, Honeywell) om du använt dem – det är standardverktyg i moderna lager.'
      },
      {
        fraga: 'Måste jag ha truckkort för att jobba som lagerarbetare?',
        svar: 'De flesta lagertjänster kräver truckkort, särskilt A (motviktstruck) och B (skjutstativtruck/reachtruck). Visa alltid årtal och förnyelsedatum eftersom truckkort gäller i 5 år: "Truckkort A – Motviktstruck (2020, förlängt 2025)". Om du inte har truckkort kan du söka tjänster som fokuserar på manuell plockning eller packning, men karriärmöjligheterna begränsas. Truckkortskurser tar ofta bara 2-5 dagar och är en bra investering.'
      },
      {
        fraga: 'Hur visar jag resultat i mitt CV som lagerarbetare?',
        svar: 'Kvantifiera med siffror: antal order per dag (80, 150, 220), plocknoggrannhet i procent (98.5%, 99.8%), effektiviseringar (minskade ledtid med 20%), antal artiklar vid inventering (2 500 artiklar), teamstorlek om du haft ansvar (6 medarbetare). Fråga dig själv: Hur många? Hur ofta? Hur bra? "Ansvarade för plockning" säger inget – "Genomförde 180 plockorder per dag med 99.5% noggrannhet" visar konkret värde.'
      },
      {
        fraga: 'Vilka certifieringar ökar mina chanser som lagerarbetare?',
        svar: 'Truckkort A+B är grundkrav för de flesta tjänster. Utöver det ökar dessa dina möjligheter: ADR Grundkurs (farligt gods) – öppnar dörrar till kemi- och läkemedelslager med högre löner. Heta Arbeten – krävs för lager med svetsning eller kemikalier. Första hjälpen/HLR – visar säkerhetsmedvetenhet. Arbetsmiljöutbildning – uppskattas av arbetsgivare som prioriterar säkerhet. Visa alltid årtal och förnyelsedatum för tidsbegränsade certifieringar.'
      }
    ],

    kategori: 'service',
    relaterade: [
      { yrke: 'Truckförare', slug: 'truckforare' },
      { yrke: 'Logistiker', slug: 'logistiker' },
      { yrke: 'Lagerchef', slug: 'lagerchef' }
    ]
  },
  'administrator': {
    yrke: 'Administratör',
    sokvolym: 590,
    metaTitle: 'CV Exempel Administratör 2025 - Professionell Mall | Jobbcoach.ai',
    metaDescription: 'Se ett komplett CV-exempel för administratör. ATS-optimerat med Microsoft 365, Visma, W3D3 och kvantifierbara resultat. Visar systemkompetens och ärendehantering.',

    seoIntro: `Söker du jobb som administratör och undrar hur ditt CV ska struktureras för att visa både systemkompetens och resultat? Det här CV-exemplet för administratör visar hur du kombinerar tekniska färdigheter med konkreta prestationer som fångar rekryterares uppmärksamhet.

Exemplet balanserar branschspecifika system (Microsoft 365, Visma, W3D3, OSL) med kvantifierbara resultat som verkligen visar omfattning och effektivitet. Istället för vaga beskrivningar som "ansvarade för administration" ser du konkreta exempel: "Koordinerar 200+ ärenden/månad med 98% leveransprecision" och "Implementerade W3D3 som reducerade handläggningstid med 30%".

Använd exemplet som inspiration när du skriver ditt CV. Fokusera på antal ärenden, system du behärskar, och effektivitetsförbättringar du skapat. Med rätt nyckelord och struktur ökar du dina chanser att passera ATS-filtret och nå intervju.`,

    intro: 'Ett professionellt CV-exempel för administratör som visar din systemkompetens, organisationsförmåga och förmåga att hantera komplexa ärendeflöden. Optimerat för både offentlig sektor och privata bolag, samt ATS-system.',

    exempelCV: {
      namn: 'Anna Bergström',
      titel: 'Senior Administratör med expertis inom ärendehantering och systemstöd',
      kontakt: {
        telefon: '070-234 56 78',
        epost: 'anna.bergstrom@email.se',
        plats: 'Stockholm',
        linkedin: 'linkedin.com/in/annabergstrom'
      },

      profil: 'Senior Administratör med 8+ års erfarenhet från ärendehantering, koordination och systemstöd i offentlig och privat sektor. Specialist på Microsoft 365, Visma och W3D3 med gedigen kunskap i OSL och GDPR. Strukturerad och serviceinriktad teamplayer som brinner för att skapa effektiva arbetsflöden och hög leveransprecision.',

      erfarenhet: [
        {
          titel: 'Senior Administratör & Teamkoordinator',
          arbetsgivare: 'Stockholms Stad, Utbildningsförvaltningen',
          period: '2021 – Pågående',
          beskrivning: [
            'Koordinerar 200+ ärenden/månad med 98% leveransprecision inom kommunal ärendehantering (W3D3)',
            'Implementerade W3D3 som reducerade genomsnittlig handläggningstid med 30% (från 12 till 8 dagar)',
            'Utbildat 15+ kollegor i W3D3 och OSL-ärendehantering under 12 tillfällen (4.8/5 i utvärdering)',
            'Stödjer 5 kollegor med löpande systemfrågor och processutveckling i Microsoft 365 och Visma',
            'Ansvarar för tidrapportering, konferensbokning och resebokningar för 40+ medarbetare via Visma'
          ]
        },
        {
          titel: 'Administratör',
          arbetsgivare: 'Konsultbolaget Teamwork AB, Stockholm',
          period: '2018 – 2021',
          beskrivning: [
            'Hanterade 120+ kundfakturor/månad i Visma med 99% precision (genomsnittlig felfrekvens 1%)',
            'Koordinerade 3 stora konferenser (150+ deltagare vardera) med ansvar för logistik, bokning och budget (totalt 500 Tkr)',
            'Reducerade faktureringsfel med 40% genom att skapa mallar och checklistor i Excel och Visma',
            'Stöttade konsultchefer med avtalshantering, tidsrapportering och klientkommunikation'
          ]
        },
        {
          titel: 'Administrativ Assistent',
          arbetsgivare: 'Swedish Tech Solutions AB, Solna',
          period: '2016 – 2018',
          beskrivning: [
            'Ansvarade för inkommande ärenden (telefonväxel 50+ samtal/dag, e-post och ärenderegistrering)',
            'Administrerade mötesbokning och resplaner för 15 säljare via Outlook och Teams',
            'Skapade rapporter och presentationer i PowerPoint och Excel för säljteam (10+ presentationer/månad)',
            'Fick bred erfarenhet av CRM-system (Salesforce) och dokumenthantering (SharePoint)'
          ]
        }
      ],

      utbildning: [
        {
          titel: 'Administratörsprogrammet, 120 hp',
          skola: 'Jensen Yrkeshögskola, Stockholm',
          period: '2014 – 2016',
          beskrivning: 'Specialisering inom ekonomiadministration och ärendehantering. Praktikperioder på 2 företag inom offentlig och privat sektor.'
        }
      ],

      kompetenser: {
        tekniska: [
          'Microsoft 365 (Expert, 8+ år) – Word, Excel (pivottabeller, LETARAD), Outlook, Teams, SharePoint',
          'Visma (Avancerad, 5+ år) – Ekonomi, tidrapportering, lönehantering',
          'W3D3 – kommunal ärendehantering (3+ år)',
          'OSL – Offentlighetsprincipen och Sekretesslagen',
          'GDPR – personuppgiftshantering och dataskydd',
          'Salesforce (CRM-system)',
          'PowerPoint (presentationer och rapporter)'
        ],
        personliga: [
          'Strukturerad och detaljorienterad (98% leveransprecision över 200+ ärenden/månad)',
          'Serviceinriktad (stöttade 40+ medarbetare, 95% positiv feedback)',
          'Stresstålig (koordinerade 3 simultana konferenser med 150+ deltagare vardera)',
          'Pedagogisk (utbildade 15+ kollegor i W3D3, betyg 4.8/5)',
          'Lösningsorienterad (skapade mallar som reducerade faktureringsfel med 40%)'
        ]
      },

      certifieringar: [
        'Microsoft 365 Certified: Fundamentals (2023)',
        'GDPR – Grundkurs personuppgiftshantering (2022)',
        'OSL – Offentlighetsprincipen och Sekretesslagen (2021)',
        'Visma Administration (certifierad 2019)'
      ],

      sprak: [
        { sprak: 'Svenska', niva: 'Modersmål' },
        { sprak: 'Engelska', niva: 'Flytande i tal och skrift' }
      ]
    },

    varforDetFungerar: [
      {
        rubrik: 'Professionell profiltext med rätt nyckelord',
        text: `Profiltexten följer tydlig struktur: "8+ års erfarenhet från ärendehantering, koordination och systemstöd" (omfattning) → "Specialist på Microsoft 365, Visma och W3D3" (konkreta system) → "Strukturerad och serviceinriktad" (drivkrafter).

De tre meningarna ger rekryteraren direkt överblick av systemkompetens, erfarenhetsnivå och personlighet. ATS-system letar efter specifika termer – Microsoft 365, Visma, W3D3, OSL, ärendehantering – eftersom rekryterare sällan har tid att gräva efter dem längre ner i CV:t. Genom att inkludera dessa i profiltexten ökar sannolikheten att passera den automatiska screeningen.`
      },
      {
        rubrik: 'Kvantifierbara resultat som sticker ut',
        text: `Här är skillnaden mellan ett CV som ignoreras och ett som bokas för intervju: Konkreta siffror.

Rekryterare inom administratörsroller ser hundratals CV:n där kandidater skriver "ansvarade för ärendehantering" eller "koordinerade möten". Detta säger ingenting om omfattning, komplexitet eller effektivitet.

**Jämför dessa två:**
❌ "Ansvarade för ärendehantering och koordination"
✅ "Koordinerar 200+ ärenden/månad med 98% leveransprecision"

Den första kandidaten kan ha hanterat 10 ärenden/månad. Den andra visar både volym OCH kvalitet. Siffror ger kontext och trovärdighet – och ger rekryteraren något konkret att fråga om under intervjun.`
      },
      {
        rubrik: 'Branschspecifika system och certifieringar',
        text: `CV:t listar konkreta system med kompetensnivå: Microsoft 365 (Expert, 8+ år), Visma (Avancerad, 5+ år), W3D3 (3+ år). Det räcker inte att bara lista systemen – du måste visa användningslängd och nivå.

**Jämför:**
❌ "Datorvana", "Goda Office-kunskaper"
✅ "Microsoft 365 (Expert, 8+ år) – Word, Excel (pivottabeller, LETARAD), Outlook, Teams"

"Datorvana" kan betyda att du kan skicka e-post. Den andra visar exakt vilka verktyg du behärskar och hur länge. Certifieringar med årtal (Microsoft 365 Certified 2023, GDPR 2022, OSL 2021) visar dessutom att kunskapen är aktuell och kontinuerligt uppdaterad.`
      }
    ],

    tips: [
      {
        rubrik: 'Kvantifiera antal ärenden och leveransprecision',
        text: `Istället för "Ansvarade för ärendehantering" ska du specificera antal ärenden per månad och din leveransprecision. Detta ger rekryterare konkret bild av din arbetsbelastning och kvalitet.

**UNDVIK:** "Ansvarade för ärendehantering och administration"
**BRA:** "Koordinerar 200+ ärenden/månad med 98% leveransprecision inom kommunal ärendehantering (W3D3)"

Siffror visar omfattning, kvalitet och konkret systemkompetens. Rekryterare får omedelbart kontext till din erfarenhet.`
      },
      {
        rubrik: 'Visa konkreta förbättringar med före/efter',
        text: `Kvantifierbara resultat sticker ut. Använd procent, tid eller kostnadsbesparingar för att visa hur du förbättrat processer eller skapat värde.

**UNDVIK:** "Implementerade nytt system för ärendehantering"
**BRA:** "Implementerade W3D3 som reducerade genomsnittlig handläggningstid med 30% (från 12 till 8 dagar)"

Skillnaden mellan "förbättrade processer" och "reducerade handläggningstid med 30%" är enorm i rekryterares ögon.`
      },
      {
        rubrik: 'Lista system med kompetensnivå och användningsområde',
        text: `Undvik vaga termer som "datorvana" eller "goda Office-kunskaper". Lista istället konkreta system med nivå och specifika verktyg du behärskar.

**UNDVIK:** "Goda kunskaper i Office och administrativa system"
**BRA:** "Microsoft 365 (Expert, 8+ år) – Word, Excel (pivottabeller, LETARAD), Outlook, Teams, SharePoint"

Detta visar exakt vilka verktyg du behärskar, hur länge du använt dem, och vilken nivå du ligger på.`
      },
      {
        rubrik: 'Inkludera certifieringar med årtal',
        text: `Certifieringar visar att du håller dig uppdaterad med system och regelverk. Lista alltid årtal för att visa att kunskapen är aktuell.

**UNDVIK:** "Microsoft-certifierad, GDPR-utbildad"
**BRA:** "Microsoft 365 Certified: Fundamentals (2023), GDPR – Grundkurs personuppgiftshantering (2022)"

Årtal visar att din kunskap är färsk. Särskilt viktigt för GDPR, OSL och systemcertifieringar som uppdateras regelbundet.`
      },
      {
        rubrik: 'Backa upp personliga egenskaper med konkreta bevis',
        text: `Undvik "buzzword bingo" där du bara listar egenskaper utan kontext. Visa istället dessa genom konkreta exempel från din arbetserfarenhet.

**UNDVIK:** "Serviceinriktad, strukturerad, flexibel och pedagogisk"
**BRA:** "Pedagogisk (utbildade 15+ kollegor i W3D3, betyg 4.8/5). Strukturerad (98% leveransprecision över 200+ ärenden/månad)"

Konkreta bevis sticker ut. Rekryterare ser tomma listor i varje tredje CV.`
      }
    ],

    faq: [
      {
        fraga: 'Vad ska jag skriva i profiltexten som administratör?',
        svar: 'Följ strukturen: Erfarenhet (antal år) + Specialisering (ärendehantering, systemstöd, ekonomiadministration) + Tekniska nyckelord (Microsoft 365, Visma, W3D3, OSL) + Personlighetsdrag (strukturerad, serviceinriktad). Exempel: "Senior Administratör med 8+ års erfarenhet från ärendehantering och systemstöd. Specialist på Microsoft 365 och Visma med gedigen kunskap i OSL och GDPR. Strukturerad teamplayer som brinner för effektiva arbetsflöden." Inkludera gärna ett kvantifierbart resultat redan i profilen.'
      },
      {
        fraga: 'Vilka system ska jag lista i mitt CV som administratör?',
        svar: 'Lista alla relevanta system med kompetensnivå och användningsområde. Vanliga system: Microsoft 365 (Word, Excel, Outlook, Teams, SharePoint), Visma (ekonomi, lön, tidrapportering), W3D3 (offentlig sektor), CRM-system (Salesforce, Lime), ekonomisystem (Fortnox, Agresso). Skriv "Visma (Avancerad, 5+ år) – ekonomi, tidrapportering" istället för bara "Visma". Detta visar konkret kompetens, inte bara att du känner till systemet.'
      },
      {
        fraga: 'Hur kvantifierar jag min administrativa erfarenhet?',
        svar: 'Använd antal ärenden per månad/vecka, antal fakturor, antal medarbetare du stöttat, antal konferenser du koordinerat, eller budgetansvar. Exempel: "Hanterade 120+ kundfakturor/månad med 99% precision" eller "Koordinerar 200+ ärenden/månad med 98% leveransprecision". Siffror ger kontext och visar omfattning av din arbetsbelastning. Undvik vaga beskrivningar som "ansvarade för administration".'
      },
      {
        fraga: 'Ska jag nämna GDPR och OSL i mitt CV?',
        svar: 'JA, särskilt om du söker jobb inom offentlig sektor eller hos företag som hanterar personuppgifter. GDPR är lagkrav för alla organisationer som hanterar personuppgifter. OSL (Offentlighetsprincipen och Sekretesslagen) är kritiskt för kommuner och myndigheter. Lista under både Kompetenser och Certifieringar med årtal: "GDPR – Grundkurs (2022)", "OSL (2021)". Detta visar att du förstår regelverken som styr administrativt arbete.'
      },
      {
        fraga: 'Hur visar jag progression i min administratörskarriär?',
        svar: 'Visa tydlig progression i ansvar och komplexitet: Administrativ Assistent (mötesbokning, telefonväxel) → Administratör (fakturering, konferenser) → Senior Administratör (systemimplementering, utbildning, teamkoordination). Kvantifiera ansvarsutvecklingen: "stöttade 15 säljare" → "stöttade 40+ medarbetare" eller "hanterade 50 samtal/dag" → "koordinerar 200+ ärenden/månad". Detta visar ambition och förmåga att ta större ansvar över tid.'
      }
    ],

    kategori: 'kontor',
    relaterade: [
      { yrke: 'Handläggare', slug: 'handlaggare' },
      { yrke: 'Receptionist', slug: 'receptionist' },
      { yrke: 'Ekonomiassistent', slug: 'ekonomiassistent' }
    ]
  },

  'lokalvardare': {
    yrke: 'Lokalvårdare',
    sokvolym: 720,
    metaTitle: 'CV Exempel Lokalvårdare 2025 - Professionell Mall | Jobbcoach.ai',
    metaDescription: 'Se ett komplett CV-exempel för lokalvårdare. ATS-optimerat, strukturerat för svenska städföretag och visar städteknisk kompetens, kemikaliehantering och kvantifierbara resultat.',

    seoIntro: 'Söker du jobb som lokalvårdare och behöver ett CV som sticker ut? Det här exemplet visar hur du strukturerar ett ATS-optimerat CV som passar svenska städföretag, fastighetsbolag och kommunala verksamheter.\n\nDu får se exakt hur du balanserar teknisk städkompetens (desinfektionsrutiner, golvvård, kemikaliehantering enligt SDS) med de mjuka färdigheter som rekryterare söker (noggrannhet, självständighet, tidsplanering). CV:t visar konkreta resultat från storstädning och daglig lokalvård med kvantifierbara exempel som "ansvarig för 3 500 kvm kontorsyta" och "reducerade kemikalieanvändning med 20%".\n\nAnvänd det som inspiration för ditt eget CV lokalvårdare och anpassa det efter den tjänst du söker. Läs också våra tips om hur du lyfter fram rätt nyckelord för städbranschen för att öka dina chanser till intervju.',

    intro: 'Ett professionellt CV-exempel för lokalvårdare som visar din städtekniska kompetens, erfarenhet av olika städmiljöer och förmåga att leverera kvalitetsresultat. Detta exempel är optimerat för svenska städföretag och ATS-system.',

    exempelCV: {
      namn: 'Maria Eriksson',
      titel: 'Erfaren lokalvårdare med specialisering i kontorsstädning och desinfektionsrutiner',
      kontakt: {
        telefon: '070-345 67 89',
        epost: 'maria.eriksson@email.se',
        plats: 'Malmö',
        linkedin: 'linkedin.com/in/mariaeriksson'
      },

      profil: 'Noggrann lokalvårdare med 6+ års erfarenhet av kontorsstädning, sjukhusmiljöer och storstädning. Specialist på desinfektionsrutiner, kemikaliehantering enligt SDS och golvvård (polish, boning, maskinstädning). Självständig och pålitlig medarbetare med körkort B och truckkort, van vid flexibla arbetstider och stort eget ansvar för 3 500+ kvm yta.',

      erfarenhet: [
        {
          titel: 'Lokalvårdare, Teamledare',
          arbetsgivare: 'Städspecialisten AB, Malmö',
          period: '2021 – Pågående',
          beskrivning: [
            'Ansvarig för daglig lokalvård av 3 500 kvm kontorsyta fördelat på 3 våningsplan med 200+ arbetsplatser',
            'Teamledare för 4 lokalvårdare med ansvar för schemaläggning, kvalitetskontroll och introduktion av nyanställda',
            'Implementerade nya desinfektionsrutiner under pandemin vilket resulterade i noll smittspridning på arbetsplatsen',
            'Reducerade kemikalieanvändning med 20% genom dosering enligt SDS och övergång till miljömärkta produkter',
            'Utför storstädning kvartalsvis inklusive golvvård (boning, polish) och fönsterputsning'
          ]
        },
        {
          titel: 'Lokalvårdare',
          arbetsgivare: 'Region Skåne, Universitetssjukhuset Malmö',
          period: '2018 – 2021',
          beskrivning: [
            'Hygienisk städning av 2 000 kvm sjukhusmiljö inklusive operationsavdelning och intensivvård',
            'Strikt följde hygienrutiner och smittskyddsprotokoll med 100% godkända hygienkontroller under 3 år',
            'Ansvarig för daglig påfyllning av förbrukningsmaterial (handsprit, tvål, pappershanddukar) för 50+ rum',
            'Samarbetade med vårdpersonal kring akuta städbehov och specialrengöring efter smittsamma patienter'
          ]
        },
        {
          titel: 'Städare',
          arbetsgivare: 'Samhall AB, Malmö',
          period: '2016 – 2018',
          beskrivning: [
            'Utförde kontorsstädning på 5 olika arbetsplatser med totalt 1 500 kvm yta',
            'Ansvarig för egen tidsplanering och kvalitetssäkring enligt kundspecifikation',
            'Fick utmärkelse "Månadens medarbetare" för noggrannhet och positiv kundfeedback'
          ]
        }
      ],

      utbildning: [
        {
          titel: 'Lokalvårdsutbildning med inriktning hygien och miljö',
          skola: 'Städakademin, Malmö',
          period: '2016',
          beskrivning: 'Certifierad utbildning i städteknik, kemikaliehantering enligt SDS, ergonomi och miljömärkt städning. Praktik på sjukhus och kontorsmiljö.'
        }
      ],

      kompetenser: {
        tekniska: [
          'Kontorsstädning och storstädning (Expert, 6+ år)',
          'Sjukhusstädning och hygienprotokoll (Avancerad, 3+ år)',
          'Golvvård – boning, polish, maskinstädning (Avancerad, 4+ år)',
          'Kemikaliehantering enligt SDS (Säkerhetsdatablad)',
          'Desinfektionsrutiner och smittskydd',
          'Fönsterputsning och höghöjdsarbete',
          'Miljömärkta städprodukter (Svanen, Bra Miljöval)'
        ],
        personliga: [
          'Noggrann och kvalitetsmedveten (100% godkända hygienkontroller under 3 år på sjukhus)',
          'Självständig och pålitlig (eget ansvar för 3 500 kvm utan daglig övervakning)',
          'Flexibel med arbetstider (erfarenhet av dag, kväll, helg och jourtjänst)',
          'Fysiskt uthållig (hanterar 8-timmars skift med tunga maskiner)',
          'Kommunikativ teamledare (introducerade 8+ nyanställda under 2 år)'
        ]
      },

      certifieringar: [
        'Lokalvårdscertifikat – Städakademin (2016)',
        'Kemikaliehantering enligt SDS (förnyad 2024)',
        'Hygienutbildning för vård- och omsorgsmiljöer (2018)',
        'Truckkort A+B (2020)',
        'Ergonomi och säkert lyft – Prevent (2023)',
        'Första hjälpen och HLR (förnyad 2024)'
      ],

      sprak: [
        { sprak: 'Svenska', niva: 'Modersmål' },
        { sprak: 'Engelska', niva: 'Grundläggande' },
        { sprak: 'Polska', niva: 'Modersmål' }
      ]
    },

    varforDetFungerar: [
      {
        rubrik: 'ATS-optimerad struktur med branschspecifika nyckelord',
        text: 'CV:t innehåller nyckelord som städföretag och rekryteringssystem letar efter: lokalvård, kontorsstädning, storstädning, desinfektionsrutiner, kemikaliehantering, SDS (Säkerhetsdatablad), golvvård, hygienprotokoll, och miljömärkta produkter. Dessa termer matchas direkt mot jobbannonser inom städbranschen.\n\nRubriker som "Erfarenhet", "Kompetenser" och "Certifieringar" följer standard som ATS-system förstår. Specifik terminologi som "boning", "polish" och "maskinstädning" visar att du behärskar fackspråket och kan börja arbeta utan lång introduktion.\n\nGenom att nämna ytor i kvadratmeter (3 500 kvm, 2 000 kvm) ger du rekryterare konkret bild av din kapacitet och arbetsbelastning.'
      },
      {
        rubrik: 'Kvantifierbara resultat istället för vaga ansvarsområden',
        text: 'Istället för att skriva "ansvarig för städning" visar CV:t konkreta siffror:\n- "Ansvarig för 3 500 kvm kontorsyta fördelat på 3 våningsplan"\n- "100% godkända hygienkontroller under 3 år"\n- "Reducerade kemikalieanvändning med 20%"\n- "Teamledare för 4 lokalvårdare"\n\nVarför detta fungerar: Rekryterare inom städbranschen ser hundratals CV:n där kandidater skriver "städade kontor" eller "ansvarig för lokalvård". Dessa beskrivningar säger ingenting om omfattning.\n\nSiffror ger trovärdighet och kontext. Skillnaden mellan "städade kontor" och "ansvarig för 3 500 kvm kontorsyta med 200+ arbetsplatser" är enorm – det visar att du kan hantera stora ytor och hög arbetsbelastning effektivt.'
      },
      {
        rubrik: 'Balans mellan tekniska färdigheter och personliga egenskaper',
        text: 'CV:t kombinerar teknisk kompetens (golvvård, kemikaliehantering, desinfektionsrutiner) med mjuka färdigheter (noggrannhet, självständighet, flexibilitet). Båda är kritiska inom städbranschen.\n\nVarje personlig egenskap backas upp med konkret bevis. "Noggrann" visas genom "100% godkända hygienkontroller under 3 år på sjukhus". "Självständig" styrks med "eget ansvar för 3 500 kvm utan daglig övervakning". "Flexibel" exemplifieras med "erfarenhet av dag, kväll, helg och jourtjänst".\n\nDetta undviker tomma påståenden som "noggrann och pålitlig" utan sammanhang. Rekryterare ser dessa buzzwords i varje tredje CV – konkreta bevis sticker ut.'
      },
      {
        rubrik: 'Certifieringar som trovärdighetsmarkör',
        text: 'Alla certifieringar har årtal: "Kemikaliehantering enligt SDS (förnyad 2024)", "Hygienutbildning för vård- och omsorgsmiljöer (2018)", "Truckkort A+B (2020)". Detta visar att du håller dig uppdaterad och tar ditt yrke på allvar.\n\nTruckkort och körkort B nämns eftersom dessa ofta är krav för lokalvårdare som behöver transportera material eller arbeta på flera platser. Första hjälpen och HLR visar säkerhetsmedvetenhet.\n\nCertifieringar fungerar som objektiva bevis på kompetens som arbetsgivare kan verifiera, till skillnad från påståenden om att vara "duktig på städning".'
      },
      {
        rubrik: 'Profiltext som säljande sammanfattning',
        text: 'Profiltexten sammanfattar erfarenhet (6+ år), specialisering (kontorsstädning, sjukhusmiljöer, storstädning) och unika styrkor på 3-4 meningar. Rekryteraren ser direkt om du matchar tjänsten.\n\nTekniska nyckelord (desinfektionsrutiner, SDS, golvvård, maskinstädning) och personliga egenskaper (självständig, pålitlig) ger helhetsbild. Att nämna körkort och truckkort redan i profilen visar att du uppfyller vanliga krav.\n\nKvantifierbart resultat (3 500+ kvm) redan i profiltexten fångar uppmärksamhet och visar kapacitet innan rekryteraren läser vidare.'
      },
      {
        rubrik: 'Tydlig progression från städare till teamledare',
        text: 'Karriärutvecklingen syns tydligt: Städare på Samhall (1 500 kvm, 5 arbetsplatser) → Lokalvårdare på sjukhus (2 000 kvm, hygienprotokoll) → Teamledare (3 500 kvm, 4 medarbetare). Detta visar att du utvecklats från utförare till ledare.\n\nProgressionen demonstrerar också bredd: kontorsstädning, sjukhusmiljö med strikta hygienrutiner, och storstädning. Du kan anpassa dig till olika miljöer och krav.\n\nAtt nämna "Månadens medarbetare" och att ha fått ansvar för introduktion av nyanställda signalerar att arbetsgivare litar på dig och ser potential för mer ansvar.'
      }
    ],

    tips: [
      {
        rubrik: 'Kvantifiera städyta och arbetsbelastning',
        text: 'Istället för "Ansvarig för lokalvård" ska du specificera yta i kvadratmeter, antal rum/arbetsplatser och typ av miljö. Detta ger rekryterare konkret bild av din kapacitet.\n\n**UNDVIK:** "Städade kontor och allmänna utrymmen"\n**BRA:** "Ansvarig för daglig lokalvård av 3 500 kvm kontorsyta fördelat på 3 våningsplan med 200+ arbetsplatser"\n\nSiffror visar att du kan hantera stora ytor effektivt. Om du arbetat på flera platser, summera: "Totalt ansvar för 5 000+ kvm fördelat på 4 arbetsplatser".'
      },
      {
        rubrik: 'Visa konkreta resultat från din städning',
        text: 'Kvantifierbara förbättringar sticker ut. Använd procent, godkända kontroller eller kostnadsbesparingar för att visa effekten av ditt arbete.\n\n**UNDVIK:** "Utförde städning enligt rutin"\n**BRA:** "Implementerade nya desinfektionsrutiner som resulterade i noll smittspridning under pandemin" eller "Reducerade kemikalieanvändning med 20% genom korrekt dosering enligt SDS"\n\nOm du saknar exakta siffror, beskriv kvalitetsresultat: "100% godkända hygienkontroller under 3 år" eller "Noll kundklagomål under 18 månader".'
      },
      {
        rubrik: 'Lista städtekniska kompetenser med erfarenhetsnivå',
        text: 'Undvik vaga termer som "städerfarenhet". Lista istället konkreta kompetensområden med nivå och årserfarenhet.\n\n**UNDVIK:** "Erfarenhet av städning"\n**BRA:**\n- "Kontorsstädning och storstädning (Expert, 6+ år)"\n- "Golvvård – boning, polish, maskinstädning (Avancerad, 4+ år)"\n- "Kemikaliehantering enligt SDS (Avancerad, 5+ år)"\n\nDetta visar exakt vad du kan och hur länge du arbetat med det. Rekryterare ser direkt om du matchar deras behov.'
      },
      {
        rubrik: 'Inkludera relevanta certifieringar med datum',
        text: 'Certifieringar visar professionalism och att du tar ditt yrke på allvar. Lista alltid årtal, särskilt förnyelsedatum för tidsbegränsade certifikat.\n\n**Viktiga certifieringar för lokalvårdare:**\n- Lokalvårdscertifikat eller städutbildning\n- Kemikaliehantering enligt SDS\n- Hygienutbildning (särskilt för vård/omsorg)\n- Truckkort (om relevant)\n- Ergonomi och säkert lyft\n- Första hjälpen och HLR\n\nFörnyelsedatum är viktigt: "Kemikaliehantering enligt SDS (förnyad 2024)" visar att din kunskap är aktuell.'
      },
      {
        rubrik: 'Anpassa CV för olika städmiljöer',
        text: 'Städföretag söker olika kompetenser beroende på miljö. Anpassa vad du lyfter fram beroende på tjänsten du söker.\n\n**För kontorsstädning:** Betona kontorsytor, storstädning, golvvård, fönsterputsning, flexibla arbetstider.\n\n**För sjukhus/vård:** Lyft fram hygienprotokoll, smittskydd, desinfektionsrutiner, hygienkontroller, samarbete med vårdpersonal.\n\n**För industri/lager:** Fokusera på maskinstädning, tunga ytor, truckkort, säkerhet, fysisk uthållighet.\n\nBehåll samma CV-struktur men justera profiltexten och vilken erfarenhet du expanderar mest på.'
      },
      {
        rubrik: 'Backa upp personliga egenskaper med konkreta bevis',
        text: 'Undvik att bara lista "noggrann, pålitlig, självständig" utan sammanhang. Visa istället dessa egenskaper genom konkreta exempel från din arbetserfarenhet.\n\n**UNDVIK:** "Noggrann och pålitlig städare"\n**BRA:** "Noggrann (100% godkända hygienkontroller under 3 år på sjukhus)"\n\n**UNDVIK:** "Självständig och flexibel"\n**BRA:** "Självständig (eget ansvar för 3 500 kvm utan daglig övervakning, flexibel med dag/kväll/helg)"\n\nBevis gör dina påståenden trovärdiga. Rekryterare läser "noggrann och pålitlig" i varje andra CV – konkreta exempel sticker ut.'
      }
    ],

    faq: [
      {
        fraga: 'Hur långt ska mitt CV som lokalvårdare vara?',
        svar: 'För lokalvårdare med 0-5 års erfarenhet räcker 1 sida. Med 5-10+ års erfarenhet och olika miljöer (kontor, sjukhus, industri) kan du använda 1-2 sidor. Fokusera på de senaste 5-7 åren och lyft fram progression samt certifieringar. Prioritera alltid kvalitet framför kvantitet – konkreta siffror på städytor och resultat är viktigare än att fylla sidor.'
      },
      {
        fraga: 'Ska jag ha med profilbild på mitt CV?',
        svar: 'Profilbild är frivilligt i Sverige och inget krav inom städbranschen. Fokusera istället på innehållet – kvantifierbara resultat, städmiljöer du arbetat i och certifieringar. Om du väljer att ha bild, använd en professionell bild med neutral klädsel och bakgrund.'
      },
      {
        fraga: 'Hur visar jag erfarenhet av olika städmiljöer?',
        svar: 'Lista varje typ av miljö med specifik yta och krav. Exempel: "Kontorsstädning (3 500 kvm, 200+ arbetsplatser)", "Sjukhusmiljö (2 000 kvm, hygienprotokoll, operationsavdelning)", "Industrilokaler (5 000 kvm, maskinstädning)". Detta visar bredd och att du kan anpassa dig till olika krav och rutiner.'
      },
      {
        fraga: 'Vilka certifieringar är viktigast för lokalvårdare?',
        svar: 'Prioritera dessa certifieringar: Lokalvårdscertifikat eller städutbildning, kemikaliehantering enligt SDS (Säkerhetsdatablad), hygienutbildning (särskilt för vård/omsorg), ergonomi och säkert lyft. Truckkort A+B är meriterande för arbeten som kräver materialhantering. Ange alltid årtal och förnyelsedatum för att visa att kunskapen är aktuell.'
      },
      {
        fraga: 'Hur kvantifierar jag min städerfarenhet?',
        svar: 'Använd kvadratmeter (kvm) för ytor, antal rum eller arbetsplatser, antal våningsplan, och antal arbetsplatser du städar. Exempel: "Ansvarig för 3 500 kvm kontorsyta" eller "Daglig städning av 50+ rum på sjukhusavdelning". Om du arbetar på flera platser: "Totalt ansvar för 5 arbetsplatser med sammanlagt 4 000 kvm". Siffror ger kontext och visar kapacitet.'
      },
      {
        fraga: 'Hur visar jag kemikaliehantering i mitt CV?',
        svar: 'Lista "Kemikaliehantering enligt SDS" under både Kompetenser och Certifieringar. I erfarenhetsbeskrivningar, visa konkret tillämpning: "Reducerade kemikalieanvändning med 20% genom dosering enligt SDS och övergång till miljömärkta produkter". Nämn specifika produkttyper om relevant: desinfektionsmedel, golvvårdsmedel, fönsterputs. Detta visar både teoretisk kunskap och praktisk tillämpning.'
      },
      {
        fraga: 'Ska jag nämna körkort och truckkort?',
        svar: 'JA, om du har dem! Körkort B är ofta krav för lokalvårdare som arbetar på flera platser eller behöver transportera material. Truckkort (A, B eller båda) är meriterande för industristädning och lager. Lista under Certifieringar med årtal: "Körkort B (2015)", "Truckkort A+B (2020)". Nämn även i profiltexten om det är relevant för tjänsten du söker.'
      },
      {
        fraga: 'Hur beskriver jag teamledarerfarenhet inom städ?',
        svar: 'Kvantifiera antal medarbetare du lett och ditt ansvarsområde. Exempel: "Teamledare för 4 lokalvårdare med ansvar för schemaläggning, kvalitetskontroll och introduktion av nyanställda". Om du introducerat nya medarbetare: "Introducerade 8+ nyanställda under 2 år". Beskriv även kvalitetsansvar: "Ansvarig för kvalitetskontroll och kundkontakt för 3 arbetsplatser".'
      },
      {
        fraga: 'Hur visar jag flexibilitet med arbetstider?',
        svar: 'Beskriv konkret vilka tider du arbetat. Exempel: "Erfarenhet av dag-, kvälls- och helgstädning" eller "Flexibel schemaläggning inklusive jour och helger". Om du arbetat tidiga morgnar (vanligt inom kontorsstädning): "Van vid tidig morgonstädning (05:00-start) för att möjliggöra städfria kontorstider". Detta visar att du förstår branschens krav på flexibilitet.'
      },
      {
        fraga: 'Hur hanterar jag luckor i mitt CV?',
        svar: 'Var ärlig och förklara kort. Vanliga skäl som föräldraledighet, studier eller vård av anhörig accepteras. Exempel: "Föräldraledighet (2020-2021)". Om du vidareutbildat dig under luckan, lyft fram det: "Städutbildning med inriktning hygien (2021)". Fokusera sedan på din kompetens och erfarenhet. Rekryterare förstår att livet händer – det viktiga är att du har relevant kompetens nu.'
      }
    ],

    kategori: 'service',
    relaterade: [
      { yrke: 'Fastighetsskötare', slug: 'fastighetsskotare' },
      { yrke: 'Hemtjänstpersonal', slug: 'hemtjanstpersonal' },
      { yrke: 'Servicemedarbetare', slug: 'servicemedarbetare' }
    ]
  },

  'handlaggare': {
    yrke: 'Handläggare',
    sokvolym: 880,
    metaTitle: 'CV Exempel Handläggare 2025 - Professionell Mall | Jobbcoach.ai',
    metaDescription: 'Se ett komplett CV-exempel för handläggare inom offentlig sektor. ATS-optimerat för kommuner och myndigheter med regelverkskännedom, ärendehantering och kvantifierbara resultat.',

    seoIntro: 'Söker du jobb som handläggare och behöver ett CV som sticker ut? Det här exemplet visar hur du strukturerar ett ATS-optimerat CV som passar kommuner, myndigheter och landsting.\n\nDu får se exakt hur du balanserar juridisk kompetens (SoL, LVU, förvaltningslagen, LAS) med administrativa färdigheter (ärendehantering, utredningsmetodik, dokumentation) och de personliga egenskaper som rekryterare söker (noggrannhet, stresstålighet, kommunikationsförmåga). CV:t visar konkreta resultat från socialförvaltning och arbetsförmedling med kvantifierbara exempel som "hanterade 35 parallella ärenden" och "minskade handläggningstid med 20%".\n\nAnvänd det som inspiration för ditt eget CV handläggare och anpassa det efter den tjänst du söker – socialsekreterare, LSS-handläggare, arbetsförmedlare eller myndighetstjänsteman.',

    intro: 'Ett professionellt CV-exempel för handläggare som visar din juridiska kompetens, erfarenhet av myndighetsutövning och förmåga att leverera kvalitetsresultat inom offentlig sektor. Detta exempel är optimerat för svenska kommuner, myndigheter och ATS-system.',

    exempelCV: {
      namn: 'Anna Lindström',
      titel: 'Erfaren handläggare med specialisering i socialrätt och barnavårdsutredningar',
      kontakt: {
        telefon: '070-123 45 67',
        epost: 'anna.lindstrom@email.se',
        plats: 'Stockholm',
        linkedin: 'linkedin.com/in/annalindstrom'
      },

      profil: 'Erfaren handläggare med 7+ års erfarenhet från socialförvaltning och arbetsmarknad. Specialist på barnavårdsutredningar enligt SoL kap 11, LVU-ärenden och ekonomiskt bistånd. Gedigen kännedom om förvaltningslagen, offentlighet och sekretess samt dokumentationssystem (Treserva, ProCapita, Combine). Noggrann och oberoende beslutsfattare med dokumenterad förmåga att hantera 35+ parallella ärenden samtidigt under hög arbetsbelastning.',

      erfarenhet: [
        {
          titel: 'Socialsekreterare, Barn och unga',
          arbetsgivare: 'Stockholms stad, Socialförvaltning Södermalm',
          period: '2020 – Pågående',
          beskrivning: [
            'Ansvarig för 30-35 barnavårdsärenden parallellt enligt SoL kap 11 och LVU, inklusive utredningar, riskbedömningar och familjeinsatser',
            'Genomförde 15-20 barn- och familjeutredningar per år med 98% godkända kvalitetsgranskningar (2020-2024)',
            'Minskade genomsnittlig handläggningstid från 6 till 4,5 månader genom effektiv samordning med skola, BUP och polis',
            'Samarbetar tvärprofessionellt med socialtjänst, polis, skola, hälso- och sjukvård i komplexa ärenden',
            'Dokumenterar enligt gällande lagstiftning i ProCapita med hög juridisk precision och korrekt sekretesshantering'
          ]
        },
        {
          titel: 'Handläggare, Ekonomiskt bistånd',
          arbetsgivare: 'Huddinge kommun, Socialförvaltning',
          period: '2018 – 2020',
          beskrivning: [
            'Handlade 40-45 ärenden avseende ekonomiskt bistånd enligt SoL kap 4 med fokus på långtidsarbetslösa och nyanlända',
            'Utredde ansökningar om ekonomiskt bistånd, boendestöd och försörjningsstöd enligt riksnormen och kommunala riktlinjer',
            'Implementerade ny mall för utredningar vilket minskade kompletteringsbehov med 30% och förbättrade ärendekvalitet',
            'Ansvarig för budgetuppföljning och statistikrapportering till enhetschef (månadsvis)'
          ]
        },
        {
          titel: 'Arbetsförmedlare',
          arbetsgivare: 'Arbetsförmedlingen, Stockholm City',
          period: '2017 – 2018',
          beskrivning: [
            'Coachade 80 arbetssökande per månad i matchning, CV-skrivning, intervjuteknik och omställning',
            'Ansvarig för arbetsmarknadspolitiska program (t.ex. extratjänster, traineejobb) för 25-30 deltagare samtidigt',
            'Samarbetade med arbetsgivare för rekryteringsmatchning och uppföljning av arbetssökande'
          ]
        }
      ],

      utbildning: [
        {
          titel: 'Socionomprogrammet, 210 hp',
          skola: 'Stockholms universitet',
          period: '2013 – 2017',
          beskrivning: 'Kandidatexamen i socialt arbete med inriktning barn och unga. VFU-perioder inom individ- och familjeomsorg samt öppenvård. Examensarbete: "Barns delaktighet i utredningar enligt SoL kap 11".'
        }
      ],

      kompetenser: {
        tekniska: [
          'Socialrätt – SoL, LVU, LSS (Expert, 7+ år)',
          'Barnavårdsutredningar enligt SoL kap 11 (Expert, 4+ år)',
          'Förvaltningslagen och offentlighet/sekretess (Avancerad, 7+ år)',
          'ProCapita och Treserva (ärendehanteringssystem)',
          'Ekonomiskt bistånd och riksnormen',
          'Utredningsmetodik och riskbedömning (BBIC, FREDA)',
          'Dokumentation och beslutsfattande'
        ],
        personliga: [
          'Noggrann och juridiskt precis (98% godkända kvalitetsgranskningar över 4 år)',
          'Stresstålig med hög arbetsbelastning (hanterar 35 parallella ärenden)',
          'Oberoende beslutsfattare (fattar myndighetsbeslut enligt delegationsordning)',
          'Kommunikativ i känsliga samtal (barn, familjer, tvärprofessionella möten)',
          'Empatisk men gränssättande (balanserar stöd och myndighetsutövning)'
        ]
      },

      certifieringar: [
        'Barnkonventionen och barns delaktighet – Socialstyrelsen (2023)',
        'BBIC (Barns behov i centrum) – grundutbildning (2020)',
        'FREDA (riskbedömning vid våld i nära relationer) (2021)',
        'Motiverande samtal (MI) – grundkurs (2019)',
        'Juridik och beslutsfattande för socialsekreterare (2022)'
      ],

      sprak: [
        { sprak: 'Svenska', niva: 'Modersmål' },
        { sprak: 'Engelska', niva: 'Flytande (C1)' },
        { sprak: 'Spanska', niva: 'Grundläggande (A2)' }
      ]
    },

    varforDetFungerar: [
      {
        rubrik: 'ATS-optimerad struktur med branschspecifika nyckelord för offentlig sektor',
        text: 'CV:t innehåller nyckelord som kommuner, regioner och statliga myndigheter letar efter: socialsekreterare, barnavårdsutredningar, SoL (Socialtjänstlagen), LVU (Lagen med särskilda bestämmelser om vård av unga), ProCapita, BBIC (Barns behov i centrum), förvaltningslagen, tvärprofessionellt samarbete och myndighetsutövning. Dessa termer matchas direkt mot jobbannonser inom offentlig sektor.\n\nRubriker som "Arbetslivserfarenhet", "Kompetenser" och "Certifieringar" följer standard som ATS-system förstår. Specifik terminologi som "barnavårdsutredningar enligt SoL kap 11" och "ekonomiskt bistånd" visar att du behärskar regelverket och kan börja arbeta utan lång introduktion.\n\nGenom att nämna antal ärenden (30-35 parallella ärenden) och IT-system (ProCapita, Treserva, Combine) ger du rekryterare konkret bild av din arbetsbelastning och tekniska kompetens.'
      },
      {
        rubrik: 'Kvantifierbara resultat istället för vaga ansvarsområden',
        text: 'Istället för att skriva "ansvarig för utredningar" visar CV:t konkreta siffror:\n- "Hanterar 30-35 parallella ärenden"\n- "98% godkända kvalitetsgranskningar (4 år)"\n- "Minskade handläggningstid från 6 till 4,5 månader"\n- "7+ års erfarenhet inom tre olika handläggningsområden"\n\nVarför detta fungerar: Rekryterare inom offentlig sektor ser hundratals CV:n där kandidater skriver "handlade utredningar" eller "arbetade med klienter". Dessa beskrivningar säger ingenting om omfattning, kvalitet eller resultat.\n\nSiffror ger trovärdighet och visar arbetskapacitet. Skillnaden mellan "ansvarig för barnavårdsutredningar" och "hanterar 30-35 parallella ärenden med 98% godkända kvalitetsgranskningar" är enorm – det visar att du kan hantera hög arbetsbelastning med bibehållen kvalitet och rättssäkerhet.'
      },
      {
        rubrik: 'Balans mellan juridisk kompetens och personliga egenskaper',
        text: 'CV:t kombinerar regelverkskännedom (SoL, LVU, förvaltningslagen) med mjuka färdigheter (empatisk bemötande, beslutsförmåga, konflikthantering). Båda är kritiska för handläggare inom offentlig sektor.\n\nVarje personlig egenskap backas upp med konkret bevis. "Analytisk" visas genom "98% godkända kvalitetsgranskningar under 4 år". "Effektiv" styrks med "minskade handläggningstid från 6 till 4,5 månader". "Samarbetsförmåga" exemplifieras med konkreta exempel på tvärprofessionellt samarbete med polis, skola och BUP.\n\nDetta undviker tomma påståenden som "kommunikativ, flexibel, driven" utan sammanhang – det buzzword bingo som rekryterare ser i varje tredje CV. Konkreta bevis på hur du arbetat med komplexa ärenden och samverkat med andra myndigheter sticker ut och visar verklig kompetens.'
      },
      {
        rubrik: 'Certifieringar och fortbildningar som trovärdighetsmarkör',
        text: 'Alla certifieringar har årtal: "BBIC – Barns behov i centrum (2020)", "FREDA – strukturerad riskbedömning (2021)", "Motiverande samtal (2019)", "Barnkonventionen i praktiken (2023)". Detta visar att du investerar i kontinuerlig kompetensutveckling och håller dig uppdaterad med nya metoder och lagstiftning.\n\nCertifieringar som BBIC och FREDA är branschstandard inom socialtjänsten och visar att du behärskar strukturerade utredningsmetoder. Motiverande samtal visar kompetens i klientarbete. Barnkonventionsutbildning visar att du följer aktuell lagstiftning (barnkonventionen blev svensk lag 2020).\n\nFortbildningar fungerar som objektiva bevis på kompetens som arbetsgivare kan verifiera, till skillnad från påståenden om att vara "duktig på utredningsarbete". De visar också professionalism och engagemang i yrket.'
      },
      {
        rubrik: 'Profiltext som säljande sammanfattning för myndighetsrekrytering',
        text: 'Profiltexten sammanfattar erfarenhet (7+ år), specialisering (barnavårdsutredningar, ekonomiskt bistånd) och utbildning (socionomprogrammet) på 3-4 meningar. Rekryteraren ser direkt om du matchar tjänstens krav.\n\nTekniska nyckelord (SoL, LVU, ProCapita, BBIC, tvärprofessionellt samarbete) och personliga egenskaper (analytisk, empatisk, strukturerad) ger helhetsbild redan i inledningen. Att nämna specifika utredningsområden (barnavård, ekonomiskt bistånd, barn och unga) visar bredd.\n\nKvantifierbart resultat (30-35 parallella ärenden, 98% godkända kvalitetsgranskningar) redan i profiltexten fångar uppmärksamhet och visar att du kan hantera hög arbetsbelastning med kvalitet – något som är kritiskt för kommuner som söker handläggare.'
      },
      {
        rubrik: 'Tydlig progression och bredd inom offentlig sektor',
        text: 'Karriärutvecklingen syns tydligt: Arbetsförmedlingen (myndighetsutövning och klientarbete) → Ekonomiskt bistånd (bedömningar och beslutsfattande) → Barn och unga/barnavård (komplexa utredningar enligt SoL och LVU). Detta visar att du utvecklats från generell handläggning till specialisering inom barnavård.\n\nProgressionen demonstrerar också bredd över handläggningsområden: arbetsmarknad, ekonomiskt stöd och socialtjänst. Du kan anpassa dig till olika regelverk, klientgrupper och myndighetsprocesser. Erfarenhet av både vuxna och barn visar flexibilitet.\n\nAtt ha arbetat på tre olika myndigheter/avdelningar visar att du kan navigera olika organisationskulturer och samarbeta med olika professioner (Arbetsförmedlingen, ekonomiskt bistånd, BUP, polis, skola). Detta är meriterande för kommuner som söker erfarna handläggare.'
      }
    ],

    tips: [
      {
        rubrik: 'Kvantifiera antal ärenden och arbetsbelastning',
        text: 'Istället för "ansvarig för utredningar" ska du specificera antal parallella ärenden, typ av ärenden och arbetsbelastning. Detta ger rekryterare konkret bild av din kapacitet.\n\n**UNDVIK:** "Arbetade med barnavårdsutredningar"\n**BRA:** "Hanterade 30-35 parallella barnavårdsärenden enligt SoL kap 11 och LVU med 15-20 slutförda utredningar per år"\n\nSiffror visar att du kan hantera hög arbetsbelastning och ger kontext för din erfarenhet. Om du arbetat med olika ärendetyper, specificera: "20 ärenden ekonomiskt bistånd, 10-15 barnavårdsutredningar".'
      },
      {
        rubrik: 'Visa konkreta resultat från din handläggning',
        text: 'Kvantifierbara förbättringar och kvalitetsmått sticker ut. Använd procent, godkända granskningar eller minskade handläggningstider för att visa effekten av ditt arbete.\n\n**UNDVIK:** "Arbetade enligt gällande kvalitetskrav"\n**BRA:** "98% godkända kvalitetsgranskningar under 4 år" eller "Minskade genomsnittlig handläggningstid från 6 till 4,5 månader genom effektivare utredningsmetodik"\n\nOm du saknar exakta siffror, beskriv kvalitetsresultat: "Noll överklagade beslut under 2 år" eller "Samtliga utredningar godkända vid internkontroll (2022-2024)".'
      },
      {
        rubrik: 'Lista regelverkskännedom med erfarenhetsnivå',
        text: 'Undvik vaga termer som "god regelverkskännedom". Lista istället konkreta lagar och förordningar med tillämpningserfarenhet.\n\n**UNDVIK:** "Erfarenhet av socialtjänstlagstiftning"\n**BRA:**\n- "SoL (Socialtjänstlagen) – barnavårdsutredningar kap 11 (Expert, 5+ år)"\n- "LVU (Lagen med särskilda bestämmelser om vård av unga) – Avancerad, 4+ år"\n- "Förvaltningslagen – myndighetsutövning och beslutsfattande (Expert, 7+ år)"\n\nDetta visar exakt vilka regelverk du behärskar och hur länge du arbetat med dem. Rekryterare ser direkt om du matchar kraven i jobbannonsen.'
      },
      {
        rubrik: 'Inkludera relevanta certifieringar och fortbildningar',
        text: 'Certifieringar visar professionalism och att du håller dig uppdaterad med metodik och lagstiftning. Lista alltid årtal för att visa att kunskapen är aktuell.\n\n**Viktiga certifieringar för handläggare:**\n- BBIC (Barns behov i centrum) – grundutbildning och fördjupning\n- FREDA (strukturerad riskbedömning vid våld i nära relationer)\n- Motiverande samtal (MI)\n- Barnkonventionen i praktiken\n- Utredningsmetodik enligt SoL\n- Förvaltningsrätt och myndighetsutövning\n\nÅrtal är viktigt: "BBIC – Barns behov i centrum (2020)" visar när du genomfört utbildningen.'
      },
      {
        rubrik: 'Anpassa CV för olika handläggningsområden',
        text: 'Kommuner och myndigheter söker olika kompetenser beroende på handläggningsområde. Anpassa vad du lyfter fram beroende på tjänsten du söker.\n\n**För barnavård/barn och unga:** Betona SoL kap 11, LVU, BBIC, tvärprofessionellt samarbete (BUP, skola, polis), riskbedömningar.\n\n**För ekonomiskt bistånd:** Lyft fram bedömningar enligt SoL kap 4, beslutsfattande, dokumentation, motiverande samtal, samverkan med Arbetsförmedlingen.\n\n**För LSS-handläggning:** Fokusera på LSS (Lagen om stöd och service), personlig assistans, biståndsbedömningar, samordning av insatser.\n\nBehåll samma CV-struktur men justera profiltexten och vilken erfarenhet du expanderar mest på.'
      }
    ],

    faq: [
      {
        fraga: 'Hur långt ska mitt CV som handläggare vara?',
        svar: 'För handläggare med 0-5 års erfarenhet räcker 1-2 sidor. Med 5-10+ års erfarenhet och olika handläggningsområden (barnavård, ekonomiskt bistånd, LSS) behövs ofta 2 sidor. Fokusera på de senaste 10 åren och lyft fram progression samt certifieringar. Offentlig sektor förväntar sig mer detaljerade beskrivningar av regelverkskännedom och ärendekomplexitet än privat sektor, så 2 sidor är helt acceptabelt för erfarna handläggare.'
      },
      {
        fraga: 'Ska jag ha med profilbild på mitt CV?',
        svar: 'Profilbild är frivilligt i Sverige och inget krav inom offentlig sektor. Fokusera istället på innehållet – kvantifierbara resultat, regelverkskännedom, certifieringar och konkret erfarenhet från olika handläggningsområden. Offentlig sektor värderar kompetens och meriter före allt annat. Om du väljer att ha bild, använd en professionell bild med neutral klädsel och bakgrund.'
      },
      {
        fraga: 'Hur visar jag erfarenhet av olika handläggningsområden?',
        svar: 'Lista varje handläggningsområde med specifikt regelverk, antal ärenden och typ av arbetsuppgifter. Exempel: "Barnavårdsutredningar enligt SoL kap 11 (30-35 parallella ärenden, 15-20 slutförda utredningar/år)", "Ekonomiskt bistånd enligt SoL kap 4 (40-50 pågående ärenden, bedömningar och beslut)", "LSS-handläggning (personlig assistans, 20-25 pågående ärenden)". Detta visar bredd och att du kan anpassa dig till olika regelverk och klientgrupper.'
      },
      {
        fraga: 'Vilka certifieringar är viktigast för handläggare?',
        svar: 'Prioritera dessa certifieringar beroende på område: BBIC (Barns behov i centrum) för barnavård, FREDA (riskbedömning våld i nära relationer), Motiverande samtal (MI) för klientarbete, Barnkonventionen i praktiken (aktuell lagstiftning sedan 2020), Utredningsmetodik enligt SoL. För ekonomiskt bistånd: bedömningsmetodik och motiverande samtal. För LSS: LSS-lagstiftning och personlig assistans. Ange alltid årtal för att visa att kunskapen är aktuell.'
      },
      {
        fraga: 'Hur kvantifierar jag min handläggarerfarenhet?',
        svar: 'Använd antal parallella ärenden, antal slutförda utredningar per år, genomsnittlig handläggningstid och kvalitetsmått. Exempel: "Hanterade 30-35 parallella ärenden" eller "Genomförde 15-20 barnavårdsutredningar per år". Om du förbättrat processer: "Minskade handläggningstid från 6 till 4,5 månader". Kvalitetsmått: "98% godkända kvalitetsgranskningar" eller "Noll överklagade beslut under 2 år". Siffror ger kontext och visar arbetskapacitet samt kvalitet.'
      }
    ],

    kategori: 'administration',
    relaterade: [
      { yrke: 'Socialsekreterare', slug: 'socialsekreterare' },
      { yrke: 'HR-specialist', slug: 'hr-specialist' },
      { yrke: 'Controller', slug: 'controller' }
    ]
  },

  'lakare': {
    yrke: 'Läkare',
    sokvolym: 1200,
    metaTitle: 'CV Exempel Läkare 2025 - Professionell Mall | Jobbcoach.ai',
    metaDescription: 'Se ett komplett CV-exempel för läkare. ATS-optimerat med legitimation, specialistbevis, kliniska mått och journalsystem (TakeCare, Cosmic, Melior). Perfekt för regionsjukhus och privata vårdgivare.',

    seoIntro: 'Söker du specialist- eller ST-läkartjänst och behöver ett CV som sticker ut? Det här exemplet visar hur du strukturerar ett ATS-optimerat CV som passar svenska regioner, universitetssjukhus och privata vårdgivare.\n\nDu får se exakt hur du balanserar klinisk kompetens (internmedicin, kardiologi, akutmedicin) med legitimationer och specialistbevis som är obligatoriska. CV:t visar konkreta resultat med kvantifierbara mått som "1 200+ patientmöten/år", "350+ ekokardiografier utförda" och "minskade väntetid för hjärtsviktsutredningar med 25%". Journalsystem som TakeCare, Melior och Cosmic samt certifieringar (ACLS, ATLS) nämns strategiskt för ATS-optimering.\n\nAnvänd det som inspiration för ditt eget CV läkare och anpassa det efter din specialisering – allmänmedicin, kirurgi, anestesi eller annan inriktning.',

    intro: 'Ett professionellt CV-exempel för läkare som visar din kliniska kompetens, specialistmeriter och förmåga att leverera evidensbaserad vård med patientfokus. Detta exempel är optimerat för svenska vårdgivare och ATS-system.',

    exempelCV: {
      namn: 'Dr. Erik Johansson',
      titel: 'Specialist i internmedicin med delspecialisering kardiologi',
      kontakt: {
        telefon: '070-234 56 78',
        epost: 'erik.johansson@email.se',
        plats: 'Stockholm',
        linkedin: 'linkedin.com/in/erikjohansson'
      },

      profil: 'Legitimerad läkare och specialist i internmedicin med 10+ års klinisk erfarenhet från akutmedicin och hjärtsvikt. Delspecialiserad inom kardiologi med gedigen kompetens i ekokardiografi, EKG-tolkning och hjärtsviktsbehandling. Dokumenterad förmåga att hantera 1 200+ patientmöten årligen med fokus på evidensbaserad vård och patientnära beslut. Erfaren i TakeCare, Melior och klinisk forskning med 8 publicerade artiklar inom hjärtsvikt.',

      erfarenhet: [
        {
          titel: 'Överläkare, Kardiologiska kliniken',
          arbetsgivare: 'Karolinska Universitetssjukhuset, Solna',
          period: '2021 – Pågående',
          beskrivning: [
            'Ansvarig för hjärtsviktsmottagning med 1 200+ patientmöten årligen – utredning, behandling och uppföljning av hjärtsvikt (HFrEF, HFpEF)',
            'Utför 350+ ekokardiografier per år (TTE) med fokus på systolisk/diastolisk funktion, klaffsjukdomar och kardiomyopatier',
            'Minskade väntetid för hjärtsviktsutredningar från 8 till 6 veckor genom implementering av snabbspår för akut försämring',
            'Handleder 3-4 ST-läkare årligen i ekokardiografi, EKG-tolkning och hjärtsviktsbehandling enligt ESC-guidelines',
            'Driver kvalitetsarbete inom SWEDEHEART-registret – förbättrade dokumentation av läkemedelsbehandling till 95% (från 78%)',
            'Använder TakeCare dagligen för journalföring, remisshantering och läkemedelsordinationer'
          ]
        },
        {
          titel: 'ST-läkare, Internmedicin (slutförd specialisttjänstgöring)',
          arbetsgivare: 'Danderyds sjukhus, Stockholm',
          period: '2016 – 2021',
          beskrivning: [
            'Specialisttjänstgöring inom internmedicin med rotationstjänstgöring på akutmottagning, kardiologi, gastro och njurmedicin',
            'Ansvarig för vårdavdelning med 18-22 patienter under jourtjänstgöring – akuta bedömningar, behandlingsplanering och tvärprofessionellt samarbete',
            'Självständig handläggning av internmedicinska tillstånd: hjärtsvikt, KOL, diabetes, sepsis, njursvikt och elektrolytrubbningar',
            'Genomförde 500+ akuta bedömningar på akutmottagningen (triagering, initial utredning, ställningstagande till inläggning)',
            'ACLS-instruktör (2019-2021) – utbildade 40+ vårdpersonal i akut hjärt-lungräddning och arytmihantering'
          ]
        },
        {
          titel: 'Underläkare (AT/ST)',
          arbetsgivare: 'Södersjukhuset, Stockholm',
          period: '2014 – 2016',
          beskrivning: [
            'AT-tjänstgöring inom internmedicin, kirurgi, akutmedicin och psykiatri (18 månader basblock + 6 månader valbara delar)',
            'Ansvarig för initial bedömning och handläggning av akuta patienter under överläkarhandledning',
            'Deltog i 200+ akuta hjärtstoppslarm och traumateam (ATLS-certifierad 2015)'
          ]
        }
      ],

      utbildning: [
        {
          titel: 'Läkarprogrammet, 330 hp',
          skola: 'Karolinska Institutet, Stockholm',
          period: '2008 – 2014',
          beskrivning: 'Läkarexamen med VFU på Karolinska, Danderyds sjukhus och Södersjukhuset. Examensarbete: "Biomarkörer vid akut hjärtsvikt – NT-proBNP och Troponin T" (publicerat i Cardiology, 2014).'
        },
        {
          titel: 'Specialistbevis Internmedicin',
          skola: 'Socialstyrelsen',
          period: '2021',
          beskrivning: 'Specialistläkare i internmedicin efter slutförd ST-tjänstgöring (60 månader) och godkänt SIMKU-prov.'
        }
      ],

      kompetenser: {
        tekniska: [
          'Internmedicin och kardiologi (Expert, 10+ år)',
          'Ekokardiografi TTE (Avancerad, 5+ år, 1 500+ undersökningar)',
          'EKG-tolkning och arytmidiagnostik (Expert, 10+ år)',
          'Hjärtsviktsbehandling enligt ESC-guidelines (Expert, 6+ år)',
          'TakeCare och Melior (journalsystem, daglig användning)',
          'ACLS, ATLS och akut internmedicin',
          'Klinisk forskning och publicering (8 artiklar)'
        ],
        personliga: [
          'Analytisk och evidensbaserad beslutsfattare (1 200+ patientmöten/år med hög diagnostisk precision)',
          'Pedagogisk handledarroll (handleder 3-4 ST-läkare årligen i ekokardiografi)',
          'Stresstålig i akuta situationer (500+ akuta bedömningar, traumateam, hjärtstoppslarm)',
          'Tvärprofessionell samarbetsförmåga (dagligt samarbete med sjuksköterskor, fysioterapeuter, dietister)',
          'Kvalitetsmedveten (driver förbättringsarbete i SWEDEHEART-registret)'
        ]
      },

      certifieringar: [
        'Specialistbevis Internmedicin – Socialstyrelsen (2021)',
        'Läkarlegitimation – Socialstyrelsen (2014, förnyad 2024)',
        'ACLS (Advanced Cardiovascular Life Support) – instruktörscertifierad (förnyad 2024)',
        'ATLS (Advanced Trauma Life Support) (2015, förnyad 2023)',
        'Ekokardiografi TTE nivå 2 – Svensk Kardiologisk Förening (2020)',
        'Strålskyddskurs för läkare (2015)',
        'Forskningsetik och GCP (Good Clinical Practice) (2019)'
      ],

      sprak: [
        { sprak: 'Svenska', niva: 'Modersmål' },
        { sprak: 'Engelska', niva: 'Flytande (C2) – medicinska publikationer och konferenser' },
        { sprak: 'Tyska', niva: 'Grundläggande (B1)' }
      ]
    },

    varforDetFungerar: [
      {
        rubrik: 'ATS-optimerad struktur med medicinska nyckelord',
        text: 'CV:t innehåller nyckelord som sjukhus, vårdcentraler och privata kliniker söker: specialist internmedicin, kardiologi, ekokardiografi, hjärtsvikt, TakeCare, Melior, ACLS, ATLS, patientmöten, ST-läkare, handledarskap, evidensbaserad vård och klinisk kompetens.\n\nDessa termer matchas direkt mot jobbannonser inom sjukvården. Rubriker som "Arbetslivserfarenhet", "Certifieringar" och "Kompetenser" följer ATS-standard. Specifik terminologi som "specialist i internmedicin med delspecialisering kardiologi" och "1 200+ patientmöten årligen" visar omfattning och erfarenhetsnivå direkt.\n\nAtt nämna både journalsystem (TakeCare, Melior) och diagnostiska metoder (ekokardiografi, ultraljud) ger rekryterare konkret bild av din tekniska kompetens och att du kan börja arbeta utan lång introduktion.'
      },
      {
        rubrik: 'Kvantifierbara kliniska resultat istället för vaga ansvarsområden',
        text: 'Istället för "ansvarig för patientvård" visar CV:t konkreta siffror: 1 200+ patientmöten årligen, 350+ ekokardiografier per år, minskade väntetid från 8 till 6 veckor, handleder 3-4 ST-läkare årligen, 8 publicerade artiklar.\n\nVarför detta fungerar: Rekryterare inom sjukvården ser hundratals CV:n där läkare skriver "erfarenhet av internmedicin" eller "arbetar med kardiologipatienter". Dessa beskrivningar säger ingenting om volym, specialisering eller kvalitet.\n\nSiffror ger trovärdighet och visar arbetskapacitet. Skillnaden mellan "arbetar med hjärtsviktspatienter" och "minskade väntetid för hjärtsviktsutredningar från 8 till 6 veckor genom effektiv triagering och patientflöde" är enorm. Det visar inte bara klinisk kompetens utan också systemtänk och förbättringsarbete som gynnar patientsäkerheten.'
      },
      {
        rubrik: 'Balans mellan klinisk kompetens och forskningsmeriter',
        text: 'CV:t kombinerar praktisk erfarenhet (1 200+ patientmöten, 350+ ekokardiografier) med akademiska meriter (8 publicerade artiklar, handledarskap för ST-läkare). Båda är kritiska för läkare som söker specialist- eller överläkartjänster.\n\nVarje kompetens backas upp med konkret bevis. "Erfaren kardiolog" styrks med "350+ ekokardiografier per år". "Pedagogisk förmåga" visas genom "handleder 3-4 ST-läkare årligen med 100% godkända specialiseringsmål". "Forskningsintresse" exemplifieras med "8 publicerade artiklar inom hjärtsvikt i peer-reviewed journals".\n\nDetta undviker tomma påståenden som "kommunikativ, empatisk, analytisk" utan sammanhang – det buzzword bingo som rekryterare ser i varje tredje CV. Konkreta bevis på hur du arbetat med komplexa patientfall, handlett kollegor och bidragit till evidensbaserad vård sticker ut och visar verklig kompetens inom specialistområdet.'
      },
      {
        rubrik: 'Certifieringar och legitimation som trovärdighetsmarkör',
        text: 'Alla certifieringar har årtal: ACLS (förnyad 2024), ATLS (förnyad 2023), Specialistbevis internmedicin (2021), Läkarlegitimation (2014). Detta visar att du uppfyller formella krav och håller dig uppdaterad med akuta behandlingsprotokoll.\n\nCertifieringar som ACLS och ATLS är branschstandard inom akutsjukvård och internmedicin. De visar att du behärskar avancerad hjärt-lungräddning och traumahantering. Specialistbevis är objektiv bekräftelse på genomförd ST-utbildning och godkända kunskapsmål.\n\nAtt lista läkarlegitimation med årtal (2014) visar 10+ års klinisk erfarenhet sedan legitimation. Förnyelsedatum på ACLS och ATLS visar att certifieringarna är aktuella – kritiskt för patientsäkerhet. Detta fungerar som objektiva bevis på kompetens som arbetsgivare kan verifiera, till skillnad från påståenden om att vara "duktig på akutmedicin".'
      },
      {
        rubrik: 'Profiltext som sammanfattar specialisering och volym',
        text: 'Profiltexten sammanfattar erfarenhet (10+ års klinisk, specialist sedan 2021), specialisering (internmedicin med delspecialisering kardiologi) och volym (1 200+ patientmöten, 350+ ekokardiografier) på 3-4 meningar. Rekryteraren ser direkt om du matchar tjänstens krav.\n\nTekniska nyckelord (hjärtsvikt, ekokardiografi, evidensbaserad vård, TakeCare, handledarskap) och personliga egenskaper (noggrann diagnostiker, pedagogisk, forskningsintresserad) ger helhetsbild redan i inledningen. Att nämna specifika patientgrupper (hjärtsvikt, hypertoni, arytmier) visar specialistkompetens.\n\nKvantifierbart resultat (minskade väntetid från 8 till 6 veckor, 8 publicerade artiklar) redan i profiltexten fångar uppmärksamhet och visar att du kan hantera hög patientvolym med kvalitet samt bidrar till utveckling av evidensbaserad vård – något som är kritiskt för sjukhus som söker specialister.'
      },
      {
        rubrik: 'Tydlig karriärprogression från AT till specialist',
        text: 'Karriärutvecklingen syns tydligt: AT-läkare (bred klinisk grund) → ST-läkare internmedicin (specialisering) → Specialist med delspecialisering kardiologi (expertområde). Detta visar en naturlig progression inom svenskt läkarsystem.\n\nProgressionen demonstrerar också bredd: primärvård, akutmedicin och slutenvård. Du har erfarenhet av olika vårdnivåer och patientgrupper. Från bred allmänmedicin till fördjupad specialistkompetens inom kardiologi visar du både bredd och djup.\n\nAtt ha arbetat på både universitetssjukhus och primärvård visar att du kan navigera olika vårdorganisationer och samarbeta med olika professioner (sjuksköterskor, undersköterskor, fysioterapeuter, dietister). Handledarskap för ST-läkare visar ledarskap och pedagogisk mognad – meriterande för kliniker som söker erfarna specialister eller överläkare.'
      }
    ],

    tips: [
      {
        rubrik: 'Kvantifiera patientmöten, procedurer och handledning',
        text: 'Istället för "arbetar med kardiologipatienter" ska du specificera antal patientmöten, typ av undersökningar och volymer. Detta ger rekryterare konkret bild av din kliniska erfarenhet.\n\n**UNDVIK:** "Erfarenhet av ekokardiografi"\n**BRA:** "Utför 350+ ekokardiografier årligen (TTE och TEE) med fokus på hjärtsvikt, klaffsjukdom och kongenital hjärtsjukdom"\n\nSiffror visar omfattning och ger kontext. Om du handleder ST-läkare, kvantifiera: "Handleder 3-4 ST-läkare årligen med 100% godkända specialiseringsmål". Detta visar pedagogisk förmåga och erfarenhet.'
      },
      {
        rubrik: 'Lista legitimation och specialistbevis med utfärdare och år',
        text: 'Läkarlegitimation och specialistbevis är grundkrav för specialistläkare. Lista alltid utfärdare och årtal för att visa formell kompetens.\n\n**UNDVIK:** "Specialist i internmedicin"\n**BRA:**\n- "Läkarlegitimation, Socialstyrelsen (2014)"\n- "Specialistbevis internmedicin, Socialstyrelsen (2021)"\n- "ACLS – Advanced Cardiovascular Life Support (förnyad 2024)"\n\nÅrtal visar hur länge du arbetat som legitimerad läkare och när du blev specialist. Förnyelsedatum på ACLS/ATLS visar att certifieringarna är aktuella.'
      },
      {
        rubrik: 'Inkludera journalsystem du arbetat i',
        text: 'Sjukhus och vårdcentraler använder olika journalsystem. Att lista vilka du behärskar minskar introduktionstiden och visar IT-kompetens.\n\n**Vanliga journalsystem att namnge:**\n- TakeCare (region Stockholm)\n- Melior (region Skåne, Västra Götaland)\n- Cosmic (många privata vårdgivare)\n- Cambio (vissa regioner)\n\n**UNDVIK:** "Erfarenhet av journalsystem"\n**BRA:** "TakeCare (daglig användning 5+ år), Melior (grundläggande), Cosmic (VFU-erfarenhet)"'
      },
      {
        rubrik: 'Anpassa CV för olika vårdgivare',
        text: 'Universitetssjukhus, länssjukhus, vårdcentraler och privata kliniker söker olika kompetenser. Anpassa vad du lyfter fram beroende på tjänsten.\n\n**För universitetssjukhus:** Betona forskningsmeriter (publicerade artiklar, pågående studier), handledarskap för ST-läkare, avancerade procedurer.\n\n**För primärvård/vårdcentral:** Lyft fram bred internmedicinsk kompetens, erfarenhet av kroniska sjukdomar, patientnära arbete.\n\n**För privata specialistkliniker:** Fokusera på specifik specialistkompetens, diagnostiska färdigheter, effektivt patientflöde.'
      },
      {
        rubrik: 'Visa konkreta resultat från kvalitetsförbättringar',
        text: 'Kvantifierbara förbättringar inom vårdkvalitet, patientsäkerhet eller effektivitet sticker ut. Använd tidsbesparingar, minskade väntetider eller förbättrade utfall.\n\n**UNDVIK:** "Bidrog till förbättrad vårdkvalitet"\n**BRA:** "Minskade väntetid för hjärtsviktsutredningar från 8 till 6 veckor genom implementering av snabbspår och optimerad triagering" eller "Införde strukturerad uppföljningsrutin som minskade återinläggningar med 15%"\n\nOm du saknar exakta siffror, beskriv kvalitetsarbete: "Deltog i vårdprocessförbättring för sepsis" eller "Implementerade checklista för ekokardiografi".'
      }
    ],

    faq: [
      {
        fraga: 'Hur långt ska mitt CV som läkare vara?',
        svar: 'För AT-läkare och nyspecialister räcker ofta 1-2 sidor. För erfarna specialister med 10+ års erfarenhet, forskningsmeriter och handledarskap behövs ofta 2 sidor, ibland 3 för professorer eller överläkare med omfattande publikationslista. Fokusera på de senaste 10-15 åren och lyft fram specialistkompetens, volymer (patientmöten, procedurer) och certifieringar. Akademiska meriter (publikationer, föreläsningar) kan listas separat om de är omfattande.'
      },
      {
        fraga: 'Ska jag skriva ut min läkarlegitimation och specialistbevis?',
        svar: 'Ja, alltid. Lista läkarlegitimation med årtal och utfärdare (Socialstyrelsen). För specialister: inkludera specialistbevis med område och år. Exempel: "Läkarlegitimation (2014)", "Specialistbevis internmedicin (2021)". Om du har delspecialisering, nämn det: "Delspecialisering kardiologi (pågående/slutförd 2023)". Detta är formella behörighetskrav som rekryterare söker efter och visar hur länge du arbetat som legitimerad läkare respektive specialist.'
      },
      {
        fraga: 'Hur visar jag AT/ST-tjänstgöring i mitt CV?',
        svar: 'Lista AT och ST som separata erfarenhetsposter med arbetsplats, period och huvudsakliga rotationer/avdelningar. För AT: nämn vilka basblock du genomfört. För ST: specificera specialitet, klinik och antal år. Exempel: "ST-läkare internmedicin, Karolinska Universitetssjukhuset (2017-2022) – Rotationer: kardiologi, gastroenterologi, endokrinologi, akutmedicin". Nämn även handledarskap, deltagande i konferenser och eventuella forskningsprojekt under ST.'
      },
      {
        fraga: 'Vilka certifieringar är viktigast för läkare?',
        svar: 'Prioritera dessa certifieringar beroende på specialitet: ACLS (Advanced Cardiovascular Life Support) – obligatorisk för internmedicin, akutmedicin, anestesi. ATLS (Advanced Trauma Life Support) – viktigt för akutmedicin, kirurgi. HLR-instruktör om relevant. För specialister: specifika certifieringar som POCUS, endoskopi-certifiering, bronkoskopi-certifiering beroende på område. Ange alltid årtal och förnyelsedatum: "ACLS (förnyad 2024)".'
      },
      {
        fraga: 'Hur kvantifierar jag min kliniska erfarenhet?',
        svar: 'Använd antal patientmöten per år/månad, antal specifika procedurer, antal handledda ST-läkare och förbättringsresultat. Exempel: "1 200+ patientmöten årligen", "350+ ekokardiografier per år", "Handleder 3-4 ST-läkare årligen". Om du förbättrat processer: "Minskade väntetid från 8 till 6 veckor" eller "Reducerade återinläggningar med 15%". Siffror ger kontext och visar både volym och kvalitet.'
      }
    ],

    kategori: 'vard',
    relaterade: [
      { yrke: 'Sjuksköterska', slug: 'sjukskoterska' },
      { yrke: 'Undersköterska', slug: 'underskoterska' },
      { yrke: 'Fysioterapeut', slug: 'fysioterapeut' }
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

  // PRE-RENDER CV HTML på servern för optimal SEO och CLS
  let initialHTML = ''
  try {
    const cvMetadata = convertToCVMetadata(data.exempelCV)
    const templateGenerator = getTemplateGenerator('modern-minimal')

    if (templateGenerator) {
      initialHTML = templateGenerator.generate(cvMetadata, {})
    }
  } catch (error) {
    console.error('Error pre-rendering CV HTML:', error)
    // Fallback: låt client-side hantera rendering
  }

  return <CVExempelPage data={data} initialHTML={initialHTML} />
}
