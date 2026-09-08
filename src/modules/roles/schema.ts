import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.string().min(2, "Nama role minimal 2 karakter").max(50),
});

export const updateRoleSchema = createRoleSchema
  .partial()
  .refine((v) => Object.keys(v).length > 0, { message: "Minimal satu field untuk diubah" });

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
