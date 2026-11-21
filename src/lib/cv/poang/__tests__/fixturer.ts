/**
 * Fixtur-CV för poängmodellen: tunt, normalt, starkt, studentens, långt
 * yrkesliv och ett CV utan struktur (bara text, reservinläsningens form).
 * Starkt, kort och långt är Word-testernas exempel (Erik Lindberg är
 * artiklarnas exempelperson). Inga användares CV.
 *
 * Varje fixtur har också ett påhittat AI-svar i analysens format, med de
 * påhittade talen kvar (atsImpact, atsFriendliness.score), så att testerna
 * visar att de aldrig används.
 */
import type { CVMetadata } from '@/lib/cv/cv-metadata'
import { KORT_CV, NORMALT_CV, LANGT_CV } from '@/lib/cv/word/__tests__/fixtures'

export interface Fixtur {
  namn: string
  structured_data: unknown
  cv_text: string
  /** Analysresultatet som analysjobbet sparar det (AI:ns tal inräknade). */
  analys: Record<string, unknown>
}

/** Tunt: inläsningens roles-format, en roll utan beskrivning, tre kompetenser. */
const TUNT_TEXT = `Johan Berg
johan.berg@exempel.se

Erfarenhet
Lagerarbetare, PostNord, 2020

Kompetenser
Truckkort, Plock, Packning`

const TUNT: Fixtur = {
  namn: 'tunt',
  cv_text: TUNT_TEXT,
  structured_data: {
    name: 'Johan Berg',
    roles: [
      {
        title: 'Lagerarbetare',
        company: 'PostNord',
        period: '2020',
        description: '',
        responsibilities: [],
        originalText: 'Lagerarbetare, PostNord, 2020',
      },
    ],
    education: [],
    skills: ['Truckkort', 'Plock', 'Packning'],
  },
  analys: {
    analysisType: 'full',
    atsFriendliness: { score: 55, feedback: 'Ditt CV har en ATS-poäng på 55/100' },
    profileSummary: null,
    roleBasedImprovements: [
      {
        roleTitle: 'Lagerarbetare',
        company: 'PostNord',
        period: '2020 - Nuvarande',
        suggestedText:
          'Plockade och packade 150 order per dag i ett lager med 40 medarbetare\nKörde motviktstruck och skjutstativtruck vid in- och utleveranser\nRäknade lager och rapporterade avvikelser i WMS',
        atsImpact: 4,
      },
    ],
    skillSuggestions: [
      { skill: 'Lagerhantering', relevance: 'high', source: 'Lagerarbetare på PostNord', reasoning: 'Vanlig term.', atsImpact: 5 },
      { skill: 'Truckkort', relevance: 'high', source: 'Lagerarbetare på PostNord', reasoning: 'Finns redan.', atsImpact: 4 },
      { skill: 'WMS', relevance: 'medium', source: 'Lagerarbetare på PostNord', reasoning: 'Lagersystem.', atsImpact: 3 },
    ],
    generalImprovements: [{ title: 'Lägg till en profil', description: 'Skriv några rader om dig.', category: 'Struktur', atsImpact: 5 }],
  },
}

/** Normalt: ett vanligt CV med brister som är lätta att åtgärda. */
const NORMALT_STRUKTUR: CVMetadata = {
  personalInfo: { fullName: 'Sara Lind', email: 'sara.lind@exempel.se', phone: '070-555 12 34', address: 'Uppsala' },
  summary: 'Jag är en glad och positiv person som gillar att jobba med människor och tycker om att lära mig nya saker varje dag.',
  experience: [
    {
      position: 'Kundtjänstmedarbetare',
      company: 'Telia',
      startDate: 'mars 2021',
      description: [
        'Svarade på frågor från kunder via telefon och chatt om abonnemang och fakturor. Hjälpte kunder att felsöka bredband och tv. Arbetade i ett team.',
      ],
    },
    {
      position: 'Butikssäljare',
      company: 'Lindex',
      startDate: '2018',
      endDate: '2021',
      description: ['Försäljning och kassa', 'Ansvar för skyltning'],
    },
    {
      position: 'Servitör',
      company: 'Restaurang Fyris',
      startDate: '2016',
      endDate: '2018',
      description: [],
    },
  ],
  education: [{ degree: 'Samhällsvetenskapsprogrammet', institution: 'Katedralskolan', graduationYear: '2016' }],
  skills: [
    {
      category: 'Kompetenser',
      skills: ['Kundservice', 'Försäljning', 'Office', 'Har lätt för att samarbeta med andra människor i olika situationer'],
    },
  ],
  languages: [
    { language: 'Svenska', proficiency: '' },
    { language: 'Engelska', proficiency: '' },
  ],
}

