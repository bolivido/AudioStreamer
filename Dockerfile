FROM ubuntu:20.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN apt-get update && apt-get install -y \
    icecast2 \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create directories
RUN mkdir -p /var/log/icecast2 /var/lib/icecast2

# Create icecast user
RUN useradd -r -d /var/lib/icecast2 icecast

# Copy configuration
COPY icecast.conf /etc/icecast2/icecast.xml

# Set permissions
RUN chown -R icecast:icecast /var/log/icecast2 /var/lib/icecast2 /etc/icecast2

# Expose ports
EXPOSE 8000 8001

# Switch to icecast user
USER icecast

# Start Icecast2
CMD ["icecast2", "-c", "/etc/icecast2/icecast.xml"]
