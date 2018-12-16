'use strict';

const Homey = require('homey');

class ScriptDriver extends Homey.Driver {

    onPairListDevices(data, callback) {

        let client = Homey.app.getClient();
        let scripts = client.getScripts();

        callback(null, scripts);
    }

}

module.exports = ScriptDriver;