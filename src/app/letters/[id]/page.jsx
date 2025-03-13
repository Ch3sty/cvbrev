"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../firebase';
import ClientLayout from '../../../components/ClientLayout';
import { FiDownload, FiCopy, FiArrowLeft, FiTrash2, FiSave, FiEdit, FiCheck } from 'react-icons/fi';
import { Toaster, toast } from 'react-hot-toast';

export default function ViewLetterPage() {
  const [user, loading] = useAuthState(auth);
  const [letter, setLetter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [letterTitle, setLetterTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [selectedTonality, setSelectedTonality] = useState('professional');
  
  const params = useParams();
  const router = useRouter();
  const letterId = params.id;

  useEffect(() => {
    // Kontrollera om användaren är inloggad
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user && letterId) {
      fetchLetter(letterId);
    }
  }, [user, loading, letterId, router]);

  // När brevet laddas, uppdatera formulärfälten
  useEffect(() => {
    if (letter) {
      setEditedContent(letter.content);
      setLetterTitle(letter.title || '');
      setCompany(letter.company || '');
      setJobTitle(letter.jobTitle || '');
      setSelectedTonality(letter.tonality || 'professional');
    }
  }, [letter]);

  const fetchLetter = async (id) => {
    try {
      setIsLoading(true);
      const api = (await import('../../../api')).default;
      const result = await api.letters.get(id);
      setLetter(result.letter);
    } catch (error) {
      console.error('Error fetching letter:', error);
      toast.error('Kunde inte hämta brevet. Försök igen senare.');
      router.push('/history');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteLetter = async () => {
    if (!confirm('Är du säker på att du vill ta bort detta brev?')) {
      return;
    }

    try {
      const api = (await import('../../../api')).default;
      await api.letters.delete(letterId);
      toast.success('Brevet har tagits bort');
      router.push('/history');
    } catch (error) {
      console.error('Error deleting letter:', error);
      toast.error('Kunde inte ta bort brevet. Försök igen senare.');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(letter.content);
    toast.success('Kopierat till urklipp!');
  };

  const downloadAsDocx = () => {
    // Detta skulle egentligen konvertera till DOCX
    const blob = new Blob([letter.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ansokningsbrev.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const saveLetter = async () => {
    if (!letter) return;
    
    setIsSaving(true);
    
    try {
      const api = (await import('../../../api')).default;
      
      const letterData = {
        content: editedContent,
        title: letterTitle || 'Namnlöst brev',
        company: company,
        jobTitle: jobTitle,
        tonality: selectedTonality,
        letterId: letter.id // Om vi uppdaterar ett befintligt brev
      };
      
      // Använd save endpoint för att spara brevet
      await api.letters.save(letterData);
      
      toast.success('Brevet har sparats!');
      
      // Uppdatera letter-objektet i state
      setLetter({
        ...letter,
        content: editedContent,
        title: letterTitle || 'Namnlöst brev',
        company: company,
        jobTitle: jobTitle,
        tonality: selectedTonality,
        isSaved: true
      });
      
      // Avsluta redigeringsläge
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving letter:', error);
      toast.error('Kunde inte spara brevet. Försök igen senare.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateLetter = async () => {
    if (!letter) return;
    
    setIsSaving(true);
    
    try {
      const api = (await import('../../../api')).default;
      
      // Uppdatera befintligt brev
      await api.letters.update(letter.id, {
        content: editedContent,
        title: letterTitle,
        company: company,
        jobTitle: jobTitle,
        tonality: selectedTonality
      });
      
      toast.success('Brevet har uppdaterats!');
      
      // Uppdatera letter-objektet i state
      setLetter({
        ...letter,
        content: editedContent,
        title: letterTitle,
        company: company,
        jobTitle: jobTitle,
        tonality: selectedTonality
      });
      
      // Avsluta redigeringsläge
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating letter:', error);
      toast.error('Kunde inte uppdatera brevet. Försök igen senare.');
    } finally {
      setIsSaving(false);
    }
  };

  // Tonaliteter på svenska
  const tonalityOptions = [
    { value: 'professional', label: 'Professionell' },
    { value: 'enthusiastic', label: 'Entusiastisk' },
    { value: 'creative', label: 'Kreativ' },
    { value: 'confident', label: 'Självsäker' },
    { value: 'balanced', label: 'Balanserad' }
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Toaster position="top-right" />
      <ClientLayout fullWidth>
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <button 
                onClick={() => router.push('/history')} 
                className="flex items-center text-gray-300 hover:text-white transition-colors"
              >
                <FiArrowLeft className="mr-2" /> Tillbaka till historik
              </button>
              
              {letter && (
                <button
                  onClick={deleteLetter}
                  className="bg-pink-500/20 hover:bg-pink-500/30 text-pink-500 px-4 py-2 rounded-lg flex items-center transition-colors"
                >
                  <FiTrash2 className="mr-2" /> Ta bort
                </button>
              )}
            </div>
            
            {isLoading ? (
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
                <div className="w-12 h-12 border-t-2 border-pink-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Laddar brev...</p>
              </div>
            ) : letter ? (
              <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-xl overflow-hidden">
                <div className="border-b border-gray-800 p-6 flex justify-between items-center">
                  <h1 className="text-2xl font-bold">
                    {isEditing ? 'Redigera brev' : 'Ansökningsbrev'}
                  </h1>
                  
                  <div className="flex space-x-3">
                    {!isEditing ? (
                      <>
                        <button
                          onClick={copyToClipboard}
                          className="bg-indigo-900 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                        >
                          <FiCopy className="mr-2" /> Kopiera
                        </button>
                        <button
                          onClick={downloadAsDocx}
                          className="bg-indigo-900 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                        >
                          <FiDownload className="mr-2" /> Ladda ner
                        </button>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                        >
                          <FiEdit className="mr-2" /> Redigera
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                        >
                          Avbryt
                        </button>
                        <button
                          onClick={letter.isSaved ? updateLetter : saveLetter}
                          disabled={isSaving}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                        >
                          {isSaving ? (
                            <>
                              <div className="w-4 h-4 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                              Sparar...
                            </>
                          ) : (
                            <>
                              <FiSave className="mr-2" /> Spara
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="p-6">
                  {isEditing ? (
                    // Redigeringsformulär
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Brevtitel
                        </label>
                        <input
                          type="text"
                          value={letterTitle}
                          onChange={(e) => setLetterTitle(e.target.value)}
                          placeholder="Ge ditt brev ett namn (t.ex. Ansökan till Utvecklare på Företag AB)"
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">
                            Företag
                          </label>
                          <input
                            type="text"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            placeholder="Företagets namn"
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">
                            Tjänst
                          </label>
                          <input
                            type="text"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            placeholder="Tjänstetitel"
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Tonalitet
                        </label>
                        <select
                          value={selectedTonality}
                          onChange={(e) => setSelectedTonality(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {tonalityOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Brevinnehåll
                        </label>
                        <textarea
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          rows={15}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  ) : (
                    // Visa brev
                    <div>
                      {(letterTitle || company || jobTitle) && (
                        <div className="mb-6 border-b border-gray-800 pb-4">
                          {letterTitle && (
                            <h2 className="text-xl font-semibold text-white mb-2">{letterTitle}</h2>
                          )}
                          {company && jobTitle ? (
                            <p className="text-gray-400">{jobTitle} på {company}</p>
                          ) : company ? (
                            <p className="text-gray-400">{company}</p>
                          ) : jobTitle ? (
                            <p className="text-gray-400">{jobTitle}</p>
                          ) : null}
                          
                          {letter.tonality && (
                            <div className="mt-3">
                              <span className="px-3 py-1 bg-pink-900/40 text-pink-300 rounded-full text-xs">
                                {tonalityOptions.find(opt => opt.value === letter.tonality)?.label || letter.tonality}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="bg-gray-800 rounded-lg p-6 whitespace-pre-line text-gray-200">
                        {letter.content}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
                <p className="text-gray-400">Brevet kunde inte hittas.</p>
              </div>
            )}
          </div>
        </main>
      </ClientLayout>
    </div>
  );
}