#!/usr/bin/env node
// Håller arbetsytan liten och datorn snabb.
//
//   node scripts/arbetsyta.mjs                    läget, i klartext
//   node scripts/arbetsyta.mjs --hook             kort läge till sessionsstarten (slutar alltid med kod 0)
//   node scripts/arbetsyta.mjs stada              tar bort .next-*, föräldralösa servrar och webbläsare, tomma mappar
//   node scripts/arbetsyta.mjs stada --arbetskopior   också arbetskopior vars gren är inne i origin/main och som är rena
//   node scripts/arbetsyta.mjs stada --grenar         också lokala grenar som är inne i origin/main
//
//   --torr           visar vad som skulle göras, gör inget
//   --bara <mapp>    begränsar --arbetskopior till en mapp (mappnamnet, inte hela sökvägen)
//   --aven-farska    tar även det som är yngre än två timmar
//
// Skriptet tar aldrig bort något som inte går att återskapa: byggmappar byggs om,
// en arbetskopia tas bara bort när grenen ligger i origin/main och inget är ocommittat,
// och en server stängs bara när sessionen som startade den är borta.

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const arg = process.argv.slice(2)
const HOOK = arg.includes('--hook')
const STADA = arg[0] === 'stada'
const TORR = arg.includes('--torr')
const MED_ARBETSKOPIOR = arg.includes('--arbetskopior')
const MED_GRENAR = arg.includes('--grenar')
const AVEN_FARSKA = arg.includes('--aven-farska')
const BARA = arg.includes('--bara') ? arg[arg.indexOf('--bara') + 1] : null

const TVA_TIMMAR = 2 * 60 * 60 * 1000
const MINNESGRANS_GB = 3 // under det här startas ingen ny server, inget bygge
const MAX_ARBETSKOPIOR = 3 // utöver rotmappen
const GB = 1024 ** 3

function kor(cmd, args, cwd, timeout = 20000) {
  try {
    return execFileSync(cmd, args, { cwd, encoding: 'utf8', timeout, stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 }).trim()
  } catch {
    return null
  }
}
const git = (args, cwd) => kor('git', args, cwd)
const tal = (n) => n.toFixed(1).replace('.', ',')
const samma = (a, b) => path.resolve(a).toLowerCase() === path.resolve(b).toLowerCase()

// ---------- git: rotmapp och arbetskopior ----------

function arbetskopior() {
  const ut = git(['worktree', 'list', '--porcelain'], process.cwd())
  if (!ut) return []
  return ut.split(/\r?\n\r?\n/).filter(Boolean).map((block) => {
    const rad = (namn) => block.split(/\r?\n/).find((r) => r.startsWith(namn + ' '))?.slice(namn.length + 1)
    return { mapp: path.resolve(rad('worktree')), gren: rad('branch')?.replace('refs/heads/', '') ?? null }
  })
}

function granskaArbetskopia(k) {
  const finns = fs.existsSync(k.mapp)
  const status = finns ? git(['status', '--porcelain'], k.mapp) : null
  const utanfor = finns ? git(['rev-list', '--count', 'origin/main..HEAD'], k.mapp) : null
  let nodeModules = 'saknas'
  try {
    nodeModules = fs.lstatSync(path.join(k.mapp, 'node_modules')).isSymbolicLink() ? 'länkad' : 'egen kopia'
  } catch {}
  let fodd = 0
  try { fodd = fs.statSync(k.mapp).birthtimeMs } catch {}
  return {
    ...k,
    namn: path.basename(k.mapp),
    finns,
    ocommittat: status === null ? null : status.split(/\r?\n/).filter(Boolean).length,
    utanfor: utanfor === null ? null : Number(utanfor),
    nodeModules,
    farsk: Date.now() - fodd < TVA_TIMMAR,
  }
}

