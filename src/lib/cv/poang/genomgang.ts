/**
 * Genomgången, del för del (poängmodellen version 2).
 *
 * Analys-sidan förklarar varje tappad poäng: de sju delarna i dokumentets
 * ordning, deras poäng och kontrollerna med status och en konkret text om
 * vad som saknas och var. Allt mäts med poängmodellens egen uträkning
 * (raknaDetalj i modell.ts), aldrig på ett annat sätt, så att förklaringen
 * och poängen alltid säger samma sak.
 *
 * Regler:
 *  - En del med full poäng har inga ouppfyllda kontroller. En del där en
 *    kontroll tappar mindre än en halv poäng avrundas upp till full poäng i
 *    modellen; då visas kontrollen som klar, för poängen tappar inget.
 *  - En del med tappad poäng har minst en ouppfylld kontroll med text.
 *  - Enskilda kontroller har inga egna poängtal (delpoängen är bråktal och
 *    avrundas per del).
 *
 * Texterna: du-tilltal, korta, inga tankstreck, svenska facktermer.
 * Klientsäker, rena funktioner.
 */
import type { CVMetadata } from '../cv-metadata'
import { harNiva } from '../sprak'
import type { ArkKontakt } from './kontakt'
import { ord } from './matt'
import {
  CV_LAGOM_MAX,
  CV_LAGOM_MIN,
  KOMPETENS_MAX_ORD,
  KOMPETENSER_LAGOM_MAX,
  KOMPETENSER_LAGOM_MIN,
  PROFIL_LAGOM_MAX,
  PROFIL_LAGOM_MIN,
  PUNKT_MAX_ORD,
  ROLLER_SOM_RAKNAS,
  forstaFelOrdnad,
  gruppFormat,
  rollHarTal,
  rollVerbAndel,
  raknaDetalj,
  type KategoriId,
  type Mattad,
} from './modell'

/** Avsnitten arbetsläget öppnar (samma ord som ArbetsAvsnitt i rum3/flikar.ts). */
export type GenomgangAvsnitt = 'kontakt' | 'profil' | 'erfarenhet' | 'utbildning' | 'kompetenser' | 'sprak'

export type KontrollStatus = 'klar' | 'delvis' | 'saknas'

/** En brist i en kontroll: vad som saknas och var det fylls i. */
export interface Brist {
  text: string
  avsnitt: GenomgangAvsnitt
  /** Rollens plats i CV:ts erfarenhetslista, när bristen gäller en roll. */
  rollIndex?: number
  /** Utbildningens plats i CV:ts lista, när bristen gäller en utbildning. */
  utbildningIndex?: number
}

export interface GenomgangKontroll {
  id: string
  rubrik: string
  status: KontrollStatus
  /** Tom när kontrollen är klar. Kan vara tom också för en ouppfylld kontroll vars brist en annan kontroll redan säger. */
  brister: Brist[]
}

export interface GenomgangDel {
  id: KategoriId
  /** 1 till 7, samma nummer som markeringen på arket. */
  nr: number
  namn: string
  max: number
  /** Delens poäng i dag, heltal. Delarna summerar exakt till totalen. */
  poang: number
  /** Avsnittet "Öppna i CV:t" går till: första bristens, annars delens eget. */
  avsnitt: GenomgangAvsnitt
  /** Posten "Öppna i CV:t" öppnar, när första bristen gäller en roll eller utbildning. */
  post?: number
  kontroller: GenomgangKontroll[]
  /** En upplysning som inte är en brist ("De fem första rollerna räknas."). */
  not?: string
}

