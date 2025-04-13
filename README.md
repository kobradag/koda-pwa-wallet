# kobra-wallet-pwa

Run

```
#!/bin/bash
git clone https://github.com/kobradag/koda-core-lib.git
cd koda-core-lib
npm install
cd ..
git clone https://github.com/kobradag/koda-wallet-worker.git
cd koda-wallet-worker
npm install && npm run prepublishOnly
cd ..
git clone https://github.com/kobradag/koda-wallet.git
cd koda-wallet
npm install && npm run prepublishOnly
cd ..
git clone https://github.com/kobradag/koda-ux.git
cd koda-ux
npm install
cd ..
git clone https://github.com/kobradag/koda-pwa-wallet.git
cd koda-wallet
npm install
npm run start
```
