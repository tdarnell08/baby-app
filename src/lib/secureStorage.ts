import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const CHUNK = 700;
const options: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

const useNative = Platform.OS !== 'web';

// Last pieces written per key in this session, so a save only touches chunks that changed.
const written = new Map<string, string[]>();

function metaKey(key: string) {
  return `${key}.n`;
}

function chunkKey(key: string, i: number) {
  return `${key}.${i}`;
}

export async function secureGet(key: string): Promise<string | null> {
  if (!useNative) return AsyncStorage.getItem(key);
  const count = Number(await SecureStore.getItemAsync(metaKey(key), options));
  if (!Number.isInteger(count) || count < 1 || count > 200) return null;
  const parts: string[] = [];
  for (let i = 0; i < count; i++) {
    const part = await SecureStore.getItemAsync(chunkKey(key, i), options);
    if (part === null) return null;
    parts.push(part);
  }
  written.set(key, parts);
  return parts.join('');
}

export async function secureDelete(key: string): Promise<void> {
  if (!useNative) {
    await AsyncStorage.removeItem(key);
    return;
  }
  written.delete(key);
  const count = Number(await SecureStore.getItemAsync(metaKey(key), options));
  const total = Number.isInteger(count) && count > 0 ? Math.min(count, 200) : 0;
  for (let i = 0; i < total; i++) await SecureStore.deleteItemAsync(chunkKey(key, i), options);
  await SecureStore.deleteItemAsync(metaKey(key), options);
}

export async function secureSet(key: string, value: string): Promise<void> {
  if (!useNative) {
    await AsyncStorage.setItem(key, value);
    return;
  }
  const previous = Number(await SecureStore.getItemAsync(metaKey(key), options));
  const pieces: string[] = [];
  for (let i = 0; i < value.length; i += CHUNK) pieces.push(value.slice(i, i + CHUNK));
  if (pieces.length === 0) pieces.push('');
  const known = written.get(key);
  for (let i = 0; i < pieces.length; i++) {
    if (known && known[i] === pieces[i]) continue;
    await SecureStore.setItemAsync(chunkKey(key, i), pieces[i], options);
  }
  await SecureStore.setItemAsync(metaKey(key), String(pieces.length), options);
  written.set(key, pieces);
  if (Number.isInteger(previous) && previous > pieces.length) {
    for (let i = pieces.length; i < Math.min(previous, 200); i++) {
      await SecureStore.deleteItemAsync(chunkKey(key, i), options);
    }
  }
}

export async function migrateFromAsyncStorage(legacyKey: string, secureKey: string): Promise<string | null> {
  const existing = await secureGet(secureKey);
  if (existing !== null) return existing;
  if (!useNative) return null;
  const legacy = await AsyncStorage.getItem(legacyKey);
  if (legacy === null) return null;
  await secureSet(secureKey, legacy);
  await AsyncStorage.removeItem(legacyKey);
  return legacy;
}
