import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import type { CVMetadata } from '@/lib/cv/cv-metadata'

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

    // Create CV in database (save to cv_texts table)
    const timestamp = Date.now()
    const formattedDate = new Date().toLocaleDateString('sv-SE')

    const { data: cv, error: cvError } = await supabase
      .from('cv_texts')
      .insert({
        user_id: userId,
        file_name: `LinkedIn CV ${formattedDate}`,
        original_file_path: `linkedin/${userId}/${timestamp}.json`,
        cv_text: JSON.stringify(cvData, null, 2),
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
