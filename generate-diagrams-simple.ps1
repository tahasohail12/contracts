# NFT Platform - Simple Diagram Generator
# PowerShell script for Windows

Write-Host "NFT Content Authentication Platform - Diagram Generator" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js detected: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if Mermaid CLI is installed
try {
    $mermaidVersion = mmdc --version
    Write-Host "Mermaid CLI detected: $mermaidVersion" -ForegroundColor Green
} catch {
    Write-Host "Mermaid CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g @mermaid-js/mermaid-cli
}

# Create output directories
$diagramsPath = Join-Path $PSScriptRoot "diagrams"
$pngPath = Join-Path $diagramsPath "png"
$svgPath = Join-Path $diagramsPath "svg"

if (!(Test-Path $pngPath)) { New-Item -ItemType Directory -Path $pngPath -Force | Out-Null }
if (!(Test-Path $svgPath)) { New-Item -ItemType Directory -Path $svgPath -Force | Out-Null }

# Define the 3 main diagrams you need
$diagramFiles = @(
    "system-architecture",
    "smart-contract-schema",
    "data-processing-pipeline"
)

Write-Host "`nGenerating your 3 main diagrams..." -ForegroundColor Cyan

foreach ($diagram in $diagramFiles) {
    $inputFile = Join-Path $diagramsPath "$diagram.mmd"
    
    if (!(Test-Path $inputFile)) {
        Write-Host "Skipping: $diagram.mmd (file not found)" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "Processing: $diagram.mmd" -ForegroundColor White
    
    try {
        # Generate PNG
        $pngOutput = Join-Path $pngPath "$diagram.png"
        & mmdc -i $inputFile -o $pngOutput -w 1200 -H 800 -b white --theme default
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  PNG generated successfully" -ForegroundColor Green
        } else {
            Write-Host "  PNG generation failed" -ForegroundColor Red
        }
        
        # Generate SVG
        $svgOutput = Join-Path $svgPath "$diagram.svg"
        & mmdc -i $inputFile -o $svgOutput -b white --theme default
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  SVG generated successfully" -ForegroundColor Green
        } else {
            Write-Host "  SVG generation failed" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "  Error processing $diagram" -ForegroundColor Red
    }
}

Write-Host "`nDiagram generation complete!" -ForegroundColor Green
Write-Host "PNG files location: $pngPath" -ForegroundColor Yellow
Write-Host "SVG files location: $svgPath" -ForegroundColor Yellow

# List generated files
Write-Host "`nGenerated files:" -ForegroundColor White
Get-ChildItem -Path $pngPath -Filter "*.png" | ForEach-Object { Write-Host "  $($_.Name)" -ForegroundColor Gray }
Get-ChildItem -Path $svgPath -Filter "*.svg" | ForEach-Object { Write-Host "  $($_.Name)" -ForegroundColor Gray }
