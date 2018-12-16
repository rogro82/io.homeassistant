'use strict';

const Homey = require('homey');

class LightDriver extends Homey.Driver {

    onPairListDevices(data, callback) {

        let client = Homey.app.getClient();
        let lights = client.getLights();

        callback(null, lights);
    }

}

module.exports = LightDriver;