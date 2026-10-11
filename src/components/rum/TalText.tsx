/**
 * Ett tal med decimalkomma i tabellsiffror (spec-rummen 19.4 punkt 2):
 * siffrorna står tabulärt, kommat proportionellt, så att "5,4" aldrig
 * renderas som "5 , 4". Server component.
 */

export default function TalText({ children }: { children: string }) {
  const delar = children.split(',')
  if (delar.length < 2) return <>{children}</>
  return (
    <>
      {delar.map((d, i) => (
        <span key={i}>
          {i > 0 ? <span className="tal-komma">,</span> : null}
          {d}
        </span>
      ))}
    </>
  )
}
