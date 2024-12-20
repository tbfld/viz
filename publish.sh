#!/bin/bash

# Set full environment path
export PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

echo "Node path: $(which node)"
echo "NPX path: $(which npx)"

echo "Starting build process..."
if ! /usr/local/bin/node /usr/local/bin/npx quartz build; then
    echo "Build failed"
    exit 1
fi

echo "Starting sync process..."
if ! /usr/local/bin/node /usr/local/bin/npx quartz sync; then
    echo "Sync failed"
    exit 1
fi

echo "Build and sync completed successfully"