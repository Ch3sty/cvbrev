/**
 * Laser .env.local utan dotenv.
 *
 * dotenv star varken i package.json eller i node_modules, men femton skript
 * importerade det anda. De gick alltsa inte att kora: importen kastade
 * MODULE_NOT_FOUND innan en enda rad av skriptet hann kora. Den har filen
 * ersatter config({ path: '.env.local' }) med samma beteende for det format
 * vi faktiskt anvander.
 *
 *   import { laddaEnv } from './_env';
 *   laddaEnv();
 *
 * Formatet: NYCKEL=varde, en per rad, valfria citattecken runt vardet, rader
 * som borjar med brasklapp ar kommentarer. En redan satt miljovariabel vinner
 * over filen, sa skalet och CI kan overstyra.
 */

import fs from 'node:fs';
import path from 'node:path';

export function laddaEnv(
  fil = path.resolve(process.cwd(), '.env.local')
): void {
  if (!fs.existsSync(fil)) return;

  for (const rad of fs.readFileSync(fil, 'utf8').split(/\r?\n/)) {
    const trimmad = rad.trim();
    if (!trimmad || trimmad.startsWith('#')) continue;

    const delare = trimmad.indexOf('=');
    if (delare <= 0) continue;

    const nyckel = trimmad.slice(0, delare).trim();
    if (process.env[nyckel] !== undefined) continue;

    let varde = trimmad.slice(delare + 1).trim();
    if (
      (varde.startsWith('"') && varde.endsWith('"')) ||
      (varde.startsWith("'") && varde.endsWith("'"))
    ) {
      varde = varde.slice(1, -1);
    }
    process.env[nyckel] = varde;
  }
}
