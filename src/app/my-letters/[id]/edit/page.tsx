'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLetters } from '@/hooks/use-letters';
import Link from 'next/link';
import { use } from 'react';

export default function EditLetterPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { getLetter, currentLetter, isLoading, error, editLetter } = useLetters();
  
  // Unwrap params med React.use()
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    job_title: '',
    content: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Ref för att förhindra dubblettladdningar
  const initialLoadRef = useRef(false);
  
  // Hämta brevdata när komponenten monteras, men bara en gång
  useEffect(() => {
    if (id && !initialLoadRef.current) {
      initialLoadRef.current = true;
      getLetter(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  
  // Uppdatera formuläret när brevdata har hämtats
  useEffect(() => {
    if (currentLetter) {
      setFormData({
        title: currentLetter.title || '',
        company: currentLetter.company || '',
        job_title: currentLetter.job_title || '',
        content: currentLetter.content || ''
      });
    }
  }, [currentLetter]);
  
  // Hantera formulärändringar
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Spara ändringar
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveError(null);
      
      // Validera formuläret
      if (!formData.title.trim()) {
        setSaveError('Titel är obligatoriskt');
        return;
      }
      
      if (!formData.content.trim()) {
        setSaveError('Brevinnehåll är obligatoriskt');
        return;
      }
      
      const success = await editLetter(id, {
        title: formData.title,
        company: formData.company,
        job_title: formData.job_title,
        content: formData.content,
      });
      
      if (success) {
        router.push(`/my-letters/${id}`);
      } else {
        setSaveError('Ett fel uppstod när brevet skulle sparas');
      }
    } catch (error: any) {
      setSaveError(error.message || 'Ett fel uppstod');
    } finally {
      setIsSaving(false);
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
      <h1 className="mb-6 text-3xl font-bold text-white">Redigera brev</h1>
      
      <div className="space-y-6">
        {/* Formulär */}
        <div className="p-6 bg-navy-800 rounded-lg">
          <div className="mb-4">
            <label htmlFor="title" className="block mb-1 text-sm text-gray-300">
              Titel
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-2 text-white bg-navy-700 border border-gray-700 rounded-md"
              placeholder="Ansökningsbrev"
            />
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="mb-4">
              <label htmlFor="company" className="block mb-1 text-sm text-gray-300">
                Företag
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full p-2 text-white bg-navy-700 border border-gray-700 rounded-md"
                placeholder="Företagsnamn"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="job_title" className="block mb-1 text-sm text-gray-300">
                Tjänstetitel
              </label>
              <input
                type="text"
                id="job_title"
                name="job_title"
                value={formData.job_title}
                onChange={handleChange}
                className="w-full p-2 text-white bg-navy-700 border border-gray-700 rounded-md"
                placeholder="Jobbtitel"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="content" className="block mb-1 text-sm text-gray-300">
              Brevinnehåll
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={15}
              className="w-full p-2 text-white bg-navy-700 border border-gray-700 rounded-md"
              placeholder="Brevets innehåll..."
            />
          </div>
          
          {saveError && (
            <div className="p-3 mb-4 text-white bg-red-500 rounded-md">
              {saveError}
            </div>
          )}
          
          <div className="flex justify-between mt-6">
            <Link
              href={`/my-letters/${id}`}
              className="px-4 py-2 text-white bg-gray-600 rounded-md hover:bg-gray-700"
            >
              Avbryt
            </Link>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 text-white bg-pink-600 rounded-md hover:bg-pink-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Sparar...' : 'Spara ändringar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}