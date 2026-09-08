import type { Request, Response } from "express";
import { sendSuccess } from "../../utils/response.js";
import {
  createRole,
  listRoleMenus,
  listRoles,
  removeRole,
  replaceRoleMenus,
  updateRole,
} from "./service.js";
import type { CreateRoleInput, RoleMenuAccessInput, UpdateRoleInput } from "./schema.js";

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

export async function removeRoleHandler(req: Request, res: Response) {
  const id = Number(req.params.id);
  await removeRole(id);
  sendSuccess(res, "Role dihapus", null);
}

export async function listRoleMenusHandler(req: Request, res: Response) {
  const roleId = Number(req.params.id);
  const menus = await listRoleMenus(roleId);
  sendSuccess(res, "Daftar akses menu role", menus);
}

export async function replaceRoleMenusHandler(req: Request, res: Response) {
  const roleId = Number(req.params.id);
  const body = req.body as RoleMenuAccessInput[];
  const menus = await replaceRoleMenus(roleId, body);
  sendSuccess(res, "Akses menu role diperbarui", menus);
}
