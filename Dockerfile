# syntax=docker/dockerfile:1
FROM node:24-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts ./
COPY tsconfig.json ./
COPY src ./src

ARG DATABASE_URL=mysql://root:password@db-rbac:3306/db_rbac
ENV DATABASE_URL=${DATABASE_URL}

RUN npx prisma generate
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/dist ./dist

ARG PORT=4001
EXPOSE ${PORT}

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]