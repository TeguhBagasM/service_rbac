import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { comparePassword, hashPassword } from "../../utils/hash.js";
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshExpiryMs,
  hashToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";
import { sendCredentialEmail } from "../../utils/mailer.js";
import { generateRandomPassword } from "../../utils/password.js";
import type { ChangePasswordInput, LoginInput, RegisterInput } from "./schema.js";

interface TokenUser {
  id: number;
  roleId: number | null;
  roleName: string | null;
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

async function issueTokens(user: TokenUser) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
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

  const plainPassword = generateRandomPassword();
  const passwordHash = await hashPassword(plainPassword);
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      isInternal: false,
      roleId: participantRole?.id ?? null,
    },
  });

  sendCredentialEmail(user.email, plainPassword);

  return toPublicUser(user);
}

export async function login(data: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    include: { role: true },
  });

  if (!user || !user.isActive || !(await comparePassword(data.password, user.passwordHash))) {
    throw new AppError(401, "Email atau password salah");
  }

  const tokens = await issueTokens({
    id: user.id,
    roleId: user.roleId,
    roleName: user.role?.name ?? null,
  });

  return { ...tokens, user: toPublicUser(user) };
}

export async function refresh(refreshToken: string) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(401, "Refresh token tidak valid");
  }

  if (payload.type !== "refresh") throw new AppError(401, "Token bukan refresh token");

  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(refreshToken) },
  });
  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw new AppError(401, "Refresh token tidak valid atau sudah digunakan");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { role: true },
  });
  if (!user || !user.isActive) throw new AppError(401, "User tidak aktif atau tidak ditemukan");

  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });

  return issueTokens({
    id: user.id,
    roleId: user.roleId,
    roleName: user.role?.name ?? null,
  });
}

export async function logout(refreshToken: string) {
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashToken(refreshToken), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function changePassword(userId: number, data: ChangePasswordInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, "User tidak ditemukan");

  const ok = await comparePassword(data.oldPassword, user.passwordHash);
  if (!ok) throw new AppError(400, "Password lama salah");

  const passwordHash = await hashPassword(data.newPassword);

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
    prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
}

export async function getMe(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      roleId: true,
      isActive: true,
      isInternal: true,
      createdAt: true,
      role: {
        select: {
          name: true,
          menus: {
            select: {
              menuId: true,
              canRead: true,
              canWrite: true,
              menu: { select: { name: true, path: true } },
            },
          },
        },
      },
    },
  });

  if (!user) throw new AppError(404, "User tidak ditemukan");

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    roleId: user.roleId,
    isActive: user.isActive,
    isInternal: user.isInternal,
    createdAt: user.createdAt,
    role: user.role
      ? {
          name: user.role.name,
          menus: user.role.menus.map((m) => ({
            id: m.menuId,
            name: m.menu.name,
            path: m.menu.path,
            canRead: m.canRead,
            canWrite: m.canWrite,
          })),
        }
      : null,
  };
}