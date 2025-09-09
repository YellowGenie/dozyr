#!/bin/bash
# Frontend Deployment Script for Dozyr Client
# Usage: ./deploy.sh [production|staging]

set -e

ENVIRONMENT=${1:-production}
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

echo "🚀 Starting frontend deployment process for $ENVIRONMENT environment..."

# Load environment variables
if [ -f ".env.$ENVIRONMENT.local" ]; then
    export $(cat .env.$ENVIRONMENT.local | grep -v '^#' | xargs)
    echo "✅ Environment variables loaded from .env.$ENVIRONMENT.local"
else
    echo "❌ Environment file .env.$ENVIRONMENT.local not found!"
    exit 1
fi

# Validate required environment variables
required_vars=(
    "SSH_USER"
    "SSH_HOST"
    "FRONTEND_DEPLOY_PATH"
    "NEXT_PUBLIC_API_URL"
)

echo "🔍 Validating environment variables..."
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Required environment variable $var is not set"
        exit 1
    fi
done
echo "✅ All required environment variables are set"

# Install dependencies and build
echo "📚 Installing dependencies..."
npm ci

echo "🏗️ Building application..."
npm run build

# Create deployment package
echo "📦 Creating deployment package..."
rm -rf deploy-temp
mkdir deploy-temp

# Copy built application files
cp -r .next deploy-temp/
cp -r public deploy-temp/
cp package.json deploy-temp/
cp package-lock.json deploy-temp/

# Copy configuration files if they exist
[ -f "next.config.js" ] && cp next.config.js deploy-temp/
[ -f ".env.$ENVIRONMENT.local" ] && cp ".env.$ENVIRONMENT.local" deploy-temp/.env.local

cd deploy-temp

# Install production dependencies for any server-side functionality
npm ci --production

# Create deployment archive
cd ..
tar -czf "frontend-$ENVIRONMENT-$TIMESTAMP.tar.gz" -C deploy-temp .
rm -rf deploy-temp

echo "✅ Deployment package created: frontend-$ENVIRONMENT-$TIMESTAMP.tar.gz"

# Upload and deploy
echo "🚀 Uploading to server..."
scp "frontend-$ENVIRONMENT-$TIMESTAMP.tar.gz" "$SSH_USER@$SSH_HOST:/tmp/"

echo "🔄 Deploying on server..."
ssh "$SSH_USER@$SSH_HOST" << EOF
    set -e
    cd "$FRONTEND_DEPLOY_PATH"
    
    # Create backup of current deployment
    if [ -d "current" ]; then
        echo "💾 Creating backup..."
        cp -r current "backup-$TIMESTAMP"
        
        # Keep only last 5 backups
        ls -1d backup-* | head -n -5 | xargs rm -rf 2>/dev/null || true
    fi
    
    # Extract new deployment
    echo "📂 Extracting new deployment..."
    mkdir -p "new-$TIMESTAMP"
    cd "new-$TIMESTAMP"
    tar -xzf "/tmp/frontend-$ENVIRONMENT-$TIMESTAMP.tar.gz"
    
    # Install any remaining dependencies
    npm ci --production
    
    # Setup web server configuration
    echo "⚙️ Setting up web server configuration..."
    
    # Create .htaccess for Apache (if using Apache)
    cat > .htaccess << 'HTACCESS_EOF'
# Next.js Static Export Configuration
RewriteEngine On

# Handle client-side routing for Next.js
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteCond %{REQUEST_URI} !^/_next/
RewriteCond %{REQUEST_URI} !^/static/
RewriteRule ^(.*)$ /index.html [L]

# Cache static assets
<FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|map)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
    Header set Cache-Control "public, immutable"
</FilesMatch>

# Cache HTML files for shorter period
<FilesMatch "\.(html|htm)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 hour"
    Header set Cache-Control "public, must-revalidate"
</FilesMatch>

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https:;"

# Gzip compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
HTACCESS_EOF
    
    # Create nginx.conf snippet (if using Nginx)
    cat > nginx.conf << 'NGINX_EOF'
# Next.js Frontend Configuration
location / {
    try_files \$uri \$uri/ /index.html;
}

location /_next/static/ {
    add_header Cache-Control "public, immutable, max-age=31536000";
}

location /static/ {
    add_header Cache-Control "public, immutable, max-age=31536000";
}

# Security headers
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Gzip compression
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
NGINX_EOF
    
    # Switch to new deployment
    cd ..
    if [ -d "current" ]; then
        rm -rf current
    fi
    mv "new-$TIMESTAMP" current
    
    # Set proper permissions
    cd current
    find . -type f -exec chmod 644 {} \;
    find . -type d -exec chmod 755 {} \;
    
    # Cleanup
    rm "/tmp/frontend-$ENVIRONMENT-$TIMESTAMP.tar.gz"
    
    echo "✅ Frontend deployment completed successfully!"
    ls -la
EOF

# Cleanup local files
rm "frontend-$ENVIRONMENT-$TIMESTAMP.tar.gz"

echo "🎉 Frontend deployment to $ENVIRONMENT completed successfully!"
echo "🔗 Application should be available at: https://yourdomain.com"