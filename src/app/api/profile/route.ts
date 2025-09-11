import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    // Uppdaterad cookie-hantering för Next.js 14
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// LinkedIn URL validation function
function validateLinkedInUrl(url: string): string | null {
  if (!url.trim()) {
    return null; // Empty is OK since field is optional
  }

  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    
    // Check if it's a LinkedIn URL
    const validDomains = ['linkedin.com', 'www.linkedin.com'];
    if (!validDomains.includes(urlObj.hostname.toLowerCase())) {
      return 'Ange en giltig LinkedIn-profil URL';
    }

    // Check if it's a profile page
    const path = urlObj.pathname.toLowerCase();
    if (!path.startsWith('/in/') && !path.startsWith('/pub/')) {
      return 'URL:en måste vara till en LinkedIn-profil (linkedin.com/in/ditt-namn)';
    }

    return null;
  } catch {
    return 'Ange en giltig URL (t.ex. linkedin.com/in/ditt-namn)';
  }
}

export async function PUT(request: Request) {
  try {
    // Uppdaterad cookie-hantering för Next.js 14
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await request.json();

    // Validate LinkedIn URL if provided
    if (json.linkedin_url) {
      const linkedinError = validateLinkedInUrl(json.linkedin_url);
      if (linkedinError) {
        return NextResponse.json({ error: linkedinError }, { status: 400 });
      }
      
      // Format LinkedIn URL
      try {
        const fullUrl = json.linkedin_url.startsWith('http') ? json.linkedin_url : `https://${json.linkedin_url}`;
        const urlObj = new URL(fullUrl);
        
        // Normalize to linkedin.com (remove www)
        if (urlObj.hostname === 'www.linkedin.com') {
          urlObj.hostname = 'linkedin.com';
        }
        
        json.linkedin_url = urlObj.toString();
      } catch {
        // Keep original if formatting fails
      }
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...json,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
