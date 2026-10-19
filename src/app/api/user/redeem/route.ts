import { NextRequest, NextResponse } from 'next/server';
import { getRequestUser, getSupabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export const REDEEM_TIERS = [
  { id: 'tier_5', points: 500, discount: 5, label: 'Coupon Réduction 5%' },
  { id: 'tier_10', points: 1000, discount: 10, label: 'Coupon Réduction 10%' },
  { id: 'tier_20', points: 2000, discount: 20, label: 'Coupon VIP Réduction 20%' },
];

export async function POST(request: NextRequest) {
  try {
    const user = await getRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { tierId } = await request.json();
    const tier = REDEEM_TIERS.find(t => t.id === tierId);

    if (!tier) {
      return NextResponse.json({ error: 'Palier de points invalide' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    // Check user points
    const { data: profile, error: profErr } = await admin
      .from('profiles')
      .select('points')
      .eq('id', user.id)
      .single();

    const currentPoints = profile?.points || 0;
    if (currentPoints < tier.points) {
      return NextResponse.json({ 
        error: `Points insuffisants. Vous avez ${currentPoints} PTS, il vous faut ${tier.points} PTS.` 
      }, { status: 400 });
    }

    // Generate unique promo code
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const code = `JIN-${tier.discount}PCT-${randomSuffix}`;

    // Insert promo code
    const { error: promoErr } = await admin
      .from('promo_codes')
      .insert({
        code,
        discount_percentage: tier.discount,
        max_uses: 1,
        current_uses: 0,
        active: true,
      });

    if (promoErr) {
      console.error('Error generating promo code:', promoErr);
      return NextResponse.json({ error: 'Erreur lors de la génération du code promo' }, { status: 500 });
    }

    // Deduct points
    const newPoints = Math.max(0, currentPoints - tier.points);
    await admin
      .from('profiles')
      .update({ points: newPoints })
      .eq('id', user.id);

    return NextResponse.json({
      success: true,
      code,
      discount: tier.discount,
      remainingPoints: newPoints,
      message: `Code promo ${code} (-${tier.discount}%) créé avec succès !`,
    });
  } catch (err: unknown) {
    console.error('Redeem points error:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
