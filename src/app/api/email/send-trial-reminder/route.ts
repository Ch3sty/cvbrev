// src/app/api/email/send-trial-reminder/route.ts
// ================================================
// Skickar påminnelse till användare som inte slutförde betalning

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { generateTrialReminderEmail } from '@/lib/email/trial-reminder'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, userId } = await request.json()

    if (!email || !userId) {
      return NextResponse.json({
        error: 'Email och userId krävs'
      }, { status: 400 })
    }

    console.log(`[SEND TRIAL REMINDER] Sending to: ${email}`)

    // Generate resume URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jobbcoach.ai'
    const resumeUrl = `${baseUrl}/trial-signup?resume=${userId}`

    // Generate email HTML
    const htmlContent = generateTrialReminderEmail(email, resumeUrl)

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Jobbcoach.ai <noreply@jobbcoach.ai>',
      to: [email],
      subject: '⏰ Du är nästan klar – Slutför din registrering',
      html: htmlContent
    })

    if (error) {
      console.error('[SEND TRIAL REMINDER] Resend error:', error)
      return NextResponse.json({
        error: 'Kunde inte skicka email'
      }, { status: 500 })
    }

    console.log(`[SEND TRIAL REMINDER] Email sent successfully:`, data)

    return NextResponse.json({
      success: true,
      emailId: data?.id
    })

  } catch (error: any) {
    console.error('[SEND TRIAL REMINDER] Unexpected error:', error)
    return NextResponse.json({
      error: 'Ett oväntat fel uppstod'
    }, { status: 500 })
  }
}
