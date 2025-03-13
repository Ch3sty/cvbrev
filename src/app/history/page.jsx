"use client";
export const dynamic = "force-dynamic";
// ↑ Förhindrar statisk generering och SSR av denna sida

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import nextDynamic from 'next/dynamic';
import { FiFileText, FiTrash2, FiEye, FiClock, FiEdit, FiSave } from 'react-icons/fi';
import { Toaster, toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/supabase/client';

// Dynamisk import av ClientLayout (ssr: false)
const ClientLayout = nextDynamic(() => import('../../components/ClientLayout'), {
  ssr: false,
});

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const [letters, setLetters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'saved', 'recent'
  const router = useRouter();

  useEffect(() => {
    // Kontrollera om användaren är inloggad
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchLetterHistory();
    }
  }, [user, authLoading, router]);

  const fetchLetterHistory = async () => {
    try {
      setIsLoading(true);
      
      // Hämta brev från Supabase
      const { data, error } = await supabase
        .from('letters')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setLetters(data || []);
    } catch (error) {
      console.error('Error fetching letter history:', error);
      toast.error('Kunde inte hämta brevhistorik');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteLetter = async (id) => {
    if (!confirm('Är du säker på att du vill ta bort detta brev?')) {
      return;
    }
    try {
      // Ta bort brev från Supabase
      const { error } = await supabase
        .from('letters')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Uppdatera lokalt state
      setLetters(letters.filter((letter) => letter.id !== id));
      toast.success('Brevet har tagits bort');
    } catch (error) {
      console.error('Error deleting letter:', error);
      toast.error('Kunde inte ta bort brevet. Försök igen senare.');
    }
  };

  const viewLetter = (id) => {
    router.push(`/letters/${id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Okänt datum';
    try {
      const date = new Date(dateString);

      if (isNaN(date.getTime())) {
        return 'Ogiltigt datum';
      }

      return new Intl.DateTimeFormat('sv-SE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch (error) {
      console.error('Fel vid datumformatering:', error);
      return 'Okänt datum';
    }
  };

  // Tonaliteter på svenska
  const tonalityLabels = {
    professional: 'Professionell',
    enthusiastic: 'Entusiastisk',
    creative: 'Kreativ',
    confident: 'Självsäker',
    balanced: 'Balanserad',
  };

  // Filtrera brev baserat på vald filter
  const filteredLetters = () => {
    switch (filter) {
      case 'saved':
        return letters.filter((letter) => letter.is_saved);
      case 'recent':
        // Returnera brev från de senaste 7 dagarna
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return letters.filter((letter) => {
          const letterDate = letter.created_at
            ? new Date(letter.created_at)
            : new Date(0);
          return letterDate > oneWeekAgo;
        });
      default:
        return letters;
    }
  };
  
  // Bryter ut UI-delarna för att minska komplexiteten
  const renderFilterButtons = () => (
    <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
      <button
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          filter === 'all'
            ? 'bg-pink-500 text-white'
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
        }`}
        onClick={() => setFilter('all')}
      >
        Alla
      </button>
      <button
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          filter === 'saved'
            ? 'bg-pink-500 text-white'
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
        }`}
        onClick={() => setFilter('saved')}
      >
        Sparade
      </button>
      <button
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          filter === 'recent'
            ? 'bg-pink-500 text-white'
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
        }`}
        onClick={() => setFilter('recent')}
      >
        Senaste veckan
      </button>
    </div>
  );

  const renderLoading = () => (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
      <div className="w-12 h-12 border-t-2 border-pink-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-400">Laddar din brevhistorik...</p>
    </div>
  );

  const renderEmptyState = () => (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
        <FiFileText className="w-8 h-8 text-gray-500" />
      </div>
      <h3 className="text-xl font-medium mb-2">Inga brev hittades</h3>
      <p className="text-gray-400 mb-6">
        Du har inga brev som matchar de valda filtren.
      </p>
      <a
        href="/generator"
        className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg font-medium transition-colors inline-block"
      >
        Skapa ett nytt brev
      </a>
    </div>
  );

  const renderLetterTable = () => (
    <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-800">
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">
                Brev
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">
                Tonalitet
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">
                Skapad
              </th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-300">
                Åtgärder
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredLetters().map((letter) => (
              <tr
                key={letter.id}
                className="hover:bg-gray-800/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <FiFileText className="text-pink-500 mr-3 flex-shrink-0" />
                    <div>
                      <div className="text-gray-200 font-medium">
                        {letter.title ||
                          letter.job_title ||
                          'Namnlöst brev'}
                      </div>
                      {letter.company && (
                        <div className="text-gray-400 text-sm">
                          {letter.company}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {letter.tonality && (
                    <span className="px-2 py-1 bg-pink-900/40 text-pink-300 rounded-full text-xs">
                      {tonalityLabels[letter.tonality] ||
                        letter.tonality}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-gray-400">
                    <FiClock className="mr-2" />
                    {formatDate(letter.created_at)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => viewLetter(letter.id)}
                    className="text-indigo-400 hover:text-indigo-300 bg-indigo-900/30 p-2 rounded-md mr-2 transition-colors"
                    title="Visa"
                  >
                    <FiEye />
                  </button>
                  {letter.is_saved ? (
                    <button
                      onClick={() => viewLetter(letter.id)}
                      className="text-green-400 hover:text-green-300 bg-green-900/30 p-2 rounded-md mr-2 transition-colors"
                      title="Redigera"
                    >
                      <FiEdit />
                    </button>
                  ) : (
                    <button
                      onClick={() => viewLetter(letter.id)}
                      className="text-yellow-400 hover:text-yellow-300 bg-yellow-900/30 p-2 rounded-md mr-2 transition-colors"
                      title="Spara permanent"
                    >
                      <FiSave />
                    </button>
                  )}
                  <button
                    onClick={() => deleteLetter(letter.id)}
                    className="text-pink-400 hover:text-pink-300 bg-pink-900/30 p-2 rounded-md transition-colors"
                    title="Ta bort"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Toaster position="top-right" />
      <ClientLayout fullWidth showHeader>
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">
              Din <span className="text-pink-500">brevhistorik</span>
            </h1>
            <p className="text-gray-400 mb-4">Tidigare genererade ansökningsbrev</p>

            {renderFilterButtons()}

            {isLoading || authLoading 
              ? renderLoading() 
              : filteredLetters().length === 0 
                ? renderEmptyState() 
                : renderLetterTable()
            }
          </div>
        </main>
      </ClientLayout>
    </div>
  );
}