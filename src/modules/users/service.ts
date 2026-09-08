import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { hashPassword } from "../../utils/hash.js";
import { sendCredentialEmail } from "../../utils/mailer.js";
import { generateRandomPassword } from "../../utils/password.js";
import type { CreateUserInput, UpdateUserInput } from "./schema.js";

const applicantRoleName = "Calon Peserta";

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  isActive: true,
  isInternal: true,
  roleId: true,
  createdAt: true,
  role: { select: { id: true, name: true } },
} as const;

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

async function getInternalRoleOrThrow(roleId: number) {
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) throw new AppError(400, "Role tidak ditemukan");
  if (role.name === applicantRoleName) {
    throw new AppError(400, "roleId harus role internal, bukan role peserta");
  }
  return role;
}

export async function listUsers(page: number, limit: number) {
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: publicUserSelect,
      orderBy: { id: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count(),
  ]);

  const pagination: Pagination = { page, limit, total, totalPages: Math.ceil(total / limit) };

  return { users, pagination };
}

export async function getUserById(id: number) {
  const user = await prisma.user.findUnique({ where: { id }, select: publicUserSelect });
  if (!user) throw new AppError(404, "User tidak ditemukan");
  return user;
}

export async function createUser(data: CreateUserInput) {
  const role = await getInternalRoleOrThrow(data.roleId);

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new AppError(409, "Email sudah terdaftar");

  const temporaryPassword = generateRandomPassword();
  const passwordHash = await hashPassword(temporaryPassword);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      isInternal: true,
      roleId: role.id,
    },
    select: publicUserSelect,
  });

  sendCredentialEmail(user.email, temporaryPassword);

  return user;
}

export async function updateUser(id: number, actorId: number, data: UpdateUserInput) {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "User tidak ditemukan");

  if (data.isActive === false && id === actorId) {
    throw new AppError(400, "Tidak dapat menonaktifkan akun sendiri");
  }

  if (data.roleId !== undefined) {
    await getInternalRoleOrThrow(data.roleId);
  }

  const updates: Prisma.UserUncheckedUpdateInput = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.roleId !== undefined) updates.roleId = data.roleId;
  if (data.isActive !== undefined) updates.isActive = data.isActive;

  return prisma.user.update({ where: { id }, data: updates, select: publicUserSelect });
}

export async function removeUser(id: number, actorId: number) {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "User tidak ditemukan");

  if (id === actorId) {
    throw new AppError(400, "Tidak dapat menghapus akun sendiri");
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id }, data: { isActive: false } }),
    prisma.refreshToken.updateMany({
      where: { userId: id, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
}
