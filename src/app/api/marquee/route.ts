import { NextResponse } from 'next/server';
import { getSupabaseAnon } from '@/lib/supabase/server';

const DEFAULT_ITEMS = [
  { id: '1', text: "OFFRE SPECIALE : +10% de diamants bonus sur PUBG Mobile jusqu'à minuit !", type: 'flame' },
  { id: '2', text: 'Paiement Edahabia & CIB bientôt disponible', type: 'shield' },
  { id: '3', text: 'Support client 24/7 sur WhatsApp', type: 'support' },
];

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  try {
    const supabase = getSupabaseAnon();
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'marquee')
      .maybeSingle();

    if (error || !data?.value) {
      return NextResponse.json({ items: DEFAULT_ITEMS });
    }

    const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
    return NextResponse.json({ items: Array.isArray(parsed) ? parsed : DEFAULT_ITEMS });
  } catch {
    return NextResponse.json({ items: DEFAULT_ITEMS });
  }
}
