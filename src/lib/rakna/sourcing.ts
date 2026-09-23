/**
 * Sourcingtratten: hur många riktade kontakter som krävs för ett antal
 * anställningar, givet kanalkvalitet (svarsfrekvensspann ur LinkedIns
 * InMail-benchmarks) och trattens senare steg. Schabloner, tydligt
 * deklarerade: egna kanaldata slår alltid dessa.
 *
 * Används av kalkylatorn på /rakna-ut/sourcing och av MDX-komponenten i
 * insikten, så att båda räknar exakt lika.
 */
import { hamta, heltalMellan, type Parametrar, type Sok } from './sok'
import type { Sammanfattning } from './typer'

export const KANALER = [
  { id: 'mass', label: 'Massutskick, generiskt', beskrivning: 'samma text till många', svarsfrekvens: 0.08 },
  { id: 'riktat', label: 'Riktat och personligt', beskrivning: 'under 400 tecken, individuellt', svarsfrekvens: 0.2 },
  { id: 'pool', label: 'Kandidatpool med samtycke', beskrivning: 'kandidaten har valt att vara sökbar', svarsfrekvens: 0.35 },
] as const

export type KanalId = (typeof KANALER)[number]['id']

export interface SourcingIndata {
  kanal: KanalId
  anstallningar: number
  /** Procent av svaren som blir intervju. */
  svarTillIntervju: number
  /** Procent av intervjuerna som blir anställning. */
  intervjuTillAnstallning: number
}

export const SOURCING_STANDARD: SourcingIndata = {
  kanal: 'riktat',
  anstallningar: 1,
  svarTillIntervju: 30,
  intervjuTillAnstallning: 25,
}

export const SOURCING_SPANN = {
  anstallningar: { min: 1, max: 10, steg: 1 },
  svarTillIntervju: { min: 10, max: 60, steg: 5 },
  intervjuTillAnstallning: { min: 10, max: 50, steg: 5 },
} as const

export function lasSourcing(sok: Sok): SourcingIndata {
  const d = { ...SOURCING_STANDARD }
  const k = hamta(sok, 'kanal')
  if (k && KANALER.some((x) => x.id === k)) d.kanal = k as KanalId
  const a = heltalMellan(sok, 'anst', SOURCING_SPANN.anstallningar.min, SOURCING_SPANN.anstallningar.max)
  if (a !== null) d.anstallningar = a
  const s = heltalMellan(sok, 'svar', SOURCING_SPANN.svarTillIntervju.min, SOURCING_SPANN.svarTillIntervju.max)
  if (s !== null) d.svarTillIntervju = s
  const i = heltalMellan(sok, 'intervju', SOURCING_SPANN.intervjuTillAnstallning.min, SOURCING_SPANN.intervjuTillAnstallning.max)
  if (i !== null) d.intervjuTillAnstallning = i
  return d
}

/** `kanal` står alltid med: den är nyckeln som gör en delad länk till en delad vy. */
export function sourcingParametrar(d: SourcingIndata): Parametrar {
  return {
    kanal: d.kanal,
    anst: String(d.anstallningar),
    svar: String(d.svarTillIntervju),
    intervju: String(d.intervjuTillAnstallning),
  }
}

export interface SourcingResultat {
  kanal: (typeof KANALER)[number]
  steg: { label: string; varde: number }[]
  kontakterKravs: number
  perAnstallning: number
}

export function beraknaSourcing(d: SourcingIndata): SourcingResultat {
  const kanal = KANALER.find((k) => k.id === d.kanal) ?? KANALER[1]
  const intervjuerKravs = d.anstallningar / (d.intervjuTillAnstallning / 100)
  const svarKravs = intervjuerKravs / (d.svarTillIntervju / 100)
  const kontakterKravs = Math.ceil(svarKravs / kanal.svarsfrekvens)
  const steg = [
    { label: 'Riktade kontakter', varde: kontakterKravs },
    { label: `Svar (${Math.round(kanal.svarsfrekvens * 100)} % svarsfrekvens)`, varde: Math.ceil(svarKravs) },
    { label: `Intervjuer (${d.svarTillIntervju} % av svaren)`, varde: Math.ceil(intervjuerKravs) },
    { label: `Anställningar (${d.intervjuTillAnstallning} % av intervjuerna)`, varde: d.anstallningar },
  ]
  return { kanal, steg, kontakterKravs, perAnstallning: Math.ceil(kontakterKravs / d.anstallningar) }
}

export const SOURCING_KALLA = 'Schabloner i nivå med LinkedIns InMail-benchmarks'

export function sammanfattaSourcing(d: SourcingIndata, r: SourcingResultat): Sammanfattning {
  return {
    namn: 'Sourcingtratten',
    tal: `~${r.perAnstallning}`,
    enhet: 'riktade kontakter per anställning',
    rad: `${r.kanal.label}, ${d.anstallningar} ${d.anstallningar === 1 ? 'anställning kräver' : 'anställningar kräver'} ${r.kontakterKravs} kontakter`,
    kalla: SOURCING_KALLA,
  }
}
