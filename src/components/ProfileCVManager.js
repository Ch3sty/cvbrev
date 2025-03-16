"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  FiUpload,
  FiFile,
  FiTrash,
  FiEdit,
  FiSave,
  FiX,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiDownload
} from 'react-icons/fi';
import { toast, Toaster } from 'react-hot-toast';

const ProfileCVManager = () => {
  const { user } = useAuth();
  
  // State för uppladdade CV:n
  const [cvs, setCVs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filstatus
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [newCVTitle, setNewCVTitle] = useState('');
  
  // Redigeringsstatus
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  // Hämta användarens CV:n vid komponentmontering
  useEffect(() => {
    if (user) {
      fetchUserCVs();
    }
  }, [user]);

  // Rensa meddelanden när användaren gör ändringar
  useEffect(() => {
    if (error) setError('');
    if (success) setSuccess('');
  }, [file, newCVTitle]);

  const fetchUserCVs = async () => {
    try {
      setLoading(true);
      
      // Lista alla filer i användarens CV-mapp
      const { data, error } = await supabase
        .storage
        .from('cvs')
        .list(`${user.id}`, {
          sortBy: { column: 'updated_at', order: 'desc' }
        });
        
      if (error) throw error;
      
      setCVs(data || []);
    } catch (error) {
      console.error('Error fetching CVs:', error);
      setError('Kunde inte hämta dina CV:n från storage');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFileName(selectedFile.name);
    setUploading(true);
    setError('');
    setSuccess('');
    setFile(selectedFile);

    // Verifiera filtyp
    const fileType = selectedFile.name.split('.').pop().toLowerCase();
    if (fileType !== 'docx' && fileType !== 'pdf' && fileType !== 'txt') {
      setError('Endast .txt, .docx och .pdf-filer stöds');
      setUploading(false);
      return;
    }

    try {
      // Föreslå en titel baserad på filnamnet
      const fileNameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
      setNewCVTitle(fileNameWithoutExt);
      
      toast.success('Fil vald. Klicka på Spara CV för att ladda upp');
    } catch (error) {
      console.error('Fel vid filval:', error);
      setError(`Filval misslyckades: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const saveNewCV = async () => {
    if (!file) {
      setError('Ingen fil har valts');
      return;
    }

    if (!newCVTitle.trim()) {
      setError('Du måste ange en titel för ditt CV');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setSuccess('');
      
      // Skapa en unik filväg i användarens mapp
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${newCVTitle.replace(/\s+/g, '_')}_${timestamp}.${fileExt}`;
      
      // Ladda upp fil till Supabase Storage
      const { error: uploadError } = await supabase
        .storage
        .from('cvs')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) throw uploadError;
      
      // Reset formulär
      setFile(null);
      setFileName('');
      setNewCVTitle('');
      
      // Uppdatera CV-listan
      await fetchUserCVs();
      
      setSuccess('Ditt CV har laddats upp!');
      toast.success('CV har sparats');
    } catch (error) {
      console.error('Error saving CV:', error);
      setError(`Kunde inte spara CV: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const startEditing = (cv) => {
    setEditingId(cv.id);
    // Extrahera filnamn utan sökväg för visning
    const nameWithoutPath = cv.name.split('/').pop() || cv.name;
    // Ta bort tidsstämpel och filändelse om de finns
    const cleanName = nameWithoutPath.replace(/(_\d+)?\.[^.]+$/, '').replace(/_/g, ' ');
    setEditTitle(cleanName || 'Namnlöst CV');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const saveEditing = async (cv) => {
    if (!editTitle.trim()) {
      setError('CV-titel saknas');
      return;
    }

    try {
      setUploading(true);
      setError('');
      
      // Eftersom vi inte kan byta namn på filer i Supabase storage direkt,
      // måste vi ladda ner filen, ladda upp med nytt namn, sedan ta bort den gamla
      
      // 1. Hämta fildata från storage
      const { data: fileData, error: downloadError } = await supabase
        .storage
        .from('cvs')
        .download(`${user.id}/${cv.name}`);
        
      if (downloadError) throw downloadError;
      
      // 2. Skapa ett nytt filobjekt med nedladdad data
      const fileExt = cv.name.split('.').pop();
      const timestamp = new Date().getTime();
      const newFileName = `${editTitle.replace(/\s+/g, '_')}_${timestamp}.${fileExt}`;
      const newFilePath = `${user.id}/${newFileName}`;
      
      const newFile = new File([fileData], newFileName, { 
        type: `application/${fileExt}` 
      });
      
      // 3. Ladda upp med nytt namn
      const { error: uploadError } = await supabase
        .storage
        .from('cvs')
        .upload(newFilePath, newFile, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) throw uploadError;
      
      // 4. Ta bort gammal fil
      const { error: deleteError } = await supabase
        .storage
        .from('cvs')
        .remove([`${user.id}/${cv.name}`]);
        
      if (deleteError) {
        console.error('Warning: Old file not deleted', deleteError);
        // Fortsätt ändå, inget behov av att kasta fel
      }
      
      // Uppdatera CV-listan
      await fetchUserCVs();
      
      setEditingId(null);
      toast.success('CV har uppdaterats');
    } catch (error) {
      console.error('Error updating CV:', error);
      setError(`Kunde inte uppdatera CV: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const deleteCV = async (cv) => {
    if (!confirm('Är du säker på att du vill radera detta CV?')) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Ta bort filen från storage
      const { error } = await supabase
        .storage
        .from('cvs')
        .remove([`${user.id}/${cv.name}`]);
        
      if (error) throw error;
      
      // Uppdatera lokalt tillstånd
      setCVs(cvs.filter(c => c.id !== cv.id));
      toast.success('CV har raderats');
    } catch (error) {
      console.error('Error deleting CV:', error);
      setError(`Kunde inte radera CV: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Ladda ner CV-fil
  const downloadCV = async (cv) => {
    try {
      setLoading(true);
      
      // Hämta nedladdnings-URL
      const { data, error } = await supabase
        .storage
        .from('cvs')
        .download(`${user.id}/${cv.name}`);
        
      if (error) throw error;
      
      // Skapa nedladdningslänk
      const blob = new Blob([data], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = cv.name.split('/').pop() || cv.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('CV har laddats ner');
    } catch (error) {
      console.error('Error downloading CV:', error);
      setError(`Kunde inte ladda ner CV: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Om användaren är null, visa ett meddelande istället
  if (!user) {
    return (
      <div className="text-center text-gray-400 py-6">
        <p>Du måste vara inloggad för att hantera dina CV:n.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-xl overflow-hidden">
      <Toaster position="top-right" />
      
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Hantera dina CV:n</h2>
        
        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 mb-6 rounded-lg flex items-start">
            <FiAlertCircle className="text-red-400 mt-0.5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="bg-green-900/30 border border-green-800 text-green-200 px-4 py-3 mb-6 rounded-lg flex items-start">
            <FiCheckCircle className="text-green-400 mt-0.5 mr-2 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}
        
        {/* Ladda upp nytt CV-avsnitt */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
          <h3 className="text-xl font-medium mb-4">Lägg till nytt CV</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Titel</label>
              <input
                type="text"
                value={newCVTitle}
                onChange={(e) => setNewCVTitle(e.target.value)}
                placeholder="Ge ditt CV ett namn..."
                className="w-full p-3 rounded-lg bg-gray-900 text-white border border-gray-700 focus:border-pink-500 focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50"
              />
            </div>
            
            <div>
              <label className="flex justify-between">
                <span className="block text-sm text-gray-400 mb-1">CV-innehåll</span>
                <label className="text-sm text-indigo-400 hover:text-indigo-300 cursor-pointer">
                  <FiUpload className="inline mr-1" /> Ladda upp fil
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    accept=".txt,.doc,.docx,.pdf"
                  />
                </label>
              </label>
              
              <div className="flex items-center justify-center h-48 p-3 rounded-lg bg-gray-900 text-white border border-gray-700 focus:border-pink-500">
                {fileName ? (
                  <div className="text-center">
                    <FiFile className="mx-auto text-4xl text-indigo-400 mb-2" />
                    <p className="text-gray-300">{fileName}</p>
                    <p className="text-xs text-gray-500 mt-2">Klicka på "Spara CV" för att ladda upp</p>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <FiUpload className="mx-auto text-4xl mb-2" />
                    <p>Välj en fil att ladda upp</p>
                    <p className="text-xs mt-1">Endast .docx, .pdf och .txt stöds</p>
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={saveNewCV}
              disabled={uploading || !file}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
                uploading || !file
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-pink-500 hover:bg-pink-600 text-white'
              }`}
            >
              {uploading ? (
                <>
                  <FiRefreshCw className="mr-2 animate-spin" /> Sparar...
                </>
              ) : (
                <>
                  <FiSave className="mr-2" /> Spara CV
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Lista med CV:n */}
        <div>
          <h3 className="text-xl font-medium mb-4">Dina sparade CV:n</h3>
          
          {loading ? (
            <div className="py-8 text-center text-gray-400">
              <FiRefreshCw className="inline-block animate-spin mr-2" />
              Laddar...
            </div>
          ) : cvs.length === 0 ? (
            <div className="py-8 text-center text-gray-400 border border-gray-800 rounded-lg">
              <p>Du har inga sparade CV:n ännu.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cvs.map(cv => (
                <div key={cv.id} className="border border-gray-700 rounded-lg overflow-hidden">
                  {editingId === cv.id ? (
                    <div className="p-4 bg-gray-800">
                      <div className="mb-4">
                        <label className="block text-sm text-gray-400 mb-1">Titel</label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full p-2 rounded-md bg-gray-900 text-white border border-gray-700 focus:border-pink-500"
                        />
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => saveEditing(cv)}
                          disabled={uploading}
                          className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-md flex items-center"
                        >
                          {uploading ? (
                            <FiRefreshCw className="mr-1 animate-spin" />
                          ) : (
                            <FiSave className="mr-1" />
                          )}
                          Spara
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md flex items-center"
                        >
                          <FiX className="mr-1" /> Avbryt
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center border-b border-gray-700 bg-gray-800 p-3">
                        <h4 className="font-medium">
                          {cv.name.split('/').pop().replace(/(_\d+)?\.[^.]+$/, '').replace(/_/g, ' ')}
                        </h4>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => downloadCV(cv)}
                            className="p-1.5 text-gray-400 hover:text-white"
                            title="Ladda ner"
                          >
                            <FiDownload />
                          </button>
                          <button
                            onClick={() => startEditing(cv)}
                            className="p-1.5 text-gray-400 hover:text-white"
                            title="Redigera"
                          >
                            <FiEdit />
                          </button>
                          <button
                            onClick={() => deleteCV(cv)}
                            className="p-1.5 text-gray-400 hover:text-red-400"
                            title="Radera"
                          >
                            <FiTrash />
                          </button>
                        </div>
                      </div>
                      <div className="p-3 bg-gray-900">
                        <div className="text-gray-400 text-sm mb-1">
                          Senast uppdaterat: {new Date(cv.created_at || cv.updated_at || new Date()).toLocaleDateString()}
                        </div>
                        <div className="bg-gray-800 border border-gray-700 rounded p-3 flex items-center">
                          <FiFile className="text-indigo-400 mr-3 text-xl" />
                          <div>
                            <div className="text-sm text-gray-300">
                              {cv.name.split('/').pop()}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {cv.metadata?.size 
                                ? `${Math.round(cv.metadata.size / 1024)} KB` 
                                : 'Storlek okänd'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCVManager;