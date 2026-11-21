/**
 * Mätverktygen bakom läsbarhetspoängen (docs/poangmodell-cv-analys.md).
 *
 * Rena funktioner utan beroenden till datum, slump eller AI. Samma text ger
 * alltid samma mätvärde. Klientsäkra.
 */

/** Platshållare som inläsningen sätter när något saknas. De räknas som tomma. */
const PLATSHALLARE = new Set(
  [
    'okänd titel',
    'okänt företag',
    'okänd roll',
    'period ej angiven',
    'okänd utbildning',
    'okänd institution',
    'ej specificerad',
    'yrkesroll',
    'arbetsgivare',
    'företag',
  ].map((s) => s.toLowerCase())
)

/** Texten trimmad, eller tom sträng om den saknas eller är en platshållare. */
export function falt(v: unknown): string {
  if (typeof v !== 'string') return ''
  const t = v.replace(/\s+/g, ' ').trim()
  if (!t) return ''
  return PLATSHALLARE.has(t.toLowerCase()) ? '' : t
}

/** Orden i en text: allt mellan blanksteg som innehåller en bokstav eller siffra. */
export function ord(text: string): string[] {
  if (!text) return []
  return text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w))
}

/**
 * Påståendena i en rollbeskrivning: varje rad, punkt eller mening för sig.
 * Bara påståenden med minst tre ord räknas, så att lösa ord och rubriker inte
 * blir punkter. Formatet spelar ingen roll: fyra meningar i ett stycke är
 * fyra påståenden, precis som fyra punkter.
 */
export function pastaenden(rader: readonly unknown[]): string[] {
  const ut: string[] = []
  for (const rad of rader) {
    if (typeof rad !== 'string') continue
    for (const del of rad.split(/\n+/)) {
      const utanPunkt = del.replace(/^[\s•·▪●◦*\-–—]+/, '').trim()
      if (!utanPunkt) continue
      for (const mening of utanPunkt.split(/(?<=[.!?])\s+(?=[A-ZÅÄÖ0-9])/)) {
        const m = mening.replace(/\s+/g, ' ').trim()
        if (ord(m).length >= 3) ut.push(m)
      }
    }
  }
  return ut
}

/**
 * Platshållaren som förslagen använder där användaren ska fylla i ett eget
 * tal. Förslag hittar aldrig på siffror (docs/poangmodell-cv-analys.md).
 */
export const PLATSHALLARE_TAL = '[antal]'

const PLATSHALLARE_RE = /\[[^\]\n]{1,30}\]/g

/** Texten utan platshållare inom hakparentes. */
export function utanPlatshallare(text: string): string {
  return text.replace(PLATSHALLARE_RE, ' ')
}

/** Har texten en platshållare som användaren ska fylla i? */
export function harPlatshallare(text: unknown): boolean {
  return typeof text === 'string' && /\[[^\]\n]{1,30}\]/.test(text)
}

/** Talen i en text, normaliserade ("35,5" och "35.5" blir samma). */
export function talIText(text: string): string[] {
  return (utanPlatshallare(text).match(/\d+(?:[.,]\d+)?/g) ?? []).map((t) => String(Number(t.replace(',', '.'))))
}

/**
 * Byter varje tal i ett förslag som inte står någonstans i CV:t mot
 * platshållaren. Ett förslag får aldrig hitta på fakta: siffror som inte
 * finns i rollens text eller i resten av CV:t blir [antal], så att
 * användaren fyller i sin egen siffra.
 */
export function ersattPahittadeTal(text: string, kanda: ReadonlySet<string>): { text: string; ersatta: number } {
  let ersatta = 0
  const ut = text.replace(/(\[[^\]\n]{1,30}\])|\d+(?:[.,]\d+)?/g, (m, platshallare) => {
    if (platshallare) return m
    if (kanda.has(String(Number(m.replace(',', '.'))))) return m
    ersatta++
    return PLATSHALLARE_TAL
  })
  return { text: ut, ersatta }
}

const TALORD =
  /\b(två|tre|fyra|fem|sju|åtta|nio|tio|elva|tolv|tretton|fjorton|femton|sexton|sjutton|arton|nitton|tjugo|trettio|fyrtio|femtio|sextio|hundra|tusen|miljon|miljoner|miljard|miljarder|procent|dubbel|dubbla|dubblade|fördubblade|halverade|halva)\b/i

/**
 * Har påståendet ett tal som säger något: antal, belopp, procent eller tid.
 * Årtal (1950 till 2099) räknas inte, de är datum och inte resultat.
 */
