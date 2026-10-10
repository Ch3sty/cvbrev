// scripts/testmotorn-pglite.mjs
// Lokal verifiering av testmotorns migreringar (våg 3a) i PGlite, mot
// prod-schemat för testsessionerna (scripts/testmotorn-pglite-schema.mjs):
// RLS, att bara servern skriver, att avslutet är atomärt, att oblandade
// sessioner aldrig ger nivåpunkt eller frågestatistik och att undantagna
// konton aldrig räknas in i frågestatistiken.
//
//   npm i --no-save @electric-sql/pglite && node scripts/testmotorn-pglite.mjs
import { PGlite } from '@electric-sql/pglite'
import { byggSchema, PARSERS, som as somDb } from './testmotorn-pglite-schema.mjs'

const U1 = '11111111-1111-1111-1111-111111111111'
const U2 = '22222222-2222-2222-2222-222222222222'
const QA = '33333333-3333-3333-3333-333333333333'
const ADM = '99999999-9999-9999-9999-999999999999'

const db = new PGlite({ parsers: PARSERS })
await byggSchema(db, {
  konton: [
    [U1, 'anna@example.se'],
    [U2, 'bo@example.se'],
    [QA, 'qa-testmotorn@jobbcoach.ai'],
    [ADM, 'agare@example.se'],
  ],
  admin: [ADM],
})
const som = (roll, uid, sql, params) => somDb(db, roll, uid, sql, params)

let fel = 0
const ok = (namn, villkor, extra = '') => {
  console.log(`${villkor ? 'OK  ' : 'FEL '} ${namn}${extra ? '  ' + extra : ''}`)
  if (!villkor) fel++
}

const nySession = async (uid, meta = { alternativ_blandade: true, traning: 1, typ: 'matning' }) => {
  const r = await som('service_role', null, `insert into public.logic_test_v4_sessions(user_id, test_type, meta) values ($1, 'matrislogik-matning', $2::jsonb) returning id`, [uid, JSON.stringify(meta)])
  return r.rows[0].id
}
const slutfor = (sid, uid, { punkt, stat, mil = [] } = {}) =>
  som('service_role', null, `select public.slutfor_traningssession($1, $2, 7, 300, $3::jsonb, $4::jsonb, $5::jsonb, $6::text[]) r`, [
    sid,
    uid,
    JSON.stringify({ niva_efter: punkt?.niva ?? null }),
    punkt ? JSON.stringify(punkt) : null,
    stat ? JSON.stringify(stat) : null,
    mil,
  ])
const STAT = [
  { fraga_id: 'v7g-q1', test_kind: 'matris', correct: true, tid_s: 30, selected: 2 },
  { fraga_id: 'v7g-q2', test_kind: 'matris', correct: false, tid_s: 50, selected: 4 },
  { fraga_id: 'v7g-q3', test_kind: 'matris', correct: false, tid_s: 20, selected: -1 },
]

// --------------------------------------------------------------- Avslutet
console.log('\n== slutfor_traningssession ==')
const s1 = await nySession(U1)
let r = await slutfor(s1, U1, { punkt: { test_kind: 'matris', dag: '2026-10-06', typ: 'matning', niva: 5.0 }, stat: STAT, mil: ['forsta_matningen'] })
ok('service_role avslutar en blandad mätning', r.ok && r.rows[0].r.slutford === true, JSON.stringify(r.rows?.[0] ?? r.error))
ok('  nivåpunkten skrevs', r.rows[0].r.nivapunkt === true)
ok('  tre svar i frågestatistiken', r.rows[0].r.statistik === 3)
ok('  milstolpen var ny', JSON.stringify(r.rows[0].r.nya_milstolpar) === '["forsta_matningen"]')
r = await som(null, null, `select completed_at is not null as klar, score, time_spent, meta from public.logic_test_v4_sessions where id = $1`, [s1])
ok('  sessionen avslutad med poäng, tid och meta sammanslagen', r.rows[0].klar && r.rows[0].score === 7 && r.rows[0].time_spent === 300 && r.rows[0].meta.traning === 1 && r.rows[0].meta.niva_efter === 5)
r = await som(null, null, `select niva, typ, dag from public.test_nivapunkter where user_id = $1`, [U1])
ok('  punkten: 5,0, matning, 2026-10-06', r.rows.length === 1 && r.rows[0].niva === 5 && r.rows[0].dag === '2026-10-06', JSON.stringify(r.rows))
r = await som(null, null, `select fraga_id, antal, ratt, tid_summa, valfordelning from public.fraga_statistik order by fraga_id`)
ok('  statistiken per originalindex, "Vet inte" som vet_inte', r.rows.length === 3 && r.rows[0].valfordelning['2'] === 1 && r.rows[2].valfordelning.vet_inte === 1, JSON.stringify(r.rows))

