'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X, CheckCircle } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import { extractEditableContent } from '@/lib/letters/extract-editable-content';

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

  if (typeof document === 'undefined') return null;

  return createPortal(
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
        className="bg-white rounded-3xl border border-orange-200/50 shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-orange-100">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600 mb-0.5">
              Dela dokument
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Välj vad du vill fråga om
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-orange-50 rounded-lg transition-colors"
            aria-label="Stäng"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-orange-100">
          <button
            onClick={() => setActiveTab('cv')}
            className={`flex-1 px-6 py-3 font-bold transition-colors relative ${
              activeTab === 'cv'
                ? 'text-orange-700'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            CV ({cvs.length})
            {activeTab === 'cv' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ background: 'linear-gradient(90deg, #F97316, #DC2626)' }}
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('letter')}
            className={`flex-1 px-6 py-3 font-bold transition-colors relative ${
              activeTab === 'letter'
                ? 'text-orange-700'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Personliga brev ({letters.length})
            {activeTab === 'letter' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ background: 'linear-gradient(90deg, #F97316, #DC2626)' }}
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
              {documents.map((doc) => {
                const selected = isSelected(doc);
                return (
                  <motion.button
                    key={doc.id}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleSelect(doc)}
                    className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                      selected
                        ? 'border-emerald-500 bg-emerald-50/40'
                        : 'border-slate-200 hover:border-orange-300 bg-white'
                    }`}
                    style={
                      selected
                        ? {
                            boxShadow:
                              '0 0 0 4px rgba(16, 185, 129, 0.12), 0 8px 20px -8px rgba(16, 185, 129, 0.25)',
                          }
                        : undefined
                    }
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white"
                        style={
                          selected
                            ? {
                                background:
                                  'linear-gradient(135deg, #10B981, #059669)',
                              }
                            : {
                                background:
                                  'linear-gradient(135deg, #F97316, #DC2626)',
                              }
                        }
                      >
                        <FileText className="w-4 h-4" strokeWidth={2.25} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-bold text-slate-900 truncate">
                            {doc.file_name}
                          </p>
                          {selected && (
                            <CheckCircle
                              className="w-5 h-5 text-emerald-600 flex-shrink-0"
                              strokeWidth={2.5}
                            />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {new Date(doc.created_at).toLocaleDateString('sv-SE')}
                        </p>
                        <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                          {extractEditableContent(doc.cv_text).substring(0, 120)}...
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-orange-100 p-4 bg-orange-50/40 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-600 hidden sm:block">
            Vi läser dokumenten och svarar utifrån just din situation.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-white text-sm transition-all min-h-[40px] shadow-md w-full sm:w-auto"
            style={{
              background:
                selectedDocs.length > 0
                  ? 'linear-gradient(135deg, #F97316, #DC2626)'
                  : '#94A3B8',
            }}
          >
            {selectedDocs.length > 0
              ? `Klart (${selectedDocs.length} valda)`
              : 'Stäng'}
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
