import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.js";
import { authRouter } from "./modules/auth/routes.js";
import { menusRouter } from "./modules/menus/routes.js";
import { rolesRouter } from "./modules/roles/routes.js";
import { usersRouter } from "./modules/users/routes.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN.split(",") }));
  app.use(express.json());

  app.get("/health", async (_req, res) => {
    try {
      // $queryRaw tagged template: parameterized, bebas dari SQL injection
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: "OK", service: "RBAC Service", database: "Connected" });
    } catch {
      res.status(500).json({ status: "ERROR", service: "RBAC Service", database: "Disconnected" });
    }
  });

  app.use("/rbac/auth", authRouter);
  app.use("/rbac/users", usersRouter);
  app.use("/rbac/roles", rolesRouter);
  app.use("/rbac/menus", menusRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}