const RUBRIK: Record<string, string> = {
  'kontakt.namn': 'Namn',
  'kontakt.epost': 'E-postadress',
  'kontakt.telefon': 'Telefonnummer',
  'kontakt.ort': 'Ort',
  'profil.finns': 'Det finns en personbeskrivning',
  'profil.langd': `Lagom lång, ${PROFIL_LAGOM_MIN} till ${PROFIL_LAGOM_MAX} ord`,
  'profil.roll': 'Den säger vilken roll du har',
  'profil.konkret': 'Något man kan räkna',
  'erfarenhet.finns': 'Minst en roll',
  'erfarenhet.rubrik': 'Titel, arbetsgivare och period',
  'erfarenhet.beskrivning': 'Vad du gjorde i varje roll',
  'erfarenhet.antal': 'Två till åtta punkter per roll',
  'erfarenhet.tal': 'En siffra i varje roll',
  'erfarenhet.verb': 'Punkterna börjar med vad du gjorde',
  'kompetenser.finns': 'Det finns kompetenser',
  'kompetenser.antal': `${KOMPETENSER_LAGOM_MIN} till ${KOMPETENSER_LAGOM_MAX} kompetenser`,
  'kompetenser.korta': 'Korta, sökbara termer',
  'utbildning.finns': 'Minst en utbildning',
  'utbildning.namn': 'Namn och skola',
  'utbildning.period': 'År eller period',
  'sprak.finns': 'Språk står med',
  'sprak.niva': 'Nivå på varje språk',
  'format.datum': 'Perioder som går att läsa',
  'format.enhetligt': 'Samma datumformat',
  'format.ordning': 'Senaste rollen först',
  'format.langd': `Lagom längd, ${CV_LAGOM_MIN} till ${CV_LAGOM_MAX} ord`,
  'format.punkter': 'Korta punkter',
}

const EGET_AVSNITT: Record<KategoriId, GenomgangAvsnitt> = {
  kontakt: 'kontakt',
  profil: 'profil',
  erfarenhet: 'erfarenhet',
  kompetenser: 'kompetenser',
  utbildning: 'utbildning',
  sprak: 'sprak',
  format: 'erfarenhet',
}

