import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import { requireRole } from "../../middlewares/role.js";
import { validateBody, validateParams } from "../../middlewares/validate.js";
import { idParamSchema } from "../../utils/schemas.js";
import { createRoleHandler, listRolesHandler, updateRoleHandler } from "./controller.js";
import { createRoleSchema, updateRoleSchema } from "./schema.js";

export const rolesRouter = Router();

rolesRouter.use(requireAuth, requireRole("Admin"));

rolesRouter.get("/", listRolesHandler);
rolesRouter.post("/", validateBody(createRoleSchema), createRoleHandler);
rolesRouter.put("/:id", validateParams(idParamSchema), validateBody(updateRoleSchema), updateRoleHandler);
