/**
 * Annonsen i Matchade jobb (F7): skälen i "Därför passar du", faktarutorna,
 * kraven och texten till brevet. Rena funktioner ur annonsens fält, klientsäkra.
 * Testas i __tests__/annons.test.ts.
 */
import { kompetenserEnOchEn, langDag, dagFor, ordtal, type Kompetenser } from '@/lib/jobbsok'
import { relativDatum } from '@/app/dashboard/jobbmatchning/data/match-reasons'
import type { MatchScore } from '@/app/dashboard/jobbmatchning/data/match-score'

type Annons = Record<string, any>

const forsta = (s: string) => s.charAt(0).toLocaleUpperCase('sv-SE') + s.slice(1)

export interface PassarSkal {
  rubrik: string
  text?: string
  /** Kompetenserna en och en: de som finns i CV:t, och de som saknas (bara med kravprofil). */
  kompetenser?: { har: string[]; saknas: string[] }
}

/** Ortens skäl: distans, en vald ort eller CV:ts ort. */
function ortText(label: string, onskade: readonly string[], cvOrt: string | null | undefined): string | undefined {
  const l = label.toLocaleLowerCase('sv-SE')
  if (onskade.some((o) => o.toLocaleLowerCase('sv-SE') === l)) return 'En av orterna du har valt.'
  if (cvOrt && cvOrt.toLocaleLowerCase('sv-SE').includes(l)) return 'Samma ort som i ditt CV.'
  return undefined
}

/**
 * "Därför passar du" i annonsen: roller, kompetenserna en och en, ort. Samma
 * tal som raden (matchgraden ur match-score.ts); kompetenserna ur motorns
 * kompetenserEnOchEn, så att saknad kompetens bara visas när annonsen har en
 * kravprofil.
 */
export function passarSkal(
  annons: Annons,
  cv: { extracted_skills?: string[] | null; extracted_location?: string | null } | null,
  onskadeOrter: readonly string[],
  score: MatchScore
): { skal: PassarSkal[]; kompetenser: Kompetenser } {
  const skal: PassarSkal[] = []
  const titel = String(annons.headline ?? '').trim()

  if (score.roleHits > 0 && score.roleTotal > 0) {
    skal.push(
      score.roleTotal === 1
        ? { rubrik: 'Din roll matchar', text: titel ? `${titel} stämmer med rollen i ditt CV.` : undefined }
        : {
            rubrik: `${score.roleHits} av dina ${score.roleTotal} roller`,
            text: titel
              ? `${titel} stämmer med ${score.roleHits === 1 ? 'en' : ordtal(score.roleHits)} av de ${ordtal(score.roleTotal)} rollerna i ditt CV.`
              : undefined,
          }
    )
  }

  const k = kompetenserEnOchEn(annons, cv)
  if (k.grund === 'kravprofil' && k.traffar > 0) {
    skal.push({
      rubrik: `${k.traffar} av ${k.totalt} kompetenser i ${k.rader[0]?.kalla === 'meriterande' ? 'annonsens önskemål' : 'kravprofilen'}`,
      kompetenser: { har: k.rader.filter((r) => r.iCv).map((r) => r.namn), saknas: k.rader.filter((r) => !r.iCv).map((r) => r.namn) },
    })
  } else if (k.grund === 'annonstext') {
    skal.push({
      rubrik: k.traffar === 1 ? 'En av dina kompetenser nämns i annonsen' : `${forsta(ordtal(k.traffar))} av dina kompetenser nämns i annonsen`,
      kompetenser: { har: k.rader.map((r) => r.namn), saknas: [] },
    })
  }

  if (score.isRemote) skal.push({ rubrik: 'Distans', text: 'Jobbet går att göra hemifrån.' })
  // Orten är bara ett skäl när den är användarens (samma kommun eller en vald ort).
  else if (score.locationLabel && score.parts.location >= 1) skal.push({ rubrik: score.locationLabel, text: ortText(score.locationLabel, onskadeOrter, cv?.extracted_location) })

  if (skal.length === 0) skal.push({ rubrik: 'Liknar din bakgrund' })
  return { skal, kompetenser: k }
}

/** Skälen kort, en rad på telefon: "Din roll, 6 av 7 kompetenser". */
export function skalKort(reasons: readonly string[]): string {
  const korta = reasons.slice(0, 2).map((r, i) => {
    let s = r
      .replace(/^Din roll matchar$/, 'Din roll')
      .replace(/ kompetenser i kravprofilen$/, ' kompetenser')
      .replace(/^1 av dina kompetenser nämns i annonsen$/, '1 kompetens nämns')
      .replace(/ av dina kompetenser nämns i annonsen$/, ' kompetenser nämns')
    // Bara de vanliga orden får liten bokstav mitt i raden; ortnamn behåller sin.
    if (i > 0 && /^(Distans|Din roll|Liknar)/.test(s)) s = s.charAt(0).toLocaleLowerCase('sv-SE') + s.slice(1)
    return s
  })
  return korta.join(', ')
}

/** Annonsens adress till ansökan, och knappens text. */
export function ansokan(annons: Annons): { url: string | null; text: string } {
  const url = annons.application_details?.url || annons.application_url || annons.webpage_url || null
  const viaAf = annons.application_details?.via_af === true
  return { url: typeof url === 'string' ? url : null, text: viaAf ? 'Ansök via Arbetsförmedlingen' : `Ansök hos ${annons.employer?.name || 'arbetsgivaren'}` }
}

/** Platsen: "Ålö AB, Umeå". */
export function arbetsgivareOrt(annons: Annons, distans = false): string {
  const ort = annons.workplace_address?.municipality || annons.workplace_address?.region || null
  return [annons.employer?.name || 'Okänd arbetsgivare', distans ? 'distans' : ort].filter(Boolean).join(', ')
}

