// src/app/api/email/send-trial-welcome-moz/route.ts
// ===================================================
// API endpoint för att skicka välkomst-email till nya Moz-stil trial users

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { generateTrialWelcomeEmailMoz } from '@/lib/email/trial-welcome-moz'

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
    const { data, error } = await resend.emails.send({
      from: 'Jobbcoach.ai <noreply@jobbcoach.ai>',
      to: [email],
      subject: '🎉 Välkommen till Jobbcoach.ai Premium!',
      html: htmlContent
    })

    if (error) {
      console.error('[SEND TRIAL WELCOME MOZ] Resend error:', error)
      return NextResponse.json({
        error: 'Kunde inte skicka email'
      }, { status: 500 })
    }

    console.log(`[SEND TRIAL WELCOME MOZ] Email sent successfully:`, data)

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
