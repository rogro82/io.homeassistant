'use strict';

const Homey = require('homey');
const Client = require('./lib/Client.js');

class App extends Homey.App {
	
	onInit() {
		this.log('Home-Assistant is running...');

		let address = Homey.ManagerSettings.get("address");
		let token = Homey.ManagerSettings.get("token");

		this._client = new Client(
			address, 
			token
		);

		this._onFlowActionCallService = this._onFlowActionCallService.bind(this);

		new Homey.FlowCardAction('callService')
			.register()
			.registerRunListener( this._onFlowActionCallService );

		Homey.ManagerSettings.on("set", this._reconnectClient.bind(this));
	}

	getClient() {
		return this._client;
	}

	_reconnectClient() {
		console.log("settings updated.... reconnecting");

		let address = Homey.ManagerSettings.get("address");
		let token = Homey.ManagerSettings.get("token");

		this._client.connect(address, token);
	}

	_onFlowActionCallService(args) {
		this._client.callService(args.domain, args.service, args.data);
	}
}

module.exports = App;