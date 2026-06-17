# ── Stage 1: Build ────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copia só o pom primeiro para cachear as dependências em camadas separadas
COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests -B

# ── Stage 2: Runtime ──────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Cria usuário não-root por segurança
RUN addgroup -S eyetec && adduser -S eyetec -G eyetec

# Copia apenas o jar final do stage de build
COPY --from=build /app/target/*.jar app.jar

# Cria diretórios de dados com permissão para o usuário não-root
RUN mkdir -p /app/data /app/uploads && chown -R eyetec:eyetec /app

USER eyetec

EXPOSE 8080

# Banco e uploads ficam em /app/data e /app/uploads — mapeados via volume no compose
ENTRYPOINT ["java", "-jar", "app.jar"]
