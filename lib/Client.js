'use strict';

const Homey = require('homey');

const WebSocket = require('ws');
global.WebSocket = WebSocket;

const Hass = require("home-assistant-js-websocket");

const sensorIcons = {
	'measure_battery': 'measure_battery',
	'measure_humidity': 'measure_humidity',
	'measure_luminance': 'measure_luminance',
	'measure_temperature': 'measure_temperature',
	'measure_power': 'measure_power',
	'measure_co2': 'co2',
	'measure_noise': 'noise',
	'alarm_contact': 'alarm_contact',
	'alarm_motion': 'alarm_motion'
}

class Client extends Homey.SimpleClass {
	
	constructor(address, token) {
		super();

		this._entities = [];
		this._lights = [];
		this._scenes = [];
		this._scripts = [];
		this._switches = [];
		this._sensors = [];
		this._binary_sensors = [];
		this._compounds = [];

		this._devices = {};
		this._connection = null;

		this.connect(address, token);
	}
	
	registerDevice(deviceId, device) {
		this._devices[deviceId] = device;
	}

	unregisterDevice(deviceId) {
		this._devices[deviceId] = null;
	}

	getLights() {
		return this._lights;
	}

	getScenes() {
		return this._scenes;
	}

	getScripts() {
		return this._scripts;
	}

	getSwitches() {
		return this._switches;
	}

	getSensors() {
		return this._sensors;
	}

	getBinarySensors() {
		return this._binary_sensors;
	}

	getCompounds() {
		return this._compounds;
	}

	getEntity(entityId) {
		return this._entities[entityId];
	}

	connect(address, token, notify) {

		console.log('connecting to home-assistant');

		if(this._connection != null) {
			this._connection.close();
		}

		// clear any previously discovered devices

		this._lights = [];
		this._scenes = [];
		this._scripts = [];
		this._switches = [];
		this._sensors = [];
		this._compounds = [];
		this._binary_sensors = [];

		if(address && address != "" 
			&& token && token != "") {

			let auth = new Hass.Auth({
				hassUrl: address,
				access_token: token,
				expires: new Date(new Date().getTime() + 1e11)
			});

			Hass.createConnection({ auth })
			.then(conn => {
				console.log('succesfully connected... subscribing to entities and events');

				if(notify) {
					this.emit("connection_update", { connected: true });
				}

				this._connection = conn;
				Hass.subscribeEntities(conn, this._onEntitiesUpdate.bind(this));
				conn.subscribeEvents(this._onStateChanged.bind(this), "state_changed");
			})
			.catch(err => { 
				this._connection = null;
				this.emit("connection_update", { connected: false });
				this.log("failed to connect:", err);
			});
		}
	}

	_onStateChanged(event) {
		let deviceIds = Object.keys(this._devices);
		let data = event.data;
		if(data) {
			let entityId = data.entity_id;

			deviceIds.forEach(deviceId => {
				let device = this._devices[deviceId];
				if(device != null) {
					if(deviceId == entityId) {
						device.onEntityUpdate(data.new_state);
					}
					if(deviceId.startsWith("homey.")) {
						let capabilities = device.getData().capabilities;
						Object.keys(capabilities).forEach(key => {
							if(capabilities[key] == entityId) {
								device.onEntityUpdate(data.new_state);
							}
						});
					}
				}
			});
		}
	}
	
