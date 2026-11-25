FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY services/api/pom.xml .
RUN mvn -q dependency:go-offline
COPY services/api/src src
RUN mvn -q package -DskipTests
FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S stemlab && adduser -S stemlab -G stemlab
USER stemlab
WORKDIR /app
COPY --from=build /app/target/stem-lab-api-0.1.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
