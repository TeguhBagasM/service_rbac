import type { Request, Response } from "express";
import { sendSuccess } from "../../utils/response.js";
import { login, logout, refresh, register } from "./service.js";
import type { RefreshTokenInput, RegisterInput } from "./schema.js";

export async function registerHandler(req: Request, res: Response) {
  const body = req.body as RegisterInput;
  const user = await register(body);
  sendSuccess(res, "Registrasi berhasil", user, 201);
}

export async function loginHandler(req: Request, res: Response) {
  const { email, password } = req.body as { email: string; password: string };
  const result = await login({ email, password });
  sendSuccess(res, "Login berhasil", result);
}

export async function refreshHandler(req: Request, res: Response) {
  const { refreshToken } = req.body as RefreshTokenInput;
  const tokens = await refresh(refreshToken);
  sendSuccess(res, "Token diperbarui", tokens);
}

export async function logoutHandler(req: Request, res: Response) {
  const { refreshToken } = req.body as RefreshTokenInput;
  await logout(refreshToken);
  sendSuccess(res, "Logout berhasil", null);
}
