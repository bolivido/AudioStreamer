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
    mime-support \
    icecast2 \
    && rm -rf /var/lib/apt/lists/*

# Create shoutcast directory
WORKDIR /opt/shoutcast

# Create shoutcast user and group
RUN groupadd -r shoutcast 2>/dev/null || true && \
    useradd -r -g shoutcast -d /opt/shoutcast -s /bin/bash shoutcast 2>/dev/null || true

# Copy configuration files
COPY icecast.xml /opt/shoutcast/icecast.xml
COPY start-auto-play.sh /opt/shoutcast/
RUN chmod +x /opt/shoutcast/start-auto-play.sh

# Create directories for content and logs
RUN mkdir -p /opt/shoutcast/content /opt/shoutcast/logs

# Copy sample audio files (if any)
COPY content/ /opt/shoutcast/content/

# Set proper ownership
RUN chown -R shoutcast:shoutcast /opt/shoutcast

# Expose ports
EXPOSE 8000 8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8001/ || exit 1

# Switch to shoutcast user and use the startup script
USER shoutcast
CMD ["/opt/shoutcast/start-auto-play.sh"]
