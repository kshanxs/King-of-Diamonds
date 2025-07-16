#!/bin/bash

# 🚀 King of Diamonds - Production Deployment Script 💎

set -e

echo "🎮 Deploying King of Diamonds to Production..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/your-username/king-of-diamonds.git"
DEPLOY_DIR="/opt/king-of-diamonds"
BACKUP_DIR="/opt/backups/king-of-diamonds"
SERVICE_NAME="king-of-diamonds"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   log_error "This script should not be run as root for security reasons"
   exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create backup directory
log_info "Creating backup directory..."
sudo mkdir -p $BACKUP_DIR

# Backup current deployment if it exists
if [ -d "$DEPLOY_DIR" ]; then
    log_info "Creating backup of current deployment..."
    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
    sudo cp -r $DEPLOY_DIR "$BACKUP_DIR/$BACKUP_NAME"
    log_success "Backup created: $BACKUP_DIR/$BACKUP_NAME"
fi

# Create deployment directory
log_info "Setting up deployment directory..."
sudo mkdir -p $DEPLOY_DIR
sudo chown $(whoami):$(whoami) $DEPLOY_DIR

# Clone or update repository
if [ -d "$DEPLOY_DIR/.git" ]; then
    log_info "Updating existing repository..."
    cd $DEPLOY_DIR
    git fetch origin
    git reset --hard origin/main
else
    log_info "Cloning repository..."
    git clone $REPO_URL $DEPLOY_DIR
    cd $DEPLOY_DIR
fi

# Copy environment files (you should have these prepared)
log_info "Setting up environment configuration..."
if [ -f "/opt/config/king-of-diamonds/.env.production" ]; then
    cp /opt/config/king-of-diamonds/.env.production ./backend/.env
    cp /opt/config/king-of-diamonds/.env.production ./frontend/.env
else
    log_warning "Production environment files not found. Please ensure they are set up."
fi

# Stop existing services
log_info "Stopping existing services..."
docker-compose -f docker-compose.prod.yml down || true

# Remove old images
log_info "Cleaning up old Docker images..."
docker system prune -f

# Build and start services
log_info "Building and starting services..."
docker-compose -f docker-compose.prod.yml up --build -d

# Wait for services to be healthy
log_info "Waiting for services to be healthy..."
sleep 30

# Check if services are running
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    log_success "Services are running!"
else
    log_error "Services failed to start properly"
    docker-compose -f docker-compose.prod.yml logs
    exit 1
fi

# Setup log rotation
log_info "Setting up log rotation..."
sudo tee /etc/logrotate.d/king-of-diamonds > /dev/null <<EOF
/var/lib/docker/containers/*/*-json.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0644 root root
}
EOF

# Setup systemd service for auto-restart
log_info "Setting up systemd service..."
sudo tee /etc/systemd/system/king-of-diamonds.service > /dev/null <<EOF
[Unit]
Description=King of Diamonds Game Server
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$DEPLOY_DIR
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable king-of-diamonds

# Setup monitoring script
log_info "Setting up monitoring..."
sudo tee /opt/scripts/monitor-king-of-diamonds.sh > /dev/null <<'EOF'
#!/bin/bash
# Simple monitoring script for King of Diamonds

HEALTH_CHECK_URL="http://localhost:5001/health"
LOG_FILE="/var/log/king-of-diamonds-monitor.log"

if ! curl -f $HEALTH_CHECK_URL > /dev/null 2>&1; then
    echo "$(date): Health check failed, restarting services..." >> $LOG_FILE
    cd /opt/king-of-diamonds
    docker-compose -f docker-compose.prod.yml restart
fi
EOF

sudo chmod +x /opt/scripts/monitor-king-of-diamonds.sh

# Add to crontab for monitoring
(sudo crontab -l 2>/dev/null; echo "*/5 * * * * /opt/scripts/monitor-king-of-diamonds.sh") | sudo crontab -

log_success "🎉 Deployment completed successfully!"
log_info "🌐 Frontend should be available at: http://your-domain"
log_info "🔧 Backend API available at: http://your-domain:5001"
log_info "📊 Monitor logs with: docker-compose -f docker-compose.prod.yml logs -f"
log_info "🔄 Restart services with: sudo systemctl restart king-of-diamonds"

echo ""
echo "🎮 King of Diamonds is now live! Good luck and have fun! 💎"
