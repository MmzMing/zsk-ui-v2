import JSEncrypt from 'jsencrypt'

/**
 * RSA 加密工具
 */

/**
 * 使用公钥加密字符串
 * @param text 待加密字符串
 * @param publicKey RSA 公钥
 * @returns 加密后的 Base64 字符串
 */
export function encrypt(text: string, publicKey: string): string {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKey)
  const encrypted = encryptor.encrypt(text)
  if (!encrypted) {
    throw new Error('加密失败')
  }
  return encrypted
}

/**
 * 快捷加密密码
 * @param password 原始密码
 * @param publicKey 后端返回的公钥
 */
export function encryptPassword(password: string, publicKey: string): string {
  return encrypt(password, publicKey)
}
