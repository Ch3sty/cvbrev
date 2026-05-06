/**
 * POST /api/admin/users/bulk
 *
 * Bulk-actions for admin/users:
 *  - action: 'delete'         - tar bort en lista anvandare
 *  - action: 'grant_premium'  - ger premium med valbar varaktighet (dagar eller obegransat)
 *
 * Endast tillgangligt for super_admin. Returnerar list pa lyckade och misslyckade IDs.
 */
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

interface BulkRequest {
  action: 'delete' | 'grant_premium'
  userIds: string[]
  /** For grant_premium: antal dagar eller 'unlimited'. */
  premiumDays?: number | 'unlimited'
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient({ cookies: cookieStore })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Ej behörig' }, { status: 401 })
    }

    const adminClient = getSupabaseAdmin()

    // Verifiera super_admin
    const { data: adminData, error: adminError } = await adminClient
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (
      adminError ||
      !adminData ||
      (adminData as { role: string }).role !== 'super_admin'
    ) {
      return NextResponse.json(
        { error: 'Ej behörig - kräver super_admin' },
        { status: 403 }
      )
    }

    const body: BulkRequest = await request.json()
    const { action, userIds, premiumDays } = body

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'userIds måste vara en icke-tom array' },
        { status: 400 }
      )
    }

    if (userIds.length > 100) {
      return NextResponse.json(
        { error: 'Max 100 användare per bulk-operation' },
        { status: 400 }
      )
    }

    // Skydda mot self-action
    if (userIds.includes(user.id)) {
      return NextResponse.json(
        { error: 'Du kan inte inkludera ditt eget konto i bulk-operationen' },
        { status: 400 }
      )
    }

    if (action === 'delete') {
      const succeeded: string[] = []
      const failed: { id: string; error: string }[] = []

      for (const id of userIds) {
        const { error } = await adminClient.auth.admin.deleteUser(id)
        if (error) {
          failed.push({ id, error: error.message })
        } else {
          succeeded.push(id)
        }
      }

      return NextResponse.json({
        success: true,
        action: 'delete',
        succeeded,
        failed,
        message: `${succeeded.length} av ${userIds.length} användare borttagna.`,
      })
    }

    if (action === 'grant_premium') {
      if (
        premiumDays !== 'unlimited' &&
        (typeof premiumDays !== 'number' || premiumDays < 1)
      ) {
        return NextResponse.json(
          { error: 'premiumDays måste vara ett positivt tal eller "unlimited"' },
          { status: 400 }
        )
      }

      let premiumUntil: string | null = null
      if (premiumDays !== 'unlimited' && typeof premiumDays === 'number') {
        const until = new Date()
        until.setDate(until.getDate() + premiumDays)
        premiumUntil = until.toISOString()
      }

      // Cast till any for att undvika typer-konflikt med genererade Supabase-types
      const { error: updateError } = await (adminClient.from('profiles') as any)
        .update({
          subscription_tier: 'premium',
          premium_until: premiumUntil,
          premium_source: 'admin',
          updated_at: new Date().toISOString(),
        })
        .in('id', userIds)

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        )
      }

      const durationLabel =
        premiumDays === 'unlimited'
          ? 'obegränsad tid'
          : `${premiumDays} ${premiumDays === 1 ? 'dag' : 'dagar'}`

      return NextResponse.json({
        success: true,
        action: 'grant_premium',
        updated: userIds.length,
        message: `${userIds.length} användare uppgraderats till Premium (${durationLabel}).`,
      })
    }

    return NextResponse.json(
      { error: `Okänd action: ${action}` },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error in POST /api/admin/users/bulk:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Ett oväntat fel uppstod',
      },
      { status: 500 }
    )
  }
}
