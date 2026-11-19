import { Parser } from '@deno/eszip';
import fs from 'node:fs'; import path from 'node:path';
const f = process.argv[2];
const p = await Parser.createInstance();
const specs = await p.parseBytes(new Uint8Array(fs.readFileSync(`eszip/${f}.bin`)));
await p.load();
const own = specs.filter(s => s.startsWith('file:///'));
console.log(f, 'moduler', specs.length, 'egna', own.length);
for (const s of own) {
  const src = await p.getModuleSource(s);
  const m = s.match(/\/source\/(.*)$/);
  if (!m) { console.log('  hoppar', s); continue; }
  let rel = m[1].replace(/^supabase\/functions\//, '').replace(/^functions\//, '');
  const out = path.join('ur-eszip', f, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, src);
  console.log('  ', s.replace(/^.*\/source\//,''), '->', out, src.length);
}
