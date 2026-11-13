'use client';

/**
 * Köpet i Google Play via RevenueCat (docs/plan-app.md, avsnitt 2.6).
 * Pluginet @revenuecat/purchases-capacitor ligger i skalet (mobilapp/) och
 * heter Purchases. Sidorna buntar inte pluginets JavaScript, så anropen går
 * genom bryggan (skal-plugin.ts) med samma metoder och argument som pluginet.
 * I en vanlig webbläsare finns det inte; då säger köpvyn att köpet bara går
 * i appen.
 *
 * RevenueCat konfigureras med Supabase-användarens id som appUserID, så att
 * webhooken (/api/app/revenuecat) vet vems köpet är.
 */
import { finnsPlugin, kalla } from './skal-plugin';

/** Rättigheten i RevenueCat som Premium-prenumerationen ger. */
export const RC_RATTIGHET = 'premium';

const RC = 'Purchases';

/** Paketet skickas tillbaka till purchasePackage som det kom, med presentedOfferingContext. */
type Paket = { identifier: string; product: { priceString?: string; title?: string } } & Record<string, unknown>;
type Kundinfo = { entitlements?: { active?: Record<string, unknown> }; managementURL?: string | null };
type Erbjudanden = { current: { monthly?: Paket | null; availablePackages?: Paket[] } | null };

/** Finns köpet här? Kräver skalets plugin och den publika nyckeln. */
export function kanKopa(nyckel: string | null | undefined): boolean {
  return !!nyckel && finnsPlugin(RC);
}

let konfigurerad: string | null = null;

async function redo(nyckel: string, userId: string): Promise<void> {
  if (!finnsPlugin(RC)) throw new Error('saknar_plugin');
  if (konfigurerad === userId) return;
  // SDK:n lever kvar i skalet när sidan laddas om; då byts bara användaren.
  const finns = (await kalla<{ isConfigured: boolean }>(RC, 'isConfigured').catch(() => null))?.isConfigured ?? false;
  if (finns) await kalla(RC, 'logIn', { appUserID: userId });
  else await kalla(RC, 'configure', { apiKey: nyckel, appUserID: userId });
  konfigurerad = userId;
}

function harPremium(info: Kundinfo | null | undefined): boolean {
  return !!info?.entitlements?.active?.[RC_RATTIGHET];
}

export type KopUtfall = 'klart' | 'avbrutet' | 'fel';

/** Månadspaketet ur RevenueCats aktuella erbjudande. */
async function manadsPaket(): Promise<Paket> {
  const { current } = await kalla<Erbjudanden>(RC, 'getOfferings');
  const paket = current?.monthly ?? current?.availablePackages?.[0] ?? null;
  if (!paket) throw new Error('inget_erbjudande');
  return paket;
}

/** Priset som Google Play visar, till exempel "149,00 kr". null om det inte gick att läsa. */
export async function hamtaPris(nyckel: string, userId: string): Promise<string | null> {
  try {
    await redo(nyckel, userId);
    return (await manadsPaket()).product.priceString ?? null;
  } catch {
    return null;
  }
}

/** Öppnar Google Plays köpark. */
export async function kopPremium(nyckel: string, userId: string): Promise<KopUtfall> {
  try {
    await redo(nyckel, userId);
    const { customerInfo } = await kalla<{ customerInfo: Kundinfo }>(RC, 'purchasePackage', { aPackage: await manadsPaket() });
    return harPremium(customerInfo) ? 'klart' : 'fel';
  } catch (e) {
    // Bryggans fel har pluginets kod och data; 1 är PURCHASE_CANCELLED.
    const f = e as { code?: string | number; userCancelled?: boolean; data?: { userCancelled?: boolean } } | null;
    if (f?.userCancelled || f?.data?.userCancelled || String(f?.code) === '1') return 'avbrutet';
    console.error('[app] köp', e);
    return 'fel';
  }
}

/** Återställer ett köp gjort med samma Google-konto (ny telefon, ominstallation). */
export async function aterstallKop(nyckel: string, userId: string): Promise<boolean> {
  try {
    await redo(nyckel, userId);
    const r = await kalla<{ customerInfo: Kundinfo }>(RC, 'restorePurchases');
    return harPremium(r?.customerInfo);
  } catch (e) {
    console.error('[app] återställ köp', e);
    return false;
  }
}

/** Google Plays sida för prenumerationer, öppnas i Play-appen från skalet. */
export const PLAY_PRENUMERATIONER = 'https://play.google.com/store/account/subscriptions?package=ai.jobbcoach.testklar';

/**
 * Öppnar prenumerationerna i Google Play. I skalet navigerar vi till
 * adressen: Capacitor släpper aldrig in en annan domän i webbvyn utan ger
 * den till Android som ett intent (Bridge.launchIntent), och Play-appen tar
 * play.google.com. I webbläsaren öppnas sidan i en ny flik.
 */
export function oppnaPlayPrenumerationer(): void {
  const iSkalet = !!(window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.();
  if (iSkalet) {
    window.location.href = PLAY_PRENUMERATIONER;
    return;
  }
  window.open(PLAY_PRENUMERATIONER, '_blank', 'noopener');
}
