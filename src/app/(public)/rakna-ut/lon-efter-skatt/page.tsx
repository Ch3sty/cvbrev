import type { Metadata } from 'next'
import { Innehall, metadata as sidansMetadata } from './innehall'

export const metadata: Metadata = sidansMetadata

export default function Page() {
  return <Innehall />
}
