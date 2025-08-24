FROM ubuntu:20.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV SHOUTCAST_VERSION=2.6.1

# Install dependencies
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    unzip \
    libssl1.1 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create shoutcast directory
WORKDIR /opt/shoutcast

# Download Shoutcast DNAS (using a reliable source)
RUN wget -O shoutcast.tar.gz "https://download.nullsoft.com/shoutcast/tools/win32/sc_serv2_linux_x64-latest.tar.gz" \
    && tar -xzf shoutcast.tar.gz \
    && chmod +x sc_serv \
    && rm shoutcast.tar.gz

# Copy configuration
COPY sc_serv.conf /opt/shoutcast/sc_serv.conf

# Create directories for content
RUN mkdir -p /opt/shoutcast/content /opt/shoutcast/logs

# Copy sample audio files (if any)
COPY content/ /opt/shoutcast/content/

# Copy startup scripts
COPY start-auto-play.sh /opt/shoutcast/
RUN chmod +x /opt/shoutcast/start-auto-play.sh

# Install FFmpeg for streaming
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

# Expose ports
EXPOSE 8000 8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8001/ || exit 1

# Start server and auto-play
CMD ["./sc_serv", "sc_serv.conf"]
