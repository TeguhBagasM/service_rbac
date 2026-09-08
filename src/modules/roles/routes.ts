import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { validateBody, validateParams } from "../../middlewares/validate.js";
import { idParamSchema } from "../../utils/schemas.js";
import { createRoleHandler, listRolesHandler, updateRoleHandler } from "./controller.js";
import { createRoleSchema, updateRoleSchema } from "./schema.js";

export const rolesRouter = Router();

rolesRouter.use(authenticate, authorize("Admin"));

rolesRouter.get("/", listRolesHandler);
rolesRouter.post("/", validateBody(createRoleSchema), createRoleHandler);
rolesRouter.put("/:id", validateParams(idParamSchema), validateBody(updateRoleSchema), updateRoleHandler);
