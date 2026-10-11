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
      // Inget darkMode-nyckelord: mörkt läge sker helt via variablerna i
      // globals.css. dark:-klasser används inte (spec-rummen 3.4, grep).
      colors: {
        // Rummen, designsystem v3 (docs/designsystem.md, spec-rummen 3.4).
        // bg-golv, bg-papper, bg-vagg, text-vagg-ink, bg-ton, text-ton-ink,
        // bg-koppar, text-koppar-ljus ... Värdena byter per rum och läge.
        golv: 'var(--golv)',
        papper: {
          DEFAULT: 'var(--papper)',
          2: 'var(--papper-2)',
        },
        vagg: {
          DEFAULT: 'var(--vagg)',
          2: 'var(--vagg-2)',
          3: 'var(--vagg-3)',
          ink: 'var(--vagg-ink)',
          mjuk: 'var(--vagg-mjuk)',
          svag: 'var(--vagg-svag)',
          kant: 'var(--vagg-kant)',
        },
        ljus: 'var(--ljus)',
        ton: {
          DEFAULT: 'var(--ton)',
          ink: 'var(--ton-ink)',
        },
        rum: 'var(--rum)',
        // Illustrationsrollerna (riktning.md, tester-lyftet 2026-10-11), för
        // HTML som ska stå i bildens toner: text-illu-dim, bg-illu-mjuk.
        illu: {
          dim: 'var(--illu-dim)',
          mjuk: 'var(--illu-mjuk)',
          fill: 'var(--illu-fill)',
          accent: 'var(--illu-accent)',
        },
        koppar: {
          DEFAULT: 'var(--koppar)',
          ink: 'var(--koppar-ink)',
          djup: 'var(--koppar-djup)',
          ljus: 'var(--koppar-ljus)',
          text: 'var(--koppar-text)',
          mjuk: 'var(--koppar-mjuk)',
        },
        // Tråden, designsystem v2. I inloggat är de här alias som pekar på
        // Rummens tokens (mark = golv, panel = papper, accent = koppar) och
        // tas bort i våg 4; på publika sidor är de Trådens egna värden.
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
          // Tonerna på bläckytan (Allt-kortet, InkPanel). Fanns som
          // variabler i globals.css men saknade klassnamn, så text-ink-1-mjuk
          // och border-ink-1-kant genererade ingenting (upptäckt i linjen
          // 2026-09-23).
          '1-mjuk': 'var(--ink-1-mjuk)',
          '1-kant': 'var(--ink-1-kant)',
          '1-accent': 'var(--ink-1-accent)',
        },
        // Spårens färgetiketter (designsystem §12 punkt 3): text-cv,
        // bg-cv-mjuk, text-test, bg-test-mjuk. Samma fel som ovan: variablerna
        // fanns, klasserna inte.
        cv: {
          DEFAULT: 'var(--cv)',
          mjuk: 'var(--cv-mjuk)',
        },
        test: {
          DEFAULT: 'var(--test)',
          mjuk: 'var(--test-mjuk)',
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
        // Rummen (spec 3.3 och 3.4). Familjen för tal-rad, tal-tre och
        // kort-t (display) och versalerna i ey sätts i globals.css.
        'tal-rad': ['22px', { lineHeight: '24px', fontWeight: '700' }],
        'tal-tre': ['28px', { lineHeight: '30px', fontWeight: '700' }],
        'kort-t': ['22px', { lineHeight: '27px', fontWeight: '700' }],
        ey: ['12px', { lineHeight: '16px', letterSpacing: '.08em', fontWeight: '600' }],
        ax: ['11px', '16px'],
      },
      borderRadius: {
        lg: '8px',
        xl: '12px',
        '2xl': '16px',
        vagg: '28px',
        ark: '24px',
      },
      boxShadow: {
        // Rummen: det lyfta kortet (LyftKort). insunken, val och svav tas
        // bort i våg 4.
        lyft: 'var(--lyft)',
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
