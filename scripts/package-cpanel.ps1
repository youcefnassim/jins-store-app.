# Script PowerShell de préparation du package de déploiement pour Octenium cPanel
$ErrorActionPreference = "Stop"

$appDir = Resolve-Path "$PSScriptRoot\.."
$zipPath = Join-Path $appDir "cpanel-deploy.zip"
$tempDir = Join-Path $appDir "deploy-staging"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Preparation du ZIP de deploiement cPanel" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Vérifier si .next existe
if (-not (Test-Path "$appDir\.next")) {
    Write-Host "[!] Le dossier .next n'existe pas. Lancement de 'npm run build'..." -ForegroundColor Yellow
    Push-Location $appDir
    npm run build
    Pop-Location
}

# 2. Nettoyer les anciens résidus
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}

New-Item -ItemType Directory -Path $tempDir | Out-Null

Write-Host "[1/4] Copie des fichiers necessaires..." -ForegroundColor Green

# Dossiers a inclure
$folders = @(".next", "public", "messages", "data")
foreach ($folder in $folders) {
    $src = Join-Path $appDir $folder
    if (Test-Path $src) {
        Write-Host "  -> Copie de $folder..."
        Copy-Item -Path $src -Destination (Join-Path $tempDir $folder) -Recurse
    }
}

# Fichiers a inclure
$files = @("package.json", "package-lock.json", "server.js", "next.config.ts")
foreach ($file in $files) {
    $src = Join-Path $appDir $file
    if (Test-Path $src) {
        Write-Host "  -> Copie de $file..."
        Copy-Item -Path $src -Destination (Join-Path $tempDir $file)
    }
}

# 3. Alléger le paquet en supprimant le cache de compilation non nécessaire en production
Write-Host "[2/4] Nettoyage du cache inutile (.next/cache)..." -ForegroundColor Yellow
$cachePath = Join-Path $tempDir ".next\cache"
if (Test-Path $cachePath) {
    Remove-Item $cachePath -Recurse -Force
}

Write-Host "[3/4] Compression ultra-rapide en cpanel-deploy.zip..." -ForegroundColor Green
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipPath -CompressionLevel Fastest

Write-Host "[4/4] Nettoyage du dossier temporaire..." -ForegroundColor Green
Remove-Item $tempDir -Recurse -Force

$zipItem = Get-Item $zipPath
$sizeMb = [math]::Round($zipItem.Length / 1MB, 2)

Write-Host "==========================================" -ForegroundColor Green
Write-Host " [SUCCES] Archive prete !" -ForegroundColor Green
Write-Host " Fichier : $zipPath" -ForegroundColor White
Write-Host " Taille  : $sizeMb Mo" -ForegroundColor White
Write-Host "==========================================" -ForegroundColor Green
