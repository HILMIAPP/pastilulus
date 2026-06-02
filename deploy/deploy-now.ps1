# One-command production deploy for nukaedu.web.id.
# Usage from project root:
#   powershell -ExecutionPolicy Bypass -File .\deploy\deploy-now.ps1

param(
    [string]$VpsUser = "ubuntu",
    [string]$VpsHost = "ec2-32-236-45-12.ap-southeast-2.compute.amazonaws.com",
    [string]$SshKey = "C:\Users\shafw\Downloads\n8n-key.pem",
    [string]$RemoteDir = "/www/wwwroot/lolosujian"
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot

if (-not (Test-Path $SshKey)) {
    throw "SSH key tidak ditemukan: $SshKey"
}

Set-Location $ProjectRoot

Write-Host ""
Write-Host "== Build production ==" -ForegroundColor Cyan
npm.cmd run build

Write-Host ""
Write-Host "== Upload dan reload PM2 ==" -ForegroundColor Cyan
& "$PSScriptRoot\deploy-zip.ps1" `
    -VpsUser $VpsUser `
    -VpsHost $VpsHost `
    -SshKey $SshKey `
    -RemoteDir $RemoteDir

Write-Host ""
Write-Host "== Cek halaman auth ==" -ForegroundColor Cyan
& ssh -i $SshKey -o BatchMode=yes "${VpsUser}@${VpsHost}" "curl -I --max-time 15 http://127.0.0.1:3000/masuk && echo --- && curl -I --max-time 15 http://127.0.0.1:3000/daftar"

Write-Host ""
Write-Host "Deploy selesai. Buka https://nukaedu.web.id/masuk lalu reload halaman." -ForegroundColor Green
