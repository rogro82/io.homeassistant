'use strict';

const Homey = require('homey');
const Client = require('./lib/Client.js');

class App extends Homey.App {
	
	onInit() {
		this.log('Home-Assistant is running...');

		this._client = new Client(
			"http://192.168.1.2:8123", 
			"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIzYWRiZmYwMTRjYTQ0MTVlYTA2M2UxMjEyYzMyZjZjMSIsImlhdCI6MTU0NDkyMzQxNSwiZXhwIjoxODYwMjgzNDE1fQ.e_ril9nEr6jfZRxaw1r3gh2-jNojRFsuf5ybuhhCSgw"
		);
	}

	getClient() {
		return this._client;
	}
	
}

module.exports = App;