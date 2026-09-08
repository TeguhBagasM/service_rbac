import type { Request, Response } from "express";
import { sendSuccess } from "../../utils/response.js";
import { createRole, listRoles, updateRole } from "./service.js";
import type { CreateRoleInput, UpdateRoleInput } from "./schema.js";

export async function listRolesHandler(req: Request, res: Response) {
  const roles = await listRoles();
  sendSuccess(res, "Daftar role", roles);
}

export async function createRoleHandler(req: Request, res: Response) {
  const body = req.body as CreateRoleInput;
  const role = await createRole(body);
  sendSuccess(res, "Role dibuat", role, 201);
}

export async function updateRoleHandler(req: Request, res: Response) {
  const id = Number(req.params.id);
  const body = req.body as UpdateRoleInput;
  const role = await updateRole(id, body);
  sendSuccess(res, "Role diperbarui", role);
}
