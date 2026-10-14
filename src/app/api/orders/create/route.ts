import { NextRequest, NextResponse } from 'next/server';
import { getRequestUser, getSupabaseAdmin } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rateLimit';
import { sendDiscordOrderNotification } from '@/lib/discord/webhook';

const ALLOWED_RECEIPT_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
};
const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  // 1. Rate Limiting: Max 10 orders per 5 minutes per IP
  const rateLimitResponse = checkRateLimit(request, {
    limit: 10,
    windowMs: 5 * 60 * 1000,
    keyPrefix: 'orders_create',
  });
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const user = await getRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Vous devez être connecté pour passer commande' }, { status: 401 });
    }

    const formData = await request.formData();
    const game = formData.get('game') as string;
    const packageId = formData.get('packageId') as string;
    const packageName = formData.get('packageName') as string;
    const playerId = formData.get('playerId') as string;
    const zoneId = (formData.get('zoneId') as string) || null;
    const phone = (formData.get('phone') as string) || null;
    const paymentMethod = (formData.get('paymentMethod') as string) || null;
    const promoCodeRaw = (formData.get('promoCode') as string) || null;
    const receiptFile = formData.get('receiptFile') as File | null;
    const rawQuantity = formData.get('quantity');
    const quantity = Math.max(1, Math.min(99, Number(rawQuantity) || 1));

    if (!receiptFile) {
      return NextResponse.json({ error: 'Reçu de paiement requis' }, { status: 400 });
    }
    if (!playerId || !packageId) {
      return NextResponse.json({ error: 'Données de commande incomplètes' }, { status: 400 });
    }

    // 2. MIME type validation and safe extension derivation (Fixes S11)
    const fileExtension = ALLOWED_RECEIPT_TYPES[receiptFile.type];
    if (!fileExtension) {
      return NextResponse.json({ error: 'Format de fichier non autorisé (JPEG, PNG, WebP ou PDF uniquement)' }, { status: 400 });
    }
    if (receiptFile.size > MAX_RECEIPT_BYTES) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 5 Mo)' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    // 3. Fetch package securely from DB (never trust client price)
    const { data: pkg, error: pkgError } = await admin
      .from('game_packages')
      .select('id, label, price, active, game_id, games(name, slug)')
      .eq('id', packageId)
      .single();

    if (pkgError || !pkg || pkg.active === false) {
      return NextResponse.json({ error: 'Forfait indisponible ou invalide' }, { status: 400 });
    }

    let price = Number(pkg.price) * quantity;
    let promoCode: string | null = null;

    // 4. Promo code validation & atomic concurrency update (Fixes B5)
    if (promoCodeRaw) {
      const code = promoCodeRaw.toUpperCase().trim();
      const { data: promo } = await admin
        .from('promo_codes')
        .select('id, code, discount_percentage, current_uses, max_uses, active')
        .eq('code', code)
        .single();

      if (
        promo &&
        promo.active &&
        promo.current_uses < promo.max_uses &&
        promo.discount_percentage > 0
      ) {
        // Optimistic concurrency increment: only succeeds if current_uses hasn't exceeded
        const { data: updatedPromo } = await admin
          .from('promo_codes')
          .update({ current_uses: promo.current_uses + 1 })
          .eq('id', promo.id)
          .eq('current_uses', promo.current_uses)
          .select('id');

        if (updatedPromo && updatedPromo.length > 0) {
          price = Math.round(price * (1 - promo.discount_percentage / 100));
          promoCode = promo.code;
        }
      }
    }

    const pointsToAward = Math.floor(price * 0.1);
    const gameLabel =
      (pkg as { games?: { name?: string; slug?: string } | { name?: string; slug?: string }[] }).games;
    const gameName = Array.isArray(gameLabel)
      ? gameLabel[0]?.name || game || packageName
      : gameLabel?.name || game || packageName;

    const timestamp = Date.now();
    const fileName = `${user.id}/${timestamp}.${fileExtension}`;

    const arrayBuffer = await receiptFile.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // 5. Upload receipt to storage
    const { error: uploadError } = await admin.storage
      .from('receipts')
      .upload(fileName, buffer, {
        contentType: receiptFile.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json({ error: 'Échec de téléchargement du reçu. Veuillez réessayer.' }, { status: 500 });
    }

    // Generate public URL (or storage path)
    const { data: { publicUrl } } = admin.storage.from('receipts').getPublicUrl(fileName);

    const packageTitle = quantity > 1 ? `${pkg.label || packageName} (x${quantity})` : (pkg.label || packageName);

    const orderPayload: Record<string, unknown> = {
      user_id: user.id,
      game: gameName,
      package: packageTitle,
      player_id: playerId.trim(),
      price: String(price),
      points_to_award: pointsToAward,
      points_awarded: false,
      receipt_url: publicUrl || fileName,
      status: 'pending',
    };

    if (zoneId) orderPayload.zone_id = zoneId.trim();
    if (phone) orderPayload.phone = phone.trim();
    if (paymentMethod) orderPayload.payment_method = paymentMethod;
    if (promoCode) orderPayload.promo_code = promoCode;

    // 6. Insert Order into DB
    const { data: orderData, error: orderError } = await admin
      .from('orders')
      .insert(orderPayload)
      .select('id')
      .single();

    // 7. Prevent orphaned storage files if order insert fails (Fixes R6)
    if (orderError) {
      console.error('Order creation error:', orderError);
      // Clean up orphaned receipt from storage
      await admin.storage.from('receipts').remove([fileName]).catch(() => {});
      return NextResponse.json({ error: 'Impossible de finaliser la commande. Veuillez réessayer.' }, { status: 500 });
    }

    // 8. Fire Discord Webhook notification if configured
    sendDiscordOrderNotification({
      orderId: orderData.id,
      game: gameName,
      package: packageTitle,
      playerId: playerId.trim(),
      price: `${price} DZD`,
      paymentMethod: paymentMethod || 'BaridiMob / CCP',
      receiptUrl: publicUrl || undefined,
      customerEmail: user.email || undefined,
    }).catch(console.error);

    return NextResponse.json({ success: true, orderId: orderData.id });
  } catch (err: unknown) {
    console.error('Unexpected order creation error:', err);
    return NextResponse.json({ error: 'Erreur interne du serveur lors de la commande' }, { status: 500 });
  }
}
