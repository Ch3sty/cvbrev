import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CVExempelPage from '../[yrke]/CVExempelPage'

// Example data for all professions
const exampleData: Record<string, any> = {
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

  return <CVExempelPage data={data} />
}