const NORMALT: Fixtur = {
  namn: 'normalt',
  cv_text: 'Sara Lind\nsara.lind@exempel.se\n070-555 12 34\nUppsala',
  structured_data: NORMALT_STRUKTUR,
  analys: {
    analysisType: 'full',
    atsFriendliness: { score: 62 },
    profileSummary: {
      currentText: NORMALT_STRUKTUR.summary,
      improvedText:
        'Jag är kundtjänstmedarbetare med fem års erfarenhet av kundservice och försäljning, i dag på Telia där jag hjälper omkring 60 kunder per dag via telefon och chatt. Jag löser problemet direkt när det går och följer upp när det inte gör det. Jag söker nu en roll som teamledare inom kundservice.',
      changes: ['Konkret', 'Roll'],
      atsImpact: 10,
    },
    roleBasedImprovements: [
      {
        roleTitle: 'Kundtjänstmedarbetare',
        company: 'Telia',
        suggestedText:
          'Besvarar omkring 60 kundärenden per dag via telefon och chatt om abonnemang och fakturor\nFelsöker bredband och tv tillsammans med kunden och löser 8 av 10 ärenden vid första kontakten\nHandleder nya kollegor under deras första veckor i teamet',
        atsImpact: 5,
      },
      {
        roleTitle: 'Butikssäljare',
        company: 'Lindex',
        suggestedText:
          'Sålde och gav råd till kunder i en butik med 12 anställda\nAnsvarade för skyltning och varuexponering inför kampanjer\nHanterade kassa och dagsavstämning',
        atsImpact: 4,
      },
      {
        roleTitle: 'Servitör',
        company: 'Restaurang Fyris',
        suggestedText: 'Serverade gäster i en restaurang med 80 platser\nTog emot beställningar och hanterade betalningar',
        atsImpact: 3,
      },
    ],
    skillSuggestions: [
      { skill: 'Kundtjänst', relevance: 'high', source: 'Telia', reasoning: 'Sökord.', atsImpact: 5 },
      { skill: 'Felsökning', relevance: 'medium', source: 'Telia', reasoning: 'Sökord.', atsImpact: 3 },
      { skill: 'Kassahantering', relevance: 'medium', source: 'Lindex', reasoning: 'Sökord.', atsImpact: 2 },
      { skill: 'Visual merchandising', relevance: 'low', source: 'Lindex', reasoning: 'Sökord.', atsImpact: 2 },
    ],
    generalImprovements: [
      { title: 'Ange språknivå', description: 'Skriv nivån på dina språk.', category: 'Innehåll', atsImpact: 3 },
      { title: 'Enhetliga datum', description: 'Skriv alla datum på samma sätt.', category: 'Formatering', atsImpact: 2 },
    ],
  },
}

/** Starkt: Erik Lindberg, artiklarnas exempelperson. */
const STARKT: Fixtur = {
  namn: 'starkt',
  cv_text: '',
  structured_data: NORMALT_CV,
  analys: {
    analysisType: 'full',
    atsFriendliness: { score: 71 },
    profileSummary: {
      currentText: NORMALT_CV.summary,
      improvedText: NORMALT_CV.summary,
      changes: [],
      atsImpact: 10,
    },
    roleBasedImprovements: [
      {
        roleTitle: 'Senior Projektledare',
        company: 'Nordea Bank',
        suggestedText: (NORMALT_CV.experience[0].description ?? []).join('\n'),
        atsImpact: 3,
      },
    ],
    skillSuggestions: [{ skill: 'Scrum', relevance: 'high', source: 'Nordea', reasoning: 'Finns redan.', atsImpact: 2 }],
    generalImprovements: [],
  },
}

