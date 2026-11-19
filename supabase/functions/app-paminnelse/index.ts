import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

/**
 * app-paminnelse: påminnelsen om dagens test i Testklar (docs/plan-app.md,
 * avsnitt 2.7).
 *
 * pg_cron anropar funktionen var 15:e minut
 * (migrations/20261120110100_app_paminnelse_cron.sql). Den skickar en notis
 * via Firebase Cloud Messaging (HTTP v1) till varje aktiv enhet i
 * app_enheter vars paminnelse_tid ligger i den här kvarten, svensk tid, och
 * vars ägare inte redan gjort ett test i dag.
 *
 * "Gjort dagens test" läses ur logic_test_v4_sessions: en session som blev
 * klar efter midnatt svensk tid i dag. Samma tabell som Idag-vyns ring
 * (lib/traning/motor.server.ts), men utan motorn, så att inget test räknas
 * annorlunda här än en klar session gör.
 *
 * En notis per enhet och dag: senast_paminnd sätts vid lyckat utskick och
 * hoppar över raden om cron körs två gånger i samma kvart. En token som
 * Firebase säger inte finns längre stängs av (aktiv = false).
 *
 * Miljö (supabase secrets): CRON_SECRET_APP_PAMINNELSE, FCM_SERVICE_ACCOUNT
 * (hela tjänstekontots JSON från Firebase, en rad). Driftsätts med
 * --no-verify-jwt eftersom Authorization är cron-hemligheten.
 */

const TITEL = 'Dags för dagens test i Testklar';
const TEXT = 'Några minuter i dag räcker för att hålla nivån.';

type Enhet = { id: string; user_id: string; token: string; plattform: string; paminnelse_tid: string };
type Tjanstekonto = { project_id: string; client_email: string; private_key: string };

function svar(kropp: unknown, status = 200) {
  return new Response(JSON.stringify(kropp), { status, headers: { 'Content-Type': 'application/json' } });
}

/** Datum, klockslag och UTC-förskjutning i Stockholm. */
function sthlm(nu: Date) {
  const delar = Object.fromEntries(
    new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Europe/Stockholm',
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
    }).formatToParts(nu).map((p) => [p.type, p.value]),
  );
  const somUtc = Date.UTC(+delar.year, +delar.month - 1, +delar.day, +delar.hour, +delar.minute, +delar.second);
  const forskjutning = somUtc - Math.floor(nu.getTime() / 1000) * 1000;
  return { dag: `${delar.year}-${delar.month}-${delar.day}`, h: +delar.hour, m: +delar.minute, forskjutning };
}

function hhmm(min: number) {
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
}

/* ------------------------------------------------------- Firebase OAuth */

function b64url(data: ArrayBuffer | Uint8Array | string): string {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : new Uint8Array(data);
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function accessToken(konto: Tjanstekonto): Promise<string> {
  const pem = konto.private_key.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const der = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
  const nyckel = await crypto.subtle.importKey('pkcs8', der, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const iat = Math.floor(Date.now() / 1000);
  const huvud = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const ansprak = b64url(JSON.stringify({
    iss: konto.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat,
    exp: iat + 3600,
  }));
  const signatur = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', nyckel, new TextEncoder().encode(`${huvud}.${ansprak}`));
  const jwt = `${huvud}.${ansprak}.${b64url(signatur)}`;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  if (!res.ok) throw new Error(`oauth ${res.status}: ${await res.text()}`);
  return (await res.json()).access_token as string;
}

/** 'ok', 'borta' (token finns inte längre) eller 'fel'. */
async function skicka(konto: Tjanstekonto, token: string, enhet: Enhet): Promise<'ok' | 'borta' | 'fel'> {
  const res = await fetch(`https://fcm.googleapis.com/v1/projects/${konto.project_id}/messages:send`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: {
        token: enhet.token,
        notification: { title: TITEL, body: TEXT },
        // Appen öppnar Idag när notisen trycks (skalet läser lank).
        data: { lank: '/dashboard', typ: 'dagens_pass' },
        android: { priority: 'HIGH', notification: { tag: 'dagens-pass' } },
        apns: { payload: { aps: { 'thread-id': 'dagens-pass' } } },
      },
    }),
  });
  if (res.ok) return 'ok';
  const text = await res.text();
  if (res.status === 404 || /UNREGISTERED|registration-token-not-registered/.test(text)) return 'borta';
  if (res.status === 400 && /INVALID_ARGUMENT/.test(text) && /token/i.test(text)) return 'borta';
  console.error(`[app-paminnelse] FCM ${res.status} för enhet ${enhet.id}: ${text.slice(0, 300)}`);
  return 'fel';
}

