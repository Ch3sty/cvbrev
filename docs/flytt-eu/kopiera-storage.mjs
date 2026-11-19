// Kopierar buckets och alla objekt från GAMLA till NYA via storage-API:t.
// GAMLA läses bara (GET). Nycklarna hämtas via Management API och skrivs aldrig ut.
// Körs: node kopiera-storage.mjs <arbetsmapp>   (kräver SUPABASE_TOKEN_JOBBCOACH och
// <arbetsmapp>/objects_old.json + buckets_old.json från kor-flytt.sh)
import fs from 'node:fs';
import path from 'node:path';

const GAMLA = 'dbvbnbkvadvlhjhomibg';
const NYA = 'mnlrpfidyzuaxxlftruf';
const W = process.argv[2];
const T = process.env.SUPABASE_TOKEN_JOBBCOACH;
if (!W || !T) { console.error('arbetsmapp och SUPABASE_TOKEN_JOBBCOACH krävs'); process.exit(1); }

const nyckel = async (ref) => {
  const r = await fetch(`https://api.supabase.com/v1/projects/${ref}/api-keys?reveal=true`, { headers: { Authorization: `Bearer ${T}` } });
  return (await r.json()).find((k) => k.name === 'service_role').api_key;
};
const OLD = { url: `https://${GAMLA}.supabase.co`, key: await nyckel(GAMLA) };
const NEW = { url: `https://${NYA}.supabase.co`, key: await nyckel(NYA) };
const h = (p) => ({ Authorization: `Bearer ${p.key}`, apikey: p.key });
const enc = (n) => n.split('/').map(encodeURIComponent).join('/');

const buckets = JSON.parse(fs.readFileSync(path.join(W, 'buckets_old.json')));
const objects = JSON.parse(fs.readFileSync(path.join(W, 'objects_old.json')));

for (const b of buckets) {
  const body = JSON.stringify({ id: b.id, name: b.name, public: b.public, file_size_limit: b.file_size_limit, allowed_mime_types: b.allowed_mime_types });
  let r = await fetch(`${NEW.url}/storage/v1/bucket`, { method: 'POST', headers: { ...h(NEW), 'content-type': 'application/json' }, body });
  if (!r.ok) r = await fetch(`${NEW.url}/storage/v1/bucket/${b.id}`, { method: 'PUT', headers: { ...h(NEW), 'content-type': 'application/json' }, body });
  console.log('bucket', b.id, r.status);
}

let ok = 0;
const fel = [];
const kor = async (o) => {
  try {
    const d = await fetch(`${OLD.url}/storage/v1/object/authenticated/${o.bucket_id}/${enc(o.name)}`, { headers: h(OLD) });
    if (!d.ok) throw new Error(`hämta ${d.status}`);
    const buf = Buffer.from(await d.arrayBuffer());
    const m = o.metadata || {};
    if (m.size != null && Number(m.size) !== buf.length) throw new Error(`storlek ${buf.length} != ${m.size}`);
    // NYA (Nano) svarar 429 too_many_connections vid för många samtidiga
    // uppladdningar: försök igen med växande väntetid.
    let u;
    for (let forsok = 0; forsok < 6; forsok++) {
      u = await fetch(`${NEW.url}/storage/v1/object/${o.bucket_id}/${enc(o.name)}`, {
        method: 'POST',
        headers: { ...h(NEW), 'content-type': m.mimetype || 'application/octet-stream', 'cache-control': m.cacheControl || 'max-age=3600', 'x-upsert': 'true' },
        body: buf,
      });
      if (u.status !== 429) break;
      await new Promise((r) => setTimeout(r, 1000 * 2 ** forsok));
    }
    if (!u.ok) throw new Error(`ladda upp ${u.status} ${(await u.text()).slice(0, 200)}`);
    ok++;
  } catch (e) { fel.push({ bucket: o.bucket_id, name: o.name, fel: String(e.message) }); }
};
const q = [...objects];
await Promise.all(Array.from({ length: 3 }, async () => { while (q.length) await kor(q.shift()); }));
console.log('kopierade', ok, 'av', objects.length, 'fel', fel.length);
fs.writeFileSync(path.join(W, 'storage_fel.json'), JSON.stringify(fel, null, 1));
if (fel.length) process.exit(2);