export function harTal(text: string): boolean {
  if (!text) return false
  // En platshållare som [antal] är inget tal: den räknas aldrig.
  const utanAr = utanPlatshallare(text).replace(/\b(19[5-9]\d|20\d{2})\b/g, ' ')
  if (/\d/.test(utanAr)) return true
  return TALORD.test(utanAr)
}

/** Vanliga handlingsverb i svenska CV, i presens, preteritum och supinum. */
const VERB = new Set(
  `
  leder ledde lett ansvarar ansvarade ansvarat utvecklar utvecklade utvecklat arbetar arbetade arbetat
  hanterar hanterade hanterat säljer sålde sålt planerar planerade planerat samordnar samordnade samordnat
  driver drev drivit bygger byggde byggt skapar skapade skapat genomför genomförde genomfört följer följde
  följt handleder handledde handlett utbildar utbildade utbildat stöttar stöttade stöttat inför införde infört
  ökar ökade ökat minskar minskade minskat sänker sänkte sänkt kortar kortade kortat tar tog tagit hjälper
  hjälpte hjälpt ger gav gett gör gjorde gjort säkerställer säkerställde säkerställt förhandlar förhandlade
  förhandlat rekryterar rekryterade rekryterat levererar levererade levererat installerar installerade
  installerat monterar monterade monterat reparerar reparerade reparerat underhåller underhöll underhållit
  kör körde kört lagar lagade lagat städar städade städat vårdar vårdade vårdat dokumenterar dokumenterade
  dokumenterat granskar granskade granskat bokför bokförde bokfört startar startade startat etablerar
  etablerade etablerat effektiviserar effektiviserade effektiviserat förbättrar förbättrade förbättrat
  lanserar lanserade lanserat håller höll hållit deltar deltog deltagit bidrar bidrog bidragit jobbar
  jobbade jobbat sköter skötte skött svarar svarade svarat besvarar besvarade besvarat tar fram tog fram
  coachar coachade coachat budgeterar budgeterade budgeterat analyserar analyserade analyserat rapporterar
  rapporterade rapporterat administrerar administrerade administrerat implementerar implementerade
  implementerat koordinerar koordinerade koordinerat organiserar organiserade organiserat optimerar
  optimerade optimerat strukturerar strukturerade strukturerat förvaltar förvaltade förvaltat
  upphandlar upphandlade upphandlat beställer beställde beställt kartlägger kartlade kartlagt
  tecknar tecknade tecknat förhandlar förbereder förberedde förberett besöker besökte besökt
  instruerar instruerade instruerat introducerar introducerade introducerat informerar informerade
  informerat bemannar bemannade bemannat schemalägger schemalade schemalagt sorterar sorterade sorterat
  packar packade packat plockar plockade plockat lastar lastade lastat lossar lossade lossat
  serverar serverade serverat lagar tillagar tillagade tillagat bakar bakade bakat tvättar tvättade
  stödjer stödde stött assisterar assisterade assisterat vägleder vägledde väglett undervisar
  undervisade undervisat föreläser föreläste föreläst presenterar presenterade presenterat
  programmerar programmerade programmerat designar designade designat testar testade testat
  konstruerar konstruerade konstruerat ritar ritade ritat projekterar projekterade projekterat
  utreder utredde utrett kontrollerar kontrollerade kontrollerat inspekterar inspekterade inspekterat
  åtgärdar åtgärdade åtgärdat felsöker felsökte felsökt övervakar övervakade övervakat
  uppdaterar uppdaterade uppdaterat underhåller vidareutvecklar vidareutvecklade vidareutvecklat
  digitaliserar digitaliserade digitaliserat automatiserar automatiserade automatiserat
  `
    .split(/\s+/)
    .filter(Boolean)
)

/**
 * Börjar påståendet med ett handlingsverb? Ett inledande "jag" hoppas över.
 * Utöver listan räknas verb på -ade, -erade, -erar och -erat (planerade,
 * implementerar, koordinerat).
 */
export function borjarMedVerb(text: string): boolean {
  const w = ord(text.toLowerCase()).map((x) => x.replace(/[^\p{L}-]/gu, ''))
  const forsta = w[0] === 'jag' ? w[1] : w[0]
  if (!forsta) return false
  if (VERB.has(forsta)) return true
  return forsta.length >= 5 && /(ade|erar|erat)$/.test(forsta)
}

/* ---------------------------------------------------------------- perioder */

