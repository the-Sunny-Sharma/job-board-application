# --- Stage 1: BUILD ---
# Use Mavem + Java 21 image to compile the project
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build

# Set working directory inside container
WORKDIR /app

# Copy pom.xml first - Docker caches this layer
# If pom.xml hasn't changed, dependencies aren't re-downloaded
COPY pom.xml .

# Download all dependencies (cached if pom.xml unchanged)
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the JAR, skip tests (tests run in CI, not Docker build)
RUN mvn clean package -DskipTests


# --- Stage 2: RUN ---
# Use lightweight Java 21 image - no Maven needed to run
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy ONLY the build JAR from Stage 1
# This keeps the final image small (~200MB vs ~600MB)
COPY --from=build /app/target/*.jar app.jar

# Document which port the app uses (doesn't actually publish it)
EXPOSE 8082

# Command to run where container starts
ENTRYPOINT ["java", "-jar", "app.jar"]

