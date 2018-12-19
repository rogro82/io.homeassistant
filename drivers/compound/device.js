'use strict';

const Homey = require('homey');

class CompoundDevice extends Homey.Device {

    onInit() {
        this._client = Homey.app.getClient();

        this.entityId = this.getData().id;
        this.capabilities = this.getCapabilities();
        this.capabilityMapping = this.getData().capabilities;

        this.log('device init');
        this.log('id:', this.entityId);
        this.log('name:', this.getName());
        this.log('class:', this.getClass());

        this._client.registerDevice(this.entityId, this);

        if(this.hasCapability("button")) {
            this.log("attach button listener");
            this.registerCapabilityListener('button', this.onCapabilityButton.bind(this))
        }

        if(this.hasCapability("onoff")) {
            this.log("attach onoff listener");
            this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this))
        }
    }

    onAdded() {
        this.log('device added');
    }

    onDeleted() {
        this.log('device deleted');
        this._client.unregisterDevice(this.entityId);
    }

    onEntityUpdate(data) {
        let entityId = data.entity_id;

        Object.keys(this.capabilityMapping).forEach(key => {
            if(this.capabilityMapping[key] == entityId) {

                console.log("---------------------------------------------------------------");
                console.log("update compound device:", this.entityId);
                console.log("update compound capability:", key);
                console.log("update compound by entity:", entityId);

                switch(key) {
                    case "measure_temperature":
                    case "measure_humidity":
                    case "measure_luminance":
                        this.setCapabilityValue(key, parseFloat(data.state));
                        break;
                    case "alarm_motion":
                    case "alarm_contact":
                    case "onoff":
                        this.setCapabilityValue(key, data.state == "on");
                        break;
                }
            }
        });
    }

    onCapabilityButton( value, opts, callback ) {
        this._client.turnOnOff(this.capabilityMapping["button"], true);
        callback( null );
    }


    onCapabilityOnoff( value, opts, callback ) {
        this._client.turnOnOff(this.capabilityMapping["onoff"], value);
        callback( null );
    }

}

module.exports = CompoundDevice;