#!/bin/bash
# =============================================================================
# setup-vps.sh — Jalankan SEKALI di VPS baru
# Perintah: chmod +x setup-vps.sh && sudo ./setup-vps.sh
# Tested: Ubuntu 22.04 LTS
# =============================================================================
set -e

APP_DIR="/var/www/lolosujian"
NODE_VERSION="20"

echo "======================================================"
echo "  Lolosujian VPS Setup"
echo "======================================================"

# ── Update sistem ────────────────────────────────────────────────────────────
echo "[1/6] Update package list..."
apt-get update -y

# ── Install Node.js via NodeSource ───────────────────────────────────────────
echo "[2/6] Install Node.js $NODE_VERSION..."
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
  apt-get install -y nodejs
fi
echo "  Node: $(node -v) | npm: $(npm -v)"

# ── Install PM2 ──────────────────────────────────────────────────────────────
echo "[3/6] Install PM2..."
npm install -g pm2
echo "  PM2: $(pm2 -v)"

# ── Install Nginx ─────────────────────────────────────────────────────────────
echo "[4/6] Install Nginx..."
if ! command -v nginx &>/dev/null; then
  apt-get install -y nginx
fi
systemctl enable nginx

# ── Buat direktori app ───────────────────────────────────────────────────────
echo "[5/6] Buat direktori $APP_DIR..."
mkdir -p "$APP_DIR/logs"
mkdir -p "$APP_DIR/.next/static"
mkdir -p "$APP_DIR/public"

# ── Konfigurasi Nginx ─────────────────────────────────────────────────────────
echo "[6/6] Pasang Nginx config..."
if [ -f "$(dirname "$0")/nginx.conf" ]; then
  cp "$(dirname "$0")/nginx.conf" /etc/nginx/sites-available/lolosujian
  ln -sf /etc/nginx/sites-available/lolosujian /etc/nginx/sites-enabled/lolosujian
  rm -f /etc/nginx/sites-enabled/default
  nginx -t && systemctl reload nginx
  echo "  Nginx config terpasang."
else
  echo "  SKIP: nginx.conf tidak ditemukan di folder ini."
fi

# ── PM2 startup ──────────────────────────────────────────────────────────────
pm2 startup systemd -u "$USER" --hp "$HOME" || true

echo ""
echo "======================================================"
echo "  SETUP SELESAI!"
echo ""
echo "  Langkah selanjutnya:"
echo "  1. Upload app: jalankan deploy.ps1 dari Windows"
echo "  2. Isi .env:   nano $APP_DIR/.env"
echo "  3. Start app:  cd $APP_DIR && pm2 start ecosystem.config.js"
echo "  4. Save PM2:   pm2 save"
echo "  5. SSL:        sudo certbot --nginx -d your-domain.com"
echo "======================================================"
