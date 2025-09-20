// src/app/my-letters/[id]/page.tsx
// UPPDATERAD: Anpassad design och knappstilar.
// KORRIGERAD: Hanterat 'currentLetter' is possibly 'null'.
// KORRIGERAD: Hanterat 'created_at' is possibly 'null' in Date comparison.

'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { useLetters } from '@/hooks/use-letters';
import Link from 'next/link';

// Importera Lucide ikoner
import {
  ArrowLeft,
  Edit,
  Trash2,
  Loader2,
  AlertTriangle,
  FileText,
  Info,
  Plus,
  Building2,
  Briefcase,
  MessageSquare,
  Clock
} from 'lucide-react';

// --- Återanvänd LetterTag-komponenten ---
const LetterTag = ({
  label,
  value,
  type
}: {
  label: string;
  value: string | null;
  type: 'company' | 'job' | 'tone'
}) => {
  if (!value) return null;
  const iconAndColor = {
    company: { icon: <Building2 className="w-4 h-4 mr-1.5 text-blue-400" />, bgClass: "bg-blue-900/30 text-blue-200 border-blue-700/50" },
    job: { icon: <Briefcase className="w-4 h-4 mr-1.5 text-purple-400" />, bgClass: "bg-purple-900/30 text-purple-200 border-purple-700/50" },
    tone: { icon: <MessageSquare className="w-4 h-4 mr-1.5 text-pink-400" />, bgClass: "bg-pink-900/30 text-pink-200 border-pink-700/50" }
  };
  const { icon, bgClass } = iconAndColor[type];
  const displayValue = type === 'tone' ? value.charAt(0).toUpperCase() + value.slice(1) : value;
  return ( <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${bgClass}`} title={`${label}: ${displayValue}`} style={{maxWidth: '180px'}}> {icon} <span className="truncate">{displayValue}</span> </span> );
};
// --- Slut på LetterTag-definition ---


export default function ViewLetterPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { getLetter, currentLetter, isLoading, error, removeLetter, isDeleting } = useLetters();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const initialLoadRef = useRef(false);

  useEffect(() => {
    if (id && !initialLoadRef.current && !currentLetter) {
      initialLoadRef.current = true;
      getLetter(id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);


  const handleEdit = () => {
    router.push(`/dashboard/my-letters/${id}/edit`);
  };

  const handleDeleteRequest = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAction = async () => {
    if (await removeLetter(id)) {
      router.push('/dashboard/my-letters');
      setShowDeleteConfirm(false);
    }
  };

  const cancelDeleteAction = () => {
    if (!isDeleting) {
        setShowDeleteConfirm(false);
    }
  };

  // 1. Hantera initial laddning
  if (isLoading && !currentLetter) {
    return (
      <div className="max-w-screen-lg mx-auto pt-8 pb-16 px-4 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="w-12 h-12 text-pink-500 animate-spin" />
      </div>
    );
  }

  // 2. Hantera fel eller om brevet inte hittades efter laddning
  if (error || (!isLoading && !currentLetter)) {
    return (
      <div className="max-w-screen-lg mx-auto pt-8 pb-16 px-4">
        <div className="p-4 bg-red-900/30 border-l-4 border-red-500 rounded-r-lg animate-fadeIn">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-red-200 mb-1">Ett fel uppstod</h4>
              <p className="text-red-200 text-sm">
                {error || 'Brevet kunde inte hittas eller laddas.'}
              </p>
              <Link
                href="/dashboard/my-letters"
                className="inline-flex items-center mt-3 px-4 py-2 text-sm font-medium text-white bg-navy-700 hover:bg-navy-600 rounded-md transition-colors border border-gray-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Tillbaka till mina brev
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Säkerställ att currentLetter inte är null
  if (!currentLetter) {
    console.error("ViewLetterPage: Rendering condition met, but currentLetter is still null.");
    return (
       <div className="max-w-screen-lg mx-auto pt-8 pb-16 px-4">
          <p className="text-center text-red-400">Ett oväntat fel inträffade vid rendering av brevet.</p>
           <Link href="/dashboard/my-letters" className="block text-center mt-4 text-pink-400 hover:text-pink-300 underline"> Tillbaka till mina brev </Link>
       </div>
    );
  }

  // Om vi når hit, VET TypeScript att currentLetter INTE är null
  return (
    <div className="max-w-screen-lg mx-auto pt-8 pb-16 px-4">
      {/* Header section */}
      <div className="flex flex-col mb-6 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 mb-4 md:mb-0 md:mr-6">
          <h1 className="mb-3 text-3xl font-bold text-white">{currentLetter.title || 'Ansökningsbrev'}</h1>
          <div className="flex flex-wrap gap-2">
            <LetterTag label="Företag" value={currentLetter.company} type="company" />
            <LetterTag label="Tjänst" value={currentLetter.job_title} type="job" />
            <LetterTag label="Tonalitet" value={currentLetter.tonality} type="tone" />
          </div>
        </div>
        <div className="flex space-x-2 flex-shrink-0">
          <button onClick={handleEdit} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-navy-700 hover:bg-navy-600 rounded-md transition-colors border border-gray-700"> <Edit className="w-4 h-4 mr-2" /> Redigera </button>
          <button onClick={handleDeleteRequest} disabled={isDeleting} className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-pink-600 rounded-md hover:bg-pink-700 transition-colors ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}> {isDeleting ? ( <Loader2 className="w-4 h-4 mr-2 animate-spin" /> ) : ( <Trash2 className="w-4 h-4 mr-2" /> )} Ta bort </button>
        </div>
      </div>

      {/* Letter content */}
      <div className="p-6 md:p-8 bg-navy-800 rounded-lg shadow-lg border border-gray-700 mb-6">
        <div
          className="prose prose-invert max-w-none text-gray-200 view-letter-content"
          style={{ lineHeight: '1.7' }}
          dangerouslySetInnerHTML={{ __html: currentLetter.content?.replace(/\n/g, '<br />') || '' }}
        />
      </div>

      {/* Meta info */}
      <div className="p-5 bg-navy-800 rounded-lg shadow-md border border-gray-700 mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center mb-3"> <Info className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0" /> Information </h3>
        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-gray-400 mb-0.5">Skapad</p>
            <p className="text-gray-200"> {currentLetter.created_at ? new Date(currentLetter.created_at).toLocaleString('sv-SE', { dateStyle: 'long', timeStyle: 'short'}) : 'Okänt datum'} </p>
          </div>
          {/* *** KORRIGERING HÄR ***
              Lägg till kontroll för att säkerställa att både updated_at och created_at finns innan jämförelse och new Date() */}
          {currentLetter.updated_at && currentLetter.created_at &&
             new Date(currentLetter.updated_at) > new Date(currentLetter.created_at) && (
            <div>
              <p className="text-gray-400 mb-0.5">Senast uppdaterad</p>
              {/* updated_at är garanterat inte null här pga första delen av && */}
              <p className="text-gray-200"> {new Date(currentLetter.updated_at).toLocaleString('sv-SE', { dateStyle: 'long', timeStyle: 'short'})} </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-8">
        <Link href="/dashboard/my-letters" className="inline-flex items-center w-full sm:w-auto justify-center px-4 py-2 text-sm font-medium text-white bg-navy-700 hover:bg-navy-600 rounded-md transition-colors border border-gray-700"> <ArrowLeft className="w-4 h-4 mr-2" /> Tillbaka till mina brev </Link>
        <Link href="/create-letter" className="inline-flex items-center w-full sm:w-auto justify-center px-4 py-2 text-sm font-medium text-white bg-pink-600 rounded-md hover:bg-pink-700 transition-colors"> <Plus className="w-4 h-4 mr-2" /> Skapa nytt brev </Link>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/80 backdrop-blur-sm transition-opacity animate-fadeIn">
          <div className="bg-navy-800 rounded-lg max-w-md w-full shadow-xl border border-gray-700">
            <div className="p-5 border-b border-gray-700"> <h3 className="text-xl font-semibold text-white flex items-center"> <AlertTriangle className="w-5 h-5 mr-2 text-pink-500" /> Bekräfta borttagning </h3> </div>
            <div className="p-5">
                <p className="text-gray-300 mb-4"> Är du säker på att du vill ta bort brevet <span className="font-medium text-white mx-1">"{currentLetter?.title || 'detta brev'}"</span>? </p>
                <div className="bg-navy-900/50 p-3 border border-gray-700 rounded-md flex items-start"> <AlertTriangle className="w-4 h-4 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" /> <p className="text-yellow-200 text-sm"> Denna åtgärd kan inte ångras och brevet raderas permanent. </p> </div>
            </div>
            <div className="p-5 border-t border-gray-700 flex justify-end space-x-3 bg-navy-900/30">
              <button onClick={cancelDeleteAction} disabled={isDeleting} className="px-4 py-2 bg-navy-700 text-white rounded-md hover:bg-navy-600 transition-colors disabled:opacity-50"> Avbryt </button>
              <button onClick={confirmDeleteAction} disabled={isDeleting} className={`px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}> {isDeleting ? ( <> <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Tar bort... </> ) : ( <> <Trash2 className="w-4 h-4 mr-1.5" /> Ta bort brevet </> )} </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}