/**
 * Källorna i ett eget kort (spec-publikt-v2 del B 2.2), för kalkylatorerna.
 * Länkarna är desamma som i dag; kortet ändrar bara ytan.
 */

export default function Kallkort({
  kallor,
  not,
  rubrik = 'Källor',
}: {
  kallor: readonly { text: string; href?: string }[]
  not?: string
  rubrik?: string
}) {
  return (
    <div className="ib-kallkort">
      <p className="ib-sidorub">{rubrik}</p>
      <ul>
        {kallor.map((k) => (
          <li key={k.text}>
            {k.href ? (
              <a href={k.href} target="_blank" rel="noopener noreferrer">
                {k.text}
              </a>
            ) : (
              k.text
            )}
          </li>
        ))}
      </ul>
      {not ? <p>{not}</p> : null}
    </div>
  )
}