function byggmappar(mapp) {
  try {
    return fs.readdirSync(mapp, { withFileTypes: true })
      .filter((e) => e.isDirectory() && /^\.next-[A-Za-z0-9._-]+$/.test(e.name))
      .map((e) => {
        const full = path.join(mapp, e.name)
        return { full, namn: e.name, i: mapp, farsk: Date.now() - fs.statSync(full).mtimeMs < TVA_TIMMAR }
      })
  } catch {
    return []
  }
}

// ---------- processer (Windows) ----------

function processer() {
  if (process.platform !== 'win32') return null
  const ps = "Get-CimInstance Win32_Process | ForEach-Object { [pscustomobject]@{ p=$_.ProcessId; f=$_.ParentProcessId; n=$_.Name; c=$_.CommandLine; m=$_.WorkingSetSize; s=$_.CreationDate.ToFileTimeUtc() } } | ConvertTo-Json -Compress"
  const ut = kor('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', ps], undefined, HOOK ? 12000 : 30000)
  if (!ut) return null
  try {
    const lista = JSON.parse(ut)
    return new Map(lista.map((x) => [x.p, { pid: x.p, foralder: x.f, namn: (x.n || '').toLowerCase(), cmd: x.c || '', minne: x.m || 0, start: x.s || 0 }]))
  } catch {
    return null
  }
}

// En process är föräldralös när kedjan uppåt tar slut innan den når ett program som
// någon sitter i (Claude, VS Code, en terminal, Utforskaren). Då finns ingen session kvar som äger den.
const VARDAR = new Set(['claude.exe', 'code.exe', 'cursor.exe', 'windowsterminal.exe', 'mintty.exe', 'explorer.exe'])
function foraldralos(p, alla) {
  let nu = p
  for (let steg = 0; steg < 15; steg++) {
    const f = alla.get(nu.foralder)
    if (!f || f.start > nu.start) return true // föräldern är borta, eller numret har återanvänts av en yngre process
    if (VARDAR.has(f.namn)) return false
    nu = f
  }
  return false
}

function hittaServrar(alla) {
  const ut = []
  for (const p of alla.values()) {
    if (p.namn !== 'node.exe') continue
    const m = p.cmd.match(/next[\\/]dist[\\/]bin[\\/]next"?\s+(dev|start)\b/)
    if (!m) continue
    const mapp = p.cmd.match(/"?([A-Za-z]:[\\/][^"]*?)[\\/]node_modules[\\/]/)?.[1] ?? '?'
    ut.push({ ...p, typ: 'next ' + m[1], port: p.cmd.match(/-p\s+(\d+)/)?.[1] ?? '3000', mapp: path.resolve(mapp), dod: foraldralos(p, alla) })
  }
  return ut
}

function hittaWebblasare(alla) {
  const ut = []
  for (const p of alla.values()) {
    if (p.namn !== 'chrome.exe' || /--type=/.test(p.cmd)) continue
    if (!/--headless|[\\/]\.cache[\\/]puppeteer[\\/]|--remote-debugging-p|ms-playwright/.test(p.cmd)) continue
    ut.push({ ...p, dod: foraldralos(p, alla) })
  }
  return ut
}

// Skal som en Claude-session startade och som hängt kvar efter att sessionen dog.
// De håller mappar låsta. Bara skal med Claudes egen startrad räknas, aldrig ägarens terminaler.
function hittaHangdaSkal(alla) {
  const startMs = (p) => p.start / 10000 - 11644473600000 // Windows filtid till vanlig tid
  const hangda = [...alla.values()].filter((p) => p.namn === 'bash.exe' && p.cmd.includes('shell-snapshots')
    && (AVEN_FARSKA || Date.now() - startMs(p) > TVA_TIMMAR) && foraldralos(p, alla))
  const ids = new Set(hangda.map((p) => p.pid))
  return { antal: hangda.length, toppar: hangda.filter((p) => !ids.has(p.foralder)) }
}

