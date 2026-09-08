import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { authRateLimiter } from "../../middlewares/rate-limit.js";
import { validateBody } from "../../middlewares/validate.js";
import {
  changePasswordHandler,
  loginHandler,
  logoutHandler,
  refreshHandler,
  registerHandler,
} from "./controller.js";
import {
  changePasswordSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
} from "./schema.js";

export const authRouter = Router();

authRouter.post("/register", authRateLimiter, validateBody(registerSchema), registerHandler);
authRouter.post("/login", authRateLimiter, validateBody(loginSchema), loginHandler);
authRouter.post("/refresh-token", validateBody(refreshTokenSchema), refreshHandler);
authRouter.post("/logout", authenticate, validateBody(refreshTokenSchema), logoutHandler);
authRouter.post(
  "/change-password",
  authenticate,
  validateBody(changePasswordSchema),
  changePasswordHandler,
);
