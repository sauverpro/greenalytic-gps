#!/bin/bash

# ============================================================================
# Quick Deployment Commands - Copy & Paste
# ============================================================================

echo "GreenAlytics Deployment - Quick Start"
echo ""

# ============================================================================
# STEP 1: Upload Deployment Script
# ============================================================================
echo "From your Windows machine, run:"
echo "scp D:/greenAlytics/dashboard/deploy-ubuntu.sh root@10.10.135.196:/root/"
echo ""
echo "Press Enter when done..."
read

# ============================================================================
# STEP 2: Run Deployment Script on Server
# ============================================================================
echo "On the server, run:"
echo "chmod +x /root/deploy-ubuntu.sh"
echo "/root/deploy-ubuntu.sh"
echo ""
echo "Press Enter when done..."
read

# ============================================================================
# STEP 3: Upload Application Code
# ============================================================================
echo "Choose upload method:"
echo "Git clone from repository (recommended)"
echo ""
read -p "Enter your GitHub repository URL: " repo_url

if [ -n "$repo_url" ]; then
  echo ""
  echo "On the server, run:"
  echo "cd /var/www/greenallytics"
  echo "git clone $repo_url ."
  echo ""
  echo "For future updates:"
  echo "cd /var/www/greenallytics"
  echo "git pull origin main"
fi

echo ""
echo "Press Enter when done..."
read

# ============================================================================
# STEP 4: Configure Backend Environment
# ============================================================================
echo ""
echo "On the server, configure backend .env:"
echo ""
echo "cd /var/www/greenallytics/server"
echo "nano .env"
echo ""
echo "Paste this configuration:"
echo ""
cat << 'EOF'
# Server Configuration
NODE_ENV=production
PORT=3001
TCP_PORT=8800

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=greenallytics_gps
DB_USER=greenallytics_admin
DB_PASSWORD=CHANGE_THIS_PASSWORD

# JWT Configuration (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=GENERATE_SECURE_SECRET_HERE

# CORS Configuration
CORS_ORIGIN=https://data.greenalytic.rw
EOF
echo ""
echo "Press Enter when done..."
read

# ============================================================================
# STEP 5: Install Dependencies and Build
# ============================================================================
echo ""
echo "On the server, run:"
echo ""
echo "# Backend"
echo "cd /var/www/greenallytics/server"
echo "npm install --production"
echo ""
echo "# Frontend"
echo "cd /var/www/greenallytics"
echo "npm install"
echo "npm run build"
echo ""
echo "# Set permissions"
echo "sudo chown -R www-data:www-data /var/www/greenallytics"
echo "sudo chmod -R 755 /var/www/greenallytics"
echo ""
echo "Press Enter when done..."
read

# ============================================================================
# STEP 6: Start Services
# ============================================================================
echo ""
echo "On the server, run:"
echo ""
echo "# Start backend"
echo "sudo systemctl start greenallytics-backend"
echo "sudo systemctl enable greenallytics-backend"
echo ""
echo "# Check status"
echo "sudo systemctl status greenallytics-backend"
echo ""
echo "Press Enter when done..."
read

# ============================================================================
# STEP 7: Setup SSL
# ============================================================================
echo ""
echo "On the server, run:"
echo ""
echo "sudo certbot --nginx -d api.greenalytic.rw -d data.greenalytic.rw"
echo ""
echo "Follow the prompts (enter email, agree to terms, redirect HTTP to HTTPS)"
echo ""
echo "Press Enter when done..."
read

# ============================================================================
# STEP 8: Restart Nginx
# ============================================================================
echo ""
echo "On the server, run:"
echo ""
echo "sudo systemctl restart nginx"
echo "sudo systemctl status nginx"
echo ""
echo "Press Enter when done..."
read

# ============================================================================
# STEP 9: Test Deployment
# ============================================================================
echo ""
echo "Test the deployment:"
echo ""
echo "# Test backend API"
echo "curl https://api.greenalytic.rw/api/health"
echo ""
echo "# Test frontend"
echo "curl -I https://data.greenalytic.rw"
echo ""
echo "# In browser"
echo "https://data.greenalytic.rw"
echo ""
echo "Press Enter when done..."
read

# ============================================================================
# STEP 10: Configure GPS Device
# ============================================================================
echo ""
echo "Send SMS to GPS device:"
echo ""
echo "SERVER,1,api.greenalytic.rw,8800,0#"
echo ""
echo "Expected response: SERVER_OK,Currently in use Server:1,api.greenalytic.rw,8800,0;"
echo ""
echo "Monitor GPS connections:"
echo "tail -f /var/www/greenallytics/server/gps-data.log"
echo ""
echo ""
echo "============================================================================"
echo "✅ DEPLOYMENT COMPLETE!"
echo "============================================================================"
echo ""
echo "Dashboard: https://data.greenalytic.rw"
echo "API: https://api.greenalytic.rw"
echo ""
echo "Monitor logs:"
echo "sudo journalctl -u greenallytics-backend -f"
echo ""
