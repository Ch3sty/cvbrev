/**
 * Intervjun hör till den sökta tjänsten (F6): intervjuer på gång, "Hur gick
 * intervjun?" och förberedelsen på tjänstens sida. Klientsäker och ren.
 */
import { FRAGA_ORDNING, FRAGOR, type FragaId } from '@/components/artiklar/intervjuprov/fragor'
import { NIVA_ETIKETTER } from '@/components/artiklar/intervjuprov/intervjuprov-copy'
import { saknadesFras, type ProvSammanfattning } from '@/lib/intervju/nasta'
import type { BrevKrav } from '@/lib/letters/brevmall/typer'
import { dagFor, dagarMellan, idagSv, klockslag, langDag, plusDagar, veckodagNamn } from './datum'
import { skaSattaTiden } from './lage'
import type { Dag, FragaLage, Forberedelse, IntervjuLage, TjanstLage } from './typer'

/* --------------------------------------------------- intervjuer på gång */

export interface IntervjuPaGang {
  id: string
  company: string
  jobTitle: string
  bokstaver: string
  lage: IntervjuLage
  tid: string | null
  harKlockslag: boolean
  plats: string | null
  dag: Dag | null
  /** Dagar till intervjun (0 = i dag), null utan tid eller när den passerat. */
  dagarKvar: number | null
  /** Raden under namnet: "Tisdag 24 november 10.00, om 3 dagar". */
  text: string
  /** Händelsen som bär tiden, för "Ändra tid". */
  handelseId: string | null
}

const stor = (s: string) => s.charAt(0).toLocaleUpperCase('sv-SE') + s.slice(1)

function narRad(dag: Dag, tid: string | null): string {
  const kl = klockslag(tid)
  return `${stor(veckodagNamn(dag))} ${langDag(dag)}${kl ? ` ${kl}` : ''}`
}

function omDagar(n: number): string {
  if (n === 0) return 'i dag'
  if (n === 1) return 'i morgon'
  return `om ${n} dagar`
}

/** Texten under namnet i "Intervjuer på gång" och listan. Beror aldrig på `tyst`. */
export function intervjuText(t: TjanstLage, idag: Dag): string {
  const i = t.intervju
  if (!i) return ''
  switch (i.lage) {
    case 'bokad': {
      const dag = i.dag as Dag
      return `${narRad(dag, i.tid)}, ${omDagar(dagarMellan(idag, dag))}`
    }
    case 'hur_gick':
      return `Intervjun var ${veckodagNamn(i.dag as Dag)} ${langDag(i.dag as Dag)}. Hur gick den?`
    case 'utan_tid':
      return skaSattaTiden(i, idag) && i.kalladDag
        ? `Kallad till intervju den ${langDag(i.kalladDag)}. Sätt tiden, så påminner vi före intervjun.`
        : 'Kallad till intervju. Sätt tiden när du vet den.'
    case 'vantar_besked':
      if (t.status === 'trial_work_completed') {
        return i.dag ? `Provjobb genomfört ${langDag(i.dag)}. Väntar på besked.` : 'Provjobb genomfört. Väntar på besked.'
      }
      return i.dag ? `Intervju genomförd ${langDag(i.dag)}. Väntar på besked.` : 'Intervju genomförd. Väntar på besked.'
  }
}

/** Är momentet ett provjobb (sorten, annars statusen)? */
function arProvjobb(t: Pick<TjanstLage, 'foljUppTyp' | 'status'>): boolean {
  return t.foljUppTyp === 'provjobb' || (t.foljUppTyp === null && t.status === 'trial_work_completed')
}

/**
 * Ordet för momentet i rummets texter (byggspec 2.3): `stor` "Intervjun" eller
 * "Provjobbet", `liten` "intervjun" eller "provjobbet".
 */
export function momentOrd(t: Pick<TjanstLage, 'foljUppTyp' | 'status'>): { stor: string; liten: string } {
  return arProvjobb(t) ? { stor: 'Provjobbet', liten: 'provjobbet' } : { stor: 'Intervjun', liten: 'intervjun' }
}

/** Dagen för momentet: intervjudagen, och senaste aktivitet om den saknas (ska inte hända). */
export function momentDag(t: Pick<TjanstLage, 'intervju' | 'senasteAktivitet'>): Dag {
  return t.intervju?.dag ?? t.senasteAktivitet
}

/** Raden för en tyst tjänst efter intervju eller provjobb: "Intervjun var den 20 november. Fråga när du kan vänta besked." */
export function beskedText(t: TjanstLage): string {
  return `${momentOrd(t).stor} var den ${langDag(momentDag(t))}. Fråga när du kan vänta besked.`
}

/**
 * "Intervjuer på gång" överst i Inför intervjun: alla tjänster i
 * intervjusteget (kallade, med eller utan tid, och genomförda som väntar
 * besked). "Hur gick intervjun?" först, sedan bokade efter tid, sedan utan
 * tid, sist de som väntar besked.
 */