r = await slutfor(s1, U1, { punkt: { test_kind: 'matris', dag: '2026-10-06', typ: 'matning', niva: 9 }, stat: STAT })
ok('en avslutad session går inte att avsluta igen', r.ok && r.rows[0].r.slutford === false)
r = await som(null, null, `select sum(antal)::int n from public.fraga_statistik`)
ok('  och räknas inte in två gånger', r.rows[0].n === 3)

const s2 = await nySession(U1)
r = await slutfor(s2, U2, { punkt: { test_kind: 'matris', dag: '2026-10-07', typ: 'pass', niva: 9 } })
ok('fel konto: inget avslut, ingen punkt', r.rows[0].r.slutford === false)
r = await som(null, null, `select count(*)::int n from public.test_nivapunkter where user_id = $1`, [U2])
ok('  ingen punkt hos det andra kontot', r.rows[0].n === 0)

// Samma dag och typ: senaste passet skriver över.
const s3 = await nySession(U1, { alternativ_blandade: true, traning: 1, typ: 'pass' })
await slutfor(s3, U1, { punkt: { test_kind: 'matris', dag: '2026-10-07', typ: 'pass', niva: 5.2 } })
const s4 = await nySession(U1, { alternativ_blandade: true, traning: 1, typ: 'pass' })
await slutfor(s4, U1, { punkt: { test_kind: 'matris', dag: '2026-10-07', typ: 'pass', niva: 5.3 } })
r = await som(null, null, `select niva, session_id from public.test_nivapunkter where user_id = $1 and dag = '2026-10-07'`, [U1])
ok('två pass samma dag: en punkt, den senaste', r.rows.length === 1 && r.rows[0].niva === 5.3 && r.rows[0].session_id === s4)

// --------------------------------------------------------------- 12.5
console.log('\n== Oblandade sessioner och undantagna konton (12.5) ==')
const gammal = await nySession(U2, { traning: 1, typ: 'pass' })
r = await slutfor(gammal, U2, { punkt: { test_kind: 'matris', dag: '2026-10-08', typ: 'pass', niva: 6 }, stat: STAT })
ok('oblandad session avslutas', r.rows[0].r.slutford === true)
ok('  men ger ingen nivåpunkt och ingen statistik', r.rows[0].r.nivapunkt === false && r.rows[0].r.statistik === 0)
const qa = await nySession(QA)
r = await slutfor(qa, QA, { punkt: { test_kind: 'matris', dag: '2026-10-08', typ: 'matning', niva: 6 }, stat: STAT })
ok('testkontot (qa-) får sin punkt', r.rows[0].r.nivapunkt === true)
ok('  men räknas aldrig in i frågestatistiken', r.rows[0].r.statistik === 0)
const adm = await nySession(ADM)
r = await slutfor(adm, ADM, { stat: STAT })
ok('ägarens konto räknas inte heller', r.rows[0].r.statistik === 0)
r = await som(null, null, `select sum(antal)::int n from public.fraga_statistik`)
ok('  statistiken står kvar på 3 svar', r.rows[0].n === 3)

// --------------------------------------------------------------- Atomärt
console.log('\n== Atomärt ==')
const s5 = await nySession(U2)
r = await slutfor(s5, U2, { punkt: { test_kind: 'matris', dag: '2026-10-09', typ: 'okand_typ', niva: 5 }, stat: STAT })
ok('en ogiltig punkt fäller hela avslutet', !r.ok, r.error)
r = await som(null, null, `select completed_at from public.logic_test_v4_sessions where id = $1`, [s5])
ok('  sessionen är fortfarande oavslutad', r.rows[0].completed_at === null)
r = await som(null, null, `select sum(antal)::int n from public.fraga_statistik`)
ok('  och statistiken orörd', r.rows[0].n === 3)
r = await slutfor(s5, U2, { punkt: { test_kind: 'matris', dag: '2026-10-09', typ: 'matning', niva: 5 }, mil: ['inte_ett_marke'] })
ok('en okänd milstolpe fäller också avslutet', !r.ok, r.error)

