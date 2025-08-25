FROM azuracast/azuracast:latest

# Set minimal environment variables
ENV AZURACAST_APP_ENV=production

# Disable internal services that might cause timeouts
ENV AZURACAST_DISABLE_DATABASE=true
ENV AZURACAST_DISABLE_REDIS=true

# Expose only essential ports
EXPOSE 80 8000

# Health check with longer timeout
HEALTHCHECK --interval=60s --timeout=30s --start-period=120s --retries=5 \
    CMD curl -f http://localhost:80/ || exit 1

# Start AzuraCast with minimal configuration
CMD ["docker-entrypoint.sh"]
