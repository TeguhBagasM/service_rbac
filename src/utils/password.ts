import { randomInt } from "node:crypto";

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%^&*-_=+?";
const ALL = UPPER + LOWER + DIGITS + SYMBOLS;

export function generateRandomPassword(length = 16): string {
  if (length < 12) length = 12;

  const chars: string[] = [UPPER, LOWER, DIGITS, SYMBOLS].map((pool) =>
    pool.charAt(randomInt(pool.length)),
  );

  while (chars.length < length) {
    chars.push(ALL.charAt(randomInt(ALL.length)));
  }

  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    const a = chars[i]!;
    const b = chars[j]!;
    chars[i] = b;
    chars[j] = a;
  }

  return chars.join("");
}