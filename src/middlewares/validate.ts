import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";

function respondInvalid(res: Response, error: unknown) {
  const issues = (error as { issues?: { path: (string | number)[]; message: string }[] }).issues;
  const details = issues
    ? issues.map((i) => ({ path: i.path.join("."), message: i.message }))
    : [{ path: "", message: "validasi gagal" }];
  res.status(400).json({ success: false, message: "Validasi gagal", errors: details });
}

export function validateBody(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      respondInvalid(res, result.error);
      return;
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      respondInvalid(res, result.error);
      return;
    }
    Object.assign(req.query, result.data);
    next();
  };
}

export function validateParams(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      respondInvalid(res, result.error);
      return;
    }
    req.params = result.data as Request["params"];
    next();
  };
}
