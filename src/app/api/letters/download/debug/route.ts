// Debug endpoint för att kontrollera routing
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Download route debug endpoint fungerar',
    timestamp: new Date().toISOString(),
    methods: ['POST'],
    path: '/api/letters/download'
  });
}

export async function POST() {
  return NextResponse.json({
    error: 'Detta är debug-endpointen, använd /api/letters/download för faktisk nedladdning',
    message: 'Om du ser detta meddelande fungerar routing korrekt',
    timestamp: new Date().toISOString()
  });
}