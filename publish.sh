#!/bin/bash

echo "Starting build process..."
if ! npx quartz build; then
    echo "Build failed"
    exit 1
fi

echo "Starting sync process..."
if ! npx quartz sync; then
    echo "Sync failed"
    exit 1
fi

echo "Build and sync completed successfully"