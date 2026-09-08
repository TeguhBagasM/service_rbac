import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/AppError.js";
import type { CreateRoleInput, UpdateRoleInput } from "./schema.js";

export async function listRoles() {
  return prisma.role.findMany({
    include: { _count: { select: { users: true, menus: true } } },
    orderBy: { id: "asc" },
  });
}

export async function createRole(data: CreateRoleInput) {
  return prisma.role.create({ data });
}

export async function updateRole(id: number, data: UpdateRoleInput) {
  const existing = await prisma.role.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "Role tidak ditemukan");

  const updates: Prisma.RoleUncheckedUpdateInput = {};
  if (data.name !== undefined) updates.name = data.name;

  return prisma.role.update({ where: { id }, data: updates });
}
