#!/bin/bash

# Production deployment script for Posture Perfect CRM

echo "Starting deployment..."

# Install dependencies
echo "Installing dependencies..."
npm install --production

# Create production database backup
echo "Creating database backup..."
if [ -f "crm.db" ]; then
    cp crm.db "crm_backup_$(date +%Y%m%d_%H%M%S).db"
fi

# Set production environment
export NODE_ENV=production

# Start the application
echo "Starting CRM application..."
npm start

echo "Deployment complete!"
