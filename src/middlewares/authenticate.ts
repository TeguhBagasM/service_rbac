import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { verifyAccessToken } from "../utils/jwt.js";

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "Unauthorized: token tidak ditemukan" });
    return;
  }

  const token = header.slice(7);

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    res.status(401).json({ success: false, message: "Unauthorized: token tidak valid atau kedaluwarsa" });
    return;
  }

  if (payload.type !== "access") {
    res.status(401).json({ success: false, message: "Unauthorized: token bukan access token" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, roleId: true, role: { select: { name: true } } },
  });

  if (!user) {
    res.status(401).json({ success: false, message: "Unauthorized: user tidak ditemukan" });
    return;
  }

  req.user = {
    id: user.id,
    roleId: user.roleId,
    roleName: user.role?.name ?? null,
  };

  next();
}