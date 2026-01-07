# GreenAlytics GPS Tracking System - Deployment Guide

## 🌐 Deployment Configuration

- **Backend API + TCP GPS Server**: `api.greenalytic.rw`
- **Frontend Dashboard**: `data.greenalytic.rw`
- **Server**: Ubuntu 24.04 LTS (10.10.135.196)

---

## 📋 Prerequisites

1. **Domain DNS Configuration** (Do this FIRST):
   ```
   api.greenalytic.rw  → A record → 10.10.135.196
   data.greenalytic.rw → A record → 10.10.135.196
   ```
   Wait 10-15 minutes for DNS propagation.

2. **Server Access**: Root SSH access to the Ubuntu server

3. **GitHub Repository**: Your code should be in a GitHub repository for easy deployment and updates

---

## 🚀 Step-by-Step Deployment (From Scratch)

### Step 1: SSH to Your Server

```bash
ssh root@10.10.135.196
```

---

### Step 2: Update System

```bash
sudo apt update
sudo apt upgrade -y
```

---

### Step 3: Install Node.js 20.x

```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

Expected: Node.js v20.x.x and npm 10.x.x

---

### Step 4: Install PostgreSQL

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify it's running
sudo systemctl status postgresql
```

---

### Step 5: Create Database and User

```bash
# Switch to postgres user and create database
sudo -u postgres psql << 'EOF'
-- Create database
CREATE DATABASE greenallytics_gps;

-- Create user with password
CREATE USER greenallytics_admin WITH ENCRYPTED PASSWORD 'postgres';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE greenallytics_gps TO greenallytics_admin;

-- Connect to database
\c greenallytics_gps

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO greenallytics_admin;

\q
EOF
```

**⚠️ Important**: Replace `YourSecurePassword123` with a strong password. Save it - you'll need it later.

---

### Step 6: Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify it's running
sudo systemctl status nginx
```

---

### Step 7: Install Certbot for SSL

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Verify installation
certbot --version
```

---

### Step 8: Install Git and Other Tools

```bash
sudo apt install -y git curl unzip
```

---

### Step 9: Configure Firewall

```bash
# Allow SSH (port 22)
sudo ufw allow 22/tcp

# Allow HTTP (port 80)
sudo ufw allow 80/tcp

# Allow HTTPS (port 443)
sudo ufw allow 443/tcp

# Allow GPS TCP Server (port 8800)
sudo ufw allow 8800/tcp

# Enable firewall
sudo ufw --force enable

# Check status
sudo ufw status
```

---

### Step 10: Create Application Directory

```bash
# Create directory
sudo mkdir -p /var/www/greenallytics

# Change ownership to current user for git clone
sudo chown -R $USER:$USER /var/www/greenallytics

# Navigate to directory
cd /var/www/greenallytics
```

---

### Step 11: Clone Your Repository

```bash
# Clone your repository (replace with your actual repo URL)
git clone https://github.com/sauverpro/greenalytic-gps.git .

# Fix Git ownership (important for git pull later)
git config --global --add safe.directory /var/www/greenallytics

# Verify files are there
ls -la
```

You should see: `server/`, `src/`, `public/`, `package.json`, etc.

---

### Step 12: Configure Backend Environment Variables

```bash
# Navigate to server directory
cd /var/www/greenallytics/server

# Generate a secure JWT secret
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Create .env file
cat > .env << EOF
# Server Configuration
NODE_ENV=production
PORT=3001
TCP_PORT=8800

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=greenallytics_gps
DB_USER=greenallytics_admin
DB_PASSWORD=postgres

# JWT Configuration
JWT_SECRET=$JWT_SECRET

# CORS Configuration
CORS_ORIGIN=https://data.greenalytic.rw
EOF

# View the file to verify
cat .env
```

**⚠️ Important**: 
- Replace `YourSecurePassword123` with the same password you used in Step 5
- The JWT_SECRET is auto-generated

If you need to edit manually:
```bash
nano /var/www/greenallytics/server/.env
```

---

### Step 13: Create Frontend Environment File