function storstPaMinne(alla, antal) {
  const summa = new Map()
  for (const p of alla.values()) summa.set(p.namn, (summa.get(p.namn) ?? 0) + p.minne)
  return [...summa.entries()].sort((a, b) => b[1] - a[1]).slice(0, antal)
    .map(([namn, bytes]) => `${namn.replace(/\.exe$/, '')} ${tal(bytes / GB)} GB`)
}

function stang(pid) {
  return kor('taskkill', ['/PID', String(pid), '/T', '/F']) !== null
}

// ---------- läget ----------

function lage() {
  const kopior = arbetskopior()
  if (!kopior.length) return null
  const rot = kopior[0].mapp
  const ovriga = kopior.slice(1).map(granskaArbetskopia)
  const alla = processer()
  const servrar = alla ? hittaServrar(alla) : []
  const webblasare = alla ? hittaWebblasare(alla) : []
  const skal = alla ? hittaHangdaSkal(alla) : { antal: 0, toppar: [] }
  const bygg = [rot, ...ovriga.filter((k) => k.finns).map((k) => k.mapp)].flatMap(byggmappar)

  const inuti = path.join(rot, '.claude', 'worktrees')
  let skrap = []
  try {
    skrap = fs.readdirSync(inuti, { withFileTypes: true })
      .filter((e) => e.isDirectory() && !kopior.some((k) => samma(k.mapp, path.join(inuti, e.name))))
      .map((e) => path.join(inuti, e.name))
      .filter((d) => fs.readdirSync(d).length === 0)
  } catch {}

  const efter = Number(git(['rev-list', '--count', 'main..origin/main'], rot) ?? 0)
  let hamtat = null
  try { hamtat = Math.round((Date.now() - fs.statSync(path.join(rot, '.git', 'FETCH_HEAD')).mtimeMs) / 60000) } catch {}
  const rotStatus = (git(['status', '--porcelain'], rot) ?? '').split(/\r?\n/).filter(Boolean)
  const klaraGrenar = (git(['branch', '--merged', 'origin/main', '--format=%(refname:short)'], rot) ?? '')
    .split(/\r?\n/).filter((g) => g && g !== 'main' && !kopior.some((k) => k.gren === g))

  return {
    rot, ovriga, servrar, webblasare, skal, bygg, skrap, efter, hamtat, klaraGrenar,
    harProcesser: Boolean(alla),
    storst: alla ? storstPaMinne(alla, 4) : [],
    ledigt: os.freemem() / GB,
    totalt: os.totalmem() / GB,
    rotAndrat: rotStatus.filter((r) => !r.startsWith('??')).length,
    rotOsparat: rotStatus.filter((r) => r.startsWith('??')).length,
  }
}

const klarAttTaBort = (k) => k.finns && k.gren && k.utanfor === 0 && k.ocommittat === 0

