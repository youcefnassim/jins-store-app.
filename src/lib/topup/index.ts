import { ITopupProvider } from './types';
import { SimulatorTopupProvider } from './providers/simulator';
import { SeagmTopupProvider } from './providers/seagm';
import { Item4GamerTopupProvider } from './providers/item4gamer';

export * from './types';

/**
 * Returns the active Top-up provider instance based on environment configuration.
 * Default is Simulator if no API keys are provided, allowing seamless testing.
 */
export function getActiveTopupProvider(): ITopupProvider {
  const providerType = (process.env.TOPUP_PROVIDER || '').toLowerCase();

  if (providerType === 'seagm' || (!providerType && process.env.SEAGM_API_KEY)) {
    const seagm = new SeagmTopupProvider();
    if (seagm.isConfigured()) return seagm;
  }

  if (providerType === 'item4gamer' || (!providerType && process.env.ITEM4GAMER_API_KEY)) {
    const i4g = new Item4GamerTopupProvider();
    if (i4g.isConfigured()) return i4g;
  }

  // Fallback to simulator for sandbox / preview / local dev
  return new SimulatorTopupProvider();
}
