/**
 * Felkoder som betyder att migreringen 20261121180000 inte är körd: tabellen
 * eller kolumnen saknas (PostgREST och Postgres). Klientsäker.
 */
export function arSchemaFel(fel: { code?: string } | null | undefined): boolean {
  const k = fel?.code
  return k === 'PGRST205' || k === '42P01' || k === '42703' || k === 'PGRST204' || k === 'PGRST200'
}
