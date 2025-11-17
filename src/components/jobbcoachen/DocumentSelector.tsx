'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X, ChevronDown, CheckCircle } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';

interface Document {
  id: string;
  file_name: string;
  cv_text: string;
  created_at: string;
  type: 'cv' | 'letter';
}

interface DocumentSelectorProps {
  onSelect: (doc: Document) => void;
  onClose: () => void;
  selectedDocs: Document[];
}

export default function DocumentSelector({ onSelect, onClose, selectedDocs }: DocumentSelectorProps) {
  const [cvs, setCvs] = useState<Document[]>([]);
  const [letters, setLetters] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'cv' | 'letter'>('cv');
  const supabase = getSupabaseClient();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load CVs
      const { data: cvData } = await supabase
        .from('cv_texts')
        .select('id, file_name, cv_text, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Load Letters (only saved ones, not previews)
      const { data: letterData } = await supabase
        .from('letters')
        .select('id, job_title, content, created_at')
        .eq('user_id', user.id)
        .eq('is_saved', true)
        .order('created_at', { ascending: false });

      setCvs((cvData || []).map(cv => ({ ...cv, type: 'cv' as const })));
      setLetters((letterData || []).map(letter => ({
        id: letter.id,
        file_name: letter.job_title || 'Utan titel',
        cv_text: letter.content,
        created_at: letter.created_at,
        type: 'letter' as const
      })));
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isSelected = (doc: Document) => {
    return selectedDocs.some(d => d.id === doc.id && d.type === doc.type);
  };

  const handleSelect = (doc: Document) => {
    onSelect(doc);
  };

  const documents = activeTab === 'cv' ? cvs : letters;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            Välj dokument att dela
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Stäng"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('cv')}
            className={`flex-1 px-6 py-3 font-semibold transition-colors relative ${
              activeTab === 'cv'
                ? 'text-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            CV ({cvs.length})
            {activeTab === 'cv' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('letter')}
            className={`flex-1 px-6 py-3 font-semibold transition-colors relative ${
              activeTab === 'letter'
                ? 'text-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Personliga brev ({letters.length})
            {activeTab === 'letter' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
              />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[50vh] p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-slate-500">Laddar dokument...</div>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 mb-2">
                {activeTab === 'cv' ? 'Inga CV sparade' : 'Inga personliga brev sparade'}
              </p>
              <p className="text-sm text-slate-500">
                {activeTab === 'cv'
                  ? 'Skapa eller ladda upp ett CV först'
                  : 'Skapa ett personligt brev först'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <motion.button
                  key={doc.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleSelect(doc)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected(doc)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-300 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <FileText className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      isSelected(doc) ? 'text-blue-600' : 'text-slate-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`font-medium truncate ${
                          isSelected(doc) ? 'text-blue-900' : 'text-slate-900'
                        }`}>
                          {doc.file_name}
                        </p>
                        {isSelected(doc) && (
                          <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(doc.created_at).toLocaleDateString('sv-SE')}
                      </p>
                      <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                        {doc.cv_text.substring(0, 120)}...
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-4 bg-slate-50">
          <p className="text-xs text-slate-600 text-center">
            Välj dokument att dela med Jobbcoachen för personlig feedback
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
