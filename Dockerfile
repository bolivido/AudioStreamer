FROM azuracast/azuracast:latest

# Set required environment variables for AzuraCast
ENV AZURACAST_APP_ENV=production
ENV MARIADB_ROOT_PASSWORD=azuracast_root_password
ENV MARIADB_DATABASE=azuracast
ENV MARIADB_USER=azuracast
ENV MARIADB_PASSWORD=azuracast_password

# Expose only essential ports
EXPOSE 80 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Start AzuraCast
CMD ["docker-entrypoint.sh"]
