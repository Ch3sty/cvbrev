/**
 * GET /api/dashboard/recent-activity
 *
 * Returnerar de 5 senaste meningsfulla anvandar-aktiviteterna fran sex
 * konkreta produkttabeller (inte logg-events). Slas ihop, sorteras desc.
 */
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'

export type RecentActivityType =
  | 'brev'
  | 'analys'
  | 'cv'
  | 'linkedin'
  | 'nedladdning'
  | 'test'

export interface RecentActivityItem {
  id: string
  type: RecentActivityType
  title: string
  subtitle?: string
  href?: string
  createdAt: string
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient({ cookies: cookieStore })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ items: [] }, { status: 401 })
    }

    const userId = user.id

    // Sex parallella queries mot konkreta produkttabeller
    const [
      lettersRes,
      cvAnalysisRes,
      cvTextsRes,
      linkedinRes,
      downloadsRes,
      testsRes,
    ] = await Promise.all([
      supabase
        .from('letters')
        .select('id, title, company, job_title, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('cv_analysis_jobs')
        .select('id, result, display_name, completed_at, created_at')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(5),
      supabase
        .from('cv_texts')
        .select('id, file_name, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('linkedin_optimizations')
        .select('id, mode, target_role, overall_score_after, overall_score_before, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('formatted_cv_downloads')
        .select('id, template_id, downloaded_at, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('logic_test_v4_sessions')
        .select('id, test_type, score, completed_at')
        .eq('user_id', userId)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(5),
    ])

    const items: RecentActivityItem[] = []

    // Brev
    for (const row of lettersRes.data || []) {
      const target = (row.company || row.job_title || row.title || '').trim()
      const titleText = target
        ? `Personligt brev till ${target}`
        : 'Personligt brev skapat'
      items.push({
        id: `letter-${row.id}`,
        type: 'brev',
        title: titleText,
        subtitle: row.job_title && row.company ? row.job_title : undefined,
        href: '/dashboard/skapa-brev',
        createdAt: row.created_at,
      })
    }

    // CV-analys (extrahera score fran result-jsonb om mojligt)
    for (const row of cvAnalysisRes.data || []) {
      const r = (row.result as Record<string, unknown> | null) || null
      const score =
        (r?.overall_score as number | undefined) ??
        (r?.score as number | undefined) ??
        (r?.ats_score as number | undefined) ??
        null
      const title = score
        ? `CV-analys: ${score}/100`
        : row.display_name
        ? `CV-analys: ${row.display_name}`
        : 'CV-analys genomförd'
      items.push({
        id: `analysis-${row.id}`,
        type: 'analys',
        title,
        subtitle: row.display_name && score ? row.display_name : undefined,
        href: '/dashboard/cv-analys',
        createdAt: row.completed_at || row.created_at || new Date().toISOString(),
      })
    }

    // CV uppladdat/sparat
    for (const row of cvTextsRes.data || []) {
      items.push({
        id: `cv-${row.id}`,
        type: 'cv',
        title: `Sparat CV: ${row.file_name || 'Namnlost'}`,
        href: '/dashboard/profil/cv',
        createdAt: row.created_at,
      })
    }

    // LinkedIn-optimering
    for (const row of linkedinRes.data || []) {
      const before = row.overall_score_before
      const after = row.overall_score_after
      const delta =
        typeof before === 'number' && typeof after === 'number'
          ? after - before
          : null
      const title =
        delta && delta > 0
          ? `LinkedIn-optimering: +${delta} poäng`
          : after
          ? `LinkedIn-optimering: ${after}/100`
          : row.target_role
          ? `LinkedIn-optimering: ${row.target_role}`
          : 'LinkedIn-optimering klar'
      items.push({
        id: `linkedin-${row.id}`,
        type: 'linkedin',
        title,
        subtitle:
          row.mode === 'target_role' && row.target_role
            ? `Mot ${row.target_role}`
            : undefined,
        href: '/dashboard/linkedin-optimizer',
        createdAt: row.created_at,
      })
    }

    // CV nedladdat
    for (const row of downloadsRes.data || []) {
      items.push({
        id: `download-${row.id}`,
        type: 'nedladdning',
        title: row.template_id
          ? `CV nedladdat: ${row.template_id}`
          : 'CV nedladdat',
        href: '/dashboard/cv-mallar',
        createdAt: row.downloaded_at || row.created_at || new Date().toISOString(),
      })
    }

    // Tester
    for (const row of testsRes.data || []) {
      const testLabel = labelTestType(row.test_type)
      const title = row.score
        ? `${testLabel}: ${row.score}% rätt`
        : `${testLabel}: avklarat`
      items.push({
        id: `test-${row.id}`,
        type: 'test',
        title,
        href: '/dashboard/tester',
        createdAt: row.completed_at,
      })
    }

    // Slå ihop, sortera desc, returnera top 5
    items.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return NextResponse.json({ items: items.slice(0, 5) })
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return NextResponse.json({ items: [] }, { status: 500 })
  }
}

function labelTestType(testType: string | null): string {
  if (!testType) return 'Test'
  if (testType.includes('matrislogik')) return 'Matrislogik'
  if (testType.includes('verbal')) return 'Verbalt resonemang'
  if (testType.includes('numerisk') || testType.includes('numerical'))
    return 'Numeriskt resonemang'
  return 'Test'
}
