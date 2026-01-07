# 🚀 Quick Deployment Reference

## Domains
- **API + GPS Server**: api.greenalytic.rw
- **Dashboard**: data.greenalytic.rw
- **Server IP**: 10.10.135.196

## 📝 Step-by-Step Commands

### 1. Configure DNS (Do First!)
```
api.greenalytic.rw  → A → 10.10.135.196
data.greenalytic.rw → A → 10.10.135.196
```

### 2. Upload Setup Script
```bash
scp deploy-ubuntu.sh root@10.10.135.196:/root/
```

### 3. Run Setup on Server
```bash
ssh root@10.10.135.196
chmod +x /root/deploy-ubuntu.sh
/root/deploy-ubuntu.sh
```

### 4. Clone Repository
```bash
cd /var/www/greenallytics
git clone YOUR_GITHUB_REPO_URL .
```

### 5. Configure Backend
```bash
cd /var/www/greenallytics/server
cp .env.production .env
nano .env  # Update passwords and secrets
```

Generate JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 6. Install & Build
```bash
# Backend
cd /var/www/greenallytics/server
npm install --production

# Frontend
cd /var/www/greenallytics
npm install
npm run build

# Permissions
sudo chown -R www-data:www-data /var/www/greenallytics
```

### 7. Start Backend
```bash
sudo systemctl start greenallytics-backend
sudo systemctl enable greenallytics-backend
sudo systemctl status greenallytics-backend
```

### 8. Setup SSL
```bash
sudo certbot --nginx -d api.greenalytic.rw -d data.greenalytic.rw
```

### 9. Restart Nginx
```bash
sudo systemctl restart nginx
```

### 10. Test
```bash
curl https://api.greenalytic.rw/api/health
curl -I https://data.greenalytic.rw
```

Browser: https://data.greenalytic.rw

### 11. Configure GPS
SMS: `SERVER,1,api.greenalytic.rw,8800,0#`

---

## 🔄 Updates (Git Workflow)

```bash
cd /var/www/greenallytics
git pull origin main

# If dependencies changed
npm install
cd server && npm install --production && cd ..

# Rebuild frontend
npm run build

# Restart backend (if changed)
sudo systemctl restart greenallytics-backend
```

---

## 📊 Monitoring

```bash
# Backend logs
sudo journalctl -u greenallytics-backend -f

# GPS data
tail -f /var/www/greenallytics/server/gps-data.log

# Nginx errors
tail -f /var/log/nginx/error.log

# Service status
sudo systemctl status greenallytics-backend
sudo systemctl status nginx
```

---

## 🔧 Troubleshooting

```bash
# Check ports
sudo netstat -tlnp | grep -E "3001|8800"

# Check firewall
sudo ufw status

# Test database
sudo -u postgres psql -d greenallytics_gps -c "SELECT 1;"

# Restart services
sudo systemctl restart greenallytics-backend
sudo systemctl restart nginx
sudo systemctl restart postgresql

# View full logs
sudo journalctl -u greenallytics-backend -n 100
```

---

## ✅ Production Checklist

- [ ] DNS configured and propagated
- [ ] Setup script executed successfully
- [ ] Repository cloned
- [ ] Backend .env configured with secure passwords
- [ ] Dependencies installed
- [ ] Frontend built successfully
- [ ] Backend service running
- [ ] SSL certificates installed
- [ ] Nginx running
- [ ] API responding: `curl https://api.greenalytic.rw/api/health`
- [ ] Dashboard accessible: https://data.greenalytic.rw
- [ ] GPS device configured
- [ ] GPS data being received
- [ ] Map showing real-time updates

---

**Live URLs:**
- Dashboard: https://data.greenalytic.rw
- API: https://api.greenalytic.rw
