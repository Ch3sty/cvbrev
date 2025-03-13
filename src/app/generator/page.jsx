"use client";
export const dynamic = "force-dynamic";
// ↑ Hindrar statisk generering. Next.js försöker inte längre 
// att SSR:a denna sida (vilket orsakar null i currentUser).

import React from "react";
import nextDynamic from "next/dynamic";
import { useAuth } from "@/contexts/AuthContext"; // Uppdaterad import för Supabase

// Dynamisk import av Header och CoverLetterGenerator
// så att de inte SSR:as. De är "use client" inuti, men
// Next måste förhindras från att pre-rendera dem på servern.
const Header = nextDynamic(() => import("../../components/Header"), {
  ssr: false,
});
const CoverLetterGenerator = nextDynamic(
  () => import("../../components/CoverLetterGenerator"),
  { ssr: false }
);

export default function GeneratorPage() {
  const { user } = useAuth(); // Lägg till autentiseringskontext för att hantera inloggningsstatus

  // Om ingen användare är inloggad, kan du lägga till en omdirigering eller ett meddelande
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
            Ladda upp ditt CV och klistra in jobbannonsen för att generera ett personligt brev
          </p>
          {/* Själva generatorn */}
          <CoverLetterGenerator />
        </div>
      </main>
    </div>
  );
}