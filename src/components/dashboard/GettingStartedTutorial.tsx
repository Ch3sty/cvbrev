'use client';
import { FileText, PenTool, Brain, Briefcase, Palette, Target, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import FloatingParticles from './FloatingParticles';
import FeatureSection from './FeatureSection';

const tutorialSteps = [
  {
    id: 1,
    icon: FileText,
    title: 'Steg 1: Ladda upp ditt CV',
    shortDescription: 'CV:t är kärnan i hela Jobbcoach. Allt börjar här.',
    fullDescription: `
      <div class="space-y-4">
        <div>
          <h5 class="font-bold text-slate-900 mb-2 flex items-center gap-2">
            <span class="text-pink-600">📄</span> Så fungerar det:
          </h5>
          <p class="text-slate-700 mb-2">
            Ladda upp ditt CV i PDF-format, så analyserar vår AI automatiskt din:
          </p>
          <ul class="list-disc list-inside space-y-1 ml-4 text-slate-700">
            <li>Arbetslivserfarenhet och yrkesroller</li>
            <li>Kompetenser och färdigheter</li>
            <li>Utbildningar och certifieringar</li>
            <li>Kontaktinformation och profil</li>
          </ul>
        </div>

        <div>
          <h5 class="font-bold text-slate-900 mb-2 flex items-center gap-2">
            <span class="text-pink-600">🎯</span> Varför är detta viktigt?
          </h5>
          <p class="text-slate-700">
            Ditt CV blir <strong>grunden för alla andra funktioner</strong> i Jobbcoach. När du laddat upp det kan du skapa personliga brev, hitta matchande jobb, analysera din profil och exportera i professionella mallar - allt baserat på samma CV.
          </p>
        </div>

        <div class="bg-pink-50 border border-pink-200 rounded-lg p-3">
          <p class="text-sm text-pink-800">
            <strong>✨ Tips:</strong> Premium-användare kan ladda upp obegränsat antal CV:n och byta mellan dem när som helst.
          </p>
        </div>
      </div>
    `,
    actionText: 'Ladda upp CV',
    href: '/dashboard/profil/cv',
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: 2,
    icon: PenTool,
    title: 'Steg 2: Skapa Personliga Brev',
    shortDescription: 'AI-genererade brev som får dig att sticka ut',
    fullDescription: `
      <div class="space-y-4">
        <div>
          <h5 class="font-bold text-slate-900 mb-2 flex items-center gap-2">
            <span class="text-purple-600">✍️</span> Så fungerar det:
          </h5>
          <ol class="list-decimal list-inside space-y-1 ml-2 text-slate-700">
            <li>Välj ditt CV som grund</li>
            <li>Klistra in jobbannonsen du söker</li>
            <li>Välj tonalitet (professionell, entusiastisk, kreativ etc.)</li>
            <li>Klicka på "Generera brev"</li>
          </ol>
        </div>

        <div>
          <h5 class="font-bold text-slate-900 mb-2 flex items-center gap-2">
            <span class="text-purple-600">🚀</span> Därför är våra brev bättre:
          </h5>
          <p class="text-slate-700 mb-2">Vårt AI-system analyserar jobbannonsen djupt och:</p>

          <div class="space-y-2 ml-2">
            <div class="flex items-start gap-2">
              <span class="text-purple-600 font-bold flex-shrink-0">•</span>
              <div>
                <strong>Matchar nyckelord:</strong> Vi identifierar exakt vilka kompetenser arbetsgivaren söker och lyfter fram DINA matchande erfarenheter
              </div>
            </div>
            <div class="flex items-start gap-2">
              <span class="text-purple-600 font-bold flex-shrink-0">•</span>
              <div>
                <strong>Personlig anpassning:</strong> Varje brev skrivs unikt baserat på DIN faktiska bakgrund - inte generiska mallar
              </div>
            </div>
            <div class="flex items-start gap-2">
              <span class="text-purple-600 font-bold flex-shrink-0">•</span>
              <div>
                <strong>Perfekt tonalitet:</strong> Välj mellan 6 olika tonstiler beroende på företagskultur och bransch
              </div>
            </div>
            <div class="flex items-start gap-2">
              <span class="text-purple-600 font-bold flex-shrink-0">•</span>
              <div>
                <strong>ATS-optimerat:</strong> Våra brev passerar genom rekryteringssystem tack vare korrekt formatering och nyckelordsmatchning
              </div>
            </div>
          </div>
        </div>

        <div class="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <p class="text-sm text-purple-800 mb-2">
            <strong>💡 Resultatet?</strong>
          </p>
          <p class="text-sm text-purple-800">
            Du står ut ur mängden med ett brev som visar exakt varför DU är rätt person, innehåller rätt nyckelord för automatisk matchning, och tar hänsyn till företagets värderingar och kultur.
          </p>
        </div>

        <div class="bg-gradient-to-r from-purple-500/10 to-violet-500/10 rounded-lg p-3 border border-purple-300/30">
          <p class="text-sm font-semibold text-purple-900">
            ⚡ Snabbt & enkelt: Från jobbannons till färdigt brev på under 30 sekunder
          </p>
        </div>
      </div>
    `,
    actionText: 'Skapa brev',
    href: '/dashboard/skapa-brev',
    color: 'from-purple-500 to-violet-500'
  },
  {
    id: 3,
    icon: Brain,
    title: 'Steg 3: Analysera & Förbättra ditt CV',
    shortDescription: 'AI-driven feedback som stärker din profil',
    fullDescription: `
      <div class="space-y-4">
        <div>
          <h5 class="font-bold text-slate-900 mb-2 flex items-center gap-2">
            <span class="text-blue-600">🧠</span> Så fungerar det:
          </h5>
          <p class="text-slate-700 mb-2">
            Välj ditt CV och klicka på "Analysera". Vår AI granskar då:
          </p>
          <ul class="list-disc list-inside space-y-1 ml-4 text-slate-700">
            <li><strong>Styrkor:</strong> Vad gör ditt CV starkt?</li>
            <li><strong>Svagheter:</strong> Vad kan förbättras?</li>
            <li><strong>Kompetenser:</strong> Saknar du viktiga skills för din roll?</li>
            <li><strong>Formuleringar:</strong> Kan du beskriva erfarenheter bättre?</li>
            <li><strong>ATS-kompatibilitet:</strong> Passerar ditt CV rekryteringssystem?</li>
          </ul>
        </div>

        <div>
          <h5 class="font-bold text-slate-900 mb-2 flex items-center gap-2">
            <span class="text-blue-600">📊</span> Detaljerad analys:
          </h5>
          <p class="text-slate-700 mb-2">Du får konkreta, handlingsbara förslag som:</p>

          <div class="space-y-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p class="text-sm text-blue-800 italic">
              "Lägg till kvantifierbara resultat i din senaste roll - t.ex. 'Ökade försäljningen med 35%' istället för 'Ansvarade för försäljning'"
            </p>
            <p class="text-sm text-blue-800 italic">
              "Använd starkare action-verbs: 'Drev' istället för 'Var med i', 'Implementerade' istället för 'Hjälpte till med'"
            </p>
          </div>
        </div>

        <div>
          <h5 class="font-bold text-slate-900 mb-2 flex items-center gap-2">
            <span class="text-blue-600">🎯</span> Branschanpassad feedback:
          </h5>
          <p class="text-slate-700">
            Analysen tar hänsyn till DIN bransch och karriärnivå:
          </p>
          <div class="grid grid-cols-2 gap-2 mt-2">
            <div class="text-sm text-slate-700">• Junior? Vi fokuserar på utbildning</div>
            <div class="text-sm text-slate-700">• Senior? Vi lyfter ledarskap</div>
            <div class="text-sm text-slate-700">• Tech? Vi kollar teknisk stack</div>
            <div class="text-sm text-slate-700">• Sälj? Vi vill se siffror</div>
          </div>
        </div>

        <div class="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
          <p class="text-sm text-cyan-800">
            <strong>✅ Följ upp:</strong> Efter analysen kan du direkt exportera ett förbättrat CV i våra professionella mallar.
          </p>
        </div>
      </div>
    `,
    actionText: 'Analysera CV',
    href: '/dashboard/cv-analys',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 4,
    icon: Briefcase,
    title: 'Steg 4: Hitta Passande Jobb',
    shortDescription: 'Automatisk matchning mot 1000-tals lediga tjänster',
    fullDescription: `
      <div class="space-y-4">
        <div>
          <h5 class="font-bold text-slate-900 mb-2 flex items-center gap-2">
            <span class="text-indigo-600">🔍</span> Så fungerar det:
          </h5>
          <ol class="list-decimal list-inside space-y-1 ml-2 text-slate-700">
            <li>Aktivera ett CV för jobbmatchning</li>
            <li>Vår AI extraherar automatiskt dina yrkesroller, kompetenser och utbildningar</li>
            <li>Vi söker i realtid mot Arbetsförmedlingens API</li>
            <li>Jobben rankas efter relevans (0-100%)</li>
          </ol>
        </div>

        <div>
          <h5 class="font-bold text-slate-900 mb-2 flex items-center gap-2">
            <span class="text-indigo-600">🎯</span> Intelligent matchning:
          </h5>
          <p class="text-slate-700 mb-2">Vårt matchningsystem är smartare än vanlig jobsökning:</p>

          <div class="space-y-2 ml-2">
            <div class="flex items-start gap-2">
              <span class="text-indigo-600 font-bold flex-shrink-0">•</span>
              <div>
                <strong>Semantisk förståelse:</strong> Vi matchar inte bara exakta nyckelord, utan förstår att "Frontend Developer" också matchar "React Developer"
              </div>
            </div>
            <div class="flex items-start gap-2">
              <span class="text-indigo-600 font-bold flex-shrink-0">•</span>
              <div>
                <strong>Erfarenhetsnivå:</strong> Vi filtrerar bort jobb som kräver för mycket eller för lite erfarenhet
              </div>
            </div>
            <div class="flex items-start gap-2">
              <span class="text-indigo-600 font-bold flex-shrink-0">•</span>
              <div>
                <strong>Geografisk filtrering:</strong> Jobb >100km bort döljs som standard, men kan aktiveras om du är mobil
              </div>
            </div>
          </div>
        </div>

        <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
          <p class="text-sm text-indigo-800 mb-2">
            <strong>⚡ Direkt till ansökan:</strong>
          </p>
          <p class="text-sm text-indigo-800">
            Klicka på ett jobb för att se fullständig beskrivning, och använd sedan "Skapa personligt brev" för att direkt generera ett brev anpassat efter denna specifika tjänst.
          </p>
        </div>
      </div>
    `,
    actionText: 'Sök jobb',
    href: '/dashboard/jobbmatchning',
    color: 'from-indigo-500 to-blue-500'
  },
  {
    id: 5,
    icon: Palette,
    title: 'Steg 5: Designa ditt CV',
    shortDescription: 'Exportera i premium-design som imponerar',
    fullDescription: `
      <div class="space-y-4">
        <div>
          <h5 class="font-bold text-slate-900 mb-2 flex items-center gap-2">
            <span class="text-emerald-600">🎨</span> Så fungerar det:
          </h5>
          <ol class="list-decimal list-inside space-y-1 ml-2 text-slate-700">
            <li>Välj ditt CV från biblioteket</li>
            <li>Bläddra bland 10+ professionella mallar</li>
            <li>Välj färgschema och typsnitt</li>
            <li>Förhandsgranska direkt i browsern</li>
            <li>Exportera som PDF</li>
          </ol>
        </div>

        <div>
          <h5 class="font-bold text-slate-900 mb-2 flex items-center gap-2">
            <span class="text-emerald-600">✨</span> Våra mallar:
          </h5>
          <p class="text-slate-700 mb-2">Alla våra designer är:</p>
          <div class="grid grid-cols-2 gap-2">
            <div class="text-sm text-slate-700">• ATS-kompatibla</div>
            <div class="text-sm text-slate-700">• Responsiva</div>
            <div class="text-sm text-slate-700">• Professionella</div>
            <div class="text-sm text-slate-700">• Branschanpassade</div>
          </div>
        </div>

        <div>
          <h5 class="font-bold text-slate-900 mb-2 flex items-center gap-2">
            <span class="text-emerald-600">🏆</span> Premium-mallar:
          </h5>
          <p class="text-slate-700 mb-2">Som Premium-användare får du tillgång till:</p>
          <div class="grid grid-cols-2 gap-2 text-sm text-slate-700">
            <div>• Platinum Executive</div>
            <div>• Nordic Professional</div>
            <div>• Creative Edge</div>
            <div>• Clean Corporate</div>
          </div>
        </div>

        <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
          <p class="text-sm text-emerald-800">
            <strong>💡 Tips:</strong> Använd olika mallar för olika branscher - en kreativ mall för startup-ansökningar, en klassisk för corporate-roller.
          </p>
        </div>
      </div>
    `,
    actionText: 'Välj mall',
    href: '/dashboard/cv-mallar',
    color: 'from-emerald-500 to-teal-500'
  },
  {
    id: 6,
    icon: Target,
    title: 'Bonus: Kompetensutveckling',
    shortDescription: 'Personlig utvecklingsplan baserad på dina mål',
    fullDescription: `
      <div class="space-y-4">
        <div>
          <h5 class="font-bold text-slate-900 mb-2 flex items-center gap-2">
            <span class="text-amber-600">🎯</span> Så fungerar det:
          </h5>
          <ol class="list-decimal list-inside space-y-1 ml-2 text-slate-700">
            <li>Välj ditt CV</li>
            <li>Ange din drömroll eller utvecklingsmål</li>
            <li>AI analyserar gap mellan nuläge och mål</li>
            <li>Få personlig utvecklingsplan</li>
          </ol>
        </div>

        <div>
          <h5 class="font-bold text-slate-900 mb-2 flex items-center gap-2">
            <span class="text-amber-600">📚</span> Utvecklingsplan innehåller:
          </h5>
          <ul class="list-disc list-inside space-y-1 ml-4 text-slate-700">
            <li>Kompetenser att förvärva</li>
            <li>Kurser och certifieringar</li>
            <li>Projektidéer för att bygga portfolio</li>
            <li>Tidsplan (3, 6, 12 månader)</li>
          </ul>
        </div>

        <div class="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p class="text-sm text-amber-800">
            <strong>⚡ Premium-funktion:</strong> Tillgänglig varje vecka för Premium-användare
          </p>
        </div>
      </div>
    `,
    actionText: 'Starta analys',
    href: '/dashboard/kompetensutveckling',
    color: 'from-amber-500 to-orange-500'
  }
];

export default function GettingStartedTutorial() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 rounded-2xl p-6 border border-pink-200/40 shadow-lg"
    >
      {/* Floating particles background */}
      <FloatingParticles
        count={12}
        colors={['bg-pink-400/5', 'bg-purple-400/5', 'bg-blue-400/5', 'bg-indigo-400/5']}
        size="sm"
        speed="slow"
        className="absolute inset-0"
      />

      {/* Header - Always visible */}
      <div className="relative mb-6">
        <div className="flex items-center gap-3 mb-2">
          <motion.div
            className="p-2 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl shadow-lg"
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(236, 72, 153, 0.4)',
                '0 0 0 10px rgba(236, 72, 153, 0)',
                '0 0 0 0 rgba(236, 72, 153, 0)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-7 h-7 text-white" />
          </motion.div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Hur Jobbcoach fungerar
          </h2>
        </div>
        <p className="text-slate-700 font-medium">
          Din kompletta guide till alla funktioner - från CV till drömjobbet 🚀
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
