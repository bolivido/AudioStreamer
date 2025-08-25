FROM azuracast/azuracast:latest

# Set environment variables for external services
ENV AZURACAST_APP_ENV=production
ENV AZURACAST_DB_HOST=azuracast-db
ENV AZURACAST_DB_PORT=3306
ENV AZURACAST_DB_USERNAME=azuracast
ENV AZURACAST_DB_PASSWORD=azuracast_password
ENV AZURACAST_DB_DATABASE=azuracast
ENV AZURACAST_REDIS_HOST=azuracast-redis
ENV AZURACAST_REDIS_PORT=6379

# Expose only essential ports
EXPOSE 80 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Start AzuraCast
CMD ["docker-entrypoint.sh"]
