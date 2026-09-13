'use client';

export type ViewMode = 'grid' | 'list';

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

/**
 * Vyväljare som ett segment (docs/designsystem.md, "Segment"): två knappar
 * på 44 px, vald får kant ink-1. Ikonerna är ritade här eftersom Lucide
 * bara används för pil, kryss, chevron och meny.
 */
export default function ViewToggle({ value, onChange }: ViewToggleProps) {
  const button = (mode: ViewMode, label: string, icon: React.ReactNode) => {
    const on = value === mode;
    return (
      <button
        type="button"
        role="radio"
        aria-checked={on}
        aria-label={label}
        onClick={() => onChange(mode)}
        className={`inline-flex h-11 w-11 items-center justify-center rounded-lg border bg-panel transition-[border-color,background-color] duration-[120ms] hover:border-kant-stark active:bg-insunken ${
          on ? 'border-ink-1 text-ink-1 shadow-val' : 'border-kant text-ink-2'
        }`}
      >
        {icon}
      </button>
    );
  };

  return (
    <div role="radiogroup" aria-label="Visningsläge" className="flex gap-2">
      {button(
        'grid',
        'Visa som rutnät',
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
        </svg>
      )}
      {button(
        'list',
        'Visa som lista',
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 6.5h16M4 12h16M4 17.5h16" />
        </svg>
      )}
    </div>
  );
}
