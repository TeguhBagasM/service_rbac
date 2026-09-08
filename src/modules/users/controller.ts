import type { Request, Response } from "express";
import { sendSuccess } from "../../utils/response.js";
import { AppError } from "../../utils/AppError.js";
import { createUser, getUserById, listUsers, removeUser, updateUser } from "./service.js";
import type { CreateUserInput, UpdateUserInput } from "./schema.js";

export async function listUsersHandler(req: Request, res: Response) {
  const users = await listUsers();
  sendSuccess(res, "Daftar user", users);
}

export async function getUserHandler(req: Request, res: Response) {
  const id = Number(req.params.id);
  const user = await getUserById(id);
  sendSuccess(res, "Detail user", user);
}

export async function createUserHandler(req: Request, res: Response) {
  const body = req.body as CreateUserInput;
  const user = await createUser(body, true);
  sendSuccess(res, "User internal dibuat", user, 201);
}

export async function updateUserHandler(req: Request, res: Response) {
  const id = Number(req.params.id);
  const body = req.body as UpdateUserInput;
  const user = await updateUser(id, body);
  sendSuccess(res, "User diperbarui", user);
}

export async function removeUserHandler(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (req.user?.id === id) {
    throw new AppError(400, "Tidak dapat menghapus akun sendiri");
  }
  await removeUser(id);
  sendSuccess(res, "User dihapus", null);
}
