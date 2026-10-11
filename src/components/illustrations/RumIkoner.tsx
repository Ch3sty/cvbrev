/**
 * Rummens ikonsats för golvet (spec-rummen 16.4 (b) punkt 1, våg 4).
 *
 * Ersätter lucide-react i inloggat. Egna ritningar i samma hand som
 * RumSymboler: 24 px rutnät, kontur 1,75 i currentColor, rundade ändar och
 * hörn, ingen fyllning, ingen bakgrund, ingen koppar (regeln om en kopparyta
 * gäller 48-symbolerna och märkena, inte 24-ikonerna, spec 16.2 fråga 5).
 *
 * Namnen speglar de gamla så att bytet i varje fil är en import och inget
 * annat: samma props (className, size, strokeWidth, aria-*), samma
 * standardstorlek 24. Nya vyer tar hellre RumSymboler och Ikoner direkt.
 *
 * Ingen 'use client' och inga hooks: ikonerna renderas på servern.
 */

import type { JSX, ReactNode, SVGProps } from 'react'

export interface RumIkonProps extends Omit<SVGProps<SVGSVGElement>, 'ref' | 'children'> {
  /** Renderad storlek i px. Standard 24. */
  size?: number | string
  /** Konturens bredd. Standard 1,75. */
  strokeWidth?: number | string
  /** Finns för att gamla anrop ska typkontrollera; ignoreras. */
  absoluteStrokeWidth?: boolean
  /** Tillgängligt namn. Utan titel är ikonen dekorativ. */
  title?: string
}

/** Typen för en ikon som skickas som värde (ersätter LucideIcon). */
export type IkonTyp = ((props: RumIkonProps) => JSX.Element) & { displayName?: string }

function ikon(namn: string, ritning: ReactNode): IkonTyp {
  function RumIkon({
    size = 24,
    strokeWidth = 1.75,
    absoluteStrokeWidth: _abs,
    title,
    className,
    ...svg
  }: RumIkonProps) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden={title ? undefined : true}
        role={title ? 'img' : undefined}
        focusable="false"
        {...svg}
      >
        {title ? <title>{title}</title> : null}
        {ritning}
      </svg>
    )
  }
  RumIkon.displayName = namn
  return RumIkon
}

const prick = (cx: number, cy: number) => <circle cx={cx} cy={cy} r="1.1" fill="currentColor" stroke="none" />
const ring = <circle cx="12" cy="12" r="8.5" />
const bock = 'M8 12.5l2.8 2.8L16 9.5'
const skold = 'M12 3.5l7.5 3v5.5c0 4.5-3.2 7.8-7.5 9-4.3-1.2-7.5-4.5-7.5-9V6.5z'
const telefon =
  'M6.5 3.5h3l1.5 4.5-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 4.5 1.5v3a2 2 0 0 1-2 2A15.5 15.5 0 0 1 4.5 5.5a2 2 0 0 1 2-2z'
const oga = 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z'
const penna = 'M4 20l4-1 11-11-3-3L5 16z'

