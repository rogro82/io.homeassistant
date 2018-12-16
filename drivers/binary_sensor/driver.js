'use strict';

const Homey = require('homey');

class BinarySensorDriver extends Homey.Driver {

    onPairListDevices(data, callback) {

        let client = Homey.app.getClient();
        let sensors = client.getBinarySensors();

        callback(null, sensors);
    }

}

module.exports = BinarySensorDriver;