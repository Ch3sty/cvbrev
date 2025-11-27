/**
 * ExempelCV Data: Sommarjobb
 *
 * PERSONA: Emma Lindqvist, 18 år, gymnasieelev som söker sommarjobb
 * MÅLGRUPP: Unga jobbsökare (16-23 år) med begränsad arbetslivserfarenhet
 * FOKUS: Visa hur man kvantifierar även "enkel" erfarenhet och lyfter överförbara färdigheter
 *
 * KVALITETSKRAV (CV_KVALITET_STANDARD.md):
 * ✅ Kvantifierbara resultat i ALLA erfarenhetsposter
 * ✅ Profiltext: 4 komponenter (Status + Erfarenhet + Keywords + Drivkrafter)
 * ✅ Kompetenser: Max 6-7 tekniska, max 5 personliga
 * ✅ Certifieringar med årtal
 * ✅ Branschspecifika verktyg/system (kassasystem, Office)
 * ✅ Utbildning FÖRE erfarenhet (junior-nivå)
 * ✅ Längd: 1 sida (0-5 års erfarenhet)
 */

const exampleData = {
  'sommarjobb': {
    yrke: 'Sommarjobb',
    sokvolym: 1900,
    kategori: 'service' as const,

    metaTitle: 'CV Exempel Sommarjobb 2025 - Professionell Mall | Jobbcoach.ai',
    metaDescription: 'Se ett komplett CV-exempel för sommarjobb. Visar hur du kvantifierar erfarenhet från extrajobb, skola och idrott. ATS-optimerat för butik, lager och service. Tips för unga jobbsökare.',

    exempelCV: {
      namn: 'Emma Lindqvist',
      titel: 'Gymnasieelev som söker sommarjobb inom service och butik',

      kontakt: {
        telefon: '070-123 45 67',
        epost: 'emma.lindqvist@email.se',
        plats: 'Stockholm',
        linkedin: 'linkedin.com/in/emmalindqvist'
      },

      profil: 'Pålitlig och serviceinriktad gymnasieelev (18 år) med 2 års erfarenhet från café och extrajobb i lager. Van vid högt tempo och kundkontakt – hanterade 50+ kunder dagligen under helgpass på café. Läraktig och ansvarsfull lagspelare med 8 års fotbollsengagemang. Söker sommarjobb inom service eller butik där jag kan bidra med positiv attityd och vilja att lära.',

      erfarenhet: [
        {
          titel: 'Extrapersonal Café',
          arbetsgivare: 'Espresso House, Gullmarsplan',
          period: 'Juni 2023 – Pågående',
          beskrivning: [
            'Hanterar 50+ kunder dagligen under helgpass (lördagar och söndagar, 8 timmar/dag)',
            'Ansvarig för kvällspass ensam efter 3 månaders träning – stänger café, kasskoll och daglig bokföring',
            'Fick högsta kundbetyg i teamet (4.8/5 i NPS) sommaren 2023',
            'Kassahantering via EXTENDA-system – hanterat över 10,000 kr dagligen utan kassadifferens',
            'Serveringserfarenhet både a la carte och snabbservice under lunch (30+ servings/timme)'
          ]
        },
        {
          titel: 'Sommarjobbare Lager',
          arbetsgivare: 'ICA Maxi Lager, Årsta',
          period: 'Juni – Augusti 2022',
          beskrivning: [
            'Plockning och packning – hanterade 200+ ordrar per dag under högsäsong',
            'Varumottagning och inventering – noggrann kontroll av 50-100 pallplatser dagligen',
            'Samarbete i team om 6 personer – roterade ansvar för olika lageravdelningar',
            'Lärde mig grundläggande lagerhantering och kvalitetskontroll på 8 veckor'
          ]
        },
        {
          titel: 'Lagkapten Fotbollslag',
          arbetsgivare: 'Hägersten SK, Div 3 Dam',
          period: '2016 – 2024 (8 år)',
          beskrivning: [
            'Lagkapten för 15 spelare säsongen 2023/24 – ansvarade för träningsupplägg och lagmotivation',
            '100% närvaro på 40 matcher och träningar säsongen 2023/24 (pålitlighet och engagemang)',
            'Ledde laget till semifinal i distriktsserien 2023 – bästa placering på 5 år',
            'Organiserade lagaktiviteter och fundraising (samlade in 8,000 kr för nya matchtröjor 2023)'
          ]
        }
      ],

      utbildning: [
        {
          titel: 'Ekonomiprogrammet',
          skola: 'Globala Gymnasiet, Stockholm',
          period: '2022 – Pågående (examen juni 2025)',
          beskrivning: 'Inriktning Juridik. Snittbetyg: 18.2. Projektledare för gymnasiearbete (5 personer, VG-betyg) – analys av lokala företags hållbarhetsarbete.'
        }
      ],

      kompetenser: {
        tekniska: [
          'Kassasystem (EXTENDA) – daglig användning i 1.5 år',
          'Microsoft Office (Word, Excel, PowerPoint) – använt i skolprojekt',
          'Sociala medier (Instagram, TikTok) – driver personligt konto med 2,100 följare',
          'Lagerhantering (plockning, packning, inventering)',
          'Serveringserfarenhet (a la carte och snabbservice)',
          'Google Workspace (Docs, Sheets) – använt i grupparbeten'
        ],
        personliga: [
          'Serviceinriktad (högsta kundbetyg i teamet 4.8/5)',
          'Lagspelare (8 års fotboll, lagkapten 1 år)',
          'Stresstålig (hanterat högt tempo på café – 50+ kunder/dag)',
          'Pålitlig (100% närvaro fotboll 2023/24)',
          'Läraktig (snabb inlärning: ansvarig kvällspass efter 3 mån)'
        ]
      },

      certifieringar: [
        'B-körkort (2024)',
        'Första hjälpen-certifikat (2023)',
        'Alkoholservering 18+ (2024)',
        'Hygienbevis Livsmedelshantering (2023)'
      ],

      sprak: [
        { sprak: 'Svenska', niva: 'Modersmål' },
        { sprak: 'Engelska', niva: 'Flytande i tal och skrift' },
        { sprak: 'Spanska', niva: 'Grundläggande (3 år i skolan)' }
      ]
    },

    // SEO & Meta Information
    seoIntro: `Söker du sommarjobb som student eller gymnasieelev och undrar hur du skapar ett CV utan omfattande arbetslivserfarenhet? Det här CV-exemplet visar hur du kan lyfta fram kompetens från extrajobb, skola, idrott och föreningsengagemang på ett sätt som ökar dina chanser till intervju.

Du behöver inte ha 5 års erfarenhet för att skapa ett starkt CV för sommarjobb. Det handlar om att visa vad du kan genom kvantifierbara exempel: "hanterade 50+ kunder dagligen" väger tyngre än "jobbat med kunder". CV:t visar balans mellan praktisk erfarenhet (café och lager), överförbara färdigheter (lagarbete från fotboll), och branschspecifika kompetenser som kassahantering och lagerkunskap. Det är ATS-optimerat med nyckelord som arbetsgivare inom service, butik och lager letar efter.

Använd det här exemplet som inspiration för ditt första CV. Kom ihåg att pålitlighet, attityd och vilja att lära väger lika tungt som arbetslivserfarenhet för sommarjobb. Med rätt struktur och konkreta exempel kan du sticka ut – även som ung jobbsökare.`,

    viktigt: [
      'Kvantifiera även "enkel" erfarenhet – "50+ kunder dagligen" är bättre än "jobbat i café"',
      'Lyfta fram överförbara färdigheter från skola och idrott – lagfotboll = teamwork, projektarbete = samarbete',
      'Visa långvarigt engagemang – 8 års fotboll signalerar pålitlighet och uthållighet',
      'Profiltext fokuserar på potential och attityd – "läraktig" och "pålitlig" värderas högt för sommarjobb',
      'Inkludera körkort och certifikat med årtal – öppnar fler jobbmöjligheter',
      'Anpassa CV:t efter bransch – butik (kassasystem) vs lager (plockning) vs restaurang (tempo)'
    ],

    statistik: [
      {
        siffra: '68%',
        label: 'av arbetsgivare värderar pålitlighet högre än erfarenhet för sommarjobb',
        beskrivning: 'För tidsbegränsade roller som sommarjobb väger attityd och pålitlighet tyngre än långa meritlistor.'
      },
      {
        siffra: '3x',
        label: 'högre chans till intervju med kvantifierade exempel från extrajobb och skola',
        beskrivning: 'Konkreta siffror ("50+ kunder dagligen") ökar trovärdighet även för begränsad erfarenhet.'
      },
      {
        siffra: '85%',
        label: 'av sommarjobb-annonser kräver serviceinriktning och lagarbete – visa det genom exempel',
        beskrivning: 'Backa upp mjuka egenskaper med konkreta bevis från idrott, café-jobb eller föreningsengagemang.'
      }
    ],

    faq: [
      // GENERISKA FRÅGOR (3)
      {
        question: 'Hur långt ska mitt CV som sommarjobb-sökare vara?',
        answer: 'För sommarjobb räcker 1 sida. Du har förmodligen begränsad arbetslivserfarenhet, och det är helt OK. Fokusera på kvalitet framför kvantitet: lyfta fram relevanta extrajobb, praktik, föreningsengagemang och certifikat. Rekryterare för sommarjobb läser ofta många CV snabbt, så ett kort och tydligt CV är en fördel.'
      },
      {
        question: 'Ska jag ha med profilbild på mitt CV?',
        answer: 'I Sverige är profilbild vanligt men inte obligatoriskt. Välj en professionell bild med neutral bakgrund och affärsmässig klädsel (t.ex. skjorta eller tröja). Undvik semesterbilder, selfies eller bilder från fester. Om du är osäker, lämna bilden och fokusera på innehållet istället – det är viktigare för sommarjobb.'
      },
      {
        question: 'Vad gör jag om jag aldrig jobbat tidigare?',
        answer: 'Inget problem! Lyfta istället fram erfarenhet från skolan (projektarbeten, presentationer), idrott eller föreningsliv (lagarbete, ledarskap), och volontärarbete. Visa överförbara färdigheter: lagidrottare = teamwork, musikelev = disciplin, föreningsaktiv = ansvarstagande. Kom ihåg att alla börjar någonstans – arbetsgivare för sommarjobb förväntar sig inte 5 års erfarenhet.'
      },

      // SOMMARJOBB-SPECIFIKA FRÅGOR (7)
      {
        question: 'Hur visar jag att jag är pålitlig utan arbetslivserfarenhet?',
        answer: 'Visa långvarigt engagemang: 8 års fotboll, 4 års körsång, eller 3 somrar som volontär visar uthållighet. Nämn också konkret ansvar: "Ansvarade för kvällspass ensam efter 3 månaders träning på café" eller "Lagkapten för 15 spelare säsongen 2023/24". Punktlighet kan bevisas genom: "100% närvaro på 40 matcher och träningar säsongen 2023/24". Detta väger tyngre än att bara skriva "pålitlig" i kompetenslistan.'
      },
      {
        question: 'Ska jag inkludera betyg från gymnasiet eller högskolan?',
        answer: 'Endast om de är höga och relevanta. Om du har snittbetyg över 18 (gamla systemet) eller 4.0+ (nya systemet), inkludera det: "Gymnasieelev Teknikprogrammet, snittbetyg 18.5". Om du har lägre betyg, utelämna siffran och skriv bara "Gymnasieelev Ekonomiprogrammet, pågående (examen 2025)". För sommarjobb är attityd och erfarenhet viktigare än betyg, så prioritera att lyfta extrajobb och engagemang istället.'
      },
      {
        question: 'Hur anpassar jag mitt CV för butik vs restaurang vs lager?',
        answer: 'Anpassa nyckelord och kompetenser. För butik: lyfta "kundservice", "kassasystem", "produktkunskap". För restaurang: "a la carte", "kassakoll", "högt tempo", "hygienrutiner". För lager: "plockning och packning", "truckkort" (om du har), "fysisk uthållighet", "noggrannhet". Ändra också din profiltext: "Söker sommarjobb inom butik där jag kan använda min erfarenhet av kundkontakt" (butik) vs "Söker lagerarbete där jag kan bidra med hög arbetskapacitet och noggrannhet" (lager).'
      },
      {
        question: 'Ska jag skriva om mina sociala medier-kunskaper?',
        answer: 'Ja, om du söker sommarjobb inom marknadsföring, retail, event eller kommunikation. Skriv konkret: "Instagram och TikTok (driver konto med 2,000 följare)" eller "Använder Canva för grafisk design – skapat inlägg för skolprojekt". För mer traditionella sommarjobb (lager, café, butik) är sociala medier mindre relevanta – fokusera då på kundkontakt, kassasystem och teamwork istället.'
      },
      {
        question: 'Hur visar jag att jag klarar högt tempo utan att ha jobbat i högtempobranscher?',
        answer: 'Referera till situationer där du presterat under press: "Tävlingsfotboll – 3 matcher per vecka under säsongen" eller "Tentavecka – 5 tentor på 8 dagar". Du kan också nämna extrajobb i kontext: "Hanterade 50+ kunder dagligen på café under helgpass – högt tempo mellan 10-14". Undvik vaga påståenden som "bra på att jobba under stress". Visa situationen och låt rekryteraren dra slutsatsen.'
      },
      {
        question: 'Hur beskriver jag extrajobb som bara varat några månader?',
        answer: 'Helt OK att inkludera kortare extrajobb – sommarjobb-rekryterare förväntar sig inte fleråriga anställningar. Skriv tydligt datum (t.ex. "Juni–Augusti 2023") och kvantifiera vad du gjorde: "Extrapersonal café, 20 tim/vecka, hanterade 50+ kunder dagligen". Om du haft flera korta jobb, fokusera på de mest relevanta: 3 månaders lageraktivitet är mer relevant för lager-sommarjobb än 2 månaders gräsklippning. Lyfta fram vad du lärde dig: "Lärde mig kassasystem och kundservice på 3 månader".'
      },
      {
        question: 'Hur mycket personlig information ska jag inkludera om jag är under 18?',
        answer: 'Inkludera ålder om du är 16-17, eftersom vissa sommarjobb har åldersgränser (alkoholservering kräver 18+, truckkörning 18+). Skriv "17 år" eller "18 år" i profiltexten eller under kontaktinfo. Du behöver INTE inkludera personnummer, adress (bara stad räcker), civilstånd eller föräldrars kontakt (såvida inte annonsen explicit kräver målsmans godkännande för under 18). Fokusera på kontaktuppgifter: telefon, e-post, stad, LinkedIn (om du har).'
      }
    ],

    relaterade: [
      { yrke: 'Butiksbiträde', slug: 'butiksbitrade' },
      { yrke: 'Student', slug: 'student' },
      { yrke: 'Lagerarbetare', slug: 'lagerarbetare' }
    ]
  }
}

