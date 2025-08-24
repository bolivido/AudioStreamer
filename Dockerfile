FROM ubuntu:20.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    unzip \
    libssl1.1 \
    ca-certificates \
    ffmpeg \
    icecast2 \
    mime-support \
    && rm -rf /var/lib/apt/lists/*

# Create shoutcast directory
WORKDIR /opt/shoutcast

# Create icecast user and group
RUN groupadd -r icecast && useradd -r -g icecast icecast

# Copy configuration files
COPY icecast.xml /opt/shoutcast/icecast.xml
COPY start-auto-play.sh /opt/shoutcast/
RUN chmod +x /opt/shoutcast/start-auto-play.sh

# Create directories for content and logs
RUN mkdir -p /opt/shoutcast/content /opt/shoutcast/logs

# Copy sample audio files (if any)
COPY content/ /opt/shoutcast/content/

# Set proper ownership
RUN chown -R icecast:icecast /opt/shoutcast

# Expose ports
EXPOSE 8000 8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8001/ || exit 1

# Switch to icecast user and start server
USER icecast
CMD ["icecast2", "-c", "/opt/shoutcast/icecast.xml"]
