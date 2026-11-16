/**
 * Katalogen som komponenterna läser. Källan är mallsystemets katalog
 * (src/lib/cv/mallar/katalog.ts, byggagent A); den här filen finns kvar så
 * att ytornas importer inte behöver veta var den bor. Klientsäker.
 */
export * from '@/lib/cv/mallar/katalog'
export { getMallKort as mallKort } from '@/lib/cv/mallar/katalog'
export { losMallId, losMallIdEllerForval } from '@/lib/cv/mallar/alias'
