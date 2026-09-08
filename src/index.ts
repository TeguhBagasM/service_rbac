import express from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

export const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'OK', service: 'RBAC Service', database: 'Connected' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', service: 'RBAC Service', database: 'Disconnected' });
  }
});

app.listen(PORT, () => {
  console.log(`Server RBAC running on port ${PORT}`);
});