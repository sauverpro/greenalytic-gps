#!/bin/bash

# Setup Nginx configurations for GreenAlytics

echo "Setting up Nginx configurations..."

# Create API backend configuration
cat > /tmp/api.greenalytic.rw << 'EOF'
server {
    listen 80;
    server_name api.greenalytic.rw;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Create frontend configuration
cat > /tmp/data.greenalytic.rw << 'EOF'
server {
    listen 80;
    server_name data.greenalytic.rw;

    root /var/www/greenallytics/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Move files to nginx sites-available
sudo mv /tmp/api.greenalytic.rw /etc/nginx/sites-available/
sudo mv /tmp/data.greenalytic.rw /etc/nginx/sites-available/

# Enable sites
sudo ln -sf /etc/nginx/sites-available/api.greenalytic.rw /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/data.greenalytic.rw /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
echo ""
echo "Testing Nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Nginx configuration is valid!"
    echo ""
    echo "To apply changes, run:"
    echo "  sudo systemctl restart nginx"
else
    echo ""
    echo "❌ Nginx configuration has errors. Please check the output above."
    exit 1
fi
