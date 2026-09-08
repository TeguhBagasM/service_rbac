import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/AppError.js";
import type { CreateRoleInput, RoleMenuAccessInput, UpdateRoleInput } from "./schema.js";

async function getRoleOrThrow(id: number) {
  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) throw new AppError(404, "Role tidak ditemukan");
  return role;
}

async function assertRoleNameAvailable(name: string, excludedRoleId?: number) {
  const duplicate = await prisma.role.findUnique({ where: { name } });
  if (duplicate && duplicate.id !== excludedRoleId) {
    throw new AppError(409, `Role dengan nama "${name}" sudah digunakan`);
  }
}

export async function listRoles() {
  return prisma.role.findMany({
    include: { _count: { select: { users: true, menus: true } } },
    orderBy: { id: "asc" },
  });
}

export async function createRole(data: CreateRoleInput) {
  await assertRoleNameAvailable(data.name);
  return prisma.role.create({ data });
}

export async function updateRole(id: number, data: UpdateRoleInput) {
  await getRoleOrThrow(id);
  await assertRoleNameAvailable(data.name, id);
  return prisma.role.update({ where: { id }, data: { name: data.name } });
}

export async function removeRole(id: number) {
  const role = await getRoleOrThrow(id);

  const userCount = await prisma.user.count({ where: { roleId: id } });
  if (userCount > 0) {
    throw new AppError(
      400,
      `Role "${role.name}" masih digunakan oleh ${userCount} user. Pindahkan atau nonaktifkan user yang memakai role ini terlebih dahulu sebelum menghapus role.`,
    );
  }

  await prisma.$transaction([
    prisma.roleMenuAccess.deleteMany({ where: { roleId: id } }),
    prisma.role.delete({ where: { id } }),
  ]);
}

export async function listRoleMenus(roleId: number) {
  await getRoleOrThrow(roleId);

  const access = await prisma.roleMenuAccess.findMany({
    where: { roleId },
    include: { menu: true },
    orderBy: { menuId: "asc" },
  });

  return access.map((a) => ({
    menuId: a.menuId,
    canRead: a.canRead,
    canWrite: a.canWrite,
    menu: { id: a.menu.id, name: a.menu.name, path: a.menu.path },
  }));
}

export async function replaceRoleMenus(roleId: number, access: RoleMenuAccessInput[]) {
  await getRoleOrThrow(roleId);

  const requestedMenuIds = access.map((a) => a.menuId);
  const existingMenus = await prisma.menu.findMany({
    where: { id: { in: requestedMenuIds } },
    select: { id: true },
  });
  const existingMenuIds = new Set(existingMenus.map((m) => m.id));
  const missingMenuIds = requestedMenuIds.filter((id) => !existingMenuIds.has(id));
  if (missingMenuIds.length > 0) {
    throw new AppError(400, `Menu dengan id berikut tidak ditemukan: ${missingMenuIds.join(", ")}`);
  }

  await prisma.$transaction(async (tx) => {
    await tx.roleMenuAccess.deleteMany({ where: { roleId } });
    if (access.length > 0) {
      await tx.roleMenuAccess.createMany({
        data: access.map((a) => ({
          roleId,
          menuId: a.menuId,
          canRead: a.canRead,
          canWrite: a.canWrite,
        })),
      });
    }
  });

  return listRoleMenus(roleId);
}
