'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { toast } from 'react-hot-toast';
import api from '@/api';

interface CVUploadProps {
  savedCV?: {
    name: string;
    lastUpdated?: string;
  } | null;
}

export default function CVUpload({ savedCV }: CVUploadProps) { // 🔥 Tog bort userId eftersom den inte används
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentCV, setCurrentCV] = useState<CVUploadProps['savedCV']>(savedCV);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) return;
    
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('Filen är för stor. Max 5MB är tillåtet.');
      return;
    }
    
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Endast PDF, DOCX och TXT-filer är tillåtna.');
      return;
    }
    
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Välj en fil först');
      return;
    }
    
    setLoading(true);
    
    try {
      // 🔥 Tog bort 'response' eftersom den inte används
      await api.user.uploadCV(file);
      
      setCurrentCV({
        name: file.name,
        lastUpdated: new Date().toISOString(),
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
    }
  };
  
  const handleDownloadCV = async () => {
    if (!currentCV) {
      toast.error('Du har inget CV att ladda ner');
      return;
    }
    
    try {
      const loadingToast = toast.loading('Laddar ner CV...');
      
      const { blob, filename } = await api.user.getCV();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.dismiss(loadingToast);
      toast.success('CV nedladdat!');
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
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
          <h3 className="font-medium text-gray-800 dark:text-gray-200">Nuvarande CV</h3>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center">
              <svg 
                className="h-8 w-8 text-gray-500 dark:text-gray-400" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm font-medium">{currentCV.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Senast uppdaterad: {formatDate(currentCV.lastUpdated)}
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadCV}
              className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
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

      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md px-6 py-8 text-center">
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
          
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-blue-500 hover:text-blue-400">
              Klicka för att ladda upp
            </span>{' '}
            eller dra och släpp
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
            PDF, DOCX eller TXT (max 5MB)
          </p>
        </label>

        {file && (
          <div className="mt-4 text-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Vald fil: <span className="font-medium">{file.name}</span>
            </span>
          </div>
        )}
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className={`w-full py-2 px-4 rounded-md text-white font-medium ${
          !file || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {loading ? 'Laddar upp...' : 'Ladda upp CV'}
      </button>
    </div>
  );
}