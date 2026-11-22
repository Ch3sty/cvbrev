// src/lib/lagring/sokvagar.ts
// Sökvägarna i lagringshinkarna cvs och profile-photos. Allt ett konto lägger
// i lagringen ligger under users/<kontots id>/, och reglerna på hinken cvs
// släpper bara in den egna mappen (beslut-agarpunkter S-1, 2026-11-22,
// supabase/migrations/20261122120000_cvs_egen_mapp.sql):
//   (storage.foldername(name))[1] = 'users'
//   (storage.foldername(name))[2] = auth.uid()::text
// Rutterna bygger sina vägar här, så att en ny väg inte kan hamna utanför.

import { sanitizeStorageKey } from '@/utils/helpers'

/** users/<id> */
export function kontoMapp(userId: string): string {
  return `users/${userId}`
}

/** Uppladdat CV: users/<id>/<rensat filnamn>. */
export function cvSokvag(userId: string, filnamn: string): string {
  return `${kontoMapp(userId)}/${sanitizeStorageKey(filnamn)}`
}

/** Samtalets id som mappnamn, annars temp. Inga snedstreck eller punkter. */
const SAMTALS_ID = /^[A-Za-z0-9_-]{1,64}$/

/** Bilaga till Jobbcoachen: users/<id>/chat_attachments/<samtal eller temp>/<tid>_<filnamn>. */
export function bilagaSokvag(userId: string, samtalsId: string | null | undefined, filnamn: string, tid: number = Date.now()): string {
  const mapp = samtalsId && SAMTALS_ID.test(samtalsId) ? samtalsId : 'temp'
  return `${kontoMapp(userId)}/chat_attachments/${mapp}/${tid}_${sanitizeStorageKey(filnamn)}`
}

/** Profilfoto: users/<id>/profile-photo-<tid>.<ändelse>. */
export function profilfotoSokvag(userId: string, filnamn: string, tid: number = Date.now()): string {
  const andelse = (filnamn.split('.').pop()?.toLowerCase() || 'jpg').replace(/[^a-z0-9]/g, '') || 'jpg'
  return `${kontoMapp(userId)}/profile-photo-${tid}.${andelse}`
}

/**
 * Samma prövning som reglerna på hinken cvs gör, i TypeScript: första mappen
 * är users, andra är kontots id. storage.foldername ger mapparna före
 * filnamnet, så en fil direkt i users/<id>/ räknas.
 */
export function inomEgenMapp(sokvag: string, userId: string): boolean {
  const mappar = sokvag.split('/').slice(0, -1)
  return mappar[0] === 'users' && mappar[1] === userId && !sokvag.split('/').includes('..')
}
