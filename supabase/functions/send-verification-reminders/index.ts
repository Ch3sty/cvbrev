// Påminnelser till konton som inte har bekräftat sin e-postadress.
//
// Körs en gång om dygnet av pg_cron (send-verification-reminders-daily).
// Ett konto får högst två påminnelser: en dygnet efter registreringen och en
// tre dygn efter. Bara gratiskonton, och bara så länge adressen är obekräftad.
//
// Historik: källan fanns bara i drift fram till 2026-11-21. Den versionen
// skickade nästan aldrig något (fönstren var en timme breda men jobbet körs
// en gång om dygnet), länken i mejlet var samma som i registreringsmejlet och
// hade redan gått ut, och texten lovade saker produkten inte har. Omskriven
// 2026-11-22.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { Resend } from 'npm:resend@4.0.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const resend = new Resend(RESEND_API_KEY);

const SAJT = 'https://www.jobbcoach.ai';
const TIMME = 60 * 60 * 1000;
/** Länken i påminnelsen gäller så här länge. Texten i mejlet säger "tre dygn". */
const LANK_GILTIG_TIMMAR = 72;
/** Har kontot fått ett bekräftelsemejl de senaste timmarna skickas inget nytt. */
const VILA_TIMMAR = 20;

type Paminnelse = 'forsta' | 'andra';

/**
 * Vilken påminnelse ett konto ska ha, efter hur gammalt det är. Fönstren är
 * ett dygn breda eftersom jobbet körs en gång om dygnet: varje konto hamnar i
 * varje fönster exakt en gång.
 */
function paminnelseFor(timmarSedanSkapat: number): Paminnelse | null {
  if (timmarSedanSkapat >= 24 && timmarSedanSkapat < 48) return 'forsta';
  if (timmarSedanSkapat >= 72 && timmarSedanSkapat < 96) return 'andra';
  return null;
}

