// Minimal härmning av PostgREST-kedjan som lib-funktionerna bygger:
//   supabase.from(<tabell>).select(...).eq(...).in(...).not(...).gte(...)
//     .order(...).limit(...).maybeSingle()
//
// Varje kedjesteg returnerar samma proxy. Kedjan är thenable, så både
// `await query` och `await query.maybeSingle()` fungerar precis som mot den
// riktiga klienten. Svaret slås upp på tabellnamnet, så ett test bara behöver
// säga vad varje tabell ska ge tillbaka. Ingen databas, inget nätverk.

export interface TableResponse {
  data?: unknown;
  error?: unknown;
  count?: number | null;
}

/** Ett svar, eller en funktion som får de anropade stegen och väljer svar. */
export type TableHandler =
  | TableResponse
  | ((calls: ChainCall[]) => TableResponse);

export interface ChainCall {
  method: string;
  args: unknown[];
}

const CHAIN_METHODS = [
  'select',
  'eq',
  'neq',
  'in',
  'not',
  'is',
  'lt',
  'lte',
  'gt',
  'gte',
  'order',
  'limit',
  'range',
  'filter',
  'match',
];

/**
 * tables: tabellnamn -> svar. Saknad tabell ger tomt svar i stället för att
 * kasta, så ett test slipper räkna upp tabeller det inte bryr sig om.
 * Anropen loggas i `calls` så ett test kan hävda vad som faktiskt frågades.
 */
export function createSupabaseMock(tables: Record<string, TableHandler>): {
  // Lös typ: mocken har bara .from(), medan anroparna tar emot en
  // SupabaseClient. Funktionerna rör bara kedjan, aldrig resten av klienten.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: any;
  calls: Array<{ table: string; chain: ChainCall[] }>;
} {
  const calls: Array<{ table: string; chain: ChainCall[] }> = [];

  function makeChain(table: string) {
    const chain: ChainCall[] = [];
    const entry = { table, chain };
    calls.push(entry);

    const resolve = (): TableResponse => {
      const handler = tables[table];
      if (handler === undefined) return { data: null, error: null, count: 0 };
      const res = typeof handler === 'function' ? handler(chain) : handler;
      return { data: null, error: null, count: null, ...res };
    };

    const proxy: Record<string, unknown> = {};

    for (const method of CHAIN_METHODS) {
      proxy[method] = (...args: unknown[]) => {
        chain.push({ method, args });
        return proxy;
      };
    }

    proxy.maybeSingle = (...args: unknown[]) => {
      chain.push({ method: 'maybeSingle', args });
      return Promise.resolve(resolve());
    };
    proxy.single = (...args: unknown[]) => {
      chain.push({ method: 'single', args });
      return Promise.resolve(resolve());
    };
    // Kedjan går att awaita direkt, som PostgREST-byggaren.
    proxy.then = (
      onFulfilled?: (value: TableResponse) => unknown,
      onRejected?: (reason: unknown) => unknown
    ) => Promise.resolve(resolve()).then(onFulfilled, onRejected);

    return proxy;
  }

  return {
    client: {
      from: (table: string) => makeChain(table),
    },
    calls,
  };
}

/** Hittar värdet som skickades till ett visst kedjesteg, för assertions. */
export function argOf(chain: ChainCall[], method: string, index = 0): unknown {
  return chain.find((c) => c.method === method)?.args[index];
}
