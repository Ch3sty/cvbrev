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
        text: `Istället för vaga beskrivningar som "ansvarig för barngrupp" eller "arbetade med språkutveckling" visar CV:t konkreta resultat:
- "Pedagogisk ansvarig för barngrupp med 22 barn, ålder 1-3 år"
- "85% av barnen förbättrade fonologisk medvetenhet efter Bornholmsmodellen"
- "80+ utvecklingssamtal med vårdnadshavare årligen"

**Varför detta fungerar**: Rekryterare inom förskola ser hundratals CV:n där förskollärare skriver "ansvarig för barngrupp" utan att specificera antal barn, åldersgrupp eller resultat. Siffror ger omfattning och trovärdighet. Skillnaden mellan "arbetade med språkutveckling" och "85% av barnen förbättrade fonologisk medvetenhet" är enorm. Detta sticker ut i både ATS-screening och mänsklig granskning.`
      },
      {
        rubrik: 'Balans mellan pedagogisk och relationell kompetens',
        text: `CV:t kombinerar pedagogisk kompetens (Lpfö 18, Unikum, Bornholmsmodellen, teckenspråk) med relationskompetens och konflikthantering.

Båda delarna backas upp med exempel från arbetserfarenheten: "Empatisk och lyhörd (skapade trygg miljö för 22 barn med olika behov och kulturell bakgrund)" visar både pedagogisk expertis OCH relationskompetens.

**Varför inte bara buzzwords**: Istället för att lista "empatisk, kommunikativ, flexibel, kreativ" (klassisk buzzword bingo utan substans) visar CV:t dessa egenskaper genom konkreta exempel. Detta är avgörande. Rekryterare läser "flexibel och kommunikativ" i nio av tio förskollärare-CV:n, men konkreta bevis sticker ut. Moderna förskolor kräver både pedagogisk expertis OCH förmåga att samarbeta med barn, vårdnadshavare och kollegor.`
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
          'CAD/CAE: SolidWorks (Expert, 7+ år), AutoCAD (Avancerad), CATIA (Grundläggande), ANSYS (FEM-analys)',
          'Programmering: Python (Avancerad, automation och dataanalys), MATLAB/Simulink (Expert, simulering), C++ (Grundläggande), SQL',
          'Projektverktyg: Jira/Confluence (Agile), MS Project (projektledning), Git/GitHub (versionskontroll), Azure DevOps',
          'Metodik: Lean Six Sigma (DMAIC, FMEA, värdeflödesanalys), Agile/Scrum, Design for Manufacturing (DFM)',
          'Teknisk analys: FEM-analys, hållfasthetsberäkning, modalanalys, CFD (grundläggande)',
          'Dokumentation: Tekniska specifikationer, patentansökningar, användarmanualer, CAD-ritningar'
        ],
        personliga: [
          'Analytisk problemlösning och metodiskt tänkande',
          'Projektledning och deadline-hantering',
          'Tvärfunktionellt samarbete (R&D, produktion, kvalitet, inköp)',
          'Teknisk kommunikation med icke-teknisk personal',
          'Innovation och kreativt tänkande',
          'Kvalitetsmedvetenhet och detalj-fokus'
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
        text: `Istället för vaga beskrivningar som "ansvarig för produktutveckling" visar CV:t konkreta resultat: "Ledde produktutvecklingsprojekt med €2M budget, levererat i tid och 10% under budget", "Effektiviserade CAD-designprocess med 30% genom Python-automatisering", "Reducerade produktionstid 25% genom DFM-optimering".

Detta gör din kompetens mätbar och trovärdigt. Siffror visar också att du levererar affärsnytta, inte bara tekniskt arbete. Rekryterare kan direkt jämföra din prestation mot andra kandidater och se konkret värde.

Ingenjörsroller handlar om problemlösning och resultat. Genom att visa både den tekniska lösningen (Python-automatisering) OCH affärsresultatet (30% effektivisering) demonstrerar du att du förstår både teknik och verksamhet.`
      },
      {
        rubrik: 'Balans mellan tekniska och mjuka färdigheter',
        text: `CV:t kombinerar teknisk kompetens (SolidWorks, FEM-analys, Python, MATLAB) med projektlednings- och samarbetsförmåga (Agile, stakeholder management, tvärfunktionella team). Båda delarna backas upp med exempel från arbetserfarenheten.

"Samordnade tvärfunktionella team (R&D, produktion, kvalitet, inköp) för produktlansering" visar både tekniskt ledarskap OCH samarbetsförmåga. "Teknisk dokumentation för patentansökan och kundspecifikationer" visar kommunikationsförmåga med både teknisk och icke-teknisk publik.

Detta är avgörande eftersom moderna ingenjörsroller kräver mer än teknisk kunskap. Du behöver kunna kommunicera, samarbeta och leda projekt. Genom att visa konkreta exempel på dessa förmågor blir du en mer attraktiv kandidat.`
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
