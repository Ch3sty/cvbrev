'use client';

import { useState, useEffect } from 'react';
import { Upload, FileText, Trash2, Eye, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';

interface Document {
  id: string;
  title: string;
  topic: string | null;
  source_url: string | null;
  storage_path: string | null;
  published_at: string | null;
  is_public: boolean;
  word_count: number | null;
  created_at: string;
}

interface IngestStatus {
  documentId: string;
  status: 'uploading' | 'processing' | 'success' | 'error';
  message?: string;
  chunksProcessed?: number;
}

export default function AIDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadStatus, setUploadStatus] = useState<IngestStatus | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    sourceUrl: '',
    publishedAt: '',
    isPublic: true,
    fileContent: '',
  });

  const supabase = getSupabaseClient();

  useEffect(() => {
    loadDocuments();
  }, []);

  async function loadDocuments() {
    try {
      const { data, error } = await supabase
        .from('ai_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.title || !formData.fileContent) {
      alert('Titel och innehåll krävs');
      return;
    }

    setUploadStatus({
      documentId: '',
      status: 'processing',
      message: 'Processar dokument...',
    });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Inte inloggad');

      // Call ingest edge function
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ingest-document`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            fileContent: formData.fileContent,
            title: formData.title,
            topic: formData.topic || null,
            sourceUrl: formData.sourceUrl || null,
            publishedAt: formData.publishedAt || null,
            isPublic: formData.isPublic,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Ingest misslyckades');
      }

      setUploadStatus({
        documentId: result.documentId,
        status: 'success',
        message: `Dokument processat! ${result.chunksSuccess} chunks skapade.`,
        chunksProcessed: result.chunksSuccess,
      });

      // Reset form
      setFormData({
        title: '',
        topic: '',
        sourceUrl: '',
        publishedAt: '',
        isPublic: true,
        fileContent: '',
      });

      // Reload documents
      loadDocuments();

      // Hide form after 3 seconds
      setTimeout(() => {
        setShowUploadForm(false);
        setUploadStatus(null);
      }, 3000);

    } catch (error: any) {
      console.error('Ingest error:', error);
      setUploadStatus({
        documentId: '',
        status: 'error',
        message: error.message || 'Ett fel uppstod',
      });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Är du säker på att du vill radera detta dokument och alla dess chunks?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('ai_documents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDocuments(documents.filter(d => d.id !== id));
    } catch (error) {
      console.error('Delete error:', error);
      alert('Kunde inte radera dokumentet');
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Dokument</h1>
            <p className="text-gray-600 mt-1">
              Hantera kunskapsdokument för AI-chatten
            </p>
          </div>
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 flex items-center gap-2 transition-colors"
          >
            <Upload className="w-5 h-5" />
            Ladda upp dokument
          </button>
        </div>

        {/* Upload Form */}
        {showUploadForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Nytt dokument</h2>

            {uploadStatus && (
              <div
                className={`mb-4 p-4 rounded-lg flex items-start gap-3 ${
                  uploadStatus.status === 'success'
                    ? 'bg-green-50 text-green-800'
                    : uploadStatus.status === 'error'
                    ? 'bg-red-50 text-red-800'
                    : 'bg-blue-50 text-blue-800'
                }`}
              >
                {uploadStatus.status === 'processing' && (
                  <Loader2 className="w-5 h-5 animate-spin flex-shrink-0 mt-0.5" />
                )}
                {uploadStatus.status === 'success' && (
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                )}
                {uploadStatus.status === 'error' && (
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-medium">{uploadStatus.message}</p>
                  {uploadStatus.chunksProcessed && (
                    <p className="text-sm mt-1">
                      {uploadStatus.chunksProcessed} text-chunks skapade med embeddings
                    </p>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titel *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="T.ex. Guide till den svenska arbetsmarknaden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ämne
                  </label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="T.ex. arbetsmarknad, CV-tips, intervju"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Käll-URL
                  </label>
                  <input
                    type="url"
                    value={formData.sourceUrl}
                    onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Publiceringsdatum
                  </label>
                  <input
                    type="date"
                    value={formData.publishedAt}
                    onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                />
                <label htmlFor="isPublic" className="text-sm text-gray-700">
                  Publikt dokument (tillgängligt för alla användare)
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Innehåll *
                </label>
                <textarea
                  value={formData.fileContent}
                  onChange={(e) => setFormData({ ...formData, fileContent: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent font-mono text-sm"
                  rows={12}
                  placeholder="Klistra in textinnehållet från ditt dokument här..."
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Klistra in text direkt eller konvertera din PDF till text först. Stöder Markdown-formatering.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={uploadStatus?.status === 'processing'}
                  className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {uploadStatus?.status === 'processing' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processar...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Ladda upp och processa
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadForm(false);
                    setUploadStatus(null);
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Avbryt
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Documents List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Dokument ({documents.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              Laddar dokument...
            </div>
          ) : documents.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>Inga dokument ännu</p>
              <p className="text-sm mt-1">Klicka på "Ladda upp dokument" för att komma igång</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {documents.map((doc) => (
                <div key={doc.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {doc.title}
                        </h3>
                        {doc.is_public && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                            Publik
                          </span>
                        )}
                        {doc.topic && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                            {doc.topic}
                          </span>
                        )}
                      </div>

                      <div className="text-sm text-gray-600 space-y-1">
                        {doc.source_url && (
                          <p>
                            <span className="font-medium">Källa:</span>{' '}
                            <a
                              href={doc.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-pink-600 hover:underline"
                            >
                              {doc.source_url}
                            </a>
                          </p>
                        )}
                        {doc.published_at && (
                          <p>
                            <span className="font-medium">Publicerad:</span>{' '}
                            {new Date(doc.published_at).toLocaleDateString('sv-SE')}
                          </p>
                        )}
                        {doc.word_count && (
                          <p>
                            <span className="font-medium">Antal ord:</span> {doc.word_count.toLocaleString()}
                          </p>
                        )}
                        <p className="text-gray-500">
                          Skapad: {new Date(doc.created_at).toLocaleDateString('sv-SE')} {new Date(doc.created_at).toLocaleTimeString('sv-SE')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Radera dokument"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
