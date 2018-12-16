'use strict';

const Homey = require('homey');

class BinarySensorDevice extends Homey.Device {

    onInit() {
        this._client = Homey.app.getClient();

        this.entityId = this.getData().id;
        this.capabilities = this.getCapabilities();

        this.log('device init');
        this.log('id:', this.entityId);
        this.log('name:', this.getName());
        this.log('class:', this.getClass());

        this._client.registerDevice(this.entityId, this);

        let entity = this._client.getEntity(this.entityId);
        if(entity) { 
            this.onEntityUpdate(entity);
        }

        this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this))
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

            this.capabilities.forEach(capability => {
                this.setCapabilityValue(capability, data.state == "on");
            });
            
        } catch(ex) {
            console.log("error", ex);
        }
    }

    onCapabilityOnoff( value, opts, callback ) {
        let oldValue = this.getCapabilityValue('onoff');

        callback(null, true);
        this.setCapabilityValue("onoff", oldValue);
    }
}

module.exports = BinarySensorDevice;