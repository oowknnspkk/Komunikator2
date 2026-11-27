import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

const PREFIX = 'enc:v1:'

function getKey(): Buffer {
  const secret = process.env.MESSAGE_ENCRYPTION_KEY

  if (!secret || !/^[a-fA-F0-9]{64}$/.test(secret)) {
    throw new Error('MESSAGE_ENCRYPTION_KEY musi być 64-znakowym kluczem hex (32 bajty).')
  }

  return Buffer.from(secret, 'hex')
}

export function encryptMessage(content: string): string {
  const key = getKey()
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, iv)

  const ciphertext = Buffer.concat([
    cipher.update(content, 'utf8'),
    cipher.final(),
  ])
  const authTag = cipher.getAuthTag()

  return `${PREFIX}${iv.toString('base64')}:${authTag.toString('base64')}:${ciphertext.toString('base64')}`
}

export function decryptMessage(storedContent: string): string {
  if (!storedContent.startsWith(PREFIX)) {
    return storedContent
  }

  try {
    const payload = storedContent.slice(PREFIX.length)
    const [ivPart, authTagPart, ciphertextPart, ...extra] = payload.split(':')

    if (!ivPart || !authTagPart || !ciphertextPart || extra.length > 0) {
      throw new Error('Niepoprawny format zaszyfrowanej wiadomości.')
    }

    const key = getKey()
    const decipher = createDecipheriv(
      'aes-256-gcm',
      key,
      Buffer.from(ivPart, 'base64'),
    )

    decipher.setAuthTag(Buffer.from(authTagPart, 'base64'))

    return Buffer.concat([
      decipher.update(Buffer.from(ciphertextPart, 'base64')),
      decipher.final(),
    ]).toString('utf8')
  } catch {
    throw new Error('Nie udało się odszyfrować wiadomości.')
  }
}
