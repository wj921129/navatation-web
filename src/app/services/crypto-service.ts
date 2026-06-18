import forge from 'node-forge'
import { API_BASE, type ApiResponse } from './api-client'

interface NonceResult {
  nonce: string
  publicKey: string
}

/**
 * 从后端获取一次性 nonce 和 RSA 公钥
 */
async function getNonceAndPublicKey(): Promise<NonceResult> {
  const url = `${API_BASE}/auth/nonce`
  const res = await fetch(url, { method: 'GET' })

  if (!res.ok) {
    throw new Error(`获取加密参数失败 (${res.status})`)
  }

  const json: ApiResponse<NonceResult> = await res.json()
  if (json.code !== 200 || !json.data) {
    throw new Error(json.message || '获取加密参数失败')
  }

  return json.data
}

/**
 * 将 PEM 格式的公钥导入为 CryptoKey（仅用于原生 Web Cryptography API）
 */
async function importPublicKey(pem: string): Promise<CryptoKey> {
  // 使用正则提取 Base64 内容，兼容不同的换行格式和额外空白
  const base64Match = pem.match(/-----BEGIN PUBLIC KEY-----[\s\S]*?-----END PUBLIC KEY-----/)
  if (!base64Match) {
    throw new Error('无法解析公钥 PEM 格式')
  }
  const pemContents = base64Match[0]
    .replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----/g, '')
    .replace(/\s/g, '')

  if (!pemContents) {
    throw new Error('公钥内容为空')
  }

  // Base64 解码
  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0))

  // 导入为 CryptoKey
  return crypto.subtle.importKey(
    'spki',
    binaryDer.buffer,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt'],
  )
}

/**
 * 使用 RSA 公钥加密明文（自动兼容原生与软件降级实现）
 */
async function encryptWithPublicKey(plaintext: string, publicKeyPem: string): Promise<string> {
  // 1. 若当前环境支持 Web Cryptography API（安全上下文，如 localhost 或 HTTPS），优先采用原生硬件加速
  if (window.crypto && window.crypto.subtle) {
    try {
      const publicKey = await importPublicKey(publicKeyPem)
      const encoded = new TextEncoder().encode(plaintext)

      const encrypted = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, publicKey, encoded)

      // 将 ArrayBuffer 转为 Base64
      const bytes = new Uint8Array(encrypted)
      let binary = ''
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i])
      }
      return btoa(binary)
    } catch (_err) {}
  }

  // 2. 降级方案：在非安全上下文（纯 HTTP 局域网访问）中使用 node-forge 进行 RSA-OAEP-256 加密
  try {
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem)
    const encrypted = publicKey.encrypt(plaintext, 'RSA-OAEP', {
      md: forge.md.sha256.create(),
      mgf1: {
        md: forge.md.sha256.create(),
      },
    })
    return forge.util.encode64(encrypted)
  } catch (_err) {
    throw new Error('加密计算失败，无法保证安全传输。')
  }
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
export async function prepareSecureData(
  ...fields: string[]
): Promise<{ encryptedData: string; nonce: string }> {
  if (fields.length === 0) {
    throw new Error('至少需要提供一个加密字段')
  }

  const { nonce, publicKey } = await getNonceAndPublicKey()

  // 将字段用 "|" 拼接，末尾追加 nonce
  const plaintext = fields.join('|') + '|' + nonce

  const encryptedData = await encryptWithPublicKey(plaintext, publicKey)

  return { encryptedData, nonce }
}
