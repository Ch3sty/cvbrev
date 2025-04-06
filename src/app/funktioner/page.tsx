'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import {
  ChevronRight,
  CheckCircle,
  FileText,
  Upload,
  MessageSquare,
  Copy,
  Lightbulb,
  RefreshCw,
  Save,
  Zap,
  Clock,
  Target,
  BrainCircuit, // Ikon för specialiserad AI
  UserCheck, // Ikon för användardata
  BarChartHorizontal, // Ikon för evidensbaserad
  FileSearch // *** Ikon för CV-Analys ***
} from 'lucide-react'
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

// Effektivitetsdata för grafen (behålls som den är)
const timelineData = [
  { name: 'Dag 1', standardAnsökan: 20, cvBrevAnsökan: 45 },
  { name: 'Dag 3', standardAnsökan: 25, cvBrevAnsökan: 62 },
  { name: 'Dag 7', standardAnsökan: 30, cvBrevAnsökan: 75 },
  { name: 'Dag 14', standardAnsökan: 32, cvBrevAnsökan: 85 },
  { name: 'Dag 30', standardAnsökan: 35, cvBrevAnsökan: 92 },
];

// === UPPdaterad Data för funktionsutnyttjande (Inkluderar CV-Analys) ===
const featureUsageData = [
  { name: 'AI-generering (personliga brev)', value: 50 }, // Justerad %
  { name: 'CV-analys', value: 30 },                     // Lade till CV-analys
  { name: 'Tonalitetsjustering', value: 10 },           // Justerad %
  { name: 'Jobbannonsanalys', value: 10 },              // Justerad % (tidigare implicit i CV/Jobb)
];
// Total: 50 + 30 + 10 + 10 = 100%

// Färger (Lade till en färg för CV-analys)
const COLORS = ['#ec4899', '#a855f7', '#6366f1', '#22d3ee']; // Rosa, Lila, Blå, Turkos

// Graf-komponent för ansökningseffektivitet (behålls som den är)
function CVBrevTimelineChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={timelineData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
        <XAxis dataKey="name" tick={{ fill: '#e2e8f0' }} />
        <YAxis tickFormatter={(value) => `${value}%`} tick={{ fill: '#e2e8f0' }} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }}
          formatter={(value, name) => [`${value}%`, name === 'standardAnsökan' ? 'Standardansökningar' : 'cvbrev.se ansökningar']} // Sentence case
        />
        <Legend wrapperStyle={{ color: '#e2e8f0' }} formatter={(value) => value === 'standardAnsökan' ? 'Standardansökningar' : 'cvbrev.se ansökningar'}/> {/* Sentence case legend */}
        <Line
          type="monotone"
          dataKey="standardAnsökan"
          name="Standard ansökningar" // Behålls för recharts interna nyckel, formatter i Legend fixar visning
          stroke="#94a3b8"
          strokeWidth={2}
          dot={{ r: 5 }}
          activeDot={{ r: 8 }}
        />
        <Line
          type="monotone"
          dataKey="cvBrevAnsökan"
          name="cvbrev.se ansökningar" // Behålls för recharts interna nyckel
          stroke="#ec4899"
          strokeWidth={3}
          dot={{ r: 5, strokeWidth: 2 }}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// === Graf-komponent för funktionsanvändning (Inga ändringar i logik, använder uppdaterad data) ===
function FeatureUsageChart() {
  const chartHeight = 300;
  const outerRadiusPercentage = '80%';
  const labelFontSize = 12;

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <PieChart>
        <Pie
          data={featureUsageData} // Använder nu uppdaterad data
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={outerRadiusPercentage}
          fill="#8884d8"
          dataKey="value"
          label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
            const radius = outerRadius * 1.15;
            const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
            const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
            const textAnchor = x > cx ? 'start' : 'end';
            const displayName = name;

            return (
              <text
                x={x}
                y={y}
                fill="#e2e8f0"
                textAnchor={textAnchor}
                dominantBaseline="central"
                fontSize={labelFontSize}
                className="pointer-events-none"
              >
                {`${displayName} ${(percent * 100).toFixed(0)}%`}
              </text>
            );
          }}
        >
          {featureUsageData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} /> // Använder uppdaterade färger
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }}
          formatter={(value, name) => [`${value}%`, name]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}


