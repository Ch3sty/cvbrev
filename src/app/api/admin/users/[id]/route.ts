/**
 * En enskild anvandare, ur adminens synvinkel.
 *
 *   PATCH  /api/admin/users/[id]   ger premium
 *   DELETE /api/admin/users/[id]   raderar kontot permanent
 *
 * Bada kraver super_admin, och bada vagrar rora adminens eget konto: en admin
 * som raderar sig sjalv laser ut sig ur adminen, och det gar inte att angra.
 *
 * Om premium-tilldelningen. Den gamla rutten skrev rakt pa profiles med
 * premium_until = nu plus N dagar och premium_source = 'admin'. Bada var fel:
 *
 * 1. Den kapade befintlig tid. Ett konto med 40 dagar kvar som fick 7 dagar
 *    till hade darefter 7, inte 47.
 * 2. Den skrev premium_source aven pa konton med levande prenumeration.
 *    Stripe-webhookens prenumerationsgren nollar da premium_until nasta gang
 *    den kor, vilket gor att den betalande tappar sin tid utan att nagon ror
 *    nagot.
 *
 * Darfor gar tilldelningen genom grantPremiumDays, som raknar fran
 * max(nu, premium_until), later premium_source vara pa levande
 * prenumerationer och bokfor i premium_grants sa att tidslinjen visar vad
 * adminen gjorde. Obegransat har ingen slutdag och skrivs direkt, eftersom det
 * inte ar ett antal dagar.
 */
import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/admin/requireSuperAdmin'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { grantPremiumDays } from '@/lib/stripe/grantPremiumDays'

export const dynamic = 'force-dynamic'

/** Taket pa en enskild tilldelning. Tio ar ar i praktiken obegransat. */
const MAX_DAGAR = 3650

interface PatchBody {
  action?: 'grant_premium'
  /** Antal dagar, eller 'unlimited' for premium utan slutdatum. */
  premiumDays?: number | 'unlimited'
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params

    if (!targetUserId) {
      return NextResponse.json({ error: 'User ID saknas' }, { status: 400 })
    }

    const auth = await requireSuperAdmin()
    if (!auth.ok) return auth.response

    if (targetUserId === auth.userId) {
      return NextResponse.json(
        { error: 'Du kan inte ändra ditt eget konto härifrån' },
        { status: 400 }
      )
    }

    const body: PatchBody = await request.json()

    if (body.action !== 'grant_premium') {
      return NextResponse.json(
        { error: `Okänd action: ${body.action ?? 'saknas'}` },
        { status: 400 }
      )
    }

    const { premiumDays } = body
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

    const adminClient = getSupabaseAdmin()

    const { data: profil } = await adminClient
      .from('profiles')
      .select('id')
      .eq('id', targetUserId)
      .maybeSingle()

    if (!profil) {
      return NextResponse.json({ error: 'Kontot finns inte' }, { status: 404 })
    }

    if (obegransat) {
      // Obegransat ar inte ett antal dagar och gar darfor inte genom
      // grantPremiumDays. premium_until null betyder "utan slutdatum".
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (adminClient.from('profiles') as any)
        .update({
          subscription_tier: 'premium',
          premium_until: null,
          premium_source: 'admin',
          updated_at: new Date().toISOString(),
        })
        .eq('id', targetUserId)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        action: 'grant_premium',
        premiumUntil: null,
        message: 'Kontot har premium utan slutdatum.',
      })
    }

    // Unikt event-id per tilldelning, sa att idempotensspärren i
    // premium_grants inte slar ihop tva olika admin-handlingar.
    const eventId = `admin_${targetUserId}_${Date.now()}`

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resultat = await grantPremiumDays(adminClient as any, {
      userId: targetUserId,
      days: premiumDays as number,
      stripeEventId: eventId,
      source: 'admin',
    })

    if (!resultat.granted) {
      return NextResponse.json(
        {
          error:
            resultat.reason === 'no_profile'
              ? 'Kontot finns inte'
              : 'Tilldelningen var redan bokförd',
        },
        { status: resultat.reason === 'no_profile' ? 404 : 409 }
      )
    }

    return NextResponse.json({
      success: true,
      action: 'grant_premium',
      premiumUntil: resultat.premiumUntil,
      message: `Paketet förlängt med ${premiumDays} ${
        premiumDays === 1 ? 'dag' : 'dagar'
      }.`,
    })
  } catch (error) {
    console.error('Error in PATCH /api/admin/users/[id]:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Ett oväntat fel uppstod',
      },
      { status: 500 }
    )
  }
}

/**
 * Tar bort en anvandare permanent. Raderingen av auth-anvandaren kaskaderar
 * via foreign keys till profiles, cv_texts, letters och allt annat som har
 * ON DELETE CASCADE.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params

    if (!targetUserId) {
      return NextResponse.json({ error: 'User ID saknas' }, { status: 400 })
    }

    const auth = await requireSuperAdmin()
    if (!auth.ok) return auth.response

    const adminClient = getSupabaseAdmin()

    if (targetUserId === auth.userId) {
      return NextResponse.json(
        { error: 'Du kan inte ta bort ditt eget konto härifrån' },
        { status: 400 }
      )
    }

    const { error: deleteError } = await adminClient.auth.admin.deleteUser(
      targetUserId
    )

    if (deleteError) {
      console.error('Error deleting user:', deleteError)
      return NextResponse.json(
        { error: deleteError.message || 'Kunde inte ta bort användaren' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Användaren har tagits bort permanent',
    })
  } catch (error) {
    console.error('Error in DELETE /api/admin/users/[id]:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Ett oväntat fel uppstod',
      },
      { status: 500 }
    )
  }
}
