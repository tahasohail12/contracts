#!/bin/bash

# NFT Content Authentication Platform - Diagram Generator
# This script generates PNG images from Mermaid diagram files

echo "🎨 Generating Visual Diagrams for NFT Content Authentication Platform"
echo "======================================================================"

# Check if mermaid-cli is installed
if ! command -v mmdc &> /dev/null; then
    echo "❌ Mermaid CLI not found. Installing..."
    npm install -g @mermaid-js/mermaid-cli
fi

# Create output directory
mkdir -p "diagrams/png"

# Array of diagram files
diagrams=(
    "system-architecture"
    "content-upload-flow" 
    "smart-contract-schema"
    "nft-minting-flow"
    "data-processing-pipeline"
    "marketplace-flow"
    "revenue-flow"
)

# Generate PNG files
echo "📊 Generating diagrams..."
for diagram in "${diagrams[@]}"; do
    echo "  🔄 Processing: $diagram.mmd"
    mmdc -i "diagrams/$diagram.mmd" \
         -o "diagrams/png/$diagram.png" \
         -w 1200 \
         -H 800 \
         -b white \
         --theme default
    
    if [ $? -eq 0 ]; then
        echo "  ✅ Generated: diagrams/png/$diagram.png"
    else
        echo "  ❌ Failed to generate: $diagram.png"
    fi
done

echo ""
echo "🎉 Diagram generation complete!"
echo "📁 Output directory: diagrams/png/"
echo "🖼️ Generated files:"
ls -la diagrams/png/*.png 2>/dev/null || echo "   No PNG files found - check for errors above"

# Generate SVG versions (vector graphics)
echo ""
echo "📊 Generating SVG versions..."
mkdir -p "diagrams/svg"

for diagram in "${diagrams[@]}"; do
    echo "  🔄 Processing SVG: $diagram.mmd"
    mmdc -i "diagrams/$diagram.mmd" \
         -o "diagrams/svg/$diagram.svg" \
         -b white \
         --theme default
    
    if [ $? -eq 0 ]; then
        echo "  ✅ Generated: diagrams/svg/$diagram.svg"
    else
        echo "  ❌ Failed to generate: $diagram.svg"
    fi
done

echo ""
echo "🎨 All diagrams generated successfully!"
echo "📊 PNG files (raster): diagrams/png/"
echo "🖼️ SVG files (vector): diagrams/svg/"
