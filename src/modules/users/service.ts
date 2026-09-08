import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { hashPassword } from "../../utils/bcrypt.js";
import type { CreateUserInput, UpdateUserInput } from "./schema.js";

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  roleId: true,
  isInternal: true,
  createdAt: true,
  role: { select: { name: true } },
} as const;

export async function listUsers() {
  return prisma.user.findMany({ select: publicUserSelect, orderBy: { id: "asc" } });
}

export async function getUserById(id: number) {
  const user = await prisma.user.findUnique({ where: { id }, select: publicUserSelect });
  if (!user) throw new AppError(404, "User tidak ditemukan");
  return user;
}

export async function createUser(data: CreateUserInput, isInternal = true) {
  if (data.roleId) {
    const role = await prisma.role.findUnique({ where: { id: data.roleId } });
    if (!role) throw new AppError(400, "Role tidak ditemukan");
  }

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new AppError(409, "Email sudah terdaftar");

  const passwordHash = await hashPassword(data.password);
  const user = await prisma.user.create({
    data: { name: data.name, email: data.email, passwordHash, isInternal, roleId: data.roleId ?? null },
    select: publicUserSelect,
  });
  return user;
}

export async function updateUser(id: number, data: UpdateUserInput) {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "User tidak ditemukan");

  if (data.roleId !== undefined) {
    const role = await prisma.role.findUnique({ where: { id: data.roleId } });
    if (!role) throw new AppError(400, "Role tidak ditemukan");
  }

  if (data.email) {
    const dup = await prisma.user.findUnique({ where: { email: data.email } });
    if (dup && dup.id !== id) throw new AppError(409, "Email sudah digunakan user lain");
  }

  const updates: Prisma.UserUncheckedUpdateInput = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.email !== undefined) updates.email = data.email;
  if (data.roleId !== undefined) updates.roleId = data.roleId;
  if (data.password !== undefined) updates.passwordHash = await hashPassword(data.password);

  const user = await prisma.user.update({
    where: { id },
    data: updates,
    select: publicUserSelect,
  });
  return user;
}

export async function removeUser(id: number) {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "User tidak ditemukan");

  await prisma.refreshToken.deleteMany({ where: { userId: id } });
  await prisma.user.delete({ where: { id } });
}
