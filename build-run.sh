#!/bin/bash
rm -rf ../koda-core-lib/node_modules
rm -rf ../koda-core-lib/package-lock.json
cd ../koda-core-lib
npm install
rm -rf ../koda-wallet/node_modules
rm -rf ../koda-wallet/package-lock.json
cd ../koda-wallet
npm run prepublishOnly
rm -rf ../koda-wallet-worker/node_modules
rm -rf ../koda-wallet-worker/package-lock.json
cd ../koda-wallet-worker
npm run prepublishOnly
rm -rf ../koda-pwa-wallet/node_modules
rm -rf ../koda-pwa-wallet/package-lock.json
cd ../koda-pwa-wallet
npm install
npm run webpack
npm run start