	_onEntitiesUpdate(entities) {
		if(this._entities.length != entities.length) {
			console.log("update entities");

			let lights = [];
			let scenes = [];
			let scripts = [];
			let switches = [];
			let sensors = [];
			let binary_sensors = [];
			let compounds = [];

			Object.keys(entities).forEach(id => {

				if(id.startsWith("homey.")) {
					try {
						console.log("> compound device", id);

						let entity = entities[id];
						let entityName = entity.attributes["friendly_name"] || id;
						
						let compoundCapabilities = entity.attributes["capabilities"] || {};
						let compoundCapabilitiesConverters = entity.attributes["capabilitiesConverters"] || {};
						let compoundIcon = entity.attributes["icon"];

						console.log("capabilities:", compoundCapabilities);
						console.log("capabilitiesConverters:", compoundCapabilitiesConverters);
						console.log("icon:", compoundIcon);

						let compound = {
							name: entityName,
							data: {
								id: id,
								capabilities: compoundCapabilities,
								capabilitiesConverters: compoundCapabilitiesConverters
							},
							capabilities: Object.keys(compoundCapabilities)
						};

						if(typeof sensorIcons[compoundIcon] === 'string' ) {
							compound.icon = `/icons/${ sensorIcons[compoundIcon] }.svg`;
						}

						compounds.push(compound);

					} catch(ex) {
						console.log("failed to load compound:", ex);
					}
				}

				if(id.startsWith("binary_sensor.")) {

					let entity = entities[id];
					let entityName = entity.attributes["friendly_name"] || id;
					let deviceClass = entity.attributes["device_class"];

					let sensorCapability = null;

					switch(deviceClass) {
						case "battery"		: sensorCapability 	= "alarm_battery"; break;
						case "gas"			: sensorCapability 	= "alarm_co"; break;
						case "opening"		: sensorCapability 	= "alarm_contact"; break;
						case "door"			: sensorCapability 	= "alarm_contact"; break;
						case "garage_door"	: sensorCapability 	= "alarm_contact"; break;
						case "window"		: sensorCapability 	= "alarm_contact"; break;
						case "fire"			: sensorCapability 	= "alarm_fire"; break;
						case "heat"			: sensorCapability 	= "alarm_heat"; break;
						case "motion"		: sensorCapability 	= "alarm_motion"; break;
						case "smoke"		: sensorCapability 	= "alarm_smoke"; break;
						case "moisture"		: sensorCapability 	= "alarm_water"; break;
						default:
							sensorCapability = "alarm_generic";
							break;
					}

					let binary_sensor = {
						name: entityName,
						data: {
							id: id
						},
						capabilities: [ "onoff", sensorCapability ]
					};

					if(typeof sensorIcons[sensorCapability] === 'string' ) {
						binary_sensor.icon = `/icons/${ sensorIcons[sensorCapability] }.svg`;
					}

					binary_sensors.push(binary_sensor);
				}

				if(id.startsWith("sensor.")) {

					let entity = entities[id];
					let entityName = entity.attributes["friendly_name"] || id;
					let deviceClass = entity.attributes["device_class"];

					let sensorCapability = null;

					switch(deviceClass) {
						case "battery"		: sensorCapability 	= "measure_battery"; break;
						case "humidity"		: sensorCapability 	= "measure_humidity"; break;
						case "illuminance"	: sensorCapability 	= "measure_luminance"; break;
						case "temperature"	: sensorCapability 	= "measure_temperature"; break;
						case "pressure"		: sensorCapability 	= "measure_pressure"; break;
						default:
							let unit_of_measurement = entity.attributes["unit_of_measurement"];

							switch(unit_of_measurement) {
								case "W"	: sensorCapability = "measure_power"; break;
								case "ppm"	: sensorCapability = "measure_co2"; break;
								case "dB"	: sensorCapability = "measure_noise"; break;
								default:
									sensorCapability = "measure_generic";
									break;
							}
					}

					let sensor = {
						name: entityName,
						data: {
							id: id
						},
						capabilities: [ sensorCapability ]
					};

					if(typeof sensorIcons[sensorCapability] === 'string' ) {
						sensor.icon = `/icons/${ sensorIcons[sensorCapability] }.svg`;
					}

					sensors.push(sensor);
				}

				if(id.startsWith("switch.")) {

					let entity = entities[id];
					let entityName = entity.attributes["friendly_name"] || id;

					switches.push({
						name: entityName,
						data: {
							id: id
						}
					});
				}

				if(id.startsWith("script.")) {

					let entity = entities[id];
					let entityName = entity.attributes["friendly_name"] || id;

					scripts.push({
						name: entityName,
						data: {
							id: id
						}
					});
				}

				if(id.startsWith("scene.")) {

					let entity = entities[id];
					let entityName = entity.attributes["friendly_name"] || id;

					scenes.push({
						name: entityName,
						data: {
							id: id
						}
					});
				}

				if(id.startsWith("light.")) {

					let entity = entities[id];
					let entityName = entity.attributes["friendly_name"] || id;
					let lightCapabilities = [ "onoff" ];

					/*
					SUPPORT_BRIGHTNESS = 1
					SUPPORT_COLOR_TEMP = 2
					SUPPORT_EFFECT = 4
					SUPPORT_FLASH = 8
					SUPPORT_COLOR = 16
					SUPPORT_TRANSITION = 32
					SUPPORT_WHITE_VALUE = 128
					*/

					let features = entity.attributes["supported_features"] || 0;
					
					if((features & 1) == 1) lightCapabilities.push("dim");
					if((features & 2) == 2) lightCapabilities.push("light_temperature");
					if((features & 16) == 16) lightCapabilities.push("light_hue", "light_saturation");

					if(lightCapabilities.includes("light_temperature") 
						&& lightCapabilities.includes("light_hue")) {
						lightCapabilities.push("light_mode")
					}

					lights.push({
						name: entityName,
						data: {
							id: id
						},
						capabilities: lightCapabilities
					});
				}
			});

			let update = this._entities.length == 0;

			this._lights = lights;
			this._scenes = scenes;
			this._scripts = scripts;
			this._switches = switches;
			this._sensors = sensors;
			this._binary_sensors = binary_sensors;
			this._compounds = compounds;
			this._entities = entities;

			if(update) {
				setTimeout(() => {
					Object.keys(this._entities).forEach(id => {
						this._onStateChanged({
							data: {
								entity_id: id,
								new_state: this._entities[id]
							}
						});
					});
				}, 5000);
			}
		}
	}

	turnOnOff(entityId, on) {
		if(this._connection) {
			Hass.callService(this._connection, "homeassistant", on ? "turn_on" : "turn_off", {
				"entity_id": entityId
			})
		}
	}

	updateLight(on, data) {
		if(this._connection) {
			Hass.callService(this._connection, "light", on ? "turn_on" : "turn_off", data)
		}
	}

	callService(domain, service, data) {
		try {
			if(this._connection) {
				let jsonData = (typeof data === "string") ? JSON.parse(data) : data;

				console.log("---- call service ----");
				console.log("domain:", domain);
				console.log("service:", service);
				console.log("data:", jsonData);

				Hass.callService(this._connection, domain, service, jsonData);
			}
		} catch (ex) {
			console.log("error:", ex);
		}
	}

}

module.exports = Client