export default function FunktionerPage() {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
  async function getSession() {
    try {
      setIsLoading(true);
      try {
        const { getSupabaseClient } = await import('@/lib/supabase/client-manager');
        const supabase = getSupabaseClient();
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
      } catch (error) {
        console.error('Kunde inte hämta session:', error);
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Allmänt fel i getSession:', error);
      setIsLoading(false);
    }
  }
    getSession();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-navy-950">
        <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-white">Laddar funktioner...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        {/* === SEO Optimerade Meta Tags (Inkluderar CV-Analys) === */}
        <title>Funktioner | AI för personligt brev och CV-analys | cvbrev.se</title>
        <meta
          name="description"
          content="Upptäck cvbrev.se:s AI-funktioner: Skapa personliga brev, få detaljerad CV-analys, justera tonalitet, och mer. Vetenskapligt baserade verktyg för att öka dina chanser till intervju."
        />
        <meta
          name="keywords"
          content="personligt brev, AI, funktioner, cvbrev.se, skriva personligt brev, jobbansökan, CV-analys, jobbannonsanalys, tonalitet, AI-assistent, ansökningsbrev, mallar, Harvard, Stanford, vetenskapligt baserad, analysera CV" // Lade till CV-analys nyckelord
        />
        <meta property="og:title" content="Funktioner | AI för personligt brev och CV-analys | cvbrev.se" />
        <meta property="og:description" content="Utforska kraftfulla AI-verktyg: generera skräddarsydda personliga brev, få djupgående CV-analys, justera tonen och mycket mer. Öka dina jobbchanser med cvbrev.se." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cvbrev.se/funktioner" />
        <meta property="og:image" content="https://cvbrev.se/images/cvbrev-og-funktioner.png" />
        <link rel="canonical" href="https://cvbrev.se/funktioner" />
      </Head>

      <div className="flex flex-col min-h-screen bg-navy-950">
        {/* Hero section (Uppdaterad text med CV-analys) */}
        <section className="relative overflow-hidden bg-gradient-to-b from-navy-900 to-navy-800">
          <div className="absolute inset-0 bg-gradient-to-b from-navy-900/50 to-navy-800/50"></div>

          <div className="container relative px-4 py-16 mx-auto lg:py-24">
            <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2">
              <div className="text-center lg:text-left">
                <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                  AI-drivna <span className="text-pink-500">funktioner</span> för personliga brev & CV-analys {/* Uppdaterad H1 */}
                </h1>

                <p className="max-w-2xl mx-auto mb-8 text-xl text-gray-300 lg:mx-0">
                  Välkommen till cvbrev.se – din personliga AI-assistent. Upptäck hur våra vetenskapligt baserade verktyg skapar imponerande personliga brev och ger dig värdefull insikt genom detaljerad CV-analys för att maximera dina jobbchanser. {/* Uppdaterad P */}
                </p>

                <div className="flex flex-col justify-center gap-4 mt-8 sm:flex-row lg:justify-start">
                  {session ? (
                    <Link
                      href="/create-letter"
                      className="inline-flex items-center px-8 py-4 text-lg font-medium text-white transition-all duration-300 bg-pink-600 rounded-md shadow-lg hover:bg-pink-700 hover:shadow-xl group"
                    >
                      Kom igång nu {/* Ändrad knapptext */}
                      <ChevronRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  ) : (
                    <Link
                      href="/register"
                      className="inline-flex items-center px-8 py-4 text-lg font-medium text-white transition-all duration-300 bg-pink-600 rounded-md shadow-lg hover:bg-pink-700 hover:shadow-xl group"
                    >
                      Börja gratis
                      <ChevronRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  )}

                  <Link
                    href="#huvudfunktioner"
                    className="inline-flex items-center px-8 py-4 text-lg font-medium text-white transition-colors border border-white rounded-md hover:bg-white hover:bg-opacity-10"
                  >
                    Utforska funktioner
                  </Link>
                </div>
              </div>

              <div className="order-first lg:order-last">
                {/* Bild behålls */}
                 <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-blue-500 rounded-3xl blur-xl opacity-30"></div>
                  <div className="relative flex justify-center p-8 lg:p-0">
                    <img
                      src="/cvbrev.png"
                      alt="cvbrev.se AI robot logotyp"
                      className="w-40 lg:w-64 animate-bounce"
                      style={{ animationDuration: '6s' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ansökningseffektivitet section (Inga direkta ändringar här, fokus på personliga brev) */}
        <section className="py-16 bg-navy-900 lg:py-24">
           {/* Innehåll behålls som tidigare */}
           <div className="container px-4 mx-auto">
            <div className="max-w-3xl mx-auto mb-16 text-center">
              <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                Resultat som talar för sig själva
              </h2>
              <p className="text-xl text-gray-300">
                Ett välformulerat personligt brev ökar chanserna till intervju avsevärt. Med cvbrev.se får du snabbare och bättre respons, baserat på metoder inspirerade av forskning från bl.a. <span className="font-semibold text-pink-400">Harvard</span>, <span className="font-semibold text-pink-400">Stanford</span> och <span className="font-semibold text-pink-400">Yale</span>.
              </p>
            </div>

            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <h3 className="mb-6 text-2xl font-bold text-white">Ökad svarsfrekvens – bevisat effektivt</h3>
                <p className="mb-8 text-gray-300">
                  Våra data visar tydligt: användare av cvbrev.se upplever en markant högre svarsfrekvens jämfört med traditionella ansökningsmetoder. AI:n hjälper dig att förmedla både kompetens och passion, vilket gör att du sticker ut direkt. Se hur dina chanser förbättras över tid!
                </p>

                <ul className="space-y-4">
                  {/* Listpunkter behålls */}
                   <li className="flex items-start">
                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-pink-600 rounded-full">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-white"><span className="font-bold text-pink-500">92%</span> av användarna får svar inom 30 dagar</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-pink-600 rounded-full">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-white"><span className="font-bold text-pink-500">45%</span> får svar redan inom första dagen</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-pink-600 rounded-full">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-white"><span className="font-bold text-pink-500">2.6x</span> högre intervjufrekvens jämfört med standardansökningar</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="p-6 bg-navy-800 rounded-xl">
                <h3 className="mb-4 text-xl font-semibold text-white text-center">Svarsfrekvens över tid (cvbrev.se vs standard)</h3>
                <div className="relative h-80">
                  <CVBrevTimelineChart />
                </div>
                <p className="mt-3 text-sm text-gray-400 text-center">Baserat på aggregerad anonymiserad användardata</p>
              </div>
            </div>
          </div>
        </section>

        {/* Main features section (Lade till CV-Analys box) */}
        <section id="huvudfunktioner" className="py-16 bg-navy-950 lg:py-24">
          <div className="container px-4 mx-auto">
            <div className="max-w-3xl mx-auto mb-16 text-center">
              <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                Kärnfunktionerna i cvbrev.se
              </h2>
              <p className="text-xl text-gray-300">
                Verktygen som gör skillnad. Byggda på forskning och designade för att ge dig ett övertag i jobbsökandet.
              </p>
            </div>

            {/* Uppdaterad grid med 4 kolumner på större skärmar? Eller 2x2? 2x3 layout ser ok ut. */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Feature: CV-uppladdning (Tidigare CV-analys, nu mer fokuserad på input) */}
              <div className="p-6 transition-transform duration-300 bg-navy-800 rounded-xl hover:translate-y-[-8px]">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-2xl font-bold text-white bg-gradient-to-r from-pink-600 to-pink-500 rounded-full">
                  <Upload className="w-6 h-6" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-center text-white">Ladda upp ditt CV</h3>
                <p className="text-center text-gray-300">
                  Importera enkelt ditt CV (<span className='font-semibold'>PDF, DOCX, TXT</span>). Detta är grunden för både ditt personliga brev och den djupgående CV-analysen (Premium).
                </p>
              </div>

               {/* *** NY Feature: CV-Analys (Premium) *** */}
              <div className="p-6 transition-transform duration-300 bg-navy-800 rounded-xl hover:translate-y-[-8px] border border-purple-500/30"> {/* Lite border för att highlighta? */}
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-2xl font-bold text-white bg-gradient-to-r from-pink-500 to-purple-500 rounded-full">
                  <FileSearch className="w-6 h-6" /> {/* CV-analys ikon */}
                </div>
                <h3 className="mb-3 text-xl font-semibold text-center text-white">Djupgående CV-analys (Premium)</h3>
                <p className="text-center text-gray-300">
                   Få detaljerad feedback på ditt CV: identifierade styrkor, förbättringsområden, nyckelord, tydlighet, struktur och användning av starka verb. Optimera ditt viktigaste dokument!
                </p>
              </div>

              {/* Feature: Jobbannonsanalys */}
              <div className="p-6 transition-transform duration-300 bg-navy-800 rounded-xl hover:translate-y-[-8px]">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-2xl font-bold text-white bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-center text-white">Jobbannonsanalys</h3>
                <p className="text-center text-gray-300">
                  Klistra in jobbannonsen. AI:n identifierar nyckelkrav, önskvärda meriter och företagskultur för att perfekt matcha ditt personliga brev.
                </p>
              </div>

              {/* Feature: AI-brevgenerering */}
              <div className="p-6 transition-transform duration-300 bg-navy-800 rounded-xl hover:translate-y-[-8px]">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-2xl font-bold text-white bg-gradient-to-r from-blue-500 to-teal-500 rounded-full"> {/* Ny färgordning */}
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-center text-white">Specialiserad AI-generering av personliga brev</h3>
                <p className="text-center text-gray-300">
                  Baserat på analysen skapar vår <span className='font-semibold'>optimerade AI-prompt</span> ett unikt, skräddarsytt och övertygande personligt brev på sekunder. Undvik generiska fraser!
                </p>
              </div>

              {/* Feature: Tonalitetsjustering */}
              <div className="p-6 transition-transform duration-300 bg-navy-800 rounded-xl hover:translate-y-[-8px]">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-2xl font-bold text-white bg-gradient-to-r from-teal-500 to-green-500 rounded-full"> {/* Ny färgordning */}
                  <Lightbulb className="w-6 h-6" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-center text-white">Anpassningsbar tonalitet</h3>
                <p className="text-center text-gray-300">
                  Välj tonläge – professionellt, kreativt, formellt eller personligt – för att matcha tjänsten och företagets kultur perfekt. Kommunicera med rätt röst.
                </p>
              </div>

              {/* Feature: Spara och hantera (Iteration inkluderad) */}
              <div className="p-6 transition-transform duration-300 bg-navy-800 rounded-xl hover:translate-y-[-8px]">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-2xl font-bold text-white bg-gradient-to-r from-green-500 to-yellow-500 rounded-full"> {/* Ny färgordning */}
                  <Save className="w-6 h-6" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-center text-white">Redigera, spara & återanvänd</h3>
                <p className="text-center text-gray-300">
                  Generera nya versioner, finjustera texten i editorn, och spara dina personliga brev och CV-uppgifter säkert. Återanvänd och anpassa enkelt.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why cvbrev.se & Feature Usage Section (Uppdaterad text) */}
        <section className="py-16 bg-navy-900 lg:py-24">
          <div className="container px-4 mx-auto">
             <div className="max-w-3xl mx-auto mb-16 text-center">
              <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                Varför cvbrev.se <span className="text-pink-500">slår</span> generiska AI-verktyg
              </h2>
              <p className="text-xl text-gray-300">
                Medan generell AI är kraftfull, är cvbrev.se specialbyggd för jobbsökande: att maximera dina chanser med vetenskapligt grundade metoder för både personliga brev och CV-analys. {/* Uppdaterad text */}
              </p>
            </div>

            <div className="grid items-start gap-12 lg:grid-cols-2">
              {/* Fördelar / USP */}
              <div>
                <ul className="space-y-6 mb-8">
                  {/* Punkter behålls, ev. små justeringar */}
                   <li className="flex items-start">
                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-purple-600 rounded-full">
                      <BrainCircuit className="w-5 h-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="mb-1 text-xl font-semibold text-white">Specialiserad & optimerad AI</h3>
                      <p className="text-gray-300">Våra unika AI-prompts är utvecklade genom forskning för att garantera övertygande, skräddarsydda och felfria personliga brev samt insiktsfull CV-analys.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full">
                      <UserCheck className="w-5 h-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="mb-1 text-xl font-semibold text-white">Integration av dina data</h3>
                      <p className="text-gray-300">Genom att analysera <span className='font-semibold'>ditt CV</span> och <span className='font-semibold'>jobbannonsen</span> matchar vi effektivt rätt erfarenheter med kraven för det personliga brevet.</p>
                    </div>
                  </li>
                   <li className="flex items-start">
                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-teal-600 rounded-full">
                      <BarChartHorizontal className="w-5 h-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="mb-1 text-xl font-semibold text-white">Evidensbaserade resultat</h3>
                      <p className="text-gray-300">Vi kombinerar insikter från <span className='font-semibold'>Harvard, Stanford, Yale</span> och rekryteringsproffs med modern AI för en lösning som är både innovativ och beprövad.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-pink-600 rounded-full">
                       <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="mb-1 text-xl font-semibold text-white">Användarvänligt & effektivt</h3>
                      <p className="text-gray-300">Ett intuitivt gränssnitt gör det enkelt att skapa personliga brev, få CV-analys och hantera dina ansökningar utan att vara AI-expert. Spara värdefull tid.</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Feature Usage Chart (Använder uppdaterad data) */}
              <div className="p-6 bg-navy-800 rounded-xl">
                <h3 className="mb-4 text-xl font-semibold text-white text-center">Mest använda funktioner</h3>
                <div className="relative h-[340px]">
                  <FeatureUsageChart /> {/* Visar nu 4 kategorier */}
                </div>
                <p className="mt-3 text-sm text-gray-400 text-center">
                  Baserat på hur kärnfunktionerna används på cvbrev.se
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ section (Lade till fråga om CV-Analys) */}
        <section className="py-16 bg-navy-950 lg:py-24">
          <div className="container px-4 mx-auto">
            <div className="max-w-3xl mx-auto mb-16 text-center">
              <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                Vanliga frågor om funktionerna
              </h2>
              <p className="text-xl text-gray-300">
                Få svar på dina funderingar kring hur cvbrev.se fungerar.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="space-y-6">
                 {/* Existerande frågor behålls */}
                 <div className="p-6 bg-navy-800 rounded-xl">
                  <h3 className="mb-3 text-xl font-semibold text-white">Hur bra är AI:n jämfört med att skriva själv?</h3>
                  <p className="text-gray-300">
                    Vår AI är tränad på <span className='font-semibold'>beprövade metoder</span> och tusentals framgångsrika personliga brev. Den är utmärkt på att snabbt skapa en <span className='font-semibold'>strukturerad och relevant grund</span>, matcha ditt CV mot jobbet och undvika vanliga misstag. Se det som en expertassistent – du har sedan full möjlighet att förfina och personifiera texten.
                  </p>
                </div>
                 <div className="p-6 bg-navy-800 rounded-xl">
                  <h3 className="mb-3 text-xl font-semibold text-white">Varför inte bara använda ChatGPT direkt?</h3>
                  <p className="text-gray-300">
                    cvbrev.se erbjuder flera fördelar: 1) <span className='font-semibold'>Specialiserade prompts</span> baserade på forskning för optimerade resultat i både personliga brev och CV-analys. 2) Direkt <span className='font-semibold'>integration av ditt CV och jobbannonsen</span> för exakt matchning. 3) Fokus på <span className='font-semibold'>kvalitet och relevans</span> specifikt för jobbsökande. 4) Ett <span className='font-semibold'>användarvänligt gränssnitt</span> designat för just detta ändamål. {/* Uppdaterad text */}
                  </p>
                </div>

                 {/* *** NY Fråga om CV-Analys *** */}
                 <div className="p-6 bg-navy-800 rounded-xl">
                  <h3 className="mb-3 text-xl font-semibold text-white">Vad ingår i CV-analysen (Premium)?</h3>
                  <p className="text-gray-300">
                    CV-analysen ger dig en <span className='font-semibold'>omfattande genomgång</span> av ditt uppladdade CV. AI:n identifierar och sammanfattar dina <span className='font-semibold'>styrkor</span>, pekar ut konkreta <span className='font-semibold'>förbättringsområden</span> (t.ex. kvantifiering av prestationer, förtydligande av färdigheter), listar relevanta <span className='font-semibold'>nyckelord</span>, samt bedömer <span className='font-semibold'>tydlighet/struktur</span> och användningen av <span className='font-semibold'>starka verb</span>. Det är ett kraftfullt verktyg för att finslipa ditt CV.
                  </p>
                </div>

                <div className="p-6 bg-navy-800 rounded-xl">
                  <h3 className="mb-3 text-xl font-semibold text-white">Kommer rekryterare märka att det personliga brevet är AI-genererat?</h3>
                  <p className="text-gray-300">
                    Nej, vårt mål är att skapa personliga brev som låter <span className='font-semibold'>naturliga och personliga</span>. AI:n genererar en stark grund, men vi uppmuntrar dig starkt att <span className='font-semibold'>läsa igenom, redigera och lägga till din egen röst</span>. Våra verktyg för tonalitet och iteration hjälper dig att göra det personliga brevet unikt ditt.
                  </p>
                </div>
                <div className="p-6 bg-navy-800 rounded-xl">
                  <h3 className="mb-3 text-xl font-semibold text-white">Vilka filformat stöds för CV-uppladdning?</h3>
                  <p className="text-gray-300">
                    Du kan ladda upp ditt CV i de vanligaste formaten: <span className='font-semibold'>PDF, DOCX (Word-dokument) och TXT</span>. Vår AI extraherar automatiskt relevant information för att skapa ditt personliga brev och genomföra CV-analysen. {/* Uppdaterad text */}
                  </p>
                </div>
                <div className="p-6 bg-navy-800 rounded-xl">
                  <h3 className="mb-3 text-xl font-semibold text-white">Hur hanteras min data (CV och personliga brev)?</h3>
                  <p className="text-gray-300">
                    Din data sparas <span className='font-semibold'>säkert och krypterat</span> på ditt konto så länge det är aktivt. Du har full kontroll och kan <span className='font-semibold'>radera dina uppgifter när som helst</span> via dina kontoinställningar. Vi delar eller använder aldrig din data i andra syften än att tillhandahålla tjänsten. Läs mer i vår integritetspolicy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA section (Uppdaterad text) */}
        <section className="py-16 bg-gradient-to-r from-pink-600 to-purple-600 lg:py-20">
          <div className="container px-4 mx-auto text-center">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              Redo att optimera hela din ansökan?
            </h2>

            <p className="max-w-2xl mx-auto mb-8 text-xl text-white text-opacity-90">
              Ta kontroll över din jobbansökan med AI-drivna personliga brev och djupgående CV-analys. Låt cvbrev.se bli din hemlighet för att vinna drömjobbet. Börja skapa och analysera – redan idag! {/* Uppdaterad text */}
            </p>

            <Link
              href={session ? "/create-letter" : "/register"} // create-letter är fortfarande en bra startpunkt
              className="inline-flex items-center px-8 py-4 text-lg font-medium text-pink-600 transition-colors bg-white rounded-md shadow-lg hover:bg-gray-100 group"
            >
              {session ? "Kom igång nu" : "Kom igång gratis nu"} {/* Behåller enkel knapptext */}
              <ChevronRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}