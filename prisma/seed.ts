import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL ?? "");
const prisma = new PrismaClient({ adapter });

async function main() {
  const roles = [
    { id: 1, name: "Admin" },
    { id: 2, name: "Verifikator" },
    { id: 3, name: "Lembaga Seleksi" },
    { id: 4, name: "Calon Peserta" },
  ];

  const menus = [
    { id: 1, name: "Dashboard", path: "/dashboard" },
    { id: 2, name: "Hasil Seleksi", path: "/hasil-seleksi" },
    { id: 3, name: "Data Master", path: "/data-master" },
    { id: 4, name: "Setting", path: "/setting" },
    { id: 5, name: "Verifikasi Administrasi", path: "/verifikasi" },
    { id: 6, name: "Proses Wawancara", path: "/wawancara" },
  ];

  for (const menu of menus) {
    await prisma.menu.upsert({
      where: { id: menu.id },
      update: { name: menu.name, path: menu.path },
      create: menu,
    });
  }

  for (const role of roles) {
    await prisma.role.upsert({
      where: { id: role.id },
      update: { name: role.name },
      create: role,
    });
  }

  const accessRules = [
    { roleId: 1, menuIds: [1, 2, 3, 4], read: true, write: true },
    { roleId: 2, menuIds: [5], read: true, write: true },
    { roleId: 3, menuIds: [6], read: true, write: true },
    { roleId: 4, menuIds: [], read: false, write: false },
  ];

  for (const rule of accessRules) {
    for (const menuId of rule.menuIds) {
      await prisma.roleMenuAccess.upsert({
        where: { roleId_menuId: { roleId: rule.roleId, menuId } },
        update: { canRead: rule.read, canWrite: rule.write },
        create: { roleId: rule.roleId, menuId, canRead: rule.read, canWrite: rule.write },
      });
    }
  }

  const adminEmail = "admin@beasiswa.test";
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const passwordHash = await bcrypt.hash("Admin@123", 12);
    await prisma.user.create({
      data: {
        name: "Administrator",
        email: adminEmail,
        passwordHash,
        isInternal: true,
        roleId: 1,
      },
    });
    console.log(`Seed: created admin user (${adminEmail})`);
  }

  console.log("Seed selesai: roles, menus, role_menu_access, dan admin user.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
