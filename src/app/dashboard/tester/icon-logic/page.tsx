import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Clock, Target, Brain } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Icon Logic Test | Jobbcoach.ai',
  description: 'Testa din logiska förmåga med minimalistiska ikonmönster'
};

export default async function IconLogicPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient({ cookies: cookieStore });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user's previous attempts
  const { data: attempts } = await supabase
    .from('test_attempts')
    .select('*')
    .eq('user_id', user.id)
    .eq('test_type', 'icon-logic')
    .order('completed_at', { ascending: false })
    .limit(5);

  const bestScore = attempts && attempts.length > 0
    ? Math.max(...attempts.map(a => a.score_raw))
    : null;

  async function startTest() {
    'use server';
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/icon-logic/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to start test');
    }

    const session = await response.json();
    redirect(`/dashboard/tester/icon-logic/test/${session.sessionToken}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            🧩 Icon Logic Test
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Testa din logiska förmåga och mönsterigenkänning med minimalistiska ikonmönster
          </p>
        </div>

        {/* Test Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-md border-2 border-blue-100">
            <div className="flex items-center gap-3 mb-3">
              <Target className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold text-gray-900">10 Frågor</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Varje fråga testar olika logiska mönster med tunna linjer och symboler
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border-2 border-green-100">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-6 h-6 text-green-600" />
              <h3 className="font-semibold text-gray-900">~12 Minuter</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Ingen tidsgräns, men genomsnittlig tid är 10-15 minuter
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border-2 border-purple-100">
            <div className="flex items-center gap-3 mb-3">
              <Brain className="w-6 h-6 text-purple-600" />
              <h3 className="font-semibold text-gray-900">3 Nivåer</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Svårighetsgrad 1-3: från enkla rotationer till komplexa matrismönster
            </p>
          </div>
        </div>

        {/* Best Score */}
        {bestScore !== null && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 mb-1">Ditt bästa resultat</p>
                <p className="text-3xl font-bold">{bestScore}%</p>
              </div>
              <div className="text-6xl opacity-20">🏆</div>
            </div>
          </div>
        )}

        {/* Start Button */}
        <form action={startTest} className="mb-12">
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-3 text-lg group"
          >
            Starta Test
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        {/* Instructions */}
        <div className="bg-white rounded-xl p-8 shadow-md mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Så fungerar testet</h2>
          <div className="space-y-4 text-gray-700">
            <div className="flex gap-4">
              <span className="font-bold text-blue-600 text-xl">1.</span>
              <p>Du får se en 3×3 matris med ikonmönster där sista rutan saknas (markerad med ?)</p>
            </div>
            <div className="flex gap-4">
              <span className="font-bold text-blue-600 text-xl">2.</span>
              <p>Analysera mönstret i matrisen - det kan vara rotation, kvantitet, position eller komplexa regler</p>
            </div>
            <div className="flex gap-4">
              <span className="font-bold text-blue-600 text-xl">3.</span>
              <p>Välj det svarsalternativ (A-F) som logiskt passar in i den saknade rutan</p>
            </div>
            <div className="flex gap-4">
              <span className="font-bold text-blue-600 text-xl">4.</span>
              <p>Efter testet får du detaljerad feedback med förklaringar för varje fråga</p>
            </div>
          </div>
        </div>

        {/* Previous Attempts */}
        {attempts && attempts.length > 0 && (
          <div className="bg-white rounded-xl p-8 shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Tidigare Försök</h2>
            <div className="space-y-3">
              {attempts.map((attempt) => (
                <Link
                  key={attempt.id}
                  href={`/dashboard/tester/icon-logic/results/${attempt.id}`}
                  className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {attempt.score_raw}% ({attempt.correct_answers}/{attempt.total_questions} rätt)
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(attempt.completed_at).toLocaleDateString('sv-SE', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            href="/dashboard/tester"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Tillbaka till Tester
          </Link>
        </div>
      </div>
    </div>
  );
}
