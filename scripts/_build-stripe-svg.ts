/* Bygger de fyra Stripe-produktbilderna som SVG i public/stripe. Engångsverktyg. */
import { writeFile } from 'node:fs/promises'
import path from 'node:path'

const INK = '#1B1915'
const SW = 9

/** Gemensam ram: botten, gradientvask, bakgrundsgeometri, horisont, ordmärke. */
function frame(p: string, motif: string) {
  // Ordmärket sätts med riktigt typsnitt i render-stripe-images.ts, inte som paths.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024" fill="none">
  <defs>
    <linearGradient id="${p}Accent" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FB923C"/>
      <stop offset="0.55" stop-color="#F97316"/>
      <stop offset="1" stop-color="#EA580C"/>
    </linearGradient>
    <linearGradient id="${p}AccentV" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FB923C"/>
      <stop offset="0.55" stop-color="#F97316"/>
      <stop offset="1" stop-color="#EA580C"/>
    </linearGradient>
    <radialGradient id="${p}WashA" cx="0.06" cy="0.05" r="0.70">
      <stop offset="0" stop-color="#FB923C" stop-opacity="0.28"/>
      <stop offset="1" stop-color="#FB923C" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="${p}WashB" cx="0.95" cy="0.96" r="0.76">
      <stop offset="0" stop-color="#EA580C" stop-opacity="0.22"/>
      <stop offset="1" stop-color="#EA580C" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="${p}WashC" cx="0.96" cy="0.06" r="0.52">
      <stop offset="0" stop-color="#F97316" stop-opacity="0.13"/>
      <stop offset="1" stop-color="#F97316" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect x="0" y="0" width="1024" height="1024" fill="#FFFCF9"/>
  <rect x="0" y="0" width="1024" height="1024" fill="url(#${p}WashA)"/>
  <rect x="0" y="0" width="1024" height="1024" fill="url(#${p}WashB)"/>
  <rect x="0" y="0" width="1024" height="1024" fill="url(#${p}WashC)"/>

  <g fill="none" stroke="${INK}" stroke-linecap="round" stroke-linejoin="round">
    <g opacity="0.07" stroke-width="10">
      <circle cx="512" cy="462" r="392"/>
      <circle cx="512" cy="462" r="302"/>
    </g>
    <g opacity="0.05" stroke-width="26">
      <path d="M-40 246 L296 -90"/>
      <path d="M764 1090 L1100 754"/>
    </g>
  </g>

  <path d="M176 792 H848" stroke="${INK}" stroke-opacity="0.16" stroke-width="9" stroke-linecap="round"/>

${motif}
</svg>
`
}

/** Mjuk markskugga under motivet, platt halvtransparent form. */
const shadow = (rx: number) =>
  `  <ellipse cx="512" cy="792" rx="${rx}" ry="30" fill="${INK}" opacity="0.09"/>`

/* ---------- Dagspass: klocka med 24h-segment och dokument i mitten ---------- */
function dagspass() {
  const p = 'dp'
  const m = `${shadow(236)}
  <g stroke="${INK}" stroke-width="${SW}" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="512" cy="462" r="236" fill="#FFFFFF"/>
    <path d="M512 226 A236 236 0 0 1 748 462 L512 462 Z" fill="url(#${p}Accent)" stroke="none"/>
    <circle cx="512" cy="462" r="236"/>
    <circle cx="512" cy="462" r="194" stroke-opacity="0.16" stroke-width="7" fill="none"/>
    <g stroke-width="10">
      <path d="M512 250 V280"/>
      <path d="M512 644 V674"/>
      <path d="M300 462 H330"/>
      <path d="M694 462 H724"/>
      <path d="M662 312 L641 333"/>
      <path d="M662 612 L641 591"/>
      <path d="M362 612 L383 591"/>
      <path d="M362 312 L383 333"/>
    </g>
  </g>

  <g stroke="${INK}" stroke-width="${SW}" stroke-linecap="round" stroke-linejoin="round">
    <path d="M512 462 V312"/>
    <path d="M512 462 H648"/>
  </g>
  <circle cx="512" cy="462" r="18" fill="${INK}"/>
  <circle cx="512" cy="462" r="6" fill="#FFFCF9"/>

  <g>
    <circle cx="656" cy="678" r="86" fill="#FFFCF9"/>
    <rect x="624" y="636" width="64" height="80" rx="10" fill="#FFFFFF" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>
    <g stroke="${INK}" stroke-width="8" stroke-linecap="round" stroke-opacity="0.30">
      <path d="M640 658 H672"/>
      <path d="M640 676 H672"/>
    </g>
    <rect x="640" y="690" width="26" height="10" rx="5" fill="url(#${p}Accent)"/>
  </g>`
  return frame(p, m)
}

/* ---------- Vecka: sju staplar, sista orange, brevark lutat mot dem ---------- */
function vecka() {
  const p = 'vk'
  const barW = 62
  const gap = 18
  const n = 7
  const totalW = n * barW + (n - 1) * gap // 542
  // Stapelraden förskjuten åt höger, brevarket får plats till vänster.
  const x0 = 512 - totalW / 2 + 76
  const base = 780
  const heights = [318, 318, 318, 318, 318, 318, 372]

  const bars = heights
    .map((h, i) => {
      const x = x0 + i * (barW + gap)
      const y = base - h
      const last = i === n - 1
      return last
        ? `    <rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="22" fill="url(#${p}AccentV)"/>`
        : `    <rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="22" fill="#FFFFFF" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>`
    })
    .join('\n')

  const m = `${shadow(320)}
  <g>
${bars}
  </g>

  <g transform="translate(-78 -14) rotate(-13 262 780)">
    <rect x="176" y="516" width="172" height="264" rx="16" fill="${INK}" opacity="0.10" transform="translate(9 9)"/>
    <rect x="176" y="516" width="172" height="264" rx="16" fill="#FFFFFF" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>
    <g stroke="${INK}" stroke-width="9" stroke-linecap="round" stroke-opacity="0.28">
      <path d="M210 562 H314"/>
      <path d="M210 600 H314"/>
      <path d="M210 638 H314"/>
      <path d="M210 676 H272"/>
    </g>
    <rect x="210" y="708" width="60" height="14" rx="7" fill="url(#${p}Accent)"/>
  </g>`
  return frame(p, m)
}

/* ---------- Månad: kalenderark med rutnät och upprepningssymbol i hörnet ---------- */
function manad() {
  const p = 'mn'
  const x = 256
  const y = 244
  const w = 512
  const h = 470
  const headH = 108

  const cells: string[] = []
  const cols = 5
  const rows = 4
  const cw = 68
  const ch = 52
  const gx = 24
  const gy = 22
  const gridW = cols * cw + (cols - 1) * gx
  const gridH = rows * ch + (rows - 1) * gy
  const gx0 = x + (w - gridW) / 2
  const gy0 = y + headH + (h - headH - gridH) / 2
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push(
        `    <rect x="${gx0 + c * (cw + gx)}" y="${gy0 + r * (ch + gy)}" width="${cw}" height="${ch}" rx="12" fill="${INK}" opacity="0.16"/>`
      )
    }
  }

  const m = `${shadow(268)}
  <rect x="${x + 12}" y="${y + 12}" width="${w}" height="${h}" rx="34" fill="${INK}" opacity="0.10"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="34" fill="#FFFFFF" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>
  <path d="M${x} ${y + headH} H${x + w}" stroke="${INK}" stroke-width="${SW}" stroke-linecap="round"/>
  <g stroke="${INK}" stroke-width="${SW}" stroke-linecap="round">
    <path d="M366 200 V282"/>
    <path d="M658 200 V282"/>
  </g>
  <g>
${cells.join('\n')}
  </g>

  <g>
    <circle cx="762" cy="706" r="98" fill="#FFFCF9"/>
    <circle cx="762" cy="706" r="84" fill="url(#${p}Accent)"/>
    <g fill="none" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">
      <path d="M720 698 A42 42 0 0 1 790 668"/>
      <path d="M804 714 A42 42 0 0 1 734 744"/>
      <path d="M792 642 V670 H764"/>
      <path d="M732 770 V742 H760"/>
    </g>
  </g>`
  return frame(p, m)
}

/* ---------- Kvartal: tre kalenderark i förskjuten stapel ---------- */
function kvartal() {
  const p = 'kv'
  const w = 392
  const h = 330
  const headH = 76
  // Bakersta arket överst-höger, främsta nederst-vänster.
  const sheets = [
    { x: 428, y: 232, o: 0.38 },
    { x: 372, y: 326, o: 0.66 },
    { x: 316, y: 420, o: 1 },
  ]

  const back = sheets
    .slice(0, 2)
    .map(
      (s) =>
        `  <g opacity="${s.o}">
    <rect x="${s.x}" y="${s.y}" width="${w}" height="${h}" rx="30" fill="#FFFFFF" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>
    <path d="M${s.x} ${s.y + headH} H${s.x + w}" stroke="${INK}" stroke-width="${SW}" stroke-linecap="round"/>
  </g>`
    )
    .join('\n')

  const f = sheets[2]
  const rowY = f.y + headH + 46
  const front = `  <rect x="${f.x + 12}" y="${f.y + 12}" width="${w}" height="${h}" rx="30" fill="${INK}" opacity="0.10"/>
  <rect x="${f.x}" y="${f.y}" width="${w}" height="${h}" rx="30" fill="#FFFFFF" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>
  <path d="M${f.x} ${f.y + headH} H${f.x + w}" stroke="${INK}" stroke-width="${SW}" stroke-linecap="round"/>
  <rect x="${f.x + 40}" y="${rowY}" width="118" height="60" rx="14" fill="url(#${p}Accent)"/>
  <rect x="${f.x + 178}" y="${rowY}" width="150" height="60" rx="14" fill="${INK}" opacity="0.16"/>
  <rect x="${f.x + 40}" y="${rowY + 84}" width="288" height="34" rx="17" fill="${INK}" opacity="0.16"/>`

  const m = `${shadow(258)}
${back}
${front}`
  return frame(p, m)
}

/* ---------- CV-veckan: CV-ark med poängring och fynd ---------- */
function cvVeckan() {
  const p = 'cv'
  const m = `${shadow(300)}
  <g transform="rotate(-6 420 560)">
    <rect x="292" y="252" width="300" height="420" rx="22" fill="${INK}" opacity="0.10" transform="translate(10 10)"/>
    <rect x="292" y="252" width="300" height="420" rx="22" fill="#FFFFFF" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>
    <g stroke="${INK}" stroke-width="10" stroke-linecap="round" stroke-opacity="0.28">
      <path d="M340 322 H470"/>
      <path d="M340 372 H544"/>
      <path d="M340 422 H510"/>
      <path d="M340 500 H544"/>
      <path d="M340 550 H470"/>
      <path d="M340 600 H526"/>
    </g>
    <rect x="336" y="408" width="182" height="28" rx="8" fill="#FB923C" opacity="0.35"/>
    <rect x="336" y="586" width="150" height="28" rx="8" fill="#FB923C" opacity="0.35"/>
  </g>
  <circle cx="676" cy="330" r="118" fill="#FFFFFF" stroke="${INK}" stroke-width="${SW}"/>
  <circle cx="676" cy="330" r="118" fill="none" stroke="url(#${p}Accent)" stroke-width="22" stroke-linecap="round" stroke-dasharray="555 740" transform="rotate(-90 676 330)"/>
  <g stroke="${INK}" stroke-width="10" stroke-linecap="round">
    <path d="M642 330 L666 354 L714 302"/>
  </g>
  <circle cx="640" cy="560" r="30" fill="url(#${p}Accent)"/>
  <path d="M626 560 L636 570 L656 548" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <circle cx="640" cy="660" r="30" fill="${INK}"/>
  <path d="M626 660 H654" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" fill="none"/>`
  return frame(p, m)
}

