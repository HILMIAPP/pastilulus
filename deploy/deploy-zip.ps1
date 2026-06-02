# =============================================================================
# deploy-zip.ps1 — Deploy via zip (lebih simpel dari rsync/scp folder)
# Cara pakai: .\deploy\deploy-zip.ps1
# =============================================================================

param(
    [string]$VpsUser   = "ubuntu",
    [string]$VpsHost   = "ec2-32-236-45-12.ap-southeast-2.compute.amazonaws.com",
    [string]$VpsPort   = "22",
    [string]$RemoteDir = "/www/wwwroot/lolosujian",
    [string]$SshKey    = "C:\Users\shafw\Downloads\n8n-key.pem"
)

$ErrorActionPreference = "Stop"
$ProjectRoot   = Split-Path -Parent $PSScriptRoot
$StandaloneDir = "$ProjectRoot\.next\standalone"
$StaticDir     = "$ProjectRoot\.next\static"
$PublicDir     = "$ProjectRoot\public"
$PdfDir        = "$ProjectRoot\tryout_univ_jurusan_pastilulus_pdf"
$ZipPath       = "$ProjectRoot\lolosujian-deploy.tar.gz"
$SshTarget     = "${VpsUser}@${VpsHost}"

# ── Validasi build ───────────────────────────────────────────────────────────
if (-not (Test-Path $StandaloneDir)) {
    Write-Error "Build belum ada! Jalankan dulu: npm run build"
    exit 1
}

Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  Deploy via ZIP ke $SshTarget" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan

# ── 1. Buat zip ──────────────────────────────────────────────────────────────
Write-Host "`n[1/4] Membuat lolosujian-deploy.tar.gz..."
if (Test-Path $ZipPath) { Remove-Item $ZipPath -Force }

# Kumpulkan file ke folder temp lalu tar
$TempDir = "$env:TEMP\lolosujian-build"
if (Test-Path $TempDir) { Remove-Item $TempDir -Recurse -Force }
New-Item -ItemType Directory -Path $TempDir | Out-Null

Copy-Item -Recurse "$StandaloneDir\*" "$TempDir\" -Force
New-Item -ItemType Directory -Path "$TempDir\.next\static" -Force | Out-Null
Copy-Item -Recurse "$StaticDir\*"     "$TempDir\.next\static\" -Force
Copy-Item -Recurse "$PublicDir"       "$TempDir\public" -Force
Copy-Item "$PSScriptRoot\ecosystem.config.js" "$TempDir\ecosystem.config.js"

# Sertakan folder PDF tryout PASTI LULUS 1
if (Test-Path $PdfDir) {
    Write-Host "  Menyertakan folder tryout_univ_jurusan_pastilulus_pdf..."
    Copy-Item -Recurse $PdfDir "$TempDir\tryout_univ_jurusan_pastilulus_pdf" -Force
} else {
    Write-Host "  SKIP: tryout_univ_jurusan_pastilulus_pdf tidak ditemukan di local." -ForegroundColor Yellow
}

# Pakai tar (tersedia di Windows 10+) — path selalu forward slash
tar -czf $ZipPath -C $TempDir .
Remove-Item $TempDir -Recurse -Force
Write-Host "  TAR siap: $ZipPath" -ForegroundColor Green

# ── 2. Upload zip + .env ke VPS ──────────────────────────────────────────────
Write-Host "`n[2/4] Upload ZIP ke VPS..."
& scp -i $SshKey -P $VpsPort -o StrictHostKeyChecking=no $ZipPath "${SshTarget}:/tmp/lolosujian-deploy.tar.gz"

$EnvFile = "$ProjectRoot\.env.production"
if (Test-Path $EnvFile) {
    Write-Host "  Upload .env.production sebagai .env..."
    & scp -i $SshKey -P $VpsPort -o StrictHostKeyChecking=no $EnvFile "${SshTarget}:/tmp/lolosujian.env"
} else {
    Write-Host "  SKIP: .env.production tidak ditemukan, buat manual di VPS." -ForegroundColor Yellow
}
Write-Host "  Upload selesai." -ForegroundColor Green

# ── 3. Extract & setup di VPS ────────────────────────────────────────────────
Write-Host "`n[3/4] Extract & setup di VPS..."
$RemoteCmd = @"
set -e
mkdir -p $RemoteDir/logs $RemoteDir/.next
# Buat direktori uploads PASTI LULUS (jangan pernah dihapus saat deploy)
mkdir -p $RemoteDir/uploads/pasti-lulus/soal $RemoteDir/uploads/pasti-lulus/pembahasan
cd /tmp
rm -rf lolosujian-extract
mkdir lolosujian-extract
tar -xzf lolosujian-deploy.tar.gz -C lolosujian-extract
rm -rf $RemoteDir/.next $RemoteDir/public $RemoteDir/server.js $RemoteDir/package.json $RemoteDir/node_modules $RemoteDir/tryout_univ_jurusan_pastilulus_pdf
cp -r lolosujian-extract/. $RemoteDir/
[ -f /tmp/lolosujian.env ] && cp /tmp/lolosujian.env $RemoteDir/.env && rm /tmp/lolosujian.env
rm -rf lolosujian-extract lolosujian-deploy.tar.gz
sudo find /www/server/nginx/proxy_cache_dir -type f -delete 2>/dev/null || true
echo "Extract selesai."
"@
& ssh -i $SshKey -p $VpsPort -o StrictHostKeyChecking=no $SshTarget $RemoteCmd
Write-Host "  Extract selesai." -ForegroundColor Green

# ── 4. Restart PM2 ───────────────────────────────────────────────────────────
Write-Host "`n[4/4] Restart PM2..."
$Pm2Cmd = @"
cd $RemoteDir
if pm2 list | grep -q 'lolosujian'; then
  pm2 reload lolosujian --update-env
else
  pm2 start ecosystem.config.js
fi
pm2 save
sudo /www/server/nginx/sbin/nginx -s reload 2>/dev/null || true
"@
& ssh -i $SshKey -p $VpsPort -o StrictHostKeyChecking=no $SshTarget $Pm2Cmd

Write-Host ""
Write-Host "======================================================" -ForegroundColor Green
Write-Host "  DEPLOY SELESAI!" -ForegroundColor Green
Write-Host ""
Write-Host "  Jangan lupa buat .env di VPS kalau belum ada:"
Write-Host "  ssh -i `"$SshKey`" $SshTarget"
Write-Host "  nano $RemoteDir/.env"
Write-Host ""
Write-Host "  Cek log: ssh -i `"$SshKey`" $SshTarget 'pm2 logs lolosujian --lines 50'"
Write-Host "======================================================" -ForegroundColor Green
