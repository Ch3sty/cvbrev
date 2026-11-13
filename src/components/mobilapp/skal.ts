'use client';

/**
 * Kontakten med appskalet (Capacitor) från sidorna. Skalet lägger sin brygga
 * på window.Capacitor; i en vanlig webbläsare finns inget av det och allt här
 * blir tyst.
 *
 * Sidorna laddas från servern och buntar inte @capacitor/core, så
 * window.Capacitor.Plugins är tomt i skalet. Alla anrop går därför genom
 * bryggan i skal-plugin.ts (finnsPlugin, kalla, lyssnaPa), med pluginens namn
 * som i skalet (mobilapp/package.json): Haptics, App, SplashScreen,
 * SystemBars, PushNotifications, Preferences, Browser, SocialLogin, Purchases.
 */
import { finnsPlugin, kalla, lyssnaPa } from './skal-plugin';

type Brygga = {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
  nativePromise?: unknown;
};

function brygga(): Brygga | null {
  if (typeof window === 'undefined') return null;
  const cap = (window as unknown as { Capacitor?: Brygga }).Capacitor;
  if (!cap) return null;
  const nativ = cap.isNativePlatform?.() ?? typeof cap.nativePromise === 'function';
  return nativ ? cap : null;
}

/** Sant i appskalet (Android nu, iOS senare), falskt i en vanlig webbläsare. */
export function arAppen(): boolean {
  return brygga() !== null;
}

/** Plattformen i skalet, null i webbläsaren. */
export function plattform(): 'android' | 'ios' | null {
  const p = brygga()?.getPlatform?.();
  return p === 'android' || p === 'ios' ? p : null;
}

/** Finns pluginet i skalet? Äldre skal kan sakna ett plugin som sidan känner till. */
export function harPlugin(namn: string): boolean {
  return finnsPlugin(namn);
}

/**
 * Ett anrop till ett inbyggt plugin. Avvisas när skalet saknas eller pluginet
 * inte finns, så anroparen bestämmer själv om felet ska synas.
 */
export function anropa<T = unknown>(plugin: string, metod: string, val: Record<string, unknown> = {}): Promise<T> {
  return kalla<T>(plugin, metod, val);
}

/** Lyssna på en händelse från ett plugin. Returnerar en avregistrering (no-op i webbläsaren). */
export function lyssna(plugin: string, handelse: string, cb: (data: unknown) => void): () => void {
  return lyssnaPa(plugin, handelse, cb);
}

function tyst(p: Promise<unknown>): void {
  p.catch(() => {});
}

/**
 * Haptiken följer konceptets tabell (Rörelse och känsla): lätt tick vid tryck,
 * dubbelt tick vid rätt svar, framgång när ett pass sluts, medel när nivåtalet
 * landar, aldrig vid fel. I appen går den genom skalets Haptics; i
 * webbläsaren på Android via navigator.vibrate, och där vibrate saknas
 * (iPhone i Safari) blir den tyst.
 */
export type HaptikTyp = 'latt' | 'ratt' | 'medel' | 'framgang';

export function haptik(typ: HaptikTyp = 'latt'): void {
  try {
    if (arAppen() && finnsPlugin('Haptics')) {
      const latt = () => tyst(kalla('Haptics', 'impact', { style: 'LIGHT' }));
      if (typ === 'framgang') tyst(kalla('Haptics', 'notification', { type: 'SUCCESS' }));
      else if (typ === 'medel') tyst(kalla('Haptics', 'impact', { style: 'MEDIUM' }));
      else if (typ === 'ratt') {
        latt();
        window.setTimeout(latt, 90);
      } else latt();
      return;
    }
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      const monster: Record<HaptikTyp, number | number[]> = { latt: 8, ratt: [8, 70, 8], medel: 16, framgang: [12, 60, 18] };
      navigator.vibrate(monster[typ]);
    }
  } catch {
    // Haptiken får aldrig stoppa ett tryck.
  }
}

/**
 * Statusfältets ikoner: mörka i appens ljusa rum, ljusa över passens mörka
 * vägg (konceptet: "Statusfältets färg följer vyn"). SystemBars-stilen
 * DARK betyder ljusa ikoner för mörk bakgrund, LIGHT mörka ikoner.
 */
export function statusfalt(stil: 'ljust' | 'morkt'): void {
  if (!arAppen() || !finnsPlugin('SystemBars')) return;
  tyst(kalla('SystemBars', 'setStyle', { style: stil === 'ljust' ? 'LIGHT' : 'DARK' }));
}

let startskarmDold = false;

/**
 * Startskärmen döljs när första vyn är målad: två bildrutor efter att
 * anroparen monterats, så att rummet redan står bakom (konceptet: märket
 * flyttar sig aldrig, rummet tonar in bakom). Bara första gången.
 * launchShowDuration i capacitor.config.ts döljer den ändå om sidan aldrig
 * kommer hit.
 */
export function doljStartskarm(): void {
  if (startskarmDold || !arAppen() || !finnsPlugin('SplashScreen')) return;
  startskarmDold = true;
  requestAnimationFrame(() =>
    requestAnimationFrame(() => tyst(kalla('SplashScreen', 'hide', { fadeOutDuration: 200 }))),
  );
}

/** Stänger appen (Android). */
export function stangAppen(): void {
  if (plattform() === 'android' && finnsPlugin('App')) tyst(kalla('App', 'exitApp'));
}
