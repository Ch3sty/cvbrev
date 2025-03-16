"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext"; 
import Header from "@/components/Header";
import SimpleCoverLetterGenerator from "@/components/SimpleCoverLetterGenerator";

export default function GeneratorPage() {
  const { user } = useAuth();

  // If no user is logged in, show login message
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Du måste vara inloggad för att skapa ansökningsbrev</p>
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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">
            Skapa ditt personliga <span className="text-pink-500">ansökningsbrev</span>
          </h1>
          <p className="text-gray-400 mb-8">
            Välj ditt CV och klistra in jobbannonsen för att generera ett personligt brev
          </p>
          <SimpleCoverLetterGenerator />
        </div>
      </main>
    </div>
  );
}