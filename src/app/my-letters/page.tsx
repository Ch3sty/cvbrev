'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLetters } from '@/hooks/use-letters';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { sv } from 'date-fns/locale';

export default function MyLettersPage() {
  const router = useRouter();
  const { letters, fetchLetters, isLoading, error, removeLetter } = useLetters();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Använd en referensvariabel för att hålla reda på om initial laddning har skett
  const initialLoadedRef = useRef(false);
  
  // Hämta brev när sidan laddas
  useEffect(() => {
    // Förhindra dubblettanrop
    if (initialLoadedRef.current) return;
    
    // Markera att laddningen har startats
    initialLoadedRef.current = true;
    
    // Hämta brev
    fetchLetters(true);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Formatera datum relativt (t.ex. "för 3 dagar sedan")
  const formatRelativeDate = (dateString: string | null) => {
    if (!dateString) return 'Okänt datum';
    
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: sv
      });
    } catch (error) {
      return 'Okänt datum';
    }
  };
  
  // Förhandsvisning av brevinnehåll
  const getPreview = (content: string) => {
    if (!content) return '';
    
    // Ta bort HTML-taggar och begränsa längden
    const plainText = content.replace(/<[^>]*>/g, '');
    return plainText.length > 150
      ? plainText.substring(0, 150) + '...'
      : plainText;
  };
  
  // Bekräfta och radera brev
  const handleDelete = (id: string) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };
  
  const confirmDelete = async () => {
    if (deleteId) {
      await removeLetter(deleteId);
      setShowDeleteConfirm(false);
      setDeleteId(null);
    }
  };
  
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteId(null);
  };
  
  // Hantera laddningsläge
  if (isLoading) {
    return (
      <div className="container max-w-5xl px-4 py-8 mx-auto">
        <h1 className="mb-6 text-3xl font-bold text-white">Mina sparade brev</h1>
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-t-2 border-b-2 border-pink-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }
  
  // Hantera fel
  if (error) {
    return (
      <div className="container max-w-5xl px-4 py-8 mx-auto">
        <h1 className="mb-6 text-3xl font-bold text-white">Mina sparade brev</h1>
        <div className="p-4 bg-red-500 rounded-md">
          <h2 className="mb-2 text-xl font-bold text-white">Ett fel uppstod</h2>
          <p className="text-white">{error}</p>
          <button
            onClick={() => fetchLetters(true)}
            className="px-4 py-2 mt-4 text-white bg-red-700 rounded-md hover:bg-red-800"
          >
            Försök igen
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-5xl px-4 py-8 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Mina sparade brev</h1>
        <Link
          href="/create-letter"
          className="px-4 py-2 text-white bg-pink-600 rounded-md hover:bg-pink-700"
        >
          Skapa nytt brev
        </Link>
      </div>
      
      {letters.length === 0 ? (
        <div className="p-8 text-center bg-navy-800 rounded-lg">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="mb-4 text-2xl font-bold text-white">Inga sparade brev ännu</h2>
          <p className="mb-6 text-gray-300">
            Du har inte sparat några brev ännu. Skapa ditt första personliga ansökningsbrev!
          </p>
          <Link
            href="/create-letter"
            className="px-6 py-3 text-white bg-pink-600 rounded-md hover:bg-pink-700"
          >
            Skapa ditt första brev
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {letters.map((letter) => (
            <div key={letter.id} className="p-6 transition-shadow bg-navy-800 rounded-lg hover:shadow-lg">
              <div className="flex flex-col justify-between mb-4 md:flex-row md:items-center">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {letter.title || 'Ansökningsbrev'}
                  </h2>
                  <div className="flex flex-wrap mt-2 space-x-2">
                    {letter.company && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {letter.company}
                      </span>
                    )}
                    {letter.job_title && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {letter.job_title}
                      </span>
                    )}
                    {letter.tonality && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                        {letter.tonality.charAt(0).toUpperCase() + letter.tonality.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-400 md:mt-0">
                  Skapad {formatRelativeDate(letter.created_at)}
                </div>
              </div>
              
              <p className="mb-6 text-gray-300">
                {getPreview(letter.content)}
              </p>
              
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/my-letters/${letter.id}`}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Visa
                </Link>
                <Link
                  href={`/my-letters/${letter.id}/edit`}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700"
                >
                  Redigera
                </Link>
                <button
                  onClick={() => handleDelete(letter.id)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Ta bort
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-6 bg-navy-800 rounded-lg">
            <h3 className="mb-4 text-xl font-semibold text-white">Bekräfta borttagning</h3>
            <p className="mb-6 text-gray-300">
              Är du säker på att du vill ta bort detta brev? Detta kan inte ångras.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-white bg-gray-600 rounded-md hover:bg-gray-700"
              >
                Avbryt
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Ta bort
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}