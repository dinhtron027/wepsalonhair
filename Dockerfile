FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps

COPY backend ./backend
COPY app.js ./

EXPOSE 5000

CMD ["node", "backend/server.js"]
