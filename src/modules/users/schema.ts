import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter").max(72),
  roleId: z.number().int().positive("roleId harus angka positif").optional(),
});

export const updateUserSchema = createUserSchema
  .partial()
  .refine((v) => Object.keys(v).length > 0, { message: "Minimal satu field untuk diubah" });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
