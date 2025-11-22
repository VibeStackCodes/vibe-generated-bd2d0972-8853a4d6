// Lightweight, offline-friendly crypto wrapper using Web Crypto API
// NOTE: Keys are stored in localStorage for offline usage only.

const KEY_STORAGE = 'NimbusCalc_crypto_key';
const HISTORY_CIPHER = 'NimbusCalc_history';

function ab2b64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer;
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function b64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getKey(): Promise<CryptoKey> {
  const stored = localStorage.getItem(KEY_STORAGE);
  if (stored) {
    const rawKey = b64ToBytes(stored);
    return crypto.subtle.importKey('raw', rawKey, 'AES-GCM', true, ['encrypt', 'decrypt']);
  }
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  const raw = await crypto.subtle.exportKey('raw', key);
  const b64 = ab2b64(raw);
  localStorage.setItem(KEY_STORAGE, b64);
  return key;
}

async function encryptText(plainText: string): Promise<string> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(plainText));
  const ivB64 = ab2b64(iv);
  const ctB64 = ab2b64(enc);
  return ivB64 + ':' + ctB64;
}

async function decryptText(cipherText: string): Promise<string> {
  const [ivB64, ctB64] = cipherText.split(':');
  if (!ivB64 || !ctB64) throw new Error('Invalid cipher text');
  const key = await getKey();
  const iv = b64ToBytes(ivB64);
  const ct = b64ToBytes(ctB64);
  const dec = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, ct);
  return new TextDecoder().decode(dec);
}

export { encryptText, decryptText };
