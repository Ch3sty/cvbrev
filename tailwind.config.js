// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Tråden, designsystem v2 (docs/designsystem.md). Värdena bor som
        // CSS-variabler i globals.css; här får de sina Tailwind-namn:
        // bg-mark, bg-panel, bg-insunken, border-kant, text-ink-2 ...
        mark: 'var(--mark)',
        panel: 'var(--panel)',
        insunken: {
          DEFAULT: 'var(--insunken)',
          topp: 'var(--insunken-topp)',
        },
        kant: {
          DEFAULT: 'var(--kant)',
          stark: 'var(--kant-stark)',
        },
        ink: {
          1: 'var(--ink-1)',
          2: 'var(--ink-2)',
          3: 'var(--ink-3)',
          hover: 'var(--ink-hover)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          ink: 'var(--accent-ink)',
          mjuk: 'var(--accent-mjuk)',
        },
        positiv: {
          DEFAULT: 'var(--positiv)',
          mjuk: 'var(--positiv-mjuk)',
        },
        varning: {
          DEFAULT: 'var(--varning)',
          mjuk: 'var(--varning-mjuk)',
        },
        fel: {
          DEFAULT: 'var(--fel)',
          mjuk: 'var(--fel-mjuk)',
          kant: 'var(--fel-kant)',
          morker: 'var(--fel-morker)',
        },
        // Spårfärgerna i adminens diagram (docs/designsystem.md avsnitt 12):
        // bg-diagram-cv, bg-diagram-test. Allt ritas i ink-1.
        diagram: {
          cv: 'var(--diagram-cv)',
          test: 'var(--diagram-test)',
          allt: 'var(--ink-1)',
        },
        // Äldre publika ytor (navy/pink) ligger kvar tills den publika omgången.
        navy: {
          700: '#1A2142',
          800: '#151C39',
          900: '#131B32',
          950: '#0A0F1E',
        },
        pink: {
          500: '#E9457A',
          600: '#D73A6B',
          700: '#C2305B',
        },
      },
      // Typskalan (docs/designsystem.md avsnitt 3). text-fraga, text-tal,
      // text-kort, text-meta, text-steg bor här. Display-klasserna text-h1,
      // text-h1-pub, text-h2-pub och text-varde byter storlek vid lg och bär
      // familjen, så de ligger som klasser i globals.css (v2.1, en linje).
      // Variabeln --font-display sätts av next/font i layout.tsx och faller
      // tillbaka på Inter.
      fontFamily: {
        display: ['var(--font-display)', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        fraga: ['22px', { lineHeight: '28px', letterSpacing: '-0.02em', fontWeight: '600' }],
        tal: ['40px', { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '500' }],
        kort: ['16px', { lineHeight: '22px', letterSpacing: '-0.01em', fontWeight: '600' }],
        meta: ['13px', { lineHeight: '18px' }],
        steg: ['12px', { lineHeight: '16px', letterSpacing: '0.06em', fontWeight: '500' }],
      },
      boxShadow: {
        // Insunkna fält: 1 px mörkare inre överkant, ljuset kommer uppifrån.
        insunken: 'inset 0 1px 0 var(--insunken-topp)',
        // Valt alternativ: kant ink-1 (1 px) plus 1 px inset i samma ton.
        val: 'inset 0 0 0 1px var(--ink-1)',
        // Svävande element: sheet, dropdown, toast, sticky fot.
        svav: '0 8px 24px rgba(28, 25, 23, 0.12), 0 1px 2px rgba(28, 25, 23, 0.08)',
      },
      animation: {
        'thread-enter': 'threadEnter 200ms ease-out both',
        'thread-drop': 'threadDrop 200ms ease-out both',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
