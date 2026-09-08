import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface TokenPayload {
  sub: string;
  userId: number;
  email: string;
  roleId: number | null;
  type: "access" | "refresh";
}

const DEFAULT_ACCESS_SECONDS = 15 * 60;
const DEFAULT_REFRESH_SECONDS = 7 * 24 * 60 * 60;

function durationToSeconds(value: string, fallback: number): number {
  const match = /^(\d+)([smhd])$/.exec(value);
  if (!match || !match[1] || !match[2]) return fallback;
  const unitSeconds: Record<string, number> = { s: 1, m: 60, h: 3_600, d: 86_400 };
  const unit = unitSeconds[match[2]];
  if (unit === undefined) return fallback;
  return Number(match[1]) * unit;
}

export function signAccessToken(user: { id: number; email: string; roleId: number | null }): string {
  const payload: TokenPayload = {
    sub: String(user.id),
    userId: user.id,
    email: user.email,
    roleId: user.roleId,
    type: "access",
  };
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: durationToSeconds(env.JWT_ACCESS_EXPIRES, DEFAULT_ACCESS_SECONDS),
  });
}

export function signRefreshToken(user: { id: number; email: string; roleId: number | null }): string {
  const payload: TokenPayload = {
    sub: String(user.id),
    userId: user.id,
    email: user.email,
    roleId: user.roleId,
    type: "refresh",
  };
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: durationToSeconds(env.JWT_REFRESH_EXPIRES, DEFAULT_REFRESH_SECONDS),
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}

export function getRefreshExpiryMs(): number {
  return durationToSeconds(env.JWT_REFRESH_EXPIRES, DEFAULT_REFRESH_SECONDS) * 1000;
}