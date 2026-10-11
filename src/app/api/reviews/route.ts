import { NextRequest, NextResponse } from 'next/server';
import {
  getRequestUser,
  getSupabaseAdmin,
  getSupabaseAnon,
  mapReview,
} from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rateLimit';

export const revalidate = 60; // Cache approved reviews for 60 seconds

export async function GET() {
  try {
    const supabase = getSupabaseAnon();
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return NextResponse.json({ reviews: [] });
    }

    return NextResponse.json({
      reviews: (reviews || []).map((r) => mapReview(r)),
    });
  } catch (err: unknown) {
    console.error('Unexpected reviews GET error:', err);
    return NextResponse.json({ reviews: [] });
  }
}

export async function POST(request: NextRequest) {
  // Rate limit: max 5 reviews per 10 minutes per IP
  const rateLimitResponse = checkRateLimit(request, {
    limit: 5,
    windowMs: 10 * 60 * 1000,
    keyPrefix: 'reviews_post',
  });
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const user = await getRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Vous devez être connecté pour laisser un avis' }, { status: 401 });
    }

    const body = await request.json();
    const rawName = typeof body.name === 'string' ? body.name : '';
    const rawComment = typeof body.comment === 'string' ? body.comment : '';
    const game = typeof body.game === 'string' ? body.game.trim().slice(0, 80) : null;
    const rating = Number(body.rating);

    // Sanitize and strip HTML tags (Fixes S5)
    const name = rawName.replace(/<[^>]*>/g, '').trim().slice(0, 80);
    const comment = rawComment.replace(/<[^>]*>/g, '').trim().slice(0, 1000);

    if (!name || !comment) {
      return NextResponse.json({ error: 'Nom et commentaire obligatoires' }, { status: 400 });
    }

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Note invalide (doit être comprise entre 1 et 5)' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const { error } = await admin.from('reviews').insert([
      {
        author_name: name,
        game,
        rating: Math.round(rating),
        comment,
        user_id: user.id,
        approved: false, // Requires admin moderation
      },
    ]);

    if (error) {
      console.error('Review insert error:', error);
      return NextResponse.json({ error: "Échec de l'enregistrement de l'avis" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Votre avis a été soumis et sera vérifié par un modérateur.' });
  } catch (err: unknown) {
    console.error('Unexpected review POST error:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
