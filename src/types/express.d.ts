declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        roleId: number | null;
        roleName: string | null;
      };
    }
  }
}

export {};