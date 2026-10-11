import { ITopupProvider, PlayerValidationResult, TopupExecutionResult, TopupOrderPayload, ProviderBalance } from '../types';

/**
 * Item4Gamer / Generic B2B Reseller API Provider
 * High speed direct recharge API for PUBG UC, Free Fire Diamonds, etc.
 */
export class Item4GamerTopupProvider implements ITopupProvider {
  name = 'Item4Gamer B2B Direct API';

  private apiKey = process.env.ITEM4GAMER_API_KEY || '';
  private apiSecret = process.env.ITEM4GAMER_SECRET || '';
  private baseUrl = process.env.ITEM4GAMER_URL || 'https://api.item4gamer.com/v1';

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  async validatePlayerId(game: string, playerId: string, zoneId?: string): Promise<PlayerValidationResult> {
    if (!this.isConfigured()) {
      return {
        valid: false,
        error: 'Item4Gamer API non configurée.',
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/check-player`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          game,
          player_id: playerId,
          server_id: zoneId || '',
        }),
      });

      if (!response.ok) {
        return { valid: false, error: 'Échec de la validation du joueur' };
      }

      const data = await response.json();
      return {
        valid: Boolean(data.success),
        playerName: data.nickname || data.player_name,
        region: data.region,
      };
    } catch {
      return { valid: false, error: 'Erreur réseau vers le fournisseur' };
    }
  }

  async executeTopup(payload: TopupOrderPayload): Promise<TopupExecutionResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        provider: this.name,
        transactionId: '',
        status: 'failed',
        message: 'Clé API Item4Gamer non renseignée dans .env',
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/orders/topup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          client_order_id: payload.orderId,
          product_code: payload.packageCode || payload.package,
          player_id: payload.playerId,
          zone_id: payload.zoneId || '',
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        return {
          success: false,
          provider: this.name,
          transactionId: data.order_id || '',
          status: 'failed',
          message: data.message || 'Échec de la recharge chez Item4Gamer.',
          rawResponse: data,
        };
      }

      return {
        success: true,
        provider: this.name,
        transactionId: data.order_id || `I4G-${Date.now()}`,
        status: 'completed',
        deliveredAt: new Date().toISOString(),
        message: 'Recharge complétée avec succès par Item4Gamer.',
        balanceRemaining: data.new_balance,
        rawResponse: data,
      };
    } catch (err: unknown) {
      console.error('Item4Gamer topup error:', err);
      return {
        success: false,
        provider: this.name,
        transactionId: '',
        status: 'failed',
        message: 'Erreur réseau avec Item4Gamer.',
      };
    }
  }

  async getBalance(): Promise<ProviderBalance> {
    if (!this.isConfigured()) {
      return { provider: this.name, balance: 0, currency: 'USD', isLive: false };
    }

    try {
      const response = await fetch(`${this.baseUrl}/balance`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` },
      });
      const data = await response.json();
      return {
        provider: this.name,
        balance: Number(data.balance || 0),
        currency: data.currency || 'USD',
        isLive: true,
      };
    } catch {
      return { provider: this.name, balance: 0, currency: 'USD', isLive: false };
    }
  }
}
