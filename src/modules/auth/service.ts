import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { hashPassword, verifyPassword } from "../../utils/bcrypt.js";
import {
  getRefreshExpiryMs,
  signAccessToken,
  signRefreshToken,
  verifyToken,
} from "../../utils/jwt.js";
import type { LoginInput, RegisterInput } from "./schema.js";

interface UserClaims {
  id: number;
  email: string;
  roleId: number | null;
}

interface PublicUser {
  id: number;
  name: string;
  email: string;
  roleId: number | null;
  isInternal: boolean;
  createdAt: Date;
}

function toPublicUser(user: PublicUser): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    roleId: user.roleId,
    isInternal: user.isInternal,
    createdAt: user.createdAt,
  };
}

async function issueTokens(user: UserClaims) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + getRefreshExpiryMs()),
    },
  });

  return { accessToken, refreshToken };
}

export async function register(data: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new AppError(409, "Email sudah terdaftar");

  const participantRole = await prisma.role.findUnique({ where: { name: "Calon Peserta" } });

  const passwordHash = await hashPassword(data.password);
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      isInternal: false,
      roleId: participantRole?.id ?? null,
    },
  });

  return toPublicUser(user);
}

export async function login(data: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    include: { role: true },
  });

  if (!user) throw new AppError(401, "Email atau password salah");
  const ok = await verifyPassword(data.password, user.passwordHash);
  if (!ok) throw new AppError(401, "Email atau password salah");

  const tokens = await issueTokens({ id: user.id, email: user.email, roleId: user.roleId });

  return { ...tokens, user: toPublicUser(user) };
}

export async function refresh(refreshToken: string) {
  let payload;
  try {
    payload = verifyToken(refreshToken);
  } catch {
    throw new AppError(401, "Refresh token tidak valid");
  }

  if (payload.type !== "refresh") throw new AppError(401, "Token bukan refresh token");

  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw new AppError(401, "Refresh token tidak valid atau sudah digunakan");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) throw new AppError(401, "User tidak ditemukan");

  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });

  return issueTokens({ id: user.id, email: user.email, roleId: user.roleId });
}

export async function logout(refreshToken: string) {
  await prisma.refreshToken.updateMany({
    where: { token: refreshToken, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
