import { createHash, randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface TokenPayload {
  userId: number;
  roleId: number | null;
  roleName: string | null;
  type: "access" | "refresh";
}

export interface TokenUser {
  id: number;
  roleId: number | null;
  roleName: string | null;
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

export function generateAccessToken(user: TokenUser): string {
  const payload: TokenPayload = {
    userId: user.id,
    roleId: user.roleId,
    roleName: user.roleName,
    type: "access",
  };
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: durationToSeconds(env.JWT_ACCESS_EXPIRES, DEFAULT_ACCESS_SECONDS),
  });
}

export function generateRefreshToken(user: TokenUser): string {
  const payload: TokenPayload = {
    userId: user.id,
    roleId: user.roleId,
    roleName: user.roleName,
    type: "refresh",
  };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: durationToSeconds(env.JWT_REFRESH_EXPIRES, DEFAULT_REFRESH_SECONDS),
    jwtid: randomUUID(),
  });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
}

export function getRefreshExpiryMs(): number {
  return durationToSeconds(env.JWT_REFRESH_EXPIRES, DEFAULT_REFRESH_SECONDS) * 1000;
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}