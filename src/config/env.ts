import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(5001),
  DATABASE_URL: z.string().min(1, "DATABASE_URL wajib diisi"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET wajib diisi (min 32 karakter)"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET wajib diisi (min 32 karakter)"),
  JWT_ACCESS_EXPIRES: z.string().default("15m"),
  JWT_REFRESH_EXPIRES: z.string().default("7d"),
  BCRYPT_COST: z.coerce.number().int().min(10).default(12),
  CORS_ORIGIN: z.string().min(1, "CORS_ORIGIN wajib diisi"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("==========================================");
  console.error("FAILED TO START: validasi environment variable gagal.");
  console.error("Cek file .env kamu — wajib ada: DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, CORS_ORIGIN.");
  for (const issue of parsed.error.issues) {
    const path = issue.path.join(".");
    console.error(`  - [${path}] ${issue.message}`);
  }
  console.error("==========================================");
  throw new Error("Invalid environment variables — service tidak bisa start");
}

export const env = parsed.data;
