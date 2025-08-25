FROM azuracast/azuracast:latest

# Remove MariaDB and Redis startup scripts to prevent timeouts
RUN rm -f /etc/my_init.d/04_mariadb_conf.sh || true
RUN rm -f /etc/my_init.d/05_centrifugo_conf.sh || true
RUN rm -f /etc/my_init.d/05_setup_db.sh || true

# Fix Nginx symbolic link conflict
RUN rm -f /etc/nginx/sites-enabled/default.vhost || true

# Expose ports
EXPOSE 80 8000

# Start AzuraCast normally
CMD ["docker-entrypoint.sh"]
