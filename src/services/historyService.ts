import { encryptText, decryptText } from '@/lib/crypto';
import type { HistoryItem } from '@/types';

const HISTORY_KEY = 'NimbusCalc_history';

export async function loadHistory(): Promise<HistoryItem[]> {
  const enc = localStorage.getItem(HISTORY_KEY);
  if (!enc) return [];
  try {
    const json = await decryptText(enc);
    const data = JSON.parse(json) as HistoryItem[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function saveHistory(items: HistoryItem[]): Promise<void> {
  const json = JSON.stringify(items);
  const enc = await encryptText(json);
  localStorage.setItem(HISTORY_KEY, enc);
}

export async function addHistory(item: HistoryItem): Promise<void> {
  const list = await loadHistory();
  list.unshift(item);
  await saveHistory(list);
}

export async function clearHistory(): Promise<void> {
  localStorage.removeItem(HISTORY_KEY);
}
