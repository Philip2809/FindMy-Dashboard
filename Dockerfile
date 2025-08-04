# Build frontend
FROM node:20-alpine AS client-builder
WORKDIR /client
COPY client/ .
RUN npm install -g pnpm
RUN pnpm install && pnpm build

# Stage 2: Backend with Flask + Gunicorn
FROM python:3.11-slim AS backend

# Set working dir
WORKDIR /app

# Copy backend requirements
COPY server/requirements.txt .

# Install Python deps
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend app code
COPY server/ .

# Copy frontend build into backend static folder
COPY --from=client-builder /client/dist ./static

# Expose Flask (Gunicorn) port
EXPOSE 8000

# Run app
CMD flask db upgrade && gunicorn -b 0.0.0.0:8000 app:app
