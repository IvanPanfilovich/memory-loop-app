#!/bin/sh
# Health check script that respects the PORT environment variable

# Use PORT env var if set, otherwise default to 80
PORT=${PORT:-80}

# Check if nginx is responding on the correct port
wget --no-verbose --tries=1 --spider "http://localhost:${PORT}/health" 2>&1

exit $?