const MANADER =
  /\b(jan(uari)?|feb(ruari)?|mar(s|ch)?|apr(il)?|maj|may|jun(i|e)?|jul(i|y)?|aug(usti)?|sep(t|tember)?|okt(ober)?|oct(ober)?|nov(ember)?|dec(ember)?)\b/i
const NUMERISK_MANAD = /\b(19[5-9]\d|20\d{2})[-/.](0?[1-9]|1[0-2])\b|\b(0?[1-9]|1[0-2])[-/.](19[5-9]\d|20\d{2})\b/
const AR = /\b(19[5-9]\d|20\d{2})\b/
const PAGAENDE = /(pågående|pagaende|nuvarande|\bnu\b|idag|i dag|tills vidare|present|current|ongoing|now)/i

export type Datumformat = 'ar' | 'manad' | 'blandat'

export interface Period {
  /** Har ett startår och ett slut som går att förstå (år eller pågående). */
  tolkbar: boolean
  startAr: number | null
  /** null när perioden pågår. */
  slutAr: number | null
  pagar: boolean
  format: Datumformat | null
}

function harManad(s: string): boolean {
  return MANADER.test(s) || NUMERISK_MANAD.test(s)
}

/**
 * Tolkar en period ur start och slut. Ett tomt slut betyder att perioden
 * pågår, så som CV-formatet sparar nuvarande jobb. Vi jämför aldrig mot
 * dagens datum: poängen får inte bero på när den räknas.
 */
export function tolkaPeriod(start: unknown, slut: unknown): Period {
  const s = falt(start)
  const e = falt(slut)
  const startMatch = s.match(AR)
  const startAr = startMatch ? Number(startMatch[1]) : null
  let slutAr: number | null = null
  let pagar = false
  let slutOk = false
  if (!e) {
    pagar = true
    slutOk = true
  } else if (PAGAENDE.test(e) && !AR.test(e)) {
    pagar = true
    slutOk = true
  } else {
    const m = e.match(AR)
    if (m) {
      slutAr = Number(m[1])
      slutOk = true
    }
  }
  const tolkbar = startAr !== null && slutOk && (slutAr === null || slutAr >= startAr)
  let format: Datumformat | null = null
  if (tolkbar) {
    const sm = harManad(s)
    const em = slutAr !== null ? harManad(e) : sm
    format = sm && em ? 'manad' : !sm && !em ? 'ar' : 'blandat'
  }
  return { tolkbar, startAr, slutAr, pagar, format }
}

/**
 * Skiljetecknen mellan start och slut i en period: bindestreck med
 * mellanslag, tankstreck med eller utan mellanslag, och orden "till",
 * "till och med", "t.o.m." och engelska "to"/"until" ("2017 till 2019",
 * "mars 2017 t.o.m. juni 2019", "2019 till nu"). Orden kräver mellanslag
 * runt sig, så att de aldrig delar ett ord.
 */
const PERIOD_SKILJE = /\s+(?:till\s+och\s+med|till|t\.\s?o\.\s?m\.?|to|until)\s+|\s+[-–—]\s+|\s*[–—]\s*/i

/** Ett slut som betyder att perioden pågår ("nu", "pågående", "present"). */
export const PAGAENDE_SLUT = /^(pågående|pagaende|nuvarande|nu|idag|i dag|tills vidare|present|current|ongoing|now)$/i

/** Delar en periodsträng som "2014 - pågående" eller "2017 till 2019" i start och slut. */
export function delaPeriod(period: unknown): { start: string; slut: string } {
  const p = falt(period)
  if (!p) return { start: '', slut: '' }
  const delar = p.split(PERIOD_SKILJE)
  if (delar.length > 1 && delar[0].trim()) {
    return { start: delar[0].trim(), slut: delar.slice(1).join(' ').trim() }
  }
  // "2014-2016" och "2014-pågående", men inte "2019-03" (år och månad).
  const m = p.match(/^(.*?\d{4})\s*-\s*((?:19|20)\d{2}\b.*|\p{L}.*)$/u)
  if (m) return { start: m[1].trim(), slut: m[2].trim() }
  return { start: p, slut: '' }
}

/**
 * Start och slut för en post i CVMetadata, där hela perioden kan stå i
 * startdatumet ("2017 till 2019" och inget slut, så som en del inläsningar
 * och äldre sparningar lagt den). Utan slut delas startdatumet med
 * delaPeriod; ett slut som säger att perioden pågår blir tomt (pågående).
 * Står slutet redan för sig ändras ingenting. Ett avslutat jobb blir
 * därmed aldrig pågående bara för att perioden skrivits med "till".
 */
