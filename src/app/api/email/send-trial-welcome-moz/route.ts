// src/app/api/email/send-trial-welcome-moz/route.ts
// ===================================================
// API endpoint för att skicka välkomst-email till nya Moz-stil trial users

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { generateTrialWelcomeEmailMoz } from '@/lib/email/trial-welcome-moz'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, userId } = await request.json()

    if (!email || !userId) {
      return NextResponse.json({
        error: 'Email och userId krävs'
      }, { status: 400 })
    }

    console.log(`[SEND TRIAL WELCOME MOZ] Sending to: ${email}`)

    // Generate email HTML
    const htmlContent = generateTrialWelcomeEmailMoz(email)

    // Send email via Resend
    const subject = '🎉 Välkommen till Jobbcoach.ai Premium!'

    const { data, error } = await resend.emails.send({
      from: 'Jobbcoach.ai <noreply@jobbcoach.ai>',
      to: [email],
      subject,
      html: htmlContent,
      // Spår D5: samma tags som livscykelmailen så statistiken kan gruppera.
      tags: [
        { name: 'type', value: 'trial_welcome_moz' },
        { name: 'seq', value: 'lifecycle' }
      ]
    })

    if (error) {
      console.error('[SEND TRIAL WELCOME MOZ] Resend error:', error)
      return NextResponse.json({
        error: 'Kunde inte skicka email'
      }, { status: 500 })
    }

    console.log(`[SEND TRIAL WELCOME MOZ] Email sent successfully:`, data)

    // Spår D5: loggas i email_log så mailet syns i admin-statistiken.
    try {
      await (getSupabaseAdmin() as any).from('email_log').insert({
        resend_id: data?.id ?? null,
        user_id: userId,
        email_type: 'trial_welcome_moz',
        feature: 'lifecycle',
        recipient: email,
        subject
      })
    } catch (logError) {
      console.error('[SEND TRIAL WELCOME MOZ] Kunde inte logga i email_log:', logError)
    }

    return NextResponse.json({
      success: true,
      emailId: data?.id
    })

  } catch (error: any) {
    console.error('[SEND TRIAL WELCOME MOZ] Unexpected error:', error)
    return NextResponse.json({
      error: 'Ett oväntat fel uppstod'
    }, { status: 500 })
  }
}
