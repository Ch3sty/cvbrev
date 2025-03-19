import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// Hämta ett specifikt brev med ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // I Next.js 15.2 måste params awaitadas innan man använder dess egenskaper
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    // Hämta cookies korrekt med Next.js 15.2 pattern
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    // Verifiera att användaren är autentiserad
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
    }

    // Hämta brevet från databasen
    const { data, error } = await supabase
      .from('letters')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Fel vid hämtning av brev:', error);
      return NextResponse.json(
        { error: 'Kunde inte hitta brevet' }, 
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Brevhämtning error:', error);
    return NextResponse.json(
      { error: 'Serverfel vid hämtning av brev' }, 
      { status: 500 }
    );
  }
}

// Uppdatera ett befintligt brev
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // I Next.js 15.2 måste params awaitadas innan man använder dess egenskaper
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    // Hämta cookies korrekt med Next.js 15.2 pattern
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    // Verifiera att användaren är autentiserad
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
    }

    // Hämta begäransdata
    const updateData = await request.json();
    
    // Verifiera att användaren äger brevet
    const { data: existingLetter, error: fetchError } = await supabase
      .from('letters')
      .select('user_id')
      .eq('id', id)
      .single();
      
    if (fetchError || !existingLetter) {
      return NextResponse.json(
        { error: 'Brevet hittades inte' }, 
        { status: 404 }
      );
    }
    
    if (existingLetter.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Du har inte behörighet att uppdatera detta brev' }, 
        { status: 403 }
      );
    }

    // Uppdatera brevet i databasen
    const { data, error } = await supabase
      .from('letters')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Fel vid uppdatering av brev:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: data[0]
    });
  } catch (error: any) {
    console.error('Brevuppdatering error:', error);
    return NextResponse.json(
      { error: 'Serverfel vid uppdatering av brev' }, 
      { status: 500 }
    );
  }
}

// Ta bort ett brev
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // I Next.js 15.2 måste params awaitadas innan man använder dess egenskaper
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    // Hämta cookies korrekt med Next.js 15.2 pattern
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    // Verifiera att användaren är autentiserad
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
    }

    // Verifiera att användaren äger brevet
    const { data: existingLetter, error: fetchError } = await supabase
      .from('letters')
      .select('user_id')
      .eq('id', id)
      .single();
      
    if (fetchError || !existingLetter) {
      return NextResponse.json(
        { error: 'Brevet hittades inte' }, 
        { status: 404 }
      );
    }
    
    if (existingLetter.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Du har inte behörighet att ta bort detta brev' }, 
        { status: 403 }
      );
    }

    // Ta bort brevet från databasen
    const { error } = await supabase
      .from('letters')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Fel vid borttagning av brev:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Brevet har tagits bort'
    });
  } catch (error: any) {
    console.error('Brevborttagning error:', error);
    return NextResponse.json(
      { error: 'Serverfel vid borttagning av brev' }, 
      { status: 500 }
    );
  }
}