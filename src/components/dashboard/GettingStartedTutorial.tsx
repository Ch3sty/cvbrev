'use client';
import { FileText, PenTool, Brain, Briefcase, Palette, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import FloatingParticles from './FloatingParticles';
import FeatureSection from './FeatureSection';

const tutorialSteps = [
  {
    id: 1,
    icon: FileText,
    title: 'Ladda upp ditt CV',
    shortDescription: 'Grunden för plattformens funktioner',
    fullDescription: `
      <div class="space-y-4">
        <div>
          <h5 class="font-bold text-slate-900 mb-2">
            Så fungerar det
          </h5>
          <p class="text-slate-700 mb-2">
            Ladda upp ditt CV i PDF-format. Vi skannar automatiskt följande information:
          </p>
          <ul class="list-disc list-inside space-y-1 ml-4 text-slate-700">
            <li>Arbetslivserfarenhet och yrkesroller</li>
            <li>Kompetenser och färdigheter</li>
            <li>Utbildningar och certifieringar</li>
            <li>Kontaktuppgifter</li>
          </ul>
        </div>

        <div>
          <p class="text-slate-700">
            Ditt CV utgör <strong>grunden för plattformens samtliga funktioner</strong>. När du har laddat upp det kan du skapa personliga brev, hitta matchande tjänster, analysera din profil och exportera i professionella mallar.
          </p>
        </div>

        <div class="bg-blue-50/50 border border-blue-100 rounded-lg p-3">
          <p class="text-sm text-slate-700">
            <strong>Premium:</strong> Premium-användare kan ladda upp obegränsat antal CV:n och växla mellan dem när som helst.
          </p>
        </div>
      </div>
    `,
    actionText: 'Ladda upp CV',
    href: '/dashboard/profil/cv',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 2,
    icon: PenTool,
    title: 'Skapa personliga brev',
    shortDescription: 'Skräddarsydda brev för varje tjänst',
    fullDescription: `
      <div class="space-y-4">
        <div>
          <h5 class="font-bold text-slate-900 mb-2">
            Så fungerar det
          </h5>
          <ol class="list-decimal list-inside space-y-1 ml-2 text-slate-700">
            <li>Välj ditt CV som grund</li>
            <li>Klistra in jobbannonsen</li>
            <li>Välj önskad tonalitet (professionell, entusiastisk, kreativ)</li>
            <li>Generera brev</li>
          </ol>
        </div>

        <div>
          <h5 class="font-bold text-slate-900 mb-2">
            Vad vi analyserar
          </h5>
          <p class="text-slate-700 mb-2">Vi analyserar jobbannonsen och:</p>

          <div class="space-y-2 ml-2">
            <div class="flex items-start gap-2">
              <span class="text-blue-600 font-bold flex-shrink-0">•</span>
              <div class="text-slate-700">
                <strong>Identifierar viktiga kompetenser</strong> – Vi ser vilka färdigheter arbetsgivaren söker och lyfter fram dina matchande erfarenheter
              </div>
            </div>
            <div class="flex items-start gap-2">
              <span class="text-blue-600 font-bold flex-shrink-0">•</span>
              <div class="text-slate-700">
                <strong>Anpassar innehållet</strong> – Varje brev skrivs unikt utifrån din bakgrund och den specifika tjänsten
              </div>
            </div>
            <div class="flex items-start gap-2">
              <span class="text-blue-600 font-bold flex-shrink-0">•</span>
              <div class="text-slate-700">
                <strong>Väljer rätt tonalitet</strong> – Sex olika stilar beroende på företagskultur och bransch
              </div>
            </div>
            <div class="flex items-start gap-2">
              <span class="text-blue-600 font-bold flex-shrink-0">•</span>
              <div class="text-slate-700">
                <strong>Optimerar för rekryteringssystem</strong> – Korrekt formatering och nyckelordsmatchning för ATS-kompatibilitet
              </div>
            </div>
          </div>
        </div>

        <div class="bg-blue-50/50 border border-blue-100 rounded-lg p-3">
          <p class="text-sm text-slate-700">
            Du får ett färdigt brev på under 30 sekunder.
          </p>
        </div>
      </div>
    `,
    actionText: 'Skapa brev',
    href: '/dashboard/skapa-brev',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 3,
    icon: Brain,
    title: 'Analysera ditt CV',
    shortDescription: 'Professionell feedback som stärker din profil',
    fullDescription: `
      <div class="space-y-4">
        <div>
          <h5 class="font-bold text-slate-900 mb-2">
            Så fungerar det
          </h5>
          <p class="text-slate-700 mb-2">
            Välj ditt CV och starta analysen. Vi granskar:
          </p>
          <ul class="list-disc list-inside space-y-1 ml-4 text-slate-700">
            <li><strong>Styrkor och förbättringsområden</strong> i din presentation</li>
            <li><strong>Kompetenser och formuleringar</strong> som kan stärkas</li>
            <li><strong>ATS-kompatibilitet</strong> för rekryteringssystem</li>
            <li><strong>Branschspecifika krav</strong> för din roll</li>
          </ul>
        </div>

        <div>
          <h5 class="font-bold text-slate-900 mb-2">
            Konkreta förbättringsförslag
          </h5>
          <p class="text-slate-700 mb-2">Du får handlingsbara rekommendationer:</p>

          <div class="space-y-2 bg-blue-50/50 border border-blue-100 rounded-lg p-3">
            <p class="text-sm text-slate-700 italic">
              "Lägg till kvantifierbara resultat i din senaste roll – exempelvis 'Ökade försäljningen med 35 procent' istället för 'Ansvarade för försäljning'."
            </p>
            <p class="text-sm text-slate-700 italic">
              "Använd tydligare handlingsverb: 'Drev' istället för 'Var med i', 'Implementerade' istället för 'Hjälpte till med'."
            </p>
          </div>
        </div>

        <div>
          <h5 class="font-bold text-slate-900 mb-2">
            Branschanpassad feedback
          </h5>
          <p class="text-slate-700 mb-2">
            Analysen anpassas efter din bransch och karriärnivå:
          </p>
          <div class="grid grid-cols-2 gap-2 mt-2">
            <div class="text-sm text-slate-700">• <strong>Juniora profiler:</strong> Fokus på utbildning och potential</div>
            <div class="text-sm text-slate-700">• <strong>Seniora profiler:</strong> Fokus på ledarskap och resultat</div>
            <div class="text-sm text-slate-700">• <strong>Teknikroller:</strong> Granskning av teknisk kompetens</div>
            <div class="text-sm text-slate-700">• <strong>Säljroller:</strong> Granskning av kvantifierbara resultat</div>
          </div>
        </div>

        <div class="bg-blue-50/50 border border-blue-100 rounded-lg p-3">
          <p class="text-sm text-slate-700">
            Efter analysen kan du direkt exportera ett förbättrat CV i våra professionella mallar.
          </p>
        </div>
      </div>
    `,
    actionText: 'Analysera CV',
    href: '/dashboard/cv-analys',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 4,
    icon: Briefcase,
    title: 'Hitta matchande tjänster',
    shortDescription: 'Automatisk matchning mot tusentals lediga tjänster',
    fullDescription: `
      <div class="space-y-4">
        <div>
          <h5 class="font-bold text-slate-900 mb-2">
            Så fungerar det
          </h5>
          <ol class="list-decimal list-inside space-y-1 ml-2 text-slate-700">
            <li>Aktivera ett CV för jobbmatchning</li>
            <li>Vi identifierar automatiskt dina yrkesroller, kompetenser och utbildningar</li>
            <li>Vi söker i realtid mot Arbetsförmedlingens databas</li>
            <li>Tjänsterna rankas efter relevans (0–100 procent)</li>
          </ol>
        </div>

        <div>
          <h5 class="font-bold text-slate-900 mb-2">
            Matchningssystemet
          </h5>
          <p class="text-slate-700 mb-2">Så säkerställer vi relevanta träffar:</p>

          <div class="space-y-2 ml-2">
            <div class="flex items-start gap-2">
              <span class="text-blue-600 font-bold flex-shrink-0">•</span>
              <div class="text-slate-700">
                <strong>Förstår synonymer och relaterade kompetenser</strong> – "Frontend Developer" matchar även "React Developer"
              </div>
            </div>
            <div class="flex items-start gap-2">
              <span class="text-blue-600 font-bold flex-shrink-0">•</span>
              <div class="text-slate-700">
                <strong>Filtrerar på erfarenhetsnivå</strong> – Endast tjänster som matchar din bakgrund
              </div>
            </div>
            <div class="flex items-start gap-2">
              <span class="text-blue-600 font-bold flex-shrink-0">•</span>
              <div class="text-slate-700">
                <strong>Geografisk filtrering</strong> – Tjänster längre bort än 100 kilometer döljs som standard (kan ändras i inställningar)
              </div>
            </div>
          </div>
        </div>

        <div class="bg-blue-50/50 border border-blue-100 rounded-lg p-3">
          <p class="text-sm text-slate-700">
            <strong>Kom igång direkt:</strong> Klicka på en tjänst för att se fullständig beskrivning. Du kan sedan direkt skapa ett personligt brev anpassat efter den specifika tjänsten.
          </p>
        </div>
      </div>
    `,
    actionText: 'Sök tjänster',
    href: '/dashboard/jobbmatchning',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 5,
    icon: Palette,
    title: 'Exportera i professionell design',
    shortDescription: 'Välj mellan professionella mallar',
    fullDescription: `
      <div class="space-y-4">
        <div>
          <h5 class="font-bold text-slate-900 mb-2">
            Så fungerar det
          </h5>
          <ol class="list-decimal list-inside space-y-1 ml-2 text-slate-700">
            <li>Välj ditt CV från biblioteket</li>
            <li>Bläddra bland över 10 professionella mallar</li>
            <li>Välj färgschema och typsnitt</li>
            <li>Förhandsgranska direkt i webbläsaren</li>
            <li>Exportera som PDF</li>
          </ol>
        </div>

        <div>
          <h5 class="font-bold text-slate-900 mb-2">
            Våra mallar
          </h5>
          <p class="text-slate-700 mb-2">Alla designer är:</p>
          <div class="grid grid-cols-2 gap-2">
            <div class="text-sm text-slate-700">• ATS-kompatibla (passerar automatiska rekryteringssystem)</div>
            <div class="text-sm text-slate-700">• Responsiva (optimerade för skärm och utskrift)</div>
            <div class="text-sm text-slate-700">• Professionella (designade enligt branschstandard)</div>
            <div class="text-sm text-slate-700">• Branschanpassade (olika stilar för olika sektorer)</div>
          </div>
        </div>

        <div>
          <h5 class="font-bold text-slate-900 mb-2">
            Premium-mallar
          </h5>
          <p class="text-slate-700 mb-2">Som Premium-användare får du tillgång till:</p>
          <div class="grid grid-cols-2 gap-2 text-sm text-slate-700">
            <div>• Platinum Executive (elegant design för ledande positioner)</div>
            <div>• Nordic Professional (minimalistisk nordisk stil)</div>
            <div>• Creative Edge (kreativa branscher)</div>
            <div>• Clean Corporate (klassisk företagsprofil)</div>
          </div>
        </div>

        <div class="bg-blue-50/50 border border-blue-100 rounded-lg p-3">
          <p class="text-sm text-slate-700">
            Använd olika mallar för olika typer av ansökningar – en kreativ mall för startup-roller, en klassisk för företagspositioner.
          </p>
        </div>
      </div>
    `,
    actionText: 'Välj mall',
    href: '/dashboard/cv-mallar',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 6,
    icon: Target,
    title: 'Kompetensutveckling',
    shortDescription: 'Personlig utvecklingsplan baserad på dina mål',
    fullDescription: `
      <div class="space-y-4">
        <div>
          <h5 class="font-bold text-slate-900 mb-2">
            Så fungerar det
          </h5>
          <ol class="list-decimal list-inside space-y-1 ml-2 text-slate-700">
            <li>Välj ditt CV</li>
            <li>Ange din målroll eller utvecklingsmål</li>
            <li>Vi analyserar kompetensglapp mellan nuläge och önskat mål</li>
            <li>Du får en personlig utvecklingsplan</li>
          </ol>
        </div>

        <div>
          <h5 class="font-bold text-slate-900 mb-2">
            Utvecklingsplanen innehåller
          </h5>
          <ul class="list-disc list-inside space-y-1 ml-4 text-slate-700">
            <li>Kompetenser att förvärva</li>
            <li>Rekommenderade kurser och certifieringar</li>
            <li>Projektförslag för att bygga upp erfarenhet</li>
            <li>Tidsplan (tre, sex eller tolv månader)</li>
          </ul>
        </div>

        <div class="bg-blue-50/50 border border-blue-100 rounded-lg p-3">
          <p class="text-sm text-slate-700">
            <strong>Premium:</strong> Tillgänglig varje vecka för Premium-användare.
          </p>
        </div>
      </div>
    `,
    actionText: 'Starta analys',
    href: '/dashboard/kompetensutveckling',
    color: 'from-blue-500 to-indigo-600'
  }
];

export default function GettingStartedTutorial() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="relative overflow-hidden bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-lg"
    >
      {/* Floating particles background */}
      <FloatingParticles
        count={8}
        colors={['bg-slate-400/3', 'bg-slate-500/3']}
        size="sm"
        speed="slow"
        className="absolute inset-0"
      />

      {/* Header - Always visible */}
      <div className="relative mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            Så fungerar Jobbcoach
          </h2>
        </div>
        <p className="text-slate-600">
          En komplett översikt av plattformens funktioner
        </p>
      </div>

      {/* Feature sections - Each individually expandable */}
      <div className="relative space-y-3">
        {tutorialSteps.map((step, index) => (
          <FeatureSection
            key={step.id}
            icon={step.icon}
            title={step.title}
            shortDescription={step.shortDescription}
            fullDescription={step.fullDescription}
            href={step.href}
            actionText={step.actionText}
            color={step.color}
            index={index}
          />
        ))}
      </div>
    </motion.div>
  );
}
