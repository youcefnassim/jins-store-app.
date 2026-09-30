import { supabase } from './client';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type DbGame = {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  image_url: string | null;
  created_at: string;
};

export type DbPackage = {
  id: string;
  game_id: string;
  label: string;
  price: number;
  popular?: boolean;
  created_at: string;
};

export type DbOrder = {
  id: string;
  user_id: string;
  game: string;
  package: string;
  player_id: string;
  zone_id?: string;
  phone?: string;
  payment_method?: string;
  price: string;
  points_to_award: number;
  receipt_url: string;
  promo_code?: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  created_at: string;
};

// ──────────────────────────────────────────────
// Games
// ──────────────────────────────────────────────

export async function getGames(): Promise<DbGame[]> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('getGames error:', error.message);
    return [];
  }
  return data ?? [];
}

export async function getGameBySlug(slug: string): Promise<DbGame | null> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data;
}

// ──────────────────────────────────────────────
// Packages
// ──────────────────────────────────────────────

export async function getPackagesByGame(gameSlug: string): Promise<DbPackage[]> {
  // First get the game id from slug
  const game = await getGameBySlug(gameSlug);
  if (!game) return [];

  const { data, error } = await supabase
    .from('game_packages')
    .select('*')
    .eq('game_id', game.id)
    .order('price', { ascending: true });

  if (error) {
    console.error('getPackagesByGame error:', error.message);
    return [];
  }
  return data ?? [];
}

export async function getPackageById(packageId: string): Promise<DbPackage | null> {
  const { data, error } = await supabase
    .from('game_packages')
    .select('*')
    .eq('id', packageId)
    .single();

  if (error) return null;
  return data;
}

// ──────────────────────────────────────────────
// Orders (client-side read — via order ID)
// ──────────────────────────────────────────────

export async function getOrderById(orderId: string): Promise<DbOrder | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error) {
    console.error('getOrderById error:', error.message);
    return null;
  }
  return data;
}

export async function getUserOrders(userId: string): Promise<DbOrder[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getUserOrders error:', error.message);
    return [];
  }
  return data ?? [];
}