/** Studentens: pågående utbildning, extrajobb, få kompetenser. */
const STUDENT_STRUKTUR: CVMetadata = {
  personalInfo: { fullName: 'Amir Haddad', email: 'amir.haddad@student.lu.se', phone: '073-111 22 33', location: 'Lund' },
  summary: 'Student på ekonomprogrammet som söker sommarjobb inom ekonomi eller administration.',
  experience: [
    {
      position: 'Extrapersonal',
      company: 'ICA Kvantum Lund',
      startDate: '2023',
      description: ['Kassa och påfyllning av varor på helger'],
    },
    {
      position: 'Sommarjobb',
      company: 'Lunds kommun',
      startDate: '2022',
      endDate: '2022',
      description: ['Arbetade i parkförvaltningen med skötsel av grönytor'],
    },
  ],
  education: [
    { degree: 'Ekonomie kandidat', institution: 'Lunds universitet', startDate: '2022' },
    { degree: 'Ekonomiprogrammet', institution: 'Polhemskolan', startDate: '2019', endDate: '2022' },
  ],
  skills: [{ category: 'Kompetenser', skills: ['Excel', 'Kundservice'] }],
  languages: [
    { language: 'Svenska', proficiency: 'Flytande' },
    { language: 'Arabiska', proficiency: 'Modersmål' },
    { language: 'Engelska', proficiency: 'Flytande' },
  ],
}

const STUDENT: Fixtur = {
  namn: 'student',
  cv_text: '',
  structured_data: STUDENT_STRUKTUR,
  analys: {
    analysisType: 'full',
    atsFriendliness: { score: 48 },
    profileSummary: {
      currentText: STUDENT_STRUKTUR.summary,
      improvedText:
        'Jag läser andra året på ekonomprogrammet vid Lunds universitet och söker ett sommarjobb inom ekonomi eller administration. Vid sidan av studierna arbetar jag extra på ICA Kvantum, där jag sköter kassan och möter hundratals kunder varje helg. Jag är noggrann med siffror, lär mig nya system snabbt och trivs när det är mycket att göra.',
      changes: [],
      atsImpact: 8,
    },
    roleBasedImprovements: [
      {
        roleTitle: 'Extrapersonal',
        company: 'ICA Kvantum Lund',
        suggestedText:
          'Hanterar kassan och dagsavstämning under helger med upp till 400 kunder per pass\nFyller på varor och håller ordning i frukt- och gröntavdelningen',
        atsImpact: 4,
      },
      {
        roleTitle: 'Sommarjobb',
        company: 'Lunds kommun',
        suggestedText: 'Skötte gräsytor och planteringar i tre stadsparker\nArbetade i ett lag om 6 personer med egen ruttplanering',
        atsImpact: 4,
      },
    ],
    skillSuggestions: [
      { skill: 'Kassahantering', relevance: 'high', source: 'ICA', reasoning: 'Sökord.', atsImpact: 3 },
      { skill: 'Bokföring', relevance: 'medium', source: 'Utbildning', reasoning: 'Sökord.', atsImpact: 3 },
      { skill: 'Fortnox', relevance: 'medium', source: 'Utbildning', reasoning: 'Sökord.', atsImpact: 2 },
      { skill: 'Visma', relevance: 'low', source: 'Utbildning', reasoning: 'Sökord.', atsImpact: 2 },
    ],
    generalImprovements: [],
  },
}

