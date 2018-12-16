'use strict';

const Homey = require('homey');

class SensorDriver extends Homey.Driver {

    onPairListDevices(data, callback) {

        let client = Homey.app.getClient();
        let sensors = client.getSensors();

        callback(null, sensors);
    }

}

module.exports = SensorDriver;