// --------------------------------------------------------------- RLS
console.log('\n== RLS och skrivspärr ==')
await som('service_role', null, `insert into public.test_planer(user_id, provdatum, leverantor) values ($1, '2026-10-24', 'matrigma')`, [U1])
r = await som('authenticated', U1, `select provdatum from public.test_planer`)
ok('ägaren läser sin plan', r.ok && r.rows.length === 1 && r.rows[0].provdatum === '2026-10-24', r.error)
r = await som('authenticated', U2, `select * from public.test_planer`)
ok('ett annat konto ser ingen plan', r.ok && r.rows.length === 0)
r = await som('authenticated', U1, `update public.test_planer set sikte = 9 where user_id = $1`, [U1])
ok('authenticated kan INTE ändra sin plan', !r.ok || r.affected === 0, r.error)
r = await som('authenticated', U1, `insert into public.test_planer(user_id) values ($1)`, [U2])
ok('authenticated kan INTE skapa en plan', !r.ok, r.error)
r = await som('authenticated', U1, `select niva from public.test_nivapunkter`)
ok('ägaren läser sina nivåpunkter', r.ok && r.rows.length === 2, JSON.stringify(r.rows ?? r.error))
r = await som('authenticated', U2, `select niva from public.test_nivapunkter where user_id = $1`, [U1])
ok('ett annat konto läser inte U1:s nivåpunkter', r.ok && r.rows.length === 0)
r = await som('authenticated', U1, `insert into public.test_nivapunkter(user_id, test_kind, dag, typ, niva) values ($1, 'matris', '2026-10-10', 'pass', 7.5)`, [U1])
ok('authenticated kan INTE skriva en nivåpunkt', !r.ok, r.error)
r = await som('authenticated', U1, `update public.test_nivapunkter set niva = 7.5`)
ok('authenticated kan INTE höja sin nivå', !r.ok || r.affected === 0, r.error)
r = await som('authenticated', U1, `select nyckel from public.test_milstolpar`)
ok('ägaren läser sina milstolpar', r.ok && r.rows.length === 1)
r = await som('authenticated', U1, `update public.test_milstolpar set visad_at = now()`)
ok('authenticated kan INTE ändra milstolpar', !r.ok || r.affected === 0, r.error)
r = await som('authenticated', U1, `select * from public.fraga_statistik`)
ok('authenticated läser INTE frågestatistiken', !r.ok || r.rows.length === 0, r.error)
r = await som('anon', null, `select * from public.test_nivapunkter`)
ok('anon läser inga nivåpunkter', !r.ok || r.rows.length === 0, r.error)
for (const f of [
  `select public.slutfor_traningssession('${s5}', '${U1}', 15, 1, '{}'::jsonb, null, null, '{}'::text[])`,
  `select public.uppdatera_fraga_statistik('[]'::jsonb, '${U1}')`,
  `select public.registrera_milstolpar('${U1}', array['provdagen'])`,
]) {
  const a = await som('authenticated', U1, f)
  ok(`authenticated får inte köra ${f.match(/public\.(\w+)/)[1]}`, !a.ok, a.error)
}
r = await som('service_role', null, `select public.registrera_milstolpar($1, array['forsta_matningen','provdagen']) n`, [U1])
ok('registrera_milstolpar returnerar bara nya märken', JSON.stringify(r.rows[0].n) === '["provdagen"]', JSON.stringify(r.rows))

// Triggern som sista spärr: någon lägger tillbaka rättighet och policy.
await db.exec(`grant insert, update on public.test_nivapunkter to authenticated;
  create policy aterinford on public.test_nivapunkter for all using (true) with check (true);`)
r = await som('authenticated', U1, `update public.test_nivapunkter set niva = 7.5 where user_id = $1`, [U1])
ok('triggern stoppar authenticated även om policy och rättighet återinförs', !r.ok && /skrivs bara av servern/.test(r.error), r.error)
r = await som(null, null, `update public.test_nivapunkter set niva = 5.4 where user_id = $1 and dag = '2026-10-07'`, [U1])
ok('postgres (migreringar) påverkas inte', r.ok && r.affected === 1, r.error)

console.log(fel === 0 ? '\nALLA KONTROLLER GICK IGENOM' : `\n${fel} KONTROLLER MISSLYCKADES`)
process.exit(fel ? 1 : 0)
