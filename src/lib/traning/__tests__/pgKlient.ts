// Testhjälp: en liten Supabase-lik klient över PGlite, med just de delar av
// query-buildern som testmotorn använder (select/insert/update/upsert/delete,
// eq/neq/is/not/in/gte, order, limit, single/maybeSingle, rpc). Kör allt som
// service_role, som admin-klienten i produktionen. Bara för tester.

/* eslint-disable @typescript-eslint/no-explicit-any */

type Db = {
  transaction: <T>(fn: (tx: any) => Promise<T>) => Promise<T>
  query: (sql: string, params?: unknown[]) => Promise<{ rows: any[] }>
}

type Svar = { data: any; error: { code?: string; message: string } | null }

const typer = new Map<string, Map<string, string>>()

async function kolumntyper(db: Db, tabell: string): Promise<Map<string, string>> {
  const f = typer.get(tabell)
  if (f) return f
  const r = await db.query(
    `select column_name, udt_name from information_schema.columns where table_schema = 'public' and table_name = $1`,
    [tabell]
  )
  const m = new Map<string, string>(r.rows.map((x: any) => [x.column_name, x.udt_name]))
  typer.set(tabell, m)
  return m
}

function cast(udt: string | undefined): string {
  if (!udt) return ''
  if (udt === 'jsonb' || udt === 'json') return '::jsonb'
  if (udt.startsWith('_')) return `::${udt.slice(1)}[]`
  return `::${udt}`
}

function varde(udt: string | undefined, v: unknown): unknown {
  if (v === undefined) return null
  if ((udt === 'jsonb' || udt === 'json') && v !== null) return JSON.stringify(v)
  return v
}

async function kor(db: Db, sql: string, params: unknown[]): Promise<{ rows: any[] } | { fel: { code?: string; message: string } }> {
  return db.transaction(async (tx) => {
    await tx.exec('set local role service_role;')
    try {
      const r = await tx.query(sql, params)
      return { rows: r.rows }
    } catch (e: any) {
      return { fel: { code: e.code, message: e.message } }
    }
  })
}

class Bygg implements PromiseLike<Svar> {
  private op: 'select' | 'insert' | 'update' | 'upsert' | 'delete' | null = null
  private kolumner = '*'
  private retur: string | null = null
  private filter: { kol: string; sql: (n: number) => string; v?: unknown; utanParam?: boolean }[] = []
  private ordning: string[] = []
  private gräns: number | null = null
  private last: Record<string, unknown> | null = null
  private konflikt: string | null = null
  private lage: 'lista' | 'single' | 'maybe' = 'lista'

  constructor(private db: Db, private tabell: string) {}

  select(kol = '*') {
    if (this.op === null) {
      this.op = 'select'
      this.kolumner = kol
    } else this.retur = kol
    return this
  }
  insert(rad: Record<string, unknown>) {
    this.op = 'insert'
    this.last = rad
    return this
  }
  update(rad: Record<string, unknown>) {
    this.op = 'update'
    this.last = rad
    return this
  }
  upsert(rad: Record<string, unknown>, opt?: { onConflict?: string }) {
    this.op = 'upsert'
    this.last = rad
    this.konflikt = opt?.onConflict ?? 'id'
    return this
  }
  delete() {
    this.op = 'delete'
    return this
  }
  eq(kol: string, v: unknown) {
    this.filter.push({ kol, sql: (n) => `"${kol}" = $${n}`, v })
    return this
  }
  neq(kol: string, v: unknown) {
    this.filter.push({ kol, sql: (n) => `"${kol}" <> $${n}`, v })
    return this
  }
  gte(kol: string, v: unknown) {
    this.filter.push({ kol, sql: (n) => `"${kol}" >= $${n}`, v })
    return this
  }
  in(kol: string, v: unknown[]) {
    this.filter.push({ kol, sql: (n) => `"${kol}" = any($${n})`, v })
    return this
  }
  is(kol: string, v: null) {
    void v
    this.filter.push({ kol, sql: () => `"${kol}" is null`, utanParam: true })
    return this
  }
  not(kol: string, op: 'is', v: null) {
    void op
    void v
    this.filter.push({ kol, sql: () => `"${kol}" is not null`, utanParam: true })
    return this
  }
  order(kol: string, opt?: { ascending?: boolean }) {
    this.ordning.push(`"${kol}" ${opt?.ascending === false ? 'desc' : 'asc'}`)
    return this
  }
  limit(n: number) {
    this.gräns = n
    return this
  }
  single() {
    this.lage = 'single'
    return this
  }
  maybeSingle() {
    this.lage = 'maybe'
    return this
  }

