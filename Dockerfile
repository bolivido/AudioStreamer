FROM azuracast/azuracast:latest

# Expose ports
EXPOSE 80 8000

# Start AzuraCast normally
CMD ["docker-entrypoint.sh"]
