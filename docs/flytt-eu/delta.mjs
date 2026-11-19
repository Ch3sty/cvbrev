// Efter bytet: för över rader som kom in i GAMLA efter sista dumpen.
// Lägger in rader som saknas i NYA (på primärnyckel) och uppdaterar rader i
// NYA som ändrats i GAMLA efter T0 (created_at eller updated_at), för alla
// tabeller i public. GAMLA läses bara. Körs: node delta.mjs <T0 ISO> [--torr]
// Kräver psql (PostgreSQL 17) i PATH och OLD_DB_URL/NEW_DB_URL i .env.local.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const envFil = new URL('../../.env.local', import.meta.url);
const env = Object.fromEntries(
  fs.readFileSync(envFil, 'utf8').split(/\r?\n/)
    .filter((l) => /^(OLD|NEW)_DB_URL=/.test(l))
    .map((l) => [l.split('=')[0], l.slice(l.indexOf('=') + 1).trim()]),
);
const T0 = process.argv[2];
const torr = process.argv.includes('--torr');
if (!T0) { console.error('ange T0'); process.exit(1); }

const q = (url, sql, ro) => {
  const args = [url, '-X', '-At', '-v', 'ON_ERROR_STOP=1'];
  if (ro) args.push('-c', 'set default_transaction_read_only=on');
  args.push('-c', sql);
  return execFileSync('psql', args, { encoding: 'utf8', maxBuffer: 1 << 28 }).replace(/^SET\r?\n/, '').trim();
};

const lista = q(env.OLD_DB_URL, `
  select c.relname,
    (select string_agg(a.attname, ',' order by k.ord) from pg_index i
       cross join unnest(i.indkey) with ordinality k(attnum, ord)
       join pg_attribute a on a.attrelid = i.indrelid and a.attnum = k.attnum
     where i.indrelid = c.oid and i.indisprimary),
    exists(select 1 from pg_attribute where attrelid = c.oid and attname = 'updated_at' and not attisdropped),
    exists(select 1 from pg_attribute where attrelid = c.oid and attname = 'created_at' and not attisdropped)
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r' order by 1`, true);

let tot = 0;
for (const rad of lista.split('\n')) {
  const [t, pk, harUpd, harSkap] = rad.split('|');
  if (!pk) continue;
  // Rader som saknas i NYA, jämfört på primärnyckel (created_at kan ligga
  // före T0 när en rad sparas i efterhand), plus rader ändrade efter T0.
  const nyckel = `(${pk.split(',').map((k) => `"${k}"::text`).join(` || '|' || `)})`;
  const iNya = new Set(JSON.parse(q(env.NEW_DB_URL, `select coalesce(json_agg(${nyckel}), '[]') from public."${t}"`) || '[]'));
  const iGamla = JSON.parse(q(env.OLD_DB_URL, `select coalesce(json_agg(${nyckel}), '[]') from public."${t}"`, true) || '[]');
  const saknas = iGamla.filter((k) => !iNya.has(k));
  const villkor = [
    saknas.length ? `${nyckel} = any(array[${saknas.map((k) => `'${String(k).replace(/'/g, "''")}'`).join(',')}])` : null,
    harUpd === 't' ? `updated_at > '${T0}'` : null,
  ].filter(Boolean).join(' or ');
  if (!villkor) continue;
  const arr = JSON.parse(q(env.OLD_DB_URL, `select coalesce(json_agg(r), '[]') from (select * from public."${t}" where ${villkor}) r`, true) || '[]');
  if (!arr.length) continue;
  tot += arr.length;
  console.log(`${t}: ${arr.length} rader`);
  if (torr) continue;
  const pkKol = pk.split(',');
  const set = Object.keys(arr[0]).filter((k) => !pkKol.includes(k)).map((k) => `"${k}" = excluded."${k}"`).join(', ');
  const fil = path.join(os.tmpdir(), `delta_${t}.json`).split(path.sep).join('/');
  fs.writeFileSync(fil, JSON.stringify(arr));
  const sql = [
    'begin;',
    'set local session_replication_role = replica;',
    'create temp table d(j json);',
    `\\copy d(j) from '${fil}' with (format csv, quote e'\\x01', delimiter e'\\x02')`,
    `insert into public."${t}" select r.* from d, json_populate_recordset(null::public."${t}", d.j) r`,
    `on conflict (${pkKol.map((k) => `"${k}"`).join(', ')}) do ${set ? `update set ${set}` : 'nothing'};`,
    'commit;',
  ].join('\n');
  fs.writeFileSync(`${fil}.sql`, sql);
  execFileSync('psql', [env.NEW_DB_URL, '-X', '-v', 'ON_ERROR_STOP=1', '-f', `${fil}.sql`], { stdio: 'pipe' });
}
console.log(torr ? `torrkörning, ${tot} rader att föra över` : `klart, ${tot} rader överförda`);
