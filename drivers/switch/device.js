'use strict';

const Homey = require('homey');

class SwitchDevice extends Homey.Device {

    onInit() {
        this._client = Homey.app.getClient();

        this.entityId = this.getData().id;

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

    onCapabilityOnoff( value, opts, callback ) {
        this._client.turnOnOff(this.entityId, value);
        callback( null );
    }

    onEntityUpdate(data) {
        if(data) {
            this.setCapabilityValue("onoff", data.state == "on");
        }
    }
}

module.exports = SwitchDevice;