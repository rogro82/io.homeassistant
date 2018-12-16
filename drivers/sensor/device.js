'use strict';

const Homey = require('homey');

class SensorDevice extends Homey.Device {

    onInit() {
        this._client = Homey.app.getClient();

        this.entityId = this.getData().id;
        this.capability = this.getCapabilities()[0];

        this.log('device init');
        this.log('id:', this.entityId);
        this.log('name:', this.getName());
        this.log('class:', this.getClass());

        this._client.registerDevice(this.entityId, this);

        let entity = this._client.getEntity(this.entityId);
        if(entity) { 
            this.onEntityUpdate(entity);
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
        try {
            switch(this.capability) {
                case "measure_generic":
                    this.setCapabilityValue(this.capability, data.state);
                    break;
                default:
                    this.setCapabilityValue(this.capability, parseFloat(data.state));
            }

        } catch(ex) {
            console.log("error", ex);
        }
    }
}

module.exports = SensorDevice;