import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/AppError.js";
import { env } from "../config/env.js";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ success: false, message: `Route tidak ditemukan: ${req.method} ${req.path}` });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    const details = err.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
    res.status(400).json({ success: false, message: "Validasi gagal", errors: details });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      res.status(409).json({ success: false, message: "Konflik: data sudah ada (duplikat)" });
      return;
    }
    if (err.code === "P2025") {
      res.status(404).json({ success: false, message: "Resource tidak ditemukan" });
      return;
    }
  }

  if (err instanceof AppError) {
    res.status(err.status).json({ success: false, message: err.message });
    return;
  }

  const message =
    env.NODE_ENV === "production"
      ? "Terjadi kesalahan internal server"
      : err instanceof Error
        ? err.message
        : "Terjadi kesalahan internal server";

  if (env.NODE_ENV !== "production") {
    console.error("[error]", err);
  }

  res.status(500).json({ success: false, message });
}
