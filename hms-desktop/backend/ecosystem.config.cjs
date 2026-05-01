/**
 * PM2 process definition for the HMS / ZenHosp API.
 * Prisma + Express expect cwd = this folder so dotenv loads ./.env
 *
 * Usage (after build): pm2 start ecosystem.config.cjs
 * @see docs/PM2-Backend-Service-Guide.md
 */
module.exports = {
  apps: [
    {
      name: 'zenhosp-api',
      cwd: __dirname,
      script: 'dist/index.js',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 15,
      min_uptime: '10s',
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
      },
      time: true,
      merge_logs: true,
    },
  ],
};
