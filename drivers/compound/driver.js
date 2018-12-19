'use strict';

const Homey = require('homey');

class CompoundDriver extends Homey.Driver {

    onPairListDevices(data, callback) {

        let client = Homey.app.getClient();
        let sensors = client.getCompounds();

        callback(null, sensors);
    }

}

module.exports = CompoundDriver;