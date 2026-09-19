import { NextRequest, NextResponse } from 'next/server';

// Default marquee announcements store
let marqueeItems = [
  { id: '1', text: "OFFRE SPECIALE : +10% de diamants bonus sur PUBG Mobile jusqu'à minuit !", type: 'flame' },
  { id: '2', text: 'Paiement Edahabia & CIB bientôt disponible', type: 'shield' },
  { id: '3', text: 'Support client 24/7 sur WhatsApp', type: 'support' },
];

export async function GET() {
  return NextResponse.json({ items: marqueeItems });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (Array.isArray(body.items)) {
      marqueeItems = body.items;
      return NextResponse.json({ success: true, items: marqueeItems });
    }
    return NextResponse.json({ error: 'Invalid items payload' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
