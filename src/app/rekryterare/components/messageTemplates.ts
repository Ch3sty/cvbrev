'use client';

// Meddelandemallar för intresseförfrågningar. Lagras i localStorage per
// webbläsare (ingen server behövs, ingen känslig data). Rekryteraren skriver
// samma typ av pitch om och om igen, så mallar + "senast använda" sparar tid.

const TEMPLATES_KEY = 'jc_recruiter_msg_templates';
const LAST_USED_KEY = 'jc_recruiter_msg_last';

export interface MessageTemplate {
  id: string;
  title: string;
  body: string;
}

/** Inbyggda utgångsmallar, visas tills rekryteraren sparar egna. */
export const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    id: 'default-role',
    title: 'Rollpitch',
    body: 'Hej! Vi söker just nu till en roll som ligger nära din profil. Din bakgrund och dina testresultat sticker ut. Får jag berätta mer och höra om det låter intressant?',
  },
  {
    id: 'default-short',
    title: 'Kort och rakt',
    body: 'Hej! Din profil matchar en roll vi rekryterar till just nu. Skulle du vara öppen för ett kort samtal?',
  },
];

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Rekryterarens sparade mallar (inbyggda + egna). */
export function loadTemplates(): MessageTemplate[] {
  const own = read<MessageTemplate[]>(TEMPLATES_KEY, []);
  return [...DEFAULT_TEMPLATES, ...own];
}

/** Sparar en egen mall (max ~20 för att inte svälla). */
export function saveTemplate(title: string, body: string): void {
  if (typeof window === 'undefined') return;
  const own = read<MessageTemplate[]>(TEMPLATES_KEY, []);
  const next = [
    ...own,
    { id: `t_${own.length}_${title.slice(0, 8)}`, title: title.trim(), body: body.trim() },
  ].slice(-20);
  try {
    window.localStorage.setItem(TEMPLATES_KEY, JSON.stringify(next));
  } catch {
    /* localStorage full/blockerad: strunta tyst */
  }
}

/** Senast skickade meddelande, för autofyll nästa gång. */
export function loadLastUsed(): string {
  return read<string>(LAST_USED_KEY, '');
}

export function saveLastUsed(body: string): void {
  if (typeof window === 'undefined' || !body.trim()) return;
  try {
    window.localStorage.setItem(LAST_USED_KEY, body.trim());
  } catch {
    /* strunta tyst */
  }
}
