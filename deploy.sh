#!/bin/bash

# Production deployment script for Tampan Farm
# This script applies database migrations and deploys the application to Cloudflare Workers

set -e  # Exit on error

echo "🚀 Starting production deployment..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if there are uncommitted changes
if [[ -n $(git status -s) ]]; then
  echo -e "${YELLOW}⚠️  Warning: You have uncommitted changes${NC}"
  read -p "Continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 1
  fi
fi

# Step 1: Apply database migrations to production
echo "📊 Step 1/3: Applying database migrations to production..."

# Check if there are migrations to apply
MIGRATIONS_TO_APPLY=$(npx wrangler d1 migrations list tampan-farm-db --remote 2>/dev/null | grep -c "│" || echo "0")

if [ "$MIGRATIONS_TO_APPLY" -gt 3 ]; then
  npx wrangler d1 migrations apply tampan-farm-db --remote
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Migrations applied successfully${NC}"
  else
    echo -e "${YELLOW}⚠️  Migration failed or already applied${NC}"
    read -p "Continue with deployment? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      exit 1
    fi
  fi
else
  echo -e "${GREEN}✅ No new migrations to apply${NC}"
fi

echo ""

# Step 2: Build the project
echo "🔨 Step 2/3: Building project..."
npm run build

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Build successful${NC}"
else
  echo -e "${RED}❌ Build failed${NC}"
  exit 1
fi

echo ""

# Step 3: Deploy to Cloudflare Workers
echo "☁️  Step 3/3: Deploying to Cloudflare Workers..."
npx wrangler deploy

if [ $? -eq 0 ]; then
  echo ""
  echo -e "${GREEN}✅ Deployment successful!${NC}"
  echo ""
  echo "🎉 Your application is now live!"
else
  echo -e "${RED}❌ Deployment failed${NC}"
  exit 1
fi
