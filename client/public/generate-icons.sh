#!/bin/bash
# Generate simple placeholder icons for PWA
# Blue gradient background with "P" letter

# Create 192x192 icon
convert -size 192x192 gradient:'#3b82f6-#1d4ed8' \
  -gravity center -pointsize 120 -fill white -annotate +0+0 'P' \
  icon-192.png 2>/dev/null || echo "ImageMagick not available, using placeholder"

# Create 512x512 icon  
convert -size 512x512 gradient:'#3b82f6-#1d4ed8' \
  -gravity center -pointsize 320 -fill white -annotate +0+0 'P' \
  icon-512.png 2>/dev/null || echo "ImageMagick not available, using placeholder"

# If ImageMagick failed, create simple colored squares
if [ ! -f icon-192.png ]; then
  convert -size 192x192 xc:'#3b82f6' icon-192.png 2>/dev/null || touch icon-192.png
fi

if [ ! -f icon-512.png ]; then
  convert -size 512x512 xc:'#3b82f6' icon-512.png 2>/dev/null || touch icon-512.png
fi
