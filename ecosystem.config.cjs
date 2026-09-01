module.exports = {
  apps: [
    {
      name: "hrms-api",
      script: "apps/api/dist/main.js",
      instances: 2,
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 4000
      }
    },
    {
      name: "hrms-web",
      script: "node_modules/next/dist/bin/next",
      args: "start apps/web -p 3000",
      instances: 2,
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    }
  ]
};
