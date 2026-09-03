# ============================================================
# Stage 1: Build — Maven + JDK 17 (Java only, no Node needed)
# ============================================================
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copy only backend source for efficient layer caching
COPY backend/pom.xml backend/pom.xml
RUN mvn -f backend/pom.xml dependency:go-offline -B

COPY backend/src backend/src
RUN mvn -f backend/pom.xml -B clean package -DskipTests

# ============================================================
# Stage 2: Runtime — lean JRE Alpine image
# ============================================================
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY --from=build /app/backend/target/edutrack-backend-1.0.0.jar app.jar

ENV SERVER_PORT=10000
EXPOSE 10000

ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=$SERVER_PORT"]
