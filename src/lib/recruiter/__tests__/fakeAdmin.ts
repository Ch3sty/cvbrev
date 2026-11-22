// En liten Supabase-attrapp i minnet för rekryterarvägarnas tester. Den kan
// det rutterna under src/app/api/recruiter och candidateAccess.ts använder:
// select (med count/head), eq, neq, in, is, not(...'is', null), gt, gte, lt,
// lte, overlaps, or (bara formen "kol.is.null,kol.lte.N"), order, limit,
// maybeSingle, single, insert, update, upsert och delete.
//
// Kolumner som inte finns i tabellens schema ger fel 42703, precis som
// PostgREST, så att koden för kolumnen public_id kan provas med och utan.

/* eslint-disable @typescript-eslint/no-explicit-any */

type Row = Record<string, any>;

export interface FakeDb {
  tables: Record<string, Row[]>;
  /** Kända kolumner per tabell. Saknas tabellen här godtas alla kolumner. */
  schema: Record<string, string[]>;
  inserts: Array<{ table: string; row: Row }>;
}

export function createFakeDb(
  tables: Record<string, Row[]>,
  schema: Record<string, string[]> = {}
): FakeDb {
  return { tables, schema, inserts: [] };
}

function get(r: Row, col: string): any {
  const m = col.match(/^(w+)->>(w+)$/);
  if (!m) return r[col];
  const v = r[m[1]]?.[m[2]];
  return v === undefined || v === null ? null : String(v);
}

function parseColumns(cols: string): string[] {
  return cols
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean)
    .map((c) => c.split(':')[0].trim());
}

class Query {
  private filters: Array<(r: Row) => boolean> = [];
  private columns: string[] | null = null;
  private countMode = false;
  private headMode = false;
  private orderBy: { col: string; asc: boolean } | null = null;
  private limitN: number | null = null;
  private op: 'select' | 'insert' | 'update' | 'upsert' | 'delete' = 'select';
  private payload: Row | Row[] | null = null;
  private returning = false;
  private schemaError: { code: string; message: string } | null = null;

  constructor(private db: FakeDb, private table: string) {}

  private rows(): Row[] {
    if (!this.db.tables[this.table]) this.db.tables[this.table] = [];
    return this.db.tables[this.table];
  }

  private checkColumns(cols: string[]) {
    const known = this.db.schema[this.table];
    if (!known) return;
    for (const c of cols) {
      if (c !== '*' && !known.includes(c)) {
        this.schemaError = {
          code: '42703',
          message: `column ${this.table}.${c} does not exist`,
        };
      }
    }
  }

  select(cols = '*', opts: { count?: string; head?: boolean } = {}) {
    if (this.op === 'select') {
      this.columns = cols === '*' ? null : parseColumns(cols);
      if (this.columns) this.checkColumns(this.columns);
      this.countMode = Boolean(opts.count);
      this.headMode = Boolean(opts.head);
    } else {
      this.returning = true;
      this.columns = cols === '*' ? null : parseColumns(cols);
    }
    return this;
  }

  insert(payload: Row | Row[]) {
    this.op = 'insert';
    this.payload = payload;
    return this;
  }
  update(payload: Row) {
    this.op = 'update';
    this.payload = payload;
    return this;
  }
  upsert(payload: Row) {
    this.op = 'upsert';
    this.payload = payload;
    return this;
  }
  delete() {
    this.op = 'delete';
    return this;
  }

