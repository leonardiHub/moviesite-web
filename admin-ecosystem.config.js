module.exports = {
  apps: [{
    name: 'admin-panel',
    script: 'admin-server.js',
    cwd: './',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      HOSTNAME: '51.79.254.237'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001,
      HOSTNAME: '51.79.254.237'
    },
    error_file: './logs/admin-err.log',
    out_file: './logs/admin-out.log',
    log_file: './logs/admin-combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000
  }]
};
