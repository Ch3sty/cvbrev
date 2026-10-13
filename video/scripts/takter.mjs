import fs from 'node:fs';
const id = process.argv[2], BPM = Number(process.argv[3]);
const SR = 11025, HOP = 64;
const buf = fs.readFileSync(`musik/pcm/${id}.wav`);
const d = buf.indexOf('data') + 8; const x = new Float32Array((buf.length - d) >> 1); for (let i = 0; i < x.length; i++) x[i] = buf.readInt16LE(d + 2 * i) / 32768;
// lågpass för kick: enkel one-pole 150 Hz
const a = Math.exp(-2*Math.PI*150/SR); let y = 0; const lo = new Float32Array(x.length); for (let i = 0; i < x.length; i++) { y = a*y + (1-a)*x[i]; lo[i] = y; }
const n = Math.floor(x.length / HOP), fps = SR / HOP;
const e = new Float32Array(n); for (let i = 0; i < n; i++) { let s = 0; for (let j = 0; j < HOP; j++) s += lo[i*HOP+j]**2; e[i] = Math.sqrt(s/HOP); }
const on = new Float32Array(n); for (let i = 1; i < n; i++) on[i] = Math.max(0, e[i]-e[i-1]);
const beat = 60 / BPM;
// bästa fas för slaggrid
let best = -1, bestFas = 0; for (let fas = 0; fas < beat; fas += 0.002) { let s = 0; for (let t = fas; t < x.length/SR; t += beat) { const i = Math.round(t*fps); s += on[i] + (on[i-1]||0) + (on[i+1]||0); } if (s > best) { best = s; bestFas = fas; } }
console.log('fas', bestFas.toFixed(3), 'beat', beat.toFixed(4));
// energi per takt (4 slag) för helheten och lågbas
const full = []; const dur = x.length/SR;
for (let t = bestFas, k = 0; t + 4*beat < dur; t += 4*beat, k++) { let s = 0, sl = 0, c = 0; for (let i = Math.floor(t*SR); i < Math.floor((t+4*beat)*SR); i++) { s += x[i]*x[i]; sl += lo[i]*lo[i]; c++; } full.push([k, t, 10*Math.log10(s/c), 10*Math.log10(sl/c)]); }
for (const [k, t, f, l] of full) console.log(String(k).padStart(3), t.toFixed(2).padStart(7), f.toFixed(1).padStart(6), l.toFixed(1).padStart(6), '#'.repeat(Math.max(0, Math.round((f+40)))), '|', 'b'.repeat(Math.max(0, Math.round(l+45))));
