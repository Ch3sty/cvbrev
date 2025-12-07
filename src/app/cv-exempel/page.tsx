'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import {
  Search, ChevronDown, ChevronUp, ArrowRight, CheckCircle,
  Sparkles, FileText, TrendingUp, Award, Users,
  Star, Briefcase, GraduationCap, Stethoscope, Building2,
  ShoppingCart, Code, Calculator, Phone, Package, Cog,
  Heart, Target, Coffee, Wrench, BookOpen, Server
} from 'lucide-react'

import PremiumNavbar from '@/components/PremiumNavbar'

// Type definitions
interface CVExample {
  id: string
  yrke: string
  slug: string
  kategori: 'vard' | 'teknik' | 'service' | 'utbildning' | 'ekonomi' | 'offentlig-sektor'
  niva: 'nybörjare' | 'erfaren' | 'chef' | 'specialist'
  sokvolym: number
  icon: any
  gradient: string
  preview: {
    intro: string
    highlight: string[]
  }
  featured?: boolean
}

// Gallery data - Starting with TOP 10 yrken by search volume
const cvExamples: CVExample[] = [
  {
    id: 'ingenjor',
    yrke: 'Ingenjör',
    slug: 'ingenjor',
    kategori: 'teknik',
    niva: 'specialist',
    sokvolym: 1400,
    icon: Cog,
    gradient: 'from-cyan-500 via-teal-600 to-cyan-700',
    preview: {
      intro: 'Ett professionellt CV som lyfter teknisk expertis, projektledning och problemlösning i komplexa ingenjörssystem.',
      highlight: ['Tekniska kvalifikationer och certifieringar', 'Konkreta projektresultat och mätbara förbättringar', 'Systemdesign och tvärfunktionellt samarbete']
    },
    featured: true
  },
  {
    id: 'forskollarare',
    yrke: 'Förskollärare',
    slug: 'forskollarare',
    kategori: 'utbildning',
    niva: 'erfaren',
    sokvolym: 1200,
    icon: GraduationCap,
    gradient: 'from-amber-400 via-orange-500 to-amber-600',
    preview: {
      intro: 'CV som betonar pedagogisk kompetens, läroplanstolkning och barncentrerat arbetssätt för förskoleverksamhet.',
      highlight: ['Lpfö 18 och pedagogisk dokumentation', 'Barns lärande och utveckling', 'Samarbete med vårdnadshavare och kollegor']
    },
    featured: true
  },
  {
    id: 'receptionist',
    yrke: 'Receptionist',
    slug: 'receptionist',
    kategori: 'service',
    niva: 'nybörjare',
    sokvolym: 1100,
    icon: Phone,
    gradient: 'from-sky-400 via-blue-500 to-sky-600',
    preview: {
      intro: 'Lyfter servicekänsla, multitasking och professionell kommunikation i receptionens första linje.',
      highlight: ['Kundservice och telefonhantering', 'Administrativ koordination och boksystem', 'Stresshantering och problemlösning']
    },
    featured: true
  },
  {
    id: 'lagerarbetare',
    yrke: 'Lagerarbetare',
    slug: 'lagerarbetare',
    kategori: 'service',
    niva: 'nybörjare',
    sokvolym: 980,
    icon: Package,
    gradient: 'from-orange-500 via-red-600 to-orange-700',
    preview: {
      intro: 'Framhäver logistisk noggrannhet, truckvana och säkerhetsmedvetenhet för lageromgivning.',
      highlight: ['Truckkort och lagerhantering', 'Orderplockning och packning', 'Säkerhet och arbetsmiljö']
    }
  },
  {
    id: 'administrator',
    yrke: 'Administratör',
    slug: 'administrator',
    kategori: 'offentlig-sektor',
    niva: 'erfaren',
    sokvolym: 880,
    icon: Briefcase,
    gradient: 'from-slate-500 via-gray-600 to-slate-700',
    preview: {
      intro: 'Lyfter organisatorisk kompetens, systemkunskap och administrativ precision.',
      highlight: ['Processtyrning och koordination', 'Digital systemvana (Office, affärssystem)', 'Kommunikation över avdelningar']
    }
  },
  {
    id: 'lokalvardare',
    yrke: 'Lokalvårdare',
    slug: 'lokalvardare',
    kategori: 'service',
    niva: 'nybörjare',
    sokvolym: 850,
    icon: Sparkles,
    gradient: 'from-teal-400 via-cyan-500 to-teal-600',
    preview: {
      intro: 'Betonar kvalitetsmedvetenhet, hygienkunskap och pålitlighet i professionell städmiljö.',
      highlight: ['Yrkesmässiga städmetoder', 'Kemikaliehantering och HACCP', 'Självständighet och tidsplanering']
    }
  },
  {
    id: 'handlaggare',
    yrke: 'Handläggare',
    slug: 'handlaggare',
    kategori: 'offentlig-sektor',
    niva: 'erfaren',
    sokvolym: 760,
    icon: FileText,
    gradient: 'from-indigo-500 via-blue-600 to-indigo-700',
    preview: {
      intro: 'Framhäver juridisk förståelse, utredningsförmåga och korrekt beslutsfattande enligt regelverk.',
      highlight: ['Utredning och beslutsunderlag', 'Regelverkstolkning och lagstiftning', 'Kvalitetssäkring och dokumentation']
    }
  },
  {
    id: 'lakare',
    yrke: 'Läkare',
    slug: 'lakare',
    kategori: 'vard',
    niva: 'specialist',
    sokvolym: 720,
    icon: Stethoscope,
    gradient: 'from-emerald-500 via-green-600 to-emerald-700',
    preview: {
      intro: 'Demonstrerar klinisk excellens, diagnostisk skärpa och patientcentrerad vård enligt evidens.',
      highlight: ['Evidensbaserad diagnostik och behandling', 'Patientkommunikation och medicinska etik', 'MDT-samarbete och verksamhetsutveckling']
    }
  },
  {
    id: 'underskoterska',
    yrke: 'Undersköterska',
    slug: 'underskoterska',
    kategori: 'vard',
    niva: 'erfaren',
    sokvolym: 690,
    icon: Stethoscope,
    gradient: 'from-blue-500 via-cyan-600 to-blue-700',
    preview: {
      intro: 'Betonar omvårdnadskompetens, patientnära arbete och professionellt förhållningssätt inom vård och omsorg.',
      highlight: ['Grundläggande och personlig omvårdnad', 'Medicinteknisk utrustning och dokumentation', 'Teamsamarbete och person-centrerad vård']
    }
  },
  {
    id: 'vardadministrator',
    yrke: 'Vårdadministratör',
    slug: 'vardadministrator',
    kategori: 'vard',
    niva: 'erfaren',
    sokvolym: 650,
    icon: Stethoscope,
    gradient: 'from-teal-500 via-cyan-600 to-teal-700',
    preview: {
      intro: 'CV-exempel för vårdadministratör med journalsystem, patientadministration och medicinsk sekreterarkompetens.',
      highlight: ['Cosmic, TakeCare, 1177 Vårdguiden', '120-150 patientkontakter dagligen', 'GDPR och sekretess-certifierad']
    }
  },
  {
    id: 'butiksbitrade',
    yrke: 'Butiksbiträde',
    slug: 'butiksbitrade',
    kategori: 'service',
    niva: 'nybörjare',
    sokvolym: 670,
    icon: ShoppingCart,
    gradient: 'from-green-400 via-emerald-500 to-teal-600',
    preview: {
      intro: 'Framhäver servicemedvetenhet, försäljning och praktiskt butiksarbete.',
      highlight: ['Kundmöte och kassahantering', 'Lagerrutiner och varuhantering', 'Merförsäljning och butiksordning']
    }
  },
  {
    id: 'it-konsult',
    yrke: 'IT-konsult',
    slug: 'it-konsult',
    kategori: 'teknik',
    niva: 'specialist',
    sokvolym: 620,
    icon: Code,
    gradient: 'from-violet-500 via-purple-600 to-violet-700',
    preview: {
      intro: 'Lyfter systemintegration, kundanpassning och teknisk rådgivning i komplexa IT-miljöer.',
      highlight: ['Systemintegration och API-utveckling', 'Kundanalys och kravspecifikation', 'Agila metoder och leveransförmåga']
    }
  },
  {
    id: 'student',
    yrke: 'Student',
    slug: 'student',
    kategori: 'utbildning',
    niva: 'nybörjare',
    sokvolym: 590,
    icon: GraduationCap,
    gradient: 'from-purple-500 via-pink-500 to-rose-500',
    preview: {
      intro: 'CV-exempel för dig som student eller söker ditt första jobb. Framhäv din potential och lärvilja.',
      highlight: ['Teoretisk kunskap från utbildning', 'Projektarbeten och grupparbeten', 'Stark inlärningsförmåga']
    }
  },
  {
    id: 'larare',
    yrke: 'Lärare',
    slug: 'larare',
    kategori: 'utbildning',
    niva: 'erfaren',
    sokvolym: 360,
    icon: BookOpen,
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    preview: {
      intro: 'Visa din pedagogiska kompetens och förmåga att inspirera elever med behörighet och elevresultat.',
      highlight: ['Didaktik och pedagogiska metoder', 'Individualisering och inkludering', 'Digital kompetens i undervisning']
    }
  },
  {
    id: 'sjukskoterska',
    yrke: 'Sjuksköterska',
    slug: 'sjukskoterska',
    kategori: 'vard',
    niva: 'erfaren',
    sokvolym: 180,
    icon: Stethoscope,
    gradient: 'from-blue-600 via-indigo-600 to-purple-600',
    preview: {
      intro: 'CV som lyfter din kliniska kompetens, medicinska kunskap och förmåga att arbeta under press.',
      highlight: ['Klinisk bedömning och omvårdnad', 'Medicinteknisk utrustning', 'Evidensbaserad vård']
    }
  },
  {
    id: 'specialistsjukskoterska',
    yrke: 'Specialistsjuksköterska',
    slug: 'specialistsjukskoterska',
    kategori: 'vard',
    niva: 'erfaren',
    sokvolym: 750,
    icon: Stethoscope,
    gradient: 'from-indigo-600 via-purple-600 to-pink-600',
    preview: {
      intro: 'CV-exempel för specialistsjuksköterska (IVA/anestesi/diabetes) med ECMO, CRRT, respiratorer och evidensbaserad vård.',
      highlight: ['Medicinteknisk utrustning (ECMO, CRRT)', 'Evidensbaserad intensivvård', 'Handledning och kvalitetsregister']
    }
  },
  {
    id: 'barnmorska',
    yrke: 'Barnmorska',
    slug: 'barnmorska',
    kategori: 'vard',
    niva: 'specialist',
    sokvolym: 850,
    icon: Heart,
    gradient: 'from-rose-500 via-pink-600 to-rose-700',
    preview: {
      intro: 'CV-exempel för barnmorska med evidensbaserad förlossningsvård, mödrahälsovård och teamsamverkan inom kvinnosjukvård.',
      highlight: ['Självständig förlossningshandläggning', 'Mödrahälsovård och ultraljudsdiagnostik', 'Akut obstetrisk handläggning']
    }
  },
  {
    id: 'butikssaljare',
    yrke: 'Butikssäljare',
    slug: 'butikssaljare',
    kategori: 'service',
    niva: 'nybörjare',
    sokvolym: 160,
    icon: ShoppingCart,
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
    preview: {
      intro: 'Framhäv din servicekänsla och försäljningstalang med konkreta säljresultat.',
      highlight: ['Kundservice och merförsäljning', 'Kassahantering och lagerarbete', 'Visuell merchandising']
    }
  },
  {
    id: 'saljare',
    yrke: 'Säljare',
    slug: 'saljare',
    kategori: 'service',
    niva: 'erfaren',
    sokvolym: 220,
    icon: Target,
    gradient: 'from-pink-500 via-rose-500 to-red-500',
    preview: {
      intro: 'CV för B2B eller B2C-försäljning med fokus på resultat och relationsbyggande.',
      highlight: ['Affärsutveckling och prospektering', 'Nettoomsättning och KPI:er', 'CRM-system och säljprocesser']
    }
  },
  {
    id: 'sommarjobb',
    yrke: 'Sommarjobb',
    slug: 'sommarjobb',
    kategori: 'service',
    niva: 'nybörjare',
    sokvolym: 230,
    icon: Coffee,
    gradient: 'from-yellow-400 via-orange-400 to-red-400',
    preview: {
      intro: 'CV för sommarjobb – visa din energi, flexibilitet och vilja att bidra under sommaren.',
      highlight: ['Tillgänglig hela sommaren', 'Snabbinlärning och flexibilitet', 'Positiv attityd och lagspelare']
    }
  },
  {
    id: 'ekonomiassistent',
    yrke: 'Ekonomiassistent',
    slug: 'ekonomiassistent',
    kategori: 'ekonomi',
    niva: 'erfaren',
    sokvolym: 450,
    icon: Calculator,
    gradient: 'from-slate-500 via-gray-500 to-zinc-500',
    preview: {
      intro: 'CV för ekonomiroller med fokus på noggrannhet, systemkunskap och bokföringskompetens.',
      highlight: ['Bokföring och fakturering', 'Ekonomisystem (Fortnox, Visma)', 'Månadsavslut och avstämningar']
    }
  },
  {
    id: 'barnskotare',
    yrke: 'Barnskötare',
    slug: 'barnskotare',
    kategori: 'utbildning',
    niva: 'erfaren',
    sokvolym: 210,
    icon: Heart,
    gradient: 'from-pink-400 via-rose-400 to-red-400',
    preview: {
      intro: 'CV för arbete med barn – visa din omsorg, kreativitet och pedagogiska kompetens.',
      highlight: ['Barns utveckling och behov', 'Pedagogiska aktiviteter', 'Trygghet och relationsskapande']
    }
  },
  {
    id: 'personlig-assistent',
    yrke: 'Personlig assistent',
    slug: 'personlig-assistent',
    kategori: 'vard',
    niva: 'erfaren',
    sokvolym: 180,
    icon: Users,
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    preview: {
      intro: 'CV för assistentyrket med fokus på flexibilitet, empati och förmågan att stötta individer.',
      highlight: ['LSS och personlig assistans', 'Flexibilitet och anpassningsförmåga', 'Respekt och integritet']
    }
  },
  {
    id: 'kurator',
    yrke: 'Kurator',
    slug: 'kurator',
    kategori: 'vard',
    niva: 'specialist',
    sokvolym: 540,
    icon: Heart,
    gradient: 'from-rose-400 via-pink-500 to-rose-600',
    preview: {
      intro: 'CV som betonar samtalsmetoder, psykosocial bedömning och empatisk klienthantering.',
      highlight: ['Motiverande samtal (MI) och KBT', 'Kris- och traumastöd', 'Tvärdisciplinärt samarbete']
    }
  },
  {
    id: 'psykolog',
    yrke: 'Psykolog',
    slug: 'psykolog',
    kategori: 'vard',
    niva: 'specialist',
    sokvolym: 1450,
    icon: Heart,
    gradient: 'from-indigo-500 via-purple-600 to-indigo-700',
    preview: {
      intro: 'CV för legitimerad psykolog med fokus på KBT, neuropsykiatrisk utredning och psykologisk testning inom hälso- och sjukvård.',
      highlight: ['85% symtomreduktion och 40+ utredningar årligen', 'WAIS-IV, WISC-V, Beck-skalor och TakeCare', 'Steg 1 KBT och handledarkompetens']
    }
  },
  {
    id: 'servitris-restaurangbitrade',
    yrke: 'Servitris/Restaurangbiträde',
    slug: 'servitris-restaurangbitrade',
    kategori: 'service',
    niva: 'nybörjare',
    sokvolym: 530,
    icon: Coffee,
    gradient: 'from-orange-400 via-amber-500 to-yellow-600',
    preview: {
      intro: 'CV som lyfter gästbemötande, tempo och servicekänsla i restaurangmiljö.',
      highlight: ['Gästservice och beställningshantering', 'Tempo och stresshantering', 'Matsäkerhet och hygienrutiner']
    }
  },
  {
    id: 'chef',
    yrke: 'Chef',
    slug: 'chef',
    kategori: 'offentlig-sektor',
    niva: 'chef',
    sokvolym: 490,
    icon: Users,
    gradient: 'from-slate-600 via-gray-700 to-slate-800',
    preview: {
      intro: 'CV som demonstrerar ledarskap, strategisk kompetens och förmåga att driva team.',
      highlight: ['Strategiskt ledarskap och målstyrning', 'Teamutveckling och medarbetarskap', 'Budget och verksamhetsansvar']
    }
  },
  {
    id: 'projektledare',
    yrke: 'Projektledare',
    slug: 'projektledare',
    kategori: 'offentlig-sektor',
    niva: 'erfaren',
    sokvolym: 290,
    icon: Target,
    gradient: 'from-blue-500 via-indigo-600 to-blue-700',
    preview: {
      intro: 'CV med fokus på projektplanering, stakeholder management och leverans inom tid och budget.',
      highlight: ['Agil och traditionell projektmetodik', 'Riskhantering och resursstyrning', 'Stakeholder-kommunikation']
    }
  },
  {
    id: 'enhetschef',
    yrke: 'Enhetschef',
    slug: 'enhetschef',
    kategori: 'offentlig-sektor',
    niva: 'erfaren',
    sokvolym: 880,
    icon: Users,
    gradient: 'from-indigo-500 via-purple-600 to-indigo-700',
    preview: {
      intro: 'CV-exempel för enhetschef med budgetansvar (18 MSEK), personalledning (45 medarbetare) och systematiskt arbetsmiljöarbete enligt SAM/AFS.',
      highlight: ['Budgetansvar och ekonomistyrning', 'Personalledning och HMI-resultat', 'Verksamhetsutveckling och kvalitetssäkring']
    }
  },
  {
    id: 'elevassistent',
    yrke: 'Elevassistent',
    slug: 'elevassistent',
    kategori: 'utbildning',
    niva: 'nybörjare',
    sokvolym: 260,
    icon: GraduationCap,
    gradient: 'from-purple-400 via-pink-500 to-purple-600',
    preview: {
      intro: 'CV som visar pedagogiskt stöd, individuell anpassning och tålamod i skolmiljö.',
      highlight: ['Elevstöd och anpassningar', 'Samarbete med lärare', 'Trygghet och relationsskapande']
    }
  },
  {
    id: 'kundtjanst',
    yrke: 'Kundtjänst',
    slug: 'kundtjanst',
    kategori: 'service',
    niva: 'nybörjare',
    sokvolym: 250,
    icon: Phone,
    gradient: 'from-cyan-400 via-blue-500 to-cyan-600',
    preview: {
      intro: 'CV som lyfter kommunikationsförmåga, problemlösning och servicefokus mot kunder.',
      highlight: ['Telefonservice och chatsupport', 'Ärendehantering och CRM-system', 'Problemlösning och konflikthantering']
    }
  },
  {
    id: 'kundradgivare',
    yrke: 'Kundrådgivare',
    slug: 'kundradgivare',
    kategori: 'service',
    niva: 'erfaren',
    sokvolym: 450,
    icon: Calculator,
    gradient: 'from-emerald-500 via-teal-600 to-cyan-700',
    preview: {
      intro: 'CV-exempel för kundrådgivare med SwedSec-licens, kreditbedömning och finansiell rådgivning inom bank och privat banking.',
      highlight: ['SwedSec-licens och MiFID II', 'Salesforce CRM, UC och Creditsafe', '180+ företagskunder, 420 MSEK i portfölj']
    }
  },
  {
    id: 'kundtjanstmedarbetare',
    yrke: 'Kundtjänstmedarbetare',
    slug: 'kundtjanstmedarbetare',
    kategori: 'service',
    niva: 'erfaren',
    sokvolym: 1200,
    icon: Phone,
    gradient: 'from-cyan-500 via-blue-600 to-cyan-700',
    preview: {
      intro: 'CV-exempel som visar multi-channel support, CRM-system (Zendesk, Salesforce) och kvantifierade KPI-resultat (CSAT, NPS, FCR).',
      highlight: ['CSAT 78%→91% och FCR 87%', 'Zendesk, Salesforce och Freshdesk', 'Multi-channel: telefon, chatt, e-post']
    }
  },
  {
    id: 'vardbitrade',
    yrke: 'Vårdbiträde',
    slug: 'vardbitrade',
    kategori: 'vard',
    niva: 'nybörjare',
    sokvolym: 220,
    icon: Heart,
    gradient: 'from-pink-500 via-rose-600 to-red-700',
    preview: {
      intro: 'CV som framhäver omvårdnad, empati och praktiskt stöd till patienter och brukare.',
      highlight: ['Personlig omvårdnad och ADL-stöd', 'Hygien och omsorgskvalitet', 'Teamsamarbete i vården']
    }
  },
  {
    id: 'hemtjanst',
    yrke: 'Hemtjänst',
    slug: 'hemtjanst',
    kategori: 'vard',
    niva: 'nybörjare',
    sokvolym: 200,
    icon: Users,
    gradient: 'from-indigo-400 via-purple-500 to-indigo-600',
    preview: {
      intro: 'CV som visar flexibilitet, omtanke och förmåga att stötta äldre i hemmet.',
      highlight: ['Hemvård och social omsorg', 'Praktiskt stöd och ADL', 'Dokumentation och flexibilitet']
    }
  },
  {
    id: 'kock',
    yrke: 'Kock',
    slug: 'kock',
    kategori: 'service',
    niva: 'erfaren',
    sokvolym: 190,
    icon: Wrench,
    gradient: 'from-red-500 via-orange-600 to-red-700',
    preview: {
      intro: 'CV som demonstrerar kulinarisk kompetens, matsäkerhet och effektivitet under press.',
      highlight: ['Matlagning och menyplanering', 'Hygien och HACCP-kunskap', 'Kreativitet och tempo']
    }
  },
  {
    id: 'fysioterapeut',
    yrke: 'Fysioterapeut',
    slug: 'fysioterapeut',
    kategori: 'vard',
    niva: 'specialist',
    sokvolym: 480,
    icon: Stethoscope,
    gradient: 'from-emerald-500 via-teal-600 to-emerald-700',
    preview: {
      intro: 'CV som lyfter behandlingsmetoder, patientresultat och evidensbaserad rehabilitering inom fysioterapi.',
      highlight: ['Manuell terapi och träningsterapi', 'Kvantifierade patientresultat', 'Certifieringar (OMT, MDT)']
    }
  },
  {
    id: 'grundskollarare',
    yrke: 'Grundskollärare',
    slug: 'grundskollarare',
    kategori: 'utbildning',
    niva: 'erfaren',
    sokvolym: 520,
    icon: BookOpen,
    gradient: 'from-amber-500 via-orange-600 to-amber-700',
    preview: {
      intro: 'CV för grundskollärare med fokus på lärarlegitimation, elevresultat och pedagogisk utveckling.',
      highlight: ['Lärarlegitimation och behörighet', 'Mätbara elevresultat och måluppfyllelse', 'Digitala verktyg och Lgr22']
    }
  },
  {
    id: 'specialpedagog',
    yrke: 'Specialpedagog',
    slug: 'specialpedagog',
    kategori: 'utbildning',
    niva: 'specialist',
    sokvolym: 390,
    icon: GraduationCap,
    gradient: 'from-purple-500 via-indigo-600 to-purple-700',
    preview: {
      intro: 'CV som visar utredningskompetens, handledning och specialpedagogiska insatser för elever med särskilda behov.',
      highlight: ['Pedagogiska utredningar och NPF', 'Handledning av pedagoger', 'Åtgärdsprogram och SPSM-metoder']
    }
  },
  {
    id: 'kontorsassistent',
    yrke: 'Kontorsassistent',
    slug: 'kontorsassistent',
    kategori: 'offentlig-sektor',
    niva: 'erfaren',
    sokvolym: 590,
    icon: Briefcase,
    gradient: 'from-sky-500 via-blue-600 to-sky-700',
    preview: {
      intro: 'CV för kontorsassistent med fokus på administration, kundservice och systemkunskap i högt tempo.',
      highlight: ['Fortnox och Microsoft 365 Expert', 'Kvantifierade arbetsvolymer', 'Möteskoordinering och fakturering']
    }
  },
  {
    id: 'automationsingenior',
    yrke: 'Automationsingenjör',
    slug: 'automationsingenior',
    kategori: 'teknik',
    niva: 'specialist',
    sokvolym: 880,
    icon: Cog,
    gradient: 'from-cyan-600 via-blue-700 to-cyan-800',
    preview: {
      intro: 'CV för automationsingenjör med fokus på PLC-programmering, SCADA och robotautomation med kvantifierade resultat.',
      highlight: ['PLC (Siemens, ABB) och SCADA-system', 'Robotprogrammering och produktionsoptimering', 'Driftsättning och uppgraderingsprojekt']
    }
  },
  {
    id: 'konstruktor',
    yrke: 'Konstruktör',
    slug: 'konstruktor',
    kategori: 'teknik',
    niva: 'specialist',
    sokvolym: 800,
    icon: Cog,
    gradient: 'from-slate-600 via-zinc-700 to-slate-800',
    preview: {
      intro: 'CV för konstruktör med fokus på CAD-kompetens, FEM-analyser och DFM-arbete med kvantifierade affärsresultat.',
      highlight: ['SolidWorks, CATIA och FEM-analys', 'DFM/DFA och kostnadsoptimering', 'GD&T och produktutveckling']
    }
  },
  {
    id: 'truckforare',
    yrke: 'Truckförare',
    slug: 'truckforare',
    kategori: 'service',
    niva: 'erfaren',
    sokvolym: 500,
    icon: Package,
    gradient: 'from-orange-600 via-amber-700 to-orange-800',
    preview: {
      intro: 'CV för truckförare med fokus på truckkort, WMS-system och kvantifierade säkerhetsresultat inom logistik.',
      highlight: ['Truckkort A1-A4, B1-B2 med årtal', 'WMS-system (SAP WM, Astro WMS)', 'Säkerhetsrekord och produktivitet']
    }
  },
  {
    id: 'logistiker',
    yrke: 'Logistiker',
    slug: 'logistiker',
    kategori: 'service',
    niva: 'erfaren',
    sokvolym: 480,
    icon: TrendingUp,
    gradient: 'from-teal-600 via-cyan-700 to-blue-800',
    preview: {
      intro: 'CV för logistiker med fokus på ERP-system, supply chain-optimering och kvantifierade kostnadsbesparingar.',
      highlight: ['SAP MM/WM och Blue Yonder WMS', 'APICS CPIM och Lean Six Sigma', 'Kostnadsreduktioner och leveransprecision']
    }
  },
  {
    id: 'lagerchef',
    yrke: 'Lagerchef',
    slug: 'lagerchef',
    kategori: 'service',
    niva: 'chef',
    sokvolym: 350,
    icon: Users,
    gradient: 'from-indigo-600 via-purple-700 to-indigo-800',
    preview: {
      intro: 'CV för lagerchef med fokus på personalledning, budgetansvar och operativa KPI:er inom lager och logistik.',
      highlight: ['Personalansvar och budgetansvar i MSEK', 'WMS-system och lean-metodik', 'Leveransprecision och plockfelsreduktion']
    }
  },
  {
    id: 'fastighetsskotare',
    yrke: 'Fastighetsskötare',
    slug: 'fastighetsskotare',
    kategori: 'service',
    niva: 'erfaren',
    sokvolym: 450,
    icon: Wrench,
    gradient: 'from-amber-600 via-orange-700 to-amber-800',
    preview: {
      intro: 'CV för fastighetsskötare med fokus på teknisk bredd, certifieringar och kvantifierade resultat inom fastighetsförvaltning.',
      highlight: ['Heta arbeten, elsäkerhet och F-gas', 'Vitec och Momentum fastighetssystem', 'Minskade felanmälningar och energibesparing']
    }
  },
  {
    id: 'hemtjanstpersonal',
    yrke: 'Hemtjänstpersonal',
    slug: 'hemtjanstpersonal',
    kategori: 'vard',
    niva: 'erfaren',
    sokvolym: 890,
    icon: Heart,
    gradient: 'from-rose-500 via-pink-600 to-rose-700',
    preview: {
      intro: 'CV för hemtjänstpersonal med fokus på ADL-stöd, medicindelegering och kvantifierade omvårdnadsresultat.',
      highlight: ['Lifecare, TakeCare och IBIC-system', 'Demensutbildning och certifieringar med årtal', 'Rehabiliterande arbetssätt och brukarsjälvständighet']
    }
  },
  {
    id: 'servicemedarbetare',
    yrke: 'Servicemedarbetare',
    slug: 'servicemedarbetare',
    kategori: 'service',
    niva: 'erfaren',
    sokvolym: 420,
    icon: Briefcase,
    gradient: 'from-slate-500 via-gray-600 to-slate-700',
    preview: {
      intro: 'CV för servicemedarbetare med fokus på fastighetsdrift, receptionsarbete och kvantifierade serviceresultat.',
      highlight: ['Aptean Workplace och ISS FastFM', 'Heta arbeten, truckkort och hygienutbildning', 'Kundnöjdhet 78%→92% och 8 000 kvm lokalansvar']
    }
  },
  {
    id: 'socialsekreterare',
    yrke: 'Socialsekreterare',
    slug: 'socialsekreterare',
    kategori: 'offentlig-sektor',
    niva: 'erfaren',
    sokvolym: 650,
    icon: FileText,
    gradient: 'from-indigo-500 via-purple-600 to-indigo-700',
    preview: {
      intro: 'CV för socialsekreterare med fokus på utredning, myndighetsutövning och BBIC-metodik inom socialtjänsten.',
      highlight: ['Treserva, ProCapita Webb och BBIC-certifiering', 'Kvantifierade utredningsresultat och handläggningstider', 'Samverkan med BUP, skola och polis']
    }
  },
  {
    id: 'hr-specialist',
    yrke: 'HR-specialist',
    slug: 'hr-specialist',
    kategori: 'ekonomi',
    niva: 'erfaren',
    sokvolym: 1000,
    icon: Users,
    gradient: 'from-teal-500 via-cyan-600 to-teal-700',
    preview: {
      intro: 'CV för HR-specialist med fokus på rekrytering, arbetsrätt och organisationsutveckling inom tillverkningsindustri och tjänstesektor.',
      highlight: ['Workday, SAP SuccessFactors och TeamTailor', 'Kvantifierade rekryteringsresultat och personalomsättning', 'Arbetsrätt (LAS, MBL) och GDPR-certifieringar']
    }
  },
  {
    id: 'controller',
    yrke: 'Controller',
    slug: 'controller',
    kategori: 'ekonomi',
    niva: 'erfaren',
    sokvolym: 880,
    icon: Calculator,
    gradient: 'from-emerald-500 via-teal-600 to-emerald-700',
    preview: {
      intro: 'CV för controller med fokus på budgetarbete, forecasting och affärsanalys inom tillverkning och detaljhandel.',
      highlight: ['SAP FI/CO, Power BI och IFRS-certifiering', 'Kvantifierade resultat (miljarder i omsättningsansvar)', 'Business partnering och variance analysis']
    }
  },
  {
    id: 'kassorska',
    yrke: 'Kassörska',
    slug: 'kassorska',
    kategori: 'service',
    niva: 'erfaren',
    sokvolym: 480,
    icon: ShoppingCart,
    gradient: 'from-orange-500 via-amber-600 to-orange-700',
    preview: {
      intro: 'CV för kassörska med fokus på kassasystem, kontanthantering och kundservice inom dagligvaruhandel.',
      highlight: ['Extenda och Hoist kassasystem', 'Kvantifierade resultat (150-200 kunder/dag, 0,1% kassadifferens)', 'Merförsäljning och bonuskortregistreringar']
    }
  },
  {
    id: 'butikschef',
    yrke: 'Butikschef',
    slug: 'butikschef',
    kategori: 'service',
    niva: 'chef',
    sokvolym: 720,
    icon: ShoppingCart,
    gradient: 'from-emerald-500 via-green-600 to-emerald-700',
    preview: {
      intro: 'CV för butikschef med fokus på personalansvar, budgetarbete och försäljningstillväxt inom detaljhandeln.',
      highlight: ['45 MSEK omsättning och 25% tillväxt', 'Personalansvar för 15 medarbetare', 'NKI-förbättring 72%→88% och svinnsänkning']
    }
  },
  {
    id: 'account-manager',
    yrke: 'Account Manager',
    slug: 'account-manager',
    kategori: 'service',
    niva: 'erfaren',
    sokvolym: 880,
    icon: Target,
    gradient: 'from-blue-500 via-indigo-600 to-blue-700',
    preview: {
      intro: 'CV för account manager med fokus på retention, upselling och strategiskt key account management inom B2B.',
      highlight: ['94% retention rate och 45 MSEK kundportfölj', 'Salesforce, Gainsight och Customer Success', 'QBR med C-level och NPS-förbättring']
    }
  },
  {
    id: 'systemutvecklare',
    yrke: 'Systemutvecklare',
    slug: 'systemutvecklare',
    kategori: 'teknik',
    niva: 'erfaren',
    sokvolym: 1300,
    icon: Code,
    gradient: 'from-violet-500 via-purple-600 to-violet-700',
    preview: {
      intro: 'CV för systemutvecklare med fokus på fullstack-utveckling, kodkvalitet och skalbara lösningar inom fintech och e-handel.',
      highlight: ['API-prestanda 800ms→120ms och 92% test coverage', 'React, TypeScript, .NET och microservices', 'Tech lead för 4 utvecklare med code reviews']
    }
  },
  {
    id: 'devops-engineer',
    yrke: 'DevOps Engineer',
    slug: 'devops-engineer',
    kategori: 'teknik',
    niva: 'erfaren',
    sokvolym: 1100,
    icon: Server,
    gradient: 'from-orange-500 via-red-600 to-orange-700',
    preview: {
      intro: 'CV för DevOps Engineer med fokus på CI/CD, Kubernetes och Infrastructure as Code inom fintech och e-handel.',
      highlight: ['Deployment 2/vecka→15/dag och 99.95% uptime', 'Kubernetes, Terraform, AWS och GitHub Actions', 'Tech lead med on-call och kostnadsbesparingar 35%']
    }
  },
  {
    id: 'projektledare-it',
    yrke: 'Projektledare IT',
    slug: 'projektledare-it',
    kategori: 'teknik',
    niva: 'erfaren',
    sokvolym: 950,
    icon: Cog,
    gradient: 'from-blue-600 via-indigo-700 to-blue-800',
    preview: {
      intro: 'CV för IT-projektledare med fokus på Agile leverans, budgetansvar och stakeholder management inom bank och försäkring.',
      highlight: ['25 MSEK budget och 98% stakeholder satisfaction', 'Jira, Azure DevOps, MS Project och SAFe', 'PMP, PRINCE2 och certifieringar med årtal']
    }
  },
  {
    id: 'fritidspedagog',
    yrke: 'Fritidspedagog',
    slug: 'fritidspedagog',
    kategori: 'utbildning',
    niva: 'erfaren',
    sokvolym: 720,
    icon: GraduationCap,
    gradient: 'from-amber-500 via-orange-600 to-amber-700',
    preview: {
      intro: 'CV för fritidspedagog med fokus på pedagogisk planering, rastverksamhet och elevdelaktighet inom grund- och fritidsskola.',
      highlight: ['45 elever och 92% delaktighet i verksamhetsplanering', 'InfoMentor, Unikum och läroplansanknytning', 'Legitimerad med SET och Grön Flagg-certifiering']
    }
  },
  {
    id: 'fritidsledare',
    yrke: 'Fritidsledare',
    slug: 'fritidsledare',
    kategori: 'utbildning',
    niva: 'erfaren',
    sokvolym: 590,
    icon: Users,
    gradient: 'from-cyan-500 via-teal-600 to-cyan-700',
    preview: {
      intro: 'CV för fritidsledare med fokus på ungdomsverksamhet, aktivitetsplanering och SSPF-samverkan på fritidsgårdar och ungdomscentra.',
      highlight: ['250+ ungdomar årligen och 45% ökat deltagande', 'MI-samtal, SSPF och konflikthantering', 'SISU-utbildad med budgetansvar 480 000 kr']
    }
  },
  {
    id: 'redovisningsekonom',
    yrke: 'Redovisningsekonom',
    slug: 'redovisningsekonom',
    kategori: 'ekonomi',
    niva: 'erfaren',
    sokvolym: 590,
    icon: Calculator,
    gradient: 'from-emerald-500 via-teal-600 to-emerald-700',
    preview: {
      intro: 'CV för redovisningsekonom med fokus på bokslut, skattedeklarationer och K3-redovisning inom byrå och industri.',
      highlight: ['85 klienter och 100% leveranssäkerhet till Skatteverket', 'Fortnox, Visma och SAP Business One', 'Auktoriserad SRF och K3-certifierad']
    }
  },
  {
    id: 'bartender',
    yrke: 'Bartender',
    slug: 'bartender',
    kategori: 'service',
    niva: 'erfaren',
    sokvolym: 480,
    icon: Coffee,
    gradient: 'from-amber-500 via-orange-600 to-red-700',
    preview: {
      intro: 'CV för bartender med fokus på cocktailkunskap, kassahantering och högtrycksservice inom hotellbar och nattklubb.',
      highlight: ['200+ gäster/kväll och 28% ökad barförsäljning', 'Trivec, iZettle och WSET Level 2', 'Serveringstillstånd och signature drinks']
    }
  },
  {
    id: 'konditor',
    yrke: 'Konditor',
    slug: 'konditor',
    kategori: 'service',
    niva: 'erfaren',
    sokvolym: 320,
    icon: Coffee,
    gradient: 'from-pink-500 via-rose-600 to-pink-700',
    preview: {
      intro: 'CV för konditor med fokus på tårtdekorering, chokladarbete och wienerbrödsteknik inom hotellkonditori och bageri.',
      highlight: ['40+ bröllopstårtor/år och 35% ökad dessertförsäljning', 'HACCP-certifiering och livsmedelshygien', 'Chokladtemperering och socker­arbete']
    }
  },
  {
    id: 'ekonom',
    yrke: 'Ekonom',
    slug: 'ekonom',
    kategori: 'ekonomi',
    niva: 'erfaren',
    sokvolym: 1100,
    icon: Calculator,
    gradient: 'from-blue-600 via-indigo-700 to-blue-800',
    preview: {
      intro: 'CV för ekonom med fokus på strategisk affärsanalys, investeringsbeslut och finansiell modellering inom konsult och industri.',
      highlight: ['450 MSEK investeringsbeslut och 180 MSEK reducerad kapitalbindning', 'Excel VBA, Power BI, SAP och CFA-kandidat', 'McKinsey-erfarenhet och business partnering till ledning']
    }
  },
  {
    id: 'scrum-master',
    yrke: 'Scrum Master',
    slug: 'scrum-master',
    kategori: 'teknik',
    niva: 'erfaren',
    sokvolym: 880,
    icon: Cog,
    gradient: 'from-purple-500 via-violet-600 to-purple-700',
    preview: {
      intro: 'CV för Scrum Master med fokus på servant leadership, agila ceremonier och teamutveckling inom fintech och e-handel.',
      highlight: ['45% velocity-förbättring och cycle time från 12 till 5 dagar', 'PSM II, SAFe SM och Jira/Confluence', 'Klarna/Hemnet-erfarenhet och PO-coaching']
    }
  },
  {
    id: 'teamledare',
    yrke: 'Teamledare',
    slug: 'teamledare',
    kategori: 'service',
    niva: 'erfaren',
    sokvolym: 1100,
    icon: Users,
    gradient: 'from-teal-500 via-cyan-600 to-blue-600',
    preview: {
      intro: 'CV-exempel för teamledare med coaching, målstyrning och agila metoder (Scrum, OKR) inom tech och kundtjänst.',
      highlight: ['NPS från 42 till 68, eNPS från 18 till 54', 'Jira, Lattice, Salesforce och CSM-certifierad', '10 direktrapporter, 4 interna befordringar']
    }
  }
]

