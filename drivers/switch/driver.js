'use strict';

const Homey = require('homey');

class SwitchDriver extends Homey.Driver {

    onPairListDevices(data, callback) {

        let client = Homey.app.getClient();
        let switches = client.getSwitches();

        callback(null, switches);
    }

}

module.exports = SwitchDriver;