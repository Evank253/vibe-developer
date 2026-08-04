FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
COPY client/package.json client/package-lock.json* ./client/
RUN npm install && npm --prefix client install
COPY . .
RUN npm run build:client

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY server ./server
COPY --from=build /app/client/dist ./client/dist
COPY .env.example ./
EXPOSE 4000
CMD ["node", "server/index.js"]
