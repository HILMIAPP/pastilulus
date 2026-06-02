# =============================================================================
# deploy.ps1 — Jalankan dari Windows untuk upload build ke VPS
# Cara pakai: .\deploy\deploy.ps1
# Requirement: OpenSSH terinstall (bawaan Windows 10/11)
# =============================================================================

param(
    [string]$VpsUser    = "root",          # username SSH di VPS
    [string]$VpsHost    = "YOUR_VPS_IP",   # IP atau domain VPS Anda
    [string]$VpsPort    = "22",            # port SSH (default 22)
    [string]$RemoteDir  = "/var/www/lolosujian",
    [string]$SshKey     = ""              # path ke SSH key, kosong = pakai password
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$StandaloneDir = "$ProjectRoot\.next\standalone"
$StaticDir     = "$ProjectRoot\.next\static"
$PublicDir     = "$ProjectRoot\public"
$EcosystemFile = "$PSScriptRoot\ecosystem.config.js"

# ── Validasi build ada ───────────────────────────────────────────────────────
if (-not (Test-Path $StandaloneDir)) {
    Write-Error "Build belum ada! Jalankan dulu: npm run build"
    exit 1
}

# ── SSH target ───────────────────────────────────────────────────────────────
$SshTarget = "${VpsUser}@${VpsHost}"
$SshOpts   = @("-p", $VpsPort, "-o", "StrictHostKeyChecking=no")
if ($SshKey -ne "") { $SshOpts += @("-i", $SshKey) }

$ScpBase   = "scp", "-P", $VpsPort, "-o", "StrictHostKeyChecking=no"
if ($SshKey -ne "") { $ScpBase += "-i", $SshKey }

Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  Deploying ke ${SshTarget}:${RemoteDir}" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan

# ── Fungsi rsync/scp recursive ───────────────────────────────────────────────
function SyncDir([string]$Local, [string]$Remote) {
    Write-Host "  Sync: $Local → $Remote"
    # Coba rsync dulu (lebih cepat, hanya upload yg berubah)
    if (Get-Command rsync -ErrorAction SilentlyContinue) {
        rsync -az --delete -e "ssh -p $VpsPort" "$Local/" "${SshTarget}:${Remote}/"
    } else {
        # Fallback: scp -r
        & $ScpBase[0] $ScpBase[1..($ScpBase.Length-1)] -r "${Local}/" "${SshTarget}:${Remote}/"
    }
}

function SshRun([string]$Command) {
    & ssh $SshOpts $SshTarget $Command
}

# ── 1. Buat direktori di VPS ─────────────────────────────────────────────────
Write-Host "`n[1/5] Buat direktori di VPS..."
SshRun "mkdir -p $RemoteDir/.next/static $RemoteDir/public $RemoteDir/logs"

# ── 2. Upload standalone server ──────────────────────────────────────────────
Write-Host "`n[2/5] Upload standalone server..."
SyncDir $StandaloneDir $RemoteDir

# ── 3. Upload static assets ──────────────────────────────────────────────────
Write-Host "`n[3/5] Upload .next/static..."
SyncDir $StaticDir "$RemoteDir/.next/static"

# ── 4. Upload public folder ──────────────────────────────────────────────────
Write-Host "`n[4/5] Upload public/..."
SyncDir $PublicDir "$RemoteDir/public"

# ── 5. Upload PM2 ecosystem + restart ────────────────────────────────────────
Write-Host "`n[5/5] Upload PM2 config & restart app..."
& $ScpBase[0] $ScpBase[1..($ScpBase.Length-1)] $EcosystemFile "${SshTarget}:${RemoteDir}/ecosystem.config.js"

SshRun @"
  cd $RemoteDir && \
  if pm2 list | grep -q 'lolosujian'; then
    pm2 reload lolosujian --update-env
  else
    pm2 start ecosystem.config.js
  fi && \
  pm2 save
"@

Write-Host ""
Write-Host "======================================================" -ForegroundColor Green
Write-Host "  DEPLOY SELESAI! " -ForegroundColor Green
Write-Host ""
Write-Host "  Cek app:  http://$VpsHost"
Write-Host "  PM2 log:  ssh $SshTarget 'pm2 logs lolosujian --lines 50'"
Write-Host "======================================================" -ForegroundColor Green
