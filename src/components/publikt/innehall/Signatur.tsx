/**
 * Signaturen i slutet av artikeln, före FAQ (spec-publikt-v2 del B 3.1,
 * rad 2e): författaren, specialistområdena, publicerad och granskad.
 * "Uppdaterad" visas bara när frontmatter har fältet updated (ägarbeslut 3).
 * Inga rubrikelement, så att rubrikträdet är oförändrat.
 */

import Image from 'next/image'
import type { Author } from '@/lib/authors'

export default function Signatur({
  forfattare,
  publicerad,
  publiceradText,
  uppdaterad,
  uppdateradText,
}: {
  forfattare: Author
  publicerad: string
  publiceradText: string
  uppdaterad?: string
  uppdateradText?: string
}) {
  return (
    <div className="not-prose ib-signatur">
      <div className="ib-signatur-h">
        <Image src={forfattare.image} alt="" width={44} height={44} loading="lazy" />
        <div>
          <b>{forfattare.name}</b>
          <span>
            {forfattare.title}.
            {forfattare.expertise?.length ? ` Specialistområden: ${forfattare.expertise.join(', ')}.` : ''}
          </span>
        </div>
      </div>
      <dl className="ib-datum">
        <div>
          <dt>Publicerad</dt>
          <dd>
            <time dateTime={publicerad}>{publiceradText}</time>
          </dd>
        </div>
        {uppdaterad && uppdateradText ? (
          <div>
            <dt>Uppdaterad</dt>
            <dd>
              <time dateTime={uppdaterad}>{uppdateradText}</time>
            </dd>
          </div>
        ) : null}
        <div>
          <dt>Granskad</dt>
          <dd>av HR-experter</dd>
        </div>
      </dl>
    </div>
  )
}
