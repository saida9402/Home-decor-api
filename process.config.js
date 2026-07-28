module.exports = {
  apps: [{
    name   : "HOME-DECOR",
    cwd: "/home/home-decor-project",
    script : "./dist/server.js",
    interpreter: "/root/.nvm/versions/node/v16.20.2/bin/node",
    watch: false,
    env_production: {
      NODE_ENV: "production"
    },
    env_development: {
      NODE_ENV: "development"
    },
    instances: 1,
    exec_mode: "fork",
    max_memory_restart: "500M",
    error_file: "/root/.pm2/logs/home-decor-error.log",
    out_file: "/root/.pm2/logs/home-decor-out.log"
  }]
}