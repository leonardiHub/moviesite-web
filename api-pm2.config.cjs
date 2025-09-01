module.exports = {
  apps: [{
    name: 'movie-api',
    script: 'npm',
    args: 'run start:prod',
    cwd: './apps/api',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 4000,
      HOSTNAME: '51.79.254.237'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 4000,
      HOSTNAME: '51.79.254.237'
    },
    error_file: './logs/api-err.log',
    out_file: './logs/api-out.log',
    log_file: './logs/api-combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000
  }]
};
