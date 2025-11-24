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
    seoIntro: 'Söker du jobb som undersköterska och behöver ett CV som sticker ut? Det här exemplet visar hur du strukturerar ett ATS-optimerat CV som passar svenska vårdmiljöer.\n\nDu får se exakt hur du balanserar teknisk kompetens (ADL-stöd, medicindelegering, dokumentationssystem) med de mjuka färdigheter som rekryterare söker (empati, kommunikation, samarbete). CV:t visar konkreta resultat från geriatrisk vård och hemtjänst med kvantifierbara exempel.\n\nAnvänd det som inspiration för ditt eget CV undersköterska och anpassa det efter den tjänst du söker. Läs också våra tips om hur du optimerar ditt personliga brev undersköterska för att öka dina chanser till intervju.',

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
        text: 'CV:t innehåller kritiska sökord som ATS-system letar efter: ADL-stöd, personcentrerad vård, demensvård, palliativ omvårdnad, medicinsk delegering, tvärprofessionellt team, Cosmic/Procapita. Rubriker som "Erfarenhet", "Kompetenser" och "Certifieringar" är standardiserade och läsbara för både ATS och rekryterare.'
      },
      {
        rubrik: 'Kvantifierbara resultat istället för ansvarsområden',
        text: 'Istället för vaga beskrivningar som "ansvarig för patientvård" visar CV:t konkreta resultat: "minskade akuta inläggningar med 15%", "reducerade fall med 20%", "25-30 patienter dagligen". Detta gör din kompetens mätbar och trovärdigt.'
      },
      {
        rubrik: 'Balans mellan tekniska och mjuka färdigheter',
        text: 'CV:t kombinerar teknisk kompetens (medicinsk delegering, förflyttningsteknik, dokumentationssystem) med empatiska egenskaper (relationsskapande, lyhördhet). Båda delarna backas upp med exempel från arbetserfarenheten, vilket visar att du både kan utföra arbetsuppgifter OCH skapa trygghet.'
      },
      {
        rubrik: 'Certifieringar som trovärdighetsmarkör',
        text: 'Dedikerad sektion för certifieringar visar kontinuerlig kompetensutveckling: Akta Ryggen, basala hygienrutiner, nutritionsbedömning, HLR. Detta signalerar professionalism och lärvilja – två egenskaper som vårdgivare högt värderar.'
      },
      {
        rubrik: 'Profiltext som säljande sammanfattning',
        text: 'Den inledande profiltexten sammanfattar din erfarenhet, specialisering och unika styrkor på 3-4 meningar. Detta gör att rekryteraren direkt ser om du matchar tjänsten – även om de bara läser de första raderna. Inkluderar både tekniska nyckelord och personliga egenskaper.'
      },
      {
        rubrik: 'Tydlig progression och ansvar',
        text: 'Från hemtjänst (självständigt arbete) till äldreboende (teamarbete och mentorskap) visar CV:t en naturlig karriärprogression. Att nämna mentorskap för 6 nya undersköterskor visar att du vuxit in i en seniorroll och kan ta ansvar.'
      }
    ],

    tips: [
      {
        rubrik: 'Inkludera rätt nyckelord för din vårdspecialisering',
        text: 'ATS-system söker efter specifika termer beroende på vårdmiljö. För geriatrik: demensvård, BPSD, palliativ omvårdnad, kroniska sjukdomar. För akutvård: triage, vitalparametrar, akuta tillstånd, snabba beslut. För hemtjänst: ADL-stöd, självständigt arbete, hembesök, social omsorg.\n\nLäs jobbannonsen noga och matcha dina nyckelord mot deras krav. Om de söker "erfarenhet av palliativ vård" använd exakt den formuleringen i ditt CV, inte "erfarenhet av vård i livets slutskede".'
      },
      {
        rubrik: 'Kvantifiera din erfarenhet för ökad trovärdighet',
        text: 'Konkreta siffror gör ditt CV mer trovärdigt. Istället för "ansvarig för patientvård" skriv "omvårdnad av 25-30 patienter dagligen". Nämn antal års erfarenhet, antal VFU-perioder, antal patienter med medicinsk delegering, eller specifika förbättringar du bidragit till.\n\nOm du jobbat deltid, räkna om till heltidsekvivalent: "3 år, motsvarande 5 års heltid". Var också specifik med schema-flexibilitet: "jour, natt, helger" om du kan det.'
      },
      {
        rubrik: 'Visa konkreta resultat från din omvårdnad',
        text: 'Istället för att lista arbetsuppgifter, visa resultat. Exempel: "Uppmärksammade tidiga sjukdomstecken (UVI, dehydrering) vilket minskade akuta inläggningar med 15%", "Implementerade fallpreventionsåtgärder som reducerade antalet fall med 20%".\n\nOm du inte har exakta siffror, beskriv situationer: "Identifierade tecken på urinvägsinfektion hos patient med demens, kontaktade läkare och påbörjade behandling innan tillståndet förvärrades". Detta visar initiativförmåga och klinisk blick.'
      },
      {
        rubrik: 'Anpassa profiltext efter jobbannonsen',
        text: 'Din profiltext (den inledande sammanfattningen) bör vara skräddarsydd för varje jobb. Om jobbannonsen söker "undersköterska till demensboende", skriv "Erfaren undersköterska med specialisering i demensvård och BPSD-hantering".\n\nInkludera alltid: antal års erfarenhet, specialisering/vårdmiljö, tekniska nyckelkompetenser (medicindelegering, dokumentationssystem), och 1-2 personliga egenskaper (empati, stresstålig). Håll den till max 4 meningar.'
      },
      {
        rubrik: 'Lyft fram certifieringar och kompetensutveckling',
        text: 'Skapa en dedikerad sektion för certifieringar och utbildningar. Detta visar att du är uppdaterad och tar ditt yrke på allvar. Viktiga certifieringar för undersköterskor: Medicinsk delegering (specificera vilka), Akta Ryggen, Basala hygienrutiner, HLR, Nutritionsbedömning.\n\nGlöm inte att inkludera förnyelsedatum för HLR och andra tidsbegränsade certifieringar. Om du genomgått intern utbildning på arbetsplatsen (t.ex. "Palliativ vård nivå 1"), ta med även det.'
      },
      {
        rubrik: 'Balansera tekniska och mjuka färdigheter med bevis',
        text: 'Lista både tekniska färdigheter (medicindelegering, förflyttningsteknik, såromläggning) och personliga egenskaper (empati, kommunikation, stresstålig). Men backa alltid upp de personliga egenskaperna med exempel i erfarenhetssektionen.\n\nIstället för att bara lista "empatisk" i kompetenssektionen, visa det genom att skriva "Byggde förtroendefulla relationer med brukare och anhöriga genom lyhördhet och respektfull kommunikation" i din arbetsbeskrivning.'
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
