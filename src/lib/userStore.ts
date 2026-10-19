import fs from 'fs';
import path from 'path';
import { getSupabaseAdmin } from './supabase/server';

export interface SavedAccountItem {
  id: string;
  user_id: string;
  game: string;
  player_id: string;
  player_name: string | null;
  created_at: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE_PATH = path.join(DATA_DIR, 'saved_accounts.json');

function ensureDataFile(): SavedAccountItem[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(FILE_PATH)) {
      fs.writeFileSync(FILE_PATH, JSON.stringify([]), 'utf8');
      return [];
    }
    const raw = fs.readFileSync(FILE_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.warn('userStore local read warning:', err);
    return [];
  }
}

function writeDataFile(items: SavedAccountItem[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(FILE_PATH, JSON.stringify(items, null, 2), 'utf8');
  } catch (err) {
    console.warn('userStore local write warning:', err);
  }
}

/**
 * Get all saved accounts for a user (Supabase + Local fallback)
 */
export async function getUserSavedAccounts(userId: string): Promise<SavedAccountItem[]> {
  const localItems = ensureDataFile().filter(i => i.user_id === userId);
  
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from('saved_accounts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      // Merge unique accounts by id or (game + player_id)
      const mergedMap = new Map<string, SavedAccountItem>();
      for (const item of localItems) {
        mergedMap.set(`${item.game}:${item.player_id}`, item);
      }
      for (const item of data) {
        mergedMap.set(`${item.game}:${item.player_id}`, item);
      }
      return Array.from(mergedMap.values());
    }
  } catch (err) {
    console.warn('Supabase saved_accounts fetch warning:', err);
  }

  return localItems;
}

/**
 * Add a saved account for a user
 */
export async function addUserSavedAccount(params: {
  userId: string;
  game: string;
  playerId: string;
  playerName?: string | null;
}): Promise<SavedAccountItem> {
  const newItem: SavedAccountItem = {
    id: `acc_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    user_id: params.userId,
    game: params.game,
    player_id: params.playerId,
    player_name: params.playerName || null,
    created_at: new Date().toISOString(),
  };

  // 1. Save to local fallback store immediately
  const localList = ensureDataFile();
  const updated = [newItem, ...localList.filter(i => !(i.user_id === params.userId && i.game === params.game && i.player_id === params.playerId))];
  writeDataFile(updated);

  // 2. Try Supabase
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from('saved_accounts')
      .insert({
        user_id: params.userId,
        game: params.game,
        player_id: params.playerId,
        player_name: params.playerName || null,
      })
      .select()
      .single();

    if (!error && data) {
      return data;
    }
  } catch (err) {
    console.warn('Supabase saved_accounts insert notice:', err);
  }

  return newItem;
}

/**
 * Delete a saved account for a user
 */
export async function deleteUserSavedAccount(userId: string, accountId: string): Promise<boolean> {
  // 1. Remove from local store
  const localList = ensureDataFile();
  const filtered = localList.filter(i => !(i.id === accountId && (i.user_id === userId || !userId)));
  writeDataFile(filtered);

  // 2. Try Supabase
  try {
    const admin = getSupabaseAdmin();
    await admin
      .from('saved_accounts')
      .delete()
      .eq('id', accountId);
  } catch (err) {
    console.warn('Supabase saved_accounts delete notice:', err);
  }

  return true;
}
