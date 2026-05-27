FROM node:20-alpine
WORKDIR /app

COPY .npmrc ./
COPY package.json pnpm-workspace.yaml ./
COPY packages/kafka/package.json ./packages/kafka/
COPY packages/email-service/package.json ./packages/email-service/
COPY packages/shared/package.json ./packages/shared/

RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY packages/kafka ./packages/kafka
COPY packages/email-service ./packages/email-service
COPY packages/shared ./packages/shared

CMD ["pnpm", "--filter", "@static-wears/kafka", "email-worker"]
