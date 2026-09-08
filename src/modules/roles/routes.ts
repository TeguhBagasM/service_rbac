import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { validateBody, validateParams } from "../../middlewares/validate.js";
import { idParamSchema } from "../../utils/schemas.js";
import {
  createRoleHandler,
  listRoleMenusHandler,
  listRolesHandler,
  removeRoleHandler,
  replaceRoleMenusHandler,
  updateRoleHandler,
} from "./controller.js";
import { createRoleSchema, replaceRoleMenusSchema, updateRoleSchema } from "./schema.js";

export const rolesRouter = Router();

rolesRouter.use(authenticate, authorize("Admin"));

rolesRouter.get("/", listRolesHandler);
rolesRouter.post("/", validateBody(createRoleSchema), createRoleHandler);
rolesRouter.put("/:id", validateParams(idParamSchema), validateBody(updateRoleSchema), updateRoleHandler);
rolesRouter.delete("/:id", validateParams(idParamSchema), removeRoleHandler);
rolesRouter.get("/:id/menus", validateParams(idParamSchema), listRoleMenusHandler);
rolesRouter.put(
  "/:id/menus",
  validateParams(idParamSchema),
  validateBody(replaceRoleMenusSchema),
  replaceRoleMenusHandler,
);
