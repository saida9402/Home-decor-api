#!/bin/bash
set -e

# PRODUCTION
git reset --hard
git checkout master
git pull origin master

npm ci
npm run build
pm2 startOrRestart process.config.js --env production
pm2 save


# DEVELOPMENT bu zarur bo'lganda ishlatiladi shunchakiy yozilgan.
# git reset --hard
# git checkout develop
# git pull origin develop

# npm i
# pm2 start "npm run start:dev" --name=HOME-DECOR