#!/bin/bash

echo "Starting build process..."

# Clean dist directory
if [ -d "./dist" ]; then
  echo "Cleaning dist directory..."
  rm -rf ./dist
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Try to find and use TypeScript
echo "Looking for TypeScript..."

# Try different TypeScript commands
if command -v tsc &> /dev/null; then
  echo "Using system tsc..."
  tsc --skipLibCheck true --noImplicitAny false
elif [ -f "./node_modules/.bin/tsc" ]; then
  echo "Using local tsc..."
  ./node_modules/.bin/tsc --skipLibCheck true --noImplicitAny false
elif [ -f "./node_modules/typescript/bin/tsc" ]; then
  echo "Using typescript package tsc..."
  ./node_modules/typescript/bin/tsc --skipLibCheck true --noImplicitAny false
else
  echo "Using npx tsc..."
  npx tsc --skipLibCheck true --noImplicitAny false
fi

echo "Build completed!"
