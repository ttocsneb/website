---
name: BlueWeather
socials:
  - name: Github
    dest: https://github.com/ttocsneb/blueweather
    icon: fab fa-github
---

![BlueWeather Chip](/images/chip_top.jpg)

BlueWeather is a Personal Weather Station Server that can collect weatherdata
and deliver it directly to your device.

It is a highly extensible application to allow for the possibility of any
hardware to work with BlueWeather and to allow for custom data processing.

### Software

Blueweather is built using Python and Django. As for the front-end, I've 
always had trouble deciding how I want the server to interact with the
front-end. Wether to build a front-end app, or to have a minimal front-end; I 
have no idea. At the moment I'm leaning towards having a mix to allow for 
easier extensibility. For now, I know that the front-end will be based on Vue.

### Hardware

The recommended hardware is a Raspberry Pi. This will allow for a lot of 
possibilities for sensors. I do not plan to have an official recommendation 
for sensors. This will not force people to use one kind of equipment, but that 
means that there will be no softare drivers for any equipment built-in to 
blueweather. All drivers will need to be downloaded separately as a plugin.