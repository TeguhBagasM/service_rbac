declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        roleId: number | null;
        roleName?: string | null;
      };
    }
  }
}

export {};
