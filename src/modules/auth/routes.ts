import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import { authLimiter } from "../../middlewares/rateLimit.js";
import { validateBody } from "../../middlewares/validate.js";
import { loginHandler, logoutHandler, refreshHandler, registerHandler } from "./controller.js";
import { loginSchema, refreshTokenSchema, registerSchema } from "./schema.js";

export const authRouter = Router();

authRouter.post("/register", authLimiter, validateBody(registerSchema), registerHandler);
authRouter.post("/login", authLimiter, validateBody(loginSchema), loginHandler);
authRouter.post("/refresh-token", validateBody(refreshTokenSchema), refreshHandler);
authRouter.post("/logout", requireAuth, validateBody(refreshTokenSchema), logoutHandler);
