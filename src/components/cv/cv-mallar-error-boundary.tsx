'use client';

import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface Props {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

export class CVMallarErrorBoundary extends React.Component<Props, ErrorBoundaryState> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('CV-mallar error boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
      }

      return <DefaultErrorFallback error={this.state.error!} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

interface FallbackProps {
  error: Error;
  resetError: () => void;
}

function DefaultErrorFallback({ error, resetError }: FallbackProps) {
  const isNetworkError = error.message.includes('fetch') || error.message.includes('network');
  const isPreviewError = error.message.includes('preview') || error.message.includes('template');

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-950 to-navy-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-navy-800 rounded-xl shadow-xl border border-navy-700 p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          
          <h1 className="text-xl font-bold text-white mb-2">
            {isNetworkError ? 'Anslutningsfel' : 'Något gick fel'}
          </h1>
          
          <p className="text-gray-300 text-sm mb-4">
            {isNetworkError && 'Kontrollera din internetanslutning och försök igen.'}
            {isPreviewError && 'Problem med förhandsvisningen. Försök igen om en stund.'}
            {!isNetworkError && !isPreviewError && 'Ett oväntat fel inträffade. Vårt team har informerats.'}
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="text-left bg-navy-900/50 rounded p-3 mb-4">
              <summary className="text-gray-400 text-xs cursor-pointer mb-2">
                Teknisk information
              </summary>
              <pre className="text-red-300 text-xs overflow-auto">
                {error.message}
              </pre>
            </details>
          )}
        </div>
        
        <div className="space-y-3">
          <Button
            onClick={resetError}
            className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Försök igen
          </Button>
          
          <Link href="/profile" className="block">
            <Button variant="outline" className="w-full border-navy-600 hover:bg-navy-700 text-gray-300">
              <Home className="w-4 h-4 mr-2" />
              Gå till profil
            </Button>
          </Link>
        </div>
        
        <p className="text-xs text-gray-500 mt-6">
          Om problemet kvarstår, kontakta support på{' '}
          <a href="mailto:support@jobbcoach.ai" className="text-pink-400 hover:underline">
            support@jobbcoach.ai
          </a>
        </p>
      </div>
    </div>
  );
}

// Hook för att hantera async errors
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error) => {
    console.error('Async error caught:', error);
    setError(error);
  }, []);

  // Throw error to trigger error boundary
  if (error) {
    throw error;
  }

  return { handleError, resetError };
}