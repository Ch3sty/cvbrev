// src/app/api/email/send-trial-welcome/route.ts
// ================================================
// API route for sending trial welcome emails with login links
// Called by Stripe webhook after successful checkout

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { generateTrialWelcomeHTML, generateTrialWelcomeText } from '@/lib/email/trial-welcome-generator'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, loginUrl, userId } = await request.json()

    // Validate required fields
    if (!email || !loginUrl || !userId) {
      console.error('[TRIAL EMAIL] Missing required fields:', { email: !!email, loginUrl: !!loginUrl, userId: !!userId })
      return NextResponse.json({
        error: 'Missing required fields: email, loginUrl, userId'
      }, { status: 400 })
    }

    console.log(`[TRIAL EMAIL] Sending welcome email to: ${email}`)

    // Extract name from email (before @)
    const userName = email.split('@')[0]

    // Generate email content
    const htmlContent = generateTrialWelcomeHTML({ email, loginUrl, userName })
    const textContent = generateTrialWelcomeText({ email, loginUrl, userName })

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Jobbcoach.ai <noreply@jobbcoach.ai>',
      to: [email],
      subject: '🎉 Välkommen till Jobbcoach.ai Premium – Din 7-dagars gratisperiod har startat!',
      html: htmlContent,
      text: textContent,
      tags: [
        { name: 'category', value: 'trial-welcome' },
        { name: 'user_id', value: userId }
      ]
    })

    if (error) {
      console.error('[TRIAL EMAIL] Resend error:', error)
      return NextResponse.json({
        error: 'Failed to send email',
        details: error
      }, { status: 500 })
    }

    console.log(`[TRIAL EMAIL] Email sent successfully. Message ID: ${data?.id}`)

    return NextResponse.json({
      success: true,
      messageId: data?.id
    })

  } catch (error: any) {
    console.error('[TRIAL EMAIL] Unexpected error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}
