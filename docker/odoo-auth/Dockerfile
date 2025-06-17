# Dockerfile für Odoo-Authentifizierungsdienst
# Mehrphasiges Build für optimierte Imagegröße

# Build-Phase
FROM maven:3.8.6-openjdk-17-slim AS build
WORKDIR /build

# Kopiere nur die POM-Datei für effizientes Layer-Caching
COPY pom.xml .
RUN mvn dependency:go-offline

# Kopiere Quellcode und baue die Anwendung
COPY src/ /build/src/
RUN mvn package -DskipTests

# Runtime-Phase
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Sicherheitsoptimierungen: Nicht als Root ausführen
RUN addgroup -S valeo && adduser -S auth -G valeo
USER auth:valeo

# Kopiere nur das fertige JAR aus der Build-Phase
COPY --from=build /build/target/odoo-auth-*.jar app.jar

# Exponiere Port für API und Management-Endpoints
EXPOSE 8080 8081

# Healthcheck-Konfiguration
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -q -O- http://localhost:8081/actuator/health/liveness || exit 1

# JVM-Optionen für Containerbetrieb
ENV JAVA_OPTS="-Xms128m -Xmx256m -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

# Starte die Anwendung
ENTRYPOINT ["java", "-jar", "app.jar"] 