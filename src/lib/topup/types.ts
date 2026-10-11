export interface PlayerValidationResult {
  valid: boolean;
  playerName?: string;
  region?: string;
  error?: string;
}

export interface TopupOrderPayload {
  orderId: string;
  game: string;
  gameSlug?: string;
  package: string;
  packageCode?: string;
  playerId: string;
  zoneId?: string;
  server?: string;
  amount?: number;
  userEmail?: string;
}

export interface TopupExecutionResult {
  success: boolean;
  provider: string;
  transactionId: string;
  status: 'completed' | 'processing' | 'failed';
  deliveredAt?: string;
  message: string;
  balanceRemaining?: number;
  rawResponse?: Record<string, unknown>;
}

export interface ProviderBalance {
  provider: string;
  balance: number;
  currency: string;
  isLive: boolean;
}

export interface ITopupProvider {
  name: string;
  isConfigured(): boolean;
  validatePlayerId(game: string, playerId: string, zoneId?: string): Promise<PlayerValidationResult>;
  executeTopup(payload: TopupOrderPayload): Promise<TopupExecutionResult>;
  getBalance(): Promise<ProviderBalance>;
}
