const ITERATIONS = 100_000
const KEY_LENGTH = 32
const SALT_LENGTH = 16

async function deriveKey(password: string, salt: Uint8Array): Promise<ArrayBuffer> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  return crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    KEY_LENGTH * 8
  )
}

function toBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
}

function fromBase64(str: string): Uint8Array {
  return Uint8Array.from(atob(str), (c) => c.charCodeAt(0))
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  const hash = new Uint8Array(await deriveKey(password, salt))
  const combined = new Uint8Array(SALT_LENGTH + KEY_LENGTH)
  combined.set(salt)
  combined.set(hash, SALT_LENGTH)
  return toBase64(combined)
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const combined = fromBase64(stored)
    const salt = combined.slice(0, SALT_LENGTH)
    const storedHash = combined.slice(SALT_LENGTH)
    const hash = new Uint8Array(await deriveKey(password, salt))
    if (hash.length !== storedHash.length) return false
    let diff = 0
    for (let i = 0; i < hash.length; i++) diff |= hash[i] ^ storedHash[i]
    return diff === 0
  } catch {
    return false
  }
}
