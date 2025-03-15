"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  FiDownload,
  FiCopy,
  FiFileText,
  FiUpload,
  FiRefreshCw,
  FiEdit,
  FiAlertCircle,
  FiSave
} from 'react-icons/fi';
import TonalitySelector from './TonalitySelector';
import { toast, Toaster } from 'react-hot-toast';

const CoverLetterGenerator = () => {
  // Use AuthContext instead of Firebase auth
  const { user, userProfile } = useAuth();
  
  const [cv, setCv] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [fileLoading, setFileLoading] = useState(false);
  const [tonality, setTonality] = useState('professional');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [letterTitle, setLetterTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [generatedLetterId, setGeneratedLetterId] = useState(null);

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
  }, [cv, jobDescription, error]);

  // If user is null, show a message instead
  if (!user) {
    return (
      <div className="text-center text-gray-400 py-6">
        <p>Du måste vara inloggad för att generera ett ansökningsbrev.</p>
      </div>
    );
  }

  const handleFileUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setFileName(file.name);
  setFileLoading(true);
  setError('');

  // Verify file type
  const fileType = file.name.split('.').pop().toLowerCase();
  if (fileType !== 'docx' && fileType !== 'pdf' && fileType !== 'txt') {
    setError('Endast .txt, .docx och .pdf-filer stöds');
    setFileLoading(false);
    return;
  }

  try {
    // For .txt files, we can read directly in the browser
    if (fileType === 'txt') {
      handleTextFile(file);
      return;
    }

    // For .docx and .pdf, use backend API
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', file);

    // Get auth token from Supabase
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('Auth session error:', sessionError);
      throw new Error('Kunde inte hämta autentiseringstoken');
    }
    
    const token = sessionData?.session?.access_token || '';
    if (!token) {
      console.error('No authentication token available');
      throw new Error('Ingen autentiseringstoken tillgänglig. Försök logga in igen.');
    }

    console.log(`Laddar upp fil: ${file.name} (${file.size} bytes) till ${API_URL}/files/extract-text`);

    // Send file to backend with explicit timeout and logging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const response = await fetch(`${API_URL}/files/extract-text`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries([...response.headers]));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || `Serverfel: ${response.status}`);
        } catch (e) {
          throw new Error(`Serverfel: ${response.status}. ${errorText.substring(0, 100)}`);
        }
      }

      const data = await response.json();
      console.log('Server response data:', data);

      // Set extracted text as CV
      setCv(data.text);
      console.log(`Extraherad text från ${file.name}: ${data.text.length} tecken`);
      toast.success('CV har laddats upp och texten har extraherats');
    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        console.error('Request timed out after 30 seconds');
        throw new Error('Uppladdningen tog för lång tid. Försök igen med en mindre fil.');
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Fel vid filuppladdning:', error);
    setError(`Filuppladdning misslyckades: ${error.message}`);
    toast.error(`Filuppladdning misslyckades: ${error.message}`);
  } finally {
    setFileLoading(false);
  }
};

  const handleTextFile = (file) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const fileContent = event.target.result;
        if (typeof fileContent === 'string' && fileContent.trim()) {
          setCv(fileContent);
          setFileLoading(false);
        } else {
          setError('Kunde inte läsa filinnehållet som text');
          setFileLoading(false);
        }
      } catch (err) {
        console.error('Error parsing text file:', err);
        setError('Ett fel uppstod vid inläsning av filen');
        setFileLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Kunde inte läsa filen');
      setFileLoading(false);
    };

    reader.readAsText(file);
  };

  const generateCoverLetter = async () => {
    if (!cv || !jobDescription) {
      setError('Vänligen ladda upp ditt CV och ange en jobbannons');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGeneratedLetterId(null);

    try {
      // Log what we're sending to the API
      console.log('Skickar CV längd:', cv.length);
      console.log('Skickar jobbannons längd:', jobDescription.length);
      console.log('Vald tonalitet:', tonality);

      // Call the API to generate a letter
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      
      // Get auth token from Supabase
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        throw new Error('Kunde inte hämta autentiseringstoken');
      }
      
      const token = sessionData?.session?.access_token || '';

      const response = await fetch(`${API_URL}/letters/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          cv,
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
        cv_text: cv,
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(coverLetter);
    toast.success('Kopierat till urklipp!');
  };

  const downloadAsDocx = () => {
    // This would actually convert to DOCX with a real DOCX generator
    // For now we use simple text
    const blob = new Blob([coverLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ansokningsbrev.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Brevet har laddats ner!');
  };

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
                <FiFileText className="mr-2 text-pink-500" /> Ditt CV
              </h3>
              <label
                className={`bg-indigo-900 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center ${
                  fileLoading ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                {fileLoading ? (
                  <>
                    <FiRefreshCw className="mr-2 animate-spin" /> Läser in...
                  </>
                ) : (
                  <>
                    <FiUpload className="mr-2" /> Ladda upp
                  </>
                )}
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={fileLoading}
                  accept=".txt,.doc,.docx,.pdf"
                />
              </label>
            </div>
            {fileName && (
              <div className="text-sm text-gray-400 bg-gray-800 px-3 py-2 rounded-md">
                {fileName}
              </div>
            )}
            <textarea
              value={cv}
              onChange={(e) => setCv(e.target.value)}
              placeholder="Klistra in ditt CV här eller ladda upp en fil..."
              className="w-full h-48 p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-pink-500 focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 transition-all"
            />
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
            disabled={isGenerating || !cv || !jobDescription}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
              isGenerating || !cv || !jobDescription
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
                  onClick={downloadAsDocx}
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

export default CoverLetterGenerator;