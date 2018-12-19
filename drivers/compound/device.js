'use strict';

const Homey = require('homey');

class CompoundDevice extends Homey.Device {

    onInit() {
        this._client = Homey.app.getClient();

        this.entityId = this.getData().id;
        this.capabilities = this.getCapabilities();

        this.log('device init');
        this.log('id:', this.entityId);
        this.log('name:', this.getName());
        this.log('class:', this.getClass());

        this._client.registerDevice(this.entityId, this);
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
        let capabilities = this.getData().capabilities;

        Object.keys(capabilities).forEach(key => {
            if(capabilities[key] == entityId) {

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
                        this.setCapabilityValue(key, data.state == "on");
                        break;
                }
            }
        });
    }

    onCapabilityOnoff( value, opts, callback ) {
        // TODO: implement switch/dim/slider etc
    }
}

module.exports = CompoundDevice;