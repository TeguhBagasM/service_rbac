import type { NextFunction, Request, Response } from "express";

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const roleName = req.user.roleName;
    if (!roleName || !roles.includes(roleName)) {
      res.status(403).json({ success: false, message: "Forbidden: role tidak diizinkan" });
      return;
    }

    next();
  };
}
