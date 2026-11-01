import { Platform } from 'react-native';
import { Directory, File, Paths } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { deleteFileQuietly } from '@/lib/files';

const isWeb = Platform.OS === 'web';
export const MEDIA_DIR = 'lulla-media';
const MAX_PHOTO_WIDTH = 1200;
const MAX_READABLE_WIDTH = 1800;

function nextName(ext: string) {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
}

function mediaDirectory() {
  const dir = new Directory(Paths.document, MEDIA_DIR);
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
}

async function blobToDataUri(uri: string): Promise<string> {
  const blob = await (await fetch(uri)).blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function savePhoto(uri: string, width?: number, readable = false): Promise<string> {
  const target = isWeb ? (readable ? 900 : 640) : readable ? MAX_READABLE_WIDTH : MAX_PHOTO_WIDTH;
  const context = ImageManipulator.manipulate(uri);
  if (width && width > target) context.resize({ width: target });
  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: isWeb ? 0.6 : 0.7, base64: isWeb });
  if (isWeb) return `data:image/jpeg;base64,${saved.base64 ?? ''}`;
  const source = new File(saved.uri);
  const name = nextName('jpg');
  await source.copy(new File(mediaDirectory(), name));
  deleteFileQuietly(saved.uri);
  return name;
}

export async function saveAudio(uri: string): Promise<string> {
  if (isWeb) return blobToDataUri(uri);
  const source = new File(uri);
  const name = nextName('m4a');
  await source.copy(new File(mediaDirectory(), name));
  deleteFileQuietly(uri);
  return name;
}

const NAME_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{3,59}$/;

// Native refs are bare file names so they survive iOS container path changes after an app update.
export function mediaUri(ref: string): string {
  if (ref.startsWith('data:') || isWeb) return ref;
  return new File(Paths.document, MEDIA_DIR, ref).uri;
}

export function deleteMedia(ref: string | null | undefined) {
  if (!ref || ref.startsWith('data:')) return;
  deleteFileQuietly(mediaUri(ref));
}

export function isValidMediaRef(ref: unknown, kind: 'image' | 'audio'): ref is string {
  if (typeof ref !== 'string') return false;
  if (ref.startsWith(kind === 'image' ? 'data:image/jpeg;base64,' : 'data:audio/')) {
    return isWeb && ref.length <= 900_000;
  }
  return !isWeb && NAME_RE.test(ref);
}

export async function photoForPdf(ref: string): Promise<string | null> {
  try {
    if (ref.startsWith('data:')) return ref;
    const rendered = await ImageManipulator.manipulate(mediaUri(ref)).resize({ width: 700 }).renderAsync();
    const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.6, base64: true });
    deleteFileQuietly(saved.uri);
    return saved.base64 ? `data:image/jpeg;base64,${saved.base64}` : null;
  } catch {
    return null;
  }
}

export async function wipeMediaFiles() {
  if (isWeb) return;
  try {
    const dir = new Directory(Paths.document, MEDIA_DIR);
    if (dir.exists) dir.delete();
  } catch {
    // already removed
  }
}
