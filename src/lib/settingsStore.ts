import fs from 'fs';
import path from 'path';
import { getSupabaseAdmin } from './supabase/server';

const SETTINGS_FILE_PATH = path.join(process.cwd(), 'data', 'site_settings.json');

function ensureSettingsFile(): Record<string, any> {
  try {
    const dir = path.dirname(SETTINGS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(SETTINGS_FILE_PATH)) {
      fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify({}, null, 2), 'utf-8');
      return {};
    }
    const raw = fs.readFileSync(SETTINGS_FILE_PATH, 'utf-8');
    return JSON.parse(raw) || {};
  } catch (e) {
    console.error('Error reading settings file:', e);
    return {};
  }
}

export function readLocalSetting<T>(key: string, defaultValue: T): T {
  const all = ensureSettingsFile();
  return all[key] !== undefined ? (all[key] as T) : defaultValue;
}

export function writeLocalSetting(key: string, value: any): void {
  try {
    const all = ensureSettingsFile();
    all[key] = value;
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(all, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing settings file:', e);
  }
}

export async function getSiteSettingWithStatus<T>(key: string, defaultValue: T): Promise<{ value: T; tableMissing?: boolean }> {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from('site_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (error) {
      const isMissing = error.code === 'PGRST205' || error.message?.includes('does not exist');
      return { value: readLocalSetting<T>(key, defaultValue), tableMissing: isMissing };
    }

    if (data?.value !== undefined && data?.value !== null) {
      if (typeof data.value === 'string') {
        try {
          return { value: JSON.parse(data.value) as T };
        } catch {
          return { value: data.value as unknown as T };
        }
      }
      return { value: data.value as T };
    }
  } catch (err: any) {
    const isMissing = err?.code === 'PGRST205';
    return { value: readLocalSetting<T>(key, defaultValue), tableMissing: isMissing };
  }

  return { value: readLocalSetting<T>(key, defaultValue) };
}

export async function getSiteSetting<T>(key: string, defaultValue: T): Promise<T> {
  const res = await getSiteSettingWithStatus<T>(key, defaultValue);
  return res.value;
}

export async function saveSiteSetting(key: string, value: any): Promise<{ success: boolean; error?: string; code?: string }> {
  // 1. Always save to local persistent file
  writeLocalSetting(key, value);

  // 2. Try to save to Supabase site_settings
  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin.from('site_settings').upsert({
      key,
      value,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.warn(`[site_settings] Note: Supabase write for key "${key}" (${error.code}: ${error.message}). Local storage active.`);
      return { success: false, error: error.message, code: error.code };
    }
    return { success: true };
  } catch (e: any) {
    console.warn(`[site_settings] Supabase write skipped, stored in local storage:`, e?.message || e);
    return { success: false, error: e?.message || String(e), code: e?.code };
  }
}
