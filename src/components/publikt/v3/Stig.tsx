/**
 * Spåret i Jobbsöket (delar/stig.html): de sökta tjänsterna på väg från
 * Ska sökas till Erbjudande. Brickorna är arbetsgivarnas initialer, den
 * tysta får kopparetiketten. Står på mörk botten (vägg eller ö); paPapper
 * lägger en egen mörk platta under.
 *
 * Telefonen (sokta-tjanster och funktioner, förslag till grunden): första
 * etiketten är vänsterställd och bryter i stället för att gå utanför, och
 * Erbjudande står till vänster om flaggan, inte under brickan. Ordet
 * "spår" används aldrig i synlig text.
 */

export interface StigEtikett {
  namn: string
  under?: string
}

export function Stig({
  skaSokas = { namn: 'Ska sökas', under: '1 sparad, sista dag onsdag' },
  sokt = { namn: 'Sökt', under: '2 väntar på svar' },
  intervju = { namn: 'Intervju', under: 'tisdag 10.00' },
  erbjudande = { namn: 'Erbjudande' },
  tyst = 'tyst i 12 dagar',
  brickor = { skaSokas: 'IL', sokt: ['DA', 'CO'], intervju: 'PO' },
  paPapper,
  ariaLabel,
}: {
  skaSokas?: StigEtikett
  sokt?: StigEtikett
  intervju?: StigEtikett
  erbjudande?: StigEtikett
  /** Kopparetiketten över den första sökta, null för ingen. */
  tyst?: string | null
  /** Initialerna på brickorna. */
  brickor?: { skaSokas?: string; sokt?: readonly string[]; intervju?: string }
  paPapper?: boolean
  ariaLabel?: string
}) {
  const etikett = (e: StigEtikett) => (
    <>
      {e.namn}
      {e.under ? <small>{e.under}</small> : null}
    </>
  )
  const soktaBrickor = brickor.sokt ?? []
  const label =
    ariaLabel ??
    `Exempel: sökta tjänster på väg från ${skaSokas.namn} till ${erbjudande.namn}.${sokt.under ? ` ${sokt.namn}: ${sokt.under}.` : ''}${tyst ? ` En av dem har varit ${tyst}.` : ''}`
  const stig = (
    <div className="p3-stig" role="img" aria-label={label}>
      <svg viewBox="0 0 500 300" fill="none" preserveAspectRatio="none" aria-hidden="true">
        <path
          d="M40 250 C 120 250, 130 190, 200 180 S 290 150, 340 120 S 430 70, 462 46"
          stroke="currentColor"
          strokeOpacity=".5"
          strokeWidth="3"
          strokeDasharray="1 9"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <svg viewBox="0 0 500 300" fill="none" aria-hidden="true">
        <circle cx="40" cy="250" r="8" fill="var(--vagg)" stroke="currentColor" strokeWidth="3" />
        <circle cx="200" cy="180" r="11" fill="#E07A2F" stroke="currentColor" strokeWidth="3" />
        <circle cx="340" cy="120" r="8" fill="var(--vagg)" stroke="currentColor" strokeWidth="3" />
        <path d="M462 46V8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M462 8l26 9-26 10z" fill="#E07A2F" />
        <circle cx="462" cy="46" r="6" fill="currentColor" />
      </svg>
      <span className="p3-etk p3-vanster" style={{ left: '2%', top: '88%' }} aria-hidden="true">
        {etikett(skaSokas)}
      </span>
      <span className="p3-etk" style={{ left: '40%', top: '66%' }} aria-hidden="true">
        {etikett(sokt)}
      </span>
      <span className="p3-etk" style={{ left: '74%', top: '47%' }} aria-hidden="true">
        {etikett(intervju)}
      </span>
      <span className="p3-etk p3-hoger" style={{ right: '10%', top: '0%' }} aria-hidden="true">
        {etikett(erbjudande)}
      </span>
      {brickor.skaSokas ? (
        <span className="p3-bol p3-tom" style={{ left: '8%', top: '76%' }} aria-hidden="true">
          {brickor.skaSokas}
        </span>
      ) : null}
      {soktaBrickor.map((b, i) => (
        <span key={b + i} className={`p3-bol ${i === 0 && tyst ? 'p3-nu' : ''}`.trim()} style={{ left: `${33 + i * 14}%`, top: '50%' }} aria-hidden="true">
          {b}
        </span>
      ))}
      {brickor.intervju ? (
        <span className="p3-bol" style={{ left: '68%', top: '31%' }} aria-hidden="true">
          {brickor.intervju}
        </span>
      ) : null}
      {tyst && soktaBrickor.length ? (
        <span className="p3-tyst" style={{ left: '33%', top: '30%' }} aria-hidden="true">
          {tyst}
        </span>
      ) : null}
    </div>
  )
  return paPapper ? <div className="p3-stig-pa-papper">{stig}</div> : stig
}
