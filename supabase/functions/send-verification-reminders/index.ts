// Källan hämtades ur produktion 2026-11-21 (funktionen fanns bara driftsatt,
// inte i repot). Det enda som är tillagt är kontrollen av x-cron-secret.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { Resend } from 'npm:resend@4.0.0';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const resend = new Resend(RESEND_API_KEY);
Deno.serve(async (req)=>{
  // SÄKERHET (2026-11-21): bara vår schemalagda körning får anropa funktionen.
  // Gatewayen släpper igenom vilken giltig nyckel som helst, också den publika,
  // och funktionen har ingen egen spärr mot dubbla utskick: den som anropade
  // den flera gånger under ett påminnelsefönster kunde få samma mejl skickat
  // om och om igen till våra användare. Anroparen skickar hemligheten i
  // rubriken x-cron-secret (pg_cron-jobbet läser den ur vault, samma värde
  // som CRON_SECRET).
  const cronHemlighet = Deno.env.get('CRON_SECRET');
  if (!cronHemlighet || req.headers.get('x-cron-secret') !== cronHemlighet) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  try {
    console.log('🔔 Starting verification reminder job...');
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const seventyTwoHoursAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000);
    // Find users who:
    // 1. Are not verified (email_verified_at IS NULL)
    // 2. Created account 24h or 72h ago
    // 3. Are free tier (premium users don't need reminders)
    const { data: unverifiedUsers, error: fetchError } = await supabase.from('profiles').select('id, email, full_name, created_at, email_verified_at').eq('subscription_tier', 'free').is('email_verified_at', null).or(`created_at.gte.${twentyFourHoursAgo.toISOString()},created_at.gte.${seventyTwoHoursAgo.toISOString()}`);
    if (fetchError) {
      console.error('❌ Error fetching unverified users:', fetchError);
      return new Response(JSON.stringify({
        error: 'Failed to fetch users',
        details: fetchError
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    if (!unverifiedUsers || unverifiedUsers.length === 0) {
      console.log('✅ No unverified users found - all good!');
      return new Response(JSON.stringify({
        success: true,
        message: 'No reminders to send',
        count: 0
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    console.log(`📧 Found ${unverifiedUsers.length} unverified users`);
    const results = {
      sent24h: 0,
      sent72h: 0,
      failed: 0,
      skipped: 0
    };
    for (const user of unverifiedUsers){
      const createdAt = new Date(user.created_at);
      const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      // Skip if already sent a reminder recently (check if we sent one in the last hour)
      // This prevents duplicate sends on multiple function invocations
      if (hoursSinceCreation < 24 - 1 || hoursSinceCreation > 24 + 1 && hoursSinceCreation < 72 - 1) {
        results.skipped++;
        continue;
      }
      // Determine which reminder to send
      let reminderType = null;
      if (hoursSinceCreation >= 24 && hoursSinceCreation < 25) {
        reminderType = '24h';
      } else if (hoursSinceCreation >= 72 && hoursSinceCreation < 73) {
        reminderType = '72h';
      }
      if (!reminderType) {
        results.skipped++;
        continue;
      }
      // Get or create verification token
      let { data: existingToken } = await supabase.from('email_confirmations').select('token').eq('user_id', user.id).single();
      let verificationToken;
      if (existingToken) {
        verificationToken = existingToken.token;
      } else {
        // Create new token
        const newToken = crypto.randomUUID();
        const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24h from now
        const { error: insertError } = await supabase.from('email_confirmations').insert({
          user_id: user.id,
          email: user.email,
          token: newToken,
          expires_at: expiresAt.toISOString(),
          is_invitation: false
        });
        if (insertError) {
          console.error(`❌ Failed to create token for ${user.email}:`, insertError);
          results.failed++;
          continue;
        }
        verificationToken = newToken;
      }
      const verificationLink = `https://www.jobbcoach.ai/api/auth/confirm-email?token=${verificationToken}`;
      // Generate email content based on reminder type
      const emailContent = reminderType === '24h' ? generate24hReminderEmail(user.full_name || 'där', verificationLink) : generate72hReminderEmail(user.full_name || 'där', verificationLink);
      // Send email via Resend
      try {
        await resend.emails.send({
          from: 'Jobbcoach.ai <noreply@jobbcoach.ai>',
          to: user.email,
          subject: emailContent.subject,
          html: emailContent.html
        });
        if (reminderType === '24h') {
          results.sent24h++;
        } else {
          results.sent72h++;
        }
        console.log(`✅ Sent ${reminderType} reminder to ${user.email}`);
      } catch (emailError) {
        console.error(`❌ Failed to send email to ${user.email}:`, emailError);
        results.failed++;
      }
    }
    console.log('📊 Reminder job completed:', results);
    return new Response(JSON.stringify({
      success: true,
      message: 'Reminder job completed',
      results,
      total_users: unverifiedUsers.length
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('❌ Unexpected error in reminder function:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
});
function generate24hReminderEmail(name, verificationLink) {
  return {
    subject: 'Verifiera din e-post för full tillgång - Jobbcoach.ai',
    html: `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verifiera din e-post</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background: white; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); overflow: hidden;">
          <!-- Header med gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">🔔 Påminnelse</h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 600;">Hej ${name}!</h2>
              
              <p style="margin: 0 0 16px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Du registrerade dig på <strong>Jobbcoach.ai</strong> för 24 timmar sedan, men har ännu inte verifierat din e-postadress.
              </p>
              
              <p style="margin: 0 0 16px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                För närvarande är du begränsad till:
              </p>
              
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 8px;">
                <p style="margin: 0 0 8px; color: #92400e; font-size: 15px; font-weight: 600;">⚠️ Begränsningar:</p>
                <ul style="margin: 8px 0 0; padding-left: 20px; color: #92400e;">
                  <li style="margin-bottom: 4px;">Endast 1 CV uppladdat</li>
                  <li style="margin-bottom: 4px;">Endast 1 personligt brev skapat</li>
                </ul>
              </div>
              
              <p style="margin: 20px 0 16px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                <strong>Verifiera din e-post nu</strong> för att låsa upp:
              </p>
              
              <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0; border-radius: 8px;">
                <p style="margin: 0 0 8px; color: #065f46; font-size: 15px; font-weight: 600;">✓ Full tillgång:</p>
                <ul style="margin: 8px 0 0; padding-left: 20px; color: #065f46;">
                  <li style="margin-bottom: 4px;">Obegränsat antal CV:n</li>
                  <li style="margin-bottom: 4px;">7 personliga brev per vecka</li>
                  <li style="margin-bottom: 4px;">Alla gratisfunktioner</li>
                </ul>
              </div>
              
              <!-- CTA Button -->
              <table role="presentation" style="margin: 30px 0; width: 100%;">
                <tr>
                  <td align="center">
                    <a href="${verificationLink}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); transition: all 0.3s;">
                      Verifiera min e-post →
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                Länken är giltig i 24 timmar. Om du har problem med knappen, kopiera och klistra in denna länk i din webbläsare:
              </p>
              
              <p style="margin: 8px 0 0; padding: 12px; background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 6px; word-break: break-all; font-size: 13px; color: #4a5568;">
                ${verificationLink}
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px; color: #718096; font-size: 14px;">
                <strong>Jobbcoach.ai</strong> - Din partner för en framgångsrik karriär
              </p>
              <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                © 2024 Jobbcoach.ai | <a href="https://jobbcoach.ai" style="color: #667eea; text-decoration: none;">jobbcoach.ai</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  };
}
function generate72hReminderEmail(name, verificationLink) {
  return {
    subject: '⏰ Sista chansen - Verifiera din e-post på Jobbcoach.ai',
    html: `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sista chansen att verifiera</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); min-height: 100vh;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background: white; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); overflow: hidden;">
          <!-- Header med gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">⏰ Sista chansen!</h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 600;">Hej ${name},</h2>
              
              <p style="margin: 0 0 16px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Det har nu gått <strong>3 dagar</strong> sedan du registrerade dig på Jobbcoach.ai, och din e-post är fortfarande inte verifierad.
              </p>
              
              <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0; border-radius: 8px;">
                <p style="margin: 0 0 8px; color: #991b1b; font-size: 15px; font-weight: 600;">⚠️ Du missar:</p>
                <ul style="margin: 8px 0 0; padding-left: 20px; color: #991b1b;">
                  <li style="margin-bottom: 4px;">Obegränsat antal CV:n</li>
                  <li style="margin-bottom: 4px;">Skapa upp till 7 brev per vecka</li>
                  <li style="margin-bottom: 4px;">Full tillgång till alla verktyg</li>
                </ul>
              </div>
              
              <p style="margin: 20px 0 16px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                <strong>Det tar bara 5 sekunder att verifiera!</strong> Klicka på knappen nedan:
              </p>
              
              <!-- CTA Button med puls-effekt -->
              <table role="presentation" style="margin: 30px 0; width: 100%;">
                <tr>
                  <td align="center">
                    <a href="${verificationLink}" style="display: inline-block; padding: 18px 45px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 18px; box-shadow: 0 6px 20px rgba(245, 87, 108, 0.4); transition: all 0.3s;">
                      ✓ Verifiera nu (5 sekunder!)
                    </a>
                  </td>
                </tr>
              </table>
              
              <div style="background: #dbeafe; border: 2px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 12px; text-align: center;">
                <p style="margin: 0 0 8px; color: #1e40af; font-size: 16px; font-weight: 600;">💡 Visste du att?</p>
                <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.6;">
                  95% av våra användare som verifierar sin e-post får sitt drömjobb inom 3 månader!
                </p>
              </div>
              
              <p style="margin: 20px 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                Länken är giltig i 24 timmar. Om knappen inte fungerar, kopiera denna länk:
              </p>
              
              <p style="margin: 8px 0 0; padding: 12px; background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 6px; word-break: break-all; font-size: 13px; color: #4a5568;">
                ${verificationLink}
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px; color: #718096; font-size: 14px;">
                <strong>Jobbcoach.ai</strong> - Din partner för en framgångsrik karriär
              </p>
              <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                © 2024 Jobbcoach.ai | <a href="https://jobbcoach.ai" style="color: #f5576c; text-decoration: none;">jobbcoach.ai</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  };
}
