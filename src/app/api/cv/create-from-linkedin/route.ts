import { PAKETRADER } from '@/components/paywall/paywall-copy'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { getCvGrans } from '@/lib/supabase/premiumAccess'
import type { CVMetadata } from '@/lib/cv/cv-metadata'
import { formatCVMetadataAsText } from '@/lib/linkedin/linkedin-to-cv-converter'
import { arPlatshallareNamn, arPlatshallareTelefon, arPlatshallareTitel } from '@/lib/profile/dokumentKontakt'
import { arTomEllerPlatshallare } from '@/lib/profile/dokumentEpost'

export async function POST(req: NextRequest) {
  try {
    const { userId, cvData, source } = await req.json() as {
      userId: string
      cvData: CVMetadata
      source: string
    }

    // Get current user
    const cookieStore = await cookies()
    const supabase = createServerClient({ cookies: cookieStore })
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user || user.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Kvotvalidering, samma policy som /api/cv/upload och /api/cv/save-improved.
    // Behörigheten läses via premiumAccess så att engångsköp i premium_grants
    // och admin räknas, inte bara profiles.subscription_tier.
    const { harBetalt, maxCvs } = await getCvGrans(supabase, userId)
    const subscriptionTier = harBetalt ? 'premium' : 'free'

    const { count: cvCount } = await supabase
      .from('cv_texts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)

    if ((cvCount || 0) >= maxCvs) {
      return NextResponse.json(
        {
          error: 'CV limit reached',
          message:
            subscriptionTier === 'free'
              ? PAKETRADER.cvGrans(maxCvs)
              : `Du har nått din gräns på ${maxCvs} CV:n. Ta bort ett gammalt CV för att skapa ett nytt.`,
          quota_exceeded: true,
          subscription_tier: subscriptionTier,
        },
        { status: 403 }
      )
    }

    // Platshållare sparas aldrig, även om en äldre klient skickar dem. Tomma
    // fält fylls från profilen när dokumentet skapas (dokumentKontakt.ts).
    if (cvData?.personalInfo) {
      const pi = cvData.personalInfo
      if (arPlatshallareNamn(pi.fullName)) pi.fullName = ''
      if (arTomEllerPlatshallare(pi.email)) pi.email = ''
      if (pi.phone !== undefined && arPlatshallareTelefon(pi.phone)) pi.phone = ''
      if (arPlatshallareTitel(pi.title)) pi.title = ''
    }

    // Create CV in database (save to cv_texts table)
    const timestamp = Date.now()
    const formattedDate = new Date().toLocaleDateString('sv-SE')

    const { data: cv, error: cvError } = await supabase
      .from('cv_texts')
      .insert({
        user_id: userId,
        file_name: `LinkedIn CV ${formattedDate}`,
        original_file_path: `linkedin/${userId}/${timestamp}.json`,
        cv_text: formatCVMetadataAsText(cvData),
        structured_data: cvData,
        text_extraction_failed: false
      })
      .select()
      .single()

    if (cvError) {
      console.error('Error creating CV:', cvError)
      return NextResponse.json(
        { error: 'Failed to create CV' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      cvId: cv.id,
      cv
    })

  } catch (error) {
    console.error('Error in create-from-linkedin:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