/* ---------- Testveckan: matrislogik med saknad ruta och klocka ---------- */
function testVeckan() {
  const p = 'tv'
  const g0 = 250, cell = 130, gap = 10
  const cells: string[] = []
  const shapes = ['c', 's', 't', 's', 't', 'c', 't', 'c', '?']
  for (let i = 0; i < 9; i++) {
    const r = Math.floor(i / 3), c = i % 3
    const x = g0 + c * (cell + gap), y = g0 + r * (cell + gap)
    const cx = x + cell / 2, cy = y + cell / 2
    if (shapes[i] === '?') {
      cells.push(`    <rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="18" fill="url(#${p}Accent)"/>`)
      cells.push(`    <path d="M${cx - 24} ${cy - 24} a24 24 0 1 1 38 20 c-9 7 -14 12 -14 26" fill="none" stroke="#FFFFFF" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>`)
      cells.push(`    <circle cx="${cx}" cy="${cy + 48}" r="8" fill="#FFFFFF"/>`)
      continue
    }
    cells.push(`    <rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="18" fill="#FFFFFF" stroke="${INK}" stroke-width="${SW}"/>`)
    if (shapes[i] === 'c') cells.push(`    <circle cx="${cx}" cy="${cy}" r="34" fill="none" stroke="${INK}" stroke-width="${SW}"/>`)
    if (shapes[i] === 's') cells.push(`    <rect x="${cx - 32}" y="${cy - 32}" width="64" height="64" rx="10" fill="none" stroke="${INK}" stroke-width="${SW}"/>`)
    if (shapes[i] === 't') cells.push(`    <path d="M${cx} ${cy - 36} L${cx + 38} ${cy + 30} H${cx - 38} Z" fill="none" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>`)
  }
  const m = `${shadow(300)}
  <rect x="${g0 - 12 + 10}" y="${g0 - 12 + 10}" width="${3 * cell + 2 * gap + 24}" height="${3 * cell + 2 * gap + 24}" rx="30" fill="${INK}" opacity="0.10"/>
  <rect x="${g0 - 12}" y="${g0 - 12}" width="${3 * cell + 2 * gap + 24}" height="${3 * cell + 2 * gap + 24}" rx="30" fill="#FFFCF9" stroke="${INK}" stroke-width="${SW}"/>
${cells.join('\n')}
  <circle cx="740" cy="300" r="96" fill="#FFFFFF" stroke="${INK}" stroke-width="${SW}"/>
  <path d="M740 300 m0 -96 a96 96 0 0 1 96 96" fill="none" stroke="url(#${p}Accent)" stroke-width="20" stroke-linecap="round"/>
  <g stroke="${INK}" stroke-width="10" stroke-linecap="round">
    <path d="M740 244 V300 L784 326"/>
    <path d="M716 190 H764"/>
  </g>`
  return frame(p, m)
}

