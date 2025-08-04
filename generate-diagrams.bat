@echo off
REM NFT Content Authentication Platform - Diagram Generator (Windows)
REM This script generates PNG images from Mermaid diagram files

echo 🎨 Generating Visual Diagrams for NFT Content Authentication Platform
echo ======================================================================

REM Check if mermaid-cli is installed
where mmdc >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Mermaid CLI not found. Installing...
    npm install -g @mermaid-js/mermaid-cli
)

REM Create output directories
if not exist "diagrams\png" mkdir "diagrams\png"
if not exist "diagrams\svg" mkdir "diagrams\svg"

echo 📊 Generating PNG diagrams...

REM Generate system architecture
echo   🔄 Processing: system-architecture.mmd
call mmdc -i "diagrams\system-architecture.mmd" -o "diagrams\png\system-architecture.png" -w 1200 -H 800 -b white --theme default
if %errorlevel% equ 0 (echo   ✅ Generated: system-architecture.png) else (echo   ❌ Failed: system-architecture.png)

REM Generate content upload flow
echo   🔄 Processing: content-upload-flow.mmd
call mmdc -i "diagrams\content-upload-flow.mmd" -o "diagrams\png\content-upload-flow.png" -w 1200 -H 800 -b white --theme default
if %errorlevel% equ 0 (echo   ✅ Generated: content-upload-flow.png) else (echo   ❌ Failed: content-upload-flow.png)

REM Generate smart contract schema
echo   🔄 Processing: smart-contract-schema.mmd
call mmdc -i "diagrams\smart-contract-schema.mmd" -o "diagrams\png\smart-contract-schema.png" -w 1200 -H 800 -b white --theme default
if %errorlevel% equ 0 (echo   ✅ Generated: smart-contract-schema.png) else (echo   ❌ Failed: smart-contract-schema.png)

REM Generate NFT minting flow
echo   🔄 Processing: nft-minting-flow.mmd
call mmdc -i "diagrams\nft-minting-flow.mmd" -o "diagrams\png\nft-minting-flow.png" -w 1200 -H 800 -b white --theme default
if %errorlevel% equ 0 (echo   ✅ Generated: nft-minting-flow.png) else (echo   ❌ Failed: nft-minting-flow.png)

REM Generate data processing pipeline
echo   🔄 Processing: data-processing-pipeline.mmd
call mmdc -i "diagrams\data-processing-pipeline.mmd" -o "diagrams\png\data-processing-pipeline.png" -w 1200 -H 800 -b white --theme default
if %errorlevel% equ 0 (echo   ✅ Generated: data-processing-pipeline.png) else (echo   ❌ Failed: data-processing-pipeline.png)

REM Generate marketplace flow
echo   🔄 Processing: marketplace-flow.mmd
call mmdc -i "diagrams\marketplace-flow.mmd" -o "diagrams\png\marketplace-flow.png" -w 1200 -H 800 -b white --theme default
if %errorlevel% equ 0 (echo   ✅ Generated: marketplace-flow.png) else (echo   ❌ Failed: marketplace-flow.png)

REM Generate revenue flow
echo   🔄 Processing: revenue-flow.mmd
call mmdc -i "diagrams\revenue-flow.mmd" -o "diagrams\png\revenue-flow.png" -w 1200 -H 800 -b white --theme default
if %errorlevel% equ 0 (echo   ✅ Generated: revenue-flow.png) else (echo   ❌ Failed: revenue-flow.png)

echo.
echo 📊 Generating SVG diagrams...

REM Generate SVG versions
call mmdc -i "diagrams\system-architecture.mmd" -o "diagrams\svg\system-architecture.svg" -b white --theme default
call mmdc -i "diagrams\content-upload-flow.mmd" -o "diagrams\svg\content-upload-flow.svg" -b white --theme default
call mmdc -i "diagrams\smart-contract-schema.mmd" -o "diagrams\svg\smart-contract-schema.svg" -b white --theme default
call mmdc -i "diagrams\nft-minting-flow.mmd" -o "diagrams\svg\nft-minting-flow.svg" -b white --theme default
call mmdc -i "diagrams\data-processing-pipeline.mmd" -o "diagrams\svg\data-processing-pipeline.svg" -b white --theme default
call mmdc -i "diagrams\marketplace-flow.mmd" -o "diagrams\svg\marketplace-flow.svg" -b white --theme default
call mmdc -i "diagrams\revenue-flow.mmd" -o "diagrams\svg\revenue-flow.svg" -b white --theme default

echo.
echo 🎉 Diagram generation complete!
echo 📁 PNG Output directory: diagrams\png\
echo 📁 SVG Output directory: diagrams\svg\
echo.
echo 🖼️ Generated files:
dir /b diagrams\png\*.png 2>nul || echo    No PNG files found - check for errors above
echo.
pause
