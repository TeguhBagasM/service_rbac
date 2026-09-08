import type { Request, Response } from "express";
import { AppError } from "../../utils/AppError.js";
import { sendSuccess } from "../../utils/response.js";
import { createUser, getUserById, listUsers, removeUser, updateUser } from "./service.js";
import type { CreateUserInput, UpdateUserInput } from "./schema.js";

function getAuthenticatedUserId(req: Request): number {
  const userId = req.user?.id;
  if (userId === undefined) throw new AppError(401, "Unauthorized");
  return userId;
}

export async function listUsersHandler(req: Request, res: Response) {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  const { users, pagination } = await listUsers(page, limit);
  sendSuccess(res, "Daftar user", { users, pagination });
}

export async function getUserHandler(req: Request, res: Response) {
  const id = Number(req.params.id);
  const user = await getUserById(id);
  sendSuccess(res, "Detail user", user);
}

export async function createUserHandler(req: Request, res: Response) {
  const body = req.body as CreateUserInput;
  const user = await createUser(body);
  sendSuccess(res, "User internal dibuat, kredensial dikirim ke email user", user, 201);
}

export async function updateUserHandler(req: Request, res: Response) {
  const id = Number(req.params.id);
  const actorId = getAuthenticatedUserId(req);
  const body = req.body as UpdateUserInput;
  const user = await updateUser(id, actorId, body);
  sendSuccess(res, "User diperbarui", user);
}

export async function removeUserHandler(req: Request, res: Response) {
  const id = Number(req.params.id);
  const actorId = getAuthenticatedUserId(req);
  await removeUser(id, actorId);
  sendSuccess(res, "User dinonaktifkan", null);
}
