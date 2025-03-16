"use client";
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import ProfileCVManager from "@/components/ProfileCVManager";
import ProfileForm from "@/components/ProfileForm";
import ProfileSettings from "@/components/ProfileSettings";
import { FiUser, FiFileText, FiSettings } from "react-icons/fi";

export default function ProfilePage() {
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("profilinfo");
  
  // If no user is logged in, show login message
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Du måste vara inloggad för att se din profil</p>
          <a 
            href="/login" 
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg"
          >
            Logga in
          </a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">
            Min <span className="text-pink-500">profil</span>
          </h1>
          <p className="text-gray-400 mb-8">
            Hantera din profil, dina CV och inställningar
          </p>
          
          {/* Debug Info */}
          <div className="bg-blue-900/30 border border-blue-800 text-blue-200 px-4 py-3 mb-4 rounded-lg text-sm">
            <p><strong>Debug:</strong> Användar-ID: {user?.id}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Auth Provider:</strong> {user?.app_metadata?.provider || 'Okänd'}</p>
          </div>
          
          {/* Tabs */}
          <div className="bg-gray-900 rounded-t-xl border border-gray-800 overflow-hidden">
            <div className="flex border-b border-gray-800">
              <button 
                onClick={() => setActiveTab("profilinfo")}
                className={`px-6 py-3 font-medium text-sm flex items-center ${
                  activeTab === "profilinfo" 
                    ? "bg-gray-900 text-pink-500 border-b-2 border-pink-500" 
                    : "bg-gray-800 text-gray-400 hover:bg-gray-800/70"
                }`}
              >
                <FiUser className="mr-2" /> Profilinformation
              </button>
              <button 
                onClick={() => setActiveTab("mitt-cv")}
                className={`px-6 py-3 font-medium text-sm flex items-center ${
                  activeTab === "mitt-cv" 
                    ? "bg-gray-900 text-pink-500 border-b-2 border-pink-500" 
                    : "bg-gray-800 text-gray-400 hover:bg-gray-800/70"
                }`}
              >
                <FiFileText className="mr-2" /> Mitt CV
              </button>
              <button 
                onClick={() => setActiveTab("installningar")}
                className={`px-6 py-3 font-medium text-sm flex items-center ${
                  activeTab === "installningar" 
                    ? "bg-gray-900 text-pink-500 border-b-2 border-pink-500" 
                    : "bg-gray-800 text-gray-400 hover:bg-gray-800/70"
                }`}
              >
                <FiSettings className="mr-2" /> Inställningar
              </button>
            </div>
            
            {/* Content Based on Active Tab */}
            <div className="p-6">
              {activeTab === "profilinfo" && <ProfileForm user={user} userProfile={userProfile} />}
              {activeTab === "mitt-cv" && <ProfileCVManager />}
              {activeTab === "installningar" && <ProfileSettings user={user} userProfile={userProfile} />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}