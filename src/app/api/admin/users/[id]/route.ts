/**
 * DELETE /api/admin/users/[id]
 *
 * Tar bort en anvandare permanent. Endast tillgangligt for super_admin.
 * Anvander Supabase Admin API for att radera auth-anvandaren, vilket
 * kaskaderar via foreign keys till alla relaterade tabeller (profiles,
 * cv_texts, letters, etc.) som har ON DELETE CASCADE.
 */
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params

    if (!targetUserId) {
      return NextResponse.json({ error: 'User ID saknas' }, { status: 400 })
    }

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

    // Skydda mot self-delete
    if (targetUserId === user.id) {
      return NextResponse.json(
        { error: 'Du kan inte ta bort ditt eget konto härifrån' },
        { status: 400 }
      )
    }

    // Ta bort auth-anvandaren - det kaskaderar till profiles via FK
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
        error:
          error instanceof Error
            ? error.message
            : 'Ett oväntat fel uppstod',
      },
      { status: 500 }
    )
  }
}
