/**
 * POST /api/admin/users/bulk
 *
 * Bulkatgarder pa en lista konton:
 *  - action 'delete'         raderar kontona permanent
 *  - action 'grant_premium'  ger premium, valbart antal dagar eller obegransat
 *
 * Kraver super_admin. Svarar med vilka id som lyckades och vilka som inte
 * gjorde det, aldrig bara "klart": en bulkatgard dar tre av femtio fallerade
 * ar inte en lyckad bulkatgard.
 *
 * Premium-tilldelningen gar genom grantPremiumDays, precis som pa
 * users/[id]. Den gamla versionen skrev premium_until = nu plus N dagar rakt
 * pa profiles for hela listan i en update, vilket kapade befintlig tid och
 * skrev premium_source aven pa konton med levande prenumeration. Det senare
 * far Stripe-webhooken att nolla premium_until nasta gang den kor.
 */
import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/admin/requireSuperAdmin'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { grantPremiumDays } from '@/lib/stripe/grantPremiumDays'

export const dynamic = 'force-dynamic'

/** Taket pa en enskild tilldelning. Tio ar ar i praktiken obegransat. */
const MAX_DAGAR = 3650

/** Taket pa en bulkatgard. Fler an sa ar ett skript, inte en handling. */
const MAX_KONTON = 100

interface BulkRequest {
  action: 'delete' | 'grant_premium'
  userIds: string[]
  premiumDays?: number | 'unlimited'
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireSuperAdmin()
    if (!auth.ok) return auth.response

    const adminClient = getSupabaseAdmin()

    const body: BulkRequest = await request.json()
    const { action, userIds, premiumDays } = body

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'userIds måste vara en icke-tom array' },
        { status: 400 }
      )
    }

    if (userIds.length > MAX_KONTON) {
      return NextResponse.json(
        { error: `Max ${MAX_KONTON} användare per bulk-operation` },
        { status: 400 }
      )
    }

    // Adminens eget konto far aldrig ingå: en admin som raderar sig sjalv
    // laser ut sig, och det gar inte att angra.
    if (userIds.includes(auth.userId)) {
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
        success: failed.length === 0,
        action: 'delete',
        succeeded,
        failed,
        message: `${succeeded.length} av ${userIds.length} användare borttagna.`,
      })
    }

    if (action === 'grant_premium') {
      const obegransat = premiumDays === 'unlimited'

      if (
        !obegransat &&
        (typeof premiumDays !== 'number' ||
          !Number.isInteger(premiumDays) ||
          premiumDays < 1 ||
          premiumDays > MAX_DAGAR)
      ) {
        return NextResponse.json(
          {
            error: `premiumDays måste vara ett heltal mellan 1 och ${MAX_DAGAR}, eller "unlimited"`,
          },
          { status: 400 }
        )
      }

      const succeeded: string[] = []
      const failed: { id: string; error: string }[] = []

      for (const id of userIds) {
        try {
          if (obegransat) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (adminClient.from('profiles') as any)
              .update({
                subscription_tier: 'premium',
                premium_until: null,
                premium_source: 'admin',
                updated_at: new Date().toISOString(),
              })
              .eq('id', id)
            if (error) throw new Error(error.message)
          } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const resultat = await grantPremiumDays(adminClient as any, {
              userId: id,
              days: premiumDays as number,
              stripeEventId: `admin_${id}_${Date.now()}`,
              source: 'admin',
            })
            if (!resultat.granted) {
              throw new Error(
                resultat.reason === 'no_profile'
                  ? 'Kontot finns inte'
                  : 'Redan bokförd'
              )
            }
          }
          succeeded.push(id)
        } catch (e) {
          failed.push({
            id,
            error: e instanceof Error ? e.message : 'Okänt fel',
          })
        }
      }

      const langd = obegransat
        ? 'utan slutdatum'
        : `${premiumDays} ${premiumDays === 1 ? 'dag' : 'dagar'}`

      return NextResponse.json({
        success: failed.length === 0,
        action: 'grant_premium',
        succeeded,
        failed,
        message: `${succeeded.length} av ${userIds.length} konton fick premium (${langd}).`,
      })
    }

    return NextResponse.json({ error: `Okänd action: ${action}` }, { status: 400 })
  } catch (error) {
    console.error('Error in POST /api/admin/users/bulk:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Ett oväntat fel uppstod',
      },
      { status: 500 }
    )
  }
}
