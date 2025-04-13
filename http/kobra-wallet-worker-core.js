//import "@kobra/wallet-worker/worker.js";
//if(typeof window == 'undefined')
	globalThis['window'] = globalThis;

require("@kobra/wallet-worker/worker.js")
