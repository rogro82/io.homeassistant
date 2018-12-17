'use strict';

const Homey = require('homey');

const CAPABILITIES_SET_DEBOUNCE = 100;

class LightDevice extends Homey.Device {

    onInit() {
        this._client = Homey.app.getClient();

        this.entityId = this.getData().id;

        this._minMireds = 0;
        this._maxMireds = 0;

        this.log('device init');
        this.log('id:', this.entityId);
        this.log('name:', this.getName());
        this.log('class:', this.getClass());

        this._client.registerDevice(this.entityId, this);

        let entity = this._client.getEntity(this.entityId);
        if(entity) { 
            this.onEntityUpdate(entity);
        }

        this.registerMultipleCapabilityListener(this.getCapabilities(), this._onCapabilitiesSet.bind(this), CAPABILITIES_SET_DEBOUNCE);
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

    getCapabilityUpdate(valueObj, capability) {
        let value = valueObj[capability];
        if(typeof value === 'undefined') value = this.getCapabilityValue(capability)

        return value;
    }

    _onCapabilitiesSet(valueObj, optsObj, callback) {

        if( typeof valueObj.dim === 'number' ) {
			valueObj.onoff = valueObj.dim > 0;	
		}

        let lightOn = this.getCapabilityUpdate(valueObj, "onoff");

        let data = {
            entity_id: this.entityId,
            transition: 1
        };

        if(lightOn) {
            if(this.hasCapability("dim")) {
                let bri = this.getCapabilityUpdate(valueObj, "dim");
               
                data["brightness"] = bri * 250.0;
            }

            let lightMode = this.hasCapability("light_mode") ? this.getCapabilityUpdate(valueObj, "light_mode") :
                            this.hasCapability("light_hue") ? "color" : "temperature";

            if(lightMode == "color") {
                let hue = this.getCapabilityUpdate(valueObj, "light_hue");
                let sat = this.getCapabilityUpdate(valueObj, "light_saturation");

                data["hs_color"] = [
                    hue * 360.0,
                    sat * 100.0
                ]
    
            } else if(this.hasCapability("light_temperature")) {
                let tmp = this.getCapabilityUpdate(valueObj, "light_temperature");

                data["color_temp"] = ((this._maxMireds - this._minMireds) * tmp) + this._minMireds;
            }

        }

        // console.log("update light:", data);

        this._client.updateLight(lightOn, data);

        callback(null);
    }

    onEntityUpdate(data) {
        if(data) {

            this._minMireds = data.attributes["min_mireds"] || 0;
            this._maxMireds = data.attributes["max_mireds"] || 0;

            let lightOn = data.state == "on";

            this.setCapabilityValue("onoff", lightOn);

            if(lightOn) {

                if(this.hasCapability("dim")) {
                    let brightness = data.attributes["brightness"]; // 0..255 -> 0..1
                    if(brightness) {
                        // console.log("update dim:", brightness);
                        this.setCapabilityValue("dim", 1.0 / 250 * brightness);
                    }
                }

                let hasLightMode = this.hasCapability("light_mode");
                let hs = null;
    
                if(this.hasCapability("light_hue")) {
                    hs = data.attributes["hs"];
                    if(hs) {
                        // console.log("update light_hue|light_saturation:", hs);
    
                        let hue = 1.0 / 360.0 * hs[0]; // 0..360 -> 0..1
                        let sat = 1.0 / 100.0 * hs[1]; // 0..100 -> 0..1
    
                        this.setCapabilityValue("light_hue", hue);
                        this.setCapabilityValue("light_saturation", sat);
                    }
                }
    
                if(this.hasCapability("light_temperature")) {
                    let temperature = data.attributes["color_temp"];
                    if(temperature) {
                        // console.log("update light_temperature:", temperature);
    
                        let temp = 1.0 / (this._maxMireds - this._minMireds) * (temperature - this._minMireds);
                        this.setCapabilityValue("light_temperature", temp);
                    }
                }
    
                if(hasLightMode) {
                    console.log("update light_mode");
                    this.setCapabilityValue("light_mode", hs ? "color" : "temperature");
                }
            }
        }
    }
}

module.exports = LightDevice;