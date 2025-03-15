"use client";
import React from 'react';
import PropTypes from 'prop-types';
import dynamic from 'next/dynamic';
import { AuthProvider } from '@/contexts/AuthContext';

// Dynamisk import av Header med ssr: false
const Header = dynamic(() => import('./Header'), { ssr: false });

const ClientLayout = ({ 
  children, 
  fullWidth = false, 
  showHeader = false 
}) => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 flex flex-col">
        {showHeader && <Header />}
        <main className={`flex-grow flex ${showHeader ? 'items-start' : 'items-center'} justify-center p-4`}>
          <div className={`w-full ${fullWidth ? 'max-w-6xl' : 'max-w-md'}`}>
            {children}
          </div>
        </main>
      </div>
    </AuthProvider>
  );
};

ClientLayout.propTypes = {
  children: PropTypes.node.isRequired,
  fullWidth: PropTypes.bool,
  showHeader: PropTypes.bool
};

export default ClientLayout;