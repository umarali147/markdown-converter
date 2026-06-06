module.exports = {
  apps: [{
    name: 'markdown-converter',
    script: 'npm',
    args: 'start',
    cwd: process.cwd(),
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
      HOSTNAME: '127.0.0.1', // only reachable through nginx
      PORT: 3003 // 3000 = photo-app, 3001 = arttools-live, 3002 = passport-photo-app
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    kill_timeout: 5000,
    restart_delay: 5000
  }]
}
