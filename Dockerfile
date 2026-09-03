# ============================================================
# Stage 1: Build
# Uses Maven + JDK 17. The frontend-maven-plugin will
# automatically download Node v22.22.3 and build Angular.
# ============================================================
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copy the entire repo so the plugin can reach ../frontend-angular
COPY . .

# Run the full Maven build — this:
#  1. Downloads Node v22.22.3 via frontend-maven-plugin
#  2. Runs `npm install` in frontend-angular/
#  3. Runs `npm run build -- --configuration production`
#  4. Copies the Angular dist into backend/target/classes/static
#  5. Packages everything into the Spring Boot fat JAR
RUN mvn -f backend/pom.xml -B clean package -DskipTests

# ============================================================
# Stage 2: Runtime
# Lean JRE-only image — no Maven, no Node, no source code.
# ============================================================
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy only the fat JAR from the build stage
COPY --from=build /app/backend/target/edutrack-backend-1.0.0.jar app.jar

# Render (and Docker) use PORT env var. Spring Boot binds to
# server.port which we override here. Render default is 10000.
ENV SERVER_PORT=10000
EXPOSE 10000

ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=$SERVER_PORT"]
