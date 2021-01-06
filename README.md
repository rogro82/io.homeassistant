# Home-Assistant integration for Homey by Athom

This application allows you to add your home-assistant (http://home-assistant.io) devices to your Homey.

## Requirements
- Home-assistant 0.78+
- Homey :)

## The list of currently support types:
- sensors
- binary_sensors
- switches
- light
- scenes
- scripts
- input_boolean

## Getting started
To connect the application to your home-assistant instance you will need to create a `Long Lived Access Token` in home-assistant. You can create a token on your home-assistant account profile page (https://www.home-assistant.io/docs/authentication/).

You will also need to know the ip-address/hostname of your home-assistant instance.

Install the application on your Homey and then go into the application settings.

Fill in the correct address (e.g. http://127.0.0.1:8123) and the access token you have created inside home-assistant and then press "Save changes".

In case you have entered the correct settings it should show "Successfully connected".

Now you can add the devices you want to use within Homey

## Flow action
Besides the ability to add devices and use them in your Homey flows there is also a flow action available to directly call home-assistant services inside flows.

## Compounds
Because Homey and home-assistant are modeled differently when it comes to devices it makes sense to group multiple sensors from home-assistant into one Homey device.

To do so you will have to install a custom component in your home-assistant installation:
https://github.com/rogro82/io.homeassistant/blob/master/custom_component/homey.py

After adding the custom component you can now declare the homey platform in your home-assistant configuration and define your devices.

Example:
```yaml
homey:
  livingroom_sensor:
    name: Livingroom environment
    icon: alarm_motion
    capabilities:
      measure_temperature: sensor.livingroom_temperature
      measure_humidity: sensor.livingroom_humidity
      measure_luminance: sensor.livingroom_luminance
      alarm_motion: binary_sensor.livingroom_motion
      alarm_contact: binary_sensor.toilet_door
      button: script.test
      onoff: switch.ventilation
      dim: input_number.test_slider
    capabilitiesConverters:
      measure_temperature: 
        from: (state) => { return parseFloat(state) * 2; }
        to: (value) => { return value / 2; }
      dim: 
        from: (state) => { return parseFloat(state) * 0.01; }
to: (value) => { return value * 100; }
```

After reloading your home-assistant configuration you can add it in Homey by selecting `Compound` in the `Choose a device` dialog.
