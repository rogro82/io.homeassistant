'use strict';

const Homey = require('homey');

class SceneDriver extends Homey.Driver {

    onPairListDevices(ata, callback) {

        let client = Homey.app.getClient();
        let scenes = client.getScenes();

        callback(null, scenes);
    }

}

module.exports = SceneDriver;