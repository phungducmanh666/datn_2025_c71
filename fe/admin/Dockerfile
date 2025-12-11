# fe/admin/Dockerfile
FROM node:22-alpine AS builder
WORKDIR /app

# Copy dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy toàn bộ project và build
COPY . .
RUN npm run build

# =========================
# 2. Base image for running
# =========================
FROM node:22-alpine AS runner
WORKDIR /app

# Tạo biến môi trường NODE_ENV
ENV NODE_ENV=production

# Coppy thành phần đã build từ bước trước
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Expose port 3000
EXPOSE 3000

# Start Next.js app
CMD ["npm", "start"]

