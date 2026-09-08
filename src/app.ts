import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler.js";
import { authRouter } from "./modules/auth/routes.js";
import { menusRouter } from "./modules/menus/routes.js";
import { rolesRouter } from "./modules/roles/routes.js";
import { usersRouter } from "./modules/users/routes.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN.split(",") }));
  app.use(express.json());

  if (env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  }

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "rbac" });
  });

  app.use("/rbac/auth", authRouter);
  app.use("/rbac/users", usersRouter);
  app.use("/rbac/roles", rolesRouter);
  app.use("/rbac/menus", menusRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}