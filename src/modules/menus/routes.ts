import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { validateBody, validateParams } from "../../middlewares/validate.js";
import { idParamSchema } from "../../utils/schemas.js";
import { createMenuHandler, listMenusHandler, updateMenuHandler } from "./controller.js";
import { createMenuSchema, updateMenuSchema } from "./schema.js";

export const menusRouter = Router();

menusRouter.use(authenticate, authorize("Admin"));

menusRouter.get("/", listMenusHandler);
menusRouter.post("/", validateBody(createMenuSchema), createMenuHandler);
menusRouter.put("/:id", validateParams(idParamSchema), validateBody(updateMenuSchema), updateMenuHandler);