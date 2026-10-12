/**
 * Exempelkandidaterna på /for-rekryterare: fiktiva, avidentifierade och med
 * samma uppgifter som träffkorten i rekryterarportalen. Percentil, nivå och
 * villkor, aldrig råpoäng eller lönespann.
 */
import type { Kandidat } from '@/components/publikt/innehall/Traffkort'

export const REDOVISNINGSEKONOM: Kandidat = {
  roll: 'Redovisningsekonom',
  region: 'Stockholm',
  fakta: ['8 års erfarenhet', 'Senast: Redovisningsansvarig (4 år)', 'Civilekonom'],
  pitch: 'Redovisningsekonom med åtta år i byggbranschen. Trivs bäst där struktur saknas och behöver byggas upp.',
  tester: ['Matrislogik, expertnivå, topp 10 %', 'Numeriskt, topp 15 %'],
  styrkor: ['Strukturerad', 'Analytisk'],
  kompetenser: ['Bokslut', 'Koncernredovisning', 'Fortnox'],
  soker: ['Analytiskt djuparbete'],
  stil: {
    spektra: [
      { vanster: 'Improviserar och anpassar', hoger: 'Planerar och strukturerar', band: 5 },
      { vanster: 'Får energi av eget fokusarbete', hoger: 'Får energi av samarbete i grupp', band: 2 },
    ],
    trivsNar: 'processer är tydliga och kvalitet hinner göras rätt',
  },
  villkor: ['Omgående', 'Hybrid eller på plats', 'Heltid', 'B-körkort'],
}

export const EXEMPEL: Kandidat[] = [
  {
    roll: 'Frontendutvecklare',
    region: 'Göteborg',
    fakta: ['6 års erfarenhet', 'Senast: Frontendutvecklare (3 år)', 'Högskoleingenjör'],
    pitch: 'Frontendutvecklare som brinner för tillgänglighet och snabba gränssnitt. Söker ett produktbolag med höga krav.',
    tester: ['Matrislogik, topp 5 %', 'Verbalt, topp 20 %'],
    styrkor: ['Nyfiken', 'Samarbetsinriktad'],
    kompetenser: ['React', 'TypeScript', 'Tillgänglighet'],
    stil: {
      spektra: [
        { vanster: 'Jämnt, uthålligt tempo', hoger: 'Högt tempo, många bollar', band: 4 },
        { vanster: 'Improviserar och anpassar', hoger: 'Planerar och strukturerar', band: 2 },
      ],
      trivsNar: 'förutsättningar förändras och nya vägar behöver prövas',
    },
    villkor: ['3 månader', 'Distans eller hybrid', 'Heltid'],
  },
  {
    roll: 'Kundtjänstchef',
    region: 'Malmö',
    fakta: ['11 års erfarenhet', 'Senast: Kundtjänstchef (4 år)', 'YH-utbildad'],
    pitch: 'Bygger kundtjänstteam som både mäter och mår bra. Elva år i branschen, varav fyra som chef.',
    tester: ['Verbalt, topp 10 %', 'Numeriskt, topp 25 %'],
    styrkor: ['Lugn under press', 'Coachande'],
    kompetenser: ['Teamledning', 'Zendesk', 'NPS-arbete'],
    stil: {
      spektra: [
        { vanster: 'Får energi av eget fokusarbete', hoger: 'Får energi av samarbete i grupp', band: 5 },
        { vanster: 'Påverkar genom lyssnande och underlag', hoger: 'Tar naturligt kommandot i rummet', band: 4 },
      ],
      trivsNar: 'arbetet sker nära kollegor och kunder',
    },
    villkor: ['1 månad', 'På plats', 'Heltid', 'B-körkort'],
  },
]

/** Raderna i portalbilden: en sökning, tre träffar och skälet till varje. */
export const PORTAL = {
  sokning: 'redovisningsekonom koncernredovisning',
  rader: [
    {
      initial: 'R',
      rubrik: 'Redovisningsekonom, Stockholm',
      text: '8 år. Senast: Redovisningsansvarig. Matchar "koncernredovisning" i kompetenser. Strukturerad analytiker.',
      bricka: 'Topp 10 % matrislogik',
      vald: true,
    },
    {
      initial: 'K',
      rubrik: 'Kundtjänstchef, Malmö',
      text: '11 år. Senast: Kundtjänstchef. Matchar "kundtjänstchef" i roll. Stöttande klippa.',
      bricka: 'Topp 10 % verbalt',
    },
    {
      initial: 'F',
      rubrik: 'Frontendutvecklare, Göteborg',
      text: '6 år. Senast: Frontendutvecklare. Matchar "react" i kompetenser. Nyfiken utforskare.',
      bricka: 'Topp 5 % matrislogik',
    },
  ],
}