/* ---------- Allt-veckan: tre ark på tråden ---------- */
function alltVeckan() {
  const p = 'av'
  const ark = (x: number, y: number, w: number, h: number, rot: number, lines: number[]) => `
  <g transform="rotate(${rot} ${x + w / 2} ${y + h / 2})">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="20" fill="${INK}" opacity="0.10" transform="translate(10 10)"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="20" fill="#FFFFFF" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>
    <g stroke="${INK}" stroke-width="10" stroke-linecap="round" stroke-opacity="0.28">
      ${lines.map((l, i) => `<path d="M${x + 40} ${y + 60 + i * 48} H${x + 40 + l}"/>`).join('\n      ')}
    </g>
  </g>`
  const m = `${shadow(330)}
${ark(200, 300, 220, 320, -8, [120, 140, 100, 140])}
${ark(600, 290, 220, 320, 8, [140, 100, 140, 120])}
${ark(392, 240, 240, 380, 0, [160, 120, 160, 100, 160])}
  <g transform="translate(392 240)">
    <rect x="40" y="290" width="86" height="22" rx="11" fill="url(#${p}Accent)"/>
  </g>
  <path d="M176 792 H848" stroke="#F97316" stroke-width="12" stroke-linecap="round"/>
  <circle cx="310" cy="792" r="22" fill="${INK}"/>
  <path d="M298 792 L307 801 L324 782" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <circle cx="512" cy="792" r="26" fill="#FFFFFF" stroke="${INK}" stroke-width="${SW}"/>
  <circle cx="512" cy="792" r="11" fill="url(#${p}Accent)"/>
  <circle cx="710" cy="792" r="22" fill="#FFFFFF" stroke="${INK}" stroke-width="${SW}" stroke-opacity="0.4"/>`
  return frame(p, m)
}

async function main() {
  const dir = path.join(process.cwd(), 'public', 'stripe')
  const files: [string, string][] = [
    ['premium-dagspass.svg', dagspass()],
    ['premium-vecka.svg', vecka()],
    ['premium-manad.svg', manad()],
    ['premium-kvartal.svg', kvartal()],
    ['cv-veckan.svg', cvVeckan()],
    ['testveckan.svg', testVeckan()],
    ['allt-veckan.svg', alltVeckan()],
  ]
  for (const [name, svg] of files) {
    await writeFile(path.join(dir, name), svg, 'utf8')
    console.log('skrev', name, svg.length, 'tecken')
  }
}

main()
