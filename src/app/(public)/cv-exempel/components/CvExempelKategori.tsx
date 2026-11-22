/**
 * /cv-exempel/kategori/[kategori] i publikt omgång 3: navets form med
 * branschen vald (beslut 7, noten brev-exempelnav), i CV:ts petrol.
 * Serverkomponent i stället för den gamla klientkomponenten
 * (exempel/components/KategoriPageContent.tsx, som brevets kategorisidor
 * fortfarande ritar). H1, de tre H2, länkarna och texten som förut; korten
 * har nu också yrkets rad ur galleriet.
 */
import { Sida, Hjalte, Lyft, Sektion, SektionHuvud, O, Knapp, TextLank } from '@/components/publikt/v3'
import type { Kategori } from '@/app/(public)/exempel/components/exempel-data'
import { CV_GALLERI } from '@/app/(public)/exempel/components/galleri-data'
import { Branscher, YrkesKortLista } from './ExempelDelar'
import './exempel-v3.css'

/**
 * Branschens ingress med antalet ur datan (SEO-beskedet avsnitt 14: vårdens
 * "20+ yrken" blir talet). Används också i CollectionPage.
 */
export function kategoriIngress(kat: Kategori, antal: number): string {
  return kat.introIngress.replace(/\b20\+ yrken\b/, `${antal} yrken`)
}

export default function CvExempelKategori({ kategori, yrkenMap }: { kategori: Kategori; yrkenMap: Record<string, string> }) {
  const yrkenIDennaTyp = kategori.yrken.filter((slug) => yrkenMap[slug])
  const lower = kategori.namn.toLowerCase()
  const kort = yrkenIDennaTyp.map((slug) => ({
    yrke: yrkenMap[slug],
    slug,
    ovan: 'CV-exempel',
    text: CV_GALLERI.find((y) => y.slug === slug)?.intro,
  }))

  return (
    <Sida farg="cv">
      <Hjalte
        brodsmulor={[
          { name: 'Hem', href: '/' },
          { name: 'Exempel', href: '/exempel' },
          { name: 'CV-exempel', href: '/cv-exempel' },
          { name: kategori.namn, href: `/cv-exempel/kategori/${kategori.slug}` },
        ]}
        brodsmulorSchema={false}
        etikett={`CV-exempel · ${kategori.namn}`}
        h1={
          <>
            CV-exempel för <span>{lower}</span>
          </>
        }
        h1Mindre
        varde={kategoriIngress(kategori, yrkenIDennaTyp.length)}
        lyft
      />

      <Lyft etikett="Välj bransch">
        <p className="p3-ey">Välj bransch</p>
        <Branscher yrken={CV_GALLERI} vald={kategori.slug} allaHref="/cv-exempel" />
      </Lyft>

      {/* Yrkena i branschen */}
      <Sektion>
        <div className="cve-rubrikrad">
          <SektionHuvud rubrik={`${yrkenIDennaTyp.length} yrken inom ${lower}`} />
          <TextLank href="/cv-exempel">Se alla cv-exempel</TextLank>
        </div>
        <div style={{ marginTop: 28 }}>
          <YrkesKortLista yrken={kort} />
        </div>

        {/* Korslänken till brevet i samma bransch */}
        <O
          farg="brev"
          className="cve-o"
          rubrikNiva="h2"
          rubrik="Behöver du även personligt brev?"
          varde={`Vi har ${kategori.yrken.length} personligt brev-exempel inom ${lower}.`}
          knappar={
            <Knapp href={`/personligt-brev-exempel/kategori/${kategori.slug}`} variant="vit">
              Se personligt brev-exempel för {lower}
            </Knapp>
          }
        />
      </Sektion>

      <Sektion luft="utan-topp">
        <O
          farg="cv"
          rubrikNiva="h2"
          rubrik="Hittade du inte ditt yrke?"
          varde="Bläddra hela biblioteket eller välj en annan bransch på hub-sidan."
          knappar={
            <>
              <Knapp href="/cv-exempel" pil>
                Alla cv-exempel
              </Knapp>
              <TextLank href="/exempel">Tillbaka till hubben</TextLank>
            </>
          }
        />
      </Sektion>
    </Sida>
  )
}
