import { NextResponse } from 'next/server';
import { getSiteSetting } from '@/lib/settingsStore';

const DEFAULT_ITEMS = [
  { id: '1', text: "OFFRE SPECIALE : +10% de diamants bonus sur PUBG Mobile jusqu'à minuit !", type: 'flame' },
  { id: '2', text: 'Paiement Edahabia & CIB bientôt disponible', type: 'shield' },
  { id: '3', text: 'Support client 24/7 sur WhatsApp', type: 'support' },
];

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const items = await getSiteSetting('marquee', DEFAULT_ITEMS);
    return NextResponse.json({ items: Array.isArray(items) ? items : DEFAULT_ITEMS });
  } catch {
    return NextResponse.json({ items: DEFAULT_ITEMS });
  }
}


