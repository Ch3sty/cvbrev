// En enkel Supabase-dubbel i minnet för livscykeltesterna: tabeller som
// listor av rader, filtren eq, in, gte, gt, lt, lte, is, not is null och
// like, samt select, insert, upsert (ignoreDuplicates på user_id+email_type),
// update, maybeSingle och single. Ordning och limit ignoreras.

type Row = Record<string, any>;

export interface FakeDb {
  client: any;
  tables: Record<string, Row[]>;
}

export function fakeSupabase(tables: Record<string, Row[]> = {}): FakeDb {
  let seq = 0;

  function from(table: string) {
    const filters: ((r: Row) => boolean)[] = [];
    let op: 'select' | 'update' | 'upsert' | 'insert' = 'select';
    let payload: any = null;
    let upsertOpts: any = null;

    const exec = async () => {
      const rows = (tables[table] ??= []);
      const match = (r: Row) => filters.every((f) => f(r));
      if (op === 'select') {
        const data = rows.filter(match);
        return { data, error: null, count: data.length };
      }
      if (op === 'update') {
        const hit = rows.filter(match);
        for (const r of hit) Object.assign(r, payload);
        return { data: hit, error: null };
      }
      if (op === 'upsert') {
        const list = Array.isArray(payload) ? payload : [payload];
        for (const p of list) {
          const keys: string[] = String(upsertOpts?.onConflict ?? 'id').split(',');
          const existing = rows.find((r) => keys.every((k) => r[k] === p[k]));
          if (existing) {
            if (!upsertOpts?.ignoreDuplicates) Object.assign(existing, p);
          } else {
            rows.push({ id: `rad-${++seq}`, sent_at: null, canceled_at: null, attempts: 0, ...p });
          }
        }
        return { data: null, error: null };
      }
      const list = Array.isArray(payload) ? payload : [payload];
      for (const p of list) rows.push({ id: `rad-${++seq}`, ...p });
      return { data: null, error: null };
    };

    const b: any = {
      select: () => b,
      eq: (c: string, v: unknown) => (filters.push((r) => r[c] === v), b),
      neq: (c: string, v: unknown) => (filters.push((r) => r[c] !== v), b),
      in: (c: string, vs: unknown[]) => (filters.push((r) => vs.includes(r[c])), b),
      gte: (c: string, v: any) => (filters.push((r) => r[c] != null && r[c] >= v), b),
      gt: (c: string, v: any) => (filters.push((r) => r[c] != null && r[c] > v), b),
      lt: (c: string, v: any) => (filters.push((r) => r[c] != null && r[c] < v), b),
      lte: (c: string, v: any) => (filters.push((r) => r[c] != null && r[c] <= v), b),
      is: (c: string, v: unknown) => (filters.push((r) => (r[c] ?? null) === v), b),
      not: (c: string, o: string, v: unknown) => {
        if (o === 'is' && v === null) filters.push((r) => r[c] != null);
        return b;
      },
      like: (c: string, p: string) => {
        const re = new RegExp(
          '^' + p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*').replace(/_/g, '.') + '$'
        );
        filters.push((r) => typeof r[c] === 'string' && re.test(r[c]));
        return b;
      },
      or: () => b,
      order: () => b,
      limit: () => b,
      update: (p: any) => ((op = 'update'), (payload = p), b),
      upsert: (p: any, o: any) => ((op = 'upsert'), (payload = p), (upsertOpts = o), b),
      insert: (p: any) => ((op = 'insert'), (payload = p), b),
      maybeSingle: () => exec().then((r: any) => ({ data: (r.data ?? [])[0] ?? null, error: null })),
      single: () => exec().then((r: any) => ({ data: (r.data ?? [])[0] ?? null, error: null })),
      then: (res: any, rej: any) => exec().then(res, rej),
    };
    return b;
  }

  return { client: { from, rpc: async () => ({ data: null, error: null }) }, tables };
}
