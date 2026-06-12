import { md5 } from 'js-md5'
import type { NavidromeConfig } from '../types/navidrome'

const SALT_BYTES = 16

export interface SubsonicAuthParams {
  u: string
  t: string
  s: string
}

function createSubsonicSalt(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function buildSubsonicToken(password: string, salt: string): string {
  return md5(password + salt)
}

export function buildSubsonicAuthParams(config: NavidromeConfig): SubsonicAuthParams {
  const salt = createSubsonicSalt()

  return {
    u: config.username,
    t: buildSubsonicToken(config.password, salt),
    s: salt,
  }
}
