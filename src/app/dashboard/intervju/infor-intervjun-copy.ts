/**
 * All text på Inför intervjun, i det nya provet, på tolkningssidan och i
 * hemskärmens två nya steg, ordagrant ur copytabellen i
 * docs/design/rod-trad-prov-2026-09-24.html (avsnitt "Inför intervjun
 * (inloggat)"). Paketnamnen läses alltid ur src/lib/plans.
 *
 * Svenska facktermer, vi-form, inga talstreck, inget "AI".
 */

import { FRAGOR, type FragaId } from '@/components/artiklar/intervjuprov/fragor'
import { NIVA_ETIKETTER } from '@/components/artiklar/intervjuprov/intervjuprov-copy'
import { paketMedPris, paketNamnForScope, type PlanScope } from '@/lib/plans/plans'
import { saknadesFras } from '@/lib/intervju/nasta'

const TAL = ['noll', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio']

const storBokstav = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export function nivaEtikett(level: number): string {
  const n = Math.min(5, Math.max(1, Math.round(level))) as 1 | 2 | 3 | 4 | 5
  return NIVA_ETIKETTER[n]
}

export const MENY = {
  etikett: 'Inför intervjun',
  nyhet: 'Nyhet',
} as const

export const SIDA = {
  eyebrow: 'Träna',
  titel: 'Inför intervjun',
  beskrivning: 'Öva på frågorna du kommer att få, och se vad rekryteraren läser ut av din profil.',
  /** Med interview_unlimited: "... Utan tak i Träningspaketet." */
  beskrivningUtanTak: (scope: PlanScope) =>
    `Öva på frågorna du kommer att få, och se vad rekryteraren läser ut av din profil. Utan tak i ${paketNamnForScope(scope)}.`,
  knapp: 'Nytt intervjuprov',
} as const

export const NASTA = {
  eyebrow: 'Nästa handling',
  sekundar: 'Välj en annan fråga',
  omskrivning: {
    rubrik: (fraga: FragaId) => `Skriv om svaret om ${FRAGOR[fraga].bestamd}`,
    text: (level: number, nar: string, missingKind: string, fraga: FragaId) => {
      const fras = saknadesFras(missingKind, fraga)
      return `Du fick ${level} av 5 ${nar}, och det var ${fras} som saknades. Skriv om med ${fras}, så ser du om nivån lyfter.`
    },
    knapp: 'Skriv om svaret',
  },
  lasIgen: {
    tillagg: 'Nästa prov öppnar i morgon.',
    knapp: 'Läs återkopplingen igen',
  },
  nyFraga: {
    rubrik: (fraga: FragaId) => `Öva på "${FRAGOR[fraga].text.replace(/\.$/, '')}"`,
    text: (fraga: FragaId) => FRAGOR[fraga].beskrivning,
    knapp: 'Svara på frågan',
  },
  forstaGang: {
    eyebrow: 'Börja här',
    rubrik: 'Öva på "Berätta om dig själv"',
    text: 'Frågan kommer nästan alltid först. Skriv ditt svar som du skulle säga det, så säger vi vad rekryteraren hör och vad som saknas.',
    kvot: 'Ett prov om dagen ingår.',
    knapp: 'Svara på frågan',
  },
  /** Kvotmeningen bara för den som har ett tak och dagens prov kvar. */
  forstaGangText: (kvotKvar: boolean, utanTak: boolean): string =>
    kvotKvar && !utanTak ? `${NASTA.forstaGang.text} ${NASTA.forstaGang.kvot}` : NASTA.forstaGang.text,
  helaTestet: {
    rubrik: 'Gör hela personlighetstestet',
    text: 'Smakprovet gav en riktning. Femtio påståenden ger profilen rekryteraren faktiskt jämför med, och den ingår gratis.',
    knapp: 'Starta testet',
  },
} as const

export const LISTA = {
  etikett: 'Dina intervjuprov',
  oppna: 'Öppna',
  av: 'av 5',
  /** "Godkänt · I går · omskrivet med planen" */
  underrad: (level: number, dag: string, missingKind: string) =>
    `${nivaEtikett(level)} · ${dag} · omskrivet med ${missingKind}`,
  /** Skärmläsaren: "3 av 5". */
  sr: (level: number) => `${level} av 5`,
} as const

export const TOM = {
  rubrik: 'Inga prov än',
  text: 'Skriv ett svar så säger vi vad rekryteraren hör. Ett prov om dagen ingår gratis.',
  /** Med interview_unlimited: samma text utan kvotmeningen. */
  textUtanTak: 'Skriv ett svar så säger vi vad rekryteraren hör.',
  textFor: (utanTak: boolean): string => (utanTak ? TOM.textUtanTak : TOM.text),
} as const

export const KVOT = {
  kvar: 'Ett prov per dygn ingår. Dagens är kvar.',
  slut: 'Ett prov per dygn ingår. Dagens är gjort, nästa öppnar i morgon.',
  lank: `Se ${paketMedPris('test_week')}`,
} as const

export const PROFIL = {
  etikett: 'Din personlighetsprofil',
  smakprov: {
    meta: (datum: string) => `Smakprovet, 20 påståenden · ${datum}`,
    lankTolkning: 'Hela tolkningen',
    lankHelaTestet: 'Gör hela testet, 50 påståenden',
  },
  grund: { meta: (datum: string) => `Grundtestet, 50 påståenden · ${datum}` },
  avancerad: { meta: (datum: string) => `Fördjupade testet, 120 påståenden · ${datum}` },
  lankAnalys: 'Hela analysen',
  lankArbetsstil: 'Din arbetsstil',
  lankFordjupat: 'Fördjupade testet, 120 påståenden',
  /** Utan tests_above_base: metatext, ingen länk, ingen betalvägg. */
  fordjupatIngar: `Fördjupade testet ingår i ${paketMedPris('test_week')}`,
  tom: {
    rubrik: 'Ingen profil än',
    text: 'Femtio påståenden, tio minuter. Sedan ser du vad rekryteraren läser ut av dig.',
    lank: 'Gör personlighetstestet',
  },
} as const

export const NY = {
  titel: 'Nytt intervjuprov',
  steg1: 'Välj fråga',
  fraga: 'Vilken fråga vill du öva på?',
  rekommenderas: 'Rekommenderas',
  fortsatt: 'Fortsätt',
  valjForst: 'Välj en fråga först',
  meta: (antal: number, basta: number | undefined) =>
    antal === 0 || basta === undefined
      ? 'Inte gjord än'
      : `Gjord ${antal === 1 ? 'en gång' : `${TAL[antal] ?? antal} gånger`} · bäst ${basta} av 5`,
  steg2: 'Ditt svar',
  bedom: 'Bedöm mitt svar',
  busy: 'Vi läser ditt svar',
} as const

export const PROFILSIDA = {
  eyebrow: 'Inför intervjun',
  titel: 'Din profil, hela tolkningen',
  beskrivning:
    'Så läser en rekryterare de fem faktorerna, vad du kan säga på intervjun och vilka påståenden som var omvända.',
  profil: 'Din profil',
  krav: {
    rubrik: 'Så läses din profil mot sex vanliga kravprofiler',
    kolumner: ['Kravprofil', 'Väger tungt', 'Din profil'] as const,
  },
  intervju: 'Det du kan säga på intervjun, faktor för faktor',
  omvanda: 'De tio påståendena som var omvända',
  duSvarade: (ord: string) => `Du svarade: ${ord}`,
  konsekvens: (n: number) =>
    n >= 4
      ? `Dina svar hängde ihop i ${n} av 5 faktorer.`
      : `Dina svar hängde ihop i ${n} av 5 faktorer. Där de inte gjorde det svarade du åt samma håll på ett påstående och dess motsats. I ett skarpt test sänker det profilens tillförlitlighet, så svara utifrån jobbet och första intrycket.`,
  knapp: 'Gör hela testet, 50 påståenden',
  lank: 'Till Inför intervjun',
  meta: (datum: string) => `Smakprovet, 20 påståenden · ${datum}`,
} as const

export const HEM = {
  omskrivning: {
    rubrik: (fraga: FragaId) => `Skriv om svaret om ${FRAGOR[fraga].bestamd}`,
    text: (level: number, nar: string, missingKind: string, fraga: FragaId) =>
      `Du fick ${level} av 5 ${nar}. ${storBokstav(saknadesFras(missingKind, fraga))} saknades, och det är det lättaste att lägga till.`,
    knapp: 'Skriv om svaret',
  },
  helaTestet: {
    rubrik: 'Gör hela personlighetstestet',
    text: 'Smakprovet gav en riktning. Hela testet ger profilen rekryteraren jämför med, och det ingår.',
    knapp: 'Starta testet',
  },
  senare: 'Senare',
  /**
   * Träningsfokus: Träningspaketet utan CV (ägarens beslut 2026-09-24).
   * Omskrivningen och hela testet återanvänder texterna ovan.
   */
  traning: {
    rad: `Du har ${paketNamnForScope('tester')}, så vi börjar med träningen.`,
    nyFraga: {
      rubrik: (fraga: FragaId) => `Öva på "${FRAGOR[fraga].text.replace(/\.$/, '')}"`,
      text: (fraga: FragaId) => FRAGOR[fraga].beskrivning,
      knapp: 'Svara på frågan',
    },
    test: {
      forstaRubrik: 'Gör ditt första rekryteringstest',
      forstaText: 'Logiktestet på grundnivå visar var du står innan det skarpa testet från arbetsgivaren kommer.',
      rubrik: (titel: string) => `Nästa nivå: ${titel.charAt(0).toLowerCase()}${titel.slice(1)}`,
      text: 'Samma typ av test, ett steg svårare, så att det skarpa testet inte blir första gången du möter nivån.',
      knapp: 'Starta testet',
    },
    cvLank: 'Vill du börja med CV:t i stället?',
  },
  aktivitet: {
    prov: (fraga: FragaId, level: number) => `Du övade på frågan om ${FRAGOR[fraga].bestamd}, ${level} av 5.`,
    provUnder: (missingKind: string, fraga: FragaId) => `${storBokstav(saknadesFras(missingKind, fraga))} saknades.`,
    skrivOm: 'Skriv om',
    oppna: 'Öppna',
    profil: 'Du gjorde personlighetsprovet.',
    profilUnder: (rubrik: string) => `${rubrik}. Hela testet ingår.`,
    profilLank: 'Gör hela testet',
  },
} as const

/** 404 under /dashboard/intervju: annan användares token, borttaget eller utgånget prov. */
export const SAKNAS = {
  eyebrow: 'Inför intervjun',
  titel: 'Det här provet finns inte',
  text: 'Länken leder till ett prov som har tagits bort eller hör till ett annat konto.',
  lankHubb: 'Till Inför intervjun',
  lankHem: 'Till hemskärmen',
} as const
