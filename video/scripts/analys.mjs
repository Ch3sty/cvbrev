import fs from 'node:fs';
const SR = 11025, HOP = 256;
const res = [];
for (const f of fs.readdirSync('musik/pcm').filter(f=>f.endsWith('.wav'))) {
  const buf = fs.readFileSync('musik/pcm/' + f);
  const d = buf.indexOf('data') + 8; const x = new Float32Array((buf.length - d) >> 1); for (let i = 0; i < x.length; i++) x[i] = buf.readInt16LE(d + 2 * i) / 32768;
  const n = Math.floor(x.length / HOP);
  // energi och onset (positiv energiderivata, låg- och höghalva via enkel differens)
  const e = new Float32Array(n), hi = new Float32Array(n);
  for (let i = 0; i < n; i++) { let s = 0, h = 0; for (let j = 0; j < HOP; j++) { const v = x[i*HOP+j]; s += v*v; const d = v - (x[i*HOP+j-1]||0); h += d*d; } e[i] = Math.sqrt(s/HOP); hi[i] = Math.sqrt(h/HOP); }
  const on = new Float32Array(n);
  for (let i = 1; i < n; i++) on[i] = Math.max(0, Math.log(1e-4+e[i]) - Math.log(1e-4+e[i-1])) + Math.max(0, Math.log(1e-4+hi[i]) - Math.log(1e-4+hi[i-1]));
  const fps = SR / HOP;
  let best = 0, bestLag = 0; const ac = [];
  for (let bpm = 70; bpm <= 190; bpm += 0.25) { const lag = fps * 60 / bpm; let s = 0; for (let i = 0; i + Math.ceil(lag) < n; i++) { const l = Math.floor(lag), fr = lag - l; s += on[i] * (on[i+l]*(1-fr) + on[i+l+1]*fr); } ac.push([bpm, s]); if (s > best) { best = s; bestLag = bpm; } }
  const mean = ac.reduce((a, b) => a + b[1], 0) / ac.length;
  const dur = x.length / SR;
  // energi per sekund
  const perS = []; for (let s = 0; s < Math.floor(dur); s++) { let q = 0, c = 0; for (let i = Math.floor(s*fps); i < Math.floor((s+1)*fps); i++) { q += e[i]; c++; } perS.push(q/c); }
  const max = Math.max(...perS);
  const kurva = perS.map(v => ' .:-=+*#%@'[Math.min(9, Math.round(9 * v / max))]).join('');
  const topp = [...ac].sort((p,q)=>q[1]-p[1]).filter((v,i,arr)=>arr.findIndex(w=>Math.abs(w[0]-v[0])<3)===i).slice(0,4).map(v=>v[0]+':'+(v[1]/mean).toFixed(1)).join(' ');
  res.push({ topp, id: f.replace('.wav',''), bpm: bestLag, styrka: (best/mean).toFixed(2), dur: dur.toFixed(0), kurva });
}
for (const r of res.sort((a,b)=>b.styrka-a.styrka)) console.log(r.topp, '|', r.id.padEnd(5), String(r.bpm).padEnd(7), r.styrka, r.dur.padStart(4)+'s', r.kurva);