export function startOchSlut(startDate: unknown, endDate: unknown): { start: string; slut: string } | null {
  const s = typeof startDate === 'string' ? startDate.trim() : ''
  const e = typeof endDate === 'string' ? endDate.trim() : ''
  if (!s || e) return null
  const { start, slut } = delaPeriod(s)
  if (!slut || start === s) return null
  return { start, slut: PAGAENDE_SLUT.test(slut) ? '' : slut }
}

/**
 * En post (jobb eller utbildning) vars hela period står i startdatumet får
 * start och slut var för sig (startOchSlut). Används av kanonisktCv och
 * normalizeStructuredData, så att arket och poängen läser perioden lika.
 */
export function medDeladPeriod<T>(post: T): T {
  if (!post || typeof post !== 'object' || Array.isArray(post)) return post
  const o = post as Record<string, unknown>
  const delad = startOchSlut(o.startDate, o.endDate)
  if (!delad) return post
  const ut: Record<string, unknown> = { ...o, startDate: delad.start }
  if (delad.slut) ut.endDate = delad.slut
  else delete ut.endDate
  return ut as T
}

/* ----------------------------------------------------------- kompetenser */

/**
 * Delar en kompetenssträng på vanliga avgränsare och städar delarna. Samma
 * regel som analysflödet använder när det förbättrade CV:t sparas, så att
 * poängen inte ändras av städningen.
 * Exempel: "Kunskaper-Säljteknik-Mötesbokning" blir tre kompetenser,
 * "Ledarskap 3/5" blir "Ledarskap".
 */
export function delaKompetens(raw: unknown): string[] {
  if (!raw || typeof raw !== 'string') return []
  return raw
    .split(/\s*[-–‑•|/;,]\s*/)
    // "och" och "samt" delar bara när båda leden är egna termer: "Truckkort
    // A och B" är en kompetens (B ensamt försvann förut i filtret nedan).
    .flatMap((s) => {
      const leden = s.split(/\s+(?:och|samt)\s+/i)
      return leden.length > 1 && leden.every((l) => l.trim().length >= 3) ? leden : [s]
    })
    .map((s) => s.trim())
    .map((s) => s.replace(/\s*\d+\/\d+(\s*\d+\/\d+)*\s*$/g, '').trim())
    .map((s) => s.replace(/^\(.*\)|\(.*\)$/g, '').trim())
    .filter((s) => s.length >= 2 && s.length <= 60)
}

/** Alla kompetenser i CV:t, delade och utan dubbletter (skiftlägesokänsligt). */
export function kompetenserIcv(skills: unknown): string[] {
  const ut: string[] = []
  const sedda = new Set<string>()
  const lagg = (s: unknown) => {
    for (const del of delaKompetens(s)) {
      const k = del.toLowerCase()
      if (sedda.has(k)) continue
      sedda.add(k)
      ut.push(del)
    }
  }
  if (!Array.isArray(skills)) return ut
  for (const g of skills) {
    if (typeof g === 'string') lagg(g)
    else if (g && typeof g === 'object') {
      const o = g as { skills?: unknown; name?: unknown }
      if (Array.isArray(o.skills)) o.skills.forEach(lagg)
      else if (typeof o.name === 'string') lagg(o.name)
    }
  }
  return ut
}

/**
 * Kompetenslistan städad så som analysflödet sparar den: varje grupp delad
 * och utan dubbletter, tomma grupper borta. Poängen är densamma före och
 * efter städningen (testat i poang.test.ts).
 */
export function stadaKompetenser<T>(skills: T): T {
  if (!Array.isArray(skills)) return skills
  return skills
    .map((g: unknown) => {
      if (g && typeof g === 'object' && Array.isArray((g as { skills?: unknown }).skills)) {
        const sedda = new Set<string>()
        const unika = ((g as { skills: unknown[] }).skills)
          .flatMap((s) => (typeof s === 'string' ? delaKompetens(s) : []))
          .filter((s) => {
            const k = s.toLowerCase()
            if (sedda.has(k)) return false
            sedda.add(k)
            return true
          })
        return { ...(g as object), skills: unika }
      }
      if (typeof g === 'string') return { category: 'Färdigheter', skills: delaKompetens(g) }
      return g
    })
    .filter(
      (g: unknown) =>
        g && typeof g === 'object' && Array.isArray((g as { skills?: unknown }).skills) && (g as { skills: unknown[] }).skills.length > 0
    ) as unknown as T
}
