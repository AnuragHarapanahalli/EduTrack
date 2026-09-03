# ============================================================
# Stage 1: Build Angular (Node)
# ============================================================
FROM node:22.22.3-alpine AS frontend-build

WORKDIR /app/frontend

# Install deps first (cached layer)
COPY frontend-angular/package*.json ./
RUN npm ci

# Build Angular for production
COPY frontend-angular/ ./
RUN npm run build -- --configuration production

# ============================================================
# Stage 2: Build Spring Boot JAR (Maven)
# Injects Angular dist into src/main/resources/static/
# so Spring Boot serves it automatically
# ============================================================
FROM maven:3.9-eclipse-temurin-17 AS backend-build

WORKDIR /app

# Resolve deps first (cached layer — only re-runs if pom.xml changes)
COPY backend/pom.xml backend/pom.xml
RUN mvn -f backend/pom.xml dependency:go-offline -B

# Copy backend source
COPY backend/src backend/src

# Inject the Angular build output into Spring Boot's static folder
COPY --from=frontend-build /app/frontend/dist/frontend-angular/browser/ backend/src/main/resources/static/

# Package the fat JAR (Angular is now bundled inside)
RUN mvn -f backend/pom.xml -B clean package -DskipTests

# ============================================================
# Stage 3: Runtime — lean JRE Alpine image
# ============================================================
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY --from=backend-build /app/backend/target/edutrack-backend-1.0.0.jar app.jar

ENV SERVER_PORT=10000
EXPOSE 10000

ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=$SERVER_PORT"]
