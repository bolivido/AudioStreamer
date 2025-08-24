FROM azuracast/azuracast:latest

# Set minimal environment variables
ENV AZURACAST_APP_ENV=production

# Expose only essential ports
EXPOSE 80 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Start AzuraCast
CMD ["docker-entrypoint.sh"]
