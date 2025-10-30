/**
 * Fil: src/app/api/bugg-feedback/route.ts
 *
 * Beskrivning:
 * API-endpoint för att skicka buggrapporter och feedback via Resend.
 * Skickar email till support@jobbcoach.ai.
 */

import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface BuggFeedbackRequest {
  type: 'bug' | 'feedback'
  subject: string
  description: string
  urgency?: 'low' | 'medium' | 'high'
  url?: string
}

export async function POST(req: NextRequest) {
  try {
    // Hämta användare
    const cookieStore = await cookies()
    const supabase = createServerClient({ cookies: cookieStore })
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Du måste vara inloggad för att skicka buggrapporter eller feedback.' },
        { status: 401 }
      )
    }

    // Hämta användarens profil för att få namn och email
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single()

    const userEmail = profile?.email || user.email || 'Okänd användare'
    const userName = profile?.full_name || 'Okänd användare'

    // Hämta request body
    const body: BuggFeedbackRequest = await req.json()
    const { type, subject, description, urgency, url } = body

    // Validering
    if (!type || !subject || !description) {
      return NextResponse.json(
        { error: 'Validation error', message: 'Alla obligatoriska fält måste fyllas i.' },
        { status: 400 }
      )
    }

    // Skapa email-innehåll
    const urgencyLabel = urgency === 'high' ? '🔴 HÖG' : urgency === 'medium' ? '🟡 MEDEL' : '🟢 LÅG'
    const typeLabel = type === 'bug' ? '🐛 Buggrapport' : '💡 Feedback'

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${type === 'bug' ? '#ef4444' : '#3b82f6'}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; }
            .field { margin-bottom: 16px; }
            .label { font-weight: 600; color: #475569; margin-bottom: 4px; }
            .value { background: white; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0; }
            .urgency { display: inline-block; padding: 4px 12px; border-radius: 4px; font-weight: 600; font-size: 14px; }
            .urgency-high { background: #fee2e2; color: #991b1b; }
            .urgency-medium { background: #fef3c7; color: #92400e; }
            .urgency-low { background: #d1fae5; color: #065f46; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 14px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">${typeLabel}</h1>
              <p style="margin: 8px 0 0 0; opacity: 0.9;">${subject}</p>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Från användare:</div>
                <div class="value">
                  <strong>${userName}</strong><br>
                  ${userEmail}<br>
                  <small style="color: #64748b;">ID: ${user.id}</small>
                </div>
              </div>

              ${type === 'bug' ? `
              <div class="field">
                <div class="label">Prioritet:</div>
                <div>
                  <span class="urgency urgency-${urgency}">${urgencyLabel}</span>
                </div>
              </div>
              ` : ''}

              ${url ? `
              <div class="field">
                <div class="label">URL:</div>
                <div class="value">
                  <a href="${url}" style="color: #3b82f6; text-decoration: none;">${url}</a>
                </div>
              </div>
              ` : ''}

              <div class="field">
                <div class="label">${type === 'bug' ? 'Beskrivning av buggen:' : 'Feedback:'}</div>
                <div class="value" style="white-space: pre-wrap;">${description}</div>
              </div>

              <div class="footer">
                <p style="margin: 0;">
                  Skickat från <strong>Jobbcoach.ai Dashboard</strong><br>
                  ${new Date().toLocaleString('sv-SE', { dateStyle: 'long', timeStyle: 'short' })}
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    const emailText = `
${typeLabel}: ${subject}

Från: ${userName} (${userEmail})
Användar-ID: ${user.id}

${type === 'bug' ? `Prioritet: ${urgencyLabel}\n` : ''}
${url ? `URL: ${url}\n` : ''}

${type === 'bug' ? 'Beskrivning av buggen:' : 'Feedback:'}
${description}

---
Skickat från Jobbcoach.ai Dashboard
${new Date().toLocaleString('sv-SE', { dateStyle: 'long', timeStyle: 'short' })}
    `

    // Skicka email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Jobbcoach.ai <noreply@jobbcoach.ai>',
      to: ['support@jobbcoach.ai'],
      replyTo: userEmail,
      subject: `${type === 'bug' ? '[BUGG]' : '[FEEDBACK]'} ${subject}`,
      html: emailHtml,
      text: emailText,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { error: 'Email error', message: 'Kunde inte skicka email. Försök igen senare.' },
        { status: 500 }
      )
    }

    // Logga i databasen (valfritt - för att spåra alla rapporter)
    const { error: logError } = await supabase.from('bugg_feedback_log').insert({
      user_id: user.id,
      type,
      subject,
      description,
      urgency: urgency || null,
      url: url || null,
      email_id: data?.id || null,
    })

    if (logError) {
      // Logga felet men låt inte detta stoppa responsen
      console.error('Failed to log to database:', logError)
    }

    return NextResponse.json(
      {
        success: true,
        message: type === 'bug'
          ? 'Buggrapport skickad! Vi återkommer så snart som möjligt.'
          : 'Tack för din feedback! Vi uppskattar att du hjälper oss förbättra tjänsten.'
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('Error in bugg-feedback API:', error)
    return NextResponse.json(
      { error: 'Server error', message: error.message || 'Ett oväntat fel inträffade.' },
      { status: 500 }
    )
  }
}