  private async kör(): Promise<Svar> {
    const t = await kolumntyper(this.db, this.tabell)
    const params: unknown[] = []
    const p = (v: unknown, kol?: string) => {
      params.push(kol ? varde(t.get(kol), v) : v)
      return `$${params.length}${kol ? cast(t.get(kol)) : ''}`
    }
    const where = () => {
      const delar = this.filter.map((f) => (f.utanParam ? f.sql(0) : f.sql(params.push(f.v))))
      return delar.length ? ` where ${delar.join(' and ')}` : ''
    }
    const kol = (s: string) => s.split(',').map((x) => x.trim()).join(', ')
    let sql = ''
    const tab = `public.${this.tabell}`
    switch (this.op) {
      case 'select':
        sql = `select ${kol(this.kolumner)} from ${tab}${where()}`
        if (this.ordning.length) sql += ` order by ${this.ordning.join(', ')}`
        if (this.gräns != null) sql += ` limit ${this.gräns}`
        break
      case 'insert':
      case 'upsert': {
        const k = Object.keys(this.last!).filter((x) => this.last![x] !== undefined)
        sql = `insert into ${tab} (${k.map((x) => `"${x}"`).join(', ')}) values (${k.map((x) => p(this.last![x], x)).join(', ')})`
        if (this.op === 'upsert') {
          const set = k.filter((x) => x !== this.konflikt).map((x) => `"${x}" = excluded."${x}"`)
          sql += ` on conflict (${this.konflikt}) do update set ${set.join(', ')}`
        }
        if (this.retur) sql += ` returning ${kol(this.retur)}`
        break
      }
      case 'update': {
        const k = Object.keys(this.last!).filter((x) => this.last![x] !== undefined)
        const set = k.map((x) => `"${x}" = ${p(this.last![x], x)}`)
        sql = `update ${tab} set ${set.join(', ')}${where()}`
        if (this.retur) sql += ` returning ${kol(this.retur)}`
        break
      }
      case 'delete':
        sql = `delete from ${tab}${where()}`
        break
      default:
        return { data: null, error: { message: 'ingen operation' } }
    }
    const r = await kor(this.db, sql, params)
    if ('fel' in r) return { data: null, error: r.fel }
    const harRader = this.op === 'select' || this.retur != null
    if (!harRader) return { data: null, error: null }
    if (this.lage === 'lista') return { data: r.rows, error: null }
    if (r.rows.length > 1) return { data: null, error: { code: 'PGRST116', message: 'flera rader' } }
    if (r.rows.length === 0) {
      return this.lage === 'maybe' ? { data: null, error: null } : { data: null, error: { code: 'PGRST116', message: 'inga rader' } }
    }
    return { data: r.rows[0], error: null }
  }

  then<A = Svar, B = never>(ok?: ((v: Svar) => A | PromiseLike<A>) | null, nej?: ((e: unknown) => B | PromiseLike<B>) | null) {
    return this.kör().then(ok, nej)
  }
}

export function pgKlient(db: Db) {
  return {
    from: (tabell: string) => new Bygg(db, tabell),
    async rpc(namn: string, args: Record<string, unknown>): Promise<Svar> {
      const f = await db.query(
        `select p.proargnames as namn, array(select format_type(t, null) from unnest(p.proargtypes) t) as typer
           from pg_proc p join pg_namespace n on n.oid = p.pronamespace
          where n.nspname = 'public' and p.proname = $1`,
        [namn]
      )
      if (!f.rows[0]) return { data: null, error: { code: 'PGRST202', message: `${namn} saknas` } }
      const namnen: string[] = f.rows[0].namn
      const typerna: string[] = f.rows[0].typer
      const params: unknown[] = []
      const delar: string[] = []
      for (const [k, v] of Object.entries(args)) {
        const i = namnen.indexOf(k)
        const typ = typerna[i]
        params.push(typ === 'jsonb' && v != null ? JSON.stringify(v) : v ?? null)
        delar.push(`${k} => $${params.length}::${typ}`)
      }
      const r = await kor(db, `select public.${namn}(${delar.join(', ')}) as r`, params)
      if ('fel' in r) return { data: null, error: r.fel }
      return { data: r.rows[0].r, error: null }
    },
  }
}
