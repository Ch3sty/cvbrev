// src/app/dashboard/learning-plan/[id]/page.tsx
import React from 'react';

export default async function LearningPlanPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Din Lärandeplan</h1>
        <p className="text-gray-400">Plan ID: {id}</p>
        <div className="mt-8 p-6 bg-gray-800 rounded-lg">
          <p className="text-lg">Din lärandeplan har skapats!</p>
          <p className="mt-4 text-gray-400">
            Fullständig visning av lärande-planer kommer snart...
          </p>
        </div>
      </div>
    </div>
  );
}