function skrivLage(l) {
  const rader = []
  const trangt = l.ledigt < MINNESGRANS_GB
  rader.push(`Minne: ${tal(l.ledigt)} av ${tal(l.totalt)} GB ledigt.` + (l.storst.length ? ` Störst: ${l.storst.join(', ')}.` : ''))
  if (trangt) rader.push(`  VARNING: under ${MINNESGRANS_GB} GB. Starta ingen dev-server, inget bygge och inget webbläsartest förrän något har stängts. Säg till ägaren.`)

  const levande = l.servrar.filter((s) => !s.dod)
  const doda = l.servrar.filter((s) => s.dod)
  if (levande.length) rader.push(`Servrar igång: ${levande.map((s) => `${s.typ} port ${s.port} i ${path.basename(s.mapp)}`).join('; ')}.`)
  if (doda.length) rader.push(`VARNING: ${doda.length} föräldralösa servrar (port ${doda.map((s) => s.port).join(', ')}). Sessionen som startade dem är borta.`)
  const dodaWb = l.webblasare.filter((w) => w.dod)
  if (dodaWb.length) rader.push(`VARNING: ${dodaWb.length} kvarglömda testwebbläsare.`)
  if (l.skal.antal) rader.push(`VARNING: ${l.skal.antal} hängda skal från sessioner som inte finns kvar. De kan hålla mappar låsta.`)
  if (!l.harProcesser) rader.push('Processer gick inte att läsa den här gången.')

  if (l.bygg.length) rader.push(`VARNING: ${l.bygg.length} extra byggmappar: ${l.bygg.map((b) => `${path.basename(b.i)}/${b.namn}`).join(', ')}.`)
  if (l.skrap.length) rader.push(`VARNING: ${l.skrap.length} tomma mappar under .claude/worktrees.`)

  if (l.ovriga.length) {
    rader.push(`Arbetskopior: ${l.ovriga.length}.`)
    for (const k of l.ovriga) {
      const delar = [k.gren ?? 'ingen gren']
      if (!k.finns) delar.push('mappen saknas')
      else if (klarAttTaBort(k)) delar.push('inne i origin/main och ren, KAN TAS BORT')
      else delar.push(`${k.utanfor ?? '?'} commits utanför origin/main, ${k.ocommittat ?? '?'} ocommittade filer`)
      if (k.nodeModules === 'egen kopia') delar.push('egen node_modules (ska vara länkad)')
      if (k.mapp.toLowerCase().startsWith(l.rot.toLowerCase() + path.sep)) delar.push('LIGGER INUTI ROTMAPPEN, flytta ut')
      rader.push(`  ${k.mapp}: ${delar.join(', ')}`)
    }
    if (l.ovriga.length > MAX_ARBETSKOPIOR) rader.push(`  VARNING: fler än ${MAX_ARBETSKOPIOR}. Skapa ingen ny förrän en är borttagen.`)
  } else {
    rader.push('Arbetskopior: inga utöver rotmappen.')
  }

  rader.push(l.efter > 0
    ? `VARNING: main i rotmappen ligger ${l.efter} commits efter origin/main. Kör git pull --ff-only innan du läser kod där.`
    : `main i rotmappen är i takt med origin/main${l.hamtat !== null ? ` (hämtat för ${l.hamtat} min sedan)` : ''}.`)
  if (l.rotAndrat + l.rotOsparat > 0) rader.push(`Rotmappen: ${l.rotAndrat} ändrade och ${l.rotOsparat} ospårade filer som inte är committade.`)
  if (l.klaraGrenar.length > 10) rader.push(`${l.klaraGrenar.length} lokala grenar är redan inne i origin/main.`)
  return rader
}

const REGLER = [
  'Regler för arbetsytan (sedan städningen 2026-11-21):',
  '1. En arbetskopia per session, bredvid rotmappen (C:\\Users\\chris\\<namn>), aldrig inuti den. node_modules länkas mot rotmappens, aldrig npm ci i en kopia.',
  '2. Bygg till .next i den egna mappen. Behövs en egen byggmapp heter den .next-<något> och tas bort när testet är klart.',
  '3. Högst en server per session. Stäng servern och testwebbläsaren när testet är klart, inte när sessionen slutar.',
  '4. Det som ska sparas committas på grenen. Lägg inga lösa filer i rotmappen.',
  '5. När grenen är inne i origin/main: node scripts/arbetsyta.mjs stada --arbetskopior',
]

// ---------- städning ----------

