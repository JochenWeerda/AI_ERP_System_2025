FROM maven:3.8.6-openjdk-17-slim AS build
WORKDIR /build
COPY pom.xml .
# Lade die Abhängigkeiten herunter
RUN mvn dependency:go-offline -B

# Kopiere den Quellcode
COPY src ./src

# Baue die Anwendung
RUN mvn package -DskipTests

FROM openjdk:17-slim
WORKDIR /app

# Kopiere die JAR-Datei aus dem Build-Stage
COPY --from=build /build/target/*.jar app.jar

# Umgebungsvariablen für Java
ENV JAVA_OPTS="-Xms256m -Xmx512m"

# Healthcheck für die Anwendung
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:8082/enni/actuator/health || exit 1

# Exponiere den Port
EXPOSE 8082

# Starte die Anwendung
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
