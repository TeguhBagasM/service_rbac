import type { Request, Response } from "express";
import { sendSuccess } from "../../utils/response.js";
import { createMenu, listMenus, updateMenu } from "./service.js";
import type { CreateMenuInput, UpdateMenuInput } from "./schema.js";

export async function listMenusHandler(req: Request, res: Response) {
  const menus = await listMenus();
  sendSuccess(res, "Daftar menu", menus);
}

export async function createMenuHandler(req: Request, res: Response) {
  const body = req.body as CreateMenuInput;
  const menu = await createMenu(body);
  sendSuccess(res, "Menu dibuat", menu, 201);
}

export async function updateMenuHandler(req: Request, res: Response) {
  const id = Number(req.params.id);
  const body = req.body as UpdateMenuInput;
  const menu = await updateMenu(id, body);
  sendSuccess(res, "Menu diperbarui", menu);
}
