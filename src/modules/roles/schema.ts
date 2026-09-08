import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.string().min(2, "Nama role minimal 2 karakter").max(50),
});

export const updateRoleSchema = z.object({
  name: z.string().min(2, "Nama role minimal 2 karakter").max(50),
});

export const roleMenuAccessItemSchema = z.object({
  menuId: z.number().int().positive("menuId harus angka positif"),
  canRead: z.boolean(),
  canWrite: z.boolean(),
});

export const replaceRoleMenusSchema = z
  .array(roleMenuAccessItemSchema)
  .refine((access) => new Set(access.map((a) => a.menuId)).size === access.length, {
    message: "menuId tidak boleh duplikat di dalam request",
  });

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type RoleMenuAccessInput = z.infer<typeof roleMenuAccessItemSchema>;