/** Långt yrkesliv: Märta Söderström-Ångström, sex roller och långa punkter. */
const LANGT: Fixtur = {
  namn: 'langt',
  cv_text: '',
  structured_data: LANGT_CV,
  analys: {
    analysisType: 'full',
    atsFriendliness: { score: 80 },
    profileSummary: {
      currentText: LANGT_CV.summary,
      improvedText:
        'Jag är ekonomichef med 18 års erfarenhet från industri, handel och offentlig sektor. Jag har byggt upp ekonomifunktioner, lett byten av affärssystem och kortat bokslutet från tolv till fem arbetsdagar. Jag rapporterar till styrelse och ägare och gör siffrorna till beslut som verksamheten kan agera på.',
      changes: [],
      atsImpact: 6,
    },
    roleBasedImprovements: [
      {
        roleTitle: 'Ekonomichef',
        company: 'Nordström Industri AB',
        suggestedText:
          'Ansvarar för ekonomi, redovisning och controlling i en koncern med sju bolag och 450 anställda\nLedde bytet från Visma till Dynamics 365 Business Central i alla sju bolag\nKortade månadsbokslutet från tolv till fem arbetsdagar\nLeder ett team på nio personer inom redovisning, lön och controlling\nInförde rullande prognoser i stället för årlig budget',
        atsImpact: 5,
      },
      {
        roleTitle: 'Controller',
        company: 'Åhléns AB',
        suggestedText:
          'Följde upp resultatet för 60 varuhus och e-handeln\nByggde en rapportmodell i Power BI för butiks- och regionchefer\nSänkte lagerkostnaderna genom bättre prognoser',
        atsImpact: 4,
      },
      {
        roleTitle: 'Kassör och butiksbiträde',
        company: 'ICA Maxi Älvsjö',
        suggestedText: 'Skötte kassaavstämning och dagsredovisning\nBeställde varor till mejeriavdelningen',
        atsImpact: 1,
      },
    ],
    skillSuggestions: [{ skill: 'Excel', relevance: 'low', source: 'Nordström', reasoning: 'Sökord.', atsImpact: 1 }],
    generalImprovements: [{ title: 'Korta punkterna', description: 'Flera punkter är långa.', category: 'Formatering', atsImpact: 3 }],
  },
}

/** Utan struktur: reservinläsningen när AI-inläsningen fallit, bara text. */
const UTAN_TEXT = `Lina Ek
lina.ek@exempel.se
0702223344

Jag har jobbat inom vården i många år och är en ansvarsfull person.
Undersköterska på Akademiska sjukhuset sedan 2015, innan dess vårdbiträde.
Körkort B.`

const UTAN_STRUKTUR: Fixtur = {
  namn: 'utan-struktur',
  cv_text: UTAN_TEXT,
  structured_data: {
    roles: [
      {
        title: 'Yrkesroll',
        company: 'Arbetsgivare',
        period: 'Period ej angiven',
        description: UTAN_TEXT.substring(0, 500),
        responsibilities: [],
        originalText: UTAN_TEXT.substring(0, 500),
      },
    ],
    education: [],
    skills: [],
    profile: undefined,
  },
  analys: {
    analysisType: 'full',
    atsFriendliness: { score: 40 },
    profileSummary: null,
    roleBasedImprovements: [
      { roleTitle: 'Undersköterska', company: 'Akademiska sjukhuset', suggestedText: 'Vårdade patienter', atsImpact: 5 },
    ],
    skillSuggestions: [{ skill: 'Omvårdnad', relevance: 'high', source: 'Undersköterska', reasoning: 'Sökord.', atsImpact: 4 }],
    generalImprovements: [{ title: 'Dela upp CV:t i avsnitt', description: 'Rubriker för erfarenhet och utbildning.', category: 'Struktur', atsImpact: 5 }],
  },
}

/** Kort: Åsa Öberg ur Word-testerna, välskrivet men kort. */
const KORT: Fixtur = {
  namn: 'kort',
  cv_text: '',
  structured_data: KORT_CV,
  analys: {
    analysisType: 'full',
    atsFriendliness: { score: 66 },
    profileSummary: null,
    roleBasedImprovements: [
      {
        roleTitle: 'Vårdbiträde',
        company: 'Äldreboendet Solgården',
        suggestedText:
          'Stöttade 8 boende med demenssjukdom i vardagen\nDeltog i införandet av en ny läkemedelsrutin på avdelningen',
        atsImpact: 3,
      },
    ],
    skillSuggestions: [],
    generalImprovements: [],
  },
}

export const FIXTURER: Fixtur[] = [TUNT, NORMALT, STARKT, STUDENT, LANGT, UTAN_STRUKTUR, KORT]
