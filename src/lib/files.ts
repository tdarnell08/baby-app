import { File } from 'expo-file-system';
import { Platform } from 'react-native';

export function deleteFileQuietly(uri: string | undefined) {
  if (!uri || Platform.OS === 'web') return;
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // already gone or not deletable
  }
}
