/**
 * Hemskärmens aktivitet som meningar, grupperade per dag
 * (docs/design/analys-visuell-linje-2026-09-22.html, regel 6: rader är
 * innehåll, inte loggar).
 *
 * Samma sju produkttabeller som /api/dashboard/recent-activity läser, men i
 * stället för en rad per händelse ("CV-analys: Senior Projektledare × 4")
 * blir det en mening per slags arbete och dag, med subjekt och verb, och
 * ett nästa steg där det finns ett: "Du gjorde logiktestet, 3 procent rätt.
 * Kör det igen med tid kvar, så ser du mönstren."
 *
 * Anroparen skickar en Supabase-klient bunden till användarens cookies och
 * användarens id. Ingen egen auth-kontroll här.
 */

import { SIMPLE_TEMPLATES } from '@/lib/cv/simple-templates'

export interface AktivitetMening {
  text: string
  /** Andra raden: vad det betyder eller vad man gör härnäst. */
  under?: string
  /** Nästa steg som textlänk. */
  lank?: { text: string; href: string }
}

export interface AktivitetDag {
  /** YYYY-MM-DD, svensk tid. */
  datum: string
  /** "I dag", "I går", "Måndag 15 september". */
  rubrik: string
  meningar: AktivitetMening[]
}

type Rad = { typ: string; dag: string; data: Record<string, unknown> }

const TZ = 'Europe/Stockholm'
const dagAv = (iso: string) => new Intl.DateTimeFormat('sv-SE', { timeZone: TZ }).format(new Date(iso))