const json = (kropp: unknown, status = 200) =>
  new Response(JSON.stringify(kropp), { status, headers: { 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  // SÄKERHET (2026-11-21): bara vår schemalagda körning får anropa funktionen.
  // Gatewayen släpper igenom vilken giltig nyckel som helst, också den publika.
  // Anroparen skickar hemligheten i rubriken x-cron-secret (pg_cron-jobbet
  // läser den ur vault, samma värde som CRON_SECRET).
  const cronHemlighet = Deno.env.get('CRON_SECRET');
  if (!cronHemlighet || req.headers.get('x-cron-secret') !== cronHemlighet) {
    return json({ error: 'Unauthorized' }, 401);
  }

  try {
    // provkorning: räknar vilka som skulle få mejl, skickar inget och skriver inget.
    const kropp = await req.json().catch(() => ({}));
    const provkorning = kropp?.provkorning === true;

    const nu = new Date();
    const { data: konton, error: hamtFel } = await supabase
      .from('profiles')
      .select('id, email, full_name, created_at')
      .eq('subscription_tier', 'free')
      .is('email_verified_at', null)
      .gt('created_at', new Date(nu.getTime() - 96 * TIMME).toISOString())
      .lte('created_at', new Date(nu.getTime() - 24 * TIMME).toISOString());

    if (hamtFel) {
      console.error('[paminnelse] kunde inte läsa konton:', hamtFel.message);
      return json({ error: 'Failed to fetch users' }, 500);
    }

    const utfall = { forsta: 0, andra: 0, hoppade: 0, nyligenMejlade: 0, misslyckade: 0 };
    // Testkonton ligger på toppdomänen .test, som aldrig går att leverera till.
    // Ett mejl dit studsar och skadar avsändarens rykte.
    const aktuella = (konton ?? []).filter((k) => k.email && !/\.test$/i.test(k.email.trim()));

    // Senaste bekräftelsemejlet per konto: har ett gått i dag (en tidigare
    // körning, eller att användaren själv bad om ett nytt) skickas inget till.
    const senasteMejl = new Map<string, number>();
    if (aktuella.length > 0) {
      const { data: rader } = await supabase
        .from('email_confirmations')
        .select('user_id, created_at')
        .in('user_id', aktuella.map((k) => k.id));
      for (const r of rader ?? []) {
        if (r.created_at) senasteMejl.set(r.user_id, new Date(r.created_at).getTime());
      }
    }

    for (const konto of aktuella) {
      const timmar = (nu.getTime() - new Date(konto.created_at).getTime()) / TIMME;
      const typ = paminnelseFor(timmar);
      if (!typ) {
        utfall.hoppade++;
        continue;
      }
      const senast = senasteMejl.get(konto.id);
      if (senast && nu.getTime() - senast < VILA_TIMMAR * TIMME) {
        utfall.nyligenMejlade++;
        continue;
      }
      if (provkorning) {
        utfall[typ]++;
        continue;
      }

      // En ny länk för varje påminnelse. Länken från registreringen gäller ett
      // dygn och har gått ut när påminnelsen skickas.
      const token = crypto.randomUUID();
      const { error: tokenFel } = await supabase.from('email_confirmations').upsert(
        {
          user_id: konto.id,
          email: konto.email,
          token,
          expires_at: new Date(nu.getTime() + LANK_GILTIG_TIMMAR * TIMME).toISOString(),
          created_at: nu.toISOString(),
        },
        { onConflict: 'user_id' }
      );
      if (tokenFel) {
        console.error('[paminnelse] kunde inte skapa länk för ' + konto.id.slice(0, 8) + ':', tokenFel.message);
        utfall.misslyckade++;
        continue;
      }

      const mejl = paminnelseMejl(typ, konto.full_name, SAJT + '/api/auth/confirm-email?token=' + token);
      const { error: mejlFel } = await resend.emails.send({
        from: 'Jobbcoach.ai <noreply@jobbcoach.ai>',
        to: konto.email,
        subject: mejl.subject,
        html: mejl.html,
      });
      if (mejlFel) {
        console.error('[paminnelse] mejlet gick inte iväg till ' + konto.id.slice(0, 8) + ':', mejlFel.message);
        utfall.misslyckade++;
        continue;
      }
      utfall[typ]++;
    }

    console.log('[paminnelse] klar' + (provkorning ? ' (provkörning)' : '') + ':', JSON.stringify(utfall));
    return json({ success: true, provkorning, konton: aktuella.length, utfall });
  } catch (fel) {
    console.error('[paminnelse] oväntat fel:', fel);
    return json({ error: 'Internal server error' }, 500);
  }
});

// ---------------------------------------------------------------------------
// Mejlen
// ---------------------------------------------------------------------------

function esc(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** "Hej Anna!" med förnamnet, eller "Hej!" när namnet saknas. */
function halsning(namn: string | null | undefined): string {
  const fornamn = (namn ?? '').trim().split(/\s+/)[0] ?? '';
  return fornamn ? 'Hej ' + esc(fornamn) + '!' : 'Hej!';
}

const TEXTER: Record<Paminnelse, { subject: string; forrad: string; rubrik: string; ingress: string }> = {
  forsta: {
    subject: 'Bekräfta din e-postadress',
    forrad: 'Ett klick, sedan är kontot klart.',
    rubrik: 'En sak kvar: bekräfta din e-post',
    ingress: 'Du skapade nyligen ett konto hos oss, men e-postadressen är inte bekräftad än. Det tar ett klick.',
  },
  andra: {
    subject: 'Din e-postadress är inte bekräftad än',
    forrad: 'Vi påminner en gång till, sedan låter vi dig vara.',
    rubrik: 'Din e-post väntar fortfarande',
    ingress:
      'Det har gått några dagar sedan du skapade ditt konto, och e-postadressen är fortfarande inte bekräftad. Vi påminner den här gången, sedan låter vi dig vara.',
  },
};

/**
 * Samma skal som livscykelmejlen i webbappen (src/lib/email/lifecycle/
 * templates/layout.ts): tabellayout och inline-CSS, så att det ritas lika i
 * Gmail, Outlook och Apple Mail. Det som står om vad bekräftelsen ger är det
 * appen faktiskt spärrar för obekräftade gratiskonton: ett andra CV
 * (src/app/api/cv/upload/route.ts) och fler sparade brev
 * (src/app/api/letters/route.ts). Ändras spärrarna ska texten ändras.
 */
function paminnelseMejl(typ: Paminnelse, namn: string | null | undefined, lank: string): { subject: string; html: string } {
  const t = TEXTER[typ];
  const stycke =
    'margin:0 0 14px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#475569;';
  const litet = 'font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;';
  const html = [
    '<!doctype html>',
    '<html lang="sv" xmlns="http://www.w3.org/1999/xhtml">',
    '<head>',
    '  <meta charset="utf-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1">',
    '  <meta http-equiv="X-UA-Compatible" content="IE=edge">',
    '  <title>' + esc(t.subject) + '</title>',
    '</head>',
    '<body style="margin:0;padding:0;background-color:#F8FAFC;-webkit-text-size-adjust:100%;">',
    '  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">' + esc(t.forrad) + '</div>',
    '  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F8FAFC;">',
    '    <tr>',
    '      <td align="center" style="padding:24px 16px 40px 16px;">',
    '        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;border:1px solid #E2E8F0;overflow:hidden;">',
    '          <tr>',
    '            <td style="padding:0;font-size:0;line-height:0;">',
    '              <a href="' + SAJT + '/" target="_blank"><img src="' + SAJT + '/email/email-header-jobbcoach.png" width="560" alt="Jobbcoach.ai" style="display:block;width:100%;max-width:560px;height:auto;border:0;"></a>',
    '            </td>',
    '          </tr>',
    '          <tr>',
    '            <td style="padding:32px 32px 4px 32px;">',
    '              <h1 style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:24px;line-height:1.3;font-weight:700;color:#0F172A;">' + esc(t.rubrik) + '</h1>',
    '              <p style="' + stycke + '">' + halsning(namn) + ' ' + esc(t.ingress) + '</p>',
    '            </td>',
    '          </tr>',
    '          <tr>',
    '            <td style="padding:10px 32px 6px 32px;">',
    '              <table role="presentation" cellpadding="0" cellspacing="0" border="0">',
    '                <tr>',
    '                  <td style="background-color:#EA580C;border-radius:8px;">',
    '                    <a href="' + lank + '" target="_blank" style="display:inline-block;padding:14px 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">Bekräfta min e-post</a>',
    '                  </td>',
    '                </tr>',
    '              </table>',
    '            </td>',
    '          </tr>',
    '          <tr>',
    '            <td style="padding:22px 32px 0 32px;">',
    '              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFF7ED;border:1px solid #FFEDD5;border-radius:8px;">',
    '                <tr><td style="padding:16px 18px;">',
    '                  <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#475569;">Med bekräftad adress kan du ladda upp ett CV till och spara fler personliga brev. Tills dess har kontot plats för ett CV och ett sparat brev.</p>',
    '                </td></tr>',
    '              </table>',
    '            </td>',
    '          </tr>',
    '          <tr>',
    '            <td style="padding:18px 32px 0 32px;">',
    '              <p style="margin:0 0 10px 0;' + litet + 'color:#94A3B8;">Länken gäller i tre dygn. Fungerar inte knappen? Kopiera adressen och klistra in den i webbläsaren:</p>',
    '              <p style="margin:0 0 14px 0;' + litet + 'color:#64748B;word-break:break-all;">' + esc(lank) + '</p>',
    '              <p style="margin:0;' + litet + 'color:#94A3B8;">Var det inte du som skapade kontot? Då behöver du inte göra något.</p>',
    '            </td>',
    '          </tr>',
    '          <tr><td style="height:32px;font-size:0;line-height:0;">&nbsp;</td></tr>',
    '        </table>',
    '        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">',
    '          <tr>',
    '            <td align="center" style="padding:20px 16px 0 16px;">',
    '              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#94A3B8;">Det här mejlet rör ditt konto på jobbcoach.ai.</p>',
    '            </td>',
    '          </tr>',
    '        </table>',
    '      </td>',
    '    </tr>',
    '  </table>',
    '</body>',
    '</html>',
  ].join('\n');
  return { subject: t.subject, html };
}
