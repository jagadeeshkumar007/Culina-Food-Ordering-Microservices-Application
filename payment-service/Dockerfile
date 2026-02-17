# ---------- BUILD STAGE ----------
FROM maven:3.9.6-eclipse-temurin-17 AS build

WORKDIR /app

# Copy pom first for dependency caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source
COPY src ./src

# Build jar
RUN mvn clean package -DskipTests


# ---------- RUNTIME STAGE ----------
FROM eclipse-temurin:17-jre

WORKDIR /app

# Copy jar from build stage
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8082

ENTRYPOINT ["java", "-jar", "app.jar"]
