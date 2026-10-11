import { ITopupProvider, PlayerValidationResult, TopupExecutionResult, TopupOrderPayload, ProviderBalance } from '../types';

/**
 * SEAGM Open API Provider (Parent company of KALEOZ)
 * Supports automated game top-up orders via official SEAGM Reseller API.
 */
export class SeagmTopupProvider implements ITopupProvider {
  name = 'SEAGM Open API (Maison Mère de Kaleoz)';

  private apiKey = process.env.SEAGM_API_KEY || '';
  private merchantCode = process.env.SEAGM_MERCHANT_CODE || '';
  private secretKey = process.env.SEAGM_SECRET_KEY || '';
  private baseUrl = process.env.SEAGM_API_URL || 'https://api.seagm.com/v1';

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.merchantCode);
  }

  async validatePlayerId(game: string, playerId: string, zoneId?: string): Promise<PlayerValidationResult> {
    if (!this.isConfigured()) {
      return {
        valid: false,
        error: 'SEAGM API non configurée (clés manquantes dans les variables d’environnement).',
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/game/player-verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Merchant-Code': this.merchantCode,
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          game_code: game.toLowerCase(),
          player_id: playerId,
          zone_id: zoneId || '',
        }),
      });

      if (!response.ok) {
        return {
          valid: false,
          error: `Échec de vérification ID Joueur (${response.status})`,
        };
      }

      const data = await response.json();
      return {
        valid: Boolean(data.valid ?? true),
        playerName: data.player_name || data.username || undefined,
        region: data.region || undefined,
      };
    } catch (err: unknown) {
      console.error('SEAGM player validation error:', err);
      return {
        valid: false,
        error: 'Erreur réseau lors de la vérification avec SEAGM.',
      };
    }
  }

  async executeTopup(payload: TopupOrderPayload): Promise<TopupExecutionResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        provider: this.name,
        transactionId: '',
        status: 'failed',
        message: 'Clés API SEAGM manquantes dans .env (SEAGM_API_KEY, SEAGM_MERCHANT_CODE).',
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/order/create-direct-topup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Merchant-Code': this.merchantCode,
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          merchant_order_id: payload.orderId,
          game_name: payload.game,
          package_code: payload.packageCode || payload.package,
          player_id: payload.playerId,
          zone_id: payload.zoneId || '',
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        return {
          success: false,
          provider: this.name,
          transactionId: data.transaction_id || '',
          status: 'failed',
          message: data.message || `Erreur API SEAGM: Code ${response.status}`,
          rawResponse: data,
        };
      }

      return {
        success: true,
        provider: this.name,
        transactionId: data.transaction_id || `SEAGM-${Date.now()}`,
        status: data.status === 'processing' ? 'processing' : 'completed',
        deliveredAt: new Date().toISOString(),
        message: 'Recharge SEAGM envoyée avec succès au serveur de jeu.',
        balanceRemaining: data.balance_remaining,
        rawResponse: data,
      };
    } catch (err: unknown) {
      console.error('SEAGM topup execution error:', err);
      return {
        success: false,
        provider: this.name,
        transactionId: '',
        status: 'failed',
        message: 'Erreur de connexion au serveur SEAGM.',
      };
    }
  }

  async getBalance(): Promise<ProviderBalance> {
    if (!this.isConfigured()) {
      return {
        provider: this.name,
        balance: 0,
        currency: 'USD',
        isLive: false,
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/merchant/balance`, {
        headers: {
          'X-Merchant-Code': this.merchantCode,
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        return { provider: this.name, balance: 0, currency: 'USD', isLive: true };
      }

      const data = await response.json();
      return {
        provider: this.name,
        balance: parseFloat(data.balance || '0'),
        currency: data.currency || 'USD',
        isLive: true,
      };
    } catch {
      return { provider: this.name, balance: 0, currency: 'USD', isLive: false };
    }
  }
}
