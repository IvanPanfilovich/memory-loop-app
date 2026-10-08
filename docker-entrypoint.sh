#!/bin/sh
set -e

# If PORT environment variable is set, use it
if [ -n "$PORT" ]; then
    echo "Using PORT: $PORT"
    # Replace the port in nginx config
    sed -i "s/listen 80;/listen $PORT;/g" /etc/nginx/conf.d/default.conf
fi

# Start nginx
exec nginx -g 'daemon off;'