```bash
# Navigate to root directory
cd /var/www/greenallytics

# Create .env.production file
cat > .env.production << 'EOF'
VITE_API_URL=https://api.greenalytic.rw
EOF

# Verify
cat .env.production
```

---

### Step 14: Install Dependencies

```bash
# Install backend dependencies
cd /var/www/greenallytics/server
npm install --production

# Install frontend dependencies
cd /var/www/greenallytics
npm install
```

This may take a few minutes...

---

### Step 15: Build Frontend

```bash
# Make sure you're in the root directory
cd /var/www/greenallytics

# Build the frontend
npm run build
```

You should see: `✓ built in XXXms` and a `dist` folder created.

Verify:
```bash
ls -la dist/
```

---

### Step 16: Create Systemd Service for Backend

```bash
# Create service file
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

# Reload systemd
sudo systemctl daemon-reload

# Verify service file
sudo systemctl cat greenallytics-backend
```

---

### Step 17: Configure Nginx - Backend API

```bash
# Create Nginx config for API
sudo tee /etc/nginx/sites-available/api.greenalytic.rw > /dev/null << 'EOF'
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

# Verify config
cat /etc/nginx/sites-available/api.greenalytic.rw
```

---

### Step 18: Configure Nginx - Frontend Dashboard

```bash
# Create Nginx config for frontend
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

# Verify config
cat /etc/nginx/sites-available/data.greenalytic.rw
```

---

### Step 19: Enable Nginx Sites

```bash
# Enable API site
sudo ln -sf /etc/nginx/sites-available/api.greenalytic.rw /etc/nginx/sites-enabled/

# Enable frontend site
sudo ln -sf /etc/nginx/sites-available/data.greenalytic.rw /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t
```

You should see: `syntax is ok` and `test is successful`

---

### Step 20: Set File Permissions

```bash
# Set ownership to www-data
sudo chown -R www-data:www-data /var/www/greenallytics

# Set permissions
sudo chmod -R 755 /var/www/greenallytics
```

---

### Step 21: Start Backend Service

```bash
# Start the service
sudo systemctl start greenallytics-backend

# Enable auto-start on boot
sudo systemctl enable greenallytics-backend

# Check status
sudo systemctl status greenallytics-backend
```

You should see: `Active: active (running)`

Press `q` to exit.

**View logs** (optional):
```bash
sudo journalctl -u greenallytics-backend -n 50
```

---

### Step 22: Reload Nginx

```bash
# Restart Nginx to apply new configurations
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

You should see: `Active: active (running)`

---

### Step 23: Test Without SSL (Optional but Recommended)

Before setting up SSL, test if everything works on HTTP:

```bash
# Test backend API
curl http://api.greenalytic.rw/api/health

# Test frontend
curl -I http://data.greenalytic.rw
```

If you get connection errors, check:
- DNS propagation: `nslookup api.greenalytic.rw`
- Backend logs: `sudo journalctl -u greenallytics-backend -n 50`
- Nginx logs: `sudo tail -f /var/log/nginx/error.log`

---

### Step 24: Setup SSL Certificates (HTTPS)

**⚠️ Important**: Make sure DNS is fully propagated before running this. Test with:
```bash
nslookup api.greenalytic.rw
nslookup data.greenalytic.rw
```

Both should return: `10.10.135.196`

Now get SSL certificates:

```bash
sudo certbot --nginx -d api.greenalytic.rw -d data.greenalytic.rw
```

**During the prompts:**
1. **Enter email address**: Your email for urgent renewal and security notices
2. **Agree to Terms**: Type `Y` and press Enter
3. **Share email**: Type `N` (optional)
4. **Redirect HTTP to HTTPS**: Type `2` (recommended) to redirect all HTTP to HTTPS

You should see: `Successfully received certificate` and `Congratulations!`

Certbot automatically:
- Obtains SSL certificates from Let's Encrypt
- Configures Nginx for HTTPS
- Sets up auto-renewal (certificates are valid for 90 days)

**Test auto-renewal:**
```bash
sudo certbot renew --dry-run
```

You should see: `Congratulations, all simulated renewals succeeded`

---

### Step 25: Restart Nginx (Final)

```bash
sudo systemctl restart nginx
sudo systemctl status nginx
```

---

### Step 26: Verify Deployment (HTTPS)

**Test Backend API:**
```bash
curl https://api.greenalytic.rw/api/health
```

Expected response:
```json
{"status":"ok"}
```

**Test Frontend:**
```bash
curl -I https://data.greenalytic.rw
```

Expected: `HTTP/2 200` and `content-type: text/html`

**Test in Browser:**
Open your browser and navigate to:
- Backend API: https://api.greenalytic.rw
- Frontend Dashboard: https://data.greenalytic.rw

You should see:
- API: JSON response or message
- Dashboard: Your GPS tracking login page

---

### Step 27: Create Default Admin User (First Time Only)

The backend should automatically create tables on first startup, but you may need to create an admin user:

```bash
# Connect to PostgreSQL
sudo -u postgres psql -d greenallytics_gps

