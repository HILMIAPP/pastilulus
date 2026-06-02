# Deploy ke VPS (Ubuntu + Nginx)

## Arsitektur

```
Internet → Nginx (port 80/443) → PM2 (Node.js port 3000)
                                     ↕
                              /var/www/lolosujian/
                              ├── server.js         ← entry point
                              ├── .env              ← env vars production
                              ├── ecosystem.config.js
                              ├── .next/
                              │   └── static/       ← di-serve Nginx langsung
                              └── public/           ← di-serve Nginx langsung
```

---

## Langkah 1 — Setup VPS (sekali saja)

```bash
# Upload setup script ke VPS
scp deploy/setup-vps.sh root@YOUR_VPS_IP:/tmp/
scp deploy/nginx.conf   root@YOUR_VPS_IP:/tmp/

# Login ke VPS
ssh root@YOUR_VPS_IP

# Edit nginx.conf dulu — ganti your-domain.com
nano /tmp/nginx.conf

# Jalankan setup
chmod +x /tmp/setup-vps.sh && sudo bash /tmp/setup-vps.sh
```

---

## Langkah 2 — Isi file .env di VPS

```bash
ssh root@YOUR_VPS_IP
nano /var/www/lolosujian/.env
# → salin isi dari deploy/env-production.example lalu isi nilainya
```

**Wajib diisi:**
- `AUTH_SECRET` — generate dengan: `openssl rand -base64 32`
- `MAYAR_API_KEY` + `MAYAR_WEBHOOK_SECRET`
- Supabase keys
- `NEXT_PUBLIC_APP_URL` → domain production Anda

---

## Langkah 3 — Build & Deploy dari Windows

```powershell
# Build dulu (dari folder project)
npm run build

# Deploy ke VPS — ganti IP dan username
.\deploy\deploy.ps1 -VpsUser root -VpsHost YOUR_VPS_IP

# Jika pakai SSH key
.\deploy\deploy.ps1 -VpsUser root -VpsHost YOUR_VPS_IP -SshKey "C:\Users\Anda\.ssh\id_rsa"
```

---

## Langkah 4 — Pasang SSL (Let's Encrypt)

```bash
ssh root@YOUR_VPS_IP

# Install certbot
apt install -y certbot python3-certbot-nginx

# Pasang SSL (ganti domain)
certbot --nginx -d your-domain.com -d www.your-domain.com

# Uncomment blok HTTPS di nginx.conf, atau biarkan certbot yang edit otomatis
nginx -t && systemctl reload nginx
```

---

## Deploy ulang setelah ada perubahan kode

```powershell
# Di Windows, dari folder project:
powershell -ExecutionPolicy Bypass -File .\deploy\deploy-now.ps1
```
Script ini build, upload ke `/www/wwwroot/lolosujian`, reload PM2, lalu cek `/masuk` dan `/daftar`.

---

## Perintah berguna di VPS

```bash
# Cek status app
pm2 status

# Lihat log real-time
pm2 logs lolosujian

# Restart manual
pm2 restart lolosujian

# Stop
pm2 stop lolosujian

# Cek Nginx
nginx -t
systemctl status nginx
tail -f /var/log/nginx/error.log
```

---

## Ukuran folder yang di-upload

| Folder              | Isi                          | Ukuran perkiraan |
|---------------------|------------------------------|-----------------|
| `.next/standalone/` | Server Node.js + deps minimal | ~50–80 MB       |
| `.next/static/`     | JS/CSS chunks, fonts          | ~5–15 MB        |
| `public/`           | Gambar, SVG logo, PDF materi  | tergantung aset  |

> `.next/standalone/` sudah berisi semua `node_modules` yang dibutuhkan — **tidak perlu `npm install` di VPS**.
