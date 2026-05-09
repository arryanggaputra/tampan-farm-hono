#!/bin/bash

# Quick deployment script (skips migrations - use when no DB changes)
# For full deployment with migrations, use ./deploy.sh

set -e

echo "🚀 Quick deployment (skipping migrations)..."

npm run build && npx wrangler deploy

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Deployment successful!"
else
  echo "❌ Deployment failed"
  exit 1
fi
