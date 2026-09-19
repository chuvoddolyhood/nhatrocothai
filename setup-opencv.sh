#!/bin/bash

# Setup OpenCV.js for self-hosting
# Run this script after npm install

echo "📦 Setting up OpenCV.js..."

# Check if opencv.js already exists
if [ -f "public/opencv.js" ]; then
    echo "✅ opencv.js already exists in public/ folder"
    exit 0
fi

# Check if @techstark/opencv-js is installed
if [ ! -d "node_modules/@techstark/opencv-js" ]; then
    echo "⚠️  @techstark/opencv-js not found in node_modules"
    echo "📥 Installing @techstark/opencv-js..."
    npm install --save-dev @techstark/opencv-js
fi

# Copy opencv.js to public folder
echo "📋 Copying opencv.js to public/ folder..."
cp node_modules/@techstark/opencv-js/dist/opencv.js public/

# Check file size
FILE_SIZE=$(du -h public/opencv.js | cut -f1)
echo "✅ OpenCV.js setup complete! (Size: $FILE_SIZE)"
echo ""
echo "ℹ️  This file is served from /public/opencv.js"
echo "ℹ️  File is ignored in .gitignore to avoid committing large files"
echo ""
echo "🚀 You can now run: npm run dev"
