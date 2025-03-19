'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLetters } from '@/hooks/use-letters';
import Link from 'next/link';
import { use } from 'react';

export default function ViewLetterPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { getLetter, currentLetter, isLoading, error, removeLetter } = useLetters();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Unwrap params med React.use()
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  // Ref för att förhindra dubblettladdningar
  const initialLoadRef = useRef(false);
  
  useEffect(() => {
    if (id && !initialLoadRef.current) {
      initialLoadRef.current = true;
      getLetter(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleEdit = () => {
    router.push(`/my-letters/${id}/edit`);
  };

  const handleDelete = async () => {
    if (await removeLetter(id)) {
      router.push('/my-letters');
    }
  };

  // Visa laddningsindikator medan data hämtas
  if (isLoading) {
    return (
      <div className="container max-w-4xl px-4 py-8 mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-t-2 border-b-2 border-pink-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Visa felmeddelande om något gick fel
  if (error || !currentLetter) {
    return (
      <div className="container max-w-4xl px-4 py-8 mx-auto">
        <div className="p-4 bg-red-500 rounded-md">
          <h2 className="mb-2 text-xl font-bold text-white">Ett fel uppstod</h2>
          <p className="text-white">{error || 'Brevet kunde inte hittas'}</p>
          <Link href="/my-letters" className="inline-block px-4 py-2 mt-4 text-white bg-red-700 rounded-md hover:bg-red-800">
            Tillbaka till mina brev
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl px-4 py-8 mx-auto">
      {/* Header section */}
      <div className="flex flex-col mb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-white">{currentLetter.title || 'Ansökningsbrev'}</h1>
          <div className="mb-4 space-x-2">
            {currentLetter.company && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {currentLetter.company}
              </span>
            )}
            {currentLetter.job_title && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {currentLetter.job_title}
              </span>
            )}
            {currentLetter.tonality && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                {currentLetter.tonality.charAt(0).toUpperCase() + currentLetter.tonality.slice(1)}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex mt-4 space-x-2 md:mt-0">
          <button
            onClick={handleEdit}
            className="px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Redigera
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Ta bort
          </button>
        </div>
      </div>

      {/* Letter content */}
      <div className="p-8 overflow-auto bg-white rounded-lg shadow-lg">
        <div 
          className="prose max-w-none text-gray-800"
          dangerouslySetInnerHTML={{ __html: currentLetter.content.replace(/\n/g, '<br />') }}
        />
      </div>

      {/* Meta info */}
      <div className="p-4 mt-6 bg-navy-800 rounded-lg">
        <h3 className="mb-2 text-lg font-semibold text-white">Information</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-gray-400">Skapad</p>
            <p className="text-gray-200">
              {currentLetter.created_at 
                ? new Date(currentLetter.created_at).toLocaleDateString('sv-SE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Okänt datum'}
            </p>
          </div>
          {currentLetter.updated_at && (
            <div>
              <p className="text-sm text-gray-400">Senast uppdaterad</p>
              <p className="text-gray-200">
                {new Date(currentLetter.updated_at).toLocaleDateString('sv-SE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Link
          href="/my-letters"
          className="px-4 py-2 text-white bg-gray-600 rounded-md hover:bg-gray-700"
        >
          Tillbaka till mina brev
        </Link>
        <Link
          href="/create-letter"
          className="px-4 py-2 text-white bg-pink-600 rounded-md hover:bg-pink-700"
        >
          Skapa nytt brev
        </Link>
      </div>

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
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-white bg-gray-600 rounded-md hover:bg-gray-700"
              >
                Avbryt
              </button>
              <button
                onClick={handleDelete}
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