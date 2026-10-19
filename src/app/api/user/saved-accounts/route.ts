import { NextRequest, NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/supabase/server';
import { getUserSavedAccounts, addUserSavedAccount, deleteUserSavedAccount } from '@/lib/userStore';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const accounts = await getUserSavedAccounts(user.id);
    return NextResponse.json({ accounts });
  } catch (err: unknown) {
    console.error('Saved accounts GET error:', err);
    return NextResponse.json({ error: 'Erreur lors du chargement des comptes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const game = String(body.game || '').trim();
    const playerId = String(body.playerId || '').trim();
    const playerName = body.playerName ? String(body.playerName).trim() : null;

    if (!game || !playerId) {
      return NextResponse.json({ error: 'Jeu et Player ID requis' }, { status: 400 });
    }

    const account = await addUserSavedAccount({
      userId: user.id,
      game,
      playerId,
      playerName,
    });

    return NextResponse.json({ success: true, account });
  } catch (err: unknown) {
    console.error('Saved accounts POST error:', err);
    return NextResponse.json({ error: 'Erreur lors de la sauvegarde du compte' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID de compte requis' }, { status: 400 });
    }

    await deleteUserSavedAccount(user.id, id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Saved accounts DELETE error:', err);
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
