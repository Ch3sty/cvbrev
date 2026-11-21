/**
 * <PersonligtBrevPreview yrke="..." /> i 19 artiklar: mallvisaren med
 * artikelns eget brev och "Läs brevet som text" (byggspecen våg 2,
 * 2026-11-21). Serverkomponent; breven ligger i personligt-brev-preview-data.ts
 * och visaren i src/components/publikt/brevvisare.
 */
import { BrevForhandsvisning } from '@/components/publikt/brevvisare/BrevVisareArtikel'
import type { ArtikelBrevNyckel } from './personligt-brev-preview-data'

interface PersonligtBrevPreviewProps {
  yrke?: ArtikelBrevNyckel
}

export default function PersonligtBrevPreview({ yrke = 'student' }: PersonligtBrevPreviewProps) {
  return <BrevForhandsvisning yrke={yrke} />
}
