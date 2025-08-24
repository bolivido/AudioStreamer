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
    && rm -rf /var/lib/apt/lists/*

# Create shoutcast directory
WORKDIR /opt/shoutcast

# Create shoutcast user and group
RUN groupadd -r shoutcast 2>/dev/null || true && \
    useradd -r -g shoutcast -d /opt/shoutcast -s /bin/bash shoutcast 2>/dev/null || true

# Download Shoutcast DNAS (try multiple sources)
RUN wget -O shoutcast.tar.gz "https://github.com/Shoutcast/shoutcast-dnas/archive/refs/tags/v2.6.1.tar.gz" || \
    wget -O shoutcast.tar.gz "https://archive.org/download/shoutcast-dnas-2.6.1/shoutcast-dnas-2.6.1.tar.gz" || \
    wget -O shoutcast.tar.gz "https://github.com/Shoutcast/shoutcast-dnas/releases/download/v2.6.1/shoutcast-dnas-2.6.1.tar.gz"

# Extract and setup Shoutcast
RUN tar -xzf shoutcast.tar.gz && \
    mv shoutcast-dnas-2.6.1/* . && \
    rm -rf shoutcast-dnas-2.6.1 shoutcast.tar.gz && \
    chmod +x sc_serv

# Copy configuration files
COPY sc_serv.conf /opt/shoutcast/sc_serv.conf
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
