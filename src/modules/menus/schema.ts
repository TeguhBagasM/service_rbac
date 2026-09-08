import { z } from "zod";

export const createMenuSchema = z.object({
  name: z.string().min(2, "Nama menu minimal 2 karakter").max(100),
  path: z.string().min(1, "Path wajib diisi").max(255),
});

export const updateMenuSchema = createMenuSchema
  .partial()
  .refine((v) => Object.keys(v).length > 0, { message: "Minimal satu field untuk diubah" });

export type CreateMenuInput = z.infer<typeof createMenuSchema>;
export type UpdateMenuInput = z.infer<typeof updateMenuSchema>;
