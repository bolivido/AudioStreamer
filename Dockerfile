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

# Copy configuration files
COPY icecast.xml /opt/shoutcast/icecast.xml
COPY start-auto-play.sh /opt/shoutcast/
RUN chmod +x /opt/shoutcast/start-auto-play.sh

# Create directories for content and logs
RUN mkdir -p /opt/shoutcast/content /opt/shoutcast/logs

# Copy sample audio files (if any)
COPY content/ /opt/shoutcast/content/

# Set proper ownership (use existing icecast user)
RUN chown -R icecast:icecast /opt/shoutcast 2>/dev/null || true

# Expose ports
EXPOSE 8000 8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8001/ || exit 1

# Use the startup script as the main command
CMD ["/opt/shoutcast/start-auto-play.sh"]