const categories = [
  { id: 'all', label: 'Alla yrken', icon: Briefcase, color: 'from-blue-600 to-indigo-600' },
  { id: 'vard', label: 'Vård & Omsorg', icon: Stethoscope, color: 'from-blue-500 to-cyan-500' },
  { id: 'teknik', label: 'Teknik & IT', icon: Code, color: 'from-purple-500 to-pink-500' },
  { id: 'service', label: 'Service & Försäljning', icon: ShoppingCart, color: 'from-green-500 to-emerald-500' },
  { id: 'utbildning', label: 'Utbildning', icon: GraduationCap, color: 'from-amber-500 to-orange-500' },
  { id: 'ekonomi', label: 'Ekonomi', icon: Calculator, color: 'from-slate-500 to-gray-600' },
  { id: 'offentlig-sektor', label: 'Offentlig sektor', icon: Building2, color: 'from-indigo-500 to-blue-600' },
]

export default function CVExempelGalleri() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const { scrollY } = useScroll()
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150])
  const backgroundOpacity = useTransform(scrollY, [0, 300], [1, 0.3])

  // Track mouse for gradient effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Filter examples
  const filteredExamples = useMemo(() => {
    return cvExamples.filter(example => {
      const matchesCategory = selectedCategory === 'all' || example.kategori === selectedCategory
      const matchesSearch = example.yrke.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [selectedCategory, searchQuery])

  // Featured examples
  const featuredExamples = cvExamples.filter(ex => ex.featured)

  const faqItems = [
    {
      q: 'Hur använder jag dessa CV-exempel?',
      a: 'Klicka på det yrke som stämmer med din bakgrund eller det jobb du söker. Du får se ett komplett CV-exempel med struktur, innehåll och formatering. Använd det som inspiration för ditt eget CV – anpassa innehållet till din egen erfarenhet.'
    },
    {
      q: 'Är CV-exemplen ATS-optimerade?',
      a: 'Ja! Alla våra CV-exempel följer ATS-vänlig struktur med tydliga rubriker, kronologisk ordning och nyckelord från respektive bransch. De fungerar både för automatiska system och mänskliga rekryterare.'
    },
    {
      q: 'Kan jag kopiera exemplet direkt?',
      a: 'Nej, kopiera inte exempel rakt av. Rekryterare ser direkt om ett CV är generiskt. Använd exemplet som mall för struktur och innehållstyp, men fyll i med DIN egna erfarenhet, dina resultat och dina kvalifikationer.'
    },
    {
      q: 'Vilken CV-mall passar mitt yrke?',
      a: 'Det beror på bransch och karriärnivå. Traditionella branscher (finans, juridik, offentlig sektor) föredrar klassiska mallar. Kreativa branscher (design, marknadsföring) kan använda modernare mallar. Tech och startup-världen ligger mittemellan.'
    },
    {
      q: 'Hur långt ska mitt CV vara?',
      a: 'För de flesta yrken: 1-2 sidor. Nybörjare (0-3 års erfarenhet): 1 sida. Erfarna yrkespersoner (3-10 år): 1-2 sidor. Seniora specialister/chefer (10+ år): Max 2 sidor. Akademiska CV kan vara längre.'
    },
    {
      q: 'Vad är skillnaden mellan ett bra och dåligt CV?',
      a: 'Ett bra CV är konkret (specifika resultat och siffror), relevant (anpassat för jobbet), och lättläst (tydlig struktur och formatering). Ett dåligt CV är vagt ("ansvarig för"), generiskt (samma CV till alla jobb), och rörigt (för mycket information utan prioritering).'
    },
    {
      q: 'Ska jag ha med en profilbild på mitt CV?',
      a: 'I Sverige är det vanligt men inte krav. För kundnära roller (sälj, service, kommunikation) kan en professionell bild vara positivt. För tekniska roller är det mindre viktigt. Viktigt: Använd en professionell bild, inte ett party-foto.'
    },
    {
      q: 'Hur anpassar jag mitt CV för olika jobb?',
      a: 'Anpassa tre delar: 1) Profiltext – skriv om så den matchar jobbtiteln och företagets behov, 2) Erfarenhet – prioritera och expandera relevant erfarenhet, 3) Kompetenser – lista de färdigheter som nämns i jobbannonsen först.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50/50">
      <PremiumNavbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Morphing gradient background */}
        <motion.div
          className="absolute inset-0"
          style={{ opacity: backgroundOpacity }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/30 via-white to-indigo-50/30" />

          {/* Mouse-following gradient */}
          <motion.div
            className="absolute w-[600px] h-[600px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%)',
              left: mousePosition.x - 300,
              top: mousePosition.y - 300,
              filter: 'blur(40px)',
            }}
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />

          {/* Animated gradient orbs */}
          <motion.div
            className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl"
            animate={{
              x: [0, -100, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        </motion.div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Hero Content */}
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Premium Badge */}
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-50 to-indigo-50 rounded-full mb-6 border border-cyan-100"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Sparkles className="w-4 h-4 text-cyan-600" />
                <span className="text-sm font-semibold bg-gradient-to-r from-cyan-600 to-indigo-600 bg-clip-text text-transparent">
                  Professionella CV-exempel för alla yrken
                </span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-[1.1]">
                CV-exempel för{' '}
                <motion.span
                  className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ['0%', '100%', '0%'],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    repeatType: 'loop',
                  }}
                  style={{
                    backgroundSize: '200% 200%',
                  }}
                >
                  66 yrken
                </motion.span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Se hur ett professionellt CV ser ut för just ditt yrke. Alla exempel är ATS-optimerade, strukturerade för svensk arbetsmarknad och visar konkreta resultat.
              </p>

              {/* Hero Stats */}
              <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
                <motion.div
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-slate-900">40</div>
                    <div className="text-xs text-slate-600">Yrkeskategorier</div>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-slate-900">8</div>
                    <div className="text-xs text-slate-600">CV-mallar</div>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-slate-900">100%</div>
                    <div className="text-xs text-slate-600">ATS-optimerat</div>
                  </div>
                </motion.div>
              </div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Link href="#galleri">
                  <motion.button
                    className="px-8 py-4 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white font-bold text-lg rounded-2xl hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-300"
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="flex items-center gap-3">
                      <FileText className="w-6 h-6" />
                      <span>Bläddra bland CV-exempel</span>
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Examples */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Mest eftersökta CV-exempel
              </h2>
              <p className="text-lg text-slate-600">
                Dessa yrken har högst sökvolym – börja här
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {featuredExamples.map((example, idx) => (
                <motion.div
                  key={example.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link href={`/cv-exempel/${example.slug}`}>
                    <motion.div
                      className="group relative h-full bg-gradient-to-br from-slate-50 to-white rounded-2xl border-2 border-slate-200 p-6 overflow-hidden cursor-pointer"
                      whileHover={{ y: -8, scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Gradient overlay */}
                      <motion.div
                        className={`absolute inset-0 bg-gradient-to-br ${example.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                      />

                      {/* Popular badge */}
                      <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        Populär
                      </div>

                      <div className="relative">
                        {/* Icon */}
                        <div className={`w-14 h-14 bg-gradient-to-br ${example.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                          <example.icon className="w-7 h-7 text-white" />
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-cyan-600 transition-colors">
                          {example.yrke}
                        </h3>

                        {/* Preview intro */}
                        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                          {example.preview.intro}
                        </p>

                        {/* Highlights */}
                        <div className="space-y-2 mb-4">
                          {example.preview.highlight.slice(0, 2).map((highlight, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-xs text-slate-600">{highlight}</span>
                            </div>
                          ))}
                        </div>

                        {/* CTA */}
                        <div className="flex items-center gap-2 text-cyan-600 font-semibold group-hover:gap-3 transition-all">
                          <span className="text-sm">Visa CV-exempel</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Gallery Section */}
      <section id="galleri" className="py-24 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Search and Filter Bar */}
            <motion.div
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {/* Search */}
              <div className="relative max-w-md mx-auto mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Sök efter yrke..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all outline-none"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap justify-center gap-3">
                {categories.map((category) => (
                  <motion.button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${
                      selectedCategory === category.id
                        ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                        : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-cyan-300 hover:shadow-md'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <category.icon className="w-4 h-4" />
                    {category.label}
                  </motion.button>
                ))}
              </div>

              {/* Results count */}
              <div className="text-center mt-6">
                <p className="text-sm text-slate-600">
                  Visar <span className="font-bold text-slate-900">{filteredExamples.length}</span> CV-exempel
                  {searchQuery && ` för "${searchQuery}"`}
                </p>
              </div>
            </motion.div>

            {/* Gallery Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredExamples.map((example, idx) => (
                  <motion.div
                    key={example.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                  >
                    <Link href={`/cv-exempel/${example.slug}`}>
                      <motion.div
                        className="group relative h-full bg-white rounded-xl border border-slate-200 p-6 overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-shadow duration-300"
                        whileHover={{ y: -6 }}
                        transition={{ duration: 0.2 }}
                      >
                        {/* Gradient hover effect */}
                        <motion.div
                          className={`absolute inset-0 bg-gradient-to-br ${example.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                        />

                        <div className="relative">
                          {/* Icon */}
                          <div className={`w-12 h-12 bg-gradient-to-br ${example.gradient} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                            <example.icon className="w-6 h-6 text-white" />
                          </div>

                          {/* Content */}
                          <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-cyan-600 transition-colors">
                            {example.yrke}
                          </h3>

                          <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                            {example.preview.intro}
                          </p>

                          {/* Highlights */}
                          <div className="space-y-1.5 mb-4">
                            {example.preview.highlight.slice(0, 2).map((highlight, i) => (
                              <div key={i} className="flex items-start gap-1.5">
                                <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-xs text-slate-600 line-clamp-1">{highlight}</span>
                              </div>
                            ))}
                          </div>

                          {/* Footer */}
                          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                            <motion.div
                              className="flex items-center gap-1 text-cyan-600 font-semibold text-sm"
                              initial={{ x: 0 }}
                              whileHover={{ x: 4 }}
                            >
                              <span>Se CV-exempel</span>
                              <ArrowRight className="w-4 h-4" />
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Empty state */}
            {filteredExamples.length === 0 && (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Inga CV-exempel hittades
                </h3>
                <p className="text-slate-600 mb-6">
                  Prova att söka efter ett annat yrke eller ta bort filtret
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                  }}
                  className="px-6 py-3 bg-cyan-600 text-white font-semibold rounded-xl hover:bg-cyan-700 transition-colors"
                >
                  Återställ sökning
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-cyan-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Vill du ha en professionell CV-mall?
              </h2>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Välj mellan 8 ATS-optimerade CV-mallar som ser professionella ut. Ladda ner direkt och fyll i – klart på minuter.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/verktyg/cv-mallar">
                  <motion.button
                    className="px-8 py-4 bg-white text-cyan-600 font-bold text-lg rounded-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Sparkles className="w-6 h-6" />
                    Se alla CV-mallar
                  </motion.button>
                </Link>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-6 text-white/80 text-sm mt-8">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span>8 professionella mallar</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span>100% ATS-kompatibla</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span>Ladda ner direkt</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Vanliga frågor om CV
              </h2>
              <p className="text-lg text-slate-600">
                Allt du behöver veta för att skriva ett professionellt CV
              </p>
            </div>

            <div className="space-y-4">
              {faqItems.map((item, idx) => (
                <motion.div
                  key={idx}
                  className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-100 transition-colors"
                  >
                    <span className="font-semibold text-slate-900 text-left pr-4">{item.q}</span>
                    {expandedFaq === idx ? (
                      <ChevronUp className="w-5 h-5 text-slate-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-600 flex-shrink-0" />
                    )}
                  </button>
                  <AnimatePresence>
                    {expandedFaq === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-6 pb-4">
                          <p className="text-slate-600 leading-relaxed">{item.a}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
