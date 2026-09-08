import { z } from "zod";

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1, "Page minimal 1").default(1),
  limit: z.coerce.number().int().min(1, "Limit minimal 1").max(100, "Limit maksimal 100").default(10),
});

export const createUserSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100),
  email: z.string().email("Email tidak valid"),
  roleId: z.number().int().positive("roleId harus angka positif"),
});

export const updateUserSchema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter").max(100).optional(),
    roleId: z.number().int().positive("roleId harus angka positif").optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, { message: "Minimal satu field untuk diubah" });

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
