# ========================================================
# STAGE 1: Build the Maven artifact
# ========================================================
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy project sources and package JAR
COPY src ./src
RUN mvn clean package -DskipTests -B

# ========================================================
# STAGE 2: Ultra-lightweight Production JRE Runtime
# ========================================================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Run as non-root user for cloud security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy executable jar from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Render assigns port dynamically via $PORT
ENV PORT=1998
EXPOSE 1998

# JVM Memory Tuning for Render Free Tier (512MB RAM):
# -XX:+UseSerialGC: minimizes garbage collection memory overhead
# -XX:MaxRAMPercentage=75: keeps heap comfortably within container limits
ENTRYPOINT ["java", "-XX:+UseSerialGC", "-XX:MaxRAMPercentage=75.0", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]