export const AlertCircle = ikon('AlertCircle', <>{ring}<path d="M12 7.5v5.5" />{prick(12, 16.3)}</>)
export const AlertTriangle = ikon(
  'AlertTriangle',
  <>
    <path d="M10.3 4.6a2 2 0 0 1 3.4 0l7 12.2a2 2 0 0 1-1.7 3H5a2 2 0 0 1-1.7-3z" />
    <path d="M12 9.5v4" />
    {prick(12, 16.6)}
  </>
)
export const ArrowRight = ikon('ArrowRight', <path d="M5 12h14M13 6l6 6-6 6" />)
export const ArrowUp = ikon('ArrowUp', <path d="M12 19V5M6 11l6-6 6 6" />)
export const Award = ikon(
  'Award',
  <>
    <circle cx="12" cy="9" r="5.5" />
    <path d="M8.6 13.4 7 21l5-2.6 5 2.6-1.6-7.6" />
  </>
)
export const BarChart3 = ikon('BarChart3', <path d="M4 20h16M7.5 16.5v-5M12 16.5V6M16.5 16.5v-8" />)
export const Briefcase = ikon(
  'Briefcase',
  <>
    <rect x="3.5" y="7.5" width="17" height="12" rx="2" />
    <path d="M9 7.5V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5v2M3.5 12.5h17" />
  </>
)
export const Building2 = ikon(
  'Building2',
  <>
    <path d="M5 20.5V5a1.5 1.5 0 0 1 1.5-1.5h7A1.5 1.5 0 0 1 15 5v15.5" />
    <path d="M15 9.5h3.5a1 1 0 0 1 1 1v10M3 20.5h18M8.5 7.5h3M8.5 11h3M8.5 14.5h3" />
  </>
)
export const Camera = ikon(
  'Camera',
  <>
    <path d="M4 8.5a2 2 0 0 1 2-2h2l1.5-2h5l1.5 2h2a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
    <circle cx="12" cy="13" r="3.5" />
  </>
)
export const Check = ikon('Check', <path d="M5 12.5l4.5 4.5L19 7.5" />)
export const CheckCircle = ikon('CheckCircle', <>{ring}<path d={bock} /></>)
export const CheckCircle2 = CheckCircle
export const Square = ikon('Square', <rect x="4" y="4" width="16" height="16" rx="3" />)
export const CheckSquare = ikon(
  'CheckSquare',
  <>
    <rect x="4" y="4" width="16" height="16" rx="3" />
    <path d={bock} />
  </>
)
export const ChevronDown = ikon('ChevronDown', <path d="M6 9l6 6 6-6" />)
export const ChevronUp = ikon('ChevronUp', <path d="M6 15l6-6 6 6" />)
export const ChevronLeft = ikon('ChevronLeft', <path d="M15 6l-6 6 6 6" />)
export const ChevronRight = ikon('ChevronRight', <path d="M9 6l6 6-6 6" />)
export const CircleSlash = ikon('CircleSlash', <>{ring}<path d="M8.5 15.5l7-7" /></>)
export const Slash = ikon('Slash', <path d="M17 5 7 19" />)
export const ClipboardCopy = ikon(
  'ClipboardCopy',
  <>
    <rect x="5" y="5" width="12" height="15.5" rx="2" />
    <path d="M9 5V3.5h4V5M9 11h4M9 14.5h2.5M17 9.5h2.5v11" />
  </>
)
export const Clock = ikon('Clock', <>{ring}<path d="M12 7.5V12l3 2" /></>)
export const Crown = ikon('Crown', <path d="M4.5 17.5 3.5 7.5l4.8 3.8L12 5.5l3.7 5.8 4.8-3.8-1 10zM5 20.5h14" />)
export const Download = ikon('Download', <path d="M12 4v11M7 10.5l5 5 5-5M5 20h14" />)
export const Ear = ikon(
  'Ear',
  <>
    <path d="M6.5 9a5.5 5.5 0 1 1 11 0c0 2.6-1.6 3.8-2.8 4.9-1 .9-1.2 1.7-1.5 2.8-.4 1.9-1.6 3.3-3.5 3.3a3 3 0 0 1-2.7-1.6" />
    <path d="M9.6 9.4a2.4 2.4 0 1 1 4 1.8c-.7.6-1.1 1.2-1.1 2.2" />
  </>
)
export const Edit3 = ikon('Edit3', <><path d={penna} /><path d="M13 20h7" /></>)
export const PenLine = Edit3
export const ExternalLink = ikon(
  'ExternalLink',
  <path d="M14 4h6v6M20 4l-9 9M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10" />
)
export const Eye = ikon('Eye', <><path d={oga} /><circle cx="12" cy="12" r="3" /></>)
export const EyeOff = ikon('EyeOff', <><path d={oga} /><circle cx="12" cy="12" r="3" /><path d="M4 4l16 16" /></>)
export const FileText = ikon(
  'FileText',
  <>
    <path d="M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5z" />
    <path d="M14 3.5v5h5M8.5 13h7M8.5 16.5h5" />
  </>
)
export const FileSearch = ikon(
  'FileSearch',
  <>
    <path d="M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h3.5M14 3.5l5 5V11M14 3.5v5h5" />
    <circle cx="15.5" cy="15.5" r="3" />
    <path d="M17.7 17.7 20 20" />
  </>
)
export const Flag = ikon('Flag', <path d="M5.5 21V4M5.5 4.5h11.5l-2.2 4 2.2 4H5.5" />)
export const GraduationCap = ikon(
  'GraduationCap',
  <path d="M2.5 9.5 12 5l9.5 4.5L12 14zM6.5 11.5V16c0 1.5 2.5 3 5.5 3s5.5-1.5 5.5-3v-4.5M21.5 9.5v5" />
)
export const HelpCircle = ikon(
  'HelpCircle',
  <>
    {ring}
    <path d="M9.6 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.3" />
    {prick(12, 16.6)}
  </>
)
export const Home = ikon(
  'Home',
  <path d="M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19zM10 20.5v-6h4v6" />
)
export const Image = ikon(
  'Image',
  <>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
    <circle cx="9" cy="10" r="1.6" />
    <path d="m20.5 15.5-4.5-4.5-9 8.5" />
  </>
)
export const Info = ikon('Info', <>{ring}<path d="M12 11v5" />{prick(12, 7.9)}</>)
export const Key = ikon('Key', <><circle cx="8" cy="15" r="4" /><path d="M11 12l8.5-8.5M16 6.5l2.5 2.5M13.8 8.7l2 2" /></>)
export const Link2 = ikon('Link2', <path d="M9 17H7A5 5 0 0 1 7 7h2M15 7h2a5 5 0 0 1 0 10h-2M8.5 12h7" />)
export const Linkedin = ikon(
  'Linkedin',
  <>
    <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
    <path d="M8 10.5V16M11.5 16v-5.5M11.5 13c0-1.6 1-2.6 2.5-2.6s2.5 1 2.5 2.6V16" />
    {prick(8, 7.6)}
  </>
)
export const Loader2 = ikon('Loader2', <path d="M12 3.5A8.5 8.5 0 1 0 20.5 12" />)
export const Lock = ikon(
  'Lock',
  <>
    <rect x="5" y="10.5" width="14" height="10" rx="2" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
  </>
)
export const Mail = ikon(
  'Mail',
  <>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
    <path d="m4 7 8 6 8-6" />
  </>
)
export const MapPin = ikon(
  'MapPin',
  <>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
    <circle cx="12" cy="10" r="2.3" />
  </>
)
export const MessageSquareQuote = ikon(
  'MessageSquareQuote',
  <>
    <path d="M20 15a2 2 0 0 1-2 2H8.5L4 20.5V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z" />
    <path d="M8.5 8.5h2.2v2.3c0 1-.6 1.8-1.7 2.1M13.3 8.5h2.2v2.3c0 1-.6 1.8-1.7 2.1" />
  </>
)
export const Microscope = ikon(
  'Microscope',
  <path d="M6 20.5h12M9.5 17.5h5M9.3 3.8l3 1.1-2.6 7.1-3-1.1zM8 11.5l-1 2.7M14 17.5a5 5 0 0 0-1.8-8.8" />
)
export const MoreHorizontal = ikon('MoreHorizontal', <>{prick(6, 12)}{prick(12, 12)}{prick(18, 12)}</>)
export const Phone = ikon('Phone', <path d={telefon} />)
export const PhoneCall = ikon('PhoneCall', <><path d={telefon} /><path d="M14.5 3.5a6.5 6.5 0 0 1 6 6M14.5 7a3 3 0 0 1 2.5 2.5" /></>)
export const Plus = ikon('Plus', <path d="M12 5v14M5 12h14" />)
export const Printer = ikon(
  'Printer',
  <>
    <path d="M7 9V3.5h10V9" />
    <rect x="3.5" y="9" width="17" height="8" rx="2" />
    <path d="M7 14h10v6.5H7z" />
  </>
)
export const RotateCcw = ikon('RotateCcw', <path d="M4 5v5h5M4.6 14.5A8 8 0 1 0 6.3 6.6L4 9.8" />)
export const Search = ikon('Search', <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></>)
export const Send = ikon('Send', <path d="M20.5 3.5 10 14M20.5 3.5 14 20.5l-4-6.5-6.5-4z" />)
export const Shield = ikon('Shield', <path d={skold} />)
export const ShieldCheck = ikon('ShieldCheck', <><path d={skold} /><path d="m9 12 2 2 4-4" /></>)
export const Target = ikon(
  'Target',
  <>
    {ring}
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.5" />
  </>
)
export const Trash2 = ikon(
  'Trash2',
  <path d="M4.5 6.5h15M9.5 6.5v-2h5v2M6.5 6.5l1 13a1.5 1.5 0 0 0 1.5 1.4h6a1.5 1.5 0 0 0 1.5-1.4l1-13M10 11v6M14 11v6" />
)
export const TrendingUp = ikon('TrendingUp', <path d="M3.5 17 10 10.5l4 4L20.5 8M15 8h5.5v5.5" />)
export const TrendingDown = ikon('TrendingDown', <path d="M3.5 7 10 13.5l4-4 6.5 6.5M15 16h5.5v-5.5" />)
export const Type = ikon('Type', <path d="M5 7V5h14v2M12 5v14M9 19h6" />)
export const Upload = ikon('Upload', <path d="M12 16V4M7 8.5l5-5 5 5M5 20h14" />)
export const User = ikon(
  'User',
  <>
    <circle cx="12" cy="8.5" r="3.6" />
    <path d="M5 20c.8-3.6 3.5-5.5 7-5.5s6.2 1.9 7 5.5" />
  </>
)
export const Users = ikon(
  'Users',
  <>
    <circle cx="9" cy="8.5" r="3.2" />
    <path d="M3 19.5c.6-3 2.8-4.8 6-4.8s5.4 1.8 6 4.8M15.5 5.6a3.2 3.2 0 0 1 0 6M17.5 14.9c1.8.5 3 2 3.5 4.6" />
  </>
)
export const X = ikon('X', <path d="M6 6l12 12M18 6 6 18" />)
export const XCircle = ikon('XCircle', <>{ring}<path d="m9 9 6 6M15 9l-6 6" /></>)
export const Zap = ikon('Zap', <path d="M13 3 5 13.5h6L10 21l8-10.5h-6z" />)
