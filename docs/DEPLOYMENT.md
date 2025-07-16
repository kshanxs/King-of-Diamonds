# 🚀 King of Diamonds - Deployment Guide 💎

## 📋 Overview

This guide provides comprehensive instructions for deploying the King of Diamonds game to a production server using Docker, Docker Compose, and modern deployment best practices.

## 🎯 Prerequisites

### System Requirements
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Debian 10+
- **RAM**: Minimum 2GB (Recommended 4GB+)
- **CPU**: 2 cores minimum
- **Storage**: 10GB+ available space
- **Network**: Open ports 80, 443, 5001

### Required Software
```bash
# Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Git
sudo apt update && sudo apt install git -y
```

## 🔧 Quick Deployment

### 1. Clone Repository
```bash
git clone https://github.com/your-username/king-of-diamonds.git
cd king-of-diamonds
```

### 2. Configure Environment
```bash
# Copy environment template
cp .env.production.example backend/.env
cp .env.production.example frontend/.env

# Edit configuration (IMPORTANT!)
nano backend/.env
nano frontend/.env
```

### 3. Deploy with Script
```bash
# Make deployment script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

## 🛠️ Manual Deployment

### 1. Environment Setup
```bash
# Create production environment files
cp .env.production.example backend/.env
cp .env.production.example frontend/.env

# Update configuration
# - Change JWT_SECRET to a strong random string
# - Set CORS_ORIGIN to your domain
# - Configure other settings as needed
```

### 2. Build and Deploy
```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up --build -d

# Development deployment
docker-compose -f docker-compose.dev.yml up --build -d
```

### 3. Verify Deployment
```bash
# Check service status
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Health checks
curl http://localhost:5001/health
curl http://localhost:80/health
```

## 🌐 Domain & SSL Setup

### Nginx Reverse Proxy
```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx config
sudo nano /etc/nginx/sites-available/king-of-diamonds
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /api/ {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /socket.io/ {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/king-of-diamonds /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL with Let's Encrypt
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoring & Maintenance

### Service Management
```bash
# Check service status
sudo systemctl status king-of-diamonds

# Restart services
sudo systemctl restart king-of-diamonds

# View logs
journalctl -u king-of-diamonds -f
```

### Docker Management
```bash
# View running containers
docker ps

# Check container logs
docker logs king-of-diamonds-backend-1
docker logs king-of-diamonds-frontend-1

# Restart containers
docker-compose -f docker-compose.prod.yml restart

# Update deployment
git pull origin main
docker-compose -f docker-compose.prod.yml up --build -d
```

### Health Monitoring
```bash
# Backend health
curl http://localhost:5001/health

# Frontend health  
curl http://localhost:80/health

# Full stack test
curl -f http://your-domain.com/health
```

## 🔒 Security Best Practices

### Firewall Configuration
```bash
# Enable UFW
sudo ufw enable

# Allow SSH, HTTP, HTTPS
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443

# Allow backend port only from localhost
sudo ufw allow from 127.0.0.1 to any port 5001
```

### Environment Security
- ✅ Use strong, unique secrets for JWT and sessions
- ✅ Never commit `.env` files to version control
- ✅ Regularly update Docker images and dependencies
- ✅ Enable fail2ban for SSH protection
- ✅ Use non-root users for services

### Application Security
- ✅ Rate limiting is configured in nginx
- ✅ CORS is properly configured
- ✅ Security headers are set
- ✅ Input validation on all endpoints

## 🚨 Troubleshooting

### Common Issues

**Service won't start:**
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check port conflicts
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :5001
```

**Frontend can't connect to backend:**
```bash
# Verify backend is running
curl http://localhost:5001/health

# Check network connectivity
docker network ls
docker network inspect king-of-diamonds-network
```

**Performance issues:**
```bash
# Monitor resource usage
docker stats

# Check system resources
htop
df -h
free -h
```

### Log Locations
- **Application logs**: `docker-compose logs`
- **Nginx logs**: `/var/log/nginx/`
- **System logs**: `/var/log/syslog`
- **Docker logs**: `/var/lib/docker/containers/`

## 📈 Performance Optimization

### Docker Optimization
```dockerfile
# Multi-stage builds (already implemented)
# Layer caching optimization
# Resource limits in docker-compose
```

### Frontend Optimization
- ✅ Gzip compression enabled
- ✅ Static asset caching
- ✅ Bundle optimization with Vite
- ✅ CDN-ready asset structure

### Backend Optimization
- ✅ Non-blocking I/O with Node.js
- ✅ Efficient Socket.io configuration
- ✅ Memory usage optimization
- ✅ Process management with PM2 (optional)

## 🔄 Backup & Recovery

### Automated Backups
```bash
# Create backup script
sudo nano /opt/scripts/backup-king-of-diamonds.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/king-of-diamonds"
DATE=$(date +%Y%m%d-%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application data
tar -czf "$BACKUP_DIR/app-$DATE.tar.gz" /opt/king-of-diamonds

# Backup Docker volumes (if any)
# docker run --rm -v king-of-diamonds_data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/volumes-$DATE.tar.gz /data

# Cleanup old backups (keep last 7 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

```bash
# Make executable and schedule
chmod +x /opt/scripts/backup-king-of-diamonds.sh
echo "0 2 * * * /opt/scripts/backup-king-of-diamonds.sh" | sudo crontab -
```

## 🎮 Go Live!

Once deployment is complete:

1. ✅ **Test all game features**
2. ✅ **Verify health endpoints**
3. ✅ **Check SSL certificate**
4. ✅ **Monitor performance**
5. ✅ **Set up alerts**

Your King of Diamonds game is now live! 🎉

## 📞 Support

For deployment issues:
- Check the troubleshooting section above
- Review Docker logs: `docker-compose logs`
- Check system resources: `htop`, `df -h`
- Verify network connectivity
- Ensure all environment variables are set correctly

Happy gaming! 💎🎮
