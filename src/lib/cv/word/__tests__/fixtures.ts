/**
 * Tre CV-längder för Word-mallarnas tester och renderingsgranskning:
 * kort (en sida), normalt (två sidor, Erik Lindberg ur artiklarnas exempel)
 * och långt (tre sidor, många tjänster och långa punkter). Alla har å, ä och
 * ö i varje sektion, så att läsningen tillbaka kan kontrollera tecknen.
 */
import type { CVMetadata } from '@/lib/cv/cv-metadata'

export const KORT_CV: CVMetadata = {
  personalInfo: {
    fullName: 'Åsa Öberg',
    title: 'Undersköterska',
    email: 'asa.oberg@exempel.se',
    phone: '070-123 45 67',
    address: 'Västerås',
  },
  summary:
    'Undersköterska med fyra års erfarenhet från äldreomsorg och hemtjänst. Lugn i pressade lägen, noggrann med dokumentation och bra på att skapa trygghet för både brukare och anhöriga.',
  experience: [
    {
      position: 'Undersköterska',
      company: 'Västerås stad, hemtjänst Öster',
      startDate: '2022',
      description: [
        'Ansvarar för omvårdnad och läkemedelsöverlämning hos 12 brukare',
        'Dokumenterar i Lifecare och följer upp genomförandeplaner',
        'Handleder nyanställda och sommarvikarier',
      ],
    },
    {
      position: 'Vårdbiträde',
      company: 'Äldreboendet Solgården',
      startDate: '2020',
      endDate: '2022',
      description: ['Stöd i vardagen för boende med demenssjukdom', 'Deltog i införandet av ny läkemedelsrutin'],
    },
  ],
  education: [
    { degree: 'Vård- och omsorgsprogrammet', institution: 'Komvux Västerås', startDate: '2018', endDate: '2020' },
  ],
  skills: [
    { category: 'Vård', skills: ['Omvårdnad', 'Läkemedelsdelegering', 'Demensvård', 'Palliativ vård'] },
    { category: 'System', skills: ['Lifecare', 'Treserva'] },
  ],
  certifications: [{ name: 'B-körkort', issuer: 'Transportstyrelsen' }],
  languages: [
    { language: 'Svenska', proficiency: 'Modersmål' },
    { language: 'Engelska', proficiency: 'Flytande' },
  ],
}

export const NORMALT_CV: CVMetadata = {
  personalInfo: {
    fullName: 'Erik Lindberg',
    title: 'Projektledare inom IT',
    email: 'erik.lindberg@email.se',
    phone: '073-456 78 90',
    address: 'Stockholm',
    linkedin: 'linkedin.com/in/eriklindberg',
  },
  summary:
    'Erfaren projektledare med 6+ års erfarenhet av att leda digitala transformationsprojekt inom bank och fintech. Certifierad i både agila metoder (Scrum, SAFe) och traditionell projektledning (PMP). Levererat 15+ projekt med en genomsnittlig budget på 8 MSEK. Stark kommunikatör som bygger högpresterande team och håller intressenterna samlade.',
  experience: [
    {
      position: 'Senior Projektledare',
      company: 'Nordea Bank',
      startDate: '2021',
      description: [
        'Leder ett tvärfunktionellt team på 12 personer i införandet av en ny mobilbanksplattform',
        'Ansvarig för budget på 15 MSEK och rapportering till styrgrupp med IT-direktör',
        'Införde agilt arbetssätt som ökade leveranstakten med 35 %',
        'Samordnar externa leverantörer och säkerställer efterlevnad av finansiella regelverk',
      ],
    },
    {
      position: 'Projektledare',
      company: 'Klarna',
      startDate: '2018',
      endDate: '2021',
      description: [
        'Ledde 8 produktutvecklingsprojekt inom checkout och betalningslösningar',
        'Införde Scrum och kortade tiden till lansering med 40 %',
        'Handledde 3 juniora projektledare och byggde upp ett projektledarprogram',
        'Samordnade releaseplaneringen för 5 utvecklingsteam (50+ utvecklare)',
      ],
    },
    {
      position: 'Biträdande projektledare',
      company: 'Tieto Sverige',
      startDate: '2016',
      endDate: '2018',
      description: [
        'Planerade och följde upp leveranser i ett byte av ärendehanteringssystem för en kommun',
        'Höll i användartester och utbildade 40 handläggare i det nya systemet',
      ],
    },
  ],
  education: [
    {
      degree: 'Civilingenjör Industriell Ekonomi',
      institution: 'Kungliga Tekniska Högskolan',
      startDate: '2011',
      endDate: '2016',
      description: 'Inriktning mot projektledning och verksamhetsstyrning',
    },
  ],
  skills: [
    {
      category: 'Metodik och verktyg',
      skills: ['Scrum', 'Kanban', 'SAFe', 'Vattenfall', 'Jira', 'Confluence', 'MS Project', 'Budget- och resursplanering', 'Riskhantering och kvalitetssäkring'],
    },
    {
      category: 'Personliga',
      skills: ['Ledarskap och teamutveckling', 'Kommunikation och presentation', 'Förhandling och konflikthantering', 'Strategiskt tänkande'],
    },
  ],
  certifications: [
    { name: 'PMP, Project Management Professional', issuer: 'PMI', issueDate: '2022' },
    { name: 'SAFe 5.0 Agilist', issuer: 'Scaled Agile', issueDate: '2021' },
    { name: 'Professional Scrum Master I', issuer: 'Scrum.org', issueDate: '2019' },
    { name: 'PRINCE2 Foundation', issuer: 'Axelos', issueDate: '2018' },
  ],
  languages: [
    { language: 'Svenska', proficiency: 'Modersmål' },
    { language: 'Engelska', proficiency: 'Flytande' },
  ],
}

