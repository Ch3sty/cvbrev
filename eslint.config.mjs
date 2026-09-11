import tsParser from '@typescript-eslint/parser'

/**
 * ESLint flat config.
 *
 * Medvetet smal: repot har aldrig haft en config, så att slå på hela
 * next/core-web-vitals nu skulle ge hundratals träffar i kod ingen rör.
 * Här ligger bara spärren vi faktiskt vill ha, C2 i docs/plan-konvertering.md.
 * Next-presetet kan läggas till senare i ett eget svep.
 */
const DASHBOARD_LINK_MESSAGE =
  'Publika sidor får inte länka till /dashboard. Använd /verktyg/*, /skapa-brev/start, /cv-mallar/start eller /register (docs/plan-konvertering.md, C2).'

const eslintConfig = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'build/**',
      'public/**',
    ],
  },
  {
    // Befintlig kod har inline-disables för regler presetet annars laddar.
    // Utan plugin blir de "rule not found"-fel, så vi registrerar den tysta.
    files: ['**/*.{ts,tsx,js,jsx,mjs}'],
    plugins: {
      'react-hooks': { rules: { 'exhaustive-deps': { create: () => ({}) } } },
    },
    rules: { 'react-hooks/exhaustive-deps': 'off' },
  },
  {
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    /**
     * docs/plan-konvertering.md C2: utloggade besökare ska aldrig skickas till
     * /dashboard. Publika sidor och artikelkomponenter länkar till /verktyg/*,
     * /skapa-brev/start, /cv-mallar/start eller /register i stället.
     *
     * Regeln träffar bara länkmål (href) och navigering (router.push/replace),
     * inte varje förekomst av strängen. Server-side redirect av redan inloggade
     * användare till dashboarden är tillåtet och sker via redirectLoggedInTo().
     */
    files: ['src/app/(public)/**/*.{ts,tsx}', 'src/components/artiklar/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        // href och props som bär ett länkmål (ctaHref, primaryCtaHref, ...)
        {
          selector:
            "JSXAttribute[name.name=/^([a-zA-Z]*[Hh]ref)$/] Literal[value=/^\\u002Fdashboard(\\u002F|$)/]",
          message: DASHBOARD_LINK_MESSAGE,
        },
        // href={`/dashboard/...${x}`}
        {
          selector:
            "JSXAttribute[name.name=/^([a-zA-Z]*[Hh]ref)$/] TemplateElement[value.raw=/^\\u002Fdashboard(\\u002F|$)/]",
          message: DASHBOARD_LINK_MESSAGE,
        },
        // Objektfält som href: '/dashboard/...' i länklistor
        {
          selector:
            "Property[key.name=/^(href|url|to)$/] > Literal[value=/^\\u002Fdashboard(\\u002F|$)/]",
          message: DASHBOARD_LINK_MESSAGE,
        },
        // router.push('/dashboard/...') och router.replace(...)
        {
          selector:
            "CallExpression[callee.property.name=/^(push|replace)$/] > Literal[value=/^\\u002Fdashboard(\\u002F|$)/]",
          message: DASHBOARD_LINK_MESSAGE,
        },
      ],
    },
  },
]

export default eslintConfig
