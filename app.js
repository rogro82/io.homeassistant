'use strict';

const Homey = require('homey');
const Client = require('./lib/Client.js');

class App extends Homey.App {
	
	onInit() {
		this.log('Home-Assistant is running...');


		// TODO: add settings :)

		this._client = new Client(
			"http://your_ip:8123", 
			"your_access_token"
		);

		this._onFlowActionCallService = this._onFlowActionCallService.bind(this);

		new Homey.FlowCardAction('callService')
			.register()
			.registerRunListener( this._onFlowActionCallService );
			// .getArgument('scene')

	}

	getClient() {
		return this._client;
	}

	_onFlowActionCallService(args) {
		this._client.callService(args.domain, args.service, args.data);
	}
}

module.exports = App;