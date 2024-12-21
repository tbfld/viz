#!/bin/bash

echo "🚀 Starting Quartz build and sync..."

echo "📦 Building site..."
if ! /usr/local/bin/node /usr/local/bin/npx quartz build; then
    echo "❌ Build failed"
    exit 1
fi
echo "✅ Build completed"

echo "🔄 Syncing to GitHub..."
if ! /usr/local/bin/node /usr/local/bin/npx quartz sync; then
    echo "❌ Sync failed"
    exit 1
fi
echo "✅ Sync completed"