import { NextRequest, NextResponse } from 'next/server';

interface CheckPlayerRequest {
  game: string;
  playerId: string;
  zoneId?: string;
}

/**
 * 1. Primary Validator for MLBB: Smile.one (Official direct partner, fast & returns real nickname)
 */
async function checkMLBB_SmileOne(playerId: string, zoneId: string): Promise<{ found: boolean; nickname?: string; notFound?: boolean }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const body = new URLSearchParams({ user_id: playerId, zone_id: zoneId });
    const res = await fetch('https://www.smile.one/merchant/mobilelegends/checkrole', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      body: body.toString(),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.code === 200 && data.username) {
        return { found: true, nickname: String(data.username).trim() };
      }
      if (data.code === 201) {
        return { found: false, notFound: true };
      }
    }
  } catch (err) {
    console.warn('SmileOne MLBB check notice:', err);
  }
  return { found: false };
}

/**
 * 2. Secondary Validator for MLBB: Isan API
 */
async function checkMLBB_Isan(playerId: string, zoneId: string): Promise<{ found: boolean; nickname?: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      `https://api.isan.eu.org/nickname/ml?id=${encodeURIComponent(playerId)}&zone=${encodeURIComponent(zoneId)}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data?.success && data?.name) {
        return { found: true, nickname: String(data.name).trim() };
      }
    }
  } catch (err) {
    console.warn('Isan MLBB check notice:', err);
  }
  return { found: false };
}

/**
 * 3. Tertiary Validator for MLBB: BananaGameShop API
 */
async function checkMLBB_Banana(playerId: string, zoneId: string): Promise<{ found: boolean; nickname?: string; notFound?: boolean }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(
      `https://bananagameshop.com/api/mlbb/validasi?id=${encodeURIComponent(playerId)}&serverid=${encodeURIComponent(zoneId)}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data?.result?.nickname) {
        return { found: true, nickname: String(data.result.nickname).trim() };
      }
      if (data?.status === 'error' || data?.code === 500) {
        return { found: false, notFound: true };
      }
    }
  } catch (err) {
    console.warn('Banana MLBB check notice:', err);
  }
  return { found: false };
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckPlayerRequest = await request.json();
    const { game, playerId, zoneId } = body;

    if (!playerId || playerId.trim().length < 4) {
      return NextResponse.json(
        { success: false, error: 'Identifiant joueur invalide (trop court)' },
        { status: 400 }
      );
    }

    const cleanGame = (game || 'mobile-legends').toLowerCase();
    const cleanId = playerId.trim();
    const cleanZone = zoneId?.trim() || '';

    // 1. Mobile Legends (MLBB) verification
    if (cleanGame.includes('mobile-legends') || cleanGame === 'mlbb') {
      if (!cleanZone) {
        return NextResponse.json(
          { success: false, error: 'Le Zone ID (Serveur) est obligatoire pour Mobile Legends.' },
          { status: 400 }
        );
      }

      // Layer 1: Check Smile.one
      const smileResult = await checkMLBB_SmileOne(cleanId, cleanZone);
      if (smileResult.found && smileResult.nickname) {
        return NextResponse.json({
          success: true,
          valid: true,
          nickname: smileResult.nickname,
          region: 'Global / MENA',
          game: 'Mobile Legends',
          playerId: cleanId,
          zoneId: cleanZone,
          doubleDiamondAvailable: true,
        });
      }

      // Layer 2: Check Isan API
      const isanResult = await checkMLBB_Isan(cleanId, cleanZone);
      if (isanResult.found && isanResult.nickname) {
        return NextResponse.json({
          success: true,
          valid: true,
          nickname: isanResult.nickname,
          region: 'Global / MENA',
          game: 'Mobile Legends',
          playerId: cleanId,
          zoneId: cleanZone,
          doubleDiamondAvailable: true,
        });
      }

      // Layer 3: Check BananaGameShop
      const bananaResult = await checkMLBB_Banana(cleanId, cleanZone);
      if (bananaResult.found && bananaResult.nickname) {
        return NextResponse.json({
          success: true,
          valid: true,
          nickname: bananaResult.nickname,
          region: 'Global / MENA',
          game: 'Mobile Legends',
          playerId: cleanId,
          zoneId: cleanZone,
          doubleDiamondAvailable: true,
        });
      }

      // If Smile.one or Banana explicitly returned not found, or all failed to find account
      return NextResponse.json(
        {
          success: false,
          valid: false,
          error: 'Compte Mobile Legends introuvable. Veuillez vérifier votre ID Joueur et Zone ID (Serveur).',
          game: 'Mobile Legends',
          playerId: cleanId,
          zoneId: cleanZone,
        },
        { status: 404 }
      );
    }

    // 2. Free Fire verification
    if (cleanGame.includes('free-fire') || cleanGame === 'freefire') {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const ffRes = await fetch(
          `https://api.isan.eu.org/nickname/ff?id=${encodeURIComponent(cleanId)}`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);

        if (ffRes.ok) {
          const ffData = await ffRes.json();
          if (ffData?.name) {
            return NextResponse.json({
              success: true,
              valid: true,
              nickname: ffData.name,
              game: 'Free Fire',
              playerId: cleanId,
            });
          }
        }
      } catch {
        // Fallback below
      }

      return NextResponse.json({
        success: true,
        valid: true,
        nickname: null,
        verified: false,
        message: 'Format d\'ID valide.',
        game: 'Free Fire',
        playerId: cleanId,
      });
    }

    // 3. PUBG Mobile verification
    if (cleanGame.includes('pubg')) {
      return NextResponse.json({
        success: true,
        valid: true,
        nickname: null,
        verified: false,
        message: 'Format d\'ID valide.',
        game: 'PUBG Mobile',
        playerId: cleanId,
      });
    }

    // Default generic response
    return NextResponse.json({
      success: true,
      valid: true,
      nickname: null,
      verified: false,
      message: 'Format valide.',
      game,
      playerId: cleanId,
    });
  } catch (err: unknown) {
    console.error('Player check API error:', err);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la vérification de l’identifiant.' },
      { status: 500 }
    );
  }
}
