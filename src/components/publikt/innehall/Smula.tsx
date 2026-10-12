/**
 * Brödsmulan på innehållssidorna: snedstreck mellan stegen, aldrig
 * mittpunkt. Skriver inget schema; sidorna har redan sin BreadcrumbList i
 * page.tsx, och ett andra block skulle ändra JSON-LD.
 */

import Link from 'next/link'

export default function Smula({ steg }: { steg: readonly { namn: string; href?: string }[] }) {
  return (
    <nav className="ib-smula" aria-label="Brödsmulor">
      <ol>
        {steg.map((s, i) => (
          <li key={i}>
            {s.href && i < steg.length - 1 ? (
              <Link href={s.href}>{s.namn}</Link>
            ) : (
              <span aria-current="page">{s.namn}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
