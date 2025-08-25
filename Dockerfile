FROM azuracast/azuracast:latest

# Set minimal environment variables
ENV AZURACAST_APP_ENV=production

# Use SQLite database (built-in, no external dependencies)
ENV AZURACAST_DB_TYPE=sqlite
ENV AZURACAST_DB_DATABASE=/var/azuracast/db/azuracast.db

# Use file-based cache instead of Redis
ENV AZURACAST_CACHE_DRIVER=file

# Fix Nginx symbolic link conflict
RUN rm -f /etc/nginx/sites-enabled/default.vhost || true

# Expose only essential ports
EXPOSE 80 8000

# Health check with longer timeout
HEALTHCHECK --interval=60s --timeout=30s --start-period=120s --retries=5 \
    CMD curl -f http://localhost:80/ || exit 1

# Start AzuraCast with minimal configuration
CMD ["docker-entrypoint.sh"]
