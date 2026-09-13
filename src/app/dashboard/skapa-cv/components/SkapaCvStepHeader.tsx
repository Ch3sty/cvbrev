'use client'

interface Props {
  stepNumber: number
  title: string
  description?: string
  isOptional?: boolean
}

/**
 * Rubriken för varje steg. Stegetikett i versaler, frågan i 22 px, en rad
 * under. Inget annat: tråden i toppraden visar redan var vi är.
 */
export default function SkapaCvStepHeader({
  stepNumber,
  title,
  description,
  isOptional = false,
}: Props) {
  return (
    <header>
      <p className="text-steg uppercase text-ink-3">
        Steg {stepNumber} av 7{isOptional ? ' · Valfritt' : ''}
      </p>
      <h2 className="mt-1.5 text-fraga text-ink-1">{title}</h2>
      {description ? (
        <p className="mt-1.5 text-sm leading-[22px] text-ink-2">{description}</p>
      ) : null}
    </header>
  )
}