const TAL = ['noll', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio']
const talOrd = (n: number) => TAL[n] ?? String(n)
const gangerOrd = (n: number) => (n === 1 ? 'en gång' : `${talOrd(n)} gånger`)
const lista = (namn: string[]) =>
  namn.length <= 1 ? (namn[0] ?? '') : `${namn.slice(0, -1).join(', ')} och ${namn[namn.length - 1]}`

function dagRubrik(datum: string, idag: string, igar: string): string {
  if (datum === idag) return 'I dag'
  if (datum === igar) return 'I går'
  const d = new Date(`${datum}T12:00:00`)
  const s = new Intl.DateTimeFormat('sv-SE', { weekday: 'long', day: 'numeric', month: 'long', timeZone: TZ }).format(d)
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function testNamn(testType: string | null | undefined): string {
  const t = (testType ?? '').toLowerCase()
  const niva = t.includes('expert') ? ' på expertnivå' : t.includes('avancerad') ? ' på avancerad nivå' : ' på grundnivå'
  if (t.includes('verbal')) return `det verbala testet${niva}`
  if (t.includes('numer')) return `det numeriska testet${niva}`
  return `logiktestet${niva}`
}

function mallNamn(id: string): string {
  return SIMPLE_TEMPLATES.find((t) => t.id === id)?.name ?? id
}

/** Meningarna för en dag, i fast ordning: ansökningar, brev, CV, analys, nedladdning, LinkedIn, tester. */
function meningarFor(rader: Rad[]): AktivitetMening[] {
  const av = (typ: string) => rader.filter((r) => r.typ === typ)
  const ut: AktivitetMening[] = []

  const ansok = av('ansokan')
  if (ansok.length === 1) {
    const a = ansok[0].data
    ut.push({
      text: `Du sökte ${a.jobTitle} hos ${a.company}.`,
      under: 'Vi säger till när den varit tyst i två veckor.',
    })
  } else if (ansok.length > 1) {
    const foretag = [...new Set(ansok.map((a) => String(a.data.company)))]
    ut.push({
      text: `Du loggade ${talOrd(ansok.length)} ansökningar.`,
      under: foretag.length <= 3 ? `Hos ${lista(foretag)}.` : `Bland annat hos ${lista(foretag.slice(0, 2))}.`,
    })
  }

  const brev = av('brev')
  if (brev.length === 1) {
    const b = brev[0].data
    ut.push({
      text: b.company ? `Du skrev ett personligt brev till ${b.company}.` : 'Du skrev ett personligt brev.',
      lank: b.id ? { text: 'Öppna brevet', href: `/dashboard/mina-brev/${b.id}` } : undefined,
    })
  } else if (brev.length > 1) {
    ut.push({ text: `Du skrev ${talOrd(brev.length)} personliga brev.`, lank: { text: 'Se breven', href: '/dashboard/mina-brev' } })
  }

  const cv = av('cv')
  const analys = av('analys')
  if (analys.length > 0) {
    const cvNamn = [...new Set(analys.map((a) => String(a.data.namn ?? '')).filter(Boolean))]
    const sparat = cv.map((c) => String(c.data.namn))
    const vad = cvNamn.length <= 1 ? 'ditt CV' : `${talOrd(cvNamn.length)} CV:n`
    ut.push({
      text: `Du analyserade ${vad} ${gangerOrd(analys.length)}${sparat.length ? ` och sparade ${lista(sparat)}` : ''}.`,
      under: cvNamn[0] ? `${cvNamn[0]} har senaste poängen. Den syns under Mina CV.` : 'Poängen syns under Mina CV.',
      lank: { text: 'Se analysen', href: '/dashboard/cv-analys' },
    })
  } else if (cv.length > 0) {
    ut.push({
      text: cv.length === 1 ? `Du sparade ${cv[0].data.namn}.` : `Du sparade ${talOrd(cv.length)} CV:n.`,
      lank: { text: 'Analysera det', href: '/dashboard/cv-analys' },
    })
  }

  const ned = av('nedladdning')
  if (ned.length > 0) {
    const mallar = [...new Set(ned.map((n) => mallNamn(String(n.data.mall))))]
    ut.push({
      text: `Du laddade ner CV:t i ${mallar.length === 1 ? 'mallen' : 'mallarna'} ${lista(mallar)}.`,
      under: ned.length > 1 ? `${talOrd(ned.length).charAt(0).toUpperCase() + talOrd(ned.length).slice(1)} nedladdningar.` : undefined,
    })
  }

  const li = av('linkedin')
  if (li.length > 0) {
    const d = li[0].data.delta as number | null
    ut.push({ text: `Du skrev om LinkedIn-profilen${d && d > 0 ? `, ${d} poäng bättre` : ''}.` })
  }

  const test = av('test')
  if (test.length > 0) {
    const t = test[0].data
    const poang = typeof t.score === 'number' ? `, ${t.score} procent rätt` : ''
    ut.push({
      text: `Du gjorde ${testNamn(t.testType as string)}${poang}.`,
      under: test.length > 1 ? `Och ${talOrd(test.length - 1)} test till samma dag.` : 'Kör det igen med tid kvar, så ser du mönstren.',
      lank: { text: 'Kör igen', href: '/dashboard/tester' },
    })
  }
  return ut
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getAktivitet(supabase: any, userId: string, antalDagar = 3): Promise<AktivitetDag[]> {
  const [brev, analys, cv, linkedin, ned, test, ansok] = await Promise.all([
    supabase.from('letters').select('id, company, job_title, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
    supabase
      .from('cv_analysis_jobs')
      .select('id, display_name, completed_at, created_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(10),
    supabase.from('cv_texts').select('id, file_name, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
    supabase
      .from('linkedin_optimizations')
      .select('id, overall_score_after, overall_score_before, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('formatted_cv_downloads')
      .select('id, template_id, downloaded_at, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('logic_test_v4_sessions')
      .select('id, test_type, score, completed_at')
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(5),
    supabase.from('job_applications').select('id, job_title, company, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
  ])

  const rader: Rad[] = []
  const lagg = (typ: string, iso: string | null | undefined, data: Record<string, unknown>) => {
    if (!iso) return
    rader.push({ typ, dag: dagAv(iso), data })
  }
  for (const r of brev.data ?? []) lagg('brev', r.created_at, { id: r.id, company: r.company })
  for (const r of analys.data ?? []) lagg('analys', r.completed_at ?? r.created_at, { namn: r.display_name })
  for (const r of cv.data ?? []) lagg('cv', r.created_at, { namn: r.file_name || 'ett CV' })
  for (const r of linkedin.data ?? [])
    lagg('linkedin', r.created_at, {
      delta:
        typeof r.overall_score_after === 'number' && typeof r.overall_score_before === 'number'
          ? r.overall_score_after - r.overall_score_before
          : null,
    })
  for (const r of ned.data ?? []) lagg('nedladdning', r.downloaded_at ?? r.created_at, { mall: r.template_id })
  for (const r of test.data ?? []) lagg('test', r.completed_at, { testType: r.test_type, score: r.score })
  for (const r of ansok.data ?? []) lagg('ansokan', r.created_at, { jobTitle: r.job_title, company: r.company })

  const dagar = [...new Set(rader.map((r) => r.dag))].sort().reverse().slice(0, antalDagar)
  const nu = new Date()
  const idag = dagAv(nu.toISOString())
  const igar = dagAv(new Date(nu.getTime() - 86400000).toISOString())
  return dagar
    .map((d) => ({
      datum: d,
      rubrik: dagRubrik(d, idag, igar),
      meningar: meningarFor(rader.filter((r) => r.dag === d)).slice(0, 4),
    }))
    .filter((d) => d.meningar.length > 0)
}
