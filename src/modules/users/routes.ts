import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import { requireRole } from "../../middlewares/role.js";
import { validateBody, validateParams } from "../../middlewares/validate.js";
import {
  createUserHandler,
  getUserHandler,
  listUsersHandler,
  removeUserHandler,
  updateUserHandler,
} from "./controller.js";
import { createUserSchema, updateUserSchema } from "./schema.js";
import { idParamSchema } from "../../utils/schemas.js";

export const usersRouter = Router();

usersRouter.use(requireAuth, requireRole("Admin"));

usersRouter.get("/", listUsersHandler);
usersRouter.get("/:id", validateParams(idParamSchema), getUserHandler);
usersRouter.post("/", validateBody(createUserSchema), createUserHandler);
usersRouter.put("/:id", validateParams(idParamSchema), validateBody(updateUserSchema), updateUserHandler);
usersRouter.delete("/:id", validateParams(idParamSchema), removeUserHandler);
