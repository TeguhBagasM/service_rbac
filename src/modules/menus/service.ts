import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/AppError.js";
import type { CreateMenuInput, UpdateMenuInput } from "./schema.js";

export async function listMenus() {
  return prisma.menu.findMany({
    include: { _count: { select: { roles: true } } },
    orderBy: { id: "asc" },
  });
}

export async function createMenu(data: CreateMenuInput) {
  return prisma.menu.create({ data });
}

export async function updateMenu(id: number, data: UpdateMenuInput) {
  const existing = await prisma.menu.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "Menu tidak ditemukan");

  const updates: Prisma.MenuUpdateInput = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.path !== undefined) updates.path = data.path;

  return prisma.menu.update({ where: { id }, data: updates });
}

export async function removeMenu(id: number) {
  const menu = await prisma.menu.findUnique({ where: { id } });
  if (!menu) throw new AppError(404, "Menu tidak ditemukan");

  const accessCount = await prisma.roleMenuAccess.count({ where: { menuId: id } });
  if (accessCount > 0) {
    throw new AppError(
      400,
      `Menu "${menu.name}" masih dipakai di pengaturan akses oleh ${accessCount} role. Hapus akses menu ini dari semua role terlebih dahulu sebelum menghapus menu.`,
    );
  }

  await prisma.menu.delete({ where: { id } });
}
