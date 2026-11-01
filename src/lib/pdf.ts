import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export function esc(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function exportHtmlAsPdf(html: string, title: string): Promise<{ ok: boolean; message?: string }> {
  try {
    if (Platform.OS === 'web') {
      await Print.printAsync({ html });
      return { ok: true };
    }
    const { uri } = await Print.printToFileAsync({ html, width: 612, height: 792 });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: title });
      return { ok: true };
    }
    return { ok: false, message: 'Sharing is not available on this device.' };
  } catch {
    return { ok: false, message: 'The PDF could not be created. Please try again.' };
  }
}
