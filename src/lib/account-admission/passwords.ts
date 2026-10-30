import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

const KEY_LENGTH = 64;
const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt}$${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string | null | undefined): Promise<boolean> {
  if (!storedHash) {
    return false;
  }

  const parts = storedHash.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") {
    return false;
  }

  const salt = parts[4];
  const expectedHex = parts[5];
  if (!salt || !expectedHex) {
    return false;
  }

  const expectedBuffer = Buffer.from(expectedHex, "hex");
  const derivedKey = (await scrypt(password, salt, expectedBuffer.length)) as Buffer;

  if (derivedKey.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(derivedKey, expectedBuffer);
}
