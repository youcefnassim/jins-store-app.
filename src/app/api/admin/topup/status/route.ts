import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/supabase/server';
import { getActiveTopupProvider } from '@/lib/topup';

export async function GET(request: NextRequest) {
  try {
    const auth = await checkAdminAuth(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const provider = getActiveTopupProvider();
    const balanceInfo = await provider.getBalance();

    return NextResponse.json({
      providerName: provider.name,
      isConfigured: provider.isConfigured(),
      balance: balanceInfo.balance,
      currency: balanceInfo.currency,
      isLive: balanceInfo.isLive,
    });
  } catch (err: unknown) {
    console.error('Topup status error:', err);
    return NextResponse.json({ error: 'Erreur statut fournisseur' }, { status: 500 });
  }
}