# Check if users table exists
SELECT * FROM users;

# If empty, create admin user (modify as needed)
INSERT INTO users (username, email, password, role, fullname) 
VALUES ('admin', 'admin@greenalytic.rw', 'hashed_password_here', 'admin', 'System Administrator');

# Exit
\q
```

**Note**: If your backend has a seed script or registration endpoint, use that instead.

---

### Step 28: Configure GPS Device

Send SMS command to your GPS tracker:

```
SERVER,1,api.greenalytic.rw,8800,0#
```

**Expected GPS Response:**
```
SERVER_OK,Currently in use Server:1,api.greenalytic.rw,8800,0;
```

---

### Step 29: Monitor GPS Connections

```bash
# Watch GPS data in real-time
tail -f /var/www/greenallytics/server/gps-data.log
```

When GPS connects, you should see:
```
[timestamp] 🔌 Device connected: IP:PORT
[timestamp] 📡 Raw data (HEX): ...
[timestamp] 📝 Raw data (ASCII): ...
[timestamp] ✅ Parsed GPS data: {...}
[timestamp] ✅ Location saved to database for device IMEI
```

Press `Ctrl+C` to stop watching.

---

## ✅ Deployment Complete!

Your GPS tracking system is now live at:
- **Dashboard**: https://data.greenalytic.rw
- **API**: https://api.greenalytic.rw
- **GPS TCP Server**: api.greenalytic.rw:8800

---

## 🔄 Future Updates (Git Workflow)

When you push changes to your GitHub repository:

```bash
# SSH to server
ssh root@10.10.135.196

# Navigate to app directory
cd /var/www/greenallytics

# If you get "dubious ownership" error, run:
git config --global --add safe.directory /var/www/greenallytics

# If you have local changes that conflict:
git stash  # Save local changes
# OR
git reset --hard origin/main  # Discard local changes (use with caution)

# Pull latest changes
git pull origin main

# Update dependencies (if needed)
npm install
cd server && npm install --production && cd ..

# Rebuild frontend
npm run build

# Restart backend
sudo systemctl restart greenallytics-backend

# Check status
sudo systemctl status greenallytics-backend
sudo journalctl -u greenallytics-backend -n 20
```

**Note**: If you get merge conflicts, use `git reset --hard origin/main` to force overwrite with the latest GitHub code.

---

## 🔍 Monitoring & Troubleshooting

### Check Service Status

```bash
# Backend service
sudo systemctl status greenallytics-backend

# Nginx
sudo systemctl status nginx

# PostgreSQL
sudo systemctl status postgresql
```

### View Logs
```bash
# Real-time logs
sudo journalctl -u greenallytics-backend -f

# Last 100 lines
sudo journalctl -u greenallytics-backend -n 100

# Today's logs
sudo journalctl -u greenallytics-backend --since today
```

### GPS Connection Logs
```bash
# Monitor GPS data
tail -f /var/www/greenallytics/server/gps-data.log

# Last 50 lines
tail -n 50 /var/www/greenallytics/server/gps-data.log
```

### Nginx Logs
```bash
# Access logs
tail -f /var/log/nginx/access.log

# Error logs
tail -f /var/log/nginx/error.log
```

### PostgreSQL Logs
```bash
tail -f /var/log/postgresql/postgresql-16-main.log
```

---

## 🔄 Update Deployment

When you make changes to your code:

```bash
cd /var/www/greenallytics

