'use client';

/**
 * Push från skalet (docs/plan-app.md, avsnitt 2.7). Pluginet
 * @capacitor/push-notifications ligger i skalet och heter PushNotifications;
 * anropen går genom bryggan (skal-plugin.ts). Token sparas via
 * /api/app/enheter; utskicket sköts av edge-funktionen app-paminnelse.
 */
import { finnsPlugin, kalla, lyssnaPa } from './skal-plugin';

type Behorighet = 'granted' | 'denied' | 'prompt' | 'prompt-with-rationale';

const PUSH = 'PushNotifications';

export function harPush(): boolean {
  return finnsPlugin(PUSH);
}

async function las(): Promise<Behorighet> {
  return (await kalla<{ receive: Behorighet }>(PUSH, 'checkPermissions')).receive;
}

export async function pushBehorighet(): Promise<Behorighet | null> {
  if (!harPush()) return null;
  try {
    return await las();
  } catch {
    return null;
  }
}

function plattform(): 'android' | 'ios' {
  return /JobbcoachApp\/[^\s]+ \(ios\)/.test(navigator.userAgent) ? 'ios' : 'android';
}

/** Registrerar telefonen hos Firebase och väntar på token, högst 15 sekunder. */
async function hamtaToken(): Promise<string> {
  const av: Array<() => void> = [];
  try {
    return await new Promise<string>((ok, nej) => {
      const t = setTimeout(() => nej(new Error('ingen_token')), 15000);
      av.push(
        lyssnaPa(PUSH, 'registration', (d) => {
          clearTimeout(t);
          const v = (d as { value?: string } | null)?.value;
          if (v) ok(v);
          else nej(new Error('tom_token'));
        }),
      );
      av.push(
        lyssnaPa(PUSH, 'registrationError', (d) => {
          clearTimeout(t);
          nej(new Error((d as { error?: string } | null)?.error ?? 'registrering'));
        }),
      );
      kalla(PUSH, 'register').catch(nej);
    });
  } finally {
    for (const a of av) a();
  }
}

async function sparaToken(token: string, extra: { paminnelse_tid?: string; aktiv?: boolean }): Promise<void> {
  const res = await fetch('/api/app/enheter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, plattform: plattform(), ...extra }),
  });
  if (!res.ok) throw new Error(`enheter ${res.status}`);
}

export type SlaPaUtfall = 'pa' | 'nekad' | 'saknas' | 'fel';

/**
 * Efter ett ja i vår egen fråga: systemets dialog, registreringen och
 * tokenen till servern med vald tid.
 */
export async function slaPaPaminnelse(tid: string): Promise<SlaPaUtfall> {
  if (!harPush()) return 'saknas';
  try {
    let b = await las();
    if (b !== 'granted') b = (await kalla<{ receive: Behorighet }>(PUSH, 'requestPermissions')).receive;
    if (b !== 'granted') return 'nekad';
    await sparaToken(await hamtaToken(), { paminnelse_tid: tid, aktiv: true });
    return 'pa';
  } catch (e) {
    console.error('[app] påminnelse', e);
    return 'fel';
  }
}

/**
 * Vid start när notiser redan är tillåtna: tokenen kan ha bytts, så den
 * skickas igen och senast_sedd uppdateras. Tid och på/av står kvar.
 */
export async function fornyaToken(): Promise<void> {
  if (!harPush()) return;
  try {
    if ((await las()) !== 'granted') return;
    await sparaToken(await hamtaToken(), {});
  } catch {
    // Tyst: nästa start försöker igen.
  }
}

/** Kontots inställning för alla telefoner: på/av och tid. */
export async function andraPaminnelse(andring: { aktiv?: boolean; paminnelse_tid?: string }): Promise<boolean> {
  try {
    const res = await fetch('/api/app/enheter', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(andring),
    });
    return res.ok;
  } catch {
    return false;
  }
}
