#!/bin/bash

# Suppress Node.js warnings
export NODE_NO_WARNINGS=1

echo "Starting build process..."
if ! /usr/local/bin/node /usr/local/bin/npx quartz build 2>/dev/null; then
    echo "Build failed"
    exit 1
fi

echo "Starting sync process..."
if ! /usr/local/bin/node /usr/local/bin/npx quartz sync 2>/dev/null; then
    echo "Sync failed"
    exit 1
fi

echo "Build and sync completed successfully"