function stada(l) {
  const gjort = []
  const gor = (text, fn) => {
    if (TORR) return gjort.push('skulle: ' + text)
    try { fn(); gjort.push('klart: ' + text) } catch (e) { gjort.push(`MISSLYCKADES: ${text} (${e.message})`) }
  }

  for (const s of l.servrar.filter((x) => x.dod)) gor(`stänga föräldralös ${s.typ} på port ${s.port} (pid ${s.pid})`, () => { if (!stang(s.pid)) throw new Error('taskkill nekade') })
  for (const w of l.webblasare.filter((x) => x.dod)) gor(`stänga kvarglömd testwebbläsare (pid ${w.pid})`, () => { if (!stang(w.pid)) throw new Error('taskkill nekade') })

  if (l.skal.antal) gor(`stänga ${l.skal.antal} hängda skal från döda sessioner`, () => { for (const s of l.skal.toppar) stang(s.pid) })

  const upptagna = l.servrar.filter((s) => !s.dod).map((s) => s.mapp.toLowerCase())
  for (const b of l.bygg) {
    const etikett = `${path.basename(b.i)}/${b.namn}`
    if (upptagna.includes(b.i.toLowerCase())) { gjort.push(`hoppar över ${etikett}: en server kör i mappen`); continue }
    if (b.farsk && !AVEN_FARSKA) { gjort.push(`hoppar över ${etikett}: yngre än två timmar`); continue }
    gor(`ta bort byggmappen ${etikett}`, () => fs.rmSync(b.full, { recursive: true, force: true, maxRetries: 3 }))
  }

  for (const d of l.skrap) gor(`ta bort tom mapp ${path.relative(l.rot, d)}`, () => fs.rmdirSync(d))

  if (MED_ARBETSKOPIOR) {
    const vakt = path.join(l.rot, 'node_modules', 'next', 'package.json')
    for (const k of l.ovriga) {
      if (BARA && k.namn !== BARA) continue
      if (!klarAttTaBort(k)) { gjort.push(`behåller ${k.namn}: inte inne i origin/main eller har ocommittade filer`); continue }
      if (upptagna.includes(k.mapp.toLowerCase())) { gjort.push(`behåller ${k.namn}: en server kör där`); continue }
      if (k.farsk && !AVEN_FARSKA) { gjort.push(`behåller ${k.namn}: yngre än två timmar`); continue }
      gor(`ta bort arbetskopian ${k.mapp} och grenen ${k.gren}`, () => {
        // Länken tas bort först och för sig, så att inget kan följa den in i rotmappens node_modules.
        const nm = path.join(k.mapp, 'node_modules')
        if (k.nodeModules === 'länkad') {
          try { fs.rmdirSync(nm) } catch { fs.unlinkSync(nm) }
          if (!fs.existsSync(vakt)) throw new Error('rotmappens node_modules ser skadad ut, avbryter')
        }
        // En egen node_modules är ignorerad av git och följer med när kopian tas bort.
        execFileSync('git', ['worktree', 'remove', k.mapp], { cwd: l.rot, stdio: 'ignore' })
        try { fs.rmdirSync(k.mapp) } catch {}
        git(['branch', '-d', k.gren], l.rot) // -d vägrar om grenen inte är inne i main
      })
    }
    if (!TORR) git(['worktree', 'prune'], l.rot)
  }

  if (MED_GRENAR) {
    for (const g of l.klaraGrenar) gor(`ta bort grenen ${g}`, () => { if (git(['branch', '-d', g], l.rot) === null) throw new Error('git vägrade') })
  }
  return gjort
}

// ---------- start ----------

try {
  const l = lage()
  if (!l) {
    if (!HOOK) console.log('Hittar inget git-repo här.')
    process.exit(0)
  }
  if (STADA) {
    const gjort = stada(l)
    console.log(gjort.length ? gjort.join('\n') : 'Inget att städa.')
    if (!MED_ARBETSKOPIOR && l.ovriga.some(klarAttTaBort)) console.log('Arbetskopior som kan tas bort finns kvar. Lägg till --arbetskopior.')
  } else if (HOOK) {
    console.log(['Arbetsytan just nu (node scripts/arbetsyta.mjs):', ...skrivLage(l).map((r) => '- ' + r), '', ...REGLER,
      'Vid VARNING ovan: kör node scripts/arbetsyta.mjs stada innan du börjar.'].join('\n'))
  } else {
    console.log(skrivLage(l).join('\n'))
    console.log('\n' + REGLER.join('\n'))
  }
} catch (e) {
  if (!HOOK) { console.error(e); process.exit(1) }
}
process.exit(0)
