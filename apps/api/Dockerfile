FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY gradlew gradlew
COPY gradle gradle
COPY build.gradle settings.gradle ./
RUN --mount=type=cache,target=/root/.gradle \
	chmod +x gradlew && ./gradlew dependencies --no-daemon
COPY src src
RUN --mount=type=cache,target=/root/.gradle \
	./gradlew bootJar --no-daemon

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]