/** Faktarutorna: anställningsform, publicerad, lön (annonsens egen text, aldrig ett eget belopp). */
export function faktaRutor(annons: Annons, nu = Date.now()): { varde: string; etikett: string }[] {
  const ut: { varde: string; etikett: string }[] = []
  const form = [annons.employment_type?.label, annons.working_hours_type?.label].filter(Boolean).join(', ')
  if (form) ut.push({ varde: forsta(String(form).toLocaleLowerCase('sv-SE')), etikett: 'Anställningsform' })
  const publ = dagFor(typeof annons.publication_date === 'string' ? annons.publication_date : null)
  if (publ) {
    const rel = relativDatum(annons.publication_date, nu)
    ut.push({ varde: langDag(publ), etikett: rel && rel !== 'i dag' && rel !== 'i går' ? `Publicerad, ${rel}` : `Publicerad${rel ? ` ${rel}` : ''}` })
  }
  if (typeof annons.salary_description === 'string' && annons.salary_description.trim()) {
    ut.push({ varde: annons.salary_description.trim(), etikett: 'Lön, annonsens egen text' })
  }
  return ut
}

const etiketter = (lista: unknown): string[] =>
  Array.isArray(lista) ? lista.map((x: any) => (typeof x?.label === 'string' ? x.label : null)).filter((x): x is string => !!x) : []

/** Krav och meriterande ur annonsens kravprofil, plus de viktiga kraven (erfarenhet, körkort, bil). */
export function kravOchMeriterande(annons: Annons): { krav: string[]; meriterande: string[] } {
  const m = annons.must_have ?? {}
  const n = annons.nice_to_have ?? {}
  const korkort = etiketter(annons.driving_license)
  const krav = [
    ...etiketter(m.education_level),
    ...etiketter(m.education),
    ...etiketter(m.work_experiences).map((x) => `Erfarenhet: ${x}`),
    ...etiketter(m.skills),
    ...etiketter(m.languages),
    ...(annons.experience_required && etiketter(m.work_experiences).length === 0 ? ['Erfarenhet krävs'] : []),
    ...(korkort.length ? [`Körkort: ${korkort.join(', ')}`] : annons.driving_license_required ? ['Körkort krävs'] : []),
    ...(annons.access_to_own_car ? ['Tillgång till egen bil'] : []),
  ]
  const meriterande = [
    ...etiketter(n.education_level),
    ...etiketter(n.education),
    ...etiketter(n.work_experiences).map((x) => `Erfarenhet: ${x}`),
    ...etiketter(n.skills),
    ...etiketter(n.languages),
  ]
  return { krav: [...new Set(krav)], meriterande: [...new Set(meriterande)] }
}

/** Är annonsen publicerad efter att Matchade jobb senast visades? */
export function arNy(annons: Annons, seddaAt: string | null): boolean {
  if (!seddaAt) return false
  const publ = Date.parse(String(annons.publication_date ?? ''))
  const sedd = Date.parse(seddaAt)
  return Number.isFinite(publ) && Number.isFinite(sedd) && publ > sedd
}

/**
 * Annonsens text till brevflödet (prefill i skapa-brev). Samma sammanställning
 * som detaljarket gjorde förut: titel, arbetsgivare, plats, anställningsform,
 * sista dag, krav, meriterande och annonstexten.
 */
export function brevUnderlag(job: Annons): string {
  const parts: string[] = []
  if (job.headline) parts.push(job.headline)
  if (job.employer?.name) parts.push(`Företag: ${job.employer.name}`)
  const plats = [job.workplace_address?.municipality, job.workplace_address?.region, job.workplace_address?.country].filter(Boolean)
  if (plats.length > 0) parts.push(`Plats: ${plats.join(', ')}`)
  if (job.employment_type?.label) parts.push(`Anställningsform: ${job.employment_type.label}`)
  if (job.application_deadline) parts.push(`Sista ansökningsdag: ${new Date(job.application_deadline).toLocaleDateString('sv-SE')}`)

  if (job.must_have) {
    const mh: string[] = []
    if (job.must_have.skills?.length) mh.push(`Kompetenser: ${job.must_have.skills.map((s: any) => s.label).join(', ')}`)
    if (job.must_have.languages?.length) mh.push(`Språk: ${job.must_have.languages.map((l: any) => l.label).join(', ')}`)
    if (job.must_have.work_experiences?.length) mh.push(`Erfarenhet: ${job.must_have.work_experiences.map((e: any) => e.label).join(', ')}`)
    if (job.must_have.education?.length) mh.push(`Utbildning: ${job.must_have.education.map((e: any) => e.label).join(', ')}`)
    if (mh.length > 0) parts.push(`\nKrav (måste):\n- ${mh.join('\n- ')}`)
  }
  if (job.nice_to_have) {
    const nh: string[] = []
    if (job.nice_to_have.skills?.length) nh.push(`Kompetenser: ${job.nice_to_have.skills.map((s: any) => s.label).join(', ')}`)
    if (job.nice_to_have.languages?.length) nh.push(`Språk: ${job.nice_to_have.languages.map((l: any) => l.label).join(', ')}`)
    if (nh.length > 0) parts.push(`\nMeriterande:\n- ${nh.join('\n- ')}`)
  }

  const strip = (html: string) =>
    html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  if (job.description?.text) parts.push(`\nAnnonstext:\n${strip(job.description.text)}`)
  if (job.description?.needs && !job.description?.text) parts.push(`\nVi söker:\n${strip(job.description.needs)}`)
  if (job.description?.company_information) parts.push(`\nOm företaget:\n${strip(job.description.company_information)}`)
  return parts.join('\n\n').trim()
}
