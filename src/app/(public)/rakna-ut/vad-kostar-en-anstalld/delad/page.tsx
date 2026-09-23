/**
 * Den delade vyn: next.config.ts skriver om /rakna-ut/vad-kostar-en-anstalld hit när länken
 * bär kalkylatorns parametrar. Samma sida, men resultatet räknas på servern
 * ur parametrarna och og:image pekar på resultatets bild.
 */
import type { Metadata } from 'next'
import { deladMetadata, type DeladProps } from '@/components/rakna/delad'
import { Innehall, metadata as sidansMetadata } from '../innehall'

export async function generateMetadata({ searchParams }: DeladProps): Promise<Metadata> {
  return deladMetadata('vad-kostar-en-anstalld', sidansMetadata, await searchParams)
}

export default async function Page({ searchParams }: DeladProps) {
  return <Innehall sok={await searchParams} />
}
