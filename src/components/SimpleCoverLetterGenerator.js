"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  FiDownload,
  FiCopy,
  FiFileText,
  FiRefreshCw,
  FiEdit,
  FiAlertCircle,
  FiSave,
  FiList
} from 'react-icons/fi';
import TonalitySelector from './TonalitySelector';
import { toast, Toaster } from 'react-hot-toast';

const SimpleCoverLetterGenerator = () => {
  const { user, userProfile } = useAuth();
  
  // CV selection state
  const [userCVs, setUserCVs] = useState([]);
  const [selectedCVId, setSelectedCVId] = useState('');
  const [selectedCVContent, setSelectedCVContent] = useState('');
  
  // Job description and cover letter states
  const [jobDescription, setJobDescription] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  
  // Processing states
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Tonality and metadata
  const [tonality, setTonality] = useState('professional');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [letterTitle, setLetterTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [generatedLetterId, setGeneratedLetterId] = useState(null);

  // Load user's CVs on component mount
  useEffect(() => {
    if (user) {
      fetchUserCVs();
    }
  }, [user]);

  // Set preferred tonality from user profile
  useEffect(() => {
    if (userProfile && userProfile.preferred_tonality) {
      setTonality(userProfile.preferred_tonality);
    }
  }, [userProfile]);

  // Clear errors when user makes changes
  useEffect(() => {
    if (error) {
      setError('');
    }
  }, [selectedCVId, jobDescription, error]);

  // Fetch user's CVs directly from Storage
  const fetchUserCVs = async () => {
    try {
      setIsLoading(true);
      
      // Lista alla filer i användarens CV-mapp direkt från storage
      const { data, error } = await supabase
        .storage
        .from('cvs')
        .list(`${user.id}`, {
          sortBy: { column: 'updated_at', order: 'desc' }
        });
        
      if (error) throw error;
      
      console.log('Hämtade CV från storage:', data);
      
      // Filtrera bort mappar om sådana finns
      const files = data.filter(item => !item.metadata?.mimetype?.includes('directory'));
      
      setUserCVs(files || []);
      
      // Om user har CV:n, välj det senaste som standard
      if (files && files.length > 0) {
        setSelectedCVId(files[0].id);
        await loadCVContent(files[0]);
      }
    } catch (error) {
      console.error('Error fetching CVs from storage:', error);
      setError('Kunde inte hämta dina CV:n från storage');
    } finally {
      setIsLoading(false);
    }
  };

  // Load the content of a selected CV
  const loadCVContent = async (cv) => {
    if (!cv) return;
    
    try {
      setIsLoading(true);
      console.log('Försöker ladda CV:', cv);
      
      // Full sökväg till filen
      const filePath = `${user.id}/${cv.name}`;
      console.log('Använder filsökväg:', filePath);
      
      // Ladda ned filen från storage
      const { data, error } = await supabase
        .storage
        .from('cvs')
        .download(filePath);
      
      if (error) {
        console.error('Fel vid nedladdning från storage:', error);
        throw error;
      }
      
      // Hantera olika filtyper
      const fileType = cv.name.split('.').pop().toLowerCase();
      if (fileType === 'txt') {
        const text = await data.text();
        setSelectedCVContent(text);
      } else {
        // För andra filtyper - använd en platshållare
        setSelectedCVContent(`[Innehållet från ${cv.name} kommer att användas för att generera ditt brev]`);
        
        // I en framtida implementation kan du skicka PDF/DOCX till en textextraktions-API
        // För nu anger vi endast att vi kommer använda filen
      }
      
      // Update selected CV ID
      setSelectedCVId(cv.id);
    } catch (error) {
      console.error('Error loading CV content:', error);
      setError(`Kunde inte ladda CV-innehållet: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle CV selection change
  const handleCVChange = async (e) => {
    const cvId = e.target.value;
    setSelectedCVId(cvId);
    if (cvId) {
      const selectedCV = userCVs.find(cv => cv.id === cvId);
      if (selectedCV) {
        await loadCVContent(selectedCV);
      }
    } else {
      setSelectedCVContent('');
    }
  };

  // Generate cover letter
  const generateCoverLetter = async () => {
    if (!selectedCVContent || !jobDescription) {
      setError('Vänligen välj ett CV och ange en jobbannons');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGeneratedLetterId(null);

    try {
      // Call the API to generate a letter
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      
      // Get auth token from Supabase
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        throw new Error('Kunde inte hämta autentiseringstoken');
      }
      
      const token = sessionData?.session?.access_token || '';

      const response = await fetch(`${API_URL}/api/letters/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          cv: selectedCVContent,
          jobDescription,
          language: 'swedish',
          tonality
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ett fel uppstod vid generering av brev');
      }

      const result = await response.json();
      setCoverLetter(result.content);

      // Save ID for the generated letter if it exists
      if (result.id) {
        setGeneratedLetterId(result.id);

        // Try to extract company and job from the ad
        const companyMatch = jobDescription.match(/(?:företag|bolag|organisation):\s*([^\n.]+)/i);
        const jobMatch = jobDescription.match(/(?:tjänst|roll|position|jobb):\s*([^\n.]+)/i);

        if (companyMatch && companyMatch[1]) {
          setCompany(companyMatch[1].trim());
        }

        if (jobMatch && jobMatch[1]) {
          setJobTitle(jobMatch[1].trim());
          setLetterTitle(`Ansökan: ${jobMatch[1].trim()}`);
        }
      }

      toast.success('Brevet har genererats!');
    } catch (error) {
      console.error('Error generating letter:', error);
      setError(`Fel vid generering av brev: ${error.message || 'Okänt fel'}`);
      toast.error('Kunde inte generera brev');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save letter to Supabase
  const saveLetter = async () => {
    if (!coverLetter) {
      setError('Det finns inget brev att spara');
      return;
    }

    setIsSaving(true);

    try {
      // Create letter object
      const letterData = {
        user_id: user.id,
        content: coverLetter,
        title: letterTitle || 'Namnlöst brev',
        company: company || '',
        job_title: jobTitle || '',
        tonality: tonality,
        job_description: jobDescription,
        cv_path: selectedCVId ? 
          userCVs.find(cv => cv.id === selectedCVId)?.name : null,
        is_saved: true,
        created_at: new Date().toISOString()
      };

      // If we're updating an existing letter
      if (generatedLetterId) {
        const { error } = await supabase
          .from('letters')
          .update(letterData)
          .eq('id', generatedLetterId);

        if (error) throw error;
      } 
      // Create new letter
      else {
        const { data, error } = await supabase
          .from('letters')
          .insert(letterData)
          .select();

        if (error) throw error;
        
        // Update generatedLetterId if it's a new letter
        if (data && data.length > 0) {
          setGeneratedLetterId(data[0].id);
        }
      }

      toast.success('Brevet har sparats!');
      setShowSaveForm(false);
    } catch (error) {
      console.error('Error saving letter:', error);
      toast.error(`Kunde inte spara brevet: ${error.message || 'Okänt fel'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Copy letter to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(coverLetter);
    toast.success('Kopierat till urklipp!');
  };

  // Download letter as text file
  const downloadAsText = () => {
    const blob = new Blob([coverLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = letterTitle ? `${letterTitle}.txt` : 'ansokningsbrev.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Brevet har laddats ner!');
  };

  // If user is null, show a message instead
  if (!user) {
    return (
      <div className="text-center text-gray-400 py-6">
        <p>Du måste vara inloggad för att generera ett ansökningsbrev.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-xl overflow-hidden">
      <Toaster position="top-right" />

      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 mx-6 mt-6 rounded-lg flex items-start">
          <FiAlertCircle className="text-red-400 mt-0.5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 p-6">
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-medium flex items-center">
                <FiFileText className="mr-2 text-pink-500" /> Välj ditt CV
              </h3>
              <a
                href="/profile"
                className="text-sm text-indigo-400 hover:text-indigo-300"
              >
                Hantera dina CV:n
              </a>
            </div>
            
            {isLoading ? (
              <div className="flex items-center space-x-2 text-gray-400">
                <FiRefreshCw className="animate-spin" />
                <span>Laddar dina CV:n...</span>
              </div>
            ) : userCVs.length === 0 ? (
              <div className="bg-indigo-900/30 border border-indigo-800 text-indigo-200 px-4 py-3 rounded-lg">
                <p>Du har inga sparade CV:n ännu. Gå till din profil för att ladda upp ditt första CV.</p>
                <a
                  href="/profile"
                  className="inline-block mt-2 text-white bg-indigo-700 hover:bg-indigo-600 px-3 py-1 rounded-md text-sm"
                >
                  Gå till Profil
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                <select
                  value={selectedCVId}
                  onChange={handleCVChange}
                  className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-pink-500 focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 transition-all"
                >
                  <option value="">Välj ett CV</option>
                  {userCVs.map(cv => (
                    <option key={cv.id} value={cv.id}>
                      {cv.name.replace(/(_\d+)?\.[^.]+$/, '').replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
                
                {selectedCVContent && (
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 h-32 overflow-y-auto">
                    <div className="text-sm text-gray-300 whitespace-pre-line">
                      {selectedCVContent.slice(0, 500)}
                      {selectedCVContent.length > 500 && '...'}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-medium">Jobbannons</h3>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Klistra in jobbannonsen här..."
              className="w-full h-48 p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-pink-500 focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 transition-all"
            />
          </div>

          <div className="space-y-4">
            <TonalitySelector selectedTonality={tonality} onChange={setTonality} />
          </div>

          <button
            onClick={generateCoverLetter}
            disabled={isGenerating || !selectedCVContent || !jobDescription}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
              isGenerating || !selectedCVContent || !jobDescription
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-pink-500 hover:bg-pink-600 text-white'
            }`}
          >
            {isGenerating ? (
              <>
                <FiRefreshCw className="mr-2 animate-spin" /> Genererar...
              </>
            ) : (
              <>
                <FiEdit className="mr-2" /> Skapa ansökningsbrev
              </>
            )}
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-medium">Ditt ansökningsbrev</h3>
            {coverLetter && (
              <div className="flex space-x-2">
                <button
                  onClick={copyToClipboard}
                  className="bg-indigo-900 hover:bg-indigo-800 text-white p-2 rounded-lg transition-colors"
                  title="Kopiera"
                >
                  <FiCopy />
                </button>
                <button
                  onClick={downloadAsText}
                  className="bg-indigo-900 hover:bg-indigo-800 text-white p-2 rounded-lg transition-colors"
                  title="Ladda ner"
                >
                  <FiDownload />
                </button>
                <button
                  onClick={() => setShowSaveForm(!showSaveForm)}
                  className="bg-green-800 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
                  title="Spara"
                >
                  <FiSave />
                </button>
              </div>
            )}
          </div>

          {showSaveForm && coverLetter && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-gray-300">Spara ditt brev</h4>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Titel</label>
                <input
                  type="text"
                  value={letterTitle}
                  onChange={(e) => setLetterTitle(e.target.value)}
                  placeholder="Ge ditt brev ett namn..."
                  className="w-full p-2 rounded-md bg-gray-900 text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Företag</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Företagsnamn..."
                    className="w-full p-2 rounded-md bg-gray-900 text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Tjänst</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Tjänstetitel..."
                    className="w-full p-2 rounded-md bg-gray-900 text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                onClick={saveLetter}
                disabled={isSaving}
                className={`w-full py-2 px-4 rounded-md text-white font-medium flex items-center justify-center ${
                  isSaving ? 'bg-gray-700 cursor-not-allowed' : 'bg-green-700 hover:bg-green-600'
                }`}
              >
                {isSaving ? (
                  <>
                    <FiRefreshCw className="mr-2 animate-spin" /> Sparar...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2" /> Spara brev
                  </>
                )}
              </button>
            </div>
          )}

          <div
            className={`bg-gray-800 border border-gray-700 rounded-lg p-4 overflow-y-auto ${
              showSaveForm ? 'h-[20rem]' : 'h-[29rem]'
            }`}
          >
            {coverLetter ? (
              <div className="whitespace-pre-line text-gray-200">
                {coverLetter}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center mb-4">
                  <FiFileText className="w-6 h-6" />
                </div>
                <p className="text-center">
                  Ditt ansökningsbrev kommer att visas här efter generering
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleCoverLetterGenerator;