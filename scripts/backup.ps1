param(
    [string]$ProjectRoot = (Resolve-Path "$PSScriptRoot\..").Path,
    [string]$DatabaseRelativePath = "prisma\dev.db",
    [string]$BackupDirRelativePath = "backups\sqlite",
    [int]$KeepLast = 7
)

$ErrorActionPreference = "Stop"

$DatabasePath = Join-Path $ProjectRoot $DatabaseRelativePath
$BackupDir = Join-Path $ProjectRoot $BackupDirRelativePath

Write-Host "ProjectRoot: $ProjectRoot"
Write-Host "DatabasePath: $DatabasePath"
Write-Host "BackupDir:    $BackupDir"

if (-not (Test-Path $DatabasePath)) {
    throw "Database file not found: $DatabasePath"
}

if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$BackupFileName = "dev_$Timestamp.db"
$BackupPath = Join-Path $BackupDir $BackupFileName

Copy-Item -Path $DatabasePath -Destination $BackupPath -Force

Write-Host "Backup created: $BackupPath"

# Keep only latest N backups
$Backups = Get-ChildItem -Path $BackupDir -Filter "*.db" |
    Sort-Object LastWriteTime -Descending

if ($Backups.Count -gt $KeepLast) {
    $BackupsToRemove = $Backups | Select-Object -Skip $KeepLast
    foreach ($File in $BackupsToRemove) {
        Remove-Item -Path $File.FullName -Force
        Write-Host "Removed old backup: $($File.Name)"
    }
}

Write-Host "Backup completed successfully."
