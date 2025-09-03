// src/app/api/letters/preview/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { generateLetterPreview } from '@/lib/pdf/puppeteer-pdf';
import { LetterMetadata, TemplateType } from '@/lib/pdf/letter-templates';

export async function POST(request: Request) {
  try {
    // Verifiera autentisering för PDF preview generering
    const cookieStore = cookies();
    const supabase = createServerClient({ cookies: cookieStore });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
    }
    
    // Läs begäransdata
    const body = await request.text();
    let parsedBody;
    
    try {
      parsedBody = JSON.parse(body);
    } catch (e) {
      console.error('JSON parse error:', e);
      return NextResponse.json({ error: 'Ogiltig JSON i begäran' }, { status: 400 });
    }
    
    const { content, metadata, template } = parsedBody;
    
    if (!content) {
      return NextResponse.json({ error: 'Inget innehåll angivet' }, { status: 400 });
    }
    
    // Hämta användarens profil för att lägga till namn m.m.
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    // Förbered metadata med användarens information
    const enhancedMetadata: LetterMetadata = {
      title: metadata?.title || 'Ansökningsbrev',
      company: metadata?.company || '',
      position: metadata?.position || metadata?.job_title || '',
      author: profileData?.full_name || user.email?.split('@')[0] || 'Användare',
      email: user.email || '',
      phone: profileData?.phone || '',
      address: profileData?.address || '',
      date: new Date().toLocaleDateString('sv-SE')
    };
    
    const templateType = (template as TemplateType) || 'formal';
    
    try {
      console.log('Generating preview with Puppeteer');
      // Generera förhandsvisning som PNG
      const previewBuffer = await generateLetterPreview(content, enhancedMetadata, {
        template: templateType,
        format: 'A4'
      });
      
      // Returnera bilden som base64 för direkt visning i frontend
      const base64Image = previewBuffer.toString('base64');
      
      return NextResponse.json({
        preview: `data:image/png;base64,${base64Image}`,
        template: templateType,
        metadata: enhancedMetadata
      });
    } catch (puppeteerError) {
      console.error('Puppeteer preview error:', puppeteerError);
      
      // Returnera fallback meddelande istället för förhandsvisning
      return NextResponse.json({
        error: 'Förhandsvisning inte tillgänglig i denna miljö',
        fallback: true,
        template: templateType,
        metadata: enhancedMetadata
      });
    }
    
  } catch (error: any) {
    console.error('Error generating preview:', error);
    return NextResponse.json(
      { error: 'Serverfel vid generering av förhandsvisning: ' + error.message }, 
      { status: 500 }
    );
  }
}