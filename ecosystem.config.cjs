module.exports = {
  apps: [
    {
      name: 'Marchen',
      script: 'npx next start -p 23116',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
}
