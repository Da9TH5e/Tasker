FROM node:24-bookworm-slim AS frontend-build
WORKDIR /build
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY frontend/ ./
ENV VITE_API_URL=/api
RUN npm run build

FROM python:3.12-slim-bookworm
WORKDIR /app
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./backend/
COPY --from=frontend-build /build/dist ./frontend/dist
WORKDIR /app/backend
ENV PORT=10000 TASKER_DATABASE=/var/data/tasker.db PYTHONUNBUFFERED=1
CMD ["sh", "-c", "exec waitress-serve --listen=0.0.0.0:${PORT} wsgi:application"]
