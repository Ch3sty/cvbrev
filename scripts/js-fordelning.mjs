// Delar sidans JavaScript i skript som står i HTML-svaret (parser) och skript
// som laddas efteråt (förhämtning av länkade sidor, PostHog). Pixel 7, kall cache.
//   node scripts/js-fordelning.mjs http://localhost:8300/artiklar/logiska-tester
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
for (const url of process.argv.slice(2)) {
const p = await b.newPage(); await p.emulate({ viewport:{width:412,height:915,deviceScaleFactor:2,isMobile:true,hasTouch:true}, userAgent:'Mozilla/5.0 (Linux; Android 13; Pixel 7) Chrome/143 Mobile' });
const cdp = await p.createCDPSession(); await cdp.send('Network.enable'); await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
const typ = {}; const size = {};
cdp.on('Network.requestWillBeSent', e => { if (/\.js/.test(e.request.url)) typ[e.requestId] = [e.initiator.type, e.request.url] });
cdp.on('Network.loadingFinished', e => { size[e.requestId] = e.encodedDataLength });
await p.goto(url, { waitUntil: 'networkidle0' }); await new Promise(r=>setTimeout(r,2000));
let parser=0, pn=0, ovr=0, on=0;
for (const [id,[t,u]] of Object.entries(typ)) { const s=(size[id]||0)/1024; if (t==='parser') {parser+=s;pn++} else {ovr+=s;on++} }
console.log(url.split('8300')[1], `HTML-skript ${Math.round(parser)} kB/${pn}  efterladdat ${Math.round(ovr)} kB/${on}`);
await p.close(); }
await b.close();