  eq(col: string, v: any) {
    if (!col.includes('->')) this.checkColumns([col]);
    this.filters.push((r) => get(r, col) === v);
    return this;
  }
  neq(col: string, v: any) {
    this.filters.push((r) => r[col] !== v);
    return this;
  }
  in(col: string, vs: any[]) {
    this.filters.push((r) => vs.includes(r[col]));
    return this;
  }
  is(col: string, v: null) {
    this.filters.push((r) => (get(r, col) ?? null) === v);
    return this;
  }
  not(col: string, op: string, v: any) {
    if (op === 'is' && v === null) this.filters.push((r) => r[col] !== null && r[col] !== undefined);
    return this;
  }
  gt(col: string, v: any) {
    this.filters.push((r) => r[col] > v);
    return this;
  }
  gte(col: string, v: any) {
    this.filters.push((r) => r[col] >= v);
    return this;
  }
  lt(col: string, v: any) {
    this.filters.push((r) => r[col] < v);
    return this;
  }
  lte(col: string, v: any) {
    this.filters.push((r) => r[col] <= v);
    return this;
  }
  overlaps(col: string, vs: any[]) {
    this.filters.push((r) => Array.isArray(r[col]) && r[col].some((x: any) => vs.includes(x)));
    return this;
  }
  or(expr: string) {
    const parts = expr.split(',');
    this.filters.push((r) =>
      parts.some((p) => {
        const [col, op, val] = p.split('.');
        if (op === 'is' && val === 'null') return r[col] === null || r[col] === undefined;
        if (op === 'lte') return r[col] <= Number(val);
        return false;
      })
    );
    return this;
  }
  order(col: string, opts: { ascending?: boolean } = {}) {
    this.orderBy = { col, asc: opts.ascending !== false };
    return this;
  }
  limit(n: number) {
    this.limitN = n;
    return this;
  }

  private project(r: Row): Row {
    if (!this.columns) return { ...r };
    const out: Row = {};
    for (const c of this.columns) out[c] = r[c] ?? null;
    return out;
  }

  private run(): { data: any; error: any; count?: number } {
    if (this.schemaError) return { data: null, error: this.schemaError };
    const all = this.rows();
    const matches = all.filter((r) => this.filters.every((f) => f(r)));

    if (this.op === 'insert') {
      const list = Array.isArray(this.payload) ? this.payload : [this.payload as Row];
      const made = list.map((p) => ({ id: `id-${Math.random().toString(36).slice(2)}`, created_at: new Date().toISOString(), ...p }));
      for (const m of made) {
        all.push(m);
        this.db.inserts.push({ table: this.table, row: m });
      }
      return { data: this.returning ? made.map((m) => this.project(m)) : null, error: null };
    }
    if (this.op === 'update') {
      for (const r of matches) Object.assign(r, this.payload);
      return { data: this.returning ? matches.map((m) => this.project(m)) : null, error: null };
    }
    if (this.op === 'upsert') {
      const p = this.payload as Row;
      all.push({ ...p });
      return { data: this.returning ? [this.project(p)] : null, error: null };
    }
    if (this.op === 'delete') {
      this.db.tables[this.table] = all.filter((r) => !matches.includes(r));
      return { data: null, error: null };
    }

    let result = matches;
    if (this.orderBy) {
      const { col, asc } = this.orderBy;
      result = [...result].sort((a, b) => (a[col] > b[col] ? 1 : a[col] < b[col] ? -1 : 0) * (asc ? 1 : -1));
    }
    if (this.limitN !== null) result = result.slice(0, this.limitN);
    if (this.countMode) {
      return { data: this.headMode ? null : result.map((r) => this.project(r)), error: null, count: matches.length };
    }
    return { data: result.map((r) => this.project(r)), error: null };
  }

  maybeSingle() {
    const res = this.run();
    if (res.error) return Promise.resolve(res);
    const list = Array.isArray(res.data) ? res.data : [];
    return Promise.resolve({ data: list[0] ?? null, error: null });
  }
  single() {
    const res = this.run();
    if (res.error) return Promise.resolve(res);
    const list = Array.isArray(res.data) ? res.data : [];
    return Promise.resolve(
      list[0] ? { data: list[0], error: null } : { data: null, error: { code: 'PGRST116', message: 'no rows' } }
    );
  }
  then(resolve: (v: any) => any, reject?: (e: any) => any) {
    try {
      return Promise.resolve(this.run()).then(resolve, reject);
    } catch (e) {
      return Promise.reject(e).then(resolve, reject);
    }
  }
}

export function fakeAdmin(db: FakeDb): any {
  return {
    from(table: string) {
      return new Query(db, table);
    },
  };
}
