FROM azuracast/azuracast:latest

# Set minimal environment variables
ENV AZURACAST_APP_ENV=production

# Force SQLite database configuration
ENV AZURACAST_DB_TYPE=sqlite
ENV AZURACAST_DB_DATABASE=/var/azuracast/db/azuracast.db

# Force file-based cache
ENV AZURACAST_CACHE_DRIVER=file

# Disable MariaDB and Redis startup scripts
RUN rm -f /etc/my_init.d/04_mariadb_conf.sh || true
RUN rm -f /etc/my_init.d/05_centrifugo_conf.sh || true

# Fix Nginx symbolic link conflict
RUN rm -f /etc/nginx/sites-enabled/default.vhost || true

# Create custom entrypoint script
RUN echo '#!/bin/bash\n\
# Skip database and Redis checks\n\
echo "Starting AzuraCast with SQLite..."\n\
\n\
# Start only essential services\n\
/usr/bin/supervisord -c /etc/supervisor/supervisord.conf\n\
\n\
# Keep container running\n\
tail -f /dev/null' > /custom-entrypoint.sh && chmod +x /custom-entrypoint.sh

# Expose only essential ports
EXPOSE 80 8000

# Health check with longer timeout
HEALTHCHECK --interval=60s --timeout=30s --start-period=120s --retries=5 \
    CMD curl -f http://localhost:80/ || exit 1

# Use custom entrypoint
CMD ["/custom-entrypoint.sh"]