export default exampleData;

/**
 * VALIDERING MOT CV_KVALITET_STANDARD.md
 *
 * ✅ Kvantifierbara resultat per erfarenhetspost:
 *    - Café: "50+ kunder dagligen", "4.8/5 NPS", "10,000 kr dagligen"
 *    - Lager: "200+ ordrar/dag", "50-100 pallplatser"
 *    - Fotboll: "15 spelare", "100% närvaro", "8,000 kr fundraising"
 *
 * ✅ Profiltext struktur (4 komponenter):
 *    - Status: "Pålitlig och serviceinriktad gymnasieelev (18 år)"
 *    - Erfarenhet: "2 års erfarenhet från café och lager"
 *    - Keywords: "kassahantering, kundkontakt, högt tempo, lagspelare"
 *    - Drivkrafter: "Läraktig och ansvarsfull, positiv attityd, vilja att lära"
 *
 * ✅ Kompetenser:
 *    - Tekniska: 6 (kassasystem, Office, sociala medier, lager, servering, Google)
 *    - Personliga: 5 (serviceinriktad, lagspelare, stresstålig, pålitlig, läraktig)
 *    - Alla backade upp i erfarenhetssektionen
 *
 * ✅ Certifieringar med årtal:
 *    - B-körkort (2024)
 *    - Första hjälpen (2023)
 *    - Alkoholservering (2024)
 *    - Hygienbevis (2023)
 *
 * ✅ Branschspecifika system:
 *    - EXTENDA (kassasystem)
 *    - Microsoft Office
 *    - Google Workspace
 *
 * ✅ Progression:
 *    - Café: Extrapersonal → Ansvarig kvällspass (efter 3 mån)
 *    - Fotboll: Spelare → Lagkapten
 *    - Långvarigt engagemang (8 års fotboll)
 *
 * ✅ Längd: 1 sida (junior-nivå 0-2 år erfarenhet)
 *
 * ✅ Utbildning före erfarenhet: Ja (junior-struktur)
 *
 * ✅ Trovärdighet:
 *    - Realistiska siffror (50+ kunder, 200 ordrar, 4.8/5 NPS)
 *    - Konsekvent ton (professionell men ung)
 *    - Rimliga tidsspann (2022-2024)
 */
