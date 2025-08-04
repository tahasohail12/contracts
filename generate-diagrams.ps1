# NFT Platform - Visual Diagram Generator
# PowerShell script for Windows to generate diagrams from Mermaid files

param(
    [string]$OutputFormat = "both",  # Options: png, svg, both
    [string]$Theme = "default",      # Options: default, dark, forest, neutral
    [int]$Width = 1200,
    [int]$Height = 800
)

Write-Host "🎨 NFT Content Authentication Platform - Diagram Generator" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js detected: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    Write-Host "   Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if Mermaid CLI is installed
try {
    $mermaidVersion = mmdc --version
    Write-Host "✅ Mermaid CLI detected: $mermaidVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Mermaid CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g @mermaid-js/mermaid-cli
    
    # Verify installation
    try {
        $mermaidVersion = mmdc --version
        Write-Host "✅ Mermaid CLI installed: $mermaidVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to install Mermaid CLI" -ForegroundColor Red
        exit 1
    }
}

# Create output directories
$diagramsPath = Join-Path $PSScriptRoot "diagrams"
$pngPath = Join-Path $diagramsPath "png"
$svgPath = Join-Path $diagramsPath "svg"

if (!(Test-Path $pngPath)) { New-Item -ItemType Directory -Path $pngPath -Force | Out-Null }
if (!(Test-Path $svgPath)) { New-Item -ItemType Directory -Path $svgPath -Force | Out-Null }

# Define diagram files
$diagramFiles = @(
    "system-architecture",
    "content-upload-flow", 
    "smart-contract-schema",
    "nft-minting-flow",
    "data-processing-pipeline",
    "marketplace-flow",
    "revenue-flow"
)

$successCount = 0
$totalFiles = $diagramFiles.Count

Write-Host "`n📊 Generating diagrams..." -ForegroundColor Cyan

foreach ($diagram in $diagramFiles) {
    $inputFile = Join-Path $diagramsPath "$diagram.mmd"
    
    if (!(Test-Path $inputFile)) {
        Write-Host "   ⚠️  Skipping: $diagram.mmd (file not found)" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "   🔄 Processing: $diagram.mmd" -ForegroundColor White
    
    try {
        # Generate PNG
        if ($OutputFormat -eq "png" -or $OutputFormat -eq "both") {
            $pngOutput = Join-Path $pngPath "$diagram.png"
            & mmdc -i $inputFile -o $pngOutput -w $Width -H $Height -b white --theme $Theme
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "      ✅ PNG generated successfully" -ForegroundColor Green
            } else {
                Write-Host "      ❌ PNG generation failed" -ForegroundColor Red
            }
        }
        
        # Generate SVG
        if ($OutputFormat -eq "svg" -or $OutputFormat -eq "both") {
            $svgOutput = Join-Path $svgPath "$diagram.svg"
            & mmdc -i $inputFile -o $svgOutput -b white --theme $Theme
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "      ✅ SVG generated successfully" -ForegroundColor Green
            } else {
                Write-Host "      ❌ SVG generation failed" -ForegroundColor Red
            }
        }
        
        $successCount++
        
    } catch {
        Write-Host "      ❌ Error processing $diagram`: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Diagram generation complete!" -ForegroundColor Green
Write-Host "📊 Successfully processed: $successCount/$totalFiles files" -ForegroundColor Cyan

if ($OutputFormat -eq "png" -or $OutputFormat -eq "both") {
    Write-Host "📁 PNG files location: $pngPath" -ForegroundColor Yellow
    $pngFiles = Get-ChildItem -Path $pngPath -Filter "*.png" | Sort-Object Name
    if ($pngFiles.Count -gt 0) {
        Write-Host "   Generated PNG files:" -ForegroundColor White
        foreach ($file in $pngFiles) {
            $fileSize = [math]::Round($file.Length / 1KB, 2)
            Write-Host "   • $($file.Name) ($fileSize KB)" -ForegroundColor Gray
        }
    }
}

if ($OutputFormat -eq "svg" -or $OutputFormat -eq "both") {
    Write-Host "📁 SVG files location: $svgPath" -ForegroundColor Yellow
    $svgFiles = Get-ChildItem -Path $svgPath -Filter "*.svg" | Sort-Object Name
    if ($svgFiles.Count -gt 0) {
        Write-Host "   Generated SVG files:" -ForegroundColor White
        foreach ($file in $svgFiles) {
            $fileSize = [math]::Round($file.Length / 1KB, 2)
            Write-Host "   • $($file.Name) ($fileSize KB)" -ForegroundColor Gray
        }
    }
}

Write-Host "`n💡 Usage examples:" -ForegroundColor Cyan
Write-Host "   .\generate-diagrams.ps1                    # Generate both PNG and SVG" -ForegroundColor Gray
Write-Host "   .\generate-diagrams.ps1 -OutputFormat png  # Generate only PNG" -ForegroundColor Gray
Write-Host "   .\generate-diagrams.ps1 -Theme dark        # Use dark theme" -ForegroundColor Gray
Write-Host "   .\generate-diagrams.ps1 -Width 1600        # Custom width" -ForegroundColor Gray

Write-Host "`n🌐 Online alternatives:" -ForegroundColor Cyan
Write-Host "   • Mermaid Live Editor: https://mermaid.live/" -ForegroundColor Gray
Write-Host "   • Draw.io: https://app.diagrams.net/" -ForegroundColor Gray