Deno.serve(async (req) => {
  const hemlighet = Deno.env.get('CRON_SECRET_APP_PAMINNELSE');
  if (!hemlighet || req.headers.get('authorization') !== `Bearer ${hemlighet}`) {
    return svar({ error: 'Unauthorized' }, 401);
  }

  const kontoText = Deno.env.get('FCM_SERVICE_ACCOUNT');
  if (!kontoText) return svar({ error: 'FCM_SERVICE_ACCOUNT saknas' }, 500);

  try {
    const konto = JSON.parse(kontoText) as Tjanstekonto;
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Kvarten vi skickar för, svensk tid. Ett anrop 18:30:04 tar 18:30-18:44.
    const nu = new Date();
    const s = sthlm(nu);
    const start = s.h * 60 + Math.floor(s.m / 15) * 15;
    const fran = hhmm(start);
    const till = start + 15 >= 24 * 60 ? '23:59:59' : hhmm(start + 15);

    let fraga = supabase
      .from('app_enheter')
      .select('id, user_id, token, plattform, paminnelse_tid')
      .eq('aktiv', true)
      .gte('paminnelse_tid', fran)
      .or(`senast_paminnd.is.null,senast_paminnd.lt.${s.dag}`);
    fraga = start + 15 >= 24 * 60 ? fraga.lte('paminnelse_tid', till) : fraga.lt('paminnelse_tid', till);
    const { data: enheter, error } = await fraga.limit(5000);
    if (error) throw error;
    if (!enheter?.length) return svar({ ok: true, kvart: fran, skickade: 0 });

    // Midnatt i dag, svensk tid, som UTC-tid.
    const [ar, man, dag] = s.dag.split('-').map(Number);
    const midnatt = new Date(Date.UTC(ar, man - 1, dag) - s.forskjutning).toISOString();
    const anvandare = [...new Set((enheter as Enhet[]).map((e) => e.user_id))];
    const gjort = new Set<string>();
    for (let i = 0; i < anvandare.length; i += 200) {
      const { data: klara, error: klarFel } = await supabase
        .from('logic_test_v4_sessions')
        .select('user_id')
        .in('user_id', anvandare.slice(i, i + 200))
        .gte('completed_at', midnatt);
      if (klarFel) throw klarFel;
      for (const r of klara ?? []) gjort.add((r as { user_id: string }).user_id);
    }

    const att = (enheter as Enhet[]).filter((e) => !gjort.has(e.user_id));
    if (!att.length) return svar({ ok: true, kvart: fran, skickade: 0, redanGjort: enheter.length });

    const token = await accessToken(konto);
    let skickade = 0, borta = 0, fel = 0;
    for (const e of att) {
      const utfall = await skicka(konto, token, e);
      if (utfall === 'ok') {
        skickade++;
        await supabase.from('app_enheter').update({ senast_paminnd: s.dag }).eq('id', e.id);
      } else if (utfall === 'borta') {
        borta++;
        await supabase.from('app_enheter').update({ aktiv: false }).eq('id', e.id);
      } else fel++;
    }

    console.log(`[app-paminnelse] ${s.dag} ${fran}: ${skickade} skickade, ${borta} borta, ${fel} fel, ${enheter.length - att.length} hade redan gjort ett test`);
    return svar({ ok: true, kvart: fran, skickade, borta, fel, redanGjort: enheter.length - att.length });
  } catch (e) {
    console.error('[app-paminnelse]', e);
    return svar({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
