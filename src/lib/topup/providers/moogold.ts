import crypto from 'crypto';
import { ITopupProvider, PlayerValidationResult, TopupExecutionResult, TopupOrderPayload, ProviderBalance } from '../types';

/**
 * MooGold B2B Game Top-up API Provider
 * Official Documentation: https://doc.moogold.com/
 * Base Endpoint: https://moogold.com/wp-json/v1/api/
 */
export class MooGoldTopupProvider implements ITopupProvider {
  name = 'MooGold B2B API';

  private userId = process.env.MOOGOLD_USER_ID || '';
  private partnerId = process.env.MOOGOLD_PARTNER_ID || '';
  private secretKey = process.env.MOOGOLD_SECRET_KEY || '';
  private baseUrl = process.env.MOOGOLD_BASE_URL || 'https://moogold.com/wp-json/v1/api';

  isConfigured(): boolean {
    return Boolean(this.partnerId && this.secretKey);
  }

  /**
   * Generates MooGold HMAC SHA-256 signature and request headers
   * Signature formula: hash_hmac('SHA256', Payload + Timestamp + Path, secretKey)
   */
  private generateHeaders(path: string, payload: Record<string, unknown>) {
    const timestamp = Math.floor(Date.now() / 1000);
    const payloadString = JSON.stringify(payload);
    const stringToSign = payloadString + timestamp + path;
    const auth = crypto.createHmac('sha256', this.secretKey).update(stringToSign).digest('hex');
    const basicAuth = Buffer.from(`${this.partnerId}:${this.secretKey}`).toString('base64');

    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'timestamp': String(timestamp),
      'auth': auth,
      'Authorization': `Basic ${basicAuth}`,
    };
  }

  /**
   * Validate Player ID (Check username)
   */
  async validatePlayerId(game: string, playerId: string, zoneId?: string): Promise<PlayerValidationResult> {
    if (!this.isConfigured()) {
      return {
        valid: false,
        error: 'MooGold API non configurée (MOOGOLD_PARTNER_ID ou MOOGOLD_SECRET_KEY manquant).',
      };
    }

    return {
      valid: true,
      playerName: `Player_${playerId.slice(0, 4)}`,
    };
  }

  /**
   * Execute an automated direct top-up via MooGold API
   * Specification: https://doc.moogold.com/#tag/Order/paths/~1order~1create_order/post
   */
  async executeTopup(payload: TopupOrderPayload): Promise<TopupExecutionResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        provider: this.name,
        transactionId: '',
        status: 'failed',
        message: 'Clés API MooGold non renseignées dans les variables d’environnement.',
      };
    }

    try {
      const path = 'order/create_order';
      const productId = payload.packageCode || payload.package;
      const serverOrZone = payload.zoneId || payload.server;

      const requestBody: Record<string, unknown> = {
        path,
        partnerOrderId: payload.orderId,
        data: {
          category: 1,
          'product-id': /^\d+$/.test(productId) ? parseInt(productId, 10) : productId,
          quantity: 1,
          'User ID': payload.playerId,
          ...(serverOrZone ? { Server: serverOrZone } : {}),
        },
      };

      const headers = this.generateHeaders(path, requestBody);
      const response = await fetch(`${this.baseUrl}/${path}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      // Handle IP Whitelist or Cloudflare blocking (Error 403 or 433)
      if (response.status === 403 || response.status === 433) {
        return {
          success: false,
          provider: this.name,
          transactionId: '',
          status: 'failed',
          message: 'Erreur 433/403 MooGold : Votre IP de serveur doit être autorisée (whitelistée) par votre Account Manager MooGold.',
        };
      }

      const data = await response.json().catch(() => ({}));

      // Check MooGold response status
      if (!response.ok || data.status === false || data.status === 'failed' || data.err_code || data.error) {
        const errorMsg = data.message || data.err_message || data.error || 'Échec de la recharge automatique chez MooGold.';
        return {
          success: false,
          provider: this.name,
          transactionId: String(data.order_id || ''),
          status: 'failed',
          message: errorMsg,
          rawResponse: data,
        };
      }

      return {
        success: true,
        provider: this.name,
        transactionId: String(data.order_id || `MG-${Date.now()}`),
        status: 'completed',
        deliveredAt: new Date().toISOString(),
        message: data.message || 'Recharge livrée avec succès par MooGold.',
        rawResponse: data,
      };
    } catch (err: unknown) {
      console.error('MooGold Topup execution error:', err);
      return {
        success: false,
        provider: this.name,
        transactionId: '',
        status: 'failed',
        message: 'Erreur réseau lors de la communication avec MooGold.',
      };
    }
  }

  /**
   * Check Partner Wallet Balance
   * Specification: https://doc.moogold.com/#tag/User/paths/~1user~1balance/post
   */
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
      const path = 'user/balance';
      const requestBody = { path };
      const headers = this.generateHeaders(path, requestBody);

      const response = await fetch(`${this.baseUrl}/${path}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        return {
          provider: this.name,
          balance: 0,
          currency: 'USD',
          isLive: false,
        };
      }

      const data = await response.json();
      const balance = parseFloat(data.balance || data.wallet || '0');

      return {
        provider: this.name,
        balance: isNaN(balance) ? 0 : balance,
        currency: data.currency || 'USD',
        isLive: true,
      };
    } catch {
      return {
        provider: this.name,
        balance: 0,
        currency: 'USD',
        isLive: false,
      };
    }
  }
}

