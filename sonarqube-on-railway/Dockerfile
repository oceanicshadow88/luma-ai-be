# Use the official SonarQube Community Edition image
FROM sonarqube:community

# Expose default SonarQube port
EXPOSE 9000

# Optionally define default environment variables for tuning
# These can be overridden by Railway env vars
ENV SONAR_WEB_JAVAOPTS="-Xmx512m -Xms256m -XX:+HeapDumpOnOutOfMemoryError"
