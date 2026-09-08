import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate.js";
import { meHandler } from "../auth/controller.js";
import {
  createUserHandler,
  getUserHandler,
  listUsersHandler,
  removeUserHandler,
  updateUserHandler,
} from "./controller.js";
import { createUserSchema, listUsersQuerySchema, updateUserSchema } from "./schema.js";
import { idParamSchema } from "../../utils/schemas.js";

export const usersRouter = Router();

usersRouter.get("/me", authenticate, meHandler);

usersRouter.use(authenticate, authorize("Admin"));

usersRouter.get("/", validateQuery(listUsersQuerySchema), listUsersHandler);
usersRouter.get("/:id", validateParams(idParamSchema), getUserHandler);
usersRouter.post("/", validateBody(createUserSchema), createUserHandler);
usersRouter.put("/:id", validateParams(idParamSchema), validateBody(updateUserSchema), updateUserHandler);
usersRouter.delete("/:id", validateParams(idParamSchema), removeUserHandler);
