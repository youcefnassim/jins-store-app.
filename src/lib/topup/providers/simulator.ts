import { ITopupProvider, PlayerValidationResult, TopupExecutionResult, TopupOrderPayload, ProviderBalance } from '../types';

/**
 * Simulator provider for sandbox / demo testing.
 * Automatically validates player IDs and simulates successful direct top-ups
 * with realistic timing and simulated transaction IDs.
 */
export class SimulatorTopupProvider implements ITopupProvider {
  name = 'Simulator (Mode Démo / Test)';

  isConfigured(): boolean {
    return true;
  }

  async validatePlayerId(game: string, playerId: string, zoneId?: string): Promise<PlayerValidationResult> {
    // Artificial small delay for realism
    await new Promise((resolve) => setTimeout(resolve, 350));

    if (!playerId || playerId.trim().length < 4) {
      return {
        valid: false,
        error: "L'identifiant joueur doit comporter au moins 4 caractères.",
      };
    }

    // Mock realistic player names based on game
    const sampleNames: Record<string, string> = {
      pubg: 'DZ_Sniper_99',
      freefire: 'Hero_Dz_Killer',
      roblox: 'AlgeriaGamer2026',
      valorant: 'Phoenix_Oran#EUW',
    };

    const key = game.toLowerCase().replace(/[^a-z]/g, '');
    const playerName = sampleNames[key] || `Player_${playerId.slice(-4)}`;

    return {
      valid: true,
      playerName,
      region: zoneId || 'MENA / Global',
    };
  }

  async executeTopup(payload: TopupOrderPayload): Promise<TopupExecutionResult> {
    // Simulate real delivery time between 800ms and 1500ms
    const delay = Math.floor(Math.random() * 700) + 800;
    await new Promise((resolve) => setTimeout(resolve, delay));

    const mockTxId = `SIM-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;

    return {
      success: true,
      provider: 'Simulator (Démo)',
      transactionId: mockTxId,
      status: 'completed',
      deliveredAt: new Date().toISOString(),
      message: `Recharge simulée réussie pour ${payload.game} (${payload.package}) vers le joueur ${payload.playerId}`,
      balanceRemaining: 994.50,
      rawResponse: {
        simulated: true,
        orderId: payload.orderId,
        playerId: payload.playerId,
        timestamp: new Date().toISOString(),
      },
    };
  }

  async getBalance(): Promise<ProviderBalance> {
    return {
      provider: 'Simulator (Mode Démo)',
      balance: 994.50,
      currency: 'USD',
      isLive: false,
    };
  }
}