const langPunkt = (s: string) =>
  `${s}, vilket krävde nära samarbete med både beställare, leverantörer och förvaltning under hela året och gav mätbara förbättringar i kvalitet och ledtider`

export const LANGT_CV: CVMetadata = {
  personalInfo: {
    fullName: 'Märta Söderström-Ångström',
    title: 'Ekonomichef med ansvar för redovisning, controlling och förändringsarbete',
    email: 'marta.soderstrom@exempel.se',
    phone: '070-987 65 43',
    address: '114 55 Östermalm',
    linkedin: 'https://www.linkedin.com/in/martasoderstrom',
  },
  summary:
    'Ekonomichef med över 18 års erfarenhet från industri, handel och offentlig sektor. Har byggt upp ekonomifunktioner från grunden, lett byten av affärssystem och drivit arbetet med att korta bokslutet från tolv till fem arbetsdagar.\n\nTrivs i roller där ekonomin är ett stöd för verksamheten och inte en egen ö. Van att rapportera till styrelse, revisorer och ägare, och att översätta siffror till beslut som går att agera på.',
  experience: [
    {
      position: 'Ekonomichef',
      company: 'Nordström Industri AB',
      startDate: '2020',
      description: [
        langPunkt('Ansvarar för ekonomi, redovisning och controlling i en koncern med sju bolag och 450 anställda'),
        langPunkt('Ledde bytet från Visma till Microsoft Dynamics 365 Business Central'),
        langPunkt('Kortade månadsbokslutet från tolv till fem arbetsdagar'),
        'Rapporterar till vd och styrelse, och är föredragande i revisionsutskottet',
        'Leder ett team på nio personer inom redovisning, lön och controlling',
        langPunkt('Införde rullande prognoser som ersatte den årliga budgetprocessen'),
      ],
    },
    {
      position: 'Controller',
      company: 'Åhléns AB',
      startDate: '2015',
      endDate: '2020',
      description: [
        langPunkt('Ansvarade för uppföljning av 60 varuhus och e-handeln'),
        langPunkt('Byggde en ny rapportmodell i Power BI för butikschefer och regionchefer'),
        'Tog fram beslutsunderlag inför etableringar och nedläggningar',
        langPunkt('Drev arbetet med att sänka lagerkostnaderna genom bättre prognoser'),
        'Samordnade budgetprocessen för hela butiksorganisationen',
      ],
    },
    {
      position: 'Redovisningsansvarig',
      company: 'Region Örebro län',
      startDate: '2011',
      endDate: '2015',
      description: [
        langPunkt('Ansvarade för bokslut och årsredovisning enligt kommunal redovisningslag'),
        'Samordnade internkontrollen för tre förvaltningar',
        langPunkt('Ledde upphandlingen av ett nytt system för leverantörsfakturor'),
        'Föreläste om ekonomistyrning för chefer i regionens ledarprogram',
      ],
    },
    {
      position: 'Revisor',
      company: 'Öhrlings PricewaterhouseCoopers',
      startDate: '2008',
      endDate: '2011',
      description: [
        langPunkt('Granskade bokslut för medelstora bolag inom tillverkning och handel'),
        'Ansvarade för planering och genomförande av revisionsuppdrag med upp till fem medarbetare',
        langPunkt('Gav råd i frågor om intern kontroll och redovisningsprinciper'),
      ],
    },
    {
      position: 'Ekonomiassistent',
      company: 'Göteborgs Energi',
      startDate: '2006',
      endDate: '2008',
      description: [
        'Hanterade kund- och leverantörsreskontra samt avstämningar',
        langPunkt('Tog fram månadsrapporter till avdelningscheferna'),
        'Deltog i införandet av elektronisk fakturahantering',
      ],
    },
    {
      position: 'Kassör och butiksbiträde',
      company: 'ICA Maxi Älvsjö',
      startDate: '2003',
      endDate: '2006',
      description: ['Kassaavstämning och dagsredovisning', 'Ansvar för beställningar på mejeriavdelningen'],
    },
  ],
  education: [
    {
      degree: 'Civilekonom, inriktning redovisning och finansiering',
      institution: 'Handelshögskolan vid Göteborgs universitet',
      startDate: '2002',
      endDate: '2006',
      description: 'Examensarbete om intäktsredovisning enligt K3 i fastighetsbolag',
    },
    { degree: 'Auktoriserad revisor', institution: 'Revisorsinspektionen', graduationYear: '2011' },
    { degree: 'Ledarskap i förändring', institution: 'IFL vid Handelshögskolan i Stockholm', startDate: '2019', endDate: '2019' },
  ],
  projects: [
    {
      name: 'Nytt affärssystem i sju bolag',
      description:
        'Projektägare för bytet till Dynamics 365. Budget 9 MSEK, driftsatt på utsatt dag med alla sju bolag i samma kontoplan och gemensam koncernrapportering från första månaden.',
      technologies: ['Dynamics 365', 'Power BI', 'Excel'],
      startDate: '2021',
      endDate: '2022',
    },
    {
      name: 'Snabbare bokslut',
      description: 'Kartlade varje steg i bokslutet, tog bort dubbelarbete och automatiserade avstämningarna.',
      startDate: '2020',
      endDate: '2021',
    },
  ],
  skills: [
    { category: 'Redovisning', skills: ['K3', 'IFRS', 'Koncernredovisning', 'Kommunal redovisning', 'Skatt och moms'] },
    { category: 'Styrning', skills: ['Budget och prognos', 'Controlling', 'Internkontroll', 'Styrelserapportering'] },
    { category: 'System', skills: ['Dynamics 365', 'Visma', 'Power BI', 'Excel på avancerad nivå', 'Agresso'] },
    { category: 'Ledarskap', skills: ['Förändringsledning', 'Rekrytering', 'Coachning'] },
  ],
  certifications: [
    { name: 'Auktoriserad revisor (vilande)', issuer: 'Revisorsinspektionen', issueDate: '2011' },
    { name: 'Diplomerad styrelseledamot', issuer: 'StyrelseAkademien', issueDate: '2021' },
    { name: 'Power BI Data Analyst', issuer: 'Microsoft', issueDate: '2020' },
  ],
  languages: [
    { language: 'Svenska', proficiency: 'Modersmål' },
    { language: 'Engelska', proficiency: 'Flytande' },
    { language: 'Tyska', proficiency: 'Konversation' },
  ],
}

export const CV_LANGDER = { kort: KORT_CV, normalt: NORMALT_CV, langt: LANGT_CV } as const
