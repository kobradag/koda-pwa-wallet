import {RPC} from '/@kobra/grpc-web';
//console.log("PWA", window.PWA)
//console.log("RPC", RPC)
import '/style/style.js';
import {
	dpc, html, css, FlowApp, BaseElement, i18n
} from '/flow/flow-ux/flow-ux.js';
import {isMobile} from '/@kobra/ux/kobra-ux.js';
export * from '/@kobra/ux/kobra-ux.js';

window.__testI18n = (test)=>i18n.setTesting(!!test);

class KobraWalletHeader extends BaseElement {
	static get styles() {
		return css`
			:host {
				display: block;
				width: 100%;
			}
			.container {
				display: flex;
				align-items: center;
				padding: 5px;
				background-color: #fafafa; 
				box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1); 
			}
			.logo {
				height: 30px;
				width: 30px;
				background: no-repeat url('/resources/logo512.png') center;
				background-size: contain;
			}
			.flex {
				flex: 1;
			}

			@media (max-width: 768px) {
				.container {
					flex-direction: column;
					padding: 10px;
				}
				.logo {
					height: 40px;
					width: 40px;
				}
			}
		`;
	}

	render() {
		return html`
			<div class="container">
				<div class="logo"></div>
				<div class="flex"></div>
				<!--a class="link">About us</a-->
			</div>
		`;
	}
}
KobraWalletHeader.define("kobra-wallet-header")

class KobraWalletApp extends FlowApp {

	static get properties(){
		return {
			network:{type:String},
			networks:{type:Array},
			addresses:{type:Object},
			available:{type:Object},
			limits:{type:Object}
		}
	}
	constructor(){
		super();

		this.networks = ['kobra', 'kobradev', 'kobrareg', 'kobratest', 'kobrasim'];
		this.network = "Kobra-mainnet";
		this.addresses = {};
		this.available = {};
		this.limits = {};
		this.opt = {};

		this.aliases = {
			kobra : 'MAINNET',
			kobratest : 'TESTNET',
			kobrareg : 'REGNET',
			kobradev : 'DEVNET',
			kobrasim : 'SIMNET'
		}

		this.initLog();
		dpc(async ()=>this.init());
		this.registerListener("popstate", (e)=>{
			let {menu="home", args=[]} = e.state||{};
			console.log(`popstate: ${document.location}, state: ${JSON.stringify(e.state)}`)
			//this.setMenu(menu, args, true);
		});
	}

	async init(){
		await this.initSocketRPC({
			timeout : 90,
			args:{
				transports:["websocket"]
			}
		});
		await this.initUI();
		dpc(()=>this.setLoading(false));
	}

	async initUI(){
		this.bodyEl = document.body;
		await this.getNetwork();
		await this.initI18n();
	}

	async getNetwork(){
		const { rpc } = flow.app;
		let {network} = await rpc.request("get-network")
		.catch((err)=>{
			console.log("get-network:error", err)
		});

		if(network && this.network != network){
			this.network = network;
		}
	}

	async initI18n(){
		i18n.setActiveLanguages(['en', 'de', 'fr', 'id', 'it', 'pt_BR', 'ja', 'ko', 'zh']);
		//i18n.setTesting(true);
		const { rpc } = flow.app;
		let {entries} = await rpc.request("get-app-i18n-entries")
		.catch((err)=>{
			console.log("get-app-i18n-entries:error", err)
		})
		if(entries)
			i18n.setEntries(entries);
	}

	onlineCallback() {
		const { rpc } = flow.app;
		this.networkUpdates = rpc.subscribe(`networks`);
		(async()=>{
			for await(const msg of this.networkUpdates) {
				const { networks } = msg.data;
				this.networks = networks;
				if(!this.networks.includes(this.network))
					this.network = this.networks[0];
				console.log("available networks:", networks);
				this.requestUpdate();
			}
		})().then();

		this.addressUpdates = rpc.subscribe(`addresses`);
		(async()=>{
			for await(const msg of this.addressUpdates) {
                const { addresses } = msg.data;
                this.addresses = addresses;
                this.requestUpdate();
				// this.networks = networks;
				// console.log("available networks:",networks);
			}
		})().then();

		this.limitUpdates = rpc.subscribe(`limit`);
		(async()=>{
			for await(const msg of this.limitUpdates) {
				const { network, limit, available } = msg.data;
				console.log('limits',msg.data);
				this.limits[network] = limit;
				this.available[network] = available;
				if(this.network == network)
					this.requestUpdate();
			}
		})().then();
	}

	offlineCallback() {
		this.networkUpdates?.close();
		this.addressUpdates?.close();
		this.limitUpdates?.close();
	}

	render(){
		let network = this.network;
		let address = this.addresses?.[this.network] || '';
		let limit = this.limits?.[this.network] || '';
		let available = this.available?.[this.network] || '';
		let meta = {"generator":"pwa"}

		return html`
		${isMobile?'':html`<!--kobra-wallet-header></kobra-wallet-header-->`}
		<kobra-wallet .walletMeta='${meta}' reloadonlock="true" hidefaucet="true"></kobra-wallet>
		`
	}

	onNetworkChange(e){
		console.log("on-network-change", e.detail)
		this.network = e.detail.network;
	}

	firstUpdated(){
		super.firstUpdated();
		console.log("app: firstUpdated")
		this.wallet = this.renderRoot.querySelector("kobra-wallet");
		//console.log("this.wallet", this.wallet)
		let verbose = localStorage.rpcverbose == 1;
		this.wallet.setRPCBuilder(()=>{
			return {
				rpc: new RPC({verbose, clientConfig:{path:"/rpc"}}),
				network: this.network
			}
		});
	}

}

KobraWalletApp.define("kobra-wallet-app");
