import { API_BASE, ApiResponse } from './api-client';

interface NonceResult {
  nonce: string;
  publicKey: string;
}

/**
 * 从后端获取一次性 nonce 和 RSA 公钥
 */
async function getNonceAndPublicKey(): Promise<NonceResult> {
  const url = `${API_BASE}/auth/nonce`;
  const res = await fetch(url, { method: 'GET' });

  if (!res.ok) {
    throw new Error(`获取加密参数失败 (${res.status})`);
  }

  const json: ApiResponse<NonceResult> = await res.json();
  if (json.code !== 200 || !json.data) {
    throw new Error(json.message || '获取加密参数失败');
  }

  return json.data;
}

/**
 * 将 PEM 格式的公钥导入为 CryptoKey
 */
async function importPublicKey(pem: string): Promise<CryptoKey> {
  // 去除 PEM 头尾标记和换行符
  const pemHeader = '-----BEGIN PUBLIC KEY-----';
  const pemFooter = '-----END PUBLIC KEY-----';
  const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length).replace(/\n/g, '').replace(/\r/g, '');

  // Base64 解码
  const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

  // 导入为 CryptoKey
  return crypto.subtle.importKey(
    'spki',
    binaryDer.buffer,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt']
  );
}

/**
 * 使用 RSA 公钥加密明文
 */
async function encryptWithPublicKey(plaintext: string, publicKeyPem: string): Promise<string> {
  const publicKey = await importPublicKey(publicKeyPem);
  const encoded = new TextEncoder().encode(plaintext);

  const encrypted = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    encoded
  );

  // 将 ArrayBuffer 转为 Base64
  const bytes = new Uint8Array(encrypted);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * 准备安全加密数据
 * 1. 获取 nonce 和 RSA 公钥
 * 2. 将 fields 用 "|" 拼接并在末尾追加 nonce
 * 3. 使用 RSA-OAEP-256 加密
 * 4. 返回加密后的数据和 nonce
 *
 * @param fields 需要加密的字段（如密码、确认密码等）
 */
export async function prepareSecureData(...fields: string[]): Promise<{ encryptedData: string; nonce: string }> {
  if (fields.length === 0) {
    throw new Error('至少需要提供一个加密字段');
  }

  const { nonce, publicKey } = await getNonceAndPublicKey();

  // 将字段用 "|" 拼接，末尾追加 nonce
  const plaintext = fields.join('|') + '|' + nonce;

  const encryptedData = await encryptWithPublicKey(plaintext, publicKey);

  return { encryptedData, nonce };
}