const TALORD = ['noll', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio', 'elva', 'tolv']
const stor = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const kortat = (s: string, max = 40) => (s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s)

type Roll = Mattad['roller'][number]
type Utb = Mattad['utbildningar'][number]

/** Rollens namn som hon känner igen den: "Säljare, ICA". */
export function rollNamn(r: Roll, i: number): string {
  if (r.titel && r.arbetsgivare) return `${r.titel}, ${r.arbetsgivare}`
  return r.titel || r.arbetsgivare || `Roll ${i + 1}`
}

function utbNamn(u: Utb, i: number): string {
  return u.namn || u.skola || `Utbildning ${i + 1}`
}

const roll = (r: Roll, i: number, text: string): Brist => ({
  text: `${rollNamn(r, i)}: ${text}`,
  avsnitt: 'erfarenhet',
  rollIndex: r.index,
})

/** Bristerna per kontroll, med samma mätning som poängen. */
function brister(id: KategoriId, kontroll: string, m: Mattad): Brist[] {
  const nyckel = `${id}.${kontroll}`
  const R = m.roller.slice(0, ROLLER_SOM_RAKNAS)
  switch (nyckel) {
    case 'kontakt.namn':
      return [{ text: 'Namn saknas.', avsnitt: 'kontakt' }]
    case 'kontakt.epost':
      return [
        {
          text: m.epost ? 'E-postadressen går inte att läsa. Skriv den som namn@exempel.se.' : 'E-postadress saknas.',
          avsnitt: 'kontakt',
        },
      ]
    case 'kontakt.telefon':
      return [
        {
          text: m.telefon ? 'Telefonnumret är för kort. Skriv hela numret med riktnummer.' : 'Telefonnummer saknas.',
          avsnitt: 'kontakt',
        },
      ]
    case 'kontakt.ort':
      return [{ text: 'Ort saknas. Det räcker med staden.', avsnitt: 'kontakt' }]

    case 'profil.finns': {
      const n = ord(m.profil).length
      return [{ text: n === 0 ? 'Du har ingen personbeskrivning.' : `Den är bara ${n} ord. Skriv minst 15.`, avsnitt: 'profil' }]
    }
    case 'profil.langd': {
      const n = ord(m.profil).length
      // Ingen eller en mycket kort personbeskrivning: det säger redan "finns".
      if (n < 15) return []
      return [{ text: `Den är ${n} ord. Lagom är ${PROFIL_LAGOM_MIN} till ${PROFIL_LAGOM_MAX}.`, avsnitt: 'profil' }]
    }
    case 'profil.roll': {
      if (ord(m.profil).length < 5) return []
      const titel = m.titlar[0]
      return [
        {
          text: titel
            ? `Den nämner inte din roll. Skriv till exempel ${titel}.`
            : 'Den nämner inte din roll. Skriv vilket yrke du har eller söker.',
          avsnitt: 'profil',
        },
      ]
    }
    case 'profil.konkret':
      if (ord(m.profil).length < 5) return []
      return [{ text: 'Lägg till något man kan räkna: antal år, kunder eller ett resultat.', avsnitt: 'profil' }]

    case 'erfarenhet.finns':
      return [{ text: 'Du har inga roller i CV:t. Lägg till jobb, praktik eller extrajobb.', avsnitt: 'erfarenhet' }]
    case 'erfarenhet.rubrik':
      return R.flatMap((r, i) => {
        const saknas = [
          ...(r.titel ? [] : ['titel']),
          ...(r.arbetsgivare ? [] : ['arbetsgivare']),
          ...(r.period.tolkbar ? [] : ['period']),
        ]
        if (saknas.length === 0) return []
        const lista = saknas.length === 1 ? saknas[0] : `${saknas.slice(0, -1).join(', ')} och ${saknas[saknas.length - 1]}`
        return [roll(r, i, `saknar ${lista}.`)]
      })
    case 'erfarenhet.beskrivning':
      return R.flatMap((r, i) => (r.pastaenden.length === 0 ? [roll(r, i, 'ingen beskrivning.')] : []))
    case 'erfarenhet.antal':
      return R.flatMap((r, i) => {
        const p = r.pastaenden.length
        if (p === 0 || (p >= 2 && p <= 8)) return []
        return [roll(r, i, `${p === 1 ? 'en punkt' : `${p} punkter`}. Lagom är två till åtta.`)]
      })
    case 'erfarenhet.tal':
      return R.flatMap((r, i) =>
        r.pastaenden.length > 0 && !rollHarTal(r)
          ? [roll(r, i, 'ingen siffra. Skriv hur många, hur mycket eller hur ofta.')]
          : []
      )
    case 'erfarenhet.verb':
      return R.flatMap((r, i) =>
        r.pastaenden.length > 0 && rollVerbAndel(r) < 0.5
          ? [roll(r, i, 'börja punkterna med vad du gjorde, till exempel Ledde eller Ansvarade för.')]
          : []
      )

    case 'kompetenser.finns':
      return [
        {
          text: `Du har inga kompetenser. Lägg till ${KOMPETENSER_LAGOM_MIN} till ${KOMPETENSER_LAGOM_MAX}: system, verktyg, körkort och arbetssätt.`,
          avsnitt: 'kompetenser',
        },
      ]
    case 'kompetenser.antal': {
      const n = m.kompetenser.length
      if (n === 0) return []
      return [{ text: `Du har ${n}. Lagom är ${KOMPETENSER_LAGOM_MIN} till ${KOMPETENSER_LAGOM_MAX}.`, avsnitt: 'kompetenser' }]
    }
    case 'kompetenser.korta': {
      const langa = m.kompetenser.filter((x) => ord(x).length > KOMPETENS_MAX_ORD)
      if (langa.length === 0) return []
      return [
        {
          text: `${langa.length === 1 ? 'En' : langa.length} är längre än fyra ord, till exempel ${kortat(langa[0])}.`,
          avsnitt: 'kompetenser',
        },
      ]
    }

    case 'utbildning.finns':
      return [{ text: 'Du har ingen utbildning i CV:t. Lägg till din högsta, med skola och år.', avsnitt: 'utbildning' }]
    case 'utbildning.namn':
      return m.utbildningar.flatMap((u, i) =>
        u.namn && u.skola
          ? []
          : [
              {
                text: u.namn ? `${u.namn}: skolan saknas.` : `${u.skola}: namnet på utbildningen saknas.`,
                avsnitt: 'utbildning' as const,
                utbildningIndex: u.index,
              },
            ]
      )
    case 'utbildning.period':
      return m.utbildningar.flatMap((u, i) =>
        u.period.tolkbar ? [] : [{ text: `${utbNamn(u, i)}: år saknas.`, avsnitt: 'utbildning' as const, utbildningIndex: u.index }]
      )

    case 'sprak.finns':
      return [{ text: 'Språk saknas. Lägg till dem du kan, med nivå.', avsnitt: 'sprak' }]
    case 'sprak.niva':
      if (m.sprakLage !== 'finns' || m.sprak.length === 0) return []
      return m.sprak
        .filter((l) => !harNiva(l.proficiency))
        .map((l) => ({ text: `${l.language.trim()} saknar nivå.`, avsnitt: 'sprak' as const }))

    case 'format.datum': {
      const ut: Brist[] = [
        ...m.roller.flatMap((r, i) =>
          r.period.tolkbar ? [] : [roll(r, i, 'perioden går inte att tolka. Skriv år, eller pågående.')]
        ),
        ...m.utbildningar.flatMap((u, i) =>
          u.period.tolkbar
            ? []
            : [
                {
                  text: `${utbNamn(u, i)}: perioden går inte att tolka. Skriv år, eller pågående.`,
                  avsnitt: 'utbildning' as const,
                  utbildningIndex: u.index,
                },
              ]
        ),
      ]
      if (ut.length === 0 && m.roller.length === 0 && m.utbildningar.length === 0) {
        return [{ text: 'Lägg till roller och utbildningar med år.', avsnitt: 'erfarenhet' }]
      }
      return ut
    }
    case 'format.enhetligt': {
      const ut: Brist[] = []
      if (gruppFormat(m.roller.map((r) => r.period)) === null) {
        ut.push({ text: 'Skriv rollernas perioder på samma sätt: bara år, eller månad och år.', avsnitt: 'erfarenhet' })
      }
      if (gruppFormat(m.utbildningar.map((u) => u.period)) === null) {
        ut.push({ text: 'Skriv utbildningarnas perioder på samma sätt: bara år, eller månad och år.', avsnitt: 'utbildning' })
      }
      return ut
    }
    case 'format.ordning': {
      const fel = forstaFelOrdnad(m.roller.map((r) => r.period))
      if (fel >= 0) return [{ text: 'Senaste rollen ska stå först.', avsnitt: 'erfarenhet', rollIndex: m.roller[fel].index }]
      // Inga roller med period: det säger redan "Perioder som går att läsa".
      return m.roller.length === 0 ? [{ text: 'Lägg till dina roller, senaste först.', avsnitt: 'erfarenhet' }] : []
    }
    case 'format.langd':
      return [{ text: `CV:t är ${m.totalOrd} ord. Lagom är ${CV_LAGOM_MIN} till ${CV_LAGOM_MAX}.`, avsnitt: 'erfarenhet' }]
    case 'format.punkter': {
      const langa = m.roller.flatMap((r, i) =>
        r.pastaenden.filter((p) => ord(p).length > PUNKT_MAX_ORD).map(() => ({ r, i }))
      )
      if (langa.length === 0) {
        return m.roller.every((r) => r.pastaenden.length === 0)
          ? [{ text: 'Beskriv rollerna i korta punkter.', avsnitt: 'erfarenhet' }]
          : []
      }
      const forsta = langa[0]
      return [
        {
          text:
            langa.length === 1
              ? `En punkt är längre än ${PUNKT_MAX_ORD} ord. Dela den.`
              : `${stor(TALORD[langa.length] ?? String(langa.length))} punkter är längre än ${PUNKT_MAX_ORD} ord. Dela dem.`,
          avsnitt: 'erfarenhet',
          rollIndex: forsta.r.index,
        },
      ]
    }
  }
  return []
}

/**
 * Genomgången för ett CV i kanonisk form, med kontaktuppgifterna som arket
 * visar dem (ark). Sju delar i dokumentets ordning.
 */
export function genomgang(cv: CVMetadata, ark?: ArkKontakt | null): GenomgangDel[] {
  const { m, kategorier } = raknaDetalj(cv, ark)
  return kategorier.map((kat, i) => {
    const full = kat.poang >= kat.max
    const kontroller: GenomgangKontroll[] = kat.kontroller.map((k) => {
      const status: KontrollStatus = full || k.raw >= k.max ? 'klar' : k.raw <= 0 ? 'saknas' : 'delvis'
      return {
        id: k.id,
        rubrik: RUBRIK[`${kat.id}.${k.id}`] ?? k.text,
        status,
        brister: status === 'klar' ? [] : brister(kat.id, k.id, m),
      }
    })
    const forsta = kontroller.find((k) => k.brister.length > 0)?.brister[0]
    const post =
      forsta?.avsnitt === 'erfarenhet' ? forsta.rollIndex : forsta?.avsnitt === 'utbildning' ? forsta.utbildningIndex : undefined
    return {
      id: kat.id,
      nr: i + 1,
      namn: kat.namn,
      max: kat.max,
      poang: kat.poang,
      avsnitt: forsta?.avsnitt ?? EGET_AVSNITT[kat.id],
      ...(typeof post === 'number' ? { post } : {}),
      kontroller,
      ...(kat.id === 'erfarenhet' && m.roller.length > ROLLER_SOM_RAKNAS ? { not: 'De fem första rollerna räknas.' } : {}),
    }
  })
}

/** Delarna som har poäng kvar. */
export function delarMedPoangKvar(delar: readonly GenomgangDel[]): GenomgangDel[] {
  return delar.filter((d) => d.poang < d.max)
}
