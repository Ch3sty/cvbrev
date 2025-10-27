'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import { use } from 'react'; // Ny import för att hantera Promise params
import {
  User,
  ChevronLeft,
  Mail,
  FileText,
  Clock,
  Crown,
  Settings,
  Calendar,
  Check,
  X
} from 'lucide-react';
import Link from 'next/link';

// Typer för användardata (Oförändrad)
interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  subscription_tier: string | null;
  created_at: string;
  updated_at: string | null;
  last_active: string | null;
  preferred_tonality: string | null;
  weekly_letter_count: number | null;
  last_count_reset: string | null;
  next_reset_date: string | null;
}

interface UserCV {
  id: string;
  file_name: string;
  created_at: string;
}

interface UserLetter {
  id: string;
  title: string | null;
  company: string | null;
  job_title: string | null;
  created_at: string;
  is_saved: boolean;
}

// *** ÄNDRING 1: Byt namn på interfacet för att undvika namnkollision ***
interface AdminUserDetailsPageProps { // Tidigare: PageProps
  params: Promise<{ id: string }>;
}

// *** ÄNDRING 2: Använd det nya interfacenamnet i komponentsignaturen ***
export default function AdminUserDetailsPage({ params }: AdminUserDetailsPageProps) { // Tidigare: PageProps
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [cvs, setCvs] = useState<UserCV[]>([]);
  const [letters, setLetters] = useState<UserLetter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  // Unwrappa params med React.use() (Oförändrad)
  const resolvedParams = use(params);
  const userId = resolvedParams.id;

  const supabase = getSupabaseClient();

  // Hämta användardata (Oförändrad)
  useEffect(() => {
    async function fetchUserData() {
      setIsLoading(true);
      setError(null);

      try {
        // Hämta profil
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError) throw profileError;

        setProfile(profileData);

        // Hämta användarens CV
        const { data: cvData, error: cvError } = await supabase
          .from('cv_texts')
          .select('id, file_name, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (cvError) throw cvError;

        setCvs(cvData || []);

        // Hämta användarens brev
        const { data: letterData, error: letterError } = await supabase
          .from('letters')
          .select('id, title, company, job_title, created_at, is_saved')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (letterError) throw letterError;

        setLetters(letterData || []);

      } catch (err: any) {
        console.error('Fel vid hämtning av användardata:', err);
        setError(err.message || 'Ett fel uppstod vid hämtning av användardata');
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserData();
  }, [userId, supabase]);

  // Uppgradera användare till premium (Oförändrad)
  const handleUpgradeUser = async () => {
    if (!profile) return;

    setIsUpdating(true);
    setUpdateSuccess(null);

    try {
      // Uppdatera användarens prenumerationsnivå i databasen
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_tier: 'premium',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      // Uppdatera lokalt state
      setProfile(prev => prev ? { ...prev, subscription_tier: 'premium' } : null);

      setUpdateSuccess('Användaren har uppgraderats till Premium!');

      // Dölj meddelandet efter några sekunder
      setTimeout(() => {
        setUpdateSuccess(null);
      }, 5000);

    } catch (err: any) {
      console.error('Fel vid uppgradering av användare:', err);
      setError(err.message || 'Ett fel uppstod vid uppgradering av användaren');
    } finally {
      setIsUpdating(false);
    }
  };

  // Nedgradera användare till free (Oförändrad)
  const handleDowngradeUser = async () => {
    if (!profile) return;

    setIsUpdating(true);
    setUpdateSuccess(null);

    try {
      // Uppdatera användarens prenumerationsnivå i databasen
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_tier: 'free',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      // Uppdatera lokalt state
      setProfile(prev => prev ? { ...prev, subscription_tier: 'free' } : null);

      setUpdateSuccess('Användaren har nedgraderats till Free!');

      // Dölj meddelandet efter några sekunder
      setTimeout(() => {
        setUpdateSuccess(null);
      }, 5000);

    } catch (err: any) {
      console.error('Fel vid nedgradering av användare:', err);
      setError(err.message || 'Ett fel uppstod vid nedgradering av användaren');
    } finally {
      setIsUpdating(false);
    }
  };

  // Formatera datum (Oförändrad)
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';

    return new Date(dateStr).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Laddnings- och felhantering
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-t-2 border-b-2 border-pink-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Laddar användardata...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <button
            onClick={() => router.push('/admin/users')}
            className="mr-4 p-2 bg-white rounded-md text-gray-900 hover:bg-gray-100 border border-gray-200 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Användare hittades inte</h1>
        </div>

        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Ett fel uppstod</h2>
          <p className="text-red-700">{error || 'Användaren kunde inte hittas'}</p>
          <Link href="/admin/users" className="inline-block mt-4 px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors">
            Tillbaka till användarlistan
          </Link>
        </div>
      </div>
    );
  }

  // JSX-rendering
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center">
        <button
          onClick={() => router.push('/admin/users')}
          className="mr-4 p-2 bg-white rounded-md text-gray-900 hover:bg-gray-100 border border-gray-200 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {profile.full_name || profile.email}
        </h1>
      </div>

      {updateSuccess && (
        <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-r">
          <p className="text-green-700">{updateSuccess}</p>
        </div>
      )}

      {/* User profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center mb-6">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white text-2xl shadow-sm">
              {profile.full_name
                ? profile.full_name.charAt(0).toUpperCase()
                : profile.email.charAt(0).toUpperCase()}
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {profile.full_name || 'Användare'}
              </h2>
              <div className="flex items-center mt-1">
                {profile.subscription_tier === 'premium' ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-500 to-amber-500 text-white">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    Free
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start">
              <Mail className="w-5 h-5 text-gray-500 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">E-post</p>
                <p className="text-gray-900">{profile.email}</p>
              </div>
            </div>

            <div className="flex items-start">
              <Settings className="w-5 h-5 text-gray-500 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Föredragen tonalitet</p>
                <p className="text-gray-900 capitalize">{profile.preferred_tonality || 'Ej angivet'}</p>
              </div>
            </div>

            <div className="flex items-start">
              <Calendar className="w-5 h-5 text-gray-500 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Registrerad</p>
                <p className="text-gray-900">{formatDate(profile.created_at)}</p>
              </div>
            </div>

            <div className="flex items-start">
              <Clock className="w-5 h-5 text-gray-500 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Senast aktiv</p>
                <p className="text-gray-900">{formatDate(profile.last_active)}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            {profile.subscription_tier !== 'premium' ? (
              <button
                onClick={handleUpgradeUser}
                disabled={isUpdating}
                className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-md hover:from-yellow-600 hover:to-amber-600 disabled:opacity-50 transition-colors"
              >
                {isUpdating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                ) : (
                  <Crown className="w-4 h-4 mr-2" />
                )}
                Uppgradera till Premium
              </button>
            ) : (
              <button
                onClick={handleDowngradeUser}
                disabled={isUpdating}
                className="w-full flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
              >
                {isUpdating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-700 mr-2"></div>
                ) : (
                  <X className="w-4 h-4 mr-2" />
                )}
                Nedgradera till Free
              </button>
            )}
          </div>
        </div>

        {/* Usage statistics */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-500" />
                CV-information
              </h3>

              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">{cvs.length}</div>
                <p className="text-gray-600">Uppladdade CV:n</p>
              </div>

              {cvs.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-600 uppercase mb-2">Senaste CV</h4>
                  <ul className="space-y-3">
                    {cvs.slice(0, 3).map(cv => (
                      <li key={cv.id} className="p-3 bg-gray-50 rounded-md border border-gray-100">
                        <div className="text-gray-900 font-medium">{cv.file_name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Uppladdad: {formatDate(cv.created_at)}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-pink-500" />
                Brevstatistik
              </h3>

              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {letters.filter(l => l.is_saved).length} / {letters.length}
                </div>
                <p className="text-gray-600">Sparade brev / Totalt genererade</p>
              </div>

              {letters.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-600 uppercase mb-2">Senaste brev</h4>
                  <ul className="space-y-3">
                    {letters.slice(0, 3).map(letter => (
                      <li key={letter.id} className="p-3 bg-gray-50 rounded-md border border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="text-gray-900 font-medium">{letter.title || 'Namnlöst brev'}</div>
                          {letter.is_saved && (
                            <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                              Sparat
                            </span>
                          )}
                        </div>
                        {letter.company && (
                          <div className="text-sm text-gray-700 mt-1">
                            {letter.company}{letter.job_title ? ` - ${letter.job_title}` : ''}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          Skapat: {formatDate(letter.created_at)}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Weekly letter usage for free users */}
          {profile.subscription_tier === 'free' && (
            <div className="mt-4 bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-green-500" />
                Veckovis brevgenerering
              </h3>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {profile.weekly_letter_count || 0} / 5
                  </div>
                  <p className="text-gray-600">Genererade brev denna vecka</p>
                </div>

                <div>
                  <div className="relative w-64 h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-green-500 rounded-full"
                      style={{ width: `${Math.min(100, ((profile.weekly_letter_count || 0) / 5) * 100)}%` }}
                    />
                  </div>
                  {profile.next_reset_date && (
                    <p className="text-xs text-gray-500 mt-1">
                      Återställs {formatDate(profile.next_reset_date)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Letters list */}
      <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Alla brev</h3>
        </div>

        {letters.length === 0 ? (
          <div className="p-6 text-center">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Inga brev</h3>
            <p className="text-gray-600">
              Användaren har inte skapat några brev än.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Brev
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Företag / Tjänst
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Datum
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {letters.map((letter) => (
                  <tr key={letter.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {letter.title || 'Namnlöst brev'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {letter.is_saved ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <Check className="w-3 h-3 mr-1" />
                          Sparat
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Osparad
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">
                        {letter.company || '-'}{letter.job_title ? ` / ${letter.job_title}` : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {formatDate(letter.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}