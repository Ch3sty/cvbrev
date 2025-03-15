'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '@/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CVUploadProps {
  savedCV?: {
    name: string;
    last_updated?: string;
  } | null;
  onUpload?: (file: File) => Promise<void>;
  onDownload?: () => Promise<void>;
}

export default function CVUpload({ savedCV, onUpload, onDownload }: CVUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentCV, setCurrentCV] = useState<CVUploadProps['savedCV']>(savedCV);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { user } = useAuth();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) return;
    
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('Filen är för stor. Max 5MB är tillåtet.');
      return;
    }
    
    const allowedTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
      'text/plain'
    ];
    
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Endast PDF, DOCX och TXT-filer är tillåtna.');
      return;
    }
    
    setFile(selectedFile);
    toast.success('Fil vald: ' + selectedFile.name);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Välj en fil först');
      return;
    }

    if (!user) {
      toast.error('Du måste vara inloggad för att ladda upp CV');
      return;
    }
    
    setLoading(true);
    setUploadProgress(10); // Start progress
    
    try {
      console.log('Laddar upp fil:', file.name, file.type, file.size);
      
      if (onUpload) {
        // Use the provided onUpload function if available
        await onUpload(file);
      } else {
        // Default implementation using Supabase
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/cv.${fileExt}`;
        
        console.log('Laddar upp till Supabase:', fileName);
        setUploadProgress(30);
        
        // Upload to Supabase Storage
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('cvs')
          .upload(fileName, file, { 
            upsert: true,
            contentType: file.type 
          });
  
        if (uploadError) {
          console.error('Error uploading CV:', uploadError);
          throw new Error('Kunde inte ladda upp filen: ' + uploadError.message);
        }
        
        console.log('Uppladdning klar, updaterar profil', uploadData);
        setUploadProgress(70);
  
        // Update profile with CV information
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            cv: {
              name: file.name,
              last_updated: new Date().toISOString()
            },
            updated_at: new Date().toISOString()
          });
  
        if (profileError) {
          console.error('Error updating profile with CV info:', profileError);
          throw new Error('Kunde inte uppdatera profilinformation: ' + profileError.message);
        }
        
        setUploadProgress(100);
        console.log('Profiluppdatering klar');
      }
      
      setCurrentCV({
        name: file.name,
        last_updated: new Date().toISOString(),
      });
      
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      toast.success('CV uppladdad!');
    } catch (error) {
      console.error('Error uploading CV:', error);
      if (error instanceof Error) {
        toast.error(error.message || 'Något gick fel vid uppladdningen. Försök igen senare.');
      } else {
        toast.error('Något gick fel vid uppladdningen. Försök igen senare.');
      }
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };
  
  const handleDownloadCV = async () => {
    if (!currentCV) {
      toast.error('Du har inget CV att ladda ner');
      return;
    }

    if (!user) {
      toast.error('Du måste vara inloggad för att ladda ner CV');
      return;
    }
    
    try {
      if (onDownload) {
        // Use the provided onDownload function if available
        await onDownload();
      } else {
        // Default implementation using Supabase
        const loadingToast = toast.loading('Laddar ner CV...');
        
        const fileExt = currentCV.name.split('.').pop();
        const fileName = `${user.id}/cv.${fileExt}`;
        
        console.log('Laddar ner från Supabase:', fileName);
        
        // Get download URL from Supabase Storage
        const { data, error } = await supabase.storage
          .from('cvs')
          .download(fileName);
        
        if (error) {
          console.error('Error downloading CV:', error);
          toast.dismiss(loadingToast);
          toast.error('Kunde inte ladda ner CV: ' + error.message);
          return;
        }
        
        // Create download link
        const url = window.URL.createObjectURL(data);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = currentCV.name;
        
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.dismiss(loadingToast);
        toast.success('CV nedladdat!');
      }
    } catch (error) {
      console.error('Error downloading CV:', error);
      toast.error('Kunde inte ladda ner CV. Försök igen senare.');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      {currentCV && (
        <div className="bg-gray-700 p-4 rounded-md">
          <h3 className="font-medium text-white">Nuvarande CV</h3>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center">
              <svg 
                className="h-8 w-8 text-gray-400" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{currentCV.name}</p>
                <p className="text-xs text-gray-400">
                  Senast uppdaterad: {formatDate(currentCV.last_updated)}
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadCV}
              className="text-blue-400 hover:text-blue-300"
            >
              <svg 
                className="h-5 w-5" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="border-2 border-dashed border-gray-600 rounded-md px-6 py-8 text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFileChange}
          className="hidden"
          id="cv-file-input"
        />
        
        <label htmlFor="cv-file-input" className="cursor-pointer">
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path 
              d="M28 8H12a4 4 0 00-4 4v24a4 4 0 004 4h24a4 4 0 004-4V20m-12-4l8-8m0 0v8m0-8h-8" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </svg>
          
          <p className="mt-1 text-sm text-gray-400">
            <span className="font-medium text-blue-500 hover:text-blue-400">
              Klicka för att ladda upp
            </span>{' '}
            eller dra och släpp
          </p>
          <p className="mt-1 text-xs text-gray-500">
            PDF, DOCX eller TXT (max 5MB)
          </p>
        </label>

        {file && (
          <div className="mt-4 text-center">
            <span className="text-sm text-gray-400">
              Vald fil: <span className="font-medium text-white">{file.name}</span>
            </span>
          </div>
        )}
      </div>

      {uploadProgress > 0 && (
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
            style={{width: `${uploadProgress}%`}} 
          />
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className={`w-full py-2 px-4 rounded-md text-white font-medium ${
          !file || loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? 'Laddar upp...' : 'Ladda upp CV'}
      </button>
    </div>
  );
}