# Pull latest changes
git pull origin main

# If dependencies changed
npm install
cd server && npm install --production && cd ..

# Rebuild frontend
npm run build

# Restart backend
sudo systemctl restart greenallytics-backend

# Check status
sudo systemctl status greenallytics-backend
```

---

## 🛠️ Troubleshooting

### Backend not starting?

```bash
# Check service status
sudo systemctl status greenallytics-backend

# Check logs for errors
sudo journalctl -u greenallytics-backend -n 50

# Check if port 3001 is in use
sudo netstat -tlnp | grep 3001

# Check database connection
sudo -u postgres psql -d greenallytics_gps -c "SELECT 1;"
```

### GPS not connecting?

```bash
# Check TCP server is listening on all interfaces
sudo netstat -tlnp | grep 8800

# Check firewall allows port 8800
sudo ufw status | grep 8800

# Monitor GPS connection attempts
tail -f /var/www/greenallytics/server/gps-data.log
```

### Nginx issues?

```bash
# Test configuration
sudo nginx -t

# Check error logs
tail -f /var/log/nginx/error.log

# Restart nginx
sudo systemctl restart nginx
```

### SSL certificate issues?

```bash
# Check certificate status
sudo certbot certificates

# Renew certificates manually
sudo certbot renew

# Check nginx SSL configuration
sudo nginx -t
```

---

## 🔐 Security Checklist

- [ ] Changed default PostgreSQL password
- [ ] Generated strong JWT_SECRET
- [ ] Configured firewall (UFW)
- [ ] SSL certificates installed (HTTPS)
- [ ] CORS properly configured
- [ ] File permissions set correctly
- [ ] Regular backups configured

---

## 📊 Performance Optimization

### Enable Nginx Gzip Compression (Already configured)
The Nginx config includes gzip compression for better performance.

### PostgreSQL Tuning
```bash
sudo nano /etc/postgresql/16/main/postgresql.conf

# Adjust based on your server RAM:
shared_buffers = 256MB
effective_cache_size = 1GB
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

---

## 💾 Backup Strategy

### Database Backup

**Manual backup:**
```bash
sudo -u postgres pg_dump greenallytics_gps > backup_$(date +%Y%m%d).sql
```

**Automated daily backup (cron):**
```bash
sudo crontab -e
```

Add:
```cron
0 2 * * * /usr/bin/pg_dump -U postgres greenallytics_gps > /var/backups/greenallytics_$(date +\%Y\%m\%d).sql
```

### Application Backup

```bash
# Backup entire application
tar -czf greenallytics_backup_$(date +%Y%m%d).tar.gz /var/www/greenallytics
```

---

## 📞 Support

If you encounter issues:

1. Check application logs: `sudo journalctl -u greenallytics-backend -f`
2. Check GPS logs: `tail -f /var/www/greenallytics/server/gps-data.log`
3. Check Nginx logs: `tail -f /var/log/nginx/error.log`
4. Verify DNS propagation: `nslookup api.greenalytic.rw`
5. Test connectivity: `curl -v https://api.greenalytic.rw`

---

## ✅ Post-Deployment Checklist

- [ ] DNS records configured and propagated
- [ ] Backend running: `sudo systemctl status greenallytics-backend`
- [ ] Nginx running: `sudo systemctl status nginx`
- [ ] SSL certificates installed: `sudo certbot certificates`
- [ ] Backend API accessible: `curl https://api.greenalytic.rw/api/health`
- [ ] Frontend accessible: Browser → https://gps.greenalytic.rw
- [ ] GPS device configured with domain: `SERVER,1,api.greenalytic.rw,8800,0#`
- [ ] GPS data being received: `tail -f /var/www/greenallytics/server/gps-data.log`
- [ ] Map showing real-time updates
- [ ] Firewall configured: `sudo ufw status`
- [ ] Auto-start enabled: Services start on reboot

---

**🎉 Deployment Complete!**

Your GPS tracking system is now live at:
- **Dashboard**: https://data.greenalytic.rw
- **API**: https://api.greenalytic.rw
