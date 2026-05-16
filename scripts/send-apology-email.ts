// scripts/send-apology-email.ts
// Skickar ursäktsmail till Josefin (via info@jobbcoach.ai för granskning först)
// Kör med: npx tsx scripts/send-apology-email.ts

import { Resend } from 'resend'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const resend = new Resend(process.env.RESEND_API_KEY)

const PREVIEW_MODE = false // Sätt till false för att skicka till Josefin
const TO_EMAIL = PREVIEW_MODE ? 'info@jobbcoach.ai' : 'josefinelundgren@hotmail.com'

function generateEmailHTML(): string {
  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Angående din registrering på Jobbcoach.ai</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <style type="text/css">table {border-collapse: collapse;} td {padding: 0;}</style>
  <![endif]-->
  <style>
    @media screen and (max-width: 600px) {
      .outer { padding: 20px 16px !important; }
      .hero-pad { padding: 36px 28px !important; }
      .body-pad { padding: 32px 28px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8f8f6; line-height: 1.6;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8f8f6;">
    <tr>
      <td align="center" style="padding: 48px 20px;" class="outer">
        <table width="580" cellpadding="0" cellspacing="0" border="0" style="max-width: 580px; width: 100%;">

          <!-- Logo bar -->
          <tr>
            <td style="padding: 0 0 28px 4px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color: #DC2626; border-radius: 8px; width: 32px; height: 32px; text-align: center; vertical-align: middle;">
                    <span style="color: #ffffff; font-size: 16px; font-weight: 900; line-height: 32px; display: block;">J</span>
                  </td>
                  <td style="padding-left: 10px; vertical-align: middle;">
                    <span style="font-size: 16px; font-weight: 800; color: #112439; letter-spacing: -0.3px;">Jobbcoach.ai</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 2px 16px rgba(0,0,0,0.06);">

              <!-- Hero -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color: #DC2626; padding: 48px 48px 44px;" class="hero-pad">
                    <p style="color: rgba(255,255,255,0.65); font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin: 0 0 16px 0;">Från oss till dig</p>
                    <h1 style="color: #ffffff; font-size: 32px; font-weight: 800; margin: 0 0 16px 0; line-height: 1.2; letter-spacing: -0.5px;">Vi ber om ursäkt, Josefin.</h1>
                    <p style="color: rgba(255,255,255,0.82); font-size: 16px; margin: 0; line-height: 1.65;">Vi hade ett tekniskt problem just när du registrerade dig. Det är nu löst.</p>
                  </td>
                </tr>
              </table>

              <!-- Body -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 44px 48px 48px;" class="body-pad">

                    <p style="color: #112439; font-size: 16px; line-height: 1.8; margin: 0 0 16px 0;">
                      Precis i samband med din registrering misslyckades vår server med att ta emot betalningsbekräftelsen. Ditt konto aktiverades inte som det skulle.
                    </p>
                    <p style="color: #112439; font-size: 16px; line-height: 1.8; margin: 0 0 40px 0;">
                      Felet är nu åtgärdat och ditt konto är fullt aktivt med tillgång till alla premiumfunktioner.
                    </p>

                    <p style="color: #112439; font-size: 15px; font-weight: 700; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.5px;">Som kompensation erbjuder vi</p>

                    <!-- Option 1 -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 10px 0;">
                      <tr>
                        <td style="padding: 18px 22px; background-color: #fef9f9; border-radius: 12px;">
                          <p style="color: #112439; font-size: 15px; font-weight: 700; margin: 0 0 4px 0;">Avsluta utan kostnad</p>
                          <p style="color: #64748b; font-size: 14px; margin: 0; line-height: 1.65;">Vill du inte fortsätta kan du enkelt avsluta under Inställningar på <a href="https://www.jobbcoach.ai" style="color: #DC2626; text-decoration: none; font-weight: 600;">jobbcoach.ai</a>. Inga frågor ställs.</p>
                        </td>
                      </tr>
                    </table>

                    <!-- Option 2 -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 40px 0;">
                      <tr>
                        <td style="padding: 18px 22px; background-color: #fef9f9; border-radius: 12px;">
                          <p style="color: #112439; font-size: 15px; font-weight: 700; margin: 0 0 4px 0;">5 extra gratisdagar</p>
                          <p style="color: #64748b; font-size: 14px; margin: 0; line-height: 1.65;">Vill du ge tjänsten en ärlig chans? Svara på det här mailet så lägger vi på 5 dagar utan kostnad.</p>
                        </td>
                      </tr>
                    </table>

                    <!-- CTA -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 44px 0;">
                      <tr>
                        <td align="center" style="background-color: #DC2626; border-radius: 10px; padding: 0;">
                          <!--[if mso]>
                          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://www.jobbcoach.ai/dashboard" style="height:50px;v-text-anchor:middle;width:220px;" arcsize="12%" strokecolor="#DC2626" fillcolor="#DC2626">
                            <w:anchorlock/>
                            <center style="color:#ffffff;font-family:sans-serif;font-size:15px;font-weight:bold;">Gå till mitt konto &rarr;</center>
                          </v:roundrect>
                          <![endif]-->
                          <!--[if !mso]><!-->
                          <a href="https://www.jobbcoach.ai/dashboard" style="display: block; color: #ffffff; padding: 16px 32px; font-size: 15px; font-weight: 700; text-decoration: none; text-align: center; letter-spacing: -0.1px;">Gå till mitt konto &rarr;</a>
                          <!--<![endif]-->
                        </td>
                      </tr>
                    </table>

                    <!-- Divider -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 28px 0;">
                      <tr><td style="height: 1px; background-color: #f1f5f9;"></td></tr>
                    </table>

                    <p style="color: #64748b; font-size: 14px; line-height: 1.7; margin: 0 0 4px 0;">Har du frågor eller funderingar? Hör av dig till oss på <a href="mailto:support@jobbcoach.ai" style="color: #DC2626; text-decoration: none; font-weight: 600;">support@jobbcoach.ai</a> så hjälper vi dig.</p>
                    <p style="color: #112439; font-size: 14px; font-weight: 700; margin: 16px 0 0 0;">Teamet på Jobbcoach.ai</p>

                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 28px 4px 0;">
              <p style="color: #b0b8c4; font-size: 12px; margin: 0;">
                &copy; 2026 Jobbcoach.ai &nbsp;&middot;&nbsp;
                <a href="https://www.jobbcoach.ai" style="color: #b0b8c4; text-decoration: none;">www.jobbcoach.ai</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

async function main() {
  console.log(PREVIEW_MODE ? '--- FÖRHANDSGRANSKNINGSLÄGE: skickar till info@jobbcoach.ai ---\n' : '--- LIVE: skickar till Josefin ---\n')

  const { data, error } = await resend.emails.send({
    from: 'Jobbcoach.ai <support@jobbcoach.ai>',
    reply_to: 'support@jobbcoach.ai',
    to: [TO_EMAIL],
    subject: 'Angående din registrering på Jobbcoach.ai',
    html: generateEmailHTML(),
  })

  if (error) {
    console.error('Fel vid utskick:', error)
    process.exit(1)
  }

  console.log('Mail skickat! ID:', data?.id)
  console.log('Till:', TO_EMAIL)
  if (PREVIEW_MODE) {
    console.log('\nNär du godkänt mailet, sätt PREVIEW_MODE = false och kör scriptet igen.')
  }
}

main().catch(console.error)
