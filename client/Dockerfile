FROM node:22-alpine

WORKDIR /app/client

COPY client/package.json client/package-lock.json ./
RUN npm ci

COPY client ./

EXPOSE 5178

CMD ["npx", "vite", "--host", "0.0.0.0", "--port", "5178"]
