import type { Request, Response } from "express";
import { sendSuccess } from "../../utils/response.js";
import { AppError } from "../../utils/AppError.js";
import { changePassword, getMe, login, logout, refresh, register } from "./service.js";
import type { ChangePasswordInput, RefreshTokenInput, RegisterInput } from "./schema.js";

export async function registerHandler(req: Request, res: Response) {
  const body = req.body as RegisterInput;
  await register(body);
  sendSuccess(res, "Registrasi berhasil, password dikirim ke email kamu", null, 201);
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

export async function changePasswordHandler(req: Request, res: Response) {
  if (!req.user) throw new AppError(401, "Unauthorized");
  const body = req.body as ChangePasswordInput;
  await changePassword(req.user.id, body);
  sendSuccess(res, "Password berhasil diganti, semua device harus login ulang", null);
}

export async function meHandler(req: Request, res: Response) {
  if (!req.user) throw new AppError(401, "Unauthorized");
  const user = await getMe(req.user.id);
  sendSuccess(res, "Profil user", user);
}