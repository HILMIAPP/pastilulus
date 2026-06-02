// PM2 Ecosystem Config
// Jalankan di VPS: pm2 start ecosystem.config.js
// Simpan sesi PM2: pm2 save && pm2 startup

module.exports = {
  apps: [
    {
      name: "lolosujian",
      // Gunakan path relatif — bekerja di /var/www/lolosujian MAUPUN /www/wwwroot/lolosujian
      script: "./server.js",
      cwd: __dirname,

      // Environment variables produksi — override nilai di .env di sini
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "127.0.0.1",
      },

      // Instance & resource
      instances: 1,          // ganti ke "max" jika mau cluster (multi-core)
      exec_mode: "fork",     // ganti ke "cluster" jika instances > 1

      // Logging — path relatif terhadap cwd
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,

      // Auto-restart
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",

      // Graceful restart
      kill_timeout: 5000,
      listen_timeout: 10000,
    },
  ],
};
