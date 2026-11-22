// Bygger fristående skissfiler: en HTML per sida med all CSS i filen.
//   node docs/design/publikt-omgang3/bygg.mjs            alla sidor
//   node docs/design/publikt-omgang3/bygg.mjs cv-analys  en sida
// Källan är sidor/<namn>.html. Första raden är en kommentar med inställningar:
//   <!-- titel: CV-analys | rum: cv -->
// <!--@del namn--> ersätts med delar/namn.html. Egen CSS skrivs i <style> i sidan.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rot = path.dirname(fileURLToPath(import.meta.url))
const kit = fs.readFileSync(path.join(rot, 'kit.css'), 'utf8')
const del = (namn) => fs.readFileSync(path.join(rot, 'delar', namn + '.html'), 'utf8')
const bara = process.argv.slice(2)
fs.mkdirSync(path.join(rot, 'ut'), { recursive: true })

for (const fil of fs.readdirSync(path.join(rot, 'sidor')).filter((f) => f.endsWith('.html'))) {
  const namn = fil.replace('.html', '')
  if (bara.length && !bara.includes(namn)) continue
  let kalla = fs.readFileSync(path.join(rot, 'sidor', fil), 'utf8')
  const huvud = kalla.match(/^<!--\s*(.*?)\s*-->/)
  const inst = Object.fromEntries((huvud ? huvud[1] : '').split('|').map((p) => p.split(':').map((s) => s.trim())))
  kalla = kalla.replace(/<!--@del ([\w-]+)-->/g, (_, n) => del(n))
  const html = `<!doctype html>
<html lang="sv">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${inst.titel || namn}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Schibsted+Grotesk:wght@600;700;800;900&display=swap" rel="stylesheet">
<style>
${kit}
</style>
</head>
<body data-rum="${inst.rum || 'neutral'}">
${del('ikoner')}
${kalla}
</body>
</html>
`
  fs.writeFileSync(path.join(rot, 'ut', `skiss-${namn}.html`), html)
  console.log('byggd', `ut/skiss-${namn}.html`, Math.round(html.length / 1024) + ' kB')
}
