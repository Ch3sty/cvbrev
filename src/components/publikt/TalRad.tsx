/**
 * Hjältens tre tal. Talen byggs av konstanter av den som anropar, aldrig
 * som fasta strängar. Från 900 px på en rad, under det får de bryta.
 */

export default function TalRad({ tal, className = '' }: { tal: readonly { tal: string; text: string }[]; className?: string }) {
  return (
    <ul className={`pub-tal ${className}`.trim()}>
      {tal.map((t) => (
        <li key={t.tal + t.text}>
          <b>{t.tal}</b>
          <span>{t.text}</span>
        </li>
      ))}
    </ul>
  )
}
