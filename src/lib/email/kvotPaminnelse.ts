// src/lib/email/kvotPaminnelse.ts
// Kvotpåminnelserna ("Påminn mig när kvoten är tillbaka"), utbrutna ur
// pricing-sync så att urvalet går att testa (beslut-mejl-och-radering 1d).
//
// Den som har en behörighet som gör kvoten obegränsad (prenumeration,
// Dagspasset, köp i appen, admintilldelning) får ingen påminnelse. Frågan
// ställs som kvoten själv ställer den: userHasAccess med kvotens feature.
// Gamla rader för kvoter som inte kommer tillbaka (cv_analysis) markeras som
// hanterade utan mejl.

import type { Resend } from 'resend';
import { generateQuotaBackEmail, kvotensFeature } from '@/lib/email/quota-back';
import { userHasAccess } from '@/lib/supabase/premiumAccess';

export interface KvotPaminnelseResultat {
  success: true;
  sent: number;
  skipped: number;
}

export async function skickaKvotPaminnelser(
  supabaseAdmin: any,
  resend: Pick<Resend, 'emails'>,
  now: Date = new Date()
): Promise<KvotPaminnelseResultat> {
  const nowISO = now.toISOString();

  const { data: due, error: dueError } = await supabaseAdmin
    .from('quota_reminders')
    .select('id, user_id, feature')
    .is('sent_at', null)
    .lte('remind_after', nowISO)
    .limit(200);

  if (dueError) throw dueError;

  let sent = 0;
  let skipped = 0;
  for (const reminder of due ?? []) {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('email, quota_emails_opt_out')
      .eq('id', reminder.user_id)
      .single();
    const feature = kvotensFeature(reminder.feature);
    // Gamla rader för kvoter som inte kommer tillbaka (cv_analysis) markeras som
    // hanterade utan mejl. Behörigheten frågas som kvoten själv frågar.
    const obegransad = feature ? await userHasAccess(supabaseAdmin as any, reminder.user_id, feature) : true;
    if (!profile?.email || profile.quota_emails_opt_out || obegransad) {
      // Hoppa över avregistrerade, saknad e-post, obegränsad kvot och kvoter
      // som inte kommer tillbaka. Markera ändå som hanterad så samma rad inte
      // processas varje morgon.
      skipped++;
    } else {
      const { subject, html } = generateQuotaBackEmail(reminder.user_id, reminder.feature);
      // Taggar följer med till Resends webhook-events så statistiken
      // kan grupperas per mailtyp/funktion (endast a-z0-9_- tillåts).
      const featureTag = reminder.feature.replace(/[^a-zA-Z0-9_-]/g, '_');
      const { data: sendData, error: sendError } = await resend.emails.send({
        from: 'Jobbcoach.ai <noreply@jobbcoach.ai>',
        to: [profile.email],
        subject,
        html,
        tags: [
          { name: 'type', value: 'quota_back' },
          { name: 'feature', value: featureTag },
        ],
      });
      if (sendError) {
        console.error('[Quota Reminders] Send failed for', reminder.id, sendError);
        continue; // lämna osänd, försöks igen imorgon
      }
      sent++;
      await supabaseAdmin.from('email_log').insert({
        resend_id: sendData?.id ?? null,
        user_id: reminder.user_id,
        email_type: 'quota_back',
        feature: reminder.feature,
        recipient: profile.email,
        subject,
      });
    }

    await supabaseAdmin.from('quota_reminders').update({ sent_at: nowISO }).eq('id', reminder.id);
  }

  console.log(`[Quota Reminders] sent=${sent} skipped=${skipped} due=${due?.length ?? 0}`);
  return { success: true, sent, skipped };
}