export function intervjuerPaGang(tjanster: readonly TjanstLage[], nu: Date = new Date()): IntervjuPaGang[] {
  const idag = idagSv(nu)
  const ordning: Record<IntervjuLage, number> = { hur_gick: 0, bokad: 1, utan_tid: 2, vantar_besked: 3 }
  return tjanster
    .filter((t) => t.station === 'intervju' && t.intervju)
    .map((t) => {
      const i = t.intervju!
      return {
        id: t.id,
        company: t.company,
        jobTitle: t.jobTitle,
        bokstaver: t.bokstaver,
        lage: i.lage,
        tid: i.tid,
        harKlockslag: i.harKlockslag,
        plats: i.plats,
        dag: i.dag,
        dagarKvar: i.lage === 'bokad' && i.dag ? dagarMellan(idag, i.dag) : null,
        text: intervjuText(t, idag),
        handelseId: i.handelseId,
      }
    })
    .sort((a, b) => {
      if (ordning[a.lage] !== ordning[b.lage]) return ordning[a.lage] - ordning[b.lage]
      return (a.tid ?? '').localeCompare(b.tid ?? '')
    })
}

/** En tjänst att välja i arket "När är intervjun?" (byggspec 9.6). */
export interface ValbarForIntervju {
  id: string
  company: string
  jobTitle: string
  bokstaver: string
  appliedAt: Dag
}

/**
 * Tjänsterna arket "När är intervjun?" erbjuder: öppna tjänster vid stationen
 * Sökt (sökta och obesvarade), senast sökt först. Kallade, genomförda,
 * erbjudanden och avslutade är inte med.
 */
export function valbaraForIntervju(tjanster: readonly TjanstLage[]): ValbarForIntervju[] {
  return tjanster
    .filter((t) => !t.avslutad && t.station === 'sokt')
    .map((t) => ({ id: t.id, company: t.company, jobTitle: t.jobTitle, bokstaver: t.bokstaver, appliedAt: t.appliedAt }))
    .sort((a, b) => b.appliedAt.localeCompare(a.appliedAt))
}

/**
 * Dagen "Intervju genomförd" loggas på när användaren svarar "Den är
 * genomförd": intervjudagen, aldrig i framtiden.
 */
export function genomfordDag(tid: string | null, nu: Date = new Date()): Dag {
  const idag = idagSv(nu)
  const dag = dagFor(tid)
  return dag && dag <= idag ? dag : idag
}

/** Dagen "Hur gick intervjun?" visas från: dagen efter intervjun. */
export function hurGickFran(tid: string): Dag | null {
  const dag = dagFor(tid)
  return dag ? plusDagar(dag, 1) : null
}

/* ------------------------------------------------------- förberedelsen */

function betygOrd(niva: number): string | null {
  return (NIVA_ETIKETTER as Record<number, string>)[niva] ?? null
}

/** Senaste provet per fråga (proven nyast först, som hamtaProv ger dem). */
export function senastePerFraga(prov: readonly ProvSammanfattning[]): Map<FragaId, ProvSammanfattning> {
  const ut = new Map<FragaId, ProvSammanfattning>()
  for (const p of prov) if (!ut.has(p.question)) ut.set(p.question, p)
  return ut
}

/**
 * Förberedelsen på tjänstens sida: de sju frågorna med senaste betyget per
 * fråga (bara det som finns lagrat), lägst betyg först, sedan de ej övade i
 * rekommenderad ordning. Kraven ur det kopplade brevet när det har några.
 *
 * kravMedTraffar: brevets krav med träffarna omräknade (kravForBrev), eller
 * null när brevet saknas eller inte har krav.
 */
export function forberedelse(
  prov: readonly ProvSammanfattning[],
  kravMedTraffar: readonly BrevKrav[] | null
): Forberedelse {
  const senaste = senastePerFraga(prov)
  const fragor: FragaLage[] = FRAGA_ORDNING.map((fraga) => {
    const p = senaste.get(fraga)
    return {
      fraga,
      kort: FRAGOR[fraga].kort,
      betyg: p ? p.level : null,
      betygOrd: p ? betygOrd(p.level) : null,
      saknades: p && p.level < 5 && p.missingKind ? saknadesFras(p.missingKind, fraga) : null,
      datum: p ? p.createdAt : null,
      token: p ? p.token : null,
    }
  })
  const ovade = fragor.filter((f) => f.betyg !== null).sort((a, b) => (a.betyg as number) - (b.betyg as number))
  const ejOvade = fragor.filter((f) => f.betyg === null)
  const lagst = ovade[0]
  const nastaFraga: FragaId =
    lagst && (lagst.betyg as number) <= 3 ? lagst.fraga : ejOvade[0]?.fraga ?? lagst?.fraga ?? FRAGA_ORDNING[0]

  const krav = kravMedTraffar && kravMedTraffar.length > 0 ? kravMedTraffar.map((k) => ({ krav: k.krav, harSvar: !!k.citat })) : null
  return {
    fragor: [...ovade, ...ejOvade],
    ovade: ovade.length,
    nastaFraga,
    krav,
    kravMedSvar: krav ? krav.filter((k) => k.harSvar).length : 0,
  }
}

/** Antal av de sju frågorna som övats minst en gång. */
export function antalOvadeFragor(prov: readonly ProvSammanfattning[]): number {
  return senastePerFraga(prov).size
}
