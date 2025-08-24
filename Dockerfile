FROM azuracast/azuracast:latest

# Set environment variables
ENV AZURACAST_APP_ENV=production
ENV AZURACAST_DB_HOST=localhost
ENV AZURACAST_DB_PORT=3306
ENV AZURACAST_DB_USERNAME=azuracast
ENV AZURACAST_DB_PASSWORD=azuracast
ENV AZURACAST_DB_DATABASE=azuracast
ENV AZURACAST_REDIS_HOST=localhost
ENV AZURACAST_REDIS_PORT=6379

# Expose ports
EXPOSE 80 443 2020 2021 8000 8001 8002 8003 8004 8005

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Start AzuraCast
CMD ["docker-entrypoint.sh"]
