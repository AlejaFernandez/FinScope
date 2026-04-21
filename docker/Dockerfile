# ── Development ──────────────────────────────────────────────
FROM node:22-alpine AS development
RUN npm install -g @angular/cli@19
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 4200 4000

# ── Builder ───────────────────────────────────────────────────
FROM node:22-alpine AS builder
RUN npm install -g @angular/cli@19
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN ng build --configuration production

# ── Production (nginx) ────────────────────────────────────────
FROM nginx:1.25-alpine AS production
COPY --from=builder /app/dist/finscope/browser /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
