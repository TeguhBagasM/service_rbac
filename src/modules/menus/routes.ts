import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import { requireRole } from "../../middlewares/role.js";
import { validateBody, validateParams } from "../../middlewares/validate.js";
import { idParamSchema } from "../../utils/schemas.js";
import { createMenuHandler, listMenusHandler, updateMenuHandler } from "./controller.js";
import { createMenuSchema, updateMenuSchema } from "./schema.js";

export const menusRouter = Router();

menusRouter.use(requireAuth, requireRole("Admin"));

menusRouter.get("/", listMenusHandler);
menusRouter.post("/", validateBody(createMenuSchema), createMenuHandler);
menusRouter.put("/:id", validateParams(idParamSchema), validateBody(updateMenuSchema), updateMenuHandler);