#!/bin/bash

# ============================================================================
# GreenAlytics GPS Tracking System - Ubuntu Deployment Script
# ============================================================================
# Domains:
#   - api.greenalytic.rw (Backend API + TCP GPS Server)
#   - gps.greenalytic.rw (Frontend Dashboard)
# Server: 10.10.135.196
# ============================================================================

set -e  # Exit on error

echo "============================================================================"
echo "  GreenAlytics Deployment - Ubuntu 24.04 LTS"
echo "============================================================================"
echo ""

# ============================================================================
# STEP 1: System Update and Dependencies
# ============================================================================
echo "📦 Installing system dependencies..."

sudo apt update
sudo apt upgrade -y

# Install Node.js 20.x
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
echo "📦 Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt install -y nginx

# Install Certbot for SSL
echo "📦 Installing Certbot..."
sudo apt install -y certbot python3-certbot-nginx

# Install Git and other tools
sudo apt install -y git curl unzip

echo "✅ System dependencies installed"
echo ""

# ============================================================================
# STEP 2: PostgreSQL Setup
# ============================================================================
echo "🗄️  Setting up PostgreSQL..."

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
-- Create database
CREATE DATABASE greenallytics_gps;

-- Create user
CREATE USER greenallytics_admin WITH ENCRYPTED PASSWORD 'change_this_password_123';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE greenallytics_gps TO greenallytics_admin;

-- Connect to database and grant schema privileges
\c greenallytics_gps
GRANT ALL ON SCHEMA public TO greenallytics_admin;

\q
EOF

echo "✅ PostgreSQL configured"
echo ""

# ============================================================================
# STEP 3: Create Application Directory
# ============================================================================
echo "📁 Creating application directories..."

sudo mkdir -p /var/www/greenallytics
cd /var/www/greenallytics

echo "✅ Application directory created"
echo ""

# ============================================================================
# STEP 4: Firewall Configuration
# ============================================================================
echo "🔥 Configuring firewall..."

# Enable UFW
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw allow 8800/tcp    # GPS TCP Server
sudo ufw --force enable

echo "✅ Firewall configured"
echo ""

# ============================================================================
# STEP 5: Create systemd Service for Backend
# ============================================================================
echo "⚙️  Creating systemd service..."

sudo tee /etc/systemd/system/greenallytics-backend.service > /dev/null << 'EOF'
[Unit]
Description=GreenAlytics GPS Tracking Backend
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/greenallytics/server
Environment=NODE_ENV=production
ExecStart=/usr/bin/node src/index.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=greenallytics-backend

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload

echo "✅ Systemd service created"
echo ""

# ============================================================================
# STEP 6: Nginx Configuration
# ============================================================================
echo "🌐 Configuring Nginx..."

# Backend API configuration
sudo tee /etc/nginx/sites-available/api.greenalytic.rw > /dev/null << 'EOF'
server {
    listen 80;
    server_name api.greenalytic.rw;

    # Redirect to HTTPS (will be configured by Certbot)
    
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

# Frontend configuration
sudo tee /etc/nginx/sites-available/data.greenalytic.rw > /dev/null << 'EOF'
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

# Enable sites
sudo ln -sf /etc/nginx/sites-available/api.greenalytic.rw /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/data.greenalytic.rw /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

echo "✅ Nginx configured"
echo ""

# ============================================================================
# DEPLOYMENT COMPLETE - MANUAL STEPS REQUIRED
# ============================================================================
echo "============================================================================"
echo "  📋 DEPLOYMENT PREPARATION COMPLETE"
echo "============================================================================"
echo ""
echo "✅ Installed: Node.js, PostgreSQL, Nginx, Certbot"
echo "✅ Created: Database, User, Application directories"
echo "✅ Configured: Firewall, Systemd service, Nginx"
echo ""
echo "============================================================================"
echo "  📝 NEXT STEPS (Manual)"
echo "============================================================================"
echo ""
echo "1. Configure DNS Records:"
echo "   - api.greenalytic.rw  → A record → 10.10.135.196"
echo "   - data.greenalytic.rw → A record → 10.10.135.196"
echo ""
echo "2. Clone your repository:"
echo "   cd /var/www/greenallytics"
echo "   git clone YOUR_REPO_URL ."
echo "   # For updates: git pull origin main"
echo ""
echo "3. Setup Backend:"
echo "   cd /var/www/greenallytics/server"
echo "   npm install --production"
echo "   cp .env.example .env"
echo "   # Edit .env with production settings"
echo "   sudo systemctl start greenallytics-backend"
echo "   sudo systemctl enable greenallytics-backend"
echo ""
echo "4. Build Frontend:"
echo "   cd /var/www/greenallytics"
echo "   npm install"
echo "   npm run build"
echo ""
echo "5. Setup SSL Certificates:"
echo "   sudo certbot --nginx -d api.greenalytic.rw -d data.greenalytic.rw"
echo ""
echo "6. Configure GPS Device:"
echo "   SMS: SERVER,1,api.greenalytic.rw,8800,0#"
echo ""
echo "7. Test services:"
echo "   curl https://api.greenalytic.rw/api/health"
echo "   curl https://data.greenalytic.rw"
echo ""
echo "8. Monitor logs:"
echo "   sudo journalctl -u greenallytics-backend -f"
echo "   tail -f /var/www/greenallytics/server/gps-data.log"
echo ""
echo "============================================================================"
