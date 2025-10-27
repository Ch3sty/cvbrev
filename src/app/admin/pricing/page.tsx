'use client';

import { useState, useEffect } from 'react';
import { DollarSign, RefreshCw, Database, Calendar, TrendingUp, AlertCircle } from 'lucide-react';

interface ModelPricing {
  id: string;
  model_name: string;
  provider: string;
  input_cost_per_million: number;
  output_cost_per_million: number;
  cached_input_cost_per_million: number | null;
  last_updated: string;
  source: string;
  metadata: Record<string, any>;
}

interface SyncStatus {
  lastSyncedAt: string | null;
  lastSyncedModel: string | null;
  modelCounts: {
    litellm: number;
    manual: number;
    total: number;
  };
  syncSource: string;
}

export default function AdminPricingPage() {
  const [pricing, setPricing] = useState<ModelPricing[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchPricing = async () => {
    try {
      const response = await fetch('/api/admin/pricing');
      if (!response.ok) throw new Error('Failed to fetch pricing');

      const data = await response.json();
      setPricing(data.data || []);
    } catch (err: any) {
      console.error('Error fetching pricing:', err);
      setError(err.message);
    }
  };

  const fetchSyncStatus = async () => {
    try {
      const response = await fetch('/api/admin/pricing/sync');
      if (!response.ok) throw new Error('Failed to fetch sync status');

      const data = await response.json();
      setSyncStatus(data.data);
    } catch (err: any) {
      console.error('Error fetching sync status:', err);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/admin/pricing/sync', {
        method: 'POST'
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Sync failed');
      }

      setSuccessMessage(data.message);

      // Refresh data
      await Promise.all([fetchPricing(), fetchSyncStatus()]);
    } catch (err: any) {
      console.error('Sync error:', err);
      setError(err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([fetchPricing(), fetchSyncStatus()]);
      setIsLoading(false);
    };
    init();
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Aldrig';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Laddar priser...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Modellpriser</h1>
        <p className="text-gray-600">
          Automatisk prissättning för AI-modeller från LiteLLM
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-900 mb-1">Fel vid synkronisering</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
          <TrendingUp className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-green-900 mb-1">Synkronisering lyckades</h3>
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Totalt modeller</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {syncStatus?.modelCounts.total || 0}
              </h3>
            </div>
            <Database className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Auto-synkade</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {syncStatus?.modelCounts.litellm || 0}
              </h3>
            </div>
            <RefreshCw className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Manuella</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {syncStatus?.modelCounts.manual || 0}
              </h3>
            </div>
            <DollarSign className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Senast uppdaterad</p>
              <h3 className="text-xs font-medium text-gray-900">
                {syncStatus?.lastSyncedAt ? formatDate(syncStatus.lastSyncedAt) : 'Aldrig'}
              </h3>
            </div>
            <Calendar className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Sync Button */}
      <div className="mb-6 flex items-center justify-between bg-white rounded-lg p-4 border border-gray-200">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Synkronisera priser</h3>
          <p className="text-xs text-gray-600">
            Hämta senaste priserna från {syncStatus?.syncSource || 'LiteLLM'}
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors ${
            isSyncing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Synkroniserar...' : 'Synkronisera nu'}
        </button>
      </div>

      {/* Pricing Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Modell
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Input (per 1M)
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Output (per 1M)
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Cached (per 1M)
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Källa
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Uppdaterad
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pricing.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Inga modellpriser hittades. Klicka på "Synkronisera nu" för att hämta priser.
                  </td>
                </tr>
              ) : (
                pricing.map((model) => (
                  <tr key={model.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{model.model_name}</div>
                      {model.metadata?.max_tokens && (
                        <div className="text-xs text-gray-500">
                          {model.metadata.max_tokens.toLocaleString()} tokens
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {model.provider}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-mono">
                      {formatCost(model.input_cost_per_million)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-mono">
                      {formatCost(model.output_cost_per_million)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 font-mono">
                      {model.cached_input_cost_per_million
                        ? formatCost(model.cached_input_cost_per_million)
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        model.source === 'litellm'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {model.source}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                      {formatDate(model.last_updated)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Om automatisk prissättning</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Priser synkas automatiskt från LiteLLM varje 24h</li>
          <li>Baseline-priser används som fallback om synkningen misslyckas</li>
          <li>Alla kostnadsberäkningar i systemet använder dessa priser</li>
          <li>Manuella uppdateringar kan göras genom att klicka "Synkronisera nu"</li>
        </ul>
      </div>
    </div>
  );
}
