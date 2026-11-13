'use client';

/**
 * Anrop till skalets inbyggda plugin (köpet, notiserna, inloggningen).
 *
 * Appen laddar sidorna från servern och buntar inte @capacitor/core, så
 * window.Capacitor.Plugins är tomt i skalet: bryggan lägger bara
 * PluginHeaders, nativePromise och addListener på window.Capacitor
 * (Capacitor 8, JSExport.java). Anropen går därför genom bryggan, med samma
 * namn som i skalet (Purchases, PushNotifications, SocialLogin, Browser).
 * Ett plugin som någon har registrerat i Plugins används som reserv.
 *
 * I en vanlig webbläsare finns inget av det: finnsPlugin ger falskt, kalla
 * avvisas och lyssnaPa blir en tom avregistrering.
 */

type Metod = (val?: Record<string, unknown>) => Promise<unknown>;
type Registrerat = Record<string, Metod | unknown>;
type Lyssnare = { remove: () => Promise<void> | void };

type Brygga = {
  isNativePlatform?: () => boolean;
  nativePromise?: <T = unknown>(plugin: string, metod: string, val?: Record<string, unknown>) => Promise<T>;
  addListener?: (plugin: string, handelse: string, cb: (data: unknown) => void) => Lyssnare;
  PluginHeaders?: { name: string }[];
  Plugins?: Record<string, Registrerat | undefined>;
};

function brygga(): Brygga | null {
  if (typeof window === 'undefined') return null;
  const cap = (window as unknown as { Capacitor?: Brygga }).Capacitor;
  if (!cap || cap.isNativePlatform?.() === false) return null;
  return cap;
}

function iBryggan(cap: Brygga, plugin: string): boolean {
  return typeof cap.nativePromise === 'function' && !!cap.PluginHeaders?.some((h) => h.name === plugin);
}

function registrerat(cap: Brygga, plugin: string): Registrerat | null {
  return cap.Plugins?.[plugin] ?? null;
}

/** Finns pluginet i skalet? Falskt i webbläsaren och i ett äldre skal utan det. */
export function finnsPlugin(plugin: string): boolean {
  const cap = brygga();
  return !!cap && (iBryggan(cap, plugin) || !!registrerat(cap, plugin));
}

/**
 * Anropar en metod i pluginet och ger svaret. Avvisas med Error('saknar_<plugin>')
 * när pluginet inte finns; pluginets egna fel (till exempel ett avbrutet
 * köp) kommer som de är, med code och data.
 */
export function kalla<T = unknown>(plugin: string, metod: string, val: Record<string, unknown> = {}): Promise<T> {
  const cap = brygga();
  if (cap && iBryggan(cap, plugin)) return cap.nativePromise!<T>(plugin, metod, val);
  const fn = cap ? registrerat(cap, plugin)?.[metod] : undefined;
  if (typeof fn === 'function') return (fn as Metod).call(registrerat(cap!, plugin), val) as Promise<T>;
  return Promise.reject(new Error(`saknar_${plugin}`));
}

/**
 * Lyssnar på en händelse från pluginet (till exempel PushNotifications
 * "registration"). Returnerar avregistreringen; den är tom när pluginet saknas.
 */
export function lyssnaPa(plugin: string, handelse: string, cb: (data: unknown) => void): () => void {
  const cap = brygga();
  if (!cap) return () => {};
  try {
    if (iBryggan(cap, plugin) && typeof cap.addListener === 'function') {
      const l = cap.addListener(plugin, handelse, cb);
      return () => void Promise.resolve(l.remove()).catch(() => {});
    }
    const fn = registrerat(cap, plugin)?.addListener;
    if (typeof fn === 'function') {
      const l = (fn as (h: string, cb: (d: unknown) => void) => Promise<Lyssnare> | Lyssnare).call(registrerat(cap, plugin), handelse, cb);
      return () => void Promise.resolve(l).then((x) => x.remove()).catch(() => {});
    }
  } catch {
    // En lyssnare som inte går att lägga får aldrig stoppa vyn.
  }
  return () => {};
}
