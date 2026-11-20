// K5: appens skal förutsätter två saker i webbens kod. Krysset i varje
// helskärmsvy är märkt med data-kryss (Android-tillbaka klickar på det), och
// adresserna som proxyn och flikarna pekar på finns som sidor.
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { APP_FLIK, APP_PREMIUM, appVag, WEBBEN_VAG } from '../appvag';
import { AVSLUTA_SELEKTOR, KRYSS_SELEKTOR } from '../kryss';

const ROT = path.resolve(__dirname, '../../../..');
const APP_DIR = path.join(ROT, 'src/app');

/** Skalen vars kryss appen läser (Skalet.tsx och NivakollPass.tsx). */
const SKAL = [
  'src/components/traning/Kvitto.tsx',
  // Alla tester, I-provet och Nivåkollen i onboardingen går i sessionsramen
  // (krysset bor i ramen, startskärmen och resultatskärmen).
  'src/components/session/SessionsRam.tsx',
  'src/components/session/Startskarm.tsx',
  'src/components/session/Resultatskarm.tsx',
];

function lasFil(rel: string): string {
  return fs.readFileSync(path.join(ROT, rel), 'utf8');
}

function filer(dir: string, namn: Set<string>): string[] {
  const ut: string[] = [];
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) ut.push(...filer(p, namn));
    else if (namn.has(d.name)) ut.push(p);
  }
  return ut;
}

/** Adressen en page.tsx svarar på, med routegrupper som "(flikar)" borttagna. */
function adress(fil: string): string {
  const delar = path
    .relative(APP_DIR, path.dirname(fil))
    .split(path.sep)
    .filter((s) => s && !/^\(.*\)$/.test(s));
  return `/${delar.join('/')}`;
}

const SIDOR = new Set(filer(APP_DIR, new Set(['page.tsx'])).map(adress));

describe('krysset i skalen', () => {
  it.each(SKAL)('%s märker krysset med data-kryss', (rel) => {
    const kallkod = lasFil(rel);
    // Attributet ska sitta på en knapp eller länk, inte på något annat element.
    expect(kallkod).toMatch(/<(button|Link|a)\b[^>]*?data-kryss=""/);
  });

  it('selektorerna hittar ett märkt kryss oavsett etikett', () => {
    document.body.innerHTML = '<button data-kryss="" aria-label="Något helt nytt"></button><button aria-label="Stäng"></button>';
    const [markt, stang] = Array.from(document.querySelectorAll('button'));
    expect(markt.matches(KRYSS_SELEKTOR)).toBe(true);
    expect(markt.matches(AVSLUTA_SELEKTOR)).toBe(true);
    // Reserven: etiketten räcker för skalet, men ett ark-"Stäng" avbryter inte en mätning.
    expect(stang.matches(KRYSS_SELEKTOR)).toBe(true);
    expect(stang.matches(AVSLUTA_SELEKTOR)).toBe(false);
  });

  it('reservlistan har webbens nuvarande etiketter', () => {
    for (const etikett of ['Avsluta träningen', 'Avsluta Nivåkollen', 'Avsluta testet', 'Avsluta provet']) {
      document.body.innerHTML = `<button aria-label="${etikett}"></button>`;
      expect(document.querySelector('button')!.matches(KRYSS_SELEKTOR)).toBe(true);
    }
  });
});

describe('adresserna appen förutsätter', () => {
  it('flikarnas och kontots webbadresser finns', () => {
    for (const a of Object.values(APP_FLIK)) expect(SIDOR, a).toContain(a);
  });

  it('varje adress proxyn skriver om till finns som appsida', () => {
    const mal = [
      ...Object.values(APP_FLIK).map((a) => appVag(a)),
      appVag('/dashboard/valj-spar'),
      appVag('/dashboard/profil/prenumeration'),
      appVag('/login'),
      appVag('/register'),
      appVag('/priser'),
      WEBBEN_VAG,
      APP_PREMIUM,
    ];
    for (const a of mal) {
      expect(a).not.toBeNull();
      expect(SIDOR, a!).toContain(a!);
    }
  });

  it('varje sida under webbens tester har en tvilling i appen', () => {
    const webb = path.join(APP_DIR, 'dashboard/tester');
    const app = path.join(APP_DIR, 'app/tester');
    const saknas = filer(webb, new Set(['page.tsx', 'not-found.tsx']))
      .map((f) => path.relative(webb, f))
      .filter((rel) => !rel.startsWith('forhandsvisning') && !rel.includes('__tests__'))
      .filter((rel) => !fs.existsSync(path.join(app, rel)));
    expect(saknas).toEqual([]